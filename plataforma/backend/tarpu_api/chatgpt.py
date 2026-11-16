"""SIWC oficial para una instalación local de un usuario. No se activa en el servidor compartido.

OAuth PKCE/OIDC; tokens solo en memoria, sesión en cookie HttpOnly, sin leer credenciales de Codex.
https://developers.openai.com/siwc/token-sharing-open-source/sign-in
Asistencia de IA (Codex), declarada en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import base64
import hashlib
import json
import logging
import secrets
import threading
import time
import urllib.parse
import urllib.request
import uuid

from . import config

COOKIE = 'tarpu_chatgpt'
ISSUER = 'https://auth.openai.com'
RESOURCE = 'https://api.openai.com/v1'
SCOPE = 'openid profile email offline_access resource.invoke chatgpt.tokens.use.direct'
_sessions: dict[str, dict] = {}
_lock = threading.RLock()


class CallbackFilter(logging.Filter):
    """Uvicorn no debe imprimir el código de autorización ni el estado del callback."""
    def filter(self, record):
        if isinstance(record.args, tuple) and len(record.args) >= 3:
            args = list(record.args)
            if isinstance(args[2], str) and args[2].startswith('/api/ia/chatgpt/callback'):
                args[2] = args[2].split('?', 1)[0]
                record.args = tuple(args)
        return True


logging.getLogger('uvicorn.access').addFilter(CallbackFilter())


def habilitado() -> bool:
    import os
    env = {**config._leer_env_archivo(), **os.environ}
    return env.get('TARPU_CHATGPT_LOCAL') == '1'


def comprobar_local(request) -> None:
    if not habilitado() or request.url.hostname != '127.0.0.1' or request.client.host not in ('127.0.0.1', '::1', 'testclient'):
        raise ValueError('La suscripción ChatGPT solo está habilitada en una instalación local personal de TARPU.')
    origin = request.headers.get('origin')
    if origin and origin not in config.obtener().cors:
        raise ValueError('El origen de esta conexión no está autorizado.')


def _json(url: str, data: dict | None = None, headers: dict | None = None, form: bool = False):
    body = None if data is None else (urllib.parse.urlencode(data).encode() if form else json.dumps(data).encode())
    cab = {'Content-Type': 'application/x-www-form-urlencoded' if form else 'application/json', **(headers or {})}
    with urllib.request.urlopen(urllib.request.Request(url, data=body, headers=cab), timeout=30) as response:
        return json.load(response)


def _host() -> dict:
    path = config.obtener().almacen_dir / '.chatgpt-host.json'
    if path.exists():
        return json.loads(path.read_text(encoding='utf-8'))
    host = {'host_id': f'urn:uuid:{uuid.uuid4()}'}
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(host), encoding='utf-8')
    return host


def iniciar(callback: str) -> tuple[str, str]:
    with _lock:
        now = time.time()
        for key in list(_sessions):
            if _sessions[key]['deadline'] <= now:
                del _sessions[key]
        if len(_sessions) >= 16:
            raise ValueError('Hay demasiadas conexiones pendientes. Cierra una sesión y vuelve a intentar.')
        host = _host()
        sid, state, nonce, verifier = (secrets.token_urlsafe(32) for _ in range(4))
        client_id = host.get('client_id', 'dynamic_agent_client')
        params = {'client_id': client_id, 'ext_agent_host_id': host['host_id'], 'response_type': 'code',
                  'prompt': 'consent',
                  'redirect_uri': callback, 'scope': SCOPE, 'resource': RESOURCE, 'state': state, 'nonce': nonce,
                  'code_challenge_method': 'S256',
                  'code_challenge': base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')}
        if client_id == 'dynamic_agent_client':
            params['agent_name_hint'] = 'TARPU'
        _sessions[sid] = {'state': state, 'nonce': nonce, 'verifier': verifier, 'callback': callback,
                          'client_id': client_id, 'subject': host.get('subject'), 'deadline': now + 600}
        return sid, f'{ISSUER}/api/accounts/authorize?{urllib.parse.urlencode(params)}'


def completar(sid: str | None, params: dict) -> None:
    with _lock:
        attempt = _sessions.pop(sid, None)
    if not attempt or attempt['deadline'] < time.time() or not secrets.compare_digest(attempt['state'], params.get('state', '')):
        raise ValueError('La conexión caducó o no corresponde a este navegador. Vuelve a iniciar sesión.')
    if params.get('error'):
        raise ValueError('No se autorizó la conexión. Puedes continuar con el modo guiado.')
    client = params.get('client_id', attempt['client_id'])
    if not client or client == 'dynamic_agent_client' or (attempt['client_id'] != 'dynamic_agent_client' and client != attempt['client_id']):
        raise ValueError('OpenAI no devolvió el registro esperado de TARPU.')
    tokens = _json(f'{ISSUER}/api/accounts/oauth/token', {
        'grant_type': 'authorization_code', 'client_id': client, 'code': params.get('code', ''),
        'code_verifier': attempt['verifier'], 'redirect_uri': attempt['callback'], 'resource': RESOURCE,
    }, form=True)
    import jwt
    # Se valida con el emisor y las claves públicas oficiales; nunca se acepta un JWT sin firma.
    key = jwt.PyJWKClient(f'{ISSUER}/.well-known/jwks.json', timeout=15).get_signing_key_from_jwt(tokens['id_token'])
    identity = jwt.decode(tokens['id_token'], key.key, algorithms=['RS256'], audience=client, issuer=ISSUER,
                          options={'require': ['exp', 'iss', 'aud', 'sub', 'nonce']})
    if identity['nonce'] != attempt['nonce'] or (attempt['subject'] and identity['sub'] != attempt['subject']):
        raise ValueError('La identidad no coincide con la conexión iniciada.')
    session = {'client_id': client, 'subject': identity['sub'], 'email': identity.get('email'),
               'tokens': tokens, 'expires': time.time() + int(tokens.get('expires_in', 3600)), 'deadline': time.time() + 8 * 3600}
    # El archivo contiene solo registro e identificador del host; las credenciales no se escriben en disco.
    with _lock:
        host = _host()
        host.update({'client_id': client, 'subject': identity['sub']})
        (config.obtener().almacen_dir / '.chatgpt-host.json').write_text(json.dumps(host), encoding='utf-8')
        _sessions[sid] = session


def sesion(sid: str | None) -> dict | None:
    if not habilitado():
        return None
    with _lock:
        result = _sessions.get(sid)
        if result and result.get('tokens') and result['deadline'] > time.time():
            return result
    return None


def cerrar(sid: str | None) -> None:
    with _lock:
        _sessions.pop(sid, None)


def token(session: dict) -> str:
    with _lock:
        if session['expires'] <= time.time() + 30:
            previous = session['tokens']
            updated = _json(f'{ISSUER}/api/accounts/oauth/token', {
                'grant_type': 'refresh_token', 'client_id': session['client_id'],
                'refresh_token': previous['refresh_token'], 'resource': RESOURCE,
            }, form=True)
            # Permiso revocado o reducido: no continuar inferencia.
            scope = updated.get('scope', previous.get('scope', ''))
            session['tokens'] = {**previous, **updated, 'scope': scope}
            session['expires'] = time.time() + int(updated.get('expires_in', 3600))
        if 'chatgpt.tokens.use.direct' not in session['tokens'].get('scope', '').split():
            raise ValueError('Tu cuenta está vinculada, pero no autorizaste el uso de tu plan ChatGPT.')
        return session['tokens']['access_token']

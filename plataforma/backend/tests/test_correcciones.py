"""Regresiones de servicios separados, contexto y OAuth sin llamadas externas.
Asistencia de IA (Codex); entrega/uso-de-ia.md.
"""
import json
import time
from types import SimpleNamespace

import pytest

from tarpu_api import chatgpt, coordenada, ia, contexto_ia
from tarpu_datos.archivos import relativa
from tarpu_datos.repositorio.supabase import RepositorioSupabase


def test_csv_publicado_por_trabajador_se_lee_sin_su_disco(cfg, tmp_path, monkeypatch):
    """Dos almacenes distintos y el mismo Storage: el lector solo tiene la ruta del trabajo."""
    worker = tmp_path / 'worker' / 'almacen' / 'fuentes' / 'campo'
    worker.mkdir(parents=True)
    path = worker / 'ndvi.normalizado.csv'
    path.write_text('fecha,NDVI\n2026-01-17,0.51\n', encoding='utf-8')
    objects = {}
    repo = RepositorioSupabase()
    monkeypatch.setattr(repo, 'subir', lambda bucket, key, data, tipo: objects.setdefault((bucket, key), data))
    monkeypatch.setattr(repo, 'bajar', lambda bucket, key: objects[(bucket, key)])
    repo.publicar_archivos({'normalizado': str(path)})
    monkeypatch.setattr(coordenada, 'repositorio', lambda: repo)
    assert not (cfg.almacen_dir / 'fuentes/campo/ndvi.normalizado.csv').exists()
    response = coordenada.archivo(str(path))
    assert response['contenido'] == path.read_bytes().decode('utf-8')
    assert response['ruta'] == 'fuentes/campo/ndvi.normalizado.csv'


@pytest.mark.parametrize('path', ['../secreto.json', '/fuentes/x.csv', 'C:/secreto.json', 'almacen/../clave.json'])
def test_ruta_remota_rechaza_travesia(path):
    with pytest.raises(ValueError):
        relativa(path)


def test_ia_no_acepta_cifras_nuevas_ni_usa_el_historial_como_fuente(monkeypatch):
    monkeypatch.setattr(ia, '_generar', lambda *a: 'La lluvia es 999 mm.')
    result = ia.responder('¿Lluvia?', {'lluvia': 12}, [{'role': 'user', 'text': '999 mm'}])
    assert not result['con_ia'] and not result['texto']
    monkeypatch.setattr(ia, '_generar', lambda *a: 'La lluvia registrada es 12 mm.')
    assert ia.responder('¿Lluvia?', {'lluvia': 12}, [])['con_ia']


def test_stream_openai_interrumpido_no_es_respuesta_valida(monkeypatch):
    class Stream:
        def __enter__(self): return iter([b'data: {"type":"response.output_text.delta","delta":"parcial"}\n'])
        def __exit__(self, *args): pass
    monkeypatch.setattr(ia.urllib.request, 'urlopen', lambda *a, **k: Stream())
    with pytest.raises(ValueError):
        ia._openai('q', 's', 'clave-de-prueba', 'modelo-de-prueba')


def test_contexto_no_convierte_lluvia_faltante_en_cero():
    text = 'fecha,T2M (C),PRECTOTCORR (mm/dia)\n2025-01-01,10,\n2025-01-02,12,3\n'
    result = contexto_ia.preparar({}, text, {})['clima']['resumen_por_ano']['2025']
    assert result['PRECTOTCORR']['suma_registros_mm'] == 3
    assert result['PRECTOTCORR']['dias_con_dato'] == 1
    assert result['PRECTOTCORR']['dias_sin_valor_en_registros'] == 1


def test_oauth_estado_erroneo_y_repetido_no_intercambia_tokens(cfg, monkeypatch):
    monkeypatch.setattr(chatgpt, '_json', lambda *a, **k: pytest.fail('no debe intercambiar un código'))
    sid, url = chatgpt.iniciar('http://127.0.0.1:8000/api/ia/chatgpt/callback')
    assert 'code_challenge_method=S256' in url
    assert 'client_id=dynamic_agent_client' in url
    with pytest.raises(ValueError): chatgpt.completar(sid, {'state': 'no-corresponde'})
    with pytest.raises(ValueError): chatgpt.completar(sid, {'state': 'no-corresponde'})


def test_oauth_no_acepta_acceso_remoto_ni_sin_habilitar(monkeypatch):
    request = SimpleNamespace(url=SimpleNamespace(hostname='tarpu.example'), client=SimpleNamespace(host='10.0.0.2'), headers={})
    monkeypatch.setattr(chatgpt, 'habilitado', lambda: True)
    with pytest.raises(ValueError): chatgpt.comprobar_local(request)
    request.url.hostname, request.client.host = '127.0.0.1', '127.0.0.1'
    monkeypatch.setattr(chatgpt, 'habilitado', lambda: False)
    with pytest.raises(ValueError): chatgpt.comprobar_local(request)


def test_plan_requiere_permiso_y_sesion_aislada(monkeypatch):
    session = {'tokens': {'scope': 'openid', 'access_token': 'no-exponer'}, 'expires': time.time() + 600}
    with pytest.raises(ValueError): chatgpt.token(session)
    monkeypatch.setattr(chatgpt, 'habilitado', lambda: True)
    assert chatgpt.sesion('otro-navegador') is None
    result = ia.estado(session)
    assert not result['chatgpt']['permiso_plan']
    assert 'no-exponer' not in json.dumps(result)


@pytest.mark.parametrize('valid', [True, False])
def test_callback_valida_firma_emisor_nonce_y_conserva_tokens_fuera_de_la_respuesta(cfg, monkeypatch, valid):
    import jwt
    from cryptography.hazmat.primitives.asymmetric import rsa
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    sid, _ = chatgpt.iniciar('http://127.0.0.1:8000/api/ia/chatgpt/callback')
    attempt = chatgpt._sessions[sid]
    signed = jwt.encode({'iss': chatgpt.ISSUER if valid else 'https://otro.example', 'sub': 'persona',
                         'aud': 'oaiapp_prueba', 'nonce': attempt['nonce'], 'exp': time.time() + 600}, key, algorithm='RS256')
    monkeypatch.setattr(chatgpt, '_json', lambda *a, **kw: {'id_token': signed, 'access_token': 'no-mostrar', 'scope': 'openid chatgpt.tokens.use.direct'})
    class Keys:
        def __init__(self, *a, **k): pass
        def get_signing_key_from_jwt(self, token): return SimpleNamespace(key=key.public_key())
    monkeypatch.setattr(jwt, 'PyJWKClient', Keys)
    monkeypatch.setattr(chatgpt, 'habilitado', lambda: True)
    params = {'state': attempt['state'], 'code': 'codigo', 'client_id': 'oaiapp_prueba'}
    if not valid:
        with pytest.raises(jwt.InvalidIssuerError): chatgpt.completar(sid, params)
        assert chatgpt.sesion(sid) is None
    else:
        chatgpt.completar(sid, params)
        session = chatgpt.sesion(sid)
        assert session['subject'] == 'persona'
        assert ia.estado(session)['chatgpt']['permiso_plan']
        assert 'no-mostrar' not in json.dumps(ia.estado(session))
        chatgpt.cerrar(sid)
        assert chatgpt.sesion(sid) is None


def test_refresh_revocado_no_reutiliza_permiso_previo(monkeypatch):
    session = {'client_id': 'prueba', 'expires': 0, 'tokens': {'access_token': 'viejo', 'refresh_token': 'r1', 'scope': 'openid chatgpt.tokens.use.direct'}}
    monkeypatch.setattr(chatgpt, '_json', lambda *a, **k: {'access_token': 'nuevo', 'refresh_token': 'r2', 'scope': 'openid'})
    with pytest.raises(ValueError): chatgpt.token(session)
    assert session['tokens']['refresh_token'] == 'r2'


def test_api_siwc_genera_cookie_http_only_y_rechaza_otro_origen(cfg, monkeypatch):
    import logging
    from fastapi.testclient import TestClient
    from tarpu_api.main import app
    from urllib.parse import urlparse, parse_qs
    monkeypatch.setattr(chatgpt, 'habilitado', lambda: True)
    client = TestClient(app, base_url='http://127.0.0.1:8000')
    response = client.post('/api/ia/chatgpt/iniciar', headers={'Origin': 'http://127.0.0.1:5175'})
    assert response.status_code == 200
    assert 'httponly' in response.headers['set-cookie'].lower()
    assert 'samesite=lax' in response.headers['set-cookie'].lower()
    params = parse_qs(urlparse(response.json()['data']['url']).query)
    assert params['redirect_uri'] == ['http://127.0.0.1:8000/api/ia/chatgpt/callback']
    assert 'chatgpt.tokens.use.direct' in params['scope'][0]
    assert client.post('/api/ia/chatgpt/iniciar', headers={'Origin': 'https://otro.example'}).status_code == 403
    assert client.post('/api/ia/chatgpt/salir').status_code == 200
    record = logging.LogRecord('uvicorn.access', logging.INFO, '', 0, '%s - "%s %s HTTP/%s" %s',
                               ('local', 'GET', '/api/ia/chatgpt/callback?code=no-imprimir&state=privado', '1.1', 200), None)
    chatgpt.CallbackFilter().filter(record)
    assert 'no-imprimir' not in record.getMessage() and 'privado' not in record.getMessage()

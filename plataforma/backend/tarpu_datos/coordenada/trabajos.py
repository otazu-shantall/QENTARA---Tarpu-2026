"""Trabajos de extracción por coordenada (capa 2 del esquema mixto, DT-22 y DT-23).

Flujo: el usuario marca su campo → la API lee la capa 1 al instante (base/leer.py) → se crea un TRABAJO para ese
punto → se extraen las series de satélite → al terminar queda «listo» y se marca el aviso.

Reutilización por celda (DT-23): las series se guardan por celda o píxel del producto (tarpu_datos/celdas.py).
    power   NO se descarga: se lee la celda de la base de Arequipa, que el actualizador mantiene al día.
    modis   si el píxel de ese producto ya tiene serie reciente (de otra parcela), se reutiliza; si no, se pide a
            ORNL solo lo que falta (bloques anclados) y se registra en la celda.
    hls, smap  pendientes de la vía principal (Google Earth Engine). Respaldo manual: fuentes/appeears.py

Dónde se guarda (tarpu_datos/repositorio): TARPU_ALMACEN=archivos (la API ejecuta en un hilo) o supabase (la API
solo encola; el trabajador, coordenada/trabajador.py, toma el trabajo de la cola).

Uso (desde backend/):
    python -m tarpu_datos.coordenada.trabajos pedir -16.367023 -72.185771 [--nombre majes_riego] [--esperar]
    python -m tarpu_datos.coordenada.trabajos estado CLAVE
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import argparse
import json
import sys
import threading
import traceback
from datetime import datetime, timezone
from pathlib import Path

from .. import actualizacion, celdas
from ..fuentes import ornl
from ..fuentes.cliente import ahora_iso, clave_punto, log
from ..repositorio import obtener as repositorio

BACKEND = Path(__file__).resolve().parents[2]
BASE_POWER = BACKEND / 'almacen' / 'base_arequipa' / 'power'
INICIO = '2015-01-01'
MODIS = ['MOD13Q1', 'MOD16A2GF', 'MOD11A2', 'MCD12Q1']
VIGENCIA_DIAS = {'MOD13Q1': 8, 'MOD16A2GF': 8, 'MOD11A2': 8, 'MCD12Q1': 30}  # mismos períodos que actualizacion.py
PENDIENTES = {
    'hls': 'NDVI de 30 m: pendiente de la vía principal (Google Earth Engine). Respaldo manual: tarpu_datos.fuentes.appeears.',
    'smap': 'Humedad del suelo de 9 km: pendiente de la vía principal (Google Earth Engine). Respaldo manual: tarpu_datos.fuentes.appeears.',
}
LISTOS = ('listo', 'listo_con_vacios')
_HILOS: dict[str, threading.Thread] = {}
_CANCELAR: dict[str, threading.Event] = {}
_LOCK = threading.Lock()


def _clasificar(estado: str, faltan: list[str]) -> dict:
    """Separa lo que falló al pedir (bloques que no llegaron) de los vacíos que trae el propio proveedor."""
    del_proveedor = [f for f in faltan if 'con relleno' in f or 'sin valor válido' in f]
    fallos = [f for f in faltan if f not in del_proveedor]
    if estado == 'parcial' and not fallos:
        estado = 'listo_con_vacios'
    return {'estado': estado, 'vacios_del_proveedor': del_proveedor, 'fallos_de_descarga': fallos}


def _reciente(cuando: str | None, dias: float) -> bool:
    try:
        return (datetime.now(timezone.utc) - datetime.fromisoformat(cuando)).total_seconds() <= dias * 86400
    except (TypeError, ValueError):
        return False


# ------------------------------------------------------------------ estado (vía repositorio)
def estado(clave: str) -> dict | None:
    return repositorio().leer_trabajo(clave)


def _guardar(t: dict) -> None:
    repositorio().guardar_trabajo(t)


def vivo(clave: str) -> bool:
    hilo = _HILOS.get(clave)
    return bool(hilo and hilo.is_alive())


def marcar_interrumpidos() -> int:
    """Modo archivos: trabajos «en curso» cuyo hilo ya no existe en este proceso pasan a «interrumpido».
    En Supabase lo hace la base con el latido del trabajador (reencolar_huerfanos)."""
    repo = repositorio()
    if repo.nombre != 'archivos':
        return repo.reencolar_huerfanos()
    n = 0
    for t in repo.listar_trabajos():
        if t.get('estado') in ('pendiente', 'en_proceso') and t.get('iniciado') and not vivo(t['clave']):
            t['estado'], t['terminado'] = 'interrumpido', ahora_iso()
            t['motivo'] = 'La extracción se cortó (reinicio de la API o error). Pulsa «Extraer» para continuar desde lo ya descargado.'
            _guardar(t)
            n += 1
    return n


def listar() -> list[dict]:
    """Todos los puntos con datos pesados extraídos o en curso, del más reciente al más antiguo."""
    salida = [{k: t.get(k) for k in ('clave', 'nombre', 'punto', 'estado', 'creado', 'iniciado', 'terminado', 'actualizado', 'parcela')}
              | {'fuentes': {f: (v or {}).get('estado') for f, v in (t.get('fuentes') or {}).items()}}
              for t in repositorio().listar_trabajos()]
    return sorted(salida, key=lambda x: x.get('actualizado') or '', reverse=True)


def de_punto(lat: float, lon: float) -> dict | None:
    return estado(clave_punto(lat, lon))


def cancelar(clave: str) -> dict | None:
    """Detiene un trabajo: no se piden más bloques. Lo descargado queda guardado; volver a pedirlo continúa."""
    repo = repositorio()
    t = estado(clave)
    if t is None:
        return None
    repo.pedir_cancelar(clave)
    t = estado(clave)
    evento = _CANCELAR.get(clave)
    if evento and vivo(clave):
        evento.set()
        t['cancelacion'] = {'pedida': ahora_iso()}
    elif t['estado'] == 'pendiente' or (t['estado'] == 'en_proceso' and repo.nombre == 'archivos'):
        t['estado'], t['terminado'] = 'cancelado', ahora_iso()
        t['cancelacion'] = {'pedida': ahora_iso(), 'nota': 'no había una extracción en curso en este proceso'}
    else:
        t['cancelacion'] = {'pedida': ahora_iso(), 'nota': 'el trabajador la verá en su próximo latido'}
    _guardar(t)
    return t


def crear(lat: float, lon: float, nombre: str | None = None, parcela: dict | None = None) -> dict:
    """Crea (o devuelve) el trabajo del punto. No lo ejecuta: para eso, iniciar() o el trabajador."""
    clave = clave_punto(lat, lon)
    if not nombre:  # si el punto ya está registrado con un nombre (p. ej. «chivay»), se reutiliza su carpeta
        nombre = next((n for n, p in actualizacion.puntos().items() if clave_punto(p['lat'], p['lon']) == clave), None)
    previo = estado(clave)
    if previo and previo['estado'] in (*LISTOS, 'parcial', 'en_proceso'):
        if parcela and previo.get('parcela') != parcela:
            previo['parcela'] = parcela
            _guardar(previo)
        return previo
    t = {'clave': clave, 'nombre': nombre or clave, 'punto': {'lat': lat, 'lon': lon}, 'creado': ahora_iso(),
         'estado': 'pendiente', 'fuentes': {'power': {'estado': 'pendiente'}, 'modis': {'estado': 'pendiente'},
                                            **{k: {'estado': 'no_disponible', 'motivo': m} for k, m in PENDIENTES.items()}},
         'aviso': {'estado': 'pendiente', 'canal': None, 'nota': 'canal de aviso por decidir (docs/11, §6)'},
         'iniciado': None, 'terminado': None, 'motivo': None,
         **({'parcela': parcela} if parcela else {})}
    _guardar(t)
    return t


# ------------------------------------------------------------------ fuentes con reutilización
def _power_de_la_base(lat: float, lon: float) -> dict:
    """POWER sale de la celda de la base de Arequipa (no se descarga por parcela)."""
    celda = celdas.power(lat, lon)
    c = celda['centro']
    nombre = f"celda_{c['lat']:+.3f}_{c['lon']:+.3f}".replace('+', 'p').replace('-', 'm').replace('.', '_')
    proc = BASE_POWER / f'power_{nombre}.procedencia.json'
    if not proc.exists():
        return {'estado': 'sin_datos', 'motivo': f'la celda {celda["clave"]} no está en la base de Arequipa (punto fuera de la caja)'}
    p = json.loads(proc.read_text(encoding='utf-8'))
    archivos = {k: str(BASE_POWER / f'power_{nombre}.{k}.{ext}')
                for k, ext in (('original', 'json'), ('normalizado', 'csv'), ('procedencia', 'json'))}
    vacios = [f'{k}: {n} días con relleno' for k, n in (p.get('missing_days') or {}).items() if n]
    cob = repositorio().cobertura('POWER_DIARIO_AG', celda['clave'])
    if not cob or cob.get('hasta') != p.get('observed_end'):  # la celda se carga una vez por actualización, no por parcela
        repositorio().registrar_celda({**celda, 'elevacion_m': p.get('cell_elevation_m')}, 'POWER_DIARIO_AG',
                                      p.get('observed_end'), archivos, {'fuente': 'base de Arequipa', 'url': p.get('request_url')})
    return {**_clasificar('parcial' if vacios else 'listo', vacios), 'archivos': archivos, 'motivo': None,
            'reutilizado': {'de': 'base de Arequipa', 'celda': celda['clave'], 'hasta': p.get('observed_end'),
                            'elevacion_celda_m': p.get('cell_elevation_m')}}


def _modis(lat: float, lon: float, nombre: str, parar: threading.Event) -> dict:
    repo = repositorio()
    productos, pedir = {}, []
    for p in MODIS:
        celda = celdas.modis(p, lat, lon)
        cob = repo.cobertura(p, celda['clave'])
        archivos = (cob or {}).get('archivos') or {}
        if cob and _reciente(cob.get('actualizado'), VIGENCIA_DIAS[p]) and Path(archivos.get('normalizado', '')).exists():
            if repo.nombre == 'supabase':
                repo.publicar_archivos(archivos)
            productos[p] = {'estado': 'listo', 'archivos': archivos, 'motivo': None, 'vacios_del_proveedor': [],
                            'fallos_de_descarga': [],
                            'reutilizado': {'de': 'otra parcela en el mismo píxel', 'celda': celda['clave'],
                                            'hasta': cob.get('hasta'), 'actualizado': cob.get('actualizado')}}
        else:
            pedir.append(p)
    if pedir:
        salida, cache = str(BACKEND / 'almacen' / 'fuentes' / nombre), str(BACKEND / 'almacen' / 'cache')
        rs = ornl.obtener_varios(lat=lat, lon=lon, salida=salida, cache=cache, inicio=INICIO, nombre=nombre,
                                 productos={p: None for p in pedir}, tope=4, cancelar=parar)
        for p, v in rs.items():
            productos[p] = {**_clasificar(v['estado'], v.get('faltan', [])), 'archivos': v.get('archivos'), 'motivo': v.get('motivo')}
            if v['estado'] in ('listo', 'parcial') and v.get('archivos') and not parar.is_set():
                proc = json.loads(Path(v['archivos']['procedencia']).read_text(encoding='utf-8'))
                repo.registrar_celda(celdas.modis(p, lat, lon), p, proc.get('last_date'), v['archivos'],
                                     {'fuente': 'ORNL', 'url': proc.get('request_base')})
    estados = [x['estado'] for x in productos.values()]
    return {'estado': 'listo' if all(e == 'listo' for e in estados)
            else ('listo_con_vacios' if all(e in LISTOS for e in estados)
                  else ('sin_datos' if all(e == 'sin_datos' for e in estados) else 'parcial')),
            'productos': productos}


# ------------------------------------------------------------------ ejecución
def ejecutar(clave: str, parar: threading.Event | None = None) -> dict:
    """Ejecuta el trabajo. Si algo falla, queda en «error» con su motivo (nunca se cae en silencio)."""
    try:
        return _ejecutar(clave, parar)
    except Exception as e:  # noqa: BLE001
        log(f'trabajo {clave}: error {type(e).__name__}: {e}')
        t = estado(clave) or {'clave': clave, 'fuentes': {}, 'aviso': {}, 'punto': {'lat': 0, 'lon': 0}}
        t['estado'], t['terminado'] = 'error', ahora_iso()
        t['motivo'] = f'{type(e).__name__}: {e}'
        t['traza'] = traceback.format_exc(limit=4)
        try:
            _guardar(t)
        except Exception:  # noqa: BLE001
            pass
        return t


def _ejecutar(clave: str, parar: threading.Event | None) -> dict:
    t = estado(clave)
    lat, lon, nombre = t['punto']['lat'], t['punto']['lon'], t['nombre']
    parar = parar or _CANCELAR.setdefault(clave, threading.Event())
    for k in ('cancelacion', 'motivo', 'traza'):
        t.pop(k, None)
    t['estado'], t['iniciado'], t['terminado'] = 'en_proceso', ahora_iso(), None
    _guardar(t)
    actualizacion.agregar_punto(nombre, lat, lon)  # desde ahora se mantiene al día
    for fuente in ('power', 'modis'):
        if (t['fuentes'].get(fuente) or {}).get('estado') in LISTOS:
            continue
        if parar.is_set():
            t['fuentes'][fuente] = {'estado': 'cancelado', 'motivo': 'detenido por el usuario antes de empezar esta fuente'}
            continue
        t['fuentes'][fuente] = {'estado': 'en_proceso', 'desde': ahora_iso()}
        _guardar(t)
        try:
            t['fuentes'][fuente] = _power_de_la_base(lat, lon) if fuente == 'power' else _modis(lat, lon, nombre, parar)
        except Exception as e:  # noqa: BLE001 - se anota; relanzar continúa
            t['fuentes'][fuente] = {'estado': 'error', 'motivo': f'{type(e).__name__}: {e}'}
        t['fuentes'][fuente]['hasta'] = ahora_iso()
        _guardar(t)
    hechas = [t['fuentes'][f]['estado'] for f in ('power', 'modis')]
    t['estado'] = ('cancelado' if parar.is_set() else 'listo' if all(e == 'listo' for e in hechas)
                   else 'listo_con_vacios' if all(e in LISTOS for e in hechas)
                   else 'error' if all(e in ('error', 'sin_datos') for e in hechas) else 'parcial')
    t['terminado'] = ahora_iso()
    if parar.is_set():
        t['cancelacion'] = {'pedida': ahora_iso(), 'nota': 'lo descargado queda guardado; volver a pedirlo continúa desde ahí'}
    else:
        t['aviso'] = {**(t.get('aviso') or {}), 'estado': 'por_enviar', 'listo_desde': t['terminado']}
    _guardar(t)
    log(f'trabajo {clave}: {t["estado"]}')
    return t


def iniciar(lat: float, lon: float, nombre: str | None = None, parcela: dict | None = None) -> dict:
    """Crea el trabajo. En archivos lo ejecuta en un hilo; en Supabase lo deja en la cola para el trabajador."""
    t = crear(lat, lon, nombre, parcela)
    if t['estado'] in LISTOS or t['estado'] == 'en_proceso':
        return t
    if repositorio().nombre != 'archivos':
        if t['estado'] != 'pendiente':
            t['estado'] = 'pendiente'
            _guardar(t)
        return estado(t['clave'])
    with _LOCK:
        if vivo(t['clave']):
            return t
        _CANCELAR[t['clave']] = threading.Event()
        hilo = threading.Thread(target=ejecutar, args=(t['clave'],), name=f'trabajo-{t["clave"]}', daemon=True)
        _HILOS[t['clave']] = hilo
        hilo.start()
    return estado(t['clave'])


def main() -> int:
    a = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = a.add_subparsers(dest='comando', required=True)
    p = sub.add_parser('pedir')
    p.add_argument('lat', type=float)
    p.add_argument('lon', type=float)
    p.add_argument('--nombre')
    p.add_argument('--esperar', action='store_true', help='ejecuta en primer plano hasta terminar')
    e = sub.add_parser('estado')
    e.add_argument('clave')
    args = a.parse_args()
    if args.comando == 'pedir':
        t = crear(args.lat, args.lon, args.nombre)
        if args.esperar:
            t = ejecutar(t['clave'])
    else:
        t = estado(args.clave) or {'estado': 'no existe'}
    print(json.dumps(t, ensure_ascii=False, indent=1, default=str))
    return 0


if __name__ == '__main__':
    sys.exit(main())

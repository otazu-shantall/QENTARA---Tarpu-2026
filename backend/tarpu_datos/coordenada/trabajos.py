"""Trabajos de extracción por coordenada (capa 2 del esquema mixto, DT-22).

Flujo: el usuario marca su campo → la API lee la capa 1 al instante (base/leer.py) → se crea un TRABAJO para ese
punto → el trabajo extrae en segundo plano las series de satélite → al terminar, queda «listo» y se marca el aviso.

Hoy cada fuente usa la vía que ya funciona:
    power      NASA POWER por punto, hasta ayer                           (segundos)
    modis      ORNL: MOD13Q1, MOD16A2GF, MOD11A2 y MCD12Q1                 (minutos; solo lo nuevo si ya se pidió)
    hls, smap  pendientes de la vía principal (Google Earth Engine). Respaldo manual: fuentes/appeears.py
El punto queda registrado en actualizacion.py para mantenerse al día.

Un trabajo por punto (clave = coordenada con 4 decimales). Si ya existe y está listo, no se repite: se reutiliza.
El estado vive en backend/almacen/trabajos/<clave>.json y se escribe de forma atómica tras cada fuente, así un
corte no pierde lo hecho y relanzar continúa.

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
from pathlib import Path

from .. import actualizacion
from ..fuentes import ornl, power
from ..fuentes.cliente import ahora_iso, clave_punto, escribir_atomico, log

BACKEND = Path(__file__).resolve().parents[2]
TRABAJOS = BACKEND / 'almacen' / 'trabajos'
INICIO = '2015-01-01'
MODIS = ['MOD13Q1', 'MOD16A2GF', 'MOD11A2', 'MCD12Q1']
PENDIENTES = {
    'hls': 'NDVI de 30 m: pendiente de la vía principal (Google Earth Engine). Respaldo manual: tarpu_datos.fuentes.appeears.',
    'smap': 'Humedad del suelo de 9 km: pendiente de la vía principal (Google Earth Engine). Respaldo manual: tarpu_datos.fuentes.appeears.',
}
LISTOS = ('listo', 'listo_con_vacios')
_HILOS: dict[str, threading.Thread] = {}
_CANCELAR: dict[str, threading.Event] = {}


def _clasificar(estado: str, faltan: list[str]) -> dict:
    """Separa lo que falló al pedir (bloques que no llegaron) de los vacíos que trae el propio proveedor.

    Vacío del proveedor = el valor llegó como relleno (POWER «días con relleno», MODIS «fechas sin valor válido»):
    la descarga está completa y el dato no existe en la fuente. Esos casos quedan «listo_con_vacios»."""
    del_proveedor = [f for f in faltan if 'con relleno' in f or 'sin valor válido' in f]
    fallos = [f for f in faltan if f not in del_proveedor]
    if estado == 'parcial' and not fallos:
        estado = 'listo_con_vacios'
    return {'estado': estado, 'vacios_del_proveedor': del_proveedor, 'fallos_de_descarga': fallos}
_LOCK = threading.Lock()


def _ruta(clave: str) -> Path:
    return TRABAJOS / f'{clave}.json'


def estado(clave: str) -> dict | None:
    try:
        return json.loads(_ruta(clave).read_text(encoding='utf-8'))
    except FileNotFoundError:
        return None


def _guardar(t: dict) -> None:
    t['actualizado'] = ahora_iso()
    escribir_atomico(_ruta(t['clave']), json.dumps(t, ensure_ascii=False, indent=1))


def listar() -> list[dict]:
    """Todos los puntos con datos pesados extraídos o en curso, del más reciente al más antiguo."""
    salida = []
    for ruta in TRABAJOS.glob('*.json'):
        try:
            t = json.loads(ruta.read_text(encoding='utf-8'))
        except (json.JSONDecodeError, OSError):
            continue
        salida.append({k: t.get(k) for k in ('clave', 'nombre', 'punto', 'estado', 'creado', 'iniciado', 'terminado', 'actualizado', 'parcela')}
                      | {'fuentes': {f: v.get('estado') for f, v in t.get('fuentes', {}).items()}})
    return sorted(salida, key=lambda x: x.get('actualizado') or '', reverse=True)


def de_punto(lat: float, lon: float) -> dict | None:
    return estado(clave_punto(lat, lon))


def cancelar(clave: str) -> dict | None:
    """Detiene un trabajo: no se piden más bloques. Lo descargado queda guardado; volver a pedirlo continúa."""
    t = estado(clave)
    if t is None:
        return None
    evento = _CANCELAR.get(clave)
    hilo = _HILOS.get(clave)
    if evento and hilo and hilo.is_alive():
        evento.set()
        t['cancelacion'] = {'pedida': ahora_iso()}
    elif t['estado'] in ('pendiente', 'en_proceso'):  # sin hilo vivo (p. ej., se reinició la API)
        t['estado'], t['terminado'] = 'cancelado', ahora_iso()
        t['cancelacion'] = {'pedida': ahora_iso(), 'nota': 'no había una extracción en curso en este proceso'}
    _guardar(t)
    return t


def crear(lat: float, lon: float, nombre: str | None = None, parcela: dict | None = None) -> dict:
    """Crea (o devuelve) el trabajo del punto. No lo ejecuta; para eso, iniciar()."""
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
         **({'parcela': parcela} if parcela else {})}
    _guardar(t)
    return t


def ejecutar(clave: str) -> dict:
    t = estado(clave)
    lat, lon, nombre = t['punto']['lat'], t['punto']['lon'], t['nombre']
    parar = _CANCELAR.setdefault(clave, threading.Event())
    parar.clear()
    t.pop('cancelacion', None)
    salida, cache = str(BACKEND / 'almacen' / 'fuentes' / nombre), str(BACKEND / 'almacen' / 'cache')
    t['estado'], t['iniciado'] = 'en_proceso', ahora_iso()
    _guardar(t)
    actualizacion.agregar_punto(nombre, lat, lon)  # desde ahora se mantiene al día
    for fuente in ('power', 'modis'):
        if t['fuentes'][fuente]['estado'] in LISTOS:
            continue
        if parar.is_set():
            t['fuentes'][fuente] = {'estado': 'cancelado', 'motivo': 'detenido por el usuario antes de empezar esta fuente'}
            continue
        t['fuentes'][fuente] = {'estado': 'en_proceso', 'desde': ahora_iso()}
        _guardar(t)
        try:
            if fuente == 'power':
                r = power.obtener(lat=lat, lon=lon, salida=salida, cache=cache, inicio=INICIO, nombre=nombre,
                                  archivo_base=f'power_{nombre}')
                t['fuentes'][fuente] = {**_clasificar(r['estado'], r.get('faltan', [])), 'archivos': r.get('archivos'),
                                        'motivo': r.get('motivo')}
            else:
                rs = ornl.obtener_varios(lat=lat, lon=lon, salida=salida, cache=cache, inicio=INICIO, nombre=nombre,
                                         productos={p: None for p in MODIS}, tope=4, cancelar=parar)
                productos = {p: {**_clasificar(v['estado'], v.get('faltan', [])), 'archivos': v.get('archivos'),
                                 'motivo': v.get('motivo')} for p, v in rs.items()}
                estados = [x['estado'] for x in productos.values()]
                t['fuentes'][fuente] = {
                    'estado': 'listo' if all(e == 'listo' for e in estados)
                    else ('listo_con_vacios' if all(e in LISTOS for e in estados)
                          else ('sin_datos' if all(e == 'sin_datos' for e in estados) else 'parcial')),
                    'productos': productos}
        except Exception as e:  # noqa: BLE001 - se anota; relanzar continúa
            t['fuentes'][fuente] = {'estado': 'error', 'motivo': f'{type(e).__name__}: {e}'}
        t['fuentes'][fuente]['hasta'] = ahora_iso()
        _guardar(t)
    hechas = [t['fuentes'][f]['estado'] for f in ('power', 'modis')]
    t['estado'] = ('cancelado' if parar.is_set() else 'listo' if all(e == 'listo' for e in hechas) else 'listo_con_vacios' if all(e in LISTOS for e in hechas)
                   else 'error' if all(e in ('error', 'sin_datos') for e in hechas) else 'parcial')
    t['terminado'] = ahora_iso()
    if parar.is_set():
        t['cancelacion'] = {'pedida': ahora_iso(), 'nota': 'lo descargado queda guardado; volver a pedirlo continúa desde ahí'}
    else:
        t['aviso'] = {**t['aviso'], 'estado': 'por_enviar', 'listo_desde': t['terminado']}
    _guardar(t)
    log(f'trabajo {clave}: {t["estado"]}')
    return t


def iniciar(lat: float, lon: float, nombre: str | None = None, parcela: dict | None = None) -> dict:
    """Crea el trabajo y lo ejecuta en un hilo (en la API; en Google Cloud será un trabajo de Cloud Run o una cola)."""
    t = crear(lat, lon, nombre, parcela)
    with _LOCK:
        vivo = _HILOS.get(t['clave'])
        if t['estado'] in LISTOS or (vivo and vivo.is_alive()):
            return t
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
    print(json.dumps(t, ensure_ascii=False, indent=1))
    return 0


if __name__ == '__main__':
    sys.exit(main())

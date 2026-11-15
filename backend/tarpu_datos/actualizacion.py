"""Actualización periódica de los datos de TARPU (esquema mixto, DT-22).

Qué se actualiza y cada cuánto (PERIODOS, en días). Los períodos son una elección operativa del equipo, no una
propiedad de los proveedores; se cambian aquí o con la variable TARPU_PERIODOS (JSON).

    base_power        POWER de las 63 celdas de Arequipa, hasta ayer                       cada 7 días
    puntos_power      POWER de cada punto registrado, hasta ayer                            cada 7 días
    puntos_modis      MODIS de cada punto (NDVI, ET y PET, temperatura de superficie)       cada 8 días
    puntos_cobertura  MODIS MCD12Q1 (cobertura anual) de cada punto                         cada 30 días
    estáticos         SoilGrids, GAEZ, NASADEM y CENAGRO: no se actualizan solos; se revisan a mano cuando el
                      proveedor publica una versión nueva (queda anotado en el estado).

Solo se pide lo nuevo: POWER es una petición de segundos; en MODIS los bloques ya guardados se reutilizan y solo
se piden el último bloque y los nuevos (ornl.tramos_anclados). Si algo falla, se anota y se reintenta en la
próxima vuelta; lo anterior no se borra.

Uso (desde backend/):
    python -m tarpu_datos.actualizacion estado
    python -m tarpu_datos.actualizacion agregar majes_riego -16.367023 -72.185771
    python -m tarpu_datos.actualizacion una-vez [--forzar]
    python -m tarpu_datos.actualizacion bucle --cada-horas 6
En la API: con TARPU_ACTUALIZAR_CADA_HORAS=6 (variable de entorno), tarpu_api.main lanza el bucle en segundo plano.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import threading
import time
from datetime import datetime, timezone
from pathlib import Path

from .base import extraer as base_regional
from .fuentes import ornl, power
from .fuentes.cliente import ahora_iso, escribir_atomico, log

BACKEND = Path(__file__).resolve().parent.parent
ALMACEN = BACKEND / 'almacen'
PUNTOS = ALMACEN / 'puntos.json'
ESTADO = ALMACEN / 'actualizacion.json'
INICIO = '2015-01-01'
PERIODOS = {'base_power': 7, 'puntos_power': 7, 'puntos_modis': 8, 'puntos_cobertura': 30}
PERIODOS.update(json.loads(os.environ.get('TARPU_PERIODOS', '{}') or '{}'))
ESTATICOS = ['soilgrids', 'gaez', 'nasadem', 'cenagro']
_EN_CURSO = threading.Lock()


def _leer(ruta: Path) -> dict:
    try:
        return json.loads(ruta.read_text(encoding='utf-8'))
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def _guardar(ruta: Path, datos: dict) -> None:
    escribir_atomico(ruta, json.dumps(datos, ensure_ascii=False, indent=1))


def puntos() -> dict:
    return _leer(PUNTOS)


def agregar_punto(nombre: str, lat: float, lon: float) -> None:
    """Registra un punto (lugar de ejemplo o parcela de un usuario) para que se mantenga actualizado."""
    p = puntos()
    p[nombre] = {'lat': lat, 'lon': lon, 'alta': p.get(nombre, {}).get('alta', ahora_iso())}
    _guardar(PUNTOS, p)


def _toca(estado: dict, tarea: str, forzar: bool) -> bool:
    if forzar or tarea not in estado:
        return True
    try:
        ultima = datetime.fromisoformat(estado[tarea]['ultima_correcta'])
    except (KeyError, TypeError, ValueError):
        return True
    return (datetime.now(timezone.utc) - ultima).total_seconds() >= PERIODOS[tarea] * 86400


def _anotar(estado: dict, tarea: str, detalle: dict, correcta: bool) -> None:
    previo = estado.get(tarea, {})
    estado[tarea] = {**previo, 'ultimo_intento': ahora_iso(), 'detalle': detalle,
                     'cada_dias': PERIODOS[tarea], 'ultima_correcta': ahora_iso() if correcta else previo.get('ultima_correcta')}
    _guardar(ESTADO, estado)


def _carpeta_punto(nombre: str) -> Path:
    return ALMACEN / 'fuentes' / nombre


def revisar(forzar: bool = False) -> dict:
    """Una vuelta: actualiza lo que toca. Devuelve el estado. No corre dos vueltas a la vez."""
    if not _EN_CURSO.acquire(blocking=False):
        log('actualizar: ya hay una vuelta en curso; se omite esta')
        return _leer(ESTADO)
    try:
        estado = _leer(ESTADO)
        estado['estaticos'] = {'fuentes': ESTATICOS, 'nota': 'no se actualizan solos; revisar versión del proveedor a mano'}
        if _toca(estado, 'base_power', forzar):
            log('actualizar: POWER de la base de Arequipa')
            try:
                base_regional.power(3, actualizar=True)
                m = _leer(base_regional.MANIFIESTO).get('power', {})
                _anotar(estado, 'base_power', {'celdas': m.get('celdas'), 'fallos': m.get('posibles_fallos')}, True)
            except Exception as e:  # noqa: BLE001 - se anota y se reintenta en la próxima vuelta
                _anotar(estado, 'base_power', {'error': f'{type(e).__name__}: {e}'}, False)
        for tarea, productos in (('puntos_power', None), ('puntos_modis', ['MOD13Q1', 'MOD16A2GF', 'MOD11A2']),
                                 ('puntos_cobertura', ['MCD12Q1'])):
            if not _toca(estado, tarea, forzar):
                continue
            detalle, todo_bien = {}, True
            for nombre, p in puntos().items():
                log(f'actualizar: {tarea} · {nombre}')
                salida, cache = str(_carpeta_punto(nombre)), str(ALMACEN / 'cache')
                try:
                    if productos is None:
                        r = power.obtener(lat=p['lat'], lon=p['lon'], salida=salida, cache=cache, inicio=INICIO,
                                          nombre=nombre, archivo_base=f'power_{nombre}')
                        detalle[nombre] = {'estado': r['estado'], 'faltan': r.get('faltan', [])[:5], 'motivo': r.get('motivo')}
                    else:
                        rs = ornl.obtener_varios(lat=p['lat'], lon=p['lon'], salida=salida, cache=cache, inicio=INICIO,
                                                 nombre=nombre, productos={x: None for x in productos}, tope=4)
                        detalle[nombre] = {k: {'estado': v['estado'], 'faltan': len(v.get('faltan', [])), 'motivo': v.get('motivo')}
                                           for k, v in rs.items()}
                        r = {'estado': 'sin_datos' if any(v['estado'] == 'sin_datos' for v in rs.values()) else 'listo'}
                    todo_bien &= r['estado'] != 'sin_datos'
                except Exception as e:  # noqa: BLE001
                    detalle[nombre] = {'error': f'{type(e).__name__}: {e}'}
                    todo_bien = False
            _anotar(estado, tarea, detalle, todo_bien)
        return estado
    finally:
        _EN_CURSO.release()


def bucle(cada_horas: float, parar: threading.Event | None = None) -> None:
    parar = parar or threading.Event()
    while not parar.is_set():
        try:
            revisar()
        except Exception as e:  # noqa: BLE001 - el bucle nunca se cae
            log(f'actualizar: la vuelta falló ({type(e).__name__}: {e}); se reintenta en la próxima')
        parar.wait(cada_horas * 3600)


def iniciar_en_segundo_plano(cada_horas: float) -> tuple[threading.Thread, threading.Event]:
    """Para la API: un hilo que revisa cada `cada_horas`. Devuelve el hilo y el evento para pararlo."""
    parar = threading.Event()
    hilo = threading.Thread(target=bucle, args=(cada_horas, parar), name='tarpu-actualizar', daemon=True)
    hilo.start()
    return hilo, parar


def main() -> int:
    a = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = a.add_subparsers(dest='comando', required=True)
    sub.add_parser('estado')
    g = sub.add_parser('agregar')
    g.add_argument('nombre')
    g.add_argument('lat', type=float)
    g.add_argument('lon', type=float)
    u = sub.add_parser('una-vez')
    u.add_argument('--forzar', action='store_true')
    b = sub.add_parser('bucle')
    b.add_argument('--cada-horas', type=float, default=6)
    args = a.parse_args()
    if args.comando == 'agregar':
        agregar_punto(args.nombre, args.lat, args.lon)
        print(f'Punto {args.nombre} registrado.')
    elif args.comando == 'una-vez':
        revisar(args.forzar)
    elif args.comando == 'bucle':
        bucle(args.cada_horas)
    estado = _leer(ESTADO)
    print(json.dumps({'puntos': puntos(), 'periodos_dias': PERIODOS,
                      'tareas': {k: {x: v.get(x) for x in ('ultima_correcta', 'ultimo_intento')} if isinstance(v, dict) else v
                                 for k, v in estado.items()}}, ensure_ascii=False, indent=1))
    return 0


if __name__ == '__main__':
    sys.exit(main())

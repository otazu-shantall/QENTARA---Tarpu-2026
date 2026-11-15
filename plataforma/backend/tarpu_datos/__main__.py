"""Línea de comandos del paquete de extracción de TARPU.

Desde backend/:
    python -m tarpu_datos --lat -15.64 --lon -71.60 --nombre chivay \
        --fuentes power soilgrids gaez luz --inicio 2015-01-01 --fin 2025-12-31
    python -m tarpu_datos --lat -15.64 --lon -71.60 --nombre chivay --fuentes ornl \
        --productos MOD13Q1 --inicio 2015-01-01 --fin 2026-10-16 --tope-ornl 4
Prueba a pequeña escala: --capas phh2o_0-5cm_mean,clay_0-5cm_mean · --cultivos "White potato" · --max-tramos 1
Salidas en backend/almacen/fuentes/ y caché en backend/almacen/cache/ (git las ignora).
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

from .fuentes import gaez, luz, ornl, power, soilgrids
from .fuentes.cliente import log

CARPETA = Path(__file__).resolve().parent.parent / 'almacen'  # backend/almacen (git lo ignora)
FUENTES = ['power', 'soilgrids', 'gaez', 'luz', 'ornl']


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog='python -m tarpu_datos', description=__doc__.split('\n')[0])
    p.add_argument('--lat', type=float, required=True)
    p.add_argument('--lon', type=float, required=True)
    p.add_argument('--nombre', help='nombre corto del punto (por defecto, derivado de las coordenadas)')
    p.add_argument('--fuentes', nargs='+', choices=FUENTES, default=['power', 'soilgrids', 'gaez', 'luz'])
    p.add_argument('--inicio', help='AAAA-MM-DD (las fuentes estáticas lo ignoran)')
    p.add_argument('--fin', help='AAAA-MM-DD')
    p.add_argument('--salida', default=str(CARPETA / 'fuentes'))
    p.add_argument('--cache', default=str(CARPETA / 'cache'))
    p.add_argument('--capas', help='SoilGrids: coberturas separadas por coma (por defecto, las 165)')
    p.add_argument('--tope-soilgrids', type=int, default=4)
    p.add_argument('--cultivos', nargs='+', help='GAEZ: nombres de cultivo tal como los usa GAEZ')
    p.add_argument('--tope-gaez', type=int, default=4)
    p.add_argument('--productos', nargs='+', default=['MOD13Q1'], choices=sorted(ornl.PRODUCTOS))
    p.add_argument('--tope-ornl', type=int, default=4, help='peticiones simultáneas a ORNL (subir a 8 solo con pocos 5xx)')
    p.add_argument('--espera-max-ornl', type=float, default=120, help='espera máxima (s) en la ronda final de ORNL')
    p.add_argument('--max-tramos', type=int, help='ORNL: solo los N tramos más recientes por producto (prueba)')
    a = p.parse_args(argv)

    comunes = dict(lat=a.lat, lon=a.lon, salida=a.salida, cache=a.cache, inicio=a.inicio, fin=a.fin, nombre=a.nombre)
    resultados: dict[str, dict] = {}
    for fuente in FUENTES:
        if fuente not in a.fuentes:
            continue
        inicio = time.monotonic()
        log(f'== {fuente} ==')
        if fuente == 'power':
            r = {'power': power.obtener(**comunes)}
        elif fuente == 'soilgrids':
            capas = [c.strip() for c in a.capas.split(',')] if a.capas else None
            r = {'soilgrids': soilgrids.obtener(**comunes, capas=capas, tope=a.tope_soilgrids)}
        elif fuente == 'gaez':
            r = {'gaez': gaez.obtener(**comunes, cultivos=a.cultivos, tope=a.tope_gaez)}
        elif fuente == 'luz':
            r = {'luz': luz.obtener(**comunes)}
        else:
            varios = ornl.obtener_varios(**comunes, productos={x: None for x in a.productos}, tope=a.tope_ornl,
                                         espera_max=a.espera_max_ornl, max_tramos=a.max_tramos)
            r = {f'ornl:{k}': v for k, v in varios.items()}
        for k, v in r.items():
            log(f'{k}: {v["estado"]} en {time.monotonic() - inicio:.0f} s'
                + (f' · motivo: {v["motivo"][:200]}' if v.get('motivo') else '')
                + (f' · faltan {len(v["faltan"])}' if v.get('faltan') else ''))
        resultados.update(r)
    print(json.dumps(resultados, ensure_ascii=False, indent=1))
    return 0 if all(v['estado'] != 'sin_datos' for v in resultados.values()) else 1


if __name__ == '__main__':
    sys.exit(main())

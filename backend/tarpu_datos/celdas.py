"""Clave de la celda o píxel de cada producto que contiene un punto (reutilización entre parcelas vecinas, DT-23).

Dos parcelas cuyo centroide cae en la misma celda comparten la serie: se extrae una vez y se reutiliza.

- POWER: celda de 0,5° (lat) x 0,625° (lon) de la malla MERRA-2; la clave es su centro (como base/leer.power_celda).
- MODIS: píxel de la malla sinusoidal de MODIS. La clave es su esquina inferior izquierda en metros, igual a los
  `xllcorner` y `yllcorner` que devuelve ORNL. Comprobado el 15/11/2026: la fórmula coincide con las 1621 respuestas
  guardadas de ORNL (MOD13Q1, MOD16A2GF, MOD11A2 y MCD12Q1, todos los puntos), con diferencias < 1 m.
Constantes de la malla sinusoidal de MODIS: radio de la esfera 6 371 007,181 m; origen de la malla
(-20 015 109,354; 10 007 554,677) m; tesela de 1 111 950,5197665 m dividida en 4800, 2400 o 1200 píxeles.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import math

R_MODIS = 6371007.181
X0, Y0 = -20015109.354, 10007554.677
TESELA_M = 1111950.5197665
PIXEL_M = {'MOD13Q1': TESELA_M / 4800, 'MOD16A2GF': TESELA_M / 2400, 'MCD12Q1': TESELA_M / 2400, 'MOD11A2': TESELA_M / 1200}


def _a_sinusoidal(lat: float, lon: float) -> tuple[float, float]:
    return R_MODIS * math.radians(lon) * math.cos(math.radians(lat)), R_MODIS * math.radians(lat)


def _a_geograficas(x: float, y: float) -> tuple[float, float]:
    lat = math.degrees(y / R_MODIS)
    return lat, math.degrees(x / (R_MODIS * math.cos(math.radians(lat))))


def modis(producto: str, lat: float, lon: float) -> dict:
    """Píxel MODIS del producto que contiene el punto: clave, esquina (m), tamaño y huella en grados."""
    tam = PIXEL_M[producto]
    x, y = _a_sinusoidal(lat, lon)
    col, fila = math.floor((x - X0) / tam), math.floor((Y0 - y) / tam)
    xll, yll = X0 + col * tam, Y0 - (fila + 1) * tam
    esquinas = [_a_geograficas(xx, yy) for xx, yy in ((xll, yll), (xll + tam, yll), (xll + tam, yll + tam), (xll, yll + tam))]
    centro = _a_geograficas(xll + tam / 2, yll + tam / 2)
    return {'producto': producto, 'clave': f'{producto}:x={xll:.2f},y={yll:.2f}', 'xllcorner': round(xll, 2),
            'yllcorner': round(yll, 2), 'tamano_m': tam, 'centro': {'lat': centro[0], 'lon': centro[1]},
            'huella': [[lo, la] for la, lo in esquinas] + [[esquinas[0][1], esquinas[0][0]]]}


def power(lat: float, lon: float) -> dict:
    clat, clon = round(lat / 0.5) * 0.5, round(lon / 0.625) * 0.625
    return {'producto': 'POWER_DIARIO_AG', 'clave': f'POWER:{clat:.3f},{clon:.3f}', 'centro': {'lat': clat, 'lon': clon},
            'huella': [[clon - .3125, clat - .25], [clon + .3125, clat - .25], [clon + .3125, clat + .25],
                       [clon - .3125, clat + .25], [clon - .3125, clat - .25]]}


def todas(lat: float, lon: float) -> dict[str, dict]:
    return {'POWER_DIARIO_AG': power(lat, lon), **{p: modis(p, lat, lon) for p in PIXEL_M}}

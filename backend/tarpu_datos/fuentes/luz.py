"""Horas de luz por día según la latitud (FAO-56, capítulo 3), sin red.

Allen, R. G., Pereira, L. S., Raes, D. y Smith, M. (1998). Crop evapotranspiration. FAO Irrigation
and Drainage Paper 56, ecuaciones 24, 25 y 34:
    δ  = 0,409 · sen(2π·J/365 − 1,39)       declinación solar (rad)
    ωs = arccos(−tan φ · tan δ)              ángulo horario de la puesta del sol (rad)
    N  = (24/π) · ωs                         horas de luz astronómicas
J es el día del año y φ la latitud en radianes. Es un cálculo astronómico, no una medición de
nubosidad ni de radiación. Si |−tan φ·tan δ| > 1 (latitudes polares) la fórmula no aplica y el día
queda vacío. No hay proveedor: el «original» guarda las entradas y la fórmula.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import math
from datetime import date, timedelta

from .cliente import ahora_iso, clave_punto, escribir_tres, fecha_compacta, resultado

CITA = ('Allen, R. G., Pereira, L. S., Raes, D., Smith, M. (1998). Crop evapotranspiration - Guidelines for '
        'computing crop water requirements. FAO Irrigation and Drainage Paper 56, chapter 3, eq. 24, 25, 34. '
        'https://www.fao.org/3/x0490e/x0490e00.htm')


def horas_de_luz(lat: float, dia_del_anio: int) -> float | None:
    phi = math.radians(lat)
    delta = 0.409 * math.sin(2 * math.pi * dia_del_anio / 365 - 1.39)
    x = -math.tan(phi) * math.tan(delta)
    if abs(x) > 1:
        return None
    return 24 / math.pi * math.acos(x)


def obtener(*, lat: float, lon: float, salida: str, cache: str | None = None, inicio: str | None = None,
            fin: str | None = None, progreso=None, nombre: str | None = None, **_: object) -> dict:
    if not inicio or not fin:
        return resultado('sin_datos', motivo='Las horas de luz necesitan inicio y fin (AAAA-MM-DD).')
    nombre = nombre or clave_punto(lat, lon)
    base = f'luz_{nombre}_{fecha_compacta(inicio)}_{fecha_compacta(fin)}'
    d, ultimo = date.fromisoformat(inicio), date.fromisoformat(fin)
    filas, sin_valor = [], []
    while d <= ultimo:
        j = d.timetuple().tm_yday
        n = horas_de_luz(lat, j)
        if n is None:
            sin_valor.append(d.isoformat())
        filas.append([d.isoformat(), j, None if n is None else round(n, 4)])
        d += timedelta(days=1)
    con_valor = [f for f in filas if f[2] is not None]
    minimo = min(con_valor, key=lambda f: f[2]) if con_valor else None
    maximo = max(con_valor, key=lambda f: f[2]) if con_valor else None
    original = {'method': 'FAO-56 daylight hours', 'equations': {
        'delta': '0.409 * sin(2*pi*J/365 - 1.39)', 'omega_s': 'arccos(-tan(phi) * tan(delta))',
        'N': '(24/pi) * omega_s'}, 'inputs': {'latitude_deg': lat, 'start': inicio, 'end': fin},
        'citation': CITA}
    procedencia = {
        'source_id': 'FAO-56 (calculation, no network)', 'product_id': 'Daylight hours N',
        'computed_at': ahora_iso(), 'point': {'latitude': lat, 'longitude': lon},
        'observed_start': inicio, 'observed_end': fin, 'days': len(filas),
        'units': {'N': 'h', 'dia_del_anio': 'day of year (J)'},
        'min': {'fecha': minimo[0], 'dia_del_anio': minimo[1], 'N_h': minimo[2]} if minimo else None,
        'max': {'fecha': maximo[0], 'dia_del_anio': maximo[1], 'N_h': maximo[2]} if maximo else None,
        'missing_days_polar': sin_valor, 'citation': CITA,
        'note': 'Astronomical daylight length from latitude only; ignores clouds, slope and horizon.',
        'generated_with': 'tarpu_datos (written with AI assistance, Claude Code).',
    }
    archivos = escribir_tres(salida, base, original=original,
                             cabecera=['fecha', 'dia_del_anio (J)', 'N (h)'], filas=filas, procedencia=procedencia)
    if progreso:
        progreso(1, 1)
    return resultado('parcial' if sin_valor else 'listo', archivos,
                     [f'{len(sin_valor)} días fuera del dominio de la fórmula'] if sin_valor else [])

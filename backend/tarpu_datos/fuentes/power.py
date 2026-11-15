"""NASA POWER: 19 variables diarias para un punto, en una sola petición (límite verificado: 20).

Modelo: datos/power/consulta_power.py. El faltante (header.fill_value, normalmente -999) queda
vacío y se cuenta; nunca se convierte en cero. Las unidades salen de la propia respuesta.
El valor es de una celda de grilla regional, no una medición en la parcela.
Documentación: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import urllib.parse
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .cliente import (Cache, PeticionFallida, Progreso, Servicio, ahora_iso, clave_punto,
                      escribir_tres, fecha_compacta, log, resultado)

API = 'https://power.larc.nasa.gov/api/temporal/daily/point'
# README T01 §3.1. No se usan IMERG_PRECTOT ni RZMC: vinieron vacías los 366 días en Majes 2024.
PARAMETROS = ['T2M', 'T2M_MAX', 'T2M_MIN', 'T2M_RANGE', 'PRECTOTCORR', 'RH2M', 'T2MDEW', 'FROST_DAYS',
              'ALLSKY_SFC_SW_DWN', 'ALLSKY_SFC_PAR_TOT', 'CLOUD_AMT', 'WS2M', 'GWETTOP', 'GWETROOT',
              'GWETPROF', 'TSOIL1', 'TSOIL2', 'TS_MIN', 'EVLAND']


def obtener(*, lat: float, lon: float, salida: str, cache: str, inicio: str | None = None,
            fin: str | None = None, progreso=None, nombre: str | None = None,
            servicio: Servicio | None = None, archivo_base: str | None = None, **_: object) -> dict:
    """Sin `fin`, pide hasta ayer (UTC) y recorta al final los días que POWER todavía no publica.

    archivo_base: nombre fijo de los tres archivos (lo usa actualizar.py para reemplazar siempre el mismo).
    La caché sigue usando las fechas reales, así una actualización nunca devuelve datos viejos."""
    if not inicio:
        return resultado('sin_datos', motivo='NASA POWER necesita inicio (AAAA-MM-DD).')
    fin = fin or (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()
    ini, fi = fecha_compacta(inicio), fecha_compacta(fin)
    nombre = nombre or clave_punto(lat, lon)
    base_cache = f'power_{nombre}_{ini}_{fi}'
    base = archivo_base or base_cache
    servicio = servicio or Servicio('POWER', 1)
    url = f'{API}?' + urllib.parse.urlencode({
        'parameters': ','.join(PARAMETROS), 'community': 'AG', 'latitude': lat, 'longitude': lon,
        'start': ini, 'end': fi, 'format': 'JSON'})
    avance = Progreso(1, progreso, 'POWER')
    try:
        guardado = Cache(Path(cache) / 'power').obtener_json(
            f'{base_cache}_{clave_punto(lat, lon)}.json', servicio, url, timeout=60, etiqueta=base)
    except PeticionFallida as error:
        log(f'POWER falló: {error.motivo}')
        return resultado('sin_datos', motivo=error.motivo)
    avance.paso(base)
    datos = guardado['response']

    series = datos.get('properties', {}).get('parameter', {})
    if not series:
        return resultado('sin_datos', motivo='NASA POWER no devolvió properties.parameter: '
                         + str(datos.get('messages') or datos)[:500])
    relleno = datos.get('header', {}).get('fill_value', -999)
    claves = [c for c in PARAMETROS if c in series]
    no_llegaron = [c for c in PARAMETROS if c not in series]
    unidades = {c: datos.get('parameters', {}).get(c, {}).get('units', '') for c in claves}
    fechas = sorted(next(iter(series.values())).keys())

    # Días finales sin ningún valor: POWER aún no los publica (latencia). Se recortan y se anotan.
    recortados = []
    while fechas and all(series[c].get(fechas[-1]) in (None, relleno) for c in claves):
        recortados.insert(0, fechas.pop())
    faltantes = {c: 0 for c in claves}
    filas = []
    for fecha in fechas:
        fila = [f'{fecha[:4]}-{fecha[4:6]}-{fecha[6:]}']
        for c in claves:
            valor = series[c].get(fecha)
            if valor is None or valor == relleno:
                faltantes[c] += 1
                fila.append(None)
            else:
                fila.append(valor)
        filas.append(fila)

    geometria = datos.get('geometry', {}).get('coordinates')
    procedencia = {
        'source_id': 'NASA POWER', 'product_id': 'Daily Point API, community AG',
        'api_version': datos.get('header', {}).get('api', {}).get('version'),
        'request_url': guardado['request_url'], 'requested_at': guardado.get('requested_at'),
        'written_at': ahora_iso(),
        'point': {'latitude': lat, 'longitude': lon},
        'geometry_returned_lon_lat_elev_m': geometria,
        'cell_elevation_m': geometria[2] if isinstance(geometria, list) and len(geometria) > 2 else None,
        'observed_start': inicio, 'observed_end': (f'{fechas[-1][:4]}-{fechas[-1][4:6]}-{fechas[-1][6:]}' if fechas else None),
        'requested_end': fin, 'days': len(fechas),
        'days_trimmed_not_yet_published': [f'{d[:4]}-{d[4:6]}-{d[6:]}' for d in recortados],
        'parameters_requested': PARAMETROS, 'parameters_missing_from_response': no_llegaron,
        'units': unidades, 'fill_value': relleno, 'missing_days': faltantes,
        'parameter_definitions': {c: datos.get('parameters', {}).get(c, {}).get('longname') for c in claves},
        'sources': datos.get('header', {}).get('sources'),
        'resolution': 'Regional grid cell (per POWER documentation); see header.sources for each dataset.',
        'citation': 'NASA POWER Project, https://power.larc.nasa.gov/ (data acknowledgement per POWER docs).',
        'note': 'Grid-cell regional estimate, not an in-field measurement.',
        'generated_with': 'tarpu_datos (written with AI assistance, Claude Code).',
    }
    archivos = escribir_tres(salida, base, original=datos,
                             cabecera=['fecha'] + [f'{c} ({unidades[c]})' for c in claves],
                             filas=filas, procedencia=procedencia)
    faltan = [f'{c}: no vino en la respuesta' for c in no_llegaron]
    faltan += [f'{c}: {n} días con relleno {relleno}' for c, n in faltantes.items() if n]
    log(f'POWER {base}: {len(fechas)} días, elevación {procedencia["cell_elevation_m"]} m, '
        f'faltantes {sum(faltantes.values())}')
    return resultado('parcial' if faltan else 'listo', archivos, faltan)

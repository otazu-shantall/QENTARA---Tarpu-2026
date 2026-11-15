"""FAO GAEZ v4 (servicio res05): índice de aptitud por cultivo y tipo de agua, en un punto.

1. `query` lista las capas de cada cultivo (1981-2010, sub_theme_name «Suitability Index», insumos
   altos) con su objectid, nombre, tipo de agua y texto de `variable`. No se supone qué tipos de
   agua existen: se guardan los que devuelva el servicio.
2. Solo se leen las capas cuyo `variable` empieza por «Suitability index» (el subtema también trae
   capas «Share of grid cell…», que son otra variable; quedan listadas en la procedencia).
3. `identify` con esriMosaicLockRaster lee el valor en el punto (índice de 0 a 10 000).
Prefijo del nombre: «su…» = current cropland in grid cell; «sx…» = all land in grid cell (texto
literal de `variable`, que se guarda). Celdas de 0,0833° (≈ 9 km): no describe una parcela.
GAEZ no tiene quinua, haba, ajo, alcachofa, vid ni zapallo (README T01 §3.3).
Normalizado: UNA fila con «fecha» vacía (dato estático; no es una fecha de observación).
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import json
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from .cliente import (Cache, PeticionFallida, Progreso, Servicio, ahora_iso, clave_punto,
                      escribir_tres, log, resultado)

API = 'https://gaez-services.fao.org/server/rest/services/res05/ImageServer'
CULTIVOS = ['Alfalfa', 'Barley', 'Carrot', 'Dry pea', 'Maize', 'Olive', 'Onion', 'Phaseolus bean',
            'Sugarcane', 'Sweet potato', 'Tomato', 'Wetland rice', 'Wheat', 'White potato', 'Oat']
PERIODO, INSUMOS = '1981-2010', 'High'
CAMPOS = 'objectid,name,crop,water_supply,input_level,year,variable'


def _consulta_capas(cache: Cache, servicio: Servicio, cultivos: list[str]) -> dict:
    lista = ','.join("'" + c.replace("'", "''") + "'" for c in cultivos)
    where = (f"crop in ({lista}) and year='{PERIODO}' and sub_theme_name='Suitability Index' "
             f"and input_level='{INSUMOS}'")
    url = f'{API}/query?' + urllib.parse.urlencode({'where': where, 'outFields': CAMPOS,
                                                     'returnGeometry': 'false', 'f': 'json'})
    return cache.obtener_json(f'query_{"-".join(sorted(cultivos)).replace(" ", "")}.json', servicio, url,
                              timeout=90, etiqueta='query')


def _url_identify(objectid: int, lat: float, lon: float) -> str:
    return f'{API}/identify?' + urllib.parse.urlencode({
        'geometry': json.dumps({'x': lon, 'y': lat, 'spatialReference': {'wkid': 4326}}),
        'geometryType': 'esriGeometryPoint',
        'mosaicRule': json.dumps({'mosaicMethod': 'esriMosaicLockRaster', 'lockRasterIds': [objectid]}),
        'returnGeometry': 'false', 'returnCatalogItems': 'false', 'f': 'json'})


def obtener(*, lat: float, lon: float, salida: str, cache: str, inicio: str | None = None,
            fin: str | None = None, progreso=None, nombre: str | None = None,
            cultivos: list[str] | None = None, tope: int = 4, **_: object) -> dict:
    nombre = nombre or clave_punto(lat, lon)
    cultivos = cultivos or CULTIVOS
    base = f'gaez_{nombre}'
    servicio = Servicio('GAEZ', tope)
    caja = Cache(Path(cache) / 'gaez')
    caja_punto = Cache(Path(cache) / 'gaez' / clave_punto(lat, lon))
    try:
        consulta = _consulta_capas(caja, servicio, cultivos)
    except PeticionFallida as error:
        return resultado('sin_datos', motivo=f'GAEZ query: {error.motivo}')
    respuesta = consulta['response']
    if 'error' in respuesta:
        return resultado('sin_datos', motivo=f'GAEZ query: {json.dumps(respuesta["error"], ensure_ascii=False)}')
    capas = [f['attributes'] for f in respuesta.get('features', [])]
    if respuesta.get('exceededTransferLimit'):
        log('GAEZ: el servicio marcó exceededTransferLimit; la lista de capas puede estar incompleta')
    indices = [c for c in capas if str(c.get('variable', '')).lower().startswith('suitability index')]
    otras = [c['name'] for c in capas if c not in indices]
    indices.sort(key=lambda c: (cultivos.index(c['crop']) if c['crop'] in cultivos else 99, c['name']))
    sin_capas = [c for c in cultivos if not any(x['crop'] == c for x in indices)]

    avance = Progreso(len(indices), progreso, 'GAEZ identify')
    lecturas: dict[int, dict] = {}

    def leer(capa: dict) -> None:
        oid = capa['objectid']
        url = _url_identify(oid, lat, lon)
        try:
            guardado = caja_punto.obtener_json(f'identify_{oid}.json', servicio, url, timeout=60,
                                               etiqueta=capa['name'])
            lecturas[oid] = guardado
            avance.paso(f'{capa["name"]} = {guardado["response"].get("value")}')
        except PeticionFallida as error:
            lecturas[oid] = {'request_url': url, 'error': error.motivo}
            log(f'GAEZ {capa["name"]}: {error.motivo[:200]}')

    with ThreadPoolExecutor(max_workers=servicio.tope) as hilos:
        list(hilos.map(leer, indices))
    pendientes = [c for c in indices if 'error' in lecturas[c['objectid']]]
    if pendientes:
        log(f'GAEZ: ronda final para {len(pendientes)} capas')
        for c in pendientes:
            caja_punto.ruta(f'identify_{c["objectid"]}.json').unlink(missing_ok=True)
        with ThreadPoolExecutor(max_workers=max(1, servicio.tope // 2)) as hilos:
            list(hilos.map(leer, pendientes))

    cabecera, fila, faltan, detalle = ['fecha'], [None], [], []
    for capa in indices:
        oid = capa['objectid']
        lectura = lecturas[oid]
        cabecera.append(f'{capa["name"]} {capa["crop"]} {capa["water_supply"].strip()} (index 0-10000)')
        valor = None
        if 'error' in lectura:
            faltan.append(f'{capa["name"]} ({capa["crop"]}, {capa["water_supply"].strip()}): {lectura["error"][:200]}')
        else:
            crudo = lectura['response'].get('value')
            try:
                valor = int(float(crudo))
            except (TypeError, ValueError):
                faltan.append(f'{capa["name"]} ({capa["crop"]}, {capa["water_supply"].strip()}): '
                              f'valor no numérico del proveedor: {crudo!r}')
        fila.append(valor)
        detalle.append({**capa, 'value': valor, 'request_url': lectura.get('request_url')})

    procedencia = {
        'source_id': 'FAO GAEZ v4', 'product_id': 'res05 ImageServer, Suitability Index',
        'period': PERIODO, 'input_level': INSUMOS, 'request_base': API,
        'query_url': consulta['request_url'], 'query_requested_at': consulta.get('requested_at'),
        'written_at': ahora_iso(), 'point': {'latitude': lat, 'longitude': lon},
        'crops_requested': cultivos, 'crops_without_layers': sin_capas,
        'water_supply_by_crop': {c: sorted({x['water_supply'] for x in indices if x['crop'] == c}) for c in cultivos},
        'layers': detalle, 'layers_skipped_not_suitability_index': otras,
        'units': 'Suitability index, range 0-10000 (text of the «variable» field, kept per layer)',
        'prefix_meaning': {'su': 'current cropland in grid cell', 'sx': 'all land in grid cell'},
        'resolution': '0.0833 degrees (about 9 km) grid cell',
        'fecha_column_note': 'The «fecha» column is empty on purpose: static dataset, NOT an observation date.',
        'missing': faltan, 'requests': servicio.stats,
        'citation': 'FAO GAEZ v4, https://gaez.fao.org/ (exact citation and license text pending '
                    'verification against FAO terms of use).',
        'note': 'Regional suitability at about 9 km; does not describe a single plot.',
        'generated_with': 'tarpu_datos (written with AI assistance, Claude Code).',
    }
    original = {'query': consulta, 'identify': {str(k): v for k, v in lecturas.items()}}
    archivos = escribir_tres(salida, base, original=original, cabecera=cabecera, filas=[fila],
                             procedencia=procedencia)
    log(servicio.resumen())
    if not indices:
        return resultado('sin_datos', archivos, faltan, f'GAEZ no devolvió capas de índice para {cultivos}')
    return resultado('parcial' if faltan else 'listo', archivos, faltan)

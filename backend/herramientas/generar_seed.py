"""Genera supabase/seed.sql: catálogo de fuentes, productos y variables a partir de las procedencias reales.

Las unidades y los factores salen de lo que devolvió cada proveedor (procedencia de POWER y de ORNL; unidades de
SoilGrids leídas de su API REST por T01). Nada se escribe a mano salvo los nombres y las URL de las fuentes.
Uso (desde backend/): .venv/Scripts/python herramientas/generar_seed.py
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import glob
import json
from pathlib import Path

BACKEND = Path(__file__).resolve().parent.parent
SALIDA = BACKEND.parent / 'supabase' / 'seed.sql'


def q(v) -> str:
    if v is None:
        return 'null'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, (dict, list)):
        return "'" + json.dumps(v, ensure_ascii=False).replace("'", "''") + "'::jsonb"
    return "'" + str(v).replace("'", "''") + "'"


def fila(*v) -> str:
    return '(' + ', '.join(q(x) for x in v) + ')'


fuentes = [
    ('nasa_power', 'NASA POWER', 'NASA Langley Research Center', 'https://power.larc.nasa.gov/',
     'NASA POWER Project, https://power.larc.nasa.gov/'),
    ('ornl_modis', 'MODIS (servicio de ORNL DAAC)', 'ORNL DAAC / NASA', 'https://modis.ornl.gov/data/modis_webservice.html',
     'ORNL DAAC. MODIS and VIIRS Land Products Global Subsetting and Visualization Tool.'),
    ('soilgrids', 'SoilGrids 2.0', 'ISRIC', 'https://soilgrids.org/', 'Poggio, L. et al. (2021). SoilGrids 2.0. SOIL 7, 217-240.'),
    ('gaez', 'FAO GAEZ v4', 'FAO / IIASA', 'https://gaez.fao.org/', 'FAO GAEZ v4 (cita exacta pendiente)'),
    ('nasadem', 'NASADEM', 'NASA / LP DAAC', 'https://lpdaac.usgs.gov/products/nasadem_hgtv001/', 'NASA JPL (2020). NASADEM_HGT v001.'),
    ('cenagro', 'IV Censo Nacional Agropecuario 2012', 'INEI', 'http://censos1.inei.gob.pe/Cenagro/redatam/', 'INEI (2012). IV CENAGRO.'),
]
productos = [
    ('POWER_DIARIO_AG', 'nasa_power', 'Daily Point API, community AG', 'v2', 55000, 'diaria',
     'power: celda de 0,5° x 0,625° (radiación 1° x 1°); clave = centro de la celda',
     'Estimación regional de celda, no una medición en el campo.'),
    ('MOD13Q1', 'ornl_modis', 'MODIS/Terra Vegetation Indices 16-Day L3 Global 250m', '061', 231.656358, '16 días',
     'modis_sinusoidal: clave = esquina del píxel (xllcorner, yllcorner) en metros', 'El NDVI es verdor; no mide fertilidad.'),
    ('MOD16A2GF', 'ornl_modis', 'MODIS/Terra Net Evapotranspiration Gap-Filled 8-Day L4 500m', '061', 463.312717, '8 días',
     'modis_sinusoidal', None),
    ('MOD11A2', 'ornl_modis', 'MODIS/Terra Land Surface Temperature 8-Day L3 1km', '061', 926.625433, '8 días',
     'modis_sinusoidal', 'Temperatura de la superficie, no del aire.'),
    ('MCD12Q1', 'ornl_modis', 'MODIS/Terra+Aqua Land Cover Type Yearly L3 500m', '061', 463.312717, 'anual',
     'modis_sinusoidal', None),
    ('SOILGRIDS_250M', 'soilgrids', 'SoilGrids 2.0 (WCS)', '2.0', 250, 'estático', 'raster regional', 'Predicción, no un análisis de suelo.'),
    ('GAEZ_RES05', 'gaez', 'GAEZ v4 res05 Suitability Index', 'v4', 9000, 'estático', 'raster regional', None),
    ('NASADEM_HGT', 'nasadem', 'NASADEM_HGT', '001', 30, 'estático', 'raster regional', None),
]

variables = []
# POWER: de la procedencia de una celda de la base
p = json.loads(next(iter(glob.glob(str(BACKEND / 'almacen/base_arequipa/power/*.procedencia.json')))).__class__ and
               Path(sorted(glob.glob(str(BACKEND / 'almacen/base_arequipa/power/*.procedencia.json')))[0]).read_text(encoding='utf-8'))
for c in p['parameters_requested']:
    variables.append(('POWER_DIARIO_AG:' + c, 'POWER_DIARIO_AG', (p.get('parameter_definitions') or {}).get(c) or c,
                      (p.get('units') or {}).get(c), None, None, {'parametro': c}))
# MODIS: de las procedencias de ORNL de un punto
for producto in ('MOD13Q1', 'MOD16A2GF', 'MOD11A2', 'MCD12Q1'):
    archivos = sorted(glob.glob(str(BACKEND / f'almacen/fuentes/*/{producto.lower()}_*.procedencia.json')))
    if not archivos:
        continue
    pr = json.loads(Path(archivos[0]).read_text(encoding='utf-8'))
    for banda, m in pr['bands'].items():
        try:
            factor = float(m.get('scale_factor')) if m.get('scale_factor') not in (None, '') else None
        except ValueError:
            factor = None
        variables.append((f'{producto}:{banda}', producto, m.get('description') or banda, m.get('units'), factor, None,
                          {k: m.get(k) for k in ('valid_range', 'fill_value', 'add_offset')}))

sql = ['-- Catálogo de TARPU generado por backend/herramientas/generar_seed.py (no editar a mano).',
       '-- Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.', '']
sql.append('insert into public.fuentes (id, nombre, proveedor, url, cita) values\n  '
           + ',\n  '.join(fila(*f) for f in fuentes) + '\non conflict (id) do nothing;\n')
sql.append('insert into public.productos (id, fuente_id, nombre, version, resolucion_m, frecuencia, malla, nota) values\n  '
           + ',\n  '.join(fila(*x) for x in productos) + '\non conflict (id) do nothing;\n')
sql.append('insert into public.variables (id, producto_id, nombre, unidad, factor, que_no_dice, meta) values\n  '
           + ',\n  '.join(fila(*v) for v in variables) + '\non conflict (id) do nothing;\n')
SALIDA.write_text('\n'.join(sql), encoding='utf-8')
print(f'{SALIDA}: {len(fuentes)} fuentes, {len(productos)} productos, {len(variables)} variables')

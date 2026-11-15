"""Genera consultas guardadas del frontend desde datos reales del repositorio.

Escrito con asistencia de OpenAI Codex. Declarado en entrega/uso-de-ia.md.
No consulta proveedores ni modifica archivos de otras áreas.
"""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SAMPLES = ROOT / 'datos' / 'muestras'


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def rows(path):
    with path.open(encoding='utf-8', newline='') as file:
        return list(csv.DictReader(file))


places = []
sectors = read_json(ROOT / 'backend/catalogo/sectores.json')
relief = read_json(ROOT / 'backend/investigacion/relieve_erosion_rotacion_2026-11-15.json')
for key, name, sector in [('majes_riego', 'Majes riego', 'S1'), ('chivay', 'Chivay', 'S3')]:
    power_base = f'power_{key}_20250101_20251231'
    climate = rows(SAMPLES / f'{power_base}.normalizado.csv')
    provenance = read_json(SAMPLES / f'{power_base}.procedencia.json')
    soil = rows(SAMPLES / f'soilgrids_{key}.normalizado.csv')
    soil_provenance = read_json(SAMPLES / f'soilgrids_{key}.procedencia.json')
    ndvi_file = next(SAMPLES.glob(f'mod13q1-ndvi_{key}_20150101_20261114.normalizado.csv'))
    ndvi = rows(ndvi_file)
    ndvi_provenance = read_json(ndvi_file.with_name(ndvi_file.name.replace('.normalizado.csv', '.procedencia.json')))
    places.append({
        'id': key, 'name': name, 'point': provenance['point'],
        'sector': sector, 'sectorName': sectors['sectores'][sector]['nombre'],
        'relief': relief['relieve_zonas_piloto'][key]['punto'],
        'climate': [{'date': r['fecha'], 'temperature': float(r['T2M (C)']) if r['T2M (C)'] else None,
                     'minimum': float(r['T2M_MIN (C)']) if r['T2M_MIN (C)'] else None,
                     'rain': float(r['PRECTOTCORR (mm/day)']) if r['PRECTOTCORR (mm/day)'] else None}
                    for r in climate],
        'soil': [{'property': r['propiedad'], 'depth': r['profundidad'], 'unit': r['unidad'],
                  'mean': float(r['media']) if r['media'] else None,
                  'low': float(r['q05']) if r['q05'] else None,
                  'high': float(r['q95']) if r['q95'] else None} for r in soil],
        'vegetation': [{'date': r['fecha'], 'value': float(r['NDVI (sin unidad)']) if r['NDVI (sin unidad)'] else None,
                        'quality': r['calidad']} for r in ndvi],
        'sources': {'climate': provenance, 'soil': soil_provenance, 'vegetation': ndvi_provenance},
        'crops': sectors['sectores'][sector]['principales'],
    })
output = {'generatedWith': 'OpenAI Codex, asistencia de IA',
          'kind': 'repository-reference-snapshots',
          'note': 'Consultas reales guardadas. Los lugares son puntos de referencia, sin límites de parcela.',
          'places': places, 'cropSource': sectors['fuentes']['superficie']}
(ROOT / 'Codigo/src/nuevo/reference-data.json').write_text(
    json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(places)} lugares preparados con fuente, fecha y faltantes.')

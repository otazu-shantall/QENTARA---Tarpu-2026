"""Resumen de registros para el asistente; sin reglas nuevas ni descargas.
Asistencia de IA (Codex); entrega/uso-de-ia.md.
"""
from __future__ import annotations
import csv
import io
from . import ingesta, lectura


def preparar(lugar: dict, clima: str | None, satelites: dict[str, str]) -> dict:
    result = {'lugar': lugar.get('punto', lugar.get('centroide')), 'lectura': lectura.leer(lugar),
              'sector': lugar.get('sector'), 'relieve': lugar.get('relieve_centroide', lugar.get('relieve')),
              'avisos': lugar.get('avisos', []),
              'limites': 'Histórico, no pronóstico. Datos de celdas y píxeles, no mediciones de laboratorio de una parcela.',
              'clima': None, 'satelites': {}, 'fuentes': []}
    if result['relieve']:
        result['fuentes'].append('NASADEM')
    if result['lectura']['ph']['valor'] is not None:
        result['fuentes'].append('SoilGrids')
    if result['lectura']['ph']['cultivos_de_la_zona']:
        result['fuentes'].append('FAO EcoCrop · CENAGRO 2012')
    if clima:
        result['fuentes'].append('NASA POWER')
        dates, columns, units = ingesta.leer_normalizado(clima)
        years = sorted(set(d[:4] for d in dates))
        summary = {}
        for year in years:
            selected = [i for i, date in enumerate(dates) if date.startswith(year)]
            data = {}
            for variable in ('T2M', 'T2M_MIN', 'T2M_MAX', 'RH2M', 'PRECTOTCORR'):
                values = [columns[variable][i] for i in selected if variable in columns and columns[variable][i] is not None]
                data[variable] = {'unidad_original': units.get(variable), 'dias_con_dato': len(values),
                                  'dias_sin_valor_en_registros': len(selected) - len(values),
                                  'media': round(sum(values) / len(values), 3) if values else None}
                if variable == 'PRECTOTCORR':
                    data[variable]['suma_registros_mm'] = round(sum(values), 3) if values else None
                    data[variable]['nota'] = 'Suma de los días con dato; no garantiza cobertura de todos los días del año.'
            summary[year] = data
        result['clima'] = {'fuente': 'NASA POWER', 'periodo': [dates[0], dates[-1]] if dates else None,
                           'escala': (lugar.get('clima') or {}).get('procedencia'), 'resumen_por_ano': summary}
    for product, text in satelites.items():
        result['fuentes'].append(f'MODIS {product}')
        rows = list(csv.DictReader(io.StringIO(text)))
        if product == 'MOD13Q1':
            for row in rows:
                fields = list(row)
                quality = row.get(fields[2]) if len(fields) > 2 else None
                if quality not in ('0', '1', '0.0', '1.0'):
                    for field in fields:
                        if 'NDVI' in field:
                            row[field] = None
        # Valores publicados, con columnas de calidad y unidades intactas; no se calcula un NDVI nuevo.
        result['satelites'][product] = {'fuente': 'NASA MODIS, ORNL DAAC', 'registros_recientes': rows[-6:],
                                       'nota': 'No uses un valor de calidad inválida. No infieras fertilidad del NDVI.'}
    return result

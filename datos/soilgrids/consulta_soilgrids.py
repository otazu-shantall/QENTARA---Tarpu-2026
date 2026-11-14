"""Consulta ISRIC SoilGrids 2.0 para un punto y la guarda como original + CSV normalizado + procedencia.

Uso:
    python datos/soilgrids/consulta_soilgrids.py --lat -16.351 --lon -72.190 --nombre majes

Solo usa la biblioteca estándar de Python. No necesita cuenta ni clave.
Documentación oficial: https://docs.isric.org/globaldata/soilgrids/SoilGrids_faqs_02.html
API: https://rest.isric.org/soilgrids/v2.0/docs

Notas (ver datos/soilgrids/README.md):
- Son PREDICCIONES de aprendizaje automático a 250 m, con incertidumbre amplia. Un valor de
  píxel no es una medición en la parcela ni sustituye un análisis de suelo.
- SoilGrids devuelve null donde no hay predicción (agua, zonas urbanas, roca). Aquí queda
  vacío en el CSV y se cuenta; nunca se convierte en cero.
- La API REST está en fase beta y tiene un uso justo de 5 llamadas por minuto: este script hace
  una sola llamada por punto y reintenta con espera si el servicio responde 429 o 5xx.
- Licencia de los datos: CC BY 4.0. Cita: Poggio et al. (2021), SOIL 7, 217-240.
- Escrito con asistencia de IA (Claude Code). Hay que declararlo en la entrega.
"""
import argparse
import csv
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = 'https://rest.isric.org/soilgrids/v2.0/properties/query'
PROPIEDADES = ['phh2o', 'clay', 'sand', 'soc']
PROFUNDIDADES = ['0-5cm', '5-15cm']
VALORES = ['mean', 'Q0.05', 'Q0.5', 'Q0.95', 'uncertainty']
ESPERAS_S = [15, 30, 60]  # reintentos ante 429 o 5xx


def consultar(lat: float, lon: float) -> tuple[str, dict]:
    consulta = urllib.parse.urlencode({
        'lon': lon, 'lat': lat, 'property': PROPIEDADES, 'depth': PROFUNDIDADES, 'value': VALORES,
    }, doseq=True)
    url = f'{API}?{consulta}'
    peticion = urllib.request.Request(url, headers={'User-Agent': 'tarpu-qentara-hackathon'})
    for intento, espera in enumerate([0] + ESPERAS_S):
        if espera:
            print(f'Reintento {intento} en {espera} s...')
            time.sleep(espera)
        try:
            with urllib.request.urlopen(peticion, timeout=90) as respuesta:
                return url, json.loads(respuesta.read().decode('utf-8'))
        except urllib.error.HTTPError as error:
            if error.code != 429 and error.code < 500:
                raise
            ultimo = error
        except (urllib.error.URLError, TimeoutError) as error:
            ultimo = error
    raise RuntimeError(f'SoilGrids no respondió tras {len(ESPERAS_S)} reintentos: {ultimo}')


def convertir(valor, factor):
    """Pasa de unidades mapeadas (enteros) a unidades de destino. None se conserva."""
    return None if valor is None else round(valor / factor, 3)


def main() -> None:
    args = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    args.add_argument('--lat', type=float, required=True)
    args.add_argument('--lon', type=float, required=True)
    args.add_argument('--nombre', required=True, help='nombre corto del punto, p. ej. majes')
    args.add_argument('--salida', default=str(Path(__file__).resolve().parent.parent / 'muestras'))
    a = args.parse_args()

    url, datos = consultar(a.lat, a.lon)
    carpeta = Path(a.salida)
    carpeta.mkdir(parents=True, exist_ok=True)
    base = f'soilgrids_{a.nombre}'

    # 1) ORIGINAL del proveedor, sin tocar.
    (carpeta / f'{base}.original.json').write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding='utf-8')

    capas = {capa['name']: capa for capa in datos['properties']['layers']}
    unidades = {
        nombre: {
            'mapped_units': capa['unit_measure']['mapped_units'],
            'target_units': capa['unit_measure']['target_units'],
            'd_factor': capa['unit_measure']['d_factor'],
        } for nombre, capa in capas.items()
    }

    # 2) NORMALIZADO: una fila por propiedad y profundidad (el producto no tiene fechas).
    faltantes = {nombre: 0 for nombre in PROPIEDADES}
    resumen = []
    with (carpeta / f'{base}.normalizado.csv').open('w', newline='', encoding='utf-8') as archivo:
        escritor = csv.writer(archivo)
        escritor.writerow(['propiedad', 'profundidad', 'unidad', 'media', 'q05', 'q50', 'q95', 'incertidumbre (ratio)'])
        for nombre in PROPIEDADES:
            capa = capas.get(nombre)
            factor = unidades[nombre]['d_factor'] if capa else 1
            unidad = unidades[nombre]['target_units'] if capa else ''
            por_profundidad = {d['label']: d['values'] for d in capa['depths']} if capa else {}
            for profundidad in PROFUNDIDADES:
                valores = por_profundidad.get(profundidad, {})
                fila = [nombre, profundidad, unidad]
                for clave in VALORES:
                    convertido = convertir(valores.get(clave), factor)
                    if convertido is None:
                        faltantes[nombre] += 1
                        fila.append('')
                    else:
                        fila.append(convertido)
                escritor.writerow(fila)
                resumen.append(f'{nombre} {profundidad}: {fila[3] if fila[3] != "" else "sin dato"} {unidad}')

    # 3) PROCEDENCIA: lo necesario para repetir la consulta y explicar el dato.
    procedencia = {
        'source_id': 'ISRIC SoilGrids', 'product_id': 'SoilGrids 2.0, REST API properties/query',
        'api_version': '2.0', 'api_status': 'beta (per ISRIC SoilGrids access documentation)',
        'request_url': url, 'requested_at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'point': {'latitude': a.lat, 'longitude': a.lon},
        'geometry_returned_lon_lat': datos.get('geometry', {}).get('coordinates'),
        'properties': PROPIEDADES, 'depths': PROFUNDIDADES, 'values': VALORES,
        'units': unidades,
        'unit_conversion': 'normalized = mapped value / d_factor; uncertainty = (Q0.95 - Q0.05) / Q0.5, as a ratio',
        'missing_values': faltantes,
        'resolution': '250 m', 'query_time_s': datos.get('query_time_s'),
        'license': 'CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)',
        'citation': ('Poggio, L., de Sousa, L. M., Batjes, N. H., Heuvelink, G. B. M., Kempen, B., Ribeiro, E., '
                     'and Rossiter, D.: SoilGrids 2.0: producing soil information for the globe with quantified '
                     'spatial uncertainty, SOIL, 7, 217-240, 2021. https://doi.org/10.5194/soil-7-217-2021'),
        'data_policy': 'https://isric.org/about/data-policy',
        'note': 'Machine-learning prediction at 250 m with wide uncertainty; not an in-field soil analysis.',
        'generated_with': 'Script written with AI assistance (Claude Code).',
    }
    (carpeta / f'{base}.procedencia.json').write_text(json.dumps(procedencia, ensure_ascii=False, indent=1), encoding='utf-8')

    print('Medias: ' + ' | '.join(resumen))
    print(f'Faltantes por propiedad: {faltantes}')
    print(f'Archivos en {carpeta}: {base}.original.json, .normalizado.csv, .procedencia.json')


if __name__ == '__main__':
    main()

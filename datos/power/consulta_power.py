"""Consulta diaria a NASA POWER para un punto y la guarda como original + CSV normalizado.

Uso:
    python datos/power/consulta_power.py --lat -16.351 --lon -72.190 --inicio 20250101 --fin 20251231 --nombre majes

Solo usa la biblioteca estándar de Python. No necesita cuenta ni clave.
Documentación oficial: https://power.larc.nasa.gov/docs/services/api/temporal/daily/

Notas (ver datos/README.md):
- El valor corresponde a una celda de grilla regional (aprox. 0,5 x 0,625 grados para
  meteorología), NO a una medición dentro de la parcela.
- POWER marca los faltantes con un valor de relleno (fill_value, normalmente -999).
  Aquí se conservan como vacío en el CSV; nunca se convierten en cero.
- Código preparado con asistencia de IA (Claude Code). Hay que declararlo en la entrega.
"""
import argparse
import csv
import json
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = 'https://power.larc.nasa.gov/api/temporal/daily/point'
# Parámetros de la comunidad agroclimática (AG). Unidades según la respuesta del servicio.
PARAMETROS = ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR', 'RH2M', 'ALLSKY_SFC_SW_DWN']


def consultar(lat: float, lon: float, inicio: str, fin: str) -> tuple[str, dict]:
    consulta = urllib.parse.urlencode({
        'parameters': ','.join(PARAMETROS), 'community': 'AG',
        'latitude': lat, 'longitude': lon, 'start': inicio, 'end': fin, 'format': 'JSON',
    })
    url = f'{API}?{consulta}'
    peticion = urllib.request.Request(url, headers={'User-Agent': 'tarpu-qentara-hackathon'})
    with urllib.request.urlopen(peticion, timeout=60) as respuesta:
        return url, json.loads(respuesta.read().decode('utf-8'))


def main() -> None:
    args = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    args.add_argument('--lat', type=float, required=True)
    args.add_argument('--lon', type=float, required=True)
    args.add_argument('--inicio', required=True, help='AAAAMMDD')
    args.add_argument('--fin', required=True, help='AAAAMMDD')
    args.add_argument('--nombre', required=True, help='nombre corto del punto, p. ej. majes')
    args.add_argument('--salida', default=str(Path(__file__).resolve().parent.parent / 'muestras'))
    a = args.parse_args()

    url, datos = consultar(a.lat, a.lon, a.inicio, a.fin)
    carpeta = Path(a.salida)
    carpeta.mkdir(parents=True, exist_ok=True)
    base = f'power_{a.nombre}_{a.inicio}_{a.fin}'

    # 1) ORIGINAL del proveedor, sin tocar.
    (carpeta / f'{base}.original.json').write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding='utf-8')

    series = datos['properties']['parameter']
    relleno = datos['header'].get('fill_value', -999)
    unidades = {clave: datos['parameters'][clave]['units'] for clave in series}
    fechas = sorted(next(iter(series.values())).keys())

    # 2) NORMALIZADO: una fila por día; el faltante queda vacío.
    faltantes = {clave: 0 for clave in series}
    with (carpeta / f'{base}.normalizado.csv').open('w', newline='', encoding='utf-8') as archivo:
        escritor = csv.writer(archivo)
        escritor.writerow(['fecha'] + [f'{clave} ({unidades[clave]})' for clave in series])
        for fecha in fechas:
            fila = [f'{fecha[:4]}-{fecha[4:6]}-{fecha[6:]}']
            for clave in series:
                valor = series[clave][fecha]
                if valor == relleno:
                    faltantes[clave] += 1
                    fila.append('')
                else:
                    fila.append(valor)
            escritor.writerow(fila)

    # 3) PROCEDENCIA: lo necesario para repetir la consulta y explicar el dato.
    procedencia = {
        'source_id': 'NASA POWER', 'product_id': 'Daily Point API, community AG',
        'api_version': datos['header'].get('api', {}).get('version'),
        'request_url': url, 'requested_at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'point': {'latitude': a.lat, 'longitude': a.lon},
        'geometry_returned_lon_lat_elev_m': datos.get('geometry', {}).get('coordinates'),
        'observed_start': a.inicio, 'observed_end': a.fin, 'days': len(fechas),
        'units': unidades, 'fill_value': relleno, 'missing_days': faltantes,
        'sources': datos['header'].get('sources'),
        'note': 'Grid-cell regional estimate, not an in-field measurement.',
        'generated_with': 'Script written with AI assistance (Claude Code).',
    }
    (carpeta / f'{base}.procedencia.json').write_text(json.dumps(procedencia, ensure_ascii=False, indent=1), encoding='utf-8')

    print(f'{len(fechas)} días · faltantes por variable: {faltantes}')
    print(f'Unidades: {unidades}')
    print(f'Archivos en {carpeta}: {base}.original.json, .normalizado.csv, .procedencia.json')


if __name__ == '__main__':
    main()

"""Serie de NDVI MODIS (MOD13Q1) para un punto, con el servicio de ORNL; guarda original + CSV normalizado.

Uso:
    python datos/ndvi/consulta_ndvi.py --lat -16.351 --lon -72.190 --inicio 20150101 --fin 20261114 --nombre majes

Solo usa la biblioteca estándar de Python. No necesita cuenta ni clave.
Servicio: ORNL DAAC, MODIS/VIIRS Land Product Subsets (REST).
Documentación oficial: https://modis.ornl.gov/data/modis_webservice.html

Notas (ver datos/README.md):
- Un píxel de MOD13Q1 mide unos 231 m de lado: mezcla varias parcelas. Es la curva de verdor
  de la ZONA, no de una parcela. El NDVI no mide fertilidad.
- El servicio es inestable (502/503): se piden pocas fechas por vez y se reintenta (hasta 10 veces,
  con espera creciente de 120 s como máximo).
- Cada respuesta se guarda en disco apenas llega, en datos/ndvi/cache/<producto>_<nombre>_<inicio>_<fin>/.
  Si un bloque sigue fallando, el script sale con error; al relanzar el mismo comando reutiliza los
  bloques guardados y retoma donde quedó. Para pedir todo de nuevo, borra esa carpeta.
- Los valores de relleno o fuera del rango válido quedan vacíos en el CSV; nunca se convierten en cero.
  Un NDVI con baja confiabilidad (nubes, nieve) se conserva y se marca en la columna «calidad».
- Escrito con asistencia de IA (Claude Code). Hay que declararlo en la entrega.
"""
import argparse
import csv
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = 'https://modis.ornl.gov/rst/api/v1'
# Bandas por producto: NDVI y confiabilidad del píxel.
BANDAS = {
    'MOD13Q1': {'ndvi': '250m_16_days_NDVI', 'calidad': '250m_16_days_pixel_reliability', 'version': '061'},
    'VNP13A1': {'ndvi': '500_m_16_days_NDVI', 'calidad': '500_m_16_days_pixel_reliability', 'version': '002'},
}
# Significado de pixel_reliability según la guía de usuario de MOD13.
CALIDAD = {0: 'bueno', 1: 'marginal', 2: 'nieve o hielo', 3: 'nubes'}
FECHAS_POR_PETICION = 10
REINTENTOS = 10
ESPERA_MAX_S = 120
CACHE_RAIZ = Path(__file__).resolve().parent / 'cache'
# Archivos de la caché que no son bloques de subset (empiezan por «_»).
MANIFIESTO, CACHE_BANDAS, CACHE_FECHAS = '_manifiesto.json', '_bands.json', '_dates.json'


class BloqueFallido(Exception):
    """Una petición no se pudo completar tras los reintentos (o devolvió un error 4xx)."""

    def __init__(self, url: str, motivo: str) -> None:
        super().__init__(f'{motivo} en {url}')
        self.url, self.motivo = url, motivo


class Cliente:
    """Peticiones GET con reintentos; cuenta los reintentos para la procedencia."""

    def __init__(self) -> None:
        self.reintentos = 0

    def get(self, ruta: str, parametros: dict | None = None) -> tuple[str, dict]:
        url = f'{API}/{ruta}' + (f'?{urllib.parse.urlencode(parametros)}' if parametros else '')
        peticion = urllib.request.Request(url, headers={'Accept': 'application/json', 'User-Agent': 'tarpu-qentara-hackathon'})
        for intento in range(REINTENTOS + 1):
            try:
                with urllib.request.urlopen(peticion, timeout=120) as respuesta:
                    return url, json.loads(respuesta.read().decode('utf-8'))
            except urllib.error.HTTPError as error:
                motivo = f'HTTP {error.code}'
                if error.code < 500:
                    raise BloqueFallido(url, motivo)
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
                motivo = type(error).__name__
            if intento == REINTENTOS:
                raise BloqueFallido(url, f'{motivo} tras {REINTENTOS} reintentos')
            self.reintentos += 1
            espera = min(2 ** (intento + 1), ESPERA_MAX_S)
            print(f'  {motivo}; reintento {intento + 1}/{REINTENTOS} en {espera} s')
            time.sleep(espera)
        raise AssertionError('inalcanzable')


class Cache:
    """Guarda cada respuesta en disco apenas llega y la reutiliza al relanzar con los mismos argumentos."""

    def __init__(self, carpeta: Path, clave: dict) -> None:
        self.carpeta = carpeta
        self.carpeta.mkdir(parents=True, exist_ok=True)
        self.desde_cache = 0
        self.pedidos = 0
        ruta = carpeta / MANIFIESTO
        if ruta.exists():
            try:
                manifiesto = json.loads(ruta.read_text(encoding='utf-8'))
            except json.JSONDecodeError:
                raise SystemExit(f'El manifiesto de la caché está dañado: borra {carpeta} y relanza.')
            if manifiesto.get('clave') != clave:
                raise SystemExit(
                    f'La caché {carpeta} es de otra consulta ({manifiesto.get("clave")}); '
                    f'esta pide {clave}. Usa otro --nombre o borra esa carpeta.')
            self.manifiesto = manifiesto
        else:
            self.manifiesto = {'clave': clave, 'retries': 0}
            self._escribir(MANIFIESTO, self.manifiesto)

    def _escribir(self, nombre: str, contenido: dict) -> None:
        # Escritura atómica: un corte a mitad no deja un archivo a medias.
        temporal = self.carpeta / f'{nombre}.tmp'
        temporal.write_text(json.dumps(contenido, ensure_ascii=False), encoding='utf-8')
        os.replace(temporal, self.carpeta / nombre)

    def obtener(self, nombre: str, cliente: Cliente, ruta: str, parametros: dict | None = None,
                es_bloque: bool = False) -> dict:
        """Devuelve {'request_url', 'response'} desde la caché o desde el servicio (y lo guarda)."""
        archivo = self.carpeta / nombre
        if archivo.exists():
            try:
                guardado = json.loads(archivo.read_text(encoding='utf-8'))
                if 'request_url' in guardado and 'response' in guardado:
                    if es_bloque:
                        self.desde_cache += 1
                    return guardado
            except json.JSONDecodeError:
                pass
            print(f'  {nombre} de la caché está dañado; se vuelve a pedir')
            archivo.unlink()
        url, datos = cliente.get(ruta, parametros)
        guardado = {'request_url': url, 'response': datos}
        self._escribir(nombre, guardado)
        if es_bloque:
            self.pedidos += 1
        return guardado

    def bloques_guardados(self) -> int:
        return sum(1 for p in self.carpeta.glob('*.json') if not p.name.startswith('_'))

    def sumar_reintentos(self, reintentos: int) -> int:
        """Acumula los reintentos de esta ejecución en el manifiesto y devuelve el total."""
        self.manifiesto['retries'] = self.manifiesto.get('retries', 0) + reintentos
        self._escribir(MANIFIESTO, self.manifiesto)
        return self.manifiesto['retries']


def consultar(cliente: Cliente, cache: Cache, progreso: dict, producto: str, lat: float, lon: float,
              inicio: str, fin: str) -> dict:
    """Devuelve todas las respuestas del proveedor, sin tocar, con su URL."""
    punto = {'latitude': lat, 'longitude': lon}
    bandas = cache.obtener(CACHE_BANDAS, cliente, f'{producto}/bands')
    fechas = cache.obtener(CACHE_FECHAS, cliente, f'{producto}/dates', punto)

    desde, hasta = f'{inicio[:4]}-{inicio[4:6]}-{inicio[6:]}', f'{fin[:4]}-{fin[4:6]}-{fin[6:]}'
    elegidas = [f['modis_date'] for f in fechas['response']['dates'] if desde <= f['calendar_date'] <= hasta]
    if not elegidas:
        raise SystemExit('No hay fechas del producto en ese período.')

    tramos = [elegidas[i:i + FECHAS_POR_PETICION] for i in range(0, len(elegidas), FECHAS_POR_PETICION)]
    progreso['total'] = 2 * len(tramos)
    bloques = []
    for banda in (BANDAS[producto]['ndvi'], BANDAS[producto]['calidad']):
        for tramo in tramos:
            print(f'{banda}: {tramo[0]} a {tramo[-1]}')
            bloques.append(cache.obtener(f'{banda}_{tramo[0]}_{tramo[-1]}.json', cliente, f'{producto}/subset', {
                **punto, 'band': banda, 'startDate': tramo[0], 'endDate': tramo[-1],
                'kmAboveBelow': 0, 'kmLeftRight': 0,
            }, es_bloque=True))

    return {
        'bands': bandas,
        'dates': fechas,
        'subsets': bloques,
        'selected_dates': elegidas,
    }


def main() -> None:
    args = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    args.add_argument('--lat', type=float, required=True)
    args.add_argument('--lon', type=float, required=True)
    args.add_argument('--inicio', required=True, help='AAAAMMDD')
    args.add_argument('--fin', required=True, help='AAAAMMDD')
    args.add_argument('--nombre', required=True, help='nombre corto del punto, p. ej. majes')
    args.add_argument('--producto', default='MOD13Q1', choices=sorted(BANDAS))
    args.add_argument('--salida', default=str(Path(__file__).resolve().parent.parent / 'muestras'))
    a = args.parse_args()

    cliente = Cliente()
    carpeta_cache = CACHE_RAIZ / f'{a.producto}_{a.nombre}_{a.inicio}_{a.fin}'
    cache = Cache(carpeta_cache, {
        'product': a.producto, 'latitude': a.lat, 'longitude': a.lon, 'start': a.inicio, 'end': a.fin,
    })
    progreso: dict = {}
    try:
        original = consultar(cliente, cache, progreso, a.producto, a.lat, a.lon, a.inicio, a.fin)
    except BloqueFallido as error:
        total = progreso.get('total')
        print(f'\nNo se pudo obtener una respuesta del servicio: {error.motivo}.\n  {error.url}')
        print(f'Bloques guardados: {cache.bloques_guardados()} de {total if total else "? (aún sin lista de fechas)"} '
              f'en {carpeta_cache}.')
        print('Relanza el mismo comando para retomar donde quedó.')
        raise SystemExit(1)
    finally:
        reintentos_totales = cache.sumar_reintentos(cliente.reintentos)

    # Metadatos de cada banda tomados del propio servicio, no fijados en el código.
    meta = {b['band']: b for b in original['bands']['response']['bands']}
    banda_ndvi, banda_cal = BANDAS[a.producto]['ndvi'], BANDAS[a.producto]['calidad']

    def rango(banda: str) -> tuple[float, float]:
        minimo, maximo = meta[banda]['valid_range'].split(' to ')
        return float(minimo), float(maximo)

    escala = float(meta[banda_ndvi].get('scale_factor', 1))
    relleno_ndvi, relleno_cal = float(meta[banda_ndvi]['fill_value']), float(meta[banda_cal]['fill_value'])
    rango_ndvi, rango_cal = rango(banda_ndvi), rango(banda_cal)

    # Unir los bloques por fecha.
    filas: dict[str, dict] = {}
    teselas, celda = set(), None
    for bloque in original['subsets']:
        respuesta = bloque['response']
        celda = respuesta.get('cellsize', celda)
        for registro in respuesta['subset']:
            fila = filas.setdefault(registro['modis_date'], {'fecha': registro['calendar_date']})
            fila[registro['band']] = registro['data'][0] if registro['data'] else None
            teselas.add(registro.get('tile'))

    # NORMALIZADO: una fila por fecha; el faltante queda vacío.
    faltantes = {'NDVI': 0, 'pixel_reliability': 0}
    por_calidad = {nombre: 0 for nombre in CALIDAD.values()}
    for modis_date in original['selected_dates']:
        filas.setdefault(modis_date, {'fecha': None})
    salida_filas = []
    for modis_date in sorted(filas, key=lambda d: (d[1:5], d[5:])):
        fila = filas[modis_date]
        crudo_ndvi, crudo_cal = fila.get(banda_ndvi), fila.get(banda_cal)
        if crudo_ndvi is None or crudo_ndvi == relleno_ndvi or not rango_ndvi[0] <= crudo_ndvi <= rango_ndvi[1]:
            ndvi = ''
            faltantes['NDVI'] += 1
        else:
            ndvi = round(crudo_ndvi * escala, 4)
        if crudo_cal is None or crudo_cal == relleno_cal or not rango_cal[0] <= crudo_cal <= rango_cal[1]:
            confiabilidad, calidad = '', ''
            faltantes['pixel_reliability'] += 1
        else:
            confiabilidad = int(crudo_cal)
            calidad = CALIDAD.get(confiabilidad, '')
            if calidad:
                por_calidad[calidad] += 1
        salida_filas.append([fila['fecha'] or '', modis_date, ndvi, confiabilidad, calidad])

    carpeta = Path(a.salida)
    carpeta.mkdir(parents=True, exist_ok=True)
    base = f'{a.producto.lower()}-ndvi_{a.nombre}_{a.inicio}_{a.fin}'

    # 1) ORIGINAL del proveedor, sin tocar (todas las respuestas, con su URL).
    (carpeta / f'{base}.original.json').write_text(json.dumps(original, ensure_ascii=False, indent=1), encoding='utf-8')

    # 2) NORMALIZADO.
    with (carpeta / f'{base}.normalizado.csv').open('w', newline='', encoding='utf-8') as archivo:
        escritor = csv.writer(archivo)
        escritor.writerow(['fecha', 'modis_date', 'NDVI (sin unidad)', 'pixel_reliability (rank 0-3)', 'calidad'])
        escritor.writerows(salida_filas)

    # 3) PROCEDENCIA: lo necesario para repetir la consulta y explicar el dato.
    procedencia = {
        'source_id': 'ORNL DAAC MODIS/VIIRS Land Product Subsets',
        'product_id': a.producto, 'product_version': BANDAS[a.producto]['version'],
        'bands': {
            banda_ndvi: {k: meta[banda_ndvi].get(k) for k in ('units', 'valid_range', 'fill_value', 'scale_factor', 'add_offset')},
            banda_cal: {k: meta[banda_cal].get(k) for k in ('units', 'valid_range', 'fill_value')},
        },
        'quality_meaning': {str(k): v for k, v in CALIDAD.items()},
        'request_base': f'{API}/{a.producto}/subset', 'requests': len(original['subsets']) + 2,
        'retries': reintentos_totales, 'retries_this_run': cliente.reintentos,
        'blocks_from_cache': cache.desde_cache, 'blocks_fetched': cache.pedidos,
        'cache_dir': str(carpeta_cache),
        'requested_at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'point': {'latitude': a.lat, 'longitude': a.lon},
        'cellsize_m': celda, 'tiles': sorted(t for t in teselas if t),
        'observed_start': a.inicio, 'observed_end': a.fin,
        'first_date': salida_filas[0][0], 'last_date': salida_filas[-1][0],
        'dates_requested': len(original['selected_dates']), 'dates_returned': len(salida_filas),
        'missing': faltantes, 'count_by_quality': por_calidad,
        'note': 'Single 250 m MODIS pixel: mixes several fields; describes the area, not one plot. '
                'NDVI is a greenness index, not a measure of soil fertility.',
        'generated_with': 'Script written with AI assistance (Claude Code).',
    }
    (carpeta / f'{base}.procedencia.json').write_text(json.dumps(procedencia, ensure_ascii=False, indent=1), encoding='utf-8')

    print(f'{len(salida_filas)} fechas · faltantes: {faltantes} · calidad: {por_calidad} · '
          f'reintentos: {reintentos_totales} (esta ejecución: {cliente.reintentos}) · '
          f'bloques de la caché: {cache.desde_cache}, pedidos: {cache.pedidos}')
    print(f'Archivos en {carpeta}: {base}.original.json, .normalizado.csv, .procedencia.json')


if __name__ == '__main__':
    main()

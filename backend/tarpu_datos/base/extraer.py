"""Base de Arequipa (capa 1 del esquema mixto, DT-22): datos generales de toda la región, dentro del backend.

Fuentes y qué guarda (nivel «original» del proveedor, sin convertir; la conversión va en la procedencia):
    soilgrids  ISRIC SoilGrids 2.0 por WCS: 11 propiedades x 3 profundidades x (mean, Q0.05, Q0.95), GeoTIFF de la caja.
    gaez       FAO GAEZ v4 (res05): índice de aptitud de 15 cultivos, 1981-2010, insumos altos, GeoTIFF de la caja.
    power      NASA POWER diario, 19 variables, 2015-2025, una consulta por celda de 0,5° x 0,625° que toca la caja.
    nasadem    NASADEM_HGT v001 (30 m): las teselas de 1° x 1° de la caja (lista pública de CMR; descarga con Earthdata).
    cenagro    IV CENAGRO 2012 (INEI): copia los CSV de Arequipa del zip de datos abiertos.

Caja: lon -75.5 a -70.5, lat -17.5 a -14.5 (rectángulo que contiene Arequipa; el recorte al límite oficial va en la
carga a la base de datos, cuando se tenga ese límite). Todo es reanudable: lo que ya está completo no se vuelve a pedir.

Uso (desde backend/):
    python -m tarpu_datos.base.extraer soilgrids | gaez | power | nasadem | estado
    python -m tarpu_datos.base.extraer cenagro --zip RUTA/2012.zip
    python -m tarpu_datos.base.extraer power --actualizar     (vuelve a pedir hasta ayer; lo usa actualizar.py)
Datos en backend/almacen/base_arequipa/ (git lo ignora); manifiesto en backend/catalogo/base_arequipa.json (sí se sube).
Origen: trabajo/T02-base-arequipa (15/11/2026). Solo biblioteca estándar.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import argparse
import http.cookiejar
import json
import os
import sys
from datetime import datetime, timedelta, timezone
import time
import urllib.parse
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from ..fuentes import gaez as t01_gaez
from ..fuentes import power as t01_power
from ..fuentes.cliente import Cache, PeticionFallida, Servicio, ahora_iso, escribir_atomico, log

BACKEND = Path(__file__).resolve().parent.parent.parent
RAIZ = BACKEND.parent
SALIDA = BACKEND / 'almacen' / 'base_arequipa'
CACHE = BACKEND / 'almacen' / 'cache' / 'base_arequipa'
MANIFIESTO = BACKEND / 'catalogo' / 'base_arequipa.json'
CAJA = {'oeste': -75.5, 'sur': -17.5, 'este': -70.5, 'norte': -14.5}
CAJA_TXT = f"lon {CAJA['oeste']} a {CAJA['este']}, lat {CAJA['sur']} a {CAJA['norte']}"

SG_WCS = 'https://maps.isric.org/mapserv'
SG_PROPIEDADES = ['phh2o', 'clay', 'sand', 'silt', 'soc', 'nitrogen', 'cec', 'bdod', 'cfvo', 'wv0033', 'wv1500']
SG_PROFUNDIDADES = ['0-5cm', '5-15cm', '15-30cm']
SG_VALORES = ['mean', 'Q0.05', 'Q0.95']
POWER_INICIO = '2015-01-01'  # el fin es siempre ayer (UTC); POWER recorta lo que aún no publica
CMR = 'https://cmr.earthdata.nasa.gov/search/granules.json'


# ------------------------------------------------------------------ manifiesto
def _manifiesto() -> dict:
    return json.loads(MANIFIESTO.read_text(encoding='utf-8')) if MANIFIESTO.exists() else {}


def _anotar(fuente: str, datos: dict) -> None:
    m = _manifiesto()
    m[fuente] = {**m.get(fuente, {}), **datos, 'actualizado': ahora_iso()}
    escribir_atomico(MANIFIESTO, json.dumps(m, ensure_ascii=False, indent=1))


def _bajar_archivo(servicio: Servicio, url: str, destino: Path, *, timeout: float = 300) -> str:
    """Baja a `destino` de forma atómica. Devuelve 'ya_estaba', 'bajado' o el motivo del fallo."""
    if destino.exists() and destino.stat().st_size > 0:
        return 'ya_estaba'
    try:
        escribir_atomico(destino, servicio.get(url, timeout=timeout, accept='*/*', esperas=(5, 15, 45, 120),
                                               etiqueta=destino.name))
        return 'bajado'
    except PeticionFallida as e:
        return f'fallo: {e.motivo[:300]}'


def _en_paralelo(tareas: list, funcion, hilos: int, etiqueta: str) -> dict:
    resultados, hechas, t0 = {}, 0, time.monotonic()
    with ThreadPoolExecutor(hilos) as ex:
        futuros = {ex.submit(funcion, t): t for t in tareas}
        for f in as_completed(futuros):
            clave, estado = f.result()
            resultados[clave] = estado
            hechas += 1
            if hechas % 10 == 0 or hechas == len(tareas):
                log(f'{etiqueta}: {hechas}/{len(tareas)} en {time.monotonic() - t0:.0f} s')
    return resultados


# ------------------------------------------------------------------ SoilGrids
def soilgrids(hilos: int, valores: list[str]) -> None:
    carpeta = SALIDA / 'soilgrids'
    servicio = Servicio('SoilGrids WCS', hilos)
    coberturas = [f'{p}_{d}_{v}' for p in SG_PROPIEDADES for d in SG_PROFUNDIDADES for v in valores]

    def url(cob: str) -> str:
        partes = [('map', f'/map/{cob.split("_")[0]}.map'), ('SERVICE', 'WCS'), ('VERSION', '2.0.1'),
                  ('REQUEST', 'GetCoverage'), ('COVERAGEID', cob), ('FORMAT', 'image/tiff'),
                  ('SUBSET', f"long({CAJA['oeste']},{CAJA['este']})"), ('SUBSET', f"lat({CAJA['sur']},{CAJA['norte']})"),
                  ('SUBSETTINGCRS', 'http://www.opengis.net/def/crs/EPSG/0/4326'),
                  ('OUTPUTCRS', 'http://www.opengis.net/def/crs/EPSG/0/4326')]
        return f'{SG_WCS}?' + urllib.parse.urlencode(partes, safe='/(),:')

    def una(cob: str):
        return cob, _bajar_archivo(servicio, url(cob), carpeta / f'{cob}.tif')

    res = _en_paralelo(coberturas, una, hilos, 'SoilGrids')
    fallos = {k: v for k, v in res.items() if v.startswith('fallo')}
    _anotar('soilgrids', {
        'fuente': 'ISRIC SoilGrids 2.0, WCS 2.0.1 GetCoverage', 'url_base': SG_WCS, 'caja': CAJA_TXT, 'crs': 'EPSG:4326',
        'resolucion': '≈ 250 m (0,00225°)', 'coberturas': len(coberturas), 'completas': len(coberturas) - len(fallos),
        'fallos': fallos, 'carpeta': 'almacen/base_arequipa/soilgrids/', 'ejemplo_url': url(coberturas[0]),
        'nivel': 'remuestreado por el proveedor: el WCS reproyecta de Homolosine a EPSG:4326 en una malla que ajusta a la caja (0,00226° x 0,00239°). Valores: enteros mapeados, sin convertir',
        'diferencia_con_el_punto': '15/11/2026: en un punto, el valor puede ser el de un píxel vecino del nativo. Majes riego, 0-5 cm: pH 82 (nativo 81) y arcilla 80 (nativo 98, 9,8 %); Chivay: pH 69 (igual), arcilla 190 (nativo 180). El valor nativo de un punto se obtiene con la consulta por punto de T01 (1 píxel, igual a la REST)',
        'conversion': 'valor = entero / d_factor; los d_factor y las unidades están en la procedencia de T01 '
                      '(tarpu_datos/soilgrids.py; procedencias de T01 en trabajo/T01-paquete-extraccion/salida/soilgrids_*.procedencia.json, campo units)',
        'cita': 'Poggio, L. et al. (2021). SoilGrids 2.0. SOIL 7, 217-240.',
        'medido': '15/11/2026: pH 0-5 cm de toda la caja en 3,1 s (2212 x 1255 píxeles, 590 KB)'})
    log(f'SoilGrids: {len(coberturas) - len(fallos)} de {len(coberturas)} completas' + (f'; fallos: {list(fallos)}' if fallos else ''))


# ------------------------------------------------------------------ GAEZ
def gaez(hilos: int) -> None:
    carpeta = SALIDA / 'gaez'
    servicio = Servicio('GAEZ', hilos)
    consulta = t01_gaez._consulta_capas(Cache(CACHE / 'gaez'), servicio, t01_gaez.CULTIVOS)
    capas = [c['attributes'] for c in consulta['response'].get('features', [])
             if str(c['attributes'].get('variable', '')).lower().startswith('suitability index')]
    ancho = round((CAJA['este'] - CAJA['oeste']) / (1 / 12))
    alto = round((CAJA['norte'] - CAJA['sur']) / (1 / 12))

    def url(oid: int) -> str:
        return f'{t01_gaez.API}/exportImage?' + urllib.parse.urlencode({
            'bbox': f"{CAJA['oeste']},{CAJA['sur']},{CAJA['este']},{CAJA['norte']}", 'bboxSR': 4326, 'imageSR': 4326,
            'size': f'{ancho},{alto}', 'format': 'tiff', 'pixelType': 'S32', 'interpolation': 'RSP_NearestNeighbor',
            'mosaicRule': json.dumps({'mosaicMethod': 'esriMosaicLockRaster', 'lockRasterIds': [oid]}), 'f': 'image'})

    def una(capa: dict):
        nombre = f"{capa['objectid']}_{capa['crop']}_{capa['water_supply']}_{capa['name']}".replace(' ', '-').replace('/', '-')
        return nombre, _bajar_archivo(servicio, url(capa['objectid']), carpeta / f'{nombre}.tif')

    res = _en_paralelo(capas, una, hilos, 'GAEZ')
    fallos = {k: v for k, v in res.items() if v.startswith('fallo')}
    escribir_atomico(carpeta / '_capas.json', json.dumps(capas, ensure_ascii=False, indent=1))
    _anotar('gaez', {
        'fuente': 'FAO GAEZ v4, ImageServer res05 (exportImage con esriMosaicLockRaster)', 'url_base': t01_gaez.API,
        'caja': CAJA_TXT, 'crs': 'EPSG:4326', 'resolucion': '0,0833° (≈ 9 km), tamaño de celda nativo',
        'periodo': t01_gaez.PERIODO, 'insumos': t01_gaez.INSUMOS, 'cultivos': t01_gaez.CULTIVOS,
        'capas': len(capas), 'completas': len(capas) - len(fallos), 'fallos': fallos, 'carpeta': 'almacen/base_arequipa/gaez/',
        'filtro': "solo capas cuyo 'variable' empieza por 'Suitability index' (igual que T01)",
        'nivel': 'original: índice 0-10 000 del proveedor', 'ejemplo_url': url(capas[0]['objectid']) if capas else None,
        'medido': '15/11/2026: exportImage de la caja (60 x 36 celdas) en 3,4 s; valores iguales a identify en Majes '
                  'riego (3333 y 5556) y Chivay (0)',
        'cita': 'FAO GAEZ v4, https://gaez.fao.org/ (texto exacto de cita y licencia pendiente, igual que T01)'})
    log(f'GAEZ: {len(capas) - len(fallos)} de {len(capas)} capas completas')


# ------------------------------------------------------------------ POWER
def _centros_power() -> list[tuple[float, float]]:
    """Centros de las celdas de 0,5° (lat) x 0,625° (lon) de POWER (MERRA-2) cuya celda toca la caja."""
    lats, lons = [], []
    lat = -90.0
    while lat <= 90:
        if CAJA['sur'] - 0.25 < lat < CAJA['norte'] + 0.25:
            lats.append(round(lat, 4))
        lat += 0.5
    lon = -180.0
    while lon < 180:
        if CAJA['oeste'] - 0.3125 < lon < CAJA['este'] + 0.3125:
            lons.append(round(lon, 4))
        lon += 0.625
    return [(a, o) for a in lats for o in lons]


def power(hilos: int, actualizar: bool = False) -> None:
    carpeta = SALIDA / 'power'
    servicio = Servicio('POWER', hilos)
    centros = _centros_power()

    def una(centro):
        lat, lon = centro
        nombre = f'celda_{lat:+.3f}_{lon:+.3f}'.replace('+', 'p').replace('-', 'm').replace('.', '_')
        if not actualizar and (carpeta / f'power_{nombre}.normalizado.csv').exists():
            return nombre, 'ya_estaba'
        r = t01_power.obtener(lat=lat, lon=lon, salida=str(carpeta), cache=str(CACHE / 'power'),
                              inicio=POWER_INICIO, nombre=nombre, servicio=servicio, archivo_base=f'power_{nombre}')
        return nombre, r['estado'] + (f": {r.get('motivo', '')[:200]}" if r.get('motivo') else '')

    res = _en_paralelo(centros, una, hilos, 'POWER')
    fallos = {k: v for k, v in res.items() if v not in ('ya_estaba', 'listo')}
    _anotar('power', {
        'fuente': 'NASA POWER, Daily Point API, community AG (tarpu_datos/power.py)',
        'variables': t01_power.PARAMETROS, 'periodo': f'{POWER_INICIO} hasta el último día publicado (ver cada procedencia)',
        'caja': CAJA_TXT, 'actualizacion': 'actualizar.py la vuelve a pedir según su período',
        'malla': 'una consulta en el centro de cada celda de 0,5° x 0,625° que toca la caja (las de radiación son de 1° x 1°)',
        'celdas': len(centros), 'estados': res, 'posibles_fallos': fallos, 'carpeta': 'almacen/base_arequipa/power/',
        'nota': 'Cada procedencia guarda la elevación de la celda que devolvió POWER (cell_elevation_m). Las celdas sobre el mar (elevación 0) vuelven «parcial»: POWER no da GWETROOT, GWETPROF, TSOIL1, TSOIL2 ni EVLAND sobre el mar (11 celdas el 15/11/2026).',
        'nivel': 'original (JSON de POWER), normalizado (CSV) y procedencia, igual que T01'})
    log(f'POWER: {len(centros)} celdas; revisar estados en manifiesto.json')


# ------------------------------------------------------------------ NASADEM
def _credenciales() -> tuple[str, str]:
    valores = {}
    env = RAIZ / 'backend' / '.env'
    if env.exists():
        for linea in env.read_text(encoding='utf-8').splitlines():
            if '=' in linea and not linea.strip().startswith('#'):
                k, v = linea.split('=', 1)
                valores[k.strip()] = v.strip()
    u = os.environ.get('EARTHDATA_USERNAME') or valores.get('EARTHDATA_USERNAME')
    c = os.environ.get('EARTHDATA_PASSWORD') or valores.get('EARTHDATA_PASSWORD')
    if not u or not c:
        raise SystemExit('Faltan EARTHDATA_USERNAME y EARTHDATA_PASSWORD en backend/.env (ver trabajo/README.md).')
    return u, c


def nasadem(hilos: int) -> None:
    carpeta = SALIDA / 'nasadem'
    carpeta.mkdir(parents=True, exist_ok=True)
    lista_url = CMR + '?' + urllib.parse.urlencode({
        'short_name': 'NASADEM_HGT', 'version': '001', 'page_size': 100,
        'bounding_box': f"{CAJA['oeste']},{CAJA['sur']},{CAJA['este']},{CAJA['norte']}"})
    granulos = json.loads(urllib.request.urlopen(urllib.request.Request(lista_url, headers={'User-Agent': 'tarpu-qentara-hackathon'}),
                                                 timeout=120).read())['feed']['entry']
    teselas = [{'titulo': g['title'], 'mb': float(g.get('granule_size', 0)),
                'url': next(l['href'] for l in g['links'] if l['href'].endswith('.zip') and l['href'].startswith('https'))}
               for g in granulos]
    usuario, clave = _credenciales()
    # Método de NASA para Earthdata con urllib: autenticación básica ante urs.earthdata.nasa.gov + cookies.
    gestor = urllib.request.HTTPPasswordMgrWithDefaultRealm()
    gestor.add_password(None, 'https://urs.earthdata.nasa.gov', usuario, clave)
    abridor = urllib.request.build_opener(urllib.request.HTTPBasicAuthHandler(gestor),
                                          urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

    def zip_valido(ruta: Path) -> bool:
        try:
            with zipfile.ZipFile(ruta) as z:
                return z.testzip() is None
        except (zipfile.BadZipFile, OSError):
            return False

    def una(t: dict):
        destino = carpeta / Path(urllib.parse.urlparse(t['url']).path).name
        if destino.exists() and zip_valido(destino):
            return t['titulo'], 'ya_estaba'
        for espera in (0, 10, 30, 90):
            time.sleep(espera)
            try:
                with abridor.open(urllib.request.Request(t['url'], headers={'User-Agent': 'tarpu-qentara-hackathon'}), timeout=600) as r:
                    escribir_atomico(destino, r.read())
                if zip_valido(destino):
                    return t['titulo'], 'bajado'
                destino.unlink(missing_ok=True)
            except Exception as e:  # noqa: BLE001 - se reintenta y se anota
                motivo = f'{type(e).__name__}: {e}'
        return t['titulo'], f'fallo: {motivo[:300]}'

    res = _en_paralelo(teselas, una, hilos, 'NASADEM')
    _anotar('nasadem', {
        'fuente': 'NASADEM_HGT v001 (LP DAAC), teselas de 1° x 1° a 1 segundo de arco (≈ 30 m)', 'lista': lista_url,
        'caja': CAJA_TXT, 'teselas': len(teselas), 'mb_total_cmr': round(sum(t['mb'] for t in teselas), 1),
        'estados': res, 'carpeta': 'almacen/base_arequipa/nasadem/',
        'nivel': 'original: zip del proveedor con el .hgt (enteros de 16 bits, metros)',
        'derivado_pendiente': 'pendiente (método de Horn) y su clase FAO 2006: se calculan al cargar a la base de datos',
        'medido': '15/11/2026: CMR lista 20 teselas para la caja, 227,4 MB en total'})
    log(f'NASADEM: {sum(1 for v in res.values() if not v.startswith("fallo"))} de {len(teselas)} teselas')


# ------------------------------------------------------------------ CENAGRO
def cenagro(ruta_zip: str) -> None:
    carpeta = SALIDA / 'cenagro2012'
    copiados = []
    with zipfile.ZipFile(ruta_zip) as z:
        for nombre in z.namelist():
            if nombre.startswith('2012/Arequipa/') and nombre.lower().endswith(('.csv', '.pdf')) and 'Muestra' not in nombre:
                destino = carpeta / Path(nombre).parent.name / Path(nombre).name
                if not destino.exists():
                    escribir_atomico(destino, z.read(nombre))
                copiados.append(str(destino.relative_to(SALIDA)))
    _anotar('cenagro', {
        'fuente': 'INEI, IV Censo Nacional Agropecuario 2012, datos abiertos (2012.zip)',
        'url': 'https://www.inei.gob.pe/media/DATOS_ABIERTOS/CENAGRO/DATA_NEW/2012.zip',
        'archivos': copiados, 'carpeta': 'almacen/base_arequipa/cenagro2012/',
        'nota': 'REC01 trae la ubicación (LAT_DECI, LONG_DECI), la altitud (WALTITUD) y el piso (WPISO) de cada unidad agropecuaria.'})
    log(f'CENAGRO: {len(copiados)} archivos de Arequipa')


def estado() -> None:
    m = _manifiesto()
    if not m:
        print('Todavía no se bajó nada.')
    for fuente, d in m.items():
        resumen = {k: d[k] for k in ('coberturas', 'capas', 'celdas', 'teselas', 'completas') if k in d}
        print(f'{fuente:<10} {resumen} · actualizado {d.get("actualizado")}')


def main() -> int:
    a = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = a.add_subparsers(dest='comando', required=True)
    s = sub.add_parser('soilgrids')
    s.add_argument('--hilos', type=int, default=4)
    s.add_argument('--valores', nargs='+', default=SG_VALORES, help='mean Q0.05 Q0.95 (por defecto, los tres)')
    for nombre, hilos in (('gaez', 4), ('power', 3), ('nasadem', 3)):
        x = sub.add_parser(nombre)
        x.add_argument('--hilos', type=int, default=hilos)
        if nombre == 'power':
            x.add_argument('--actualizar', action='store_true', help='vuelve a pedir todas las celdas hasta ayer')
    c = sub.add_parser('cenagro')
    c.add_argument('--zip', required=True, help='ruta al 2012.zip de datos abiertos del INEI')
    sub.add_parser('estado')
    args = a.parse_args()
    SALIDA.mkdir(parents=True, exist_ok=True)
    if args.comando == 'soilgrids':
        soilgrids(args.hilos, args.valores)
    elif args.comando == 'gaez':
        gaez(args.hilos)
    elif args.comando == 'power':
        power(args.hilos, args.actualizar)
    elif args.comando == 'nasadem':
        nasadem(args.hilos)
    elif args.comando == 'cenagro':
        cenagro(args.zip)
    else:
        estado()
    return 0


if __name__ == '__main__':
    sys.exit(main())

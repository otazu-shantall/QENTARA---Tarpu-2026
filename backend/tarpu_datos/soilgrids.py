"""ISRIC SoilGrids 2.0 por WCS: 11 propiedades x 3 profundidades x 5 valores, en un punto.

- Una petición WCS por capa (GeoTIFF de unos 2 x 2 píxeles); se leen con un lector TIFF propio
  (struct + zlib), sin dependencias. Verificado el 15/11/2026: el WCS lo entrega con compresión
  Deflate (8), no sin comprimir como decía el README de T01. Se elige el píxel que contiene el punto (ModelTiepoint y
  ModelPixelScale del GeoTIFF); los 4 valores leídos se guardan en el original.
- El WCS da enteros "mapeados". El factor de conversión (d_factor) y las unidades se LEEN de la
  API REST (unit_measure); nunca se fijan en el código. Se siembran desde las procedencias REST ya
  guardadas por el área de datos (datos/muestras/soilgrids_*.procedencia.json) y lo que falte se
  pide en UNA consulta REST. Si la REST falla, esas capas quedan vacías y el estado es «parcial».
- «uncertainty»: el factor y la unidad no están verificados en la documentación del proveedor; se
  guarda el entero en el original y en el formato largo, y la columna del normalizado queda vacía.
- Normalizado: UNA fila con «fecha» vacía (el suelo no tiene serie temporal; esa columna existe
  solo porque el lector del backend la exige). El formato largo va aparte en <base>.largo.csv.
- Predicciones de aprendizaje automático a 250 m, con incertidumbre amplia: no es un análisis de suelo.
Licencia CC BY 4.0. Cita: Poggio et al. (2021), SOIL 7, 217-240.
Modelo: datos/soilgrids/consulta_soilgrids.py.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import base64
import json
import math
import struct
import urllib.parse
import zlib
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from .cliente import (Cache, PeticionFallida, Progreso, Servicio, ahora_iso, clave_punto,
                      escribir_atomico, escribir_csv, escribir_tres, log, resultado)

WCS = 'https://maps.isric.org/mapserv'
REST = 'https://rest.isric.org/soilgrids/v2.0/properties/query'
PROPIEDADES = ['phh2o', 'clay', 'sand', 'silt', 'soc', 'nitrogen', 'cec', 'bdod', 'cfvo', 'wv0033', 'wv1500']
PROFUNDIDADES = ['0-5cm', '5-15cm', '15-30cm']
VALORES = ['mean', 'Q0.05', 'Q0.5', 'Q0.95', 'uncertainty']
# Con ±0,002° (README T01 §3.2) el WCS devuelve 2 x 2 píxeles y el punto cae en su esquina común,
# así que elegir uno depende del redondeo. Con ±0,001° devuelve 1 píxel centrado en el punto.
# Verificado el 15/11/2026: 32 de 32 valores (clay, phh2o, sand y soc; mean, Q0.05, Q0.95 y
# uncertainty; 0-5 cm) iguales a la REST guardada, en Chivay y en Majes riego.
MEDIA_VENTANA_GRADOS = 0.001
ESPERAS_FINALES_S = (15, 30, 60)
CITA = ('Poggio, L., de Sousa, L. M., Batjes, N. H., Heuvelink, G. B. M., Kempen, B., Ribeiro, E., and '
        'Rossiter, D.: SoilGrids 2.0: producing soil information for the globe with quantified spatial '
        'uncertainty, SOIL, 7, 217-240, 2021. https://doi.org/10.5194/soil-7-217-2021')
CARPETAS_SEMILLA = [Path(__file__).resolve().parent.parent / 'referencia' / 'muestras',
                    Path(__file__).resolve().parent.parent / 'muestras']


# ---------------------------------------------------------------- lector TIFF (biblioteca estándar)

class TiffNoLegible(Exception):
    pass


_TIPOS = {1: ('B', 1), 2: ('s', 1), 3: ('H', 2), 4: ('I', 4), 6: ('b', 1), 7: ('B', 1), 8: ('h', 2),
          9: ('i', 4), 11: ('f', 4), 12: ('d', 8)}


def leer_geotiff(datos: bytes) -> dict:
    """Lee un GeoTIFF clásico sin comprimir, una banda, entero o real. Devuelve píxeles y georreferencia."""
    if len(datos) < 8:
        raise TiffNoLegible(f'archivo de {len(datos)} bytes')
    orden = {b'II': '<', b'MM': '>'}.get(datos[:2])
    if not orden:
        raise TiffNoLegible(f'no es TIFF (cabecera {datos[:8]!r})')
    magia, ifd = struct.unpack(orden + 'HI', datos[2:8])
    if magia != 42:
        raise TiffNoLegible(f'TIFF con número mágico {magia} (BigTIFF u otro no soportado)')
    (n,) = struct.unpack(orden + 'H', datos[ifd:ifd + 2])
    etiquetas: dict[int, tuple] = {}
    for i in range(n):
        tag, tipo, cuenta, valor = struct.unpack(orden + 'HHI4s', datos[ifd + 2 + 12 * i: ifd + 14 + 12 * i])
        if tipo not in _TIPOS:
            continue
        fmt, tam = _TIPOS[tipo]
        crudo = valor if tam * cuenta <= 4 else datos[struct.unpack(orden + 'I', valor)[0]:][:tam * cuenta]
        if tipo == 2:
            etiquetas[tag] = (crudo[:cuenta].split(b'\0')[0].decode('ascii', 'replace'),)
        else:
            etiquetas[tag] = struct.unpack(orden + fmt * cuenta, crudo[:tam * cuenta])
    g = lambda tag, defecto=None: etiquetas.get(tag, (defecto,))
    ancho, alto = g(256)[0], g(257)[0]
    bits, compresion, muestras = g(258, 16)[0], g(259, 1)[0], g(277, 1)[0]
    formato, predictor = g(339, 1)[0], g(317, 1)[0]
    if compresion not in (1, 8, 32946):  # 1 sin comprimir; 8 y 32946 Deflate (zlib, biblioteca estándar)
        raise TiffNoLegible(f'compresión {compresion} no soportada (solo 1 y Deflate 8/32946)')
    if predictor not in (1, 2) or muestras != 1:
        raise TiffNoLegible(f'predictor {predictor} o {muestras} bandas no soportados')
    tipo_px = {(1, 8): 'B', (1, 16): 'H', (1, 32): 'I', (2, 8): 'b', (2, 16): 'h', (2, 32): 'i',
               (3, 32): 'f', (3, 64): 'd'}.get((formato, bits))
    if not tipo_px or not ancho or not alto:
        raise TiffNoLegible(f'formato de muestra {formato}/{bits} bits o tamaño {ancho}x{alto} no soportado')
    if predictor == 2 and formato == 3:
        raise TiffNoLegible('predictor 2 con números reales no soportado')
    tam_px = bits // 8

    def bloque(inicio: int, largo: int, n_px: int, ancho_fila: int) -> tuple:
        crudo = datos[inicio:inicio + largo]
        if compresion != 1:
            try:
                crudo = zlib.decompress(crudo)
            except zlib.error as error:
                raise TiffNoLegible(f'Deflate no se pudo descomprimir: {error}')
        crudo = crudo[:n_px * tam_px]
        crudo = crudo[:len(crudo) - len(crudo) % tam_px]
        valores = list(struct.unpack(orden + tipo_px * (len(crudo) // tam_px), crudo))
        if predictor == 2:  # diferencia horizontal (especificación TIFF 6.0, sección 14)
            modulo, con_signo = 1 << bits, formato == 2
            for j in range(len(valores)):
                if j % ancho_fila:
                    v = (valores[j] + valores[j - 1]) % modulo
                    valores[j] = v - modulo if con_signo and v >= modulo // 2 else v
        return tuple(valores)

    pixeles: list[list] = [[None] * ancho for _ in range(alto)]
    if 273 in etiquetas:  # en tiras
        filas_tira = g(278, alto)[0]
        for k, (inicio, largo) in enumerate(zip(etiquetas[273], etiquetas[279])):
            for j, v in enumerate(bloque(inicio, largo, filas_tira * ancho, ancho)):
                fila, col = k * filas_tira + j // ancho, j % ancho
                if fila < alto:
                    pixeles[fila][col] = v
    elif 324 in etiquetas:  # en teselas
        tw, th = g(322)[0], g(323)[0]
        por_fila = math.ceil(ancho / tw)
        for k, (inicio, largo) in enumerate(zip(etiquetas[324], etiquetas[325])):
            ty, tx = divmod(k, por_fila)
            for j, v in enumerate(bloque(inicio, largo, tw * th, tw)):
                fila, col = ty * th + j // tw, tx * tw + j % tw
                if fila < alto and col < ancho:
                    pixeles[fila][col] = v
    else:
        raise TiffNoLegible('sin StripOffsets ni TileOffsets')
    nodata = g(42113)[0]
    try:
        nodata = float(nodata) if nodata not in (None, '') else None
    except ValueError:
        nodata = None
    geoclaves = etiquetas.get(34735, ())
    tipo_raster = None  # GTRasterTypeGeoKey (1025): 1 = PixelIsArea, 2 = PixelIsPoint
    for i in range(4, len(geoclaves), 4):
        if geoclaves[i] == 1025 and geoclaves[i + 1] == 0:
            tipo_raster = geoclaves[i + 3]
    return {'width': ancho, 'height': alto, 'bits': bits, 'sample_format': formato, 'pixels': pixeles,
            'nodata': nodata, 'pixel_scale': list(etiquetas.get(33550, ())),
            'tiepoint': list(etiquetas.get(33922, ())), 'raster_type': tipo_raster}


def pixel_del_punto(tiff: dict, lat: float, lon: float) -> tuple[int, int]:
    """Fila y columna del píxel que contiene (lat, lon), según ModelTiepoint y ModelPixelScale."""
    if len(tiff['tiepoint']) < 6 or len(tiff['pixel_scale']) < 2:
        raise TiffNoLegible('GeoTIFF sin ModelTiepoint o ModelPixelScale')
    i, j, _, x0, y0, _ = tiff['tiepoint'][:6]
    sx, sy = tiff['pixel_scale'][:2]
    desplazamiento = 0.5 if tiff['raster_type'] == 2 else 0.0  # PixelIsPoint: el tiepoint es el centro
    col = math.floor((lon - x0) / sx + i + desplazamiento)
    fila = math.floor((y0 - lat) / sy + j + desplazamiento)
    if not (0 <= fila < tiff['height'] and 0 <= col < tiff['width']):
        raise TiffNoLegible(f'el punto cae fuera del GeoTIFF (fila {fila}, columna {col})')
    return fila, col


# ---------------------------------------------------------------- factores de conversión

def _factores_semilla() -> dict:
    """d_factor y unidades desde procedencias REST ya guardadas, con el archivo y la URL de origen."""
    encontrados: dict[str, dict] = {}
    for carpeta in CARPETAS_SEMILLA:
        for archivo in sorted(carpeta.glob('soilgrids_*.procedencia.json')):
            try:
                proc = json.loads(archivo.read_text(encoding='utf-8'))
            except (OSError, json.JSONDecodeError):
                continue
            for prop, u in (proc.get('units') or {}).items():
                if not isinstance(u, dict) or 'd_factor' not in u:
                    continue
                datos = {k: u.get(k) for k in ('mapped_units', 'target_units', 'd_factor')}
                previo = encontrados.get(prop)
                if previo and {k: previo[k] for k in datos} != datos:
                    log(f'SoilGrids: factores distintos para {prop} entre {previo["origen"]["archivo"]} y {archivo.name}')
                    continue
                if not previo:
                    encontrados[prop] = {**datos, 'origen': {
                        'tipo': 'procedencia REST guardada', 'archivo': str(archivo),
                        'request_url': proc.get('request_url'), 'requested_at': proc.get('requested_at')}}
        if encontrados:
            break
    return encontrados


def factores(cache: Cache, servicio_rest: Servicio, lat: float, lon: float,
             propiedades: list[str]) -> tuple[dict, str | None, dict | None]:
    """Devuelve (factores por propiedad, motivo si faltan, respuesta REST si se pidió)."""
    guardados = (cache.leer_json('_factores.json') or {}).get('factores', {})
    if not guardados:
        guardados = _factores_semilla()
        if guardados:
            cache.escribir_json('_factores.json', {'factores': guardados})
            log(f'SoilGrids: factores sembrados de procedencias guardadas: {sorted(guardados)}')
    faltan = [p for p in propiedades if p not in guardados]
    if not faltan:
        return guardados, None, None
    url = f'{REST}?' + urllib.parse.urlencode(
        {'lon': lon, 'lat': lat, 'property': faltan, 'depth': '0-5cm', 'value': 'mean'}, doseq=True)
    log(f'SoilGrids REST: pidiendo factores de {faltan} (puede tardar)')
    try:
        respuesta = cache.obtener_json(f'rest_factores_{"-".join(faltan)}.json', servicio_rest, url,
                                       timeout=180, esperas=(15, 30), etiqueta='factores')
    except PeticionFallida as error:
        return guardados, f'REST de SoilGrids sin respuesta para los factores de {faltan}: {error.motivo}', None
    for capa in respuesta['response'].get('properties', {}).get('layers', []):
        u = capa.get('unit_measure') or {}
        if 'd_factor' in u:
            guardados[capa['name']] = {k: u.get(k) for k in ('mapped_units', 'target_units', 'd_factor')} | {
                'origen': {'tipo': 'consulta REST', 'request_url': respuesta['request_url'],
                           'requested_at': respuesta.get('requested_at')}}
    cache.escribir_json('_factores.json', {'factores': guardados})
    aun = [p for p in propiedades if p not in guardados]
    motivo = f'La REST de SoilGrids no devolvió unit_measure para {aun}' if aun else None
    return guardados, motivo, respuesta


# ---------------------------------------------------------------- descarga

def _url_capa(cobertura: str, lat: float, lon: float) -> str:
    propiedad = cobertura.split('_')[0]
    d = MEDIA_VENTANA_GRADOS
    partes = [('map', f'/map/{propiedad}.map'), ('SERVICE', 'WCS'), ('VERSION', '2.0.1'),
              ('REQUEST', 'GetCoverage'), ('COVERAGEID', cobertura), ('FORMAT', 'image/tiff'),
              ('SUBSET', f'long({lon - d:.6f},{lon + d:.6f})'), ('SUBSET', f'lat({lat - d:.6f},{lat + d:.6f})'),
              ('SUBSETTINGCRS', 'http://www.opengis.net/def/crs/EPSG/0/4326'),
              ('OUTPUTCRS', 'http://www.opengis.net/def/crs/EPSG/0/4326')]
    return f'{WCS}?' + urllib.parse.urlencode(partes, safe='/(),:')


def todas_las_capas() -> list[str]:
    return [f'{p}_{d}_{v}' for p in PROPIEDADES for d in PROFUNDIDADES for v in VALORES]


def obtener(*, lat: float, lon: float, salida: str, cache: str, inicio: str | None = None,
            fin: str | None = None, progreso=None, nombre: str | None = None,
            capas: list[str] | None = None, tope: int = 4, **_: object) -> dict:
    nombre = nombre or clave_punto(lat, lon)
    base = f'soilgrids_{nombre}'
    capas = capas or todas_las_capas()
    invalidas = [c for c in capas if c.split('_')[0] not in PROPIEDADES or len(c.split('_')) != 3]
    if invalidas:
        return resultado('sin_datos', motivo=f'Capas no reconocidas: {invalidas}')
    caja = Cache(Path(cache) / 'soilgrids')
    caja_punto = Cache(Path(cache) / 'soilgrids' / clave_punto(lat, lon))
    wcs = Servicio('SoilGrids WCS', tope)
    rest = Servicio('SoilGrids REST', 1)
    propiedades = sorted({c.split('_')[0] for c in capas}, key=PROPIEDADES.index)
    tabla_factores, motivo_factores, respuesta_rest = factores(caja, rest, lat, lon, propiedades)

    avance = Progreso(len(capas), progreso, 'SoilGrids WCS')
    descargas: dict[str, dict] = {}

    def bajar(cobertura: str, esperas) -> None:
        url = _url_capa(cobertura, lat, lon)
        try:
            cuerpo, _ = caja_punto.obtener_bytes(f'{cobertura}_w{MEDIA_VENTANA_GRADOS}.tif', wcs, url, timeout=60, esperas=esperas,
                                                 accept='image/tiff', etiqueta=cobertura)
            descargas[cobertura] = {'request_url': url, 'bytes': cuerpo}
            avance.paso(cobertura)
        except PeticionFallida as error:
            descargas[cobertura] = {'request_url': url, 'error': error.motivo}
            log(f'SoilGrids {cobertura}: {error.motivo.splitlines()[0][:200]}')

    with ThreadPoolExecutor(max_workers=wcs.tope) as hilos:
        list(hilos.map(lambda c: bajar(c, (2, 4)), capas))
    pendientes = [c for c in capas if 'error' in descargas[c]]
    if pendientes:
        log(f'SoilGrids: ronda final para {len(pendientes)} capas, con esperas {ESPERAS_FINALES_S} s')
        with ThreadPoolExecutor(max_workers=max(1, wcs.tope // 2)) as hilos:
            list(hilos.map(lambda c: bajar(c, ESPERAS_FINALES_S), pendientes))

    original, valores, faltan = {}, {}, []
    for cobertura in capas:
        prop, prof, valor = cobertura.split('_')
        d = descargas[cobertura]
        entrada = {'request_url': d['request_url']}
        valores[cobertura] = {'entero': None, 'convertido': None}
        if 'error' in d:
            entrada['error'] = d['error']
            faltan.append(f'{cobertura}: {d["error"].splitlines()[0][:200]}')
            original[cobertura] = entrada
            continue
        entrada['geotiff_base64'] = base64.b64encode(d['bytes']).decode('ascii')
        try:
            tiff = leer_geotiff(d['bytes'])
            fila, col = pixel_del_punto(tiff, lat, lon)
        except TiffNoLegible as error:
            texto = d['bytes'][:300].decode('utf-8', 'replace') if not d['bytes'][:2] in (b'II', b'MM') else ''
            entrada['error_lectura'] = f'{error}' + (f' · respuesta: {texto}' if texto else '')
            faltan.append(f'{cobertura}: GeoTIFF no legible ({entrada["error_lectura"][:200]})')
            original[cobertura] = entrada
            continue
        entero = tiff['pixels'][fila][col]
        if entero is not None and tiff['nodata'] is not None and float(entero) == tiff['nodata']:
            entero = None
        entrada['lectura'] = {k: tiff[k] for k in ('width', 'height', 'pixels', 'nodata', 'pixel_scale',
                                                   'tiepoint', 'raster_type')}
        entrada['lectura']['pixel_del_punto'] = {'fila': fila, 'columna': col}
        original[cobertura] = entrada
        valores[cobertura]['entero'] = entero
        if entero is None:
            faltan.append(f'{cobertura}: sin predicción en el píxel (nodata)')
        elif valor == 'uncertainty':
            faltan.append(f'{cobertura}: factor y unidad de «uncertainty» sin verificar; se guarda el entero')
        elif prop not in tabla_factores:
            faltan.append(f'{cobertura}: sin d_factor ({motivo_factores})')
        else:
            valores[cobertura]['convertido'] = round(entero / tabla_factores[prop]['d_factor'], 4)

    def unidad(cobertura: str) -> str:
        prop, _, valor = cobertura.split('_')
        if valor == 'uncertainty':
            return 'sin verificar'
        return (tabla_factores.get(prop) or {}).get('target_units') or 'sin factor'

    cabecera = ['fecha'] + [f'{c} ({unidad(c)})' for c in capas]
    filas = [[None] + [valores[c]['convertido'] for c in capas]]

    procedencia = {
        'source_id': 'ISRIC SoilGrids', 'product_id': 'SoilGrids 2.0 (250 m), WCS 2.0.1 GetCoverage',
        'request_base': WCS, 'requested_at_first_write': ahora_iso(),
        'point': {'latitude': lat, 'longitude': lon},
        'window_degrees': MEDIA_VENTANA_GRADOS,
        'pixel_rule': 'Value of the GeoTIFF pixel that contains the point (ModelTiepoint + ModelPixelScale); '
                      'all pixels read are kept in the original file.',
        'layers_requested': capas, 'layers_failed_or_missing': faltan,
        'units': {p: tabla_factores.get(p) for p in propiedades},
        'unit_conversion': 'normalized = mapped integer / d_factor (d_factor read from SoilGrids REST unit_measure)',
        'unit_factors_missing_reason': motivo_factores,
        'uncertainty_note': 'Mapped integer kept in original and in .largo.csv; conversion factor and unit not '
                            'verified against ISRIC documentation, so the normalized column is empty (pending).',
        'fecha_column_note': 'The «fecha» column is empty on purpose: soil properties have no time series. '
                             'It exists only because the backend reader requires it. It is NOT an observation date.',
        'requests': wcs.stats, 'requests_rest': rest.stats,
        'blocks_from_cache': caja_punto.desde_cache, 'blocks_fetched': caja_punto.pedidos,
        'resolution': '250 m', 'license': 'CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)',
        'citation': CITA, 'data_policy': 'https://isric.org/about/data-policy',
        'note': 'Machine-learning prediction at 250 m with wide uncertainty; not an in-field soil analysis.',
        'generated_with': 'tarpu_datos (written with AI assistance, Claude Code).',
    }
    if respuesta_rest:
        original['_rest_factores'] = respuesta_rest
    archivos = escribir_tres(salida, base, original=original, cabecera=cabecera, filas=filas,
                             procedencia=procedencia)

    # Formato largo (el de datos/soilgrids/consulta_soilgrids.py), como archivo aparte.
    largo = []
    for prop in propiedades:
        for prof in PROFUNDIDADES:
            cs = {v: f'{prop}_{prof}_{v}' for v in VALORES}
            if not any(c in capas for c in cs.values()):
                continue
            largo.append([prop, prof, unidad(cs['mean'])] +
                         [valores.get(cs[v], {}).get('convertido') for v in ('mean', 'Q0.05', 'Q0.5', 'Q0.95')] +
                         [valores.get(cs['uncertainty'], {}).get('entero')])
    ruta_largo = Path(salida) / f'{base}.largo.csv'
    escribir_csv(ruta_largo, ['propiedad', 'profundidad', 'unidad', 'media', 'q05', 'q50', 'q95',
                              'incertidumbre (entero del proveedor, sin convertir)'], largo)
    archivos['largo'] = str(ruta_largo)
    escribir_atomico(Path(cache) / 'soilgrids' / f'{base}_resumen.json',
                     json.dumps({'wcs': wcs.resumen(), 'rest': rest.resumen()}, ensure_ascii=False))
    log(wcs.resumen())
    convertidas = sum(1 for c in capas if valores[c]['convertido'] is not None)
    estado = 'sin_datos' if not convertidas and not any(valores[c]['entero'] is not None for c in capas) else (
        'parcial' if faltan else 'listo')
    return resultado(estado, archivos, faltan, motivo_factores)

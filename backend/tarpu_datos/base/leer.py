"""Consulta la base de Arequipa (capa 1, DT-22) en un punto, al instante y sin descargar nada.

Devuelve, con su procedencia: altitud y pendiente (NASADEM), sector y cultivos del sector (DT-18, DT-20), suelo
(SoilGrids, 33 capas medias y sus percentiles), aptitud de cultivos (GAEZ) y la celda de clima de NASA POWER.
Lo que no está en la base (punto fuera de la caja, archivo faltante) sale como sin_dato con su motivo (DT-16).

Rapidez: de cada GeoTIFF se descomprime solo la tira o la tesela que contiene el punto; el .hgt de NASADEM se lee
con seek (3 x 3 píxeles). Medido el 15/11/2026: ver backend/tarpu_datos/README.md.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import json
import math
import struct
import zipfile
import zlib
from functools import lru_cache
from pathlib import Path

from pyproj import Geod

BACKEND = Path(__file__).resolve().parents[2]
BASE = BACKEND / 'almacen' / 'base_arequipa'
CATALOGO = BACKEND / 'catalogo'
CAJA = {'oeste': -75.5, 'sur': -17.5, 'este': -70.5, 'norte': -14.5}
_GEOD = Geod(ellps='WGS84')

# FAO (2006), Guidelines for soil description, cuadro 7 (clases de pendiente, %), ya citado en
# backend/investigacion/relieve_erosion_rotacion_2026-11-15.json.
CLASES_PENDIENTE = [(0.2, 'plano'), (0.5, 'nivelado'), (1, 'casi nivelado'), (2, 'muy suave'), (5, 'suave'),
                    (10, 'inclinado'), (15, 'fuertemente inclinado'), (30, 'moderadamente empinado'),
                    (60, 'empinado'), (math.inf, 'muy empinado')]
_TIPOS = {3: ('H', 2), 4: ('I', 4), 8: ('h', 2), 9: ('i', 4), 11: ('f', 4), 12: ('d', 8), 16: ('Q', 8)}


# ------------------------------------------------------------------ GeoTIFF: un píxel
@lru_cache(maxsize=512)
def _cabecera(ruta: str) -> dict:
    with open(ruta, 'rb') as f:
        datos = f.read()
    orden = {b'II': '<', b'MM': '>'}[datos[:2]]
    (ifd,) = struct.unpack(orden + 'I', datos[4:8])
    (n,) = struct.unpack(orden + 'H', datos[ifd:ifd + 2])
    tags: dict[int, tuple] = {}
    for i in range(n):
        tag, tipo, cuenta, valor = struct.unpack(orden + 'HHI4s', datos[ifd + 2 + 12 * i: ifd + 14 + 12 * i])
        if tipo == 2:
            off = struct.unpack(orden + 'I', valor)[0] if cuenta > 4 else None
            crudo = datos[off:off + cuenta] if off is not None else valor[:cuenta]
            tags[tag] = (crudo.split(b'\0')[0].decode('ascii', 'replace'),)
            continue
        if tipo not in _TIPOS:
            continue
        fmt, tam = _TIPOS[tipo]
        crudo = valor if tam * cuenta <= 4 else datos[struct.unpack(orden + 'I', valor)[0]:][:tam * cuenta]
        tags[tag] = struct.unpack(orden + fmt * cuenta, crudo[:tam * cuenta])
    g = lambda t, d=None: tags.get(t, (d,))
    bits, formato = g(258, 16)[0], g(339, 1)[0]
    nodata = g(42113)[0]
    return {'orden': orden, 'ancho': g(256)[0], 'alto': g(257)[0], 'bits': bits,
            'tipo': {(1, 8): 'B', (1, 16): 'H', (1, 32): 'I', (2, 8): 'b', (2, 16): 'h', (2, 32): 'i',
                     (3, 32): 'f', (3, 64): 'd'}[(formato, bits)],
            'con_signo': formato == 2, 'compresion': g(259, 1)[0], 'predictor': g(317, 1)[0],
            'tiras': (tags.get(273), tags.get(279), g(278, g(257)[0])[0]),
            'teselas': (tags.get(324), tags.get(325), g(322)[0], g(323)[0]),
            'escala': tags.get(33550), 'tiepoint': tags.get(33922),
            'nodata': float(nodata) if nodata not in (None, '') else None}


def pixel(ruta: Path, lat: float, lon: float) -> dict:
    """Valor del píxel que contiene (lat, lon) en un GeoTIFF EPSG:4326 (PixelIsArea)."""
    c = _cabecera(str(ruta))
    sx, sy = c['escala'][:2]
    x0, y0 = c['tiepoint'][3:5]
    col, fila = math.floor((lon - x0) / sx), math.floor((y0 - lat) / sy)
    if not (0 <= col < c['ancho'] and 0 <= fila < c['alto']):
        return {'valor': None, 'motivo': 'el punto cae fuera del mapa'}
    tam = c['bits'] // 8
    if c['tiras'][0]:
        offs, largos, filas_tira = c['tiras']
        k, f_en, c_en, ancho_bloque = fila // filas_tira, fila % filas_tira, col, c['ancho']
    else:
        offs, largos, tw, th = c['teselas']
        por_fila = math.ceil(c['ancho'] / tw)
        k, f_en, c_en, ancho_bloque = (fila // th) * por_fila + col // tw, fila % th, col % tw, tw
    if not largos[k]:  # TIFF disperso: el bloque no está escrito. GDAL lo lee como nodata o, sin nodata, como 0.
        valor = c['nodata'] if c['nodata'] is not None else 0
        return {'valor': None if c['nodata'] is not None else 0, 'fila': fila, 'col': col, 'pixel_grados': [sx, sy],
                'nota': 'bloque vacío en el archivo (TIFF disperso), leído como 0 según la convención de GDAL'}
    with open(ruta, 'rb') as f:
        f.seek(offs[k])
        crudo = f.read(largos[k])
    if c['compresion'] != 1:
        crudo = zlib.decompress(crudo)
    inicio = f_en * ancho_bloque * tam
    fila_px = struct.unpack(c['orden'] + c['tipo'] * ancho_bloque, crudo[inicio:inicio + ancho_bloque * tam])
    if c['predictor'] == 2:  # diferencia horizontal (TIFF 6.0, sección 14): se acumula solo esta fila
        modulo, acum = 1 << c['bits'], 0
        for j in range(c_en + 1):
            acum = (acum + fila_px[j]) % modulo if j else fila_px[0] % modulo
        valor = acum - modulo if c['con_signo'] and acum >= modulo // 2 else acum
    else:
        valor = fila_px[c_en]
    if c['nodata'] is not None and valor == c['nodata']:
        return {'valor': None, 'motivo': 'sin dato del proveedor (nodata)', 'fila': fila, 'col': col}
    return {'valor': valor, 'fila': fila, 'col': col, 'pixel_grados': [sx, sy]}


# ------------------------------------------------------------------ fuentes
def _dentro(lat: float, lon: float) -> bool:
    return CAJA['sur'] <= lat <= CAJA['norte'] and CAJA['oeste'] <= lon <= CAJA['este']


@lru_cache(maxsize=1)
def _manifiesto() -> dict:
    return json.loads((CATALOGO / 'base_arequipa.json').read_text(encoding='utf-8'))


@lru_cache(maxsize=1)
def _unidades_soilgrids() -> dict:
    return json.loads((CATALOGO / 'soilgrids_unidades.json').read_text(encoding='utf-8'))['propiedades']


def nasadem(lat: float, lon: float) -> dict:
    """Altitud del píxel de 1'' y pendiente por el método de Horn (1981) con su ventana de 3 x 3 píxeles."""
    sur, oeste = math.floor(lat), math.floor(lon)
    nombre = f"{'s' if sur < 0 else 'n'}{abs(sur):02d}{'w' if oeste < 0 else 'e'}{abs(oeste):03d}"
    ruta = BASE / 'nasadem' / f'NASADEM_HGT_{nombre}.zip'
    if not ruta.exists():
        return {'estado': 'sin_dato', 'motivo': f'no está la tesela NASADEM {nombre}'}
    n = 3601
    fila, col = round((sur + 1 - lat) * 3600), round((lon - oeste) * 3600)
    with zipfile.ZipFile(ruta) as z, z.open(f'{nombre}.hgt') as f:
        def h(i: int, j: int) -> int | None:
            i, j = min(max(i, 0), n - 1), min(max(j, 0), n - 1)
            f.seek(2 * (i * n + j))
            (v,) = struct.unpack('>h', f.read(2))
            return None if v == -32768 else v
        v = {(di, dj): h(fila + di, col + dj) for di in (-1, 0, 1) for dj in (-1, 0, 1)}
    if any(x is None for x in v.values()):
        return {'estado': 'sin_dato', 'motivo': 'NASADEM sin valor en la ventana de 3 x 3 píxeles'}
    # Tamaño del píxel de 1'' en metros en esta latitud (geodésica WGS84, sin constantes aproximadas).
    dx = _GEOD.inv(lon, lat, lon + 1 / 3600, lat)[2]
    dy = _GEOD.inv(lon, lat, lon, lat + 1 / 3600)[2]
    a, b, cc, d, e_, ff, g, hh, i = (v[(-1, -1)], v[(-1, 0)], v[(-1, 1)], v[(0, -1)], v[(0, 0)], v[(0, 1)],
                                     v[(1, -1)], v[(1, 0)], v[(1, 1)])
    dzdx = ((cc + 2 * ff + i) - (a + 2 * d + g)) / (8 * dx)
    dzdy = ((g + 2 * hh + i) - (a + 2 * b + cc)) / (8 * dy)
    pendiente = 100 * math.hypot(dzdx, dzdy)
    clase = next(nombre_c for limite, nombre_c in CLASES_PENDIENTE if pendiente < limite)
    return {'estado': 'listo', 'altitud_m': e_, 'pendiente_pct': round(pendiente, 1), 'clase_pendiente': clase,
            'procedencia': {'fuente': 'NASADEM_HGT v001 (LP DAAC)', 'tesela': nombre, 'escala': "1'' (≈ 30 m)",
                            'metodo_pendiente': 'Horn (1981), 3 x 3 píxeles; tamaño del píxel geodésico (WGS84)',
                            'clases': 'FAO (2006), Guidelines for soil description, cuadro 7'}}


def sector(altitud_m: float | None) -> dict:
    """Sector de TARPU (DT-18) y sus cultivos (DT-20) según la altitud."""
    if altitud_m is None:
        return {'estado': 'sin_dato', 'motivo': 'sin altitud'}
    datos = json.loads((CATALOGO / 'sectores.json').read_text(encoding='utf-8'))
    for clave, s in datos['sectores'].items():
        bajo, alto = s['altitud_m']
        if bajo <= altitud_m < alto:
            return {'estado': 'listo', 'sector': clave, 'nombre': s['nombre'], 'pisos_inei': s['pisos_inei'],
                    'cultivos_principales': [c['clave'] for c in s['principales']],
                    'cultivos_ver_mas': [c['clave'] for c in s['ver_mas']],
                    'procedencia': {'limites': datos['fuentes']['limites'], 'regla_cultivos': datos['regla_cultivos']}}
    return {'estado': 'sin_dato', 'motivo': f'{altitud_m} m queda fuera de S1 a S3 (0 a 4800 m, DT-18)'}


def soilgrids(lat: float, lon: float, valores: tuple[str, ...] = ('mean', 'Q0.05', 'Q0.95')) -> dict:
    unidades = _unidades_soilgrids()
    capas = {}
    for ruta in sorted((BASE / 'soilgrids').glob('*.tif')):
        cobertura = ruta.stem
        prop, prof, val = cobertura.split('_')
        if val not in valores:
            continue
        p = pixel(ruta, lat, lon)
        u = unidades.get(prop, {})
        factor = u.get('d_factor')
        capas[cobertura] = {'crudo': p['valor'],
                            'valor': round(p['valor'] / factor, 3) if p['valor'] is not None and factor else None,
                            'unidad': u.get('target_units'), 'propiedad': prop, 'profundidad': prof, 'estadistico': val,
                            **({'motivo': p['motivo']} if 'motivo' in p else {})}
    m = _manifiesto().get('soilgrids', {})
    return {'estado': 'listo' if capas else 'sin_dato', 'capas': capas,
            'procedencia': {'fuente': m.get('fuente'), 'escala': m.get('resolucion'), 'nivel': m.get('nivel'),
                            'aviso': m.get('diferencia_con_el_punto'), 'conversion': 'valor = crudo / d_factor',
                            'unidades': 'backend/catalogo/soilgrids_unidades.json'}}


def gaez(lat: float, lon: float) -> dict:
    carpeta = BASE / 'gaez'
    capas = json.loads((carpeta / '_capas.json').read_text(encoding='utf-8')) if (carpeta / '_capas.json').exists() else []
    salida = []
    for c in capas:
        ruta = next(carpeta.glob(f"{c['objectid']}_*.tif"), None)
        if not ruta:
            continue
        p = pixel(ruta, lat, lon)
        salida.append({'cultivo': c['crop'], 'agua': c['water_supply'], 'capa': c['name'], 'objectid': c['objectid'],
                       'indice': p['valor'], **({'motivo': p['motivo']} if 'motivo' in p else {})})
    m = _manifiesto().get('gaez', {})
    return {'estado': 'listo' if salida else 'sin_dato', 'capas': salida,
            'procedencia': {'fuente': m.get('fuente'), 'periodo': m.get('periodo'), 'insumos': m.get('insumos'),
                            'escala': m.get('resolucion'), 'nivel': m.get('nivel'), 'cita': m.get('cita')}}


def power_celda(lat: float, lon: float) -> dict:
    """La celda de POWER que contiene el punto: archivos guardados, elevación de la celda y último día."""
    clat, clon = round(lat / 0.5) * 0.5, round(lon / 0.625) * 0.625
    nombre = f'celda_{clat:+.3f}_{clon:+.3f}'.replace('+', 'p').replace('-', 'm').replace('.', '_')
    carpeta = BASE / 'power'
    proc = carpeta / f'power_{nombre}.procedencia.json'
    if not proc.exists():
        return {'estado': 'sin_dato', 'motivo': f'no está la celda {nombre}'}
    p = json.loads(proc.read_text(encoding='utf-8'))
    return {'estado': 'listo', 'celda': nombre, 'centro': [clat, clon], 'elevacion_celda_m': p.get('cell_elevation_m'),
            'desde': p.get('observed_start'), 'hasta': p.get('observed_end'),
            'dias_faltantes_por_variable': {k: v for k, v in (p.get('missing_days') or {}).items() if v},
            'archivos': {'normalizado': str(carpeta / f'power_{nombre}.normalizado.csv'),
                         'original': str(carpeta / f'power_{nombre}.original.json'), 'procedencia': str(proc)},
            'procedencia': {'fuente': p.get('source_id'), 'producto': p.get('product_id'), 'api': p.get('api_version'),
                            'escala': 'celda de 0,5° x 0,625° (radiación: 1° x 1°)', 'nota': p.get('note')}}


def leer(lat: float, lon: float) -> dict:
    """Todo lo de la capa 1 en un punto."""
    if not _dentro(lat, lon):
        return {'estado': 'sin_dato', 'motivo': f'el punto ({lat}, {lon}) está fuera de la base de Arequipa ({CAJA})'}
    relieve = nasadem(lat, lon)
    clima = power_celda(lat, lon)
    avisos = []
    if relieve.get('altitud_m') is not None and clima.get('elevacion_celda_m') is not None:
        diferencia = round(clima['elevacion_celda_m'] - relieve['altitud_m'])
        if abs(diferencia) >= 1:
            avisos.append(f'La celda de NASA POWER tiene una elevación de {clima["elevacion_celda_m"]} m y el punto '
                          f'{relieve["altitud_m"]} m (NASADEM): {diferencia:+} m. El clima de POWER describe la celda, no el punto.')
    return {'estado': 'listo', 'punto': {'lat': lat, 'lon': lon}, 'relieve': relieve,
            'sector': sector(relieve.get('altitud_m')), 'suelo': soilgrids(lat, lon), 'aptitud': gaez(lat, lon),
            'clima': clima, 'avisos': avisos}


# ------------------------------------------------------------------ parcela (contorno dibujado)
@lru_cache(maxsize=2)
def _tesela_nasadem(nombre: str):
    from array import array
    import sys
    with zipfile.ZipFile(BASE / 'nasadem' / f'NASADEM_HGT_{nombre}.zip') as z:
        alturas = array('h', z.read(f'{nombre}.hgt'))
    if sys.byteorder == 'little':
        alturas.byteswap()
    return alturas


def _relieve_parcela(poligono) -> dict:
    """Altitud y pendiente (Horn) de cada píxel de 1'' de NASADEM cuyo centro cae dentro de la parcela."""
    from shapely.geometry import Point
    from shapely.prepared import prep
    oeste, sur, este, norte = poligono.bounds
    t_sur, t_oeste = math.floor(sur), math.floor(oeste)
    if math.floor(norte) != t_sur or math.floor(este) != t_oeste:
        return {'estado': 'sin_dato', 'motivo': 'la parcela cruza el borde de una tesela de NASADEM (caso no implementado todavía)'}
    nombre = f"{'s' if t_sur < 0 else 'n'}{abs(t_sur):02d}{'w' if t_oeste < 0 else 'e'}{abs(t_oeste):03d}"
    if not (BASE / 'nasadem' / f'NASADEM_HGT_{nombre}.zip').exists():
        return {'estado': 'sin_dato', 'motivo': f'no está la tesela NASADEM {nombre}'}
    h, n, dentro = _tesela_nasadem(nombre), 3601, prep(poligono)
    f0, f1 = round((t_sur + 1 - norte) * 3600), round((t_sur + 1 - sur) * 3600)
    c0, c1 = round((oeste - t_oeste) * 3600), round((este - t_oeste) * 3600)
    c = poligono.centroid
    dx = _GEOD.inv(c.x, c.y, c.x + 1 / 3600, c.y)[2]
    dy = _GEOD.inv(c.x, c.y, c.x, c.y + 1 / 3600)[2]
    alt, pend = [], []
    for fila in range(max(f0, 1), min(f1, n - 2) + 1):
        for col in range(max(c0, 1), min(c1, n - 2) + 1):
            if not dentro.contains(Point(t_oeste + col / 3600, t_sur + 1 - fila / 3600)):
                continue
            v = [h[(fila + i) * n + col + j] for i in (-1, 0, 1) for j in (-1, 0, 1)]
            if -32768 in v:
                continue
            a, b, cc, d, e_, ff, g, hh, i9 = v
            dzdx = ((cc + 2 * ff + i9) - (a + 2 * d + g)) / (8 * dx)
            dzdy = ((g + 2 * hh + i9) - (a + 2 * b + cc)) / (8 * dy)
            alt.append(e_)
            pend.append(100 * math.hypot(dzdx, dzdy))
    if not alt:
        return {'estado': 'sin_dato', 'motivo': "ningún centro de píxel de NASADEM (1'' ≈ 30 m) cae dentro: la parcela es más pequeña que un píxel"}
    pend_ord = sorted(pend)
    clases: dict[str, int] = {}
    for p in pend:
        k = next(nc for lim, nc in CLASES_PENDIENTE if p < lim)
        clases[k] = clases.get(k, 0) + 1
    return {'estado': 'listo', 'pixeles': len(alt), 'altitud_m': {'min': min(alt), 'media': round(sum(alt) / len(alt), 1), 'max': max(alt)},
            'pendiente_pct': {'min': round(pend_ord[0], 1), 'mediana': round(pend_ord[len(pend_ord) // 2], 1), 'max': round(pend_ord[-1], 1)},
            'clases_pendiente_pixeles': clases,
            'procedencia': {'fuente': 'NASADEM_HGT v001 (LP DAAC)', 'tesela': nombre, 'escala': "1'' (≈ 30 m)",
                            'metodo': "píxeles cuyo centro cae dentro del contorno; pendiente de Horn (1981) en 3 x 3; clases FAO (2006), cuadro 7"}}


def _pixeles_raster(ruta: Path, poligono) -> list[tuple[int, int]]:
    """Píxeles de un GeoTIFF (EPSG:4326) que tocan la parcela: los que contienen algún punto de una malla fina."""
    from shapely.geometry import Point
    from shapely.prepared import prep
    c = _cabecera(str(ruta))
    sx, sy = c['escala'][:2]
    x0, y0 = c['tiepoint'][3:5]
    oeste, sur, este, norte = poligono.bounds
    paso = min(sx, sy) / 4
    dentro, vistos = prep(poligono), set()
    lat = norte
    while lat >= sur:
        lon = oeste
        while lon <= este:
            if dentro.contains(Point(lon, lat)):
                vistos.add((math.floor((y0 - lat) / sy), math.floor((lon - x0) / sx)))
            lon += paso
        lat -= paso
    if not vistos:  # parcela más pequeña que la malla: el píxel del centroide
        cen = poligono.centroid
        vistos.add((math.floor((y0 - cen.y) / sy), math.floor((cen.x - x0) / sx)))
    return sorted(vistos)


def _suelo_parcela(poligono) -> dict:
    ref = BASE / 'soilgrids' / 'phh2o_0-5cm_mean.tif'
    if not ref.exists():
        return {'estado': 'sin_dato', 'motivo': 'no está SoilGrids'}
    pix = _pixeles_raster(ref, poligono)
    c = _cabecera(str(ref))
    sx, sy = c['escala'][:2]
    x0, y0 = c['tiepoint'][3:5]
    centros = [(y0 - (f + .5) * sy, x0 + (k + .5) * sx) for f, k in pix]
    unidades = _unidades_soilgrids()
    capas = {}
    for ruta in sorted((BASE / 'soilgrids').glob('*_mean.tif')):
        prop, prof, _ = ruta.stem.split('_')
        factor = unidades.get(prop, {}).get('d_factor')
        valores = [pixel(ruta, la, lo)['valor'] for la, lo in centros]
        convertidos = [round(v / factor, 3) for v in valores if v is not None and factor]
        capas[ruta.stem] = {'propiedad': prop, 'profundidad': prof, 'unidad': unidades.get(prop, {}).get('target_units'),
                            'valores_por_pixel': convertidos, 'crudos': valores,
                            'media': round(sum(convertidos) / len(convertidos), 3) if convertidos else None}
    m = _manifiesto().get('soilgrids', {})
    return {'estado': 'listo', 'pixeles': len(pix), 'capas': capas,
            'procedencia': {'fuente': m.get('fuente'), 'escala': m.get('resolucion'), 'nivel': m.get('nivel'),
                            'metodo': 'píxeles del mapa regional que tocan la parcela (si no toca ninguno, el del centroide)',
                            'aviso': m.get('diferencia_con_el_punto')}}


def leer_parcela(contorno: dict) -> dict:
    """Capa 1 para un contorno (GeoJSON Polygon, [lon, lat]): todo el espacio de la parcela.

    Relieve: cada píxel de 30 m dentro. Suelo: los píxeles de 250 m que la tocan. Clima (POWER, ≈ 55 km), aptitud (GAEZ,
    ≈ 9 km), sector y cultivos: la celda o el valor del centroide, que cubre la parcela entera (las celdas son mayores)."""
    from shapely.geometry import shape
    pol = shape(contorno)
    cen = pol.centroid
    base = leer(round(cen.y, 6), round(cen.x, 6))
    if base.get('estado') != 'listo':
        return base
    rel = _relieve_parcela(pol)
    sec = sector(rel['altitud_m']['media']) if rel.get('estado') == 'listo' else base['sector']
    avisos = list(base['avisos'])
    if rel.get('estado') == 'listo':
        a = rel['altitud_m']
        if a['max'] != a['min']:
            avisos.append(f"La parcela va de {a['min']} a {a['max']} m (NASADEM); el sector se asigna con la altitud media.")
    return {'estado': 'listo', 'centroide': {'lat': round(cen.y, 6), 'lon': round(cen.x, 6)},
            'relieve': rel, 'relieve_centroide': base['relieve'], 'sector': sec, 'suelo': _suelo_parcela(pol),
            'aptitud': base['aptitud'], 'clima': base['clima'], 'avisos': avisos,
            'cobertura': {'nasadem': 'píxeles de 30 m cuyo centro cae dentro de la parcela',
                          'soilgrids': 'píxeles de 250 m que tocan la parcela',
                          'gaez': 'celda de ≈ 9 km que contiene el centroide',
                          'power': 'celda de ≈ 55 x 67 km que contiene el centroide'}}

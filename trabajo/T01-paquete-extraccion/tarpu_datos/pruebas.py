"""Comprobaciones de la sección 6 del README de T01, sobre los archivos ya descargados en salida/.

    python -m tarpu_datos.pruebas            # todas las filas; las que no tienen archivos salen «sin ejecutar»
Además, sin red: la fórmula de luz, el lector GeoTIFF sobre los .tif reales de la caché y que cada
normalizado de salida/ lo lee una réplica exacta de backend/tarpu_api/ingesta.leer_normalizado.
No descarga nada: primero se ejecuta python -m tarpu_datos.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import csv
import io
import json
import re
import sys
from pathlib import Path

from . import luz, soilgrids

CARPETA = Path(__file__).resolve().parent.parent
SALIDA, CACHE, MUESTRAS = CARPETA / 'salida', CARPETA / 'cache', CARPETA / 'referencia' / 'muestras'
LUGARES = {'majes_riego': (-16.367023, -72.185771), 'chivay': (-15.64, -71.60)}

# Réplica de backend/tarpu_api/ingesta.py (leer_normalizado), copiada el 15/11/2026.
_CABECERA = re.compile(r"^(?P<nombre>[^()]+?)\s*\((?P<unidad>.*)\)\s*$")


def leer_normalizado(texto: str):
    lector = csv.reader(io.StringIO(texto))
    cabecera = next(lector)
    if not cabecera or cabecera[0] != "fecha":
        raise ValueError("el normalizado debe empezar con la columna «fecha»")
    nombres, unidades = [], {}
    for col in cabecera[1:]:
        m = _CABECERA.match(col)
        nombre = m.group("nombre").strip() if m else col.strip()
        nombres.append(nombre)
        unidades[nombre] = m.group("unidad") if m else ""
    fechas, valores = [], {n: [] for n in nombres}
    for fila in lector:
        if not fila:
            continue
        fechas.append(fila[0])
        for n, celda in zip(nombres, fila[1:]):
            celda = celda.strip()
            valores[n].append(float(celda) if celda != "" else None)
    return fechas, valores, unidades


resultados: list[tuple[str, str, str]] = []


def anotar(fila: str, estado: str, detalle: str) -> None:
    resultados.append((fila, estado, detalle))


def comprobar(fila: str, condicion: bool, detalle: str) -> None:
    anotar(fila, 'OK' if condicion else 'FALLA', detalle)


def _norm(base: str):
    ruta = SALIDA / f'{base}.normalizado.csv'
    if not ruta.exists():
        return None
    return leer_normalizado(ruta.read_text(encoding='utf-8'))


def _proc(base: str) -> dict:
    return json.loads((SALIDA / f'{base}.procedencia.json').read_text(encoding='utf-8'))


def prueba_power() -> None:
    base = 'power_chivay_20150101_20251231'
    datos = _norm(base)
    if not datos:
        return anotar('POWER Chivay 2015-2025', 'sin ejecutar', f'falta {base}')
    fechas, valores, _ = datos
    faltan = sum(v is None for col in valores.values() for v in col)
    helada = sum(1 for f, v in zip(fechas, valores['FROST_DAYS']) if f[5:7] == '07' and v and v > 0)
    elev = _proc(base).get('cell_elevation_m')
    comprobar('POWER Chivay 2015-2025', len(fechas) == 4018 and faltan == 0 and elev == 4351.89 and helada == 322,
              f'{len(fechas)} días · {faltan} faltantes · elevación {elev} m · FROST_DAYS>0 en julio: {helada} días '
              f'(esperado 4018 · 0 · 4351.89 · 322)')


def prueba_soilgrids() -> None:
    for lugar, esperado in (('chivay', 6.9), ('majes_riego', 8.1)):
        datos = _norm(f'soilgrids_{lugar}')
        if not datos or 'phh2o_0-5cm_mean' not in datos[1]:
            anotar(f'SoilGrids pH 0-5 cm {lugar}', 'sin ejecutar', f'falta soilgrids_{lugar}')
            continue
        valor = datos[1]['phh2o_0-5cm_mean'][0]
        comprobar(f'SoilGrids pH 0-5 cm {lugar}', valor == esperado, f'{valor} (esperado {esperado})')
        # Contra la REST guardada por el área de datos: todos los valores que existan en las dos.
        rest = MUESTRAS / f'soilgrids_{lugar}.original.json'
        if not rest.exists():
            continue
        iguales, distintos = 0, []
        original = json.loads((SALIDA / f'soilgrids_{lugar}.original.json').read_text(encoding='utf-8'))
        for capa in json.loads(rest.read_text(encoding='utf-8'))['properties']['layers']:
            for prof in capa['depths']:
                for v, r in prof['values'].items():
                    entrada = original.get(f'{capa["name"]}_{prof["label"]}_{v}', {})
                    if 'lectura' not in entrada:
                        continue
                    pp = entrada['lectura']['pixel_del_punto']
                    w = entrada['lectura']['pixels'][pp['fila']][pp['columna']]
                    if w == r:
                        iguales += 1
                    else:
                        distintos.append(f'{capa["name"]}_{prof["label"]}_{v}: WCS {w} / REST {r}')
        comprobar(f'SoilGrids WCS = REST guardada, {lugar}', not distintos and iguales > 0,
                  f'{iguales} iguales, {len(distintos)} distintos {distintos[:3]}')


def prueba_gaez() -> None:
    esperados = [('suHi_wpo', 256952, {'majes_riego': 3333, 'chivay': 0}),
                 ('suHg_wpo', 256923, {'majes_riego': 5556}),
                 ('suHi_brl', 256926, {'majes_riego': 5556, 'chivay': 0}),
                 ('sxHr_wpo', 257881, {'majes_riego': 0, 'chivay': 0}),
                 ('sxHr_brl', 257836, {'majes_riego': 0, 'chivay': 0})]
    for nombre, oid, por_lugar in esperados:
        for lugar, esperado in por_lugar.items():
            ruta = SALIDA / f'gaez_{lugar}.procedencia.json'
            capa = None
            if ruta.exists():
                capa = next((c for c in _proc(f'gaez_{lugar}')['layers'] if c['name'] == nombre), None)
            if not capa:
                anotar(f'GAEZ {nombre} {lugar}', 'sin ejecutar', f'sin la capa en gaez_{lugar}')
                continue
            comprobar(f'GAEZ {nombre} {lugar}', capa['objectid'] == oid and capa['value'] == esperado,
                      f'objectid {capa["objectid"]} valor {capa["value"]} (esperado {oid} · {esperado})')


def prueba_luz() -> None:
    v = [(j, luz.horas_de_luz(-16.4, j)) for j in range(1, 366)]
    mn, mx = min(v, key=lambda x: x[1]), max(v, key=lambda x: x[1])
    comprobar('Horas de luz a -16,4°', (mn[0], round(mn[1], 2), mx[0], round(mx[1], 2)) == (172, 11.02, 354, 12.98),
              f'mínimo {mn[1]:.2f} h (día {mn[0]}) · máximo {mx[1]:.2f} h (día {mx[0]})')


def prueba_mcd12q1() -> None:
    esperados = {'majes_riego': [14, 14, 14, 14, 12, 12, 12, 14, 14, 14], 'chivay': [10] * 10}
    for lugar, esperado in esperados.items():
        datos = _norm(f'mcd12q1_{lugar}_20150101_20241231')
        if not datos:
            anotar(f'MCD12Q1 2015-2024 {lugar}', 'sin ejecutar', f'falta mcd12q1_{lugar}_20150101_20241231')
            continue
        clases = [int(x) if x is not None else None for x in datos[1]['LC_Type1']]
        comprobar(f'MCD12Q1 2015-2024 {lugar}', clases == esperado, f'{clases}')


def prueba_mod13q1() -> None:
    for lugar in LUGARES:
        base = f'mod13q1_{lugar}_20150101_20261016'
        datos = _norm(base)
        if not datos:
            anotar(f'MOD13Q1 2015-01-01 a 2026-10-16 {lugar}', 'sin ejecutar', f'falta {base}')
            continue
        fechas, valores, _ = datos
        ndvi, cal = valores['250m_16_days_NDVI'], valores['250m_16_days_pixel_reliability']
        muestra = MUESTRAS / f'mod13q1-ndvi_{lugar}_20150101_20261114.normalizado.csv'
        ref = {}
        with muestra.open(encoding='utf-8') as archivo:
            for fila in csv.DictReader(archivo):
                ref[fila['fecha']] = (fila['NDVI (sin unidad)'], fila['pixel_reliability (rank 0-3)'])
        distintos = []
        for f, n, c in zip(fechas, ndvi, cal):
            rn, rc = ref.get(f, ('?', '?'))
            if (rn == '' and n is not None) or (rn not in ('', '?') and (n is None or abs(float(rn) - n) > 1e-9)) \
                    or rn == '?' or (rc != '' and (c is None or int(rc) != int(c))):
                distintos.append(f'{f}: {n},{c} / muestra {rn},{rc}')
        comprobar(f'MOD13Q1 2015-01-01 a 2026-10-16 {lugar}', len(fechas) == 272 and not distintos,
                  f'{len(fechas)} fechas (esperado 272) · {len(distintos)} distintas de la muestra {distintos[:3]}')
        resumen = CACHE / 'ornl' / f'_resumen_{lugar}_MOD13Q1.json'
        if resumen.exists():
            r = json.loads(resumen.read_text(encoding='utf-8'))
            comprobar(f'Paralelo NDVI {lugar}', r['elapsed_s'] < 3600,
                      f'{r["blocks_total"]} bloques en {r["elapsed_s"] / 60:.1f} min · {r["resumen"]}')


def prueba_tiff_y_lector() -> None:
    tifs = sorted(CACHE.glob('soilgrids/**/*.tif'))
    if tifs:
        malos = []
        for t in tifs:
            try:
                soilgrids.leer_geotiff(t.read_bytes())
            except soilgrids.TiffNoLegible as error:
                malos.append(f'{t.name}: {error}')
        comprobar('Lector GeoTIFF (caché real)', not malos, f'{len(tifs) - len(malos)} de {len(tifs)} legibles {malos[:2]}')
    else:
        anotar('Lector GeoTIFF (caché real)', 'sin ejecutar', 'no hay .tif en cache/soilgrids')
    for ruta in sorted(SALIDA.glob('*.normalizado.csv')):
        try:
            fechas, valores, unidades = leer_normalizado(ruta.read_text(encoding='utf-8'))
            comprobar(f'Lector del backend: {ruta.name}', True, f'{len(fechas)} filas · {len(valores)} columnas')
        except Exception as error:  # noqa: BLE001
            comprobar(f'Lector del backend: {ruta.name}', False, f'{type(error).__name__}: {error}')


def main() -> int:
    for prueba in (prueba_power, prueba_soilgrids, prueba_gaez, prueba_luz, prueba_mcd12q1, prueba_mod13q1,
                   prueba_tiff_y_lector):
        try:
            prueba()
        except Exception as error:  # noqa: BLE001 - una prueba rota no oculta las demás
            anotar(prueba.__name__, 'FALLA', f'{type(error).__name__}: {error}')
    ancho = max(len(f) for f, _, _ in resultados)
    for fila, estado, detalle in resultados:
        print(f'{estado:<12} {fila:<{ancho}}  {detalle}')
    return 1 if any(e == 'FALLA' for _, e, _ in resultados) else 0


if __name__ == '__main__':
    sys.exit(main())

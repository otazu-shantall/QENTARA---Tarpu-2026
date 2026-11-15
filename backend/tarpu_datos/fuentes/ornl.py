"""MODIS por el servicio de ORNL DAAC (MODIS/VIIRS Land Product Subsets), en paralelo.

Límites oficiales (https://modis.ornl.gov/data/modis_webservice.html): una banda y máximo 10 fechas
por petición (en MCD12Q1, máximo 10 años: con fechas anuales es lo mismo).
- /bands (por producto) y /dates (por producto y punto) se guardan en caché: tardan 20-40 s.
- Todos los bloques de todos los productos y bandas van a UNA cola, de lo más reciente a lo más
  antiguo, con un tope global de peticiones simultáneas (parámetro; 4 por defecto).
- Reintentos cortos en línea; un bloque que falla no detiene a los demás y pasa a una ronda final
  con menos hilos y esperas largas. Si aún falla, el estado es «parcial» con las fechas que faltan.
- Cada bloque se guarda en disco apenas llega (escritura atómica): un relanzamiento retoma.
- Escala, relleno, rango válido y unidades se LEEN de /bands; nunca se fijan en el código.
  Relleno o fuera de rango => vacío, nunca 0.
- Normalizado solo numérico (lo exige el lector del backend). El texto (modis_date, etiqueta de
  calidad, nombre de la clase IGBP, tesela) va en <base>.detalle.csv.
Un píxel de 250 m a 1 km mezcla varias parcelas: describe la zona. El NDVI no mide fertilidad.
Modelo: datos/ndvi/consulta_ndvi.py.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import json
import threading
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from .cliente import (Cache, PeticionFallida, Progreso, Servicio, ahora_iso, clave_punto,
                      escribir_atomico, escribir_csv, escribir_tres, log, resultado)

API = 'https://modis.ornl.gov/rst/api/v1'
FECHAS_POR_PETICION = 10
PRODUCTOS = {
    'MOD13Q1': ['250m_16_days_NDVI', '250m_16_days_pixel_reliability'],
    'MOD16A2GF': ['ET_500m', 'PET_500m'],
    'MOD11A2': ['LST_Day_1km', 'LST_Night_1km'],
    'MCD12Q1': ['LC_Type1'],
}
# Significado de pixel_reliability según la guía de usuario de MOD13 (igual que consulta_ndvi.py).
CALIDAD = {0: 'bueno', 1: 'marginal', 2: 'nieve o hielo', 3: 'nubes'}
# Clases IGBP de LC_Type1: MCD12 User Guide (Sulla-Menashe y Friedl, 2018), tabla 3.
IGBP = {1: 'Evergreen Needleleaf Forests', 2: 'Evergreen Broadleaf Forests', 3: 'Deciduous Needleleaf Forests',
        4: 'Deciduous Broadleaf Forests', 5: 'Mixed Forests', 6: 'Closed Shrublands', 7: 'Open Shrublands',
        8: 'Woody Savannas', 9: 'Savannas', 10: 'Grasslands', 11: 'Permanent Wetlands', 12: 'Croplands',
        13: 'Urban and Built-up Lands', 14: 'Cropland/Natural Vegetation Mosaics', 15: 'Permanent Snow and Ice',
        16: 'Barren', 17: 'Water Bodies'}
ETIQUETAS = {'250m_16_days_pixel_reliability': ('calidad', CALIDAD), 'LC_Type1': ('clase_igbp', IGBP)}
ESPERAS_METADATOS_S = (5, 15, 30, 60)


def tramos_anclados(todas: list[str], elegidas: list[str]) -> list[list[str]]:
    """Bloques de FECHAS_POR_PETICION fechas contados desde la PRIMERA fecha del producto en el punto.

    Así los bloques no cambian al ampliar el período: al actualizar solo se pide el último bloque (el que
    crece) y los nuevos. Se devuelven solo los bloques que tocan alguna fecha elegida."""
    quiero = set(elegidas)
    bloques = [todas[i:i + FECHAS_POR_PETICION] for i in range(0, len(todas), FECHAS_POR_PETICION)]
    return [b for b in bloques if quiero.intersection(b)]


def _esperas_finales(espera_max: float) -> tuple[float, ...]:
    esperas = tuple(e for e in (15, 30, 60, 120, 240) if e <= espera_max)
    return esperas or (espera_max,)


def _numero(texto) -> float | None:
    try:
        return float(texto)
    except (TypeError, ValueError):
        return None


def _meta_banda(meta: dict) -> dict:
    """Escala, relleno, rango y desplazamiento tal como los da /bands."""
    rango = None
    if isinstance(meta.get('valid_range'), str) and ' to ' in meta['valid_range']:
        a, b = meta['valid_range'].split(' to ')
        if _numero(a) is not None and _numero(b) is not None:
            rango = (float(a), float(b))
    return {'escala': _numero(meta.get('scale_factor')), 'relleno': _numero(meta.get('fill_value')),
            'rango': rango, 'offset': _numero(meta.get('add_offset')), 'unidades': meta.get('units') or ''}


def obtener(*, lat: float, lon: float, salida: str, cache: str, inicio: str | None = None,
            fin: str | None = None, progreso=None, nombre: str | None = None, producto: str = 'MOD13Q1',
            bandas: list[str] | None = None, **opciones) -> dict:
    """Interfaz del backend: un producto. Para varios a la vez (una sola cola), usa obtener_varios."""
    return obtener_varios(lat=lat, lon=lon, salida=salida, cache=cache, inicio=inicio, fin=fin,
                          progreso=progreso, nombre=nombre, productos={producto: bandas or PRODUCTOS.get(producto)},
                          **opciones)[producto]


def obtener_varios(*, lat: float, lon: float, salida: str, cache: str, inicio: str | None = None,
                   fin: str | None = None, progreso=None, nombre: str | None = None,
                   productos: dict[str, list[str] | None] | None = None, tope: int = 4,
                   espera_max: float = 120, max_tramos: int | None = None, refrescar_fechas_dias: float | None = 8,
                   cancelar: threading.Event | None = None, **_: object) -> dict[str, dict]:
    """cancelar: si se activa, no se piden más bloques (los ya guardados quedan en caché para retomar)."""
    comienzo = time.monotonic()
    productos = {p: (b or PRODUCTOS.get(p)) for p, b in (productos or {'MOD13Q1': None}).items()}
    nombre = nombre or clave_punto(lat, lon)
    clave = clave_punto(lat, lon)
    servicio = Servicio('ORNL', tope)
    caja = Cache(Path(cache) / 'ornl')
    punto = {'latitude': lat, 'longitude': lon}
    resultados: dict[str, dict] = {}

    # 1) Metadatos de cada producto (en paralelo, con el mismo tope).
    def metadatos(producto: str) -> dict:
        bandas = caja.obtener_json(f'_bands_{producto}.json', servicio, f'{API}/{producto}/bands',
                                   timeout=120, esperas=ESPERAS_METADATOS_S, etiqueta=f'{producto}/bands')
        fechas = caja.obtener_json(f'{clave}/_dates_{producto}.json', servicio,
                                   f'{API}/{producto}/dates?' + urllib.parse.urlencode(punto),
                                   max_edad_dias=refrescar_fechas_dias,
                                   timeout=120, esperas=ESPERAS_METADATOS_S, etiqueta=f'{producto}/dates')
        return {'bands': bandas, 'dates': fechas}

    meta: dict[str, dict] = {}
    with ThreadPoolExecutor(max_workers=servicio.tope) as hilos:
        futuros = {p: hilos.submit(metadatos, p) for p in productos}
    for producto, futuro in futuros.items():
        try:
            meta[producto] = futuro.result()
        except PeticionFallida as error:
            resultados[producto] = resultado('sin_datos', motivo=f'ORNL {producto}: {error.motivo}')
        if producto in meta:
            disponibles = {b['band'] for b in meta[producto]['bands']['response'].get('bands', [])}
            ajenas = [b for b in productos[producto] if b not in disponibles]
            if ajenas:
                resultados[producto] = resultado('sin_datos', motivo=f'ORNL {producto}: bandas inexistentes {ajenas}')
                del meta[producto]

    # 2) Cola única de bloques, de lo más reciente a lo más antiguo.
    tareas = []
    elegidas: dict[str, list[dict]] = {}
    for producto in meta:
        todas = meta[producto]['dates']['response'].get('dates', [])
        sel = [f for f in todas if (not inicio or f['calendar_date'] >= inicio) and (not fin or f['calendar_date'] <= fin)]
        if not sel:
            resultados[producto] = resultado('sin_datos', motivo=f'ORNL {producto}: sin fechas entre {inicio} y {fin}')
            continue
        elegidas[producto] = sel
        tramos = tramos_anclados([f['modis_date'] for f in todas], [f['modis_date'] for f in sel])
        tramos.reverse()  # lo más reciente primero
        if max_tramos:
            tramos = tramos[:max_tramos]
        for tramo in tramos:
            for banda in productos[producto]:
                tareas.append((tramo[-1], producto, banda, tramo))
    tareas.sort(key=lambda t: (t[0][1:5], t[0][5:]), reverse=True)

    avance = Progreso(len(tareas), progreso, 'ORNL')
    bloques: dict[tuple, dict] = {}
    lock = threading.Lock()

    def bajar(tarea, esperas) -> None:
        _, producto, banda, tramo = tarea
        if cancelar is not None and cancelar.is_set():
            with lock:
                bloques[(producto, banda, tramo[0])] = {'request_url': None, 'error': 'cancelado por el usuario', 'tramo': tramo}
            return
        nombre_archivo = f'{clave}/{producto}/{banda}_{tramo[0]}_{tramo[-1]}.json'
        url = f'{API}/{producto}/subset?' + urllib.parse.urlencode({
            **punto, 'band': banda, 'startDate': tramo[0], 'endDate': tramo[-1], 'kmAboveBelow': 0, 'kmLeftRight': 0})
        try:
            guardado = caja.obtener_json(nombre_archivo, servicio, url, timeout=120, esperas=esperas,
                                         etiqueta=f'{producto} {banda} {tramo[0]}-{tramo[-1]}')
            with lock:
                bloques[(producto, banda, tramo[0])] = {**guardado, 'tramo': tramo}
            avance.paso(f'{producto} {banda} {tramo[0]}-{tramo[-1]}')
        except PeticionFallida as error:
            with lock:
                bloques[(producto, banda, tramo[0])] = {'request_url': url, 'error': error.motivo, 'tramo': tramo}
            log(f'ORNL {producto} {banda} {tramo[0]}-{tramo[-1]} pasa a la ronda final: {error.motivo[:150]}')

    with ThreadPoolExecutor(max_workers=servicio.tope) as hilos:
        list(hilos.map(lambda t: bajar(t, (2, 4, 8)), tareas))
    pendientes = [t for t in tareas if 'error' in bloques[(t[1], t[2], t[3][0])]]
    if pendientes and not (cancelar is not None and cancelar.is_set()):
        esperas = _esperas_finales(espera_max)
        log(f'ORNL: ronda final para {len(pendientes)} bloques con {max(1, servicio.tope // 2)} hilos '
            f'y esperas {esperas} s')
        with ThreadPoolExecutor(max_workers=max(1, servicio.tope // 2)) as hilos:
            list(hilos.map(lambda t: bajar(t, esperas), pendientes))
    log(servicio.resumen())

    # 3) Un juego de archivos por producto.
    for producto in elegidas:
        resultados[producto] = _escribir_producto(
            producto, productos[producto], meta[producto], elegidas[producto], bloques, servicio, caja,
            lat=lat, lon=lon, salida=salida, nombre=nombre, inicio=inicio, fin=fin, max_tramos=max_tramos)
    escribir_atomico(Path(cache) / 'ornl' / f'_resumen_{nombre}_{"-".join(elegidas) or "ninguno"}.json', json.dumps(
        {'at': ahora_iso(), 'elapsed_s': round(time.monotonic() - comienzo, 1), 'blocks_total': len(tareas),
         'resumen': servicio.resumen(), 'stats': servicio.stats,
         'productos': {p: {k: v for k, v in r.items() if k != 'archivos'} for p, r in resultados.items()}},
        ensure_ascii=False, indent=1))
    return resultados


def _escribir_producto(producto, bandas, meta, elegidas, bloques, servicio, caja, *, lat, lon, salida,
                       nombre, inicio, fin, max_tramos) -> dict:
    metas = {b['band']: b for b in meta['bands']['response'].get('bands', [])}
    reglas = {b: _meta_banda(metas[b]) for b in bandas}
    mios = {k: v for k, v in bloques.items() if k[0] == producto}
    falla = [v for v in mios.values() if 'error' in v]
    pedidas = set()
    filas: dict[str, dict] = {}
    teselas, celda = set(), None
    for (_, banda, _), bloque in mios.items():
        if 'error' in bloque:
            continue
        respuesta = bloque['response']
        celda = respuesta.get('cellsize', celda)
        for registro in respuesta.get('subset', []):
            fila = filas.setdefault(registro['modis_date'], {'fecha': registro['calendar_date']})
            fila[registro['band']] = registro['data'][0] if registro.get('data') else None
            teselas.add(registro.get('tile'))
            pedidas.add(registro['modis_date'])

    por_fecha = {f['modis_date']: f['calendar_date'] for f in elegidas}
    if max_tramos:  # prueba a pequeña escala: solo las fechas de los tramos pedidos
        en_tramos = {d for v in mios.values() for d in v['tramo']}
        por_fecha = {d: c for d, c in por_fecha.items() if d in en_tramos}
    faltan, faltantes, problemas = [], {b: 0 for b in bandas}, []
    for bloque in falla:
        t = bloque['tramo']
        faltan.append(f'{producto}: {por_fecha.get(t[0], t[0])} a {por_fecha.get(t[-1], t[-1])} '
                      f'({t[0]}-{t[-1]}), {bloque["error"].splitlines()[0][:160]}')
    for b, r in reglas.items():
        if r['offset'] not in (None, 0.0):
            problemas.append(f'{b}: add_offset {r["offset"]} distinto de 0 sin regla verificada; columna vacía')

    normal, detalle = [], []
    etiquetas = [b for b in bandas if b in ETIQUETAS]
    for modis_date in sorted(por_fecha, key=lambda d: (d[1:5], d[5:])):
        fila = filas.get(modis_date, {})
        salida_fila, detalle_fila = [por_fecha[modis_date]], [por_fecha[modis_date], modis_date]
        for b in bandas:
            r = reglas[b]
            crudo = fila.get(b)
            valido = (crudo is not None and crudo != r['relleno']
                      and (r['rango'] is None or r['rango'][0] <= crudo <= r['rango'][1]))
            if not valido or r['offset'] not in (None, 0.0):
                valor = None
                faltantes[b] += 1
            elif b in ETIQUETAS or r['escala'] is None:
                valor = int(crudo) if float(crudo).is_integer() else crudo
            else:
                valor = round(crudo * r['escala'], 6)
            salida_fila.append(valor)
            detalle_fila.append(crudo)
        for b in etiquetas:
            columna, mapa = ETIQUETAS[b]
            crudo = fila.get(b)
            detalle_fila.append(mapa.get(int(crudo), '') if crudo is not None and crudo != reglas[b]['relleno'] else '')
        normal.append(salida_fila)
        detalle.append(detalle_fila + [','.join(sorted(t for t in teselas if t))])

    def unidad(b: str) -> str:
        r = reglas[b]
        if b in ETIQUETAS or r['escala'] is None:
            return f'{r["unidades"]}; class code' if b in ETIQUETAS else r['unidades']
        return r['unidades']

    ini = (inicio or por_fecha[min(por_fecha, key=lambda d: (d[1:5], d[5:]))] if por_fecha else '').replace('-', '')
    fi = (fin or '').replace('-', '') or 'ultimo'
    base = f'{producto.lower()}_{nombre}_{ini}_{fi}' + (f'_prueba{max_tramos}tramos' if max_tramos else '')
    original = {'bands': meta['bands'], 'dates': meta['dates'],
                'subsets': [v for k, v in sorted(mios.items(), key=lambda kv: kv[0][1:])],
                'selected_dates': list(por_fecha)}
    procedencia = {
        'source_id': 'ORNL DAAC MODIS/VIIRS Land Product Subsets', 'product_id': producto,
        'bands': {b: {k: metas[b].get(k) for k in ('units', 'valid_range', 'fill_value', 'scale_factor',
                                                   'add_offset', 'description')} for b in bandas},
        'conversion': 'value = raw * scale_factor (from /bands); fill or out of valid_range => empty. '
                      'Categorical bands (quality, land cover) keep the raw class code.',
        'label_sources': {'250m_16_days_pixel_reliability': 'MOD13 user guide (pixel reliability ranks)',
                          'LC_Type1': 'MCD12 User Guide (Sulla-Menashe and Friedl, 2018), IGBP classes; '
                                      'labels in .detalle.csv only'},
        'request_base': f'{API}/{producto}/subset', 'bands_url': meta['bands']['request_url'],
        'dates_url': meta['dates']['request_url'],
        'requests_this_product': len(mios), 'blocks_failed': len(falla),
        'service_stats_all_products': servicio.stats, 'blocks_from_cache_all_products': caja.desde_cache,
        'blocks_fetched_all_products': caja.pedidos, 'concurrency_cap': servicio.tope,
        'written_at': ahora_iso(), 'point': {'latitude': lat, 'longitude': lon},
        'cellsize_m': celda, 'tiles': sorted(t for t in teselas if t),
        'observed_start': inicio, 'observed_end': fin,
        'dates_in_period': len(por_fecha), 'dates_returned': len(pedidas & set(por_fecha)),
        'first_date': normal[0][0] if normal else None, 'last_date': normal[-1][0] if normal else None,
        'missing_values_by_band': faltantes, 'missing_blocks': faltan, 'problems': problemas,
        'small_scale_test_max_blocks': max_tramos,
        'note': 'Single MODIS pixel (250 m to 1 km): mixes several fields; describes the area, not one plot. '
                'NDVI is a greenness index, not a measure of soil fertility.',
        'generated_with': 'tarpu_datos (written with AI assistance, Claude Code).',
    }
    archivos = escribir_tres(salida, base, original=original,
                             cabecera=['fecha'] + [f'{b} ({unidad(b)})' for b in bandas],
                             filas=normal, procedencia=procedencia)
    ruta_detalle = Path(salida) / f'{base}.detalle.csv'
    escribir_csv(ruta_detalle, ['fecha', 'modis_date'] + [f'{b}_crudo' for b in bandas]
                 + [ETIQUETAS[b][0] for b in etiquetas] + ['tesela'], detalle)
    archivos['detalle'] = str(ruta_detalle)
    faltan_todo = faltan + problemas + [f'{b}: {n} fechas sin valor válido' for b, n in faltantes.items() if n]
    if not pedidas:
        return resultado('sin_datos', archivos, faltan_todo, falla[0]['error'] if falla else 'sin bloques')
    return resultado('parcial' if faltan_todo else 'listo', archivos, faltan_todo)

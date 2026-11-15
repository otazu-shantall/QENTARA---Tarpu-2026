"""Mapa de los sectores de TARPU (DT-18) para toda la caja de Arequipa, calculado desde NASADEM.

Cada celda de `paso` grados (0,01° ≈ 1 km por defecto) toma la altitud del píxel de NASADEM más cercano a su centro
y se clasifica con los límites de backend/catalogo/sectores.json (S1, S2, S3; por encima de S3, «fuera»).
Regla de dibujo (no científica): altitud ≤ 0 m o sin tesela se deja transparente, para no pintar el mar como S1.
El resultado se guarda en almacen/base_arequipa/derivados/ (PNG con transparencia + JSON con límites y conteos)
y se reutiliza; solo se recalcula si falta o se pide.
Uso interno y de prueba: el usuario final ve un mapa normal (DT-18).
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import json
import math
import struct
import sys
import zipfile
import zlib
from array import array
from pathlib import Path

from ..fuentes.cliente import ahora_iso, escribir_atomico, log
from .leer import BASE, CAJA, CATALOGO

DERIVADOS = BASE / 'derivados'
COLORES = {'S1': (232, 168, 56, 150), 'S2': (76, 160, 92, 150), 'S3': (70, 120, 200, 150), 'fuera': (170, 170, 170, 150)}


def _png(ancho: int, alto: int, filas: list[bytes]) -> bytes:
    def trozo(tipo: bytes, datos: bytes) -> bytes:
        return struct.pack('>I', len(datos)) + tipo + datos + struct.pack('>I', zlib.crc32(tipo + datos) & 0xffffffff)
    crudo = b''.join(b'\x00' + f for f in filas)  # filtro 0 en cada fila
    return (b'\x89PNG\r\n\x1a\n' + trozo(b'IHDR', struct.pack('>IIBBBBB', ancho, alto, 8, 6, 0, 0, 0))
            + trozo(b'IDAT', zlib.compress(crudo, 9)) + trozo(b'IEND', b''))


def _limites() -> list[tuple[str, float, float]]:
    datos = json.loads((CATALOGO / 'sectores.json').read_text(encoding='utf-8'))
    return [(k, s['altitud_m'][0], s['altitud_m'][1]) for k, s in datos['sectores'].items()]


def generar(paso: float = 0.01, forzar: bool = False) -> dict:
    nombre = f'sectores_{str(paso).replace(".", "p")}'
    png, meta_ruta = DERIVADOS / f'{nombre}.png', DERIVADOS / f'{nombre}.json'
    if png.exists() and meta_ruta.exists() and not forzar:
        return json.loads(meta_ruta.read_text(encoding='utf-8'))
    ancho = round((CAJA['este'] - CAJA['oeste']) / paso)
    alto = round((CAJA['norte'] - CAJA['sur']) / paso)
    limites = _limites()
    clase = [[None] * ancho for _ in range(alto)]
    conteo = {k: 0 for k in COLORES} | {'sin_dato': 0}
    # Agrupar las celdas por tesela de 1° para leer cada .hgt una sola vez.
    por_tesela: dict[tuple[int, int], list[tuple[int, int, float, float]]] = {}
    for y in range(alto):
        lat = CAJA['norte'] - (y + 0.5) * paso
        for x in range(ancho):
            lon = CAJA['oeste'] + (x + 0.5) * paso
            por_tesela.setdefault((math.floor(lat), math.floor(lon)), []).append((y, x, lat, lon))
    for (sur, oeste), celdas in por_tesela.items():
        t = f"{'s' if sur < 0 else 'n'}{abs(sur):02d}{'w' if oeste < 0 else 'e'}{abs(oeste):03d}"
        ruta = BASE / 'nasadem' / f'NASADEM_HGT_{t}.zip'
        if not ruta.exists():
            conteo['sin_dato'] += len(celdas)
            continue
        with zipfile.ZipFile(ruta) as z:
            alturas = array('h', z.read(f'{t}.hgt'))
        if sys.byteorder == 'little':
            alturas.byteswap()  # el .hgt es big-endian
        for y, x, lat, lon in celdas:
            h = alturas[round((sur + 1 - lat) * 3600) * 3601 + round((lon - oeste) * 3600)]
            if h == -32768 or h <= 0:
                conteo['sin_dato'] += 1
                continue
            sector = next((k for k, bajo, alto_ in limites if bajo <= h < alto_), 'fuera')
            clase[y][x] = sector
            conteo[sector] += 1
        log(f'mapa de sectores: tesela {t} lista')
    filas = [b''.join(bytes(COLORES[c]) if c else b'\x00\x00\x00\x00' for c in fila) for fila in clase]
    DERIVADOS.mkdir(parents=True, exist_ok=True)
    escribir_atomico(png, _png(ancho, alto, filas))
    meta = {'archivo': png.name, 'generado': ahora_iso(), 'paso_grados': paso, 'ancho': ancho, 'alto': alto,
            'limites_mapa': [[CAJA['sur'], CAJA['oeste']], [CAJA['norte'], CAJA['este']]],
            'sectores': {k: {'altitud_m': [b, a], 'color_rgba': COLORES[k]} for k, b, a in limites},
            'fuera': {'descripcion': 'por encima del límite superior de S3', 'color_rgba': COLORES['fuera']},
            'celdas': conteo,
            'metodo': 'altitud NASADEM (píxel más cercano al centro de cada celda) clasificada con catalogo/sectores.json',
            'regla_de_dibujo': 'altitud ≤ 0 m o sin tesela: transparente (para no pintar el mar)',
            'aviso': 'La caja es un rectángulo que contiene Arequipa; no es el límite oficial de la región.'}
    escribir_atomico(meta_ruta, json.dumps(meta, ensure_ascii=False, indent=1))
    return meta


def ruta_png(paso: float = 0.01) -> Path:
    generar(paso)
    return DERIVADOS / f'sectores_{str(paso).replace(".", "p")}.png'


if __name__ == '__main__':
    print(json.dumps(generar(forzar='--forzar' in sys.argv), ensure_ascii=False, indent=1))

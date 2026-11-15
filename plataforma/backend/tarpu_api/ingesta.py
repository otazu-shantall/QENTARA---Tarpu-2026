"""Ingesta: convierte los archivos que dejan los conectores en registros (MODULOS.md §2).

Lee el normalizado (CSV con la unidad en la cabecera) y la procedencia, siempre a través de
almacen (el único módulo que toca el disco).
Regla: una celda vacía pasa a None, nunca a 0. Se conservan las unidades.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import csv
import io
import json
import re
from dataclasses import dataclass, field

from . import almacen

_CABECERA = re.compile(r"^(?P<nombre>[^()]+?)\s*\((?P<unidad>.*)\)\s*$")


@dataclass
class Serie:
    fechas: list[str]
    valores: dict[str, list[float | None]]
    unidades: dict[str, str]
    procedencia: dict = field(default_factory=dict)

    def columna(self, nombre: str) -> list[float | None]:
        return self.valores[nombre]


def leer_normalizado(texto: str) -> tuple[list[str], dict[str, list[float | None]], dict[str, str]]:
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
    fechas: list[str] = []
    valores: dict[str, list[float | None]] = {n: [] for n in nombres}
    for fila in lector:
        if not fila:
            continue
        fechas.append(fila[0])
        for n, celda in zip(nombres, fila[1:]):
            celda = celda.strip()
            valores[n].append(float(celda) if celda != "" else None)
    return fechas, valores, unidades


def leer(archivos: dict[str, str]) -> Serie:
    fechas, valores, unidades = leer_normalizado(almacen.leer_texto(archivos["normalizado"]))
    procedencia = json.loads(almacen.leer_texto(archivos["procedencia"]))
    return Serie(fechas, valores, unidades, procedencia)


def leer_original(archivos: dict[str, str]) -> str:
    return almacen.leer_texto(archivos["original"])

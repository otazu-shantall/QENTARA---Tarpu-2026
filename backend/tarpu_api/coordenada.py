"""Trabajos de extracción por coordenada (capa 2, DT-22) y lectura en crudo de sus archivos, para la API.

Delega en tarpu_datos.coordenada.trabajos. archivo() solo sirve archivos .csv y .json de dentro del almacén.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

from pathlib import Path

from tarpu_datos.coordenada import trabajos

from . import config, errores

MAX_BYTES = 8_000_000


def iniciar(lat: float, lon: float, nombre: str | None) -> dict:
    return trabajos.iniciar(lat, lon, nombre)


def estado(clave: str) -> dict:
    t = trabajos.estado(clave)
    if t is None:
        raise errores.datos_no_listos(f"No hay un trabajo con la clave {clave}.")
    return t


def archivo(ruta: str) -> dict:
    almacen = config.obtener().almacen_dir.resolve()
    p = Path(ruta).resolve()
    if not p.is_relative_to(almacen) or p.suffix not in (".csv", ".json") or not p.is_file():
        raise errores.datos_invalidos([{"campo": "ruta", "mensaje": "solo archivos .csv o .json dentro del almacén"}])
    tam = p.stat().st_size
    texto = p.read_text(encoding="utf-8", errors="replace")[:MAX_BYTES]
    return {"ruta": str(p.relative_to(almacen)), "bytes": tam, "recortado": tam > MAX_BYTES, "contenido": texto}

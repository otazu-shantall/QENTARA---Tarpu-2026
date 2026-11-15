"""Base de Arequipa (capa 1 del esquema mixto, DT-22) en un punto, para la API.

Delega en tarpu_datos.base.leer, que lee los archivos de backend/almacen/base_arequipa sin descargar nada.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

from tarpu_datos.base import leer as _leer

from . import errores


def en_punto(lat: float, lon: float) -> dict:
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise errores.datos_invalidos([{"campo": "lat/lon", "mensaje": "coordenadas fuera de rango"}])
    return _leer.leer(lat, lon)


def procedencia(resultado: dict) -> list[dict]:
    """Una entrada por fuente de la capa 1, con su origen."""
    salida = []
    for clave in ("relieve", "sector", "suelo", "aptitud", "clima"):
        parte = resultado.get(clave) or {}
        if parte.get("procedencia"):
            salida.append({"origen": "fuente", "bloque": clave, **parte["procedencia"]})
    return salida


def mapa_sectores() -> dict:
    """Metadatos del mapa de sectores (DT-18) calculado desde NASADEM; lo genera si falta (unos 3 s)."""
    from tarpu_datos.base import mapa
    return mapa.generar()


def ruta_mapa_sectores():
    from tarpu_datos.base import mapa
    return mapa.ruta_png()

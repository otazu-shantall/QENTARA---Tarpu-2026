"""Geometría del contorno dibujado (DISENO.md §4.1).

- validar: GeoJSON Polygon con al menos 3 puntos distintos, cerrado y sin cruces (Shapely).
- area_ha: área geodésica sobre el elipsoide WGS84 (pyproj.Geod), no un área plana.
- pixeles_modis_250m: cuántos píxeles nominales de 250 m × 250 m (6,25 ha) de MODIS caben en esa
  área. Es un dato geométrico, no un umbral: si sale menos de 1, el NDVI describe un píxel más
  grande que la parcela. Las tres fuentes (DT-17) se consultan en el centroide.
- Sin límites de tamaño inventados (DT-16).
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

from typing import Any

from pyproj import Geod
from shapely.geometry import Polygon, shape
from shapely.validation import explain_validity

from . import errores

_GEOD = Geod(ellps="WGS84")
AREA_PIXEL_MODIS_HA = 250 * 250 / 10_000  # 6,25 ha (tamaño nominal de MOD13Q1)


def validar(contorno: Any) -> Polygon:
    if not isinstance(contorno, dict) or contorno.get("type") != "Polygon":
        raise errores.contorno_invalido("Se espera un GeoJSON de tipo Polygon.")
    anillos = contorno.get("coordinates")
    if not isinstance(anillos, list) or not anillos or not isinstance(anillos[0], list):
        raise errores.contorno_invalido("El polígono no tiene coordenadas.")
    exterior = anillos[0]
    try:
        puntos = [(float(p[0]), float(p[1])) for p in exterior]
    except (TypeError, ValueError, IndexError):
        raise errores.contorno_invalido("Cada punto debe ser [longitud, latitud].") from None
    for lon, lat in puntos:
        if not (-180 <= lon <= 180 and -90 <= lat <= 90):
            raise errores.contorno_invalido(f"Punto fuera de rango: [{lon}, {lat}]. El orden es [longitud, latitud].")
    if len(puntos) < 4 or puntos[0] != puntos[-1]:
        raise errores.contorno_invalido("El contorno debe estar cerrado: el último punto repite el primero.")
    if len(set(puntos[:-1])) < 3:
        raise errores.contorno_invalido("El contorno necesita al menos 3 puntos distintos.")
    try:
        poligono = shape(contorno)
    except Exception as e:  # GeoJSON mal formado
        raise errores.contorno_invalido(f"GeoJSON no válido: {e}") from None
    if not poligono.is_valid:
        raise errores.contorno_invalido(explain_validity(poligono))
    if poligono.area == 0:
        raise errores.contorno_invalido("El contorno no encierra ninguna superficie.")
    return poligono


def area_y_perimetro(poligono: Polygon) -> tuple[float, float]:
    """Área en hectáreas y perímetro en metros, geodésicos (WGS84)."""
    area_m2, perimetro_m = _GEOD.geometry_area_perimeter(poligono)
    return abs(area_m2) / 10_000, perimetro_m


def pixeles_modis_250m(area_ha: float) -> float:
    return area_ha / AREA_PIXEL_MODIS_HA


def centroide(poligono: Polygon) -> dict:
    c = poligono.centroid
    return {"lat": round(c.y, 6), "lon": round(c.x, 6)}


def recuadro(poligono: Polygon) -> dict:
    oeste, sur, este, norte = poligono.bounds
    return {"oeste": oeste, "sur": sur, "este": este, "norte": norte}


def medir(contorno: Any) -> dict:
    """Valida y devuelve todo lo geométrico de una parcela."""
    poligono = validar(contorno)
    area_ha, perimetro_m = area_y_perimetro(poligono)
    return {
        "area_ha": round(area_ha, 4),
        "perimetro_m": round(perimetro_m, 1),
        "pixeles_modis_250m": round(pixeles_modis_250m(area_ha), 2),
        "centroide": centroide(poligono),
        "recuadro": recuadro(poligono),
        "metodo": "Área y perímetro geodésicos sobre el elipsoide WGS84 (pyproj.Geod). Píxeles de MODIS = área ÷ 6,25 ha (píxel nominal de 250 m). Los datos se consultan en el centroide.",
    }

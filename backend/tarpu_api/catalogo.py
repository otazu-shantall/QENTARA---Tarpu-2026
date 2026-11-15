"""Catálogo citado: carga catalogo/ecocrop_2026-11-14.json y RECHAZA cualquier regla sin fuente.

Así el motor no puede usar un valor sin cita (DT-16). Donde EcoCrop no trae el dato hay null,
y el criterio correspondiente sale «sin_regla».
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from . import config


class CatalogoInvalido(ValueError):
    pass


CAMPOS_RANGO = ("temperatura_c", "lluvia_anual_mm", "ph_suelo")


def validar(datos: dict[str, Any]) -> dict[str, Any]:
    cultivos = datos.get("cultivos")
    if not isinstance(cultivos, list) or not cultivos:
        raise CatalogoInvalido("el catálogo no tiene cultivos")
    vistos = set()
    for c in cultivos:
        nombre = c.get("cultivo")
        if not nombre or nombre in vistos:
            raise CatalogoInvalido(f"cultivo sin nombre o repetido: {nombre!r}")
        vistos.add(nombre)
        fuente = c.get("fuente") or {}
        if not fuente.get("nombre") or not str(fuente.get("url", "")).startswith("http") or not fuente.get("consultado"):
            raise CatalogoInvalido(f"{nombre}: regla sin fuente (falta nombre, url o fecha de consulta)")
        if not c.get("familia"):
            raise CatalogoInvalido(f"{nombre}: falta la familia")
        for campo in CAMPOS_RANGO:
            rango = c.get(campo)
            if rango is None:
                continue
            for tipo in ("optimo", "absoluto"):
                par = rango.get(tipo)
                if par is not None and (len(par) != 2 or par[0] > par[1]):
                    raise CatalogoInvalido(f"{nombre}: rango {campo}.{tipo} mal formado")
    return datos


@lru_cache(maxsize=4)
def _cargar(ruta: str) -> dict[str, Any]:
    return validar(json.loads(Path(ruta).read_text(encoding="utf-8")))


def cargar() -> dict[str, Any]:
    return _cargar(str(config.obtener().catalogo))


def cultivos() -> list[dict[str, Any]]:
    return cargar()["cultivos"]


def nombres() -> list[str]:
    return [c["cultivo"] for c in cultivos()]


def cultivo(nombre: str) -> dict[str, Any] | None:
    return next((c for c in cultivos() if c["cultivo"] == nombre), None)


def temperaturas_letales() -> list[float]:
    """Todas las temperaturas letales citadas (para contar noches bajo cada una)."""
    valores = set()
    for c in cultivos():
        for v in (c.get("temperatura_letal_c") or {}).values():
            if v is not None:
                valores.add(float(v))
    return sorted(valores)


def advertencias() -> list[str]:
    return list(cargar().get("advertencias", []))

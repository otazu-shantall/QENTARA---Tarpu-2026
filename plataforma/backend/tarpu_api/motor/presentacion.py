"""Paso 4 del motor · Presentación: orden de los criterios según las prioridades DECLARADAS.

Las prioridades solo cambian el orden en que se muestran. No se convierten en pesos ni en puntaje.
Sin prioridades declaradas, se usa el orden fijo de CRITERIOS (solo de presentación).
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

from ..parcelas import CRITERIOS


def ordenar(criterios: list[dict], prioridades: list[str] | None) -> list[dict]:
    orden = list(dict.fromkeys([p for p in (prioridades or []) if p in CRITERIOS] + list(CRITERIOS)))
    return sorted(criterios, key=lambda c: orden.index(c["criterio"]) if c["criterio"] in orden else len(orden))

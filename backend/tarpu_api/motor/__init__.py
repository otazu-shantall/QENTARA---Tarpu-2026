"""Motor de comparación de TARPU (MODULOS.md §4).

Función pública: comparar(parcela, contexto, indicadores).
Compara datos reales con rangos CITADOS de FAO EcoCrop, criterio por criterio.
Sin puntaje, sin pesos y sin «apto / no apto» (DT-16). Beneficios solo con cita.
No llama a los conectores: solo lee lo ya calculado.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

from datetime import datetime, timezone

from .. import catalogo
from . import comparacion, estrategias, evidencia, explicacion, presentacion

NOTA = ("Sin puntaje ni pesos: no hay una fuente que los respalde. Cada criterio se compara con su rango citado. "
        "TARPU apoya tu decisión; no reemplaza tu criterio ni el de un especialista.")


def comparar(parcela: dict, contexto: dict | None, indicadores: dict | None) -> dict:
    cand = estrategias.generar(contexto)
    ev = evidencia.reunir(contexto, indicadores)
    actual = catalogo.cultivo((contexto or {}).get("cultivo_actual") or "")
    salida = []
    for e in cand["estrategias"]:
        cultivo = catalogo.cultivo(e["cultivo"])
        criterios = presentacion.ordenar(comparacion.comparar(cultivo, actual, ev), (contexto or {}).get("prioridades"))
        texto = explicacion.frases(cultivo["cultivo"], criterios)
        salida.append({
            **e, "nombre_cientifico": cultivo["nombre_cientifico"], "familia": cultivo["familia"],
            "ciclo_dias": cultivo.get("ciclo_dias"), "criterios": criterios, **texto,
            "beneficios": {"estado": "sin_beneficio_citado", "nota": "Todavía no hay una fuente citada de beneficios (INIA u otra)."},
            "cita": comparacion.cita(cultivo),
        })
    return {
        "parcela_version": parcela["version"],
        "calculado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "cultivo_actual": (contexto or {}).get("cultivo_actual"),
        "estrategias": salida, "no_incluidos": cand["no_incluidos"],
        "vacios_generales": cand["vacios"] + ev["faltantes"],
        "advertencias_catalogo": catalogo.advertencias(), "nota": NOTA,
    }

"""Paso 1 del motor · Candidatas (MODULOS.md §4).

E1 = repetir el cultivo actual DECLARADO (si está en el catálogo).
E2… = TODOS los cultivos del catálogo de otra familia que el actual. No se eligen «los mejores»
con un criterio inventado. Si no se declaró un cultivo actual del catálogo, se listan todos los
del catálogo y se dice que falta ese dato.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

from .. import catalogo


def generar(contexto: dict | None) -> dict:
    actual_nombre = (contexto or {}).get("cultivo_actual")
    actual = catalogo.cultivo(actual_nombre) if actual_nombre else None
    estrategias, no_incluidos, vacios = [], [], []
    if actual:
        estrategias.append({"cultivo": actual["cultivo"], "tipo": "repetir_actual",
                            "por_que_aparece": f"Es tu cultivo actual (declarado por ti): repetir {actual['cultivo']}."})
        for c in catalogo.cultivos():
            if c["cultivo"] == actual["cultivo"]:
                continue
            if c["familia"] == actual["familia"]:
                no_incluidos.append({"cultivo": c["cultivo"], "motivo": f"Misma familia que tu cultivo actual ({c['familia']}, según FAO EcoCrop)."})
                continue
            estrategias.append({"cultivo": c["cultivo"], "tipo": "cambiar_de_familia",
                                "por_que_aparece": f"Es de otra familia ({c['familia']}) que tu cultivo actual ({actual['familia']}), según FAO EcoCrop."})
    else:
        if actual_nombre:
            vacios.append(f"Tu cultivo actual («{actual_nombre}») no está en el catálogo citado: no se puede comparar con EcoCrop.")
        else:
            vacios.append("No declaraste tu cultivo actual: no se puede saber qué cultivos cambian de familia.")
        for c in catalogo.cultivos():
            estrategias.append({"cultivo": c["cultivo"], "tipo": "cultivo_del_catalogo",
                                "por_que_aparece": "Está en el catálogo citado (FAO EcoCrop)."})
    for i, e in enumerate(estrategias, start=1):
        e["id"] = f"E{i}"
    return {"estrategias": estrategias, "no_incluidos": no_incluidos, "vacios": vacios}

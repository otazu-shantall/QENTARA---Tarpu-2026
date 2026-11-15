"""Agente guiado · Banco: respuestas por parcela (GET, se exporta) y pregunta libre (POST, solo en vivo).

Lee indicadores, rotaciones y el estado de procesamiento ya guardados. No llama al motor ni a los
conectores, no inventa observaciones y no cambia las reglas.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

from .. import almacen
from . import intenciones, plantillas


def _leer(parcela_id: str) -> tuple[dict | None, dict | None, dict | None]:
    return (almacen.leer(parcela_id, "indicadores"), almacen.leer(parcela_id, "rotaciones"), almacen.leer(parcela_id, "procesamiento"))


def responder(parcela_id: str, intencion: str | None, cultivo: str | None = None) -> dict:
    ind, rot, proc = _leer(parcela_id)
    match intencion:
        case "frio": return plantillas.frio(ind)
        case "lluvia": return plantillas.lluvia(ind)
        case "por_que_cultivo": return plantillas.por_que_cultivo(rot, cultivo)
        case "que_falta": return plantillas.que_falta(ind, rot, proc)
        case "ndvi": return plantillas.ndvi(proc)
        case "fuentes": return plantillas.fuentes(ind)
        case "descargar": return plantillas.descargar()
        case "pronostico": return plantillas.pronostico()
    return plantillas.no_reconocida()


def preguntar(parcela_id: str, pregunta: str) -> dict:
    r = intenciones.reconocer(pregunta)
    return {"pregunta": pregunta, **responder(parcela_id, r["intencion"], r["cultivo"])}


def banco(parcela_id: str) -> list[dict]:
    salida = [{"pregunta": ej, **responder(parcela_id, intencion)} for intencion, ej in intenciones.EJEMPLOS.items()]
    rot = almacen.leer(parcela_id, "rotaciones")
    for e in (rot or {}).get("estrategias", []):
        salida.append({"pregunta": f"¿Por qué aparece {e['cultivo']}?", **responder(parcela_id, "por_que_cultivo", e["cultivo"])})
    return salida

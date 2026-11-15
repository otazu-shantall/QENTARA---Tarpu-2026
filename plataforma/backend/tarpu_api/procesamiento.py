"""Procesamiento: prepara los datos de una parcela en segundo plano (DISENO.md §4.2).

POST …/procesar marca cada fuente como en_proceso y lanza el trabajo (BackgroundTasks).
GET  …/procesamiento devuelve el estado de cada fuente: listo · parcial · en_proceso · no_disponible,
con el motivo real. Si una fuente falla, las demás siguen.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone

from . import almacen, conectores, config, indicadores, parcelas


def _ahora() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def iniciar(parcela_id: str) -> dict:
    p = parcelas.obtener(parcela_id)
    estado = {
        "parcela_version": p["version"], "estado": "en_proceso", "iniciado": _ahora(), "terminado": None,
        "punto_consultado": p["centroide"],
        "fuentes": [{"id": f.id, "nombre": f.nombre, "resolucion": f.resolucion,
                     "estado": "en_proceso" if f.obtener else "no_disponible",
                     "motivo": None if f.obtener else f.motivo_no_disponible, "actualizado": _ahora()}
                    for f in conectores.REGISTRO],
    }
    almacen.guardar(parcela_id, "procesamiento", estado)
    return estado


def _faltantes(procedencia_archivo: str) -> int:
    p = json.loads(almacen.leer_texto(procedencia_archivo))
    return sum((p.get("missing_days") or {}).values())


def procesar(parcela_id: str) -> dict:
    estado = almacen.leer(parcela_id, "procesamiento")
    c = config.obtener()
    centro = estado["punto_consultado"]
    for item in estado["fuentes"]:
        f = conectores.fuente(item["id"])
        if f is None or f.obtener is None:
            continue
        try:
            r = f.obtener(lat=centro["lat"], lon=centro["lon"], inicio=c.power_inicio, fin=c.power_fin)
        except Exception as e:  # el conector no debe tumbar a los demás
            r = {"estado": "sin_datos", "archivos": None, "motivo": f"Error inesperado del conector: {e}"}
        if r["estado"] == "listo":
            faltan = _faltantes(r["archivos"]["procedencia"])
            item.update(estado="parcial" if faltan else "listo", archivos=r["archivos"],
                        motivo=f"{faltan} valores diarios sin dato en la respuesta del proveedor." if faltan else None)
        elif r["estado"] == "en_proceso":
            item.update(estado="en_proceso", solicitud_id=r.get("solicitud_id"), motivo=r.get("motivo"))
        else:
            item.update(estado="no_disponible", motivo=r.get("motivo"))
        item["actualizado"] = _ahora()
        almacen.guardar(parcela_id, "procesamiento", estado)
    indicadores.actualizar(parcela_id)
    estado["estado"] = "terminado" if all(i["estado"] != "en_proceso" for i in estado["fuentes"]) else "en_proceso"
    estado["terminado"] = _ahora()
    almacen.guardar(parcela_id, "procesamiento", estado)
    return estado


def leer(parcela_id: str) -> dict | None:
    parcelas.obtener(parcela_id)
    return almacen.leer(parcela_id, "procesamiento")

"""Datos detallados: registros por nivel, SIN pasar por el motor (DEC-003, MODULOS.md §3).

Niveles:
- original: la respuesta del proveedor, sin tocar;
- normalizado: una fila por fecha, con la unidad de cada columna; vacío = sin dato;
- derivado: lo que calcula indicadores, con su método.
Este módulo no importa el motor.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import json

from . import almacen, conectores, ingesta


def obtener(parcela_id: str) -> dict:
    proc = almacen.leer(parcela_id, "procesamiento") or {"fuentes": []}
    indicadores = almacen.leer(parcela_id, "indicadores")
    fuentes = []
    for estado in proc.get("fuentes", []):
        f = conectores.fuente(estado["id"])
        item = {"fuente": estado["id"], "nombre": f.nombre if f else estado["id"], "estado": estado["estado"],
                "motivo": estado.get("motivo"), "resolucion": f.resolucion if f else None}
        archivos = estado.get("archivos")
        if archivos:
            serie = ingesta.leer(archivos)
            item["original"] = {"descripcion": "Respuesta del proveedor, sin tocar.",
                                "contenido": json.loads(ingesta.leer_original(archivos))}
            item["normalizado"] = {
                "descripcion": "Una fila por fecha; celda vacía (null) = sin dato, nunca 0.",
                "columnas": [{"nombre": "fecha", "unidad": None}] + [{"nombre": n, "unidad": u} for n, u in serie.unidades.items()],
                "filas": [[fecha] + [serie.valores[n][i] for n in serie.unidades] for i, fecha in enumerate(serie.fechas)],
            }
            item["procedencia"] = serie.procedencia
        fuentes.append(item)
    derivado = None
    if indicadores:
        derivado = {"descripcion": "Calculado por TARPU a partir del normalizado.",
                    "metodo": [p.get("metodo") for p in indicadores.get("procedencia", [])],
                    "serie_mensual": indicadores.get("serie_mensual"), "indicadores": indicadores.get("data")}
    return {"fuentes": fuentes, "derivado": derivado}

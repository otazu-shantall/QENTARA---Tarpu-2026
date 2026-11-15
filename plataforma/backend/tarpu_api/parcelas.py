"""Parcelas y contexto declarado por el usuario (MODULOS.md §3).

- La parcela es el contorno que dibuja el usuario: nombre, versión y medidas de geometria.
- El contexto es lo que DECLARA el usuario: cultivo actual y anterior, agua, meses de campaña y
  prioridades. Se guarda con origen «declarado». «No sé» = null, nunca un valor por defecto.
- No hay parcelas ficticias (DT-16).
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import re
import secrets
import unicodedata
from datetime import datetime, timezone
from typing import Any

from . import almacen, catalogo, errores, geometria

CRITERIOS = ("temperatura", "frio", "lluvia", "suelo", "familia", "altitud")


def _ahora() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _slug(texto: str) -> str:
    t = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode().lower()
    t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")
    return t[:40] or "parcela"


def crear(nombre: str, contorno: dict) -> dict:
    medidas = geometria.medir(contorno)
    parcela_id = f"{_slug(nombre)}-{secrets.token_hex(3)}"
    registro = {
        "id": parcela_id, "nombre": nombre, "version": 1, "creada": _ahora(), "actualizada": _ahora(),
        "origen": "dibujado por el usuario", "contorno": contorno, **medidas,
    }
    almacen.guardar(parcela_id, "parcela", registro)
    return registro


def obtener(parcela_id: str) -> dict:
    registro = almacen.leer(parcela_id, "parcela") if almacen.existe_parcela(parcela_id) else None
    if registro is None:
        raise errores.parcela_no_existe(parcela_id)
    return registro


def listar() -> list[dict]:
    salida = []
    for pid in almacen.ids_parcelas():
        p = almacen.leer(pid, "parcela")
        salida.append({k: p[k] for k in ("id", "nombre", "version", "area_ha", "pixeles_modis_250m", "centroide", "actualizada")})
    return salida


def redibujar(parcela_id: str, contorno: dict) -> dict:
    registro = obtener(parcela_id)
    medidas = geometria.medir(contorno)
    registro.update({"contorno": contorno, **medidas, "version": registro["version"] + 1, "actualizada": _ahora()})
    almacen.guardar(parcela_id, "parcela", registro)
    return registro


def guardar_contexto(parcela_id: str, datos: dict[str, Any]) -> dict:
    obtener(parcela_id)
    avisos = []
    for campo in ("cultivo_actual", "cultivo_anterior"):
        valor = datos.get(campo)
        if valor is not None and catalogo.cultivo(valor) is None:
            avisos.append(f"«{valor}» no está en el catálogo citado ({', '.join(catalogo.nombres())}); "
                          "se guarda como lo declaraste, pero no se puede comparar con EcoCrop.")
    contexto = {
        "origen": "declarado",
        "cultivo_actual": datos.get("cultivo_actual"),
        "cultivo_anterior": datos.get("cultivo_anterior"),
        "agua": datos.get("agua"),
        # se respeta el orden declarado (una campaña puede ir de noviembre a abril)
        "meses_campana": list(dict.fromkeys(datos["meses_campana"])) if datos.get("meses_campana") else None,
        "prioridades": list(dict.fromkeys(datos.get("prioridades") or [])),
        "actualizado": _ahora(),
        "avisos": avisos,
    }
    almacen.guardar(parcela_id, "contexto", contexto)
    return contexto


def leer_contexto(parcela_id: str) -> dict | None:
    obtener(parcela_id)
    return almacen.leer(parcela_id, "contexto")

"""Lecturas en palabras sencillas de la base de Arequipa (capa 1), solo con reglas citadas (DT-16).

- Pendiente: clase FAO (2006), Guidelines for soil description, cuadro 7 (ya en tarpu_datos.base.leer).
- pH: se compara con el rango de pH de FAO EcoCrop de cada cultivo con más superficie en la zona
  (investigacion/cultivos_arequipa_2026-11-14.json, con la URL de cada ficha). Sin puntaje ni «apto/no apto»:
  dentro_optimo, dentro_absoluto, fuera_absoluto o sin_regla.
- Textura: solo dice qué fracción predomina (arena, limo o arcilla). La clase textural USDA queda sin_regla
  hasta copiar sus límites de la fuente (metodos_citados_2026-11-15.json, «textura», «pendiente»).
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from tarpu_datos.base.leer import CLASES_PENDIENTE

INVESTIGACION = Path(__file__).resolve().parents[1] / "investigacion"


@lru_cache(maxsize=1)
def _ecocrop() -> dict:
    ruta = INVESTIGACION / "cultivos_arequipa_2026-11-14.json"
    if not ruta.exists():  # sin catálogo, cada cultivo sale sin_regla con su motivo
        return {}
    datos = json.loads(ruta.read_text(encoding="utf-8"))
    return {clave: c.get("ecocrop") for clave, c in datos.get("cultivos", {}).items() if c.get("ecocrop")}


def _clase_pendiente(pct: float | None) -> str | None:
    if pct is None:
        return None
    return next(nombre for limite, nombre in CLASES_PENDIENTE if pct < limite)


def _comparar(valor: float, optimo, absoluto) -> str:
    if not optimo or not absoluto or None in (*optimo, *absoluto):
        return "sin_regla"
    if optimo[0] <= valor <= optimo[1]:
        return "dentro_optimo"
    if absoluto[0] <= valor <= absoluto[1]:
        return "dentro_absoluto"
    return "fuera_absoluto"


def _suelo(base: dict, propiedad: str) -> float | None:
    capa = ((base.get("suelo") or {}).get("capas") or {}).get(f"{propiedad}_0-5cm_mean") or {}
    valor = capa.get("media", capa.get("valor"))
    return float(valor) if valor is not None else None


def leer(base: dict) -> dict:
    """Añade a la respuesta de la base lo que cada dato significa, con su cita."""
    relieve = base.get("relieve") or {}
    pendiente = relieve.get("pendiente_pct")
    if isinstance(pendiente, dict):
        pendiente = pendiente.get("mediana")
    if pendiente is None:
        pendiente = (base.get("relieve_centroide") or {}).get("pendiente_pct")

    ph = _suelo(base, "phh2o")
    cultivos = []
    if ph is not None:
        fichas = _ecocrop()
        for clave in (base.get("sector") or {}).get("cultivos_principales") or []:
            ficha = fichas.get(clave)
            if not ficha:
                cultivos.append({"cultivo": clave, "estado": "sin_regla", "motivo": "sin ficha de EcoCrop en el catálogo"})
                continue
            cultivos.append({
                "cultivo": clave,
                "estado": _comparar(ph, ficha.get("ph_opt"), ficha.get("ph_abs")),
                "ph_optimo": ficha.get("ph_opt"),
                "ph_absoluto": ficha.get("ph_abs"),
                "fuente": ficha.get("url"),
            })

    fracciones = {nombre: _suelo(base, prop) for nombre, prop in (("arena", "sand"), ("limo", "silt"), ("arcilla", "clay"))}
    validas = {k: v for k, v in fracciones.items() if v is not None}
    predomina = max(validas, key=validas.get) if validas else None

    return {
        "pendiente": {
            "valor_pct": pendiente,
            "clase": _clase_pendiente(pendiente),
            "cita": "FAO (2006), Guidelines for soil description, cuadro 7",
        },
        "ph": {
            "valor": ph,
            "escala": "pH menor que 7 es ácido, 7 es neutro y mayor que 7 es alcalino (definición de la escala de pH).",
            "cultivos_de_la_zona": cultivos,
            "cita": "FAO EcoCrop (rango óptimo y absoluto de pH de cada cultivo); cultivos de la zona: IV CENAGRO 2012 (DT-20)",
        },
        "textura": {
            "fracciones_pct": fracciones,
            "predomina": predomina,
            "clase_usda": None,
            "motivo_clase": "sin_regla: falta copiar los límites de las clases texturales del USDA de su fuente (metodos_citados, «textura»).",
        },
    }

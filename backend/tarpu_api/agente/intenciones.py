"""Agente guiado · Intenciones: qué se pregunta (DT-14, sin modelo de IA).

Reconoce ocho intenciones por palabras clave. El orden importa: «pronóstico» va primero para que
«¿va a llover mañana?» no se responda con el registro de lluvia como si fuera un pronóstico.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import re
import unicodedata

from .. import catalogo

INTENCIONES = [
    ("pronostico", ["pronostic", "manana", "proximo ano", "proxima semana", "el ano que viene", "va a llover", "va a helar",
                    "lloverá", "llovera", "predec", "futuro", "va a hacer"]),
    ("descargar", ["descarg", "bajar los datos", "exportar", "csv", "excel", "pdf"]),
    ("fuentes", ["fuente", "de donde", "nasa", "power", "soilgrids", "modis", "de que satelite", "datos vienen"]),
    ("ndvi", ["ndvi", "verdor", "indice de vegetacion"]),
    ("que_falta", ["falta", "sin dato", "no sabe", "vacio", "que no sabes"]),
    ("por_que_cultivo", ["por que aparece", "porque aparece", "por que sale", "por que me sale", "este cultivo"]),
    ("frio", ["helada", "frio", "bajo cero", "congel", "temperatura minima", "noches"]),
    ("lluvia", ["lluvia", "llueve", "llover", "precipitacion", "agua de lluvia"]),
]
EJEMPLOS = {
    "frio": "¿Cuántas noches de frío hay en mi zona?",
    "lluvia": "¿Cuánto llueve en mi zona?",
    "por_que_cultivo": "¿Por qué aparece este cultivo?",
    "que_falta": "¿Qué datos faltan?",
    "ndvi": "¿Qué es el NDVI?",
    "fuentes": "¿De dónde salen los datos?",
    "descargar": "¿Cómo descargo los datos?",
    "pronostico": "¿Va a llover el próximo mes?",
}


def normalizar(texto: str) -> str:
    t = unicodedata.normalize("NFKD", texto.lower()).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", re.sub(r"[¿?¡!.,;:]", " ", t)).strip()


def reconocer(pregunta: str) -> dict:
    t = normalizar(pregunta)
    cultivo = next((c for c in catalogo.nombres() if re.search(rf"\b{c}\b", t)), None)
    for nombre, claves in INTENCIONES:
        if any(normalizar(k) in t for k in claves):
            return {"intencion": nombre, "cultivo": cultivo}
    if cultivo:
        return {"intencion": "por_que_cultivo", "cultivo": cultivo}
    return {"intencion": None, "cultivo": None}

"""Conector de IA de TARPU: la IA solo hace lo que TARPU no puede (voz y conversación natural).

Reparto del trabajo (como la orquestación de Pulse/OS, adaptada a TARPU):
- TARPU calcula, compara y redacta cada respuesta con sus fuentes (motor, lectura y agente guiado). Eso NO lo hace la IA.
- La IA recibe esa respuesta ya hecha y solo la reescribe para decirla en voz alta, con naturalidad. No puede
  añadir datos, cifras ni recomendaciones: lo que no esté en el texto de TARPU no puede aparecer.

La clave del proveedor vive solo en el servidor (variable de entorno); nunca viaja al navegador. Sin clave, o si el
proveedor falla o declina, se devuelve el texto de TARPU sin cambios y se dice por qué.
Proveedor conectado: Anthropic (Claude), con su SDK oficial. OpenAI y Gemini quedan previstos, sin código todavía.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import os

from . import config

MODELO = "claude-opus-5-5"
PROVEEDORES = [
    {"id": "claude", "nombre": "Anthropic · Claude", "variable": "ANTHROPIC_API_KEY", "implementado": True},
    {"id": "openai", "nombre": "OpenAI · ChatGPT", "variable": "OPENAI_API_KEY", "implementado": False},
    {"id": "gemini", "nombre": "Google · Gemini", "variable": "GEMINI_API_KEY", "implementado": False},
]
TAREAS = {
    "tarpu": ["Leer los datos de NASA, FAO y el censo", "Comparar cultivos con sus rangos citados",
              "Redactar cada respuesta con su fuente"],
    "ia": ["Decir la respuesta con naturalidad, para escucharla", "Mantener el hilo de una conversación hablada"],
}
SISTEMA = (
    "Eres la voz de Yachaq, el asistente de TARPU, una plataforma agrícola de Arequipa, Perú. "
    "Recibirás la pregunta de un agricultor y la respuesta que TARPU ya preparó con datos verificados. "
    "Tu única tarea es reescribir esa respuesta para que suene natural al decirla en voz alta, en español "
    "sencillo y cálido, como a una persona mayor del campo. Reglas estrictas: no añadas ningún dato, cifra, "
    "consejo ni recomendación que no esté en la respuesta de TARPU; conserva todas las cifras y sus unidades; "
    "conserva las advertencias (por ejemplo, que un histórico no es un pronóstico); no uses listas, símbolos ni "
    "formato; como máximo cuatro oraciones. Devuelve solo el texto para leer en voz alta."
)


def _env() -> dict:
    from .config import _leer_env_archivo
    return {**_leer_env_archivo(), **os.environ}


def _sdk():
    try:
        import anthropic
        return anthropic
    except ImportError:
        return None


def estado() -> dict:
    """Qué proveedor está conectado en el servidor. Nunca devuelve una clave."""
    env = _env()
    lista = []
    for p in PROVEEDORES:
        con_clave = bool(env.get(p["variable"]))
        if not p["implementado"]:
            situacion, motivo = "previsto", "Todavía no está programado en TARPU."
        elif not con_clave:
            situacion, motivo = "sin_clave", f"Falta la variable {p['variable']} en el servidor."
        elif p["id"] == "claude" and _sdk() is None:
            situacion, motivo = "sin_sdk", "Falta instalar el paquete «anthropic» en el servidor."
        else:
            situacion, motivo = "conectado", None
        lista.append({"id": p["id"], "nombre": p["nombre"], "variable": p["variable"], "estado": situacion, "motivo": motivo})
    activo = next((p["id"] for p in lista if p["estado"] == "conectado"), None)
    return {"proveedores": lista, "activo": activo, "modelo": MODELO if activo == "claude" else None,
            "reparto": TAREAS, "modo": config.obtener().modo}


def naturalizar(pregunta: str, respuesta: str) -> dict:
    """Devuelve la respuesta de TARPU dicha con naturalidad. Si no hay IA conectada, la devuelve igual."""
    base = {"texto": respuesta, "original": respuesta, "con_ia": False, "proveedor": None, "motivo": None}
    situacion = estado()
    if situacion["activo"] != "claude":
        return {**base, "motivo": "No hay un proveedor de IA conectado en el servidor: se usa el texto de TARPU."}
    anthropic = _sdk()
    cliente = anthropic.Anthropic(api_key=_env()["ANTHROPIC_API_KEY"])
    try:
        r = cliente.beta.messages.create(
            model=MODELO,
            max_tokens=1024,
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            output_config={"effort": "low"},
            system=SISTEMA,
            messages=[{"role": "user", "content": f"Pregunta del agricultor:\n{pregunta}\n\nRespuesta de TARPU:\n{respuesta}"}],
        )
    except anthropic.AuthenticationError:
        return {**base, "motivo": "La clave del proveedor no es válida."}
    except anthropic.RateLimitError:
        return {**base, "motivo": "El proveedor está limitando las peticiones; se usa el texto de TARPU."}
    except anthropic.APIStatusError as e:
        return {**base, "motivo": f"El proveedor respondió con un error ({e.status_code}); se usa el texto de TARPU."}
    except anthropic.APIConnectionError:
        return {**base, "motivo": "No se pudo conectar con el proveedor; se usa el texto de TARPU."}
    if r.stop_reason == "refusal":
        return {**base, "motivo": "El proveedor declinó reescribir este texto; se usa el texto de TARPU."}
    texto = " ".join(b.text for b in r.content if b.type == "text").strip()
    if not texto:
        return {**base, "motivo": "El proveedor no devolvió texto; se usa el texto de TARPU."}
    return {**base, "texto": texto, "con_ia": True, "proveedor": "claude", "modelo": r.model}

"""Agente guiado · Plantillas: respuestas armadas SOLO con valores reales y su cita (DT-14, DT-16).

Si no hay dato, la respuesta lo dice. Ante un pronóstico, responde que TARPU no pronostica.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

from .. import conectores
from .intenciones import EJEMPLOS

CITA_NDVI = {"fuente": "NASA Earth Observatory, «Measuring Vegetation (NDVI & EVI)»",
             "url": "https://earthobservatory.nasa.gov/features/MeasuringVegetation"}


def _n(v) -> str:
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    return str(v).replace(".", ",")


def _respuesta(intencion, texto, citas=None, faltantes=None, datos=None) -> dict:
    return {"intencion": intencion, "respuesta": texto, "citas": citas or [], "faltantes": faltantes or [], "datos_usados": datos or []}


def _power_cita(ind: dict) -> dict:
    p = ind["procedencia"][0]
    return {"fuente": f"{p['source_id']} · {p['product_id']} ({p.get('product_version')})", "url": p.get("request_url")}


def frio(ind: dict | None) -> dict:
    if not ind:
        return _respuesta("frio", "Todavía no tengo los datos de NASA POWER de tu parcela.", faltantes=["NASA POWER"])
    d, p = ind["data"], ind["procedencia"][0]
    r = d["resumen"]["meses_con_mas_noches_bajo_0c"]
    meses = " y ".join(r["meses"])
    texto = (f"Entre {d['periodo']['inicio']} y {d['periodo']['fin']}, el mes con más noches con mínima bajo 0 °C fue {meses}: "
             f"{_n(r['valor'])} noches en promedio. Es la temperatura del aire a 2 m en una celda de {p['resolucion']}, "
             "no una medición en tu parcela ni un diagnóstico de helada sobre tu cultivo.")
    return _respuesta("frio", texto, [_power_cita(ind)], datos=["noches_minima_bajo_0c_promedio"])


def lluvia(ind: dict | None) -> dict:
    if not ind:
        return _respuesta("lluvia", "Todavía no tengo los datos de NASA POWER de tu parcela.", faltantes=["NASA POWER"])
    d = ind["data"]
    r = d["resumen"]["meses_mas_lluviosos"]
    anual = d["lluvia_anual_mm"]
    if anual:
        a_min, a_max = min(anual, key=anual.get), max(anual, key=anual.get)
        extra = f" El total del año fue de {_n(anual[a_min])} mm ({a_min}) a {_n(anual[a_max])} mm ({a_max})."
    else:
        extra = " No hay años completos para dar un total anual."
    texto = (f"Entre {d['periodo']['inicio']} y {d['periodo']['fin']}, el mes más lluvioso fue {' y '.join(r['meses'])}, "
             f"con {_n(r['valor'])} mm en promedio.{extra} Es la lluvia de la celda de NASA POWER, no la de tu parcela.")
    return _respuesta("lluvia", texto, [_power_cita(ind)], datos=["lluvia_promedio_mm", "lluvia_anual_mm"])


def por_que_cultivo(rot: dict | None, cultivo: str | None) -> dict:
    if not rot:
        return _respuesta("por_que_cultivo", "Todavía no se compararon cultivos para esta parcela.", faltantes=["comparación de rotaciones"])
    estrategias = rot["estrategias"]
    if cultivo:
        estrategias = [e for e in estrategias if e["cultivo"] == cultivo]
        if not estrategias:
            no = next((n for n in rot.get("no_incluidos", []) if n["cultivo"] == cultivo), None)
            texto = f"{cultivo.capitalize()} no aparece. " + (no["motivo"] if no else "No está en el catálogo citado.")
            return _respuesta("por_que_cultivo", texto)
    partes = []
    for e in estrategias:
        partes.append(f"{e['id']} · {e['cultivo']}: {e['por_que_aparece']}" + (f" {e['frases'][0]}" if e["frases"] else ""))
    texto = " ".join(partes) + " TARPU no da puntaje ni dice «apto»: compara cada criterio con su cita."
    return _respuesta("por_que_cultivo", texto, [e["cita"] for e in estrategias])


def que_falta(ind: dict | None, rot: dict | None, proc: dict | None) -> dict:
    faltan = []
    for f in (proc or {}).get("fuentes", []):
        if f["estado"] != "listo":
            faltan.append(f"{f['nombre']}: {f.get('motivo') or f['estado']}")
    if rot:
        faltan += rot.get("vacios_generales", [])
        for e in rot["estrategias"]:
            faltan += [f"{e['cultivo']} · {v}" for v in e["vacios"]]
    elif not ind:
        faltan.append("Todavía no se prepararon los datos de esta parcela.")
    faltan = list(dict.fromkeys(faltan))
    texto = "No falta nada de lo que TARPU usa." if not faltan else "Esto es lo que falta: " + " · ".join(faltan)
    return _respuesta("que_falta", texto, faltantes=faltan)


def ndvi(proc: dict | None) -> dict:
    f = conectores.fuente("modis_ndvi")
    estado = next((x for x in (proc or {}).get("fuentes", []) if x["id"] == "modis_ndvi"), None)
    disp = "Ya hay datos de NDVI para tu zona." if estado and estado["estado"] == "listo" else f"Todavía no hay NDVI para tu parcela: {f.motivo_no_disponible}"
    texto = ("El NDVI es un índice de verdor de la vegetación que se calcula con la luz roja e infrarroja cercana que mide el satélite. "
             f"TARPU usa el de MODIS ({f.resolucion}): describe la zona, no el interior de tu parcela, y no demuestra fertilidad. {disp}")
    return _respuesta("ndvi", texto, [CITA_NDVI])


def fuentes(ind: dict | None) -> dict:
    lineas = [f"{f.nombre}: {f.variables}, {f.resolucion}." for f in conectores.REGISTRO]
    texto = "TARPU usa solo estas fuentes: " + " ".join(lineas) + " Las reglas de los cultivos vienen de FAO EcoCrop."
    citas = [_power_cita(ind)] if ind else []
    return _respuesta("fuentes", texto, citas)


def descargar() -> dict:
    return _respuesta("descargar", "En «Ver y descargar» están los datos en tres niveles: el original del proveedor sin tocar, "
                      "el normalizado (una fila por fecha, con unidades; vacío = sin dato) y lo que calcula TARPU, con su método.")


def pronostico() -> dict:
    return _respuesta("pronostico", "TARPU no pronostica. Muestra lo que pasó en tu zona (registros de NASA POWER) "
                      "y lo compara con rangos citados. Un registro del pasado no es un pronóstico.")


def no_reconocida() -> dict:
    return _respuesta(None, "No reconozco esa pregunta. Puedo responder sobre: " + " · ".join(EJEMPLOS.values()))

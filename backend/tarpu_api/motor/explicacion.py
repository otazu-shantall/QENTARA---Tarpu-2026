"""Paso 5 del motor · Explicación: frases armadas SOLO con datos y citas, más vacíos y conflictos.

Nada de «parece» ni «puede indicar»: se dice el dato, la regla citada y cómo se comparan.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations


def _n(v) -> str:
    """Número con coma decimal."""
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    return str(v).replace(".", ",")


def _rango(par) -> str:
    return f"{_n(par[0])}–{_n(par[1])}"


def _frase_rango(etiqueta: str, cultivo: str, c: dict) -> str:
    d, r = c["dato"], c["regla"] or {}
    base = f"{etiqueta}: {_n(d['valor'])} {d['unidad']} (NASA POWER)."
    if c["estado"] == "dentro_optimo":
        return base + f" Según FAO EcoCrop, el rango óptimo de {cultivo} es {_rango(r['optimo'])} {r['unidad']}: está dentro."
    if c["estado"] == "dentro_absoluto":
        return base + f" Está fuera del rango óptimo de {cultivo} ({_rango(r['optimo'])} {r['unidad']}) y dentro del absoluto ({_rango(r['absoluto'])} {r['unidad']}), según FAO EcoCrop."
    if c["estado"] == "fuera_absoluto":
        return base + f" Está fuera del rango absoluto de {cultivo} ({_rango(r['absoluto'])} {r['unidad']}), según FAO EcoCrop."
    return base + " FAO EcoCrop no trae un rango con el que compararlo."


def frases(cultivo: str, criterios: list[dict]) -> dict:
    textos, vacios, conflictos = [], [], []
    for c in criterios:
        e = c["estado"]
        if e == "sin_dato":
            vacios.append(f"{c['titulo']}: {c['nota']}")
            continue
        if e == "sin_regla":
            vacios.append(f"{c['titulo']}: {c['nota'] or 'FAO EcoCrop no trae la regla.'}")
            continue
        if c["criterio"] == "temperatura":
            meses = ", ".join(c["dato"]["meses"] or [])
            textos.append(_frase_rango(f"Temperatura media de tus meses de campaña ({meses})", cultivo, c))
        elif c["criterio"] == "lluvia":
            t = _frase_rango("Lluvia media del año", cultivo, c)
            textos.append(t + (f" {c['nota']}" if c.get("nota") else ""))
        elif c["criterio"] == "suelo":
            textos.append(_frase_rango("pH del suelo", cultivo, c).replace("(NASA POWER)", "(SoilGrids)") + f" {c['nota']}")
        elif c["criterio"] == "frio":
            for etapa, d in c["dato"]["etapas"].items():
                nombre = "en crecimiento temprano" if etapa == "crecimiento_temprano" else "en reposo"
                textos.append(f"Según FAO EcoCrop, la temperatura letal de {cultivo} {nombre} es {_n(d['temperatura_letal_c'])} °C. "
                              f"En tus meses de campaña hubo en promedio {_n(d['noches_por_campana'])} noches con mínima igual o menor (NASA POWER).")
        elif c["criterio"] == "familia":
            d = c["dato"]
            if d["cambia_de_familia"]:
                textos.append(f"{cultivo.capitalize()} es de la familia {d['familia']}; tu cultivo actual es de {d['familia_actual']} (FAO EcoCrop).")
            else:
                textos.append(f"{cultivo.capitalize()} es de la misma familia que tu cultivo actual: {d['familia']} (FAO EcoCrop).")
        elif c["criterio"] == "altitud":
            d, r = c["dato"], c["regla"]
            t = (f"FAO EcoCrop da para {cultivo} una altitud máxima de {_n(r['altitud_max_absoluta_m'])} m; "
                 f"la celda de NASA POWER está a {_n(d['elevacion_celda_power_m'])} m.")
            if e == "conflicto_entre_fuentes":
                conflictos.append(t + " " + c["nota"])
            else:
                textos.append(t)
    return {"frases": textos, "vacios": vacios, "conflictos": conflictos}

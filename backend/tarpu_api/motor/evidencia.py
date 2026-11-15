"""Paso 2 del motor · Evidencia: qué datos reales hay y cuáles faltan (MODULOS.md §4).

Solo lee lo ya calculado (indicadores) y lo declarado (contexto). No llama a los conectores.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

from decimal import ROUND_HALF_UP, Decimal

from .. import conectores

MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]


def _r(v: Decimal) -> float:
    return float(v.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))


def reunir(contexto: dict | None, indicadores: dict | None) -> dict:
    contexto = contexto or {}
    ev: dict = {"faltantes": [], "meses_campana": contexto.get("meses_campana"), "agua": contexto.get("agua")}
    data = (indicadores or {}).get("data")
    proc = ((indicadores or {}).get("procedencia") or [{}])[0]
    if not data:
        ev["faltantes"].append("No hay datos de NASA POWER para esta parcela.")
        ev["clima"] = None
    else:
        meses = ev["meses_campana"]
        por_mes = {c["mes"]: c for c in data["clima_mensual"]}
        ev["clima"] = {"fuente": "NASA POWER", "periodo": data["periodo"], "resolucion": proc.get("resolucion"),
                       "request_url": proc.get("request_url")}
        if meses:
            temps = [por_mes[m]["temperatura_media_c"] for m in meses if por_mes[m]["temperatura_media_c"] is not None]
            ev["temperatura_campana_c"] = _r(sum(Decimal(repr(t)) for t in temps) / len(temps)) if len(temps) == len(meses) else None
            noches: dict[str, float] = {}
            for umbral in data.get("umbrales_letales_citados_c", []):
                clave = f"{umbral:g}"
                vals = [por_mes[m]["noches_minima_hasta_letal_promedio"].get(clave) for m in meses]
                if all(v is not None for v in vals):
                    noches[clave] = _r(sum(Decimal(repr(v)) for v in vals))
            ev["noches_hasta_letal_por_campana"] = noches
            ev["meses_campana_nombres"] = [MESES[m - 1] for m in meses]
        else:
            ev["faltantes"].append("No declaraste los meses en que tu cultivo está en el campo: no se calcula la temperatura ni el frío de la campaña.")
        anual = data.get("lluvia_anual_mm") or {}
        if anual:
            vals = list(anual.values())
            ev["lluvia_anual_media_mm"] = _r(sum(Decimal(repr(v)) for v in vals) / len(vals))
            ev["lluvia_anual_rango"] = {"min": min(vals), "anio_min": min(anual, key=anual.get),
                                        "max": max(vals), "anio_max": max(anual, key=anual.get), "anios": len(vals)}
        ev["elevacion_power_m"] = proc.get("elevacion_informada_por_power_m")
    # pH: SoilGrids (DT-17). Sin conector todavía en el área de datos.
    ev["ph"] = (indicadores or {}).get("data", {}).get("suelo", {}).get("ph") if data else None
    if ev["ph"] is None:
        motivo = conectores.fuente("soilgrids").motivo_no_disponible or "SoilGrids no devolvió dato para este punto."
        ev["ph_motivo"] = motivo
        ev["faltantes"].append(f"pH del suelo (SoilGrids): {motivo}")
    return ev

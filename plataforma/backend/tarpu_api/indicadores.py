"""Indicadores: solo DESCRIPCIONES de datos reales (MODULOS.md §3).

Sobre la serie diaria de NASA POWER calcula, sin umbrales inventados:
- temperatura media por mes (promedio de todos los días de ese mes en el período);
- temperatura mínima registrada por mes;
- noches con T2M_MIN < 0 °C por mes (promedio por año);
- noches con T2M_MIN ≤ cada temperatura letal CITADA en el catálogo (para el motor);
- lluvia por mes (promedio de los totales mensuales) y total por año;
- meses con días sin dato.
Un mes con algún día sin dato no entra en los totales ni en los conteos de esa variable: se lista.
Aritmética decimal exacta sobre los valores del CSV; redondeo a 1 decimal, hacia arriba en el empate.
No usa la palabra «helada» como diagnóstico (no hay una definición citada todavía).
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from decimal import ROUND_HALF_UP, Decimal

from . import almacen, catalogo, errores, ingesta

MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
RESOLUCION_POWER = "0,5° x 0,625° (meteorología de POWER), ≈ 55 x 67 km en esta latitud"


def _d(v: float | int | Decimal) -> Decimal:
    """Decimal exacto del valor del CSV (repr de un float leído de texto devuelve ese texto)."""
    return v if isinstance(v, Decimal) else Decimal(repr(v))


def _suma(vals) -> Decimal:
    return sum((_d(v) for v in vals), Decimal(0))


def fmean(vals) -> Decimal:
    vals = list(vals)
    return _suma(vals) / len(vals)


def _r(v: Decimal | float | None, n: int = 1) -> float | None:
    """Redondeo a n decimales; en el empate, hacia arriba (333,35 → 333,4)."""
    if v is None:
        return None
    d = v if isinstance(v, Decimal) else _d(v)
    return float(d.quantize(Decimal(1).scaleb(-n), rounding=ROUND_HALF_UP))


def _umbral_txt(u: float) -> str:
    return f"{u:g}"


def calcular(serie: ingesta.Serie, letales: list[float]) -> dict:
    t2m, tmin, lluvia = serie.columna("T2M"), serie.columna("T2M_MIN"), serie.columna("PRECTOTCORR")
    # agrupar por (año, mes)
    grupos: dict[tuple[int, int], list[int]] = defaultdict(list)
    for i, f in enumerate(serie.fechas):
        grupos[(int(f[:4]), int(f[5:7]))].append(i)

    serie_mensual, incompletos = [], []
    por_mes = {m: {"t": [], "tmin": [], "noches0": [], "lluvia": [], "umbral": defaultdict(list)} for m in range(1, 13)}
    for (anio, mes), idx in sorted(grupos.items()):
        t_vals = [t2m[i] for i in idx if t2m[i] is not None]
        tmin_vals = [tmin[i] for i in idx]
        ll_vals = [lluvia[i] for i in idx]
        tmin_completo = all(v is not None for v in tmin_vals)
        ll_completo = all(v is not None for v in ll_vals)
        sin_dato = sum(1 for i in idx if t2m[i] is None or tmin[i] is None or lluvia[i] is None)
        if sin_dato:
            incompletos.append({"anio": anio, "mes": mes, "dias_sin_dato": sin_dato})
        noches0 = sum(1 for v in tmin_vals if v is not None and v < 0) if tmin_completo else None
        total_ll = _suma(ll_vals) if ll_completo else None
        serie_mensual.append({
            "anio": anio, "mes": mes, "dias": len(idx), "dias_sin_dato": sin_dato,
            "temperatura_media_c": _r(fmean(t_vals)) if t_vals else None,
            "temperatura_minima_c": _r(min(v for v in tmin_vals if v is not None)) if any(v is not None for v in tmin_vals) else None,
            "noches_minima_bajo_0c": noches0,
            "lluvia_mm": _r(total_ll),
        })
        acc = por_mes[mes]
        acc["t"].extend(t_vals)
        acc["tmin"].extend(v for v in tmin_vals if v is not None)
        if tmin_completo:
            acc["noches0"].append(noches0)
            for u in letales:
                acc["umbral"][u].append(sum(1 for v in tmin_vals if v <= u))
        if ll_completo:
            acc["lluvia"].append(total_ll)

    clima_mensual = []
    for m in range(1, 13):
        a = por_mes[m]
        clima_mensual.append({
            "mes": m, "nombre": MESES[m - 1],
            "temperatura_media_c": _r(fmean(a["t"])) if a["t"] else None,
            "temperatura_minima_registrada_c": _r(min(a["tmin"])) if a["tmin"] else None,
            "noches_minima_bajo_0c_promedio": _r(fmean(a["noches0"])) if a["noches0"] else None,
            "noches_minima_hasta_letal_promedio": {_umbral_txt(u): _r(fmean(v)) for u, v in sorted(a["umbral"].items())},
            "lluvia_promedio_mm": _r(fmean(a["lluvia"])) if a["lluvia"] else None,
            "anios_con_dato": len(a["lluvia"]),
        })

    # lluvia anual: solo años completos dentro del período
    por_anio: dict[int, list[int]] = defaultdict(list)
    for i, f in enumerate(serie.fechas):
        por_anio[int(f[:4])].append(i)
    lluvia_anual = {}
    for anio, idx in sorted(por_anio.items()):
        dias_del_anio = 366 if (anio % 4 == 0 and anio % 100 != 0) or anio % 400 == 0 else 365
        if len(idx) == dias_del_anio and all(lluvia[i] is not None for i in idx):
            lluvia_anual[str(anio)] = _r(_suma(lluvia[i] for i in idx))

    def maximos(clave: str) -> dict | None:
        vals = [(c[clave], c["nombre"]) for c in clima_mensual if c[clave] is not None]
        if not vals:
            return None
        tope = max(v for v, _ in vals)
        return {"valor": tope, "meses": [n for v, n in vals if v == tope]}

    p = serie.procedencia
    punto = p.get("point", {})
    return {
        "punto_consultado": {"lat": punto.get("latitude"), "lon": punto.get("longitude")},
        "periodo": {"inicio": serie.fechas[0], "fin": serie.fechas[-1], "anios": len(por_anio), "dias": len(serie.fechas)},
        "clima_mensual": clima_mensual,
        "lluvia_anual_mm": lluvia_anual,
        "meses_con_dias_sin_dato": incompletos,
        "resumen": {
            "nota": "Resúmenes sin umbrales: se informan conteos y promedios. «Bajo 0 °C» es la temperatura mínima del aire a 2 m, no un diagnóstico de helada sobre el cultivo.",
            "meses_con_mas_noches_bajo_0c": maximos("noches_minima_bajo_0c_promedio"),
            "meses_mas_lluviosos": maximos("lluvia_promedio_mm"),
        },
        "umbrales_letales_citados_c": letales,
        "_serie_mensual": serie_mensual,
    }


def procedencia_power(p: dict) -> dict:
    geom = p.get("geometry_returned_lon_lat_elev_m") or [None, None, None]
    fecha = lambda s: f"{s[:4]}-{s[4:6]}-{s[6:]}" if s and len(s) == 8 else s
    return {
        "origen": "fuente", "source_id": p.get("source_id"), "product_id": p.get("product_id"),
        "product_version": p.get("api_version"), "nivel": "derivado",
        "metodo": "promedios mensuales, mínimos, totales y conteo de noches con T2M_MIN < 0 °C (y ≤ cada temperatura letal citada) sobre la serie diaria",
        "observed_start": fecha(p.get("observed_start")), "observed_end": fecha(p.get("observed_end")),
        "unit": p.get("units"), "resolucion": RESOLUCION_POWER,
        "elevacion_informada_por_power_m": geom[2] if len(geom) > 2 else None,
        "missing_days": p.get("missing_days"), "request_url": p.get("request_url"), "requested_at": p.get("requested_at"),
    }


AVISOS = ["Dato de la zona (celda de POWER), no medición dentro de la parcela.", "Registro del pasado, no pronóstico."]


def actualizar(parcela_id: str) -> dict | None:
    """Recalcula con lo disponible y guarda indicadores.json. Devuelve None si no hay POWER listo."""
    proc = almacen.leer(parcela_id, "procesamiento") or {}
    power = next((f for f in proc.get("fuentes", []) if f["id"] == "power" and f.get("archivos")), None)
    if power is None:
        return None
    serie = ingesta.leer(power["archivos"])
    datos = calcular(serie, catalogo.temperaturas_letales())
    serie_mensual = datos.pop("_serie_mensual")
    resultado = {
        "parcela_version": proc.get("parcela_version"),
        "calculado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "data": datos, "serie_mensual": serie_mensual,
        "procedencia": [procedencia_power(serie.procedencia)], "avisos": AVISOS,
    }
    almacen.guardar(parcela_id, "indicadores", resultado)
    return resultado


def leer(parcela_id: str, version_actual: int) -> dict:
    resultado = almacen.leer(parcela_id, "indicadores")
    if resultado is None:
        raise errores.datos_no_listos("Prepara los datos de la parcela (POST …/procesar) y espera a que NASA POWER esté listo.")
    if resultado.get("parcela_version") != version_actual:
        raise errores.parcela_desactualizada(f"Indicadores de la versión {resultado.get('parcela_version')}; la parcela va en la {version_actual}.")
    return resultado

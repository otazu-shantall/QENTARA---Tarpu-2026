"""Paso 3 del motor · Comparación por criterio, SIN pesos ni puntaje (MODULOS.md §4).

Estados:
- comparan un dato real con un rango citado: dentro_optimo · dentro_absoluto · fuera_absoluto
- describen un hecho sin evaluarlo: medido (frío) · informativo (familia, altitud)
- conflicto_entre_fuentes (altitud de EcoCrop frente a la elevación de la celda de POWER)
- sin_dato (falta el dato real) · sin_regla (EcoCrop no trae el valor)
La altitud nunca excluye un cultivo. No hay «apto / no apto».
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

from .. import conectores


def cita(cultivo: dict) -> dict:
    f = cultivo["fuente"]
    return {"fuente": f["nombre"], "url": f["url"], "consultado": f["consultado"], "nivel": f.get("nivel")}


def estado_rango(valor: float, rango: dict | None) -> str:
    if not rango or (rango.get("optimo") is None and rango.get("absoluto") is None):
        return "sin_regla"
    opt, abs_ = rango.get("optimo"), rango.get("absoluto")
    if opt and opt[0] <= valor <= opt[1]:
        return "dentro_optimo"
    if abs_ is None:
        return "sin_regla"  # EcoCrop solo trae el óptimo y el dato queda fuera: no hay regla para decir más
    return "dentro_absoluto" if abs_[0] <= valor <= abs_[1] else "fuera_absoluto"


def _criterio(nombre: str, titulo: str, estado: str, dato=None, regla=None, nota=None) -> dict:
    return {"criterio": nombre, "titulo": titulo, "estado": estado, "dato": dato, "regla": regla, "nota": nota}


def comparar(cultivo: dict, actual: dict | None, ev: dict) -> list[dict]:
    c = cita(cultivo)
    clima = ev.get("clima") or {}
    origen_power = {"origen": "fuente", "fuente": "NASA POWER", "resolucion": clima.get("resolucion"), "periodo": clima.get("periodo")}
    criterios = []

    # Temperatura media de la campaña frente al rango de EcoCrop
    rango_t = cultivo.get("temperatura_c")
    if ev.get("temperatura_campana_c") is None:
        motivo = "Falta declarar los meses de campaña." if not ev.get("meses_campana") else "Falta el dato de temperatura de NASA POWER."
        criterios.append(_criterio("temperatura", "Temperatura de la campaña", "sin_dato", nota=motivo))
    else:
        v = ev["temperatura_campana_c"]
        criterios.append(_criterio("temperatura", "Temperatura de la campaña", estado_rango(v, rango_t),
            dato={"valor": v, "unidad": "°C", "meses": ev.get("meses_campana_nombres"),
                  "metodo": "Promedio de las temperaturas medias mensuales (T2M) de los meses declarados.", **origen_power},
            regla={"optimo": rango_t.get("optimo"), "absoluto": rango_t.get("absoluto"), "unidad": "°C", "cita": c} if rango_t else None))

    # Frío: noches con mínima ≤ temperatura letal citada (hecho medido, sin evaluar)
    letal = cultivo.get("temperatura_letal_c") or {}
    if all(v is None for v in letal.values()):
        criterios.append(_criterio("frio", "Noches de frío", "sin_regla", nota="FAO EcoCrop no trae la temperatura letal de este cultivo."))
    elif not ev.get("meses_campana") or "noches_hasta_letal_por_campana" not in ev:
        criterios.append(_criterio("frio", "Noches de frío", "sin_dato", nota="Falta declarar los meses de campaña o el dato de NASA POWER."))
    else:
        detalle = {}
        for etapa, umbral in letal.items():
            if umbral is not None:
                detalle[etapa] = {"temperatura_letal_c": umbral,
                                  "noches_por_campana": ev["noches_hasta_letal_por_campana"].get(f"{float(umbral):g}")}
        criterios.append(_criterio("frio", "Noches de frío", "medido",
            dato={"etapas": detalle, "unidad": "noches por campaña (promedio de los años)", "meses": ev.get("meses_campana_nombres"),
                  "metodo": "Suma, en los meses declarados, del promedio anual de noches con T2M_MIN ≤ la temperatura letal.", **origen_power},
            regla={"temperatura_letal_c": letal, "cita": c},
            nota="T2M_MIN es la temperatura del aire a 2 m en la celda de POWER, no la de la planta."))

    # Lluvia anual media frente al rango anual de EcoCrop
    rango_ll = cultivo.get("lluvia_anual_mm")
    if ev.get("lluvia_anual_media_mm") is None:
        criterios.append(_criterio("lluvia", "Lluvia del año", "sin_dato", nota="Falta el dato de lluvia de NASA POWER."))
    else:
        v = ev["lluvia_anual_media_mm"]
        nota = "Declaraste riego: la lluvia no es tu única fuente de agua." if ev.get("agua") == "riego" else None
        criterios.append(_criterio("lluvia", "Lluvia del año", estado_rango(v, rango_ll),
            dato={"valor": v, "unidad": "mm/año", "rango_anios": ev.get("lluvia_anual_rango"),
                  "metodo": "Promedio de los totales anuales (PRECTOTCORR) de los años completos.", **origen_power},
            regla={"optimo": rango_ll.get("optimo"), "absoluto": rango_ll.get("absoluto"), "unidad": "mm/año", "cita": c} if rango_ll else None,
            nota=nota))

    # Suelo: pH de SoilGrids frente al rango de EcoCrop
    rango_ph = cultivo.get("ph_suelo")
    if ev.get("ph") is None:
        criterios.append(_criterio("suelo", "pH del suelo", "sin_dato", nota=ev.get("ph_motivo")))
    else:
        criterios.append(_criterio("suelo", "pH del suelo", estado_rango(ev["ph"], rango_ph),
            dato={"valor": ev["ph"], "unidad": "pH", "origen": "fuente", "fuente": "SoilGrids",
                  "resolucion": conectores.fuente("soilgrids").resolucion},
            regla={"optimo": rango_ph.get("optimo"), "absoluto": rango_ph.get("absoluto"), "unidad": "pH", "cita": c} if rango_ph else None,
            nota="Es una predicción a 250 m, no un análisis de suelo."))

    # Familia: dato, sin valorarlo
    if actual is None:
        criterios.append(_criterio("familia", "Familia", "sin_dato", nota="No declaraste un cultivo actual del catálogo."))
    else:
        criterios.append(_criterio("familia", "Familia", "informativo",
            dato={"familia": cultivo["familia"], "familia_actual": actual["familia"], "cambia_de_familia": cultivo["familia"] != actual["familia"],
                  "origen": "fuente", "fuente": "FAO EcoCrop"},
            regla={"cita": c}, nota="Se muestra el dato sin valorarlo: todavía no hay una regla local de rotación citada."))

    # Altitud: nunca excluye; se muestra el conflicto entre fuentes
    alt_max = cultivo.get("altitud_max_absoluta_m")
    elev = ev.get("elevacion_power_m")
    if alt_max is None:
        criterios.append(_criterio("altitud", "Altitud", "sin_regla", nota="FAO EcoCrop no trae la altitud máxima."))
    elif elev is None:
        criterios.append(_criterio("altitud", "Altitud", "sin_dato", nota="NASA POWER no informó la elevación de su celda."))
    else:
        conflicto = elev > alt_max
        criterios.append(_criterio("altitud", "Altitud", "conflicto_entre_fuentes" if conflicto else "informativo",
            dato={"elevacion_celda_power_m": elev, "origen": "fuente", "fuente": "NASA POWER",
                  "nota_dato": "Elevación de la celda de POWER, no de la parcela."},
            regla={"altitud_max_absoluta_m": alt_max, "cita": c},
            nota="La altitud no se usa para descartar: EcoCrop describe la especie, no las variedades locales."))
    return criterios

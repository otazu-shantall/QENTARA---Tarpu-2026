"""Pruebas de geometría, ingesta, indicadores y catálogo (DISENO.md §10).
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest
from pyproj import Geod

from tarpu_api import catalogo, errores, geometria, indicadores, ingesta
from conftest import BASE_CHIVAY, FUENTES, contorno_cuadrado

EJEMPLO = Path(__file__).parent.parent / "contrato" / "ejemplos" / "indicadores_chivay.json"


# ---------------------------------------------------------------- geometría
def test_contorno_con_cruces_se_rechaza_con_motivo():
    moño = {"type": "Polygon", "coordinates": [[[0, 0], [1, 1], [1, 0], [0, 1], [0, 0]]]}
    with pytest.raises(errores.ErrorTarpu) as e:
        geometria.validar(moño)
    assert e.value.codigo == "contorno_invalido"
    assert "Self-intersection" in e.value.detalle


def test_contorno_sin_cerrar_o_con_pocos_puntos():
    for malo in ({"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1]]]},
                 {"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [0, 0], [0, 0]]]},
                 {"type": "Point", "coordinates": [0, 0]}):
        with pytest.raises(errores.ErrorTarpu):
            geometria.validar(malo)


def test_area_geodesica_coincide_con_pyproj():
    c = contorno_cuadrado()
    m = geometria.medir(c)
    lons, lats = zip(*c["coordinates"][0])
    esperado = abs(Geod(ellps="WGS84").polygon_area_perimeter(lons, lats)[0]) / 10_000
    assert m["area_ha"] == pytest.approx(esperado, abs=1e-4)
    assert m["pixeles_modis_250m"] == pytest.approx(esperado / 6.25, abs=0.01)
    assert m["centroide"] == {"lat": -15.64, "lon": -71.6}


# ---------------------------------------------------------------- ingesta
def test_celda_vacia_es_none_y_nunca_cero():
    fechas, valores, unidades = ingesta.leer_normalizado("fecha,T2M (C),PRECTOTCORR (mm/day)\n2025-01-01,,0\n2025-01-02,5.5,\n")
    assert valores["T2M"] == [None, 5.5]
    assert valores["PRECTOTCORR"] == [0.0, None]
    assert unidades == {"T2M": "C", "PRECTOTCORR": "mm/day"}


# ---------------------------------------------------------------- indicadores
def _serie_chivay():
    f, v, u = ingesta.leer_normalizado((FUENTES / f"{BASE_CHIVAY}.normalizado.csv").read_text(encoding="utf-8"))
    return ingesta.Serie(f, v, u, json.loads((FUENTES / f"{BASE_CHIVAY}.procedencia.json").read_text(encoding="utf-8")))


def test_indicadores_reproducen_el_ejemplo_de_chivay():
    r = indicadores.calcular(_serie_chivay(), [-8, -4, -1, 0])
    ej = json.loads(EJEMPLO.read_text(encoding="utf-8"))["data"]
    for calc, esperado in zip(r["clima_mensual"], ej["clima_mensual"]):
        for clave, valor in esperado.items():
            assert calc[clave] == valor, (esperado["nombre"], clave)
    assert r["lluvia_anual_mm"] == ej["lluvia_anual_mm"]
    assert r["resumen"] == ej["resumen"]
    assert r["periodo"] == ej["periodo"]


def test_mes_incompleto_no_entra_en_totales():
    texto = "fecha,T2M (C),T2M_MIN (C),PRECTOTCORR (mm/day)\n2025-01-01,5,-1,2\n2025-01-02,6,,3\n"
    f, v, u = ingesta.leer_normalizado(texto)
    r = indicadores.calcular(ingesta.Serie(f, v, u, {}), [0])
    ene = r["clima_mensual"][0]
    assert ene["noches_minima_bajo_0c_promedio"] is None  # falta un día de T2M_MIN
    assert ene["lluvia_promedio_mm"] == 5.0
    assert r["meses_con_dias_sin_dato"] == [{"anio": 2025, "mes": 1, "dias_sin_dato": 1}]
    assert r["lluvia_anual_mm"] == {}  # el año no está completo


# ---------------------------------------------------------------- catálogo
def test_catalogo_rechaza_regla_sin_fuente():
    malo = {"cultivos": [{"cultivo": "x", "familia": "y", "fuente": {"nombre": "FAO EcoCrop"}}]}
    with pytest.raises(catalogo.CatalogoInvalido):
        catalogo.validar(malo)


def test_catalogo_coincide_con_ecocrop():
    papa = catalogo.cultivo("papa")
    assert papa["fuente"]["url"].endswith("id=1971")
    assert papa["temperatura_c"] == {"optimo": [15, 25], "absoluto": [7, 30]}
    assert papa["altitud_max_absoluta_m"] == 2800
    assert catalogo.cultivo("haba")["temperatura_letal_c"] == {"en_reposo": None, "crecimiento_temprano": None}
    assert catalogo.temperaturas_letales() == [-8.0, -4.0, -1.0, 0.0]

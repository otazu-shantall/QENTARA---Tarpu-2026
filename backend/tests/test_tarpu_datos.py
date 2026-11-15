"""Pruebas de las correcciones de tarpu_datos (15/11/2026): bloques anclados de MODIS y caché con antigüedad.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone

from tarpu_datos.fuentes import cliente, ornl


def test_tramos_anclados_no_cambian_al_ampliar_el_periodo():
    todas = [f"A{i:04d}" for i in range(25)]
    antes = ornl.tramos_anclados(todas[:23], todas[5:23])
    despues = ornl.tramos_anclados(todas, todas[5:])
    # los bloques completos de antes siguen idénticos (se reutiliza su caché); solo cambia el último
    assert antes[:2] == despues[:2]
    assert antes[2] != despues[2] and despues[2] == todas[20:25]
    assert all(len(b) <= ornl.FECHAS_POR_PETICION for b in despues)


def test_cache_con_antiguedad_vuelve_a_pedir(tmp_path):
    caja = cliente.Cache(tmp_path)
    viejo = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat(timespec="seconds")
    caja.escribir_json("x.json", {"request_url": "u", "requested_at": viejo, "response": {"v": 1}})

    class Falso:
        def get_json(self, url, **kw):
            return {"v": 2}

    assert caja.obtener_json("x.json", Falso(), "u")["response"] == {"v": 1}           # sin límite: caché
    assert caja.obtener_json("x.json", Falso(), "u", max_edad_dias=8)["response"] == {"v": 2}  # vieja: se pide
    assert json.loads((tmp_path / "x.json").read_text(encoding="utf-8"))["response"] == {"v": 2}


def test_base_de_arequipa_en_majes(tmp_path):
    """Lee la capa 1 en Majes riego si la base está extraída en esta computadora (almacen/ no va a git)."""
    import pytest
    from tarpu_datos.base import leer
    if not (leer.BASE / "nasadem").exists():
        pytest.skip("la base de Arequipa no está extraída en esta computadora")
    r = leer.leer(-16.367023, -72.185771)
    assert r["relieve"]["altitud_m"] == 1391            # NASADEM; AppEEARS dio 1390 en el mismo punto
    assert r["sector"]["sector"] == "S1"
    assert r["suelo"]["capas"]["phh2o_0-5cm_mean"]["valor"] == 8.2
    assert r["clima"]["elevacion_celda_m"] == 1940.88   # igual a la consulta por punto a POWER
    assert leer.leer(0, 0)["estado"] == "sin_dato"      # fuera de la caja: no se rellena


def test_base_en_una_parcela_de_majes():
    """Capa 1 en todo el espacio de una parcela dibujada (si la base está en esta computadora)."""
    import pytest
    from tarpu_datos.base import leer
    if not (leer.BASE / "nasadem").exists():
        pytest.skip("la base de Arequipa no está extraída en esta computadora")
    lat, lon, d = -16.367023, -72.185771, 0.001
    contorno = {"type": "Polygon", "coordinates": [[[lon - d, lat - d], [lon + d, lat - d], [lon + d, lat + d],
                                                    [lon - d, lat + d], [lon - d, lat - d]]]}
    r = leer.leer_parcela(contorno)
    assert r["relieve"]["pixeles"] == 49                       # 7 x 7 píxeles de 1'' en un cuadrado de ≈ 215 m
    assert r["relieve"]["pendiente_pct"]["mediana"] == 2.4     # igual a la medida por AppEEARS en el mismo lugar
    assert r["suelo"]["pixeles"] == 2
    assert 9.8 in r["suelo"]["capas"]["clay_0-5cm_mean"]["valores_por_pixel"]  # incluye el valor nativo del punto

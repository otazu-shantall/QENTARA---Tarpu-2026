"""Configuración de las pruebas del backend.

Usan la consulta REAL a NASA POWER guardada en tests/fuentes/ (Chivay, 2015–2025), copiada a una
caché temporal, para no depender de la red. El contorno de prueba es una entrada de prueba
alrededor del punto de esa consulta; no es una parcela de la demo.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import shutil
from dataclasses import replace
from pathlib import Path

import pytest

from tarpu_api import config

FUENTES = Path(__file__).parent / "fuentes"
BASE_CHIVAY = "power_chivay_20150101_20251231"
LAT, LON = -15.64, -71.60


def contorno_cuadrado(lat: float = LAT, lon: float = LON, d: float = 0.001) -> dict:
    return {"type": "Polygon", "coordinates": [[[lon - d, lat - d], [lon + d, lat - d], [lon + d, lat + d], [lon - d, lat + d], [lon - d, lat - d]]]}


@pytest.fixture()
def cfg(tmp_path):
    original = config.obtener()
    c = replace(original, almacen_dir=tmp_path / "almacen", export_dir=tmp_path / "export", modo="en_vivo")
    config.fijar(c)
    yield c
    config.fijar(original)


@pytest.fixture()
def cache_chivay(cfg):
    """Deja la consulta real de Chivay en la caché con el nombre que espera el conector de POWER."""
    from tarpu_api import almacen, conectores
    clave = conectores._clave_punto(LAT, LON, cfg.power_inicio, cfg.power_fin)
    carpeta = almacen.carpeta_cache("power", clave)
    base = f"power_{clave}_{cfg.power_inicio.replace('-', '')}_{cfg.power_fin.replace('-', '')}"
    for ext in ("original.json", "normalizado.csv", "procedencia.json"):
        shutil.copy(FUENTES / f"{BASE_CHIVAY}.{ext}", carpeta / f"{base}.{ext}")
    return carpeta


@pytest.fixture()
def cliente(cfg):
    from fastapi.testclient import TestClient
    from tarpu_api.main import app
    return TestClient(app)

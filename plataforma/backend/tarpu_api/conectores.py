"""Registro de conectores del área de datos (DISENO.md §7).

El backend ORQUESTA; los conectores DESCARGAN. Los conectores viven en datos/ (área de Damaris)
y aquí solo se registran y se invocan, sin modificarlos.

Fuentes de la demo (DT-17): NASA POWER, NDVI de MODIS (ORNL) y SoilGrids. Todas se consultan
en un PUNTO (el centroide de la parcela). Hoy solo existe el conector de POWER
(datos/power/consulta_power.py); se invoca por su línea de comandos, que ya acepta --salida.
Cuando el área de datos exponga obtener() como función, solo cambia _power(). MODIS y SoilGrids
figuran con su motivo real de «no disponible» hasta que el área de datos tenga su conector.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from . import almacen, config

SIN_CONECTOR = "El área de datos todavía no tiene un conector para esta fuente."


@dataclass(frozen=True)
class Fuente:
    id: str
    nombre: str
    pide: str            # "punto" o "contorno"
    responde: str        # "al_momento" o "por_solicitud"
    resolucion: str      # según la documentación del producto
    variables: str
    obtener: Callable[..., dict] | None = None
    motivo_no_disponible: str | None = None


def _clave_punto(lat: float, lon: float, inicio: str, fin: str) -> str:
    f = lambda v: f"{v:.4f}".replace("-", "m").replace(".", "p")
    return f"{f(lat)}_{f(lon)}_{inicio.replace('-', '')}_{fin.replace('-', '')}"


def _power(*, lat: float, lon: float, inicio: str, fin: str, **_: object) -> dict:
    """POWER de la base de Arequipa (DT-22): la celda que contiene el punto, sin descargar nada.
    Si la base no tiene la celda, invoca datos/power/consulta_power.py (reutiliza su caché)."""
    from tarpu_datos.base import leer as _base
    celda = _base.power_celda(lat, lon)
    raiz = config.obtener().almacen_dir.resolve()  # solo si la base está dentro del almacén configurado
    if celda.get("estado") == "listo" and all(
            Path(r).exists() and raiz in Path(r).resolve().parents for r in celda["archivos"].values()):
        return {"estado": "listo", "archivos": celda["archivos"], "cache": True, "motivo": None,
                "celda": celda["celda"]}
    clave = _clave_punto(lat, lon, inicio, fin)
    carpeta = almacen.carpeta_cache("power", clave)
    ini, fi = inicio.replace("-", ""), fin.replace("-", "")
    base = f"power_{clave}_{ini}_{fi}"
    archivos = {
        "original": carpeta / f"{base}.original.json",
        "normalizado": carpeta / f"{base}.normalizado.csv",
        "procedencia": carpeta / f"{base}.procedencia.json",
    }
    if all(p.exists() for p in archivos.values()):
        return {"estado": "listo", "archivos": {k: str(v) for k, v in archivos.items()}, "cache": True, "motivo": None}
    script = config.obtener().datos_dir / "power" / "consulta_power.py"
    if not script.exists():
        return {"estado": "sin_datos", "archivos": None, "motivo": f"No se encontró el conector {script}"}
    try:
        r = subprocess.run(
            [sys.executable, str(script), "--lat", str(lat), "--lon", str(lon),
             "--inicio", ini, "--fin", fi, "--nombre", clave, "--salida", str(carpeta)],
            capture_output=True, text=True, timeout=180, encoding="utf-8", errors="replace",
        )
    except subprocess.TimeoutExpired:
        return {"estado": "sin_datos", "archivos": None, "motivo": "NASA POWER no respondió en 180 s."}
    if r.returncode != 0 or not all(p.exists() for p in archivos.values()):
        ultima = (r.stderr or r.stdout or "").strip().splitlines()
        return {"estado": "sin_datos", "archivos": None,
                "motivo": "El conector de NASA POWER falló: " + (ultima[-1] if ultima else f"código {r.returncode}")}
    return {"estado": "listo", "archivos": {k: str(v) for k, v in archivos.items()}, "cache": False, "motivo": None}


REGISTRO: list[Fuente] = [  # DT-17: solo estas tres fuentes en la demo
    Fuente("power", "NASA POWER", "punto", "al_momento", "celda de 0,5° × 0,625° (≈ 55 × 67 km en Arequipa)",
           "temperatura, lluvia, humedad y radiación diarias", obtener=_power),
    Fuente("modis_ndvi", "NDVI de MODIS (MOD13Q1 v061, servicio de ORNL)", "punto", "al_momento", "píxel nominal de 250 m, cada 16 días",
           "verdor de la zona",
           motivo_no_disponible=SIN_CONECTOR + " La consulta manual al servicio de ORNL sí se probó (Chivay)."),
    Fuente("soilgrids", "SoilGrids (ISRIC)", "punto", "al_momento", "250 m (predicción)", "pH del suelo",
           motivo_no_disponible=SIN_CONECTOR + " La consulta manual a la API sí se probó (Majes)."),
]


def fuente(id_: str) -> Fuente | None:
    return next((f for f in REGISTRO if f.id == id_), None)


def describir() -> list[dict]:
    return [{"id": f.id, "nombre": f.nombre, "pide": f.pide, "responde": f.responde, "resolucion": f.resolucion,
             "variables": f.variables, "conector": f.obtener is not None, "motivo_no_disponible": f.motivo_no_disponible}
            for f in REGISTRO]


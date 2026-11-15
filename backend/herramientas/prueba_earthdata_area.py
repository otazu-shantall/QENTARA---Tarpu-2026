"""Segunda prueba de Earthdata: pedidos POR ÁREA en AppEEARS, para decidir qué se precalcula.

Mide tiempo y tamaño de:
  1. relieve_zonas   NASADEM 30 m en dos zonas piloto de ≈ 10 × 10 km (Majes riego y Chivay): pendiente y orientación.
  2. modis_zonas     MODIS en las mismas zonas: NDVI y calidad (2015-01-01 a 2026-10-31), cobertura MCD12Q1 (2015-2024),
                     LST de noche y de día (2021-2026) y ET/PET (2021-2026).
  3. dem90_arequipa  SRTM 90 m del rectángulo de Arequipa (−17,5 a −14,5; −75,5 a −70,5), para el mapa interno de sectores.

Lo ejecuta una persona del equipo (usa la contraseña de backend/.env, como prueba_earthdata.py):
    backend/.venv/Scripts/python backend/herramientas/prueba_earthdata_area.py
Puede tardar horas: deja la ventana abierta. Resumen sin claves en backend/herramientas/salida/prueba_area_resumen.json.
Los archivos descargados (GeoTIFF) quedan en backend/herramientas/salida/area/ (git los ignora).
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import base64
import json
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from prueba_earthdata import API, SALIDA, _env, _pedir  # mismo login y peticiones

AREA = SALIDA / "area"


def cuadrado(lat: float, lon: float, d: float = 0.045) -> dict:
    """≈ 10 × 10 km alrededor del punto (0,045° ≈ 5 km)."""
    return [[lon - d, lat - d], [lon + d, lat - d], [lon + d, lat + d], [lon - d, lat + d], [lon - d, lat - d]]


ZONAS = {"type": "FeatureCollection", "features": [
    {"type": "Feature", "properties": {"id": "majes_riego"}, "geometry": {"type": "Polygon", "coordinates": [cuadrado(-16.367023, -72.185771)]}},
    {"type": "Feature", "properties": {"id": "chivay"}, "geometry": {"type": "Polygon", "coordinates": [cuadrado(-15.64, -71.60)]}},
]}
AREQUIPA = {"type": "FeatureCollection", "features": [
    {"type": "Feature", "properties": {"id": "rectangulo_arequipa"}, "geometry": {"type": "Polygon", "coordinates": [[
        [-75.5, -17.5], [-70.5, -17.5], [-70.5, -14.5], [-75.5, -14.5], [-75.5, -17.5]]]}}]}

TAREAS = {
    "relieve_zonas": (ZONAS, [{"startDate": "02-11-2000", "endDate": "02-21-2000"}],
                      [{"product": "NASADEM_NC.001", "layer": "NASADEM_HGT"}]),
    "modis_zonas": (ZONAS, [{"startDate": "01-01-2015", "endDate": "10-31-2026"}],
                    [{"product": "MOD13Q1.061", "layer": "_250m_16_days_NDVI"},
                     {"product": "MOD13Q1.061", "layer": "_250m_16_days_pixel_reliability"},
                     {"product": "MCD12Q1.061", "layer": "LC_Type1"},
                     {"product": "MOD11A2.061", "layer": "LST_Night_1km"},
                     {"product": "MOD11A2.061", "layer": "LST_Day_1km"},
                     {"product": "MOD16A2GF.061", "layer": "ET_500m"},
                     {"product": "MOD16A2GF.061", "layer": "PET_500m"}]),
    "dem90_arequipa": (AREQUIPA, [{"startDate": "02-11-2000", "endDate": "02-21-2000"}],
                       [{"product": "SRTMGL3_NC.003", "layer": "SRTMGL3_DEM"}]),
}


def main() -> None:
    AREA.mkdir(parents=True, exist_ok=True)
    env = _env()
    basic = base64.b64encode(f"{env['EARTHDATA_USERNAME']}:{env['EARTHDATA_PASSWORD']}".encode()).decode()
    t0 = time.time()
    token = _pedir("POST", "/login", basic=basic)["token"]
    resumen: dict = {"fecha": datetime.now(timezone.utc).isoformat(timespec="seconds"), "tareas": {}}
    pendientes = {}
    for nombre, (geo, fechas, capas) in TAREAS.items():
        cuerpo = {"task_type": "area", "task_name": f"tarpu_area_{nombre}",
                  "params": {"dates": fechas, "layers": capas, "geo": geo,
                             "output": {"format": {"type": "geotiff"}, "projection": "geographic"}}}
        try:
            pendientes[nombre] = (_pedir("POST", "/task", token=token, cuerpo=cuerpo)["task_id"], time.time())
            print(f"{nombre}: tarea enviada")
        except urllib.error.HTTPError as e:
            resumen["tareas"][nombre] = {"error": f"HTTP {e.code}", "detalle": e.read().decode("utf-8", "replace")[:800]}
            print(f"{nombre}: rechazada (HTTP {e.code})")
    while pendientes and time.time() - t0 < 6 * 3600:
        time.sleep(60)
        for nombre, (task_id, inicio) in list(pendientes.items()):
            try:
                estado = _pedir("GET", f"/task/{task_id}", token=token).get("status")
            except urllib.error.HTTPError as e:
                if e.code == 403:  # el token de AppEEARS caduca: volver a entrar
                    token = _pedir("POST", "/login", basic=basic)["token"]
                continue
            print(f"{nombre}: {estado} ({round((time.time() - inicio) / 60, 1)} min)")
            if estado in ("done", "error"):
                info = {"estado": estado, "minutos": round((time.time() - inicio) / 60, 1), "archivos": 0, "bytes": 0, "tif": 0}
                if estado == "done":
                    carpeta = AREA / nombre
                    carpeta.mkdir(exist_ok=True)
                    for f in _pedir("GET", f"/bundle/{task_id}", token=token)["files"]:
                        info["archivos"] += 1
                        info["bytes"] += f.get("file_size", 0)
                        info["tif"] += f["file_name"].endswith(".tif")
                        if nombre != "modis_zonas" or f["file_name"].endswith((".csv", ".json")) or info["tif"] <= 40:
                            destino = carpeta / Path(f["file_name"]).name
                            destino.write_bytes(_pedir("GET", f"/bundle/{task_id}/{f['file_id']}", token=token, crudo=True))
                resumen["tareas"][nombre] = info
                del pendientes[nombre]
                (SALIDA / "prueba_area_resumen.json").write_text(json.dumps(resumen, ensure_ascii=False, indent=1), encoding="utf-8")
    for nombre in pendientes:
        resumen["tareas"][nombre] = {"estado": "sin terminar tras 6 h"}
    resumen["total_min"] = round((time.time() - t0) / 60, 1)
    (SALIDA / "prueba_area_resumen.json").write_text(json.dumps(resumen, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Listo en {resumen['total_min']} min. Resumen: {SALIDA / 'prueba_area_resumen.json'}")


if __name__ == "__main__":
    main()

"""Prueba de las fuentes que necesitan cuenta de Earthdata (NASADEM, SMAP, ECOSTRESS, HLS) con AppEEARS.

Para qué: medir si responden en los dos lugares de ejemplo (Majes riego y Chivay), cuánto tardan
y qué valores devuelven, antes de decidir si entran en TARPU.

Lo ejecuta una persona del equipo, no un asistente de IA: usa la contraseña de Earthdata.

1. Crea el archivo backend/.env (git ya lo ignora) con estas dos líneas, escritas por ti:
       EARTHDATA_USERNAME=tu_usuario
       EARTHDATA_PASSWORD=tu_contraseña
2. Desde la raíz del repositorio:
       backend/.venv/Scripts/python backend/herramientas/prueba_earthdata.py
3. Deja el resumen en backend/herramientas/salida/prueba_earthdata_resumen.json (sin claves).
   Los CSV descargados quedan en la misma carpeta, que git ignora.

La contraseña nunca se imprime ni se guarda en la salida. Solo usa la biblioteca estándar.
Documentación de la API: https://appeears.earthdatacloud.nasa.gov/api/
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import base64
import csv
import io
import json
import math
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = "https://appeears.earthdatacloud.nasa.gov/api"
BACKEND = Path(__file__).resolve().parent.parent
SALIDA = Path(__file__).resolve().parent / "salida"
PUNTOS = [
    {"id": "majes_riego", "category": "tarpu", "latitude": -16.367023, "longitude": -72.185771},
    {"id": "chivay", "category": "tarpu", "latitude": -15.64, "longitude": -71.60},
]
# Dos tareas: el relieve es estático (su fecha es la de la misión SRTM); el resto, una serie corta.
TAREAS = {
    "relieve": {
        "dates": [{"startDate": "02-11-2000", "endDate": "02-21-2000"}],
        "layers": [{"product": "NASADEM_NC.001", "layer": "NASADEM_HGT"}],
    },
    "series_2024_ene_mar": {
        "dates": [{"startDate": "01-01-2024", "endDate": "03-31-2024"}],
        "layers": [
            {"product": "SPL3SMP_E.006", "layer": "Soil_Moisture_Retrieval_Data_AM_soil_moisture"},
            {"product": "SPL4SMGP.008", "layer": "Geophysical_Data_sm_surface"},
            {"product": "SPL4SMGP.008", "layer": "Geophysical_Data_sm_rootzone"},
            {"product": "ECO_L3T_JET.002", "layer": "ETdaily"},
            {"product": "ECO_L4T_ESI.002", "layer": "ESI"},
            {"product": "HLSL30_VI.020", "layer": "NDVI"},
            {"product": "HLSS30_VI.020", "layer": "NDVI"},
        ],
    },
}


def _env() -> dict[str, str]:
    archivo = BACKEND / ".env"
    if not archivo.exists():
        raise SystemExit(f"No existe {archivo}. Créalo con EARTHDATA_USERNAME y EARTHDATA_PASSWORD (ver el encabezado).")
    valores = {}
    for linea in archivo.read_text(encoding="utf-8").splitlines():
        if "=" in linea and not linea.strip().startswith("#"):
            k, v = linea.split("=", 1)
            valores[k.strip()] = v.strip()
    if not valores.get("EARTHDATA_USERNAME") or not valores.get("EARTHDATA_PASSWORD"):
        raise SystemExit("Faltan EARTHDATA_USERNAME o EARTHDATA_PASSWORD en backend/.env.")
    return valores


def _pedir(metodo: str, ruta: str, token: str | None = None, cuerpo: dict | None = None,
           basic: str | None = None, crudo: bool = False):
    cabeceras = {"User-Agent": "tarpu-qentara-hackathon"}
    datos = None
    if token:
        cabeceras["Authorization"] = f"Bearer {token}"
    if basic:
        cabeceras["Authorization"] = f"Basic {basic}"
        cabeceras["Content-Length"] = "0"
    if cuerpo is not None:
        datos = json.dumps(cuerpo).encode("utf-8")
        cabeceras["Content-Type"] = "application/json"
    peticion = urllib.request.Request(API + ruta, data=datos, headers=cabeceras, method=metodo)
    with urllib.request.urlopen(peticion, timeout=120) as r:
        contenido = r.read()
    return contenido if crudo else json.loads(contenido.decode("utf-8"))


def _resumir_csv(texto: str) -> dict:
    """Cuenta filas y da mínimo y máximo por columna numérica de resultados, sin interpretar."""
    filas = list(csv.DictReader(io.StringIO(texto)))
    resumen: dict = {"filas": len(filas), "columnas": {}}
    if not filas:
        return resumen
    for col in filas[0]:
        if not any(s in col for s in ("NASADEM_HGT", "soil_moisture", "sm_surface", "sm_rootzone", "ETdaily", "ESI", "NDVI")):
            continue
        if col.endswith(("_QC", "_Description", "_MODLAND", "_bitmask")) or "Quality" in col:
            continue
        valores = []
        for f in filas:
            try:
                v = float(f[col])
                if not math.isnan(v):
                    valores.append(v)
            except (TypeError, ValueError):
                pass
        resumen["columnas"][col] = {"con_valor": len(valores), "min": min(valores) if valores else None,
                                    "max": max(valores) if valores else None}
    resumen["puntos"] = sorted({f.get("ID", "") for f in filas})
    return resumen


def main() -> None:
    SALIDA.mkdir(parents=True, exist_ok=True)
    env = _env()
    basic = base64.b64encode(f"{env['EARTHDATA_USERNAME']}:{env['EARTHDATA_PASSWORD']}".encode()).decode()
    t0 = time.time()
    token = _pedir("POST", "/login", basic=basic)["token"]
    resumen: dict = {"fecha": datetime.now(timezone.utc).isoformat(timespec="seconds"), "login_s": round(time.time() - t0, 1), "tareas": {}}
    enviadas = {}
    for nombre, p in TAREAS.items():
        cuerpo = {"task_type": "point", "task_name": f"tarpu_prueba_{nombre}",
                  "params": {"dates": p["dates"], "layers": p["layers"], "coordinates": PUNTOS}}
        try:
            r = _pedir("POST", "/task", token=token, cuerpo=cuerpo)
            enviadas[nombre] = (r["task_id"], time.time())
            print(f"{nombre}: tarea enviada")
        except urllib.error.HTTPError as e:
            resumen["tareas"][nombre] = {"error": f"HTTP {e.code}", "detalle": e.read().decode("utf-8", "replace")[:500]}
    pendientes = dict(enviadas)
    while pendientes and time.time() - t0 < 45 * 60:
        time.sleep(20)
        for nombre, (task_id, inicio) in list(pendientes.items()):
            estado = _pedir("GET", f"/task/{task_id}", token=token).get("status")
            print(f"{nombre}: {estado} ({round(time.time() - inicio)} s)")
            if estado in ("done", "error"):
                info = {"estado": estado, "segundos": round(time.time() - inicio, 1), "archivos": {}}
                if estado == "done":
                    for f in _pedir("GET", f"/bundle/{task_id}", token=token)["files"]:
                        if f["file_name"].endswith(".csv"):
                            texto = _pedir("GET", f"/bundle/{task_id}/{f['file_id']}", token=token, crudo=True).decode("utf-8", "replace")
                            (SALIDA / f"{nombre}__{f['file_name']}").write_text(texto, encoding="utf-8")
                            info["archivos"][f["file_name"]] = _resumir_csv(texto)
                resumen["tareas"][nombre] = info
                del pendientes[nombre]
    for nombre in pendientes:
        resumen["tareas"][nombre] = {"estado": "sin terminar tras 45 min"}
    resumen["total_s"] = round(time.time() - t0, 1)
    (SALIDA / "prueba_earthdata_resumen.json").write_text(json.dumps(resumen, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Listo en {resumen['total_s']} s. Resumen: {SALIDA / 'prueba_earthdata_resumen.json'}")


if __name__ == "__main__":
    main()

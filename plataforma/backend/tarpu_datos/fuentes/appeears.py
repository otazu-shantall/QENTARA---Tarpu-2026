"""AppEEARS (NASA Earthdata): NASADEM, HLS y SMAP por punto o por área. Vía de respaldo de la capa 2 (DT-22).

Origen: trabajo/extraccion_pesada/pesados.py (15/11/2026). Uso desde backend/: python -m tarpu_datos.fuentes.appeears ...
Lo que sigue es la descripción original, para los 3 lugares de ejemplo de TARPU.

Fuentes: NASADEM (relieve, 30 m), HLS NDVI (verdor de 30 m), SMAP (humedad del suelo, 9 km) y,
para diagnóstico, MODIS por área. Cada fuente es un pedido PEQUEÑO y SEPARADO. Los pedidos quedan
guardados en tareas.json: puedes cerrar la ventana y retomar después, porque AppEEARS los sigue
procesando en sus servidores.

Credenciales: backend/.env con EARTHDATA_USERNAME y EARTHDATA_PASSWORD (git lo ignora). Las escribe
la persona que ejecuta; un asistente de IA no debe usarlas.

Comandos (desde backend/):
    .venv/Scripts/python -m tarpu_datos.fuentes.appeears estado
    .venv/Scripts/python -m tarpu_datos.fuentes.appeears pedir relieve
    .venv/Scripts/python -m tarpu_datos.fuentes.appeears pedir hls --desde 2025-01-01 --hasta 2026-10-31
    .venv/Scripts/python -m tarpu_datos.fuentes.appeears pedir smap --desde 2025-01-01 --hasta 2026-10-31
    .venv/Scripts/python -m tarpu_datos.fuentes.appeears pedir imagenes_chivay --desde 2026-08-01 --hasta 2026-10-31
    .venv/Scripts/python -m tarpu_datos.fuentes.appeears pedir modis_prueba --desde 2025-01-01 --hasta 2025-12-31
    .venv/Scripts/python -m tarpu_datos.fuentes.appeears esperar
    .venv/Scripts/python -m tarpu_datos.fuentes.appeears descargar <task_id>
Ver README.md. Solo biblioteca estándar.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = "https://appeears.earthdatacloud.nasa.gov/api"
BACKEND = Path(__file__).resolve().parents[2]  # carpeta backend/ (dentro de plataforma/)
SALIDA = BACKEND / "almacen" / "appeears"
REGISTRO = SALIDA / "tareas.json"

# Lugares de ejemplo. S2 elegido con el censo agropecuario 2012 (INEI): sector censal 00102,
# provincia 05 (Caylloma), distrito 03 (Cabanaconde, ubigeo 040503), piso Quechua, altitud 2908 m, maíz amiláceo 56,7 de 94,6 ha.
LUGARES = {
    "majes_riego": {"latitude": -16.367023, "longitude": -72.185771, "sector": "S1"},
    "valle_s2": {"latitude": -15.612386, "longitude": -71.984857, "sector": "S2"},
    "chivay": {"latitude": -15.64, "longitude": -71.60, "sector": "S3"},
}


def _cuadrado(lat: float, lon: float, d: float = 0.045) -> list:
    """≈ 10 × 10 km alrededor del punto (0,045° ≈ 5 km)."""
    return [[lon - d, lat - d], [lon + d, lat - d], [lon + d, lat + d], [lon - d, lat + d], [lon - d, lat - d]]


def _zonas(nombres) -> dict:
    return {"type": "FeatureCollection", "features": [
        {"type": "Feature", "properties": {"id": n},
         "geometry": {"type": "Polygon", "coordinates": [_cuadrado(LUGARES[n]["latitude"], LUGARES[n]["longitude"])]}}
        for n in nombres]}


def _puntos() -> list:
    return [{"id": n, "category": v["sector"], "latitude": v["latitude"], "longitude": v["longitude"]} for n, v in LUGARES.items()]


def _fecha(s: str) -> str:
    """AAAA-MM-DD -> MM-DD-AAAA (formato de AppEEARS)."""
    a, m, d = s.split("-")
    return f"{m}-{d}-{a}"


# ------------------------------------------------------------------ planes de pedido
def planes(desde: str, hasta: str) -> dict:
    fechas = [{"startDate": _fecha(desde), "endDate": _fecha(hasta)}]
    return {
        # Relieve: estático; su fecha es la de la misión SRTM. Medido el 15/11: 2 zonas en 3,1 min.
        "relieve": [("relieve_3_zonas", "area", {"geo": _zonas(LUGARES), "dates": [{"startDate": "02-11-2000", "endDate": "02-21-2000"}],
                     "layers": [{"product": "NASADEM_NC.001", "layer": "NASADEM_HGT"}]})],
        # HLS: un pedido por satélite (Landsat y Sentinel), por punto.
        "hls": [("hls_landsat_puntos", "point", {"coordinates": _puntos(), "dates": fechas,
                 "layers": [{"product": "HLSL30_VI.020", "layer": "NDVI"}]}),
                ("hls_sentinel_puntos", "point", {"coordinates": _puntos(), "dates": fechas,
                 "layers": [{"product": "HLSS30_VI.020", "layer": "NDVI"}]})],
        # SMAP: L3 observado (diario) y L4 modelado (cada 3 h), por punto.
        "smap": [("smap_l3_puntos", "point", {"coordinates": _puntos(), "dates": fechas,
                  "layers": [{"product": "SPL3SMP_E.006", "layer": "Soil_Moisture_Retrieval_Data_AM_soil_moisture"}]}),
                 ("smap_l4_puntos", "point", {"coordinates": _puntos(), "dates": fechas,
                  "layers": [{"product": "SPL4SMGP.008", "layer": "Geophysical_Data_sm_surface"},
                             {"product": "SPL4SMGP.008", "layer": "Geophysical_Data_sm_rootzone"}]})],
        # Imágenes de Chivay: NDVI de 30 m por área (10 × 10 km), un pedido por satélite.
        "imagenes_chivay": [("img_chivay_landsat", "area", {"geo": _zonas(["chivay"]), "dates": fechas,
                             "layers": [{"product": "HLSL30_VI.020", "layer": "NDVI"}]}),
                            ("img_chivay_sentinel", "area", {"geo": _zonas(["chivay"]), "dates": fechas,
                             "layers": [{"product": "HLSS30_VI.020", "layer": "NDVI"}]})],
        # Diagnóstico de lo que se quedó «processing» anoche: MODIS por área, UNA capa, UNA zona.
        "modis_prueba": [("modis_ndvi_chivay_area", "area", {"geo": _zonas(["chivay"]), "dates": fechas,
                          "layers": [{"product": "MOD13Q1.061", "layer": "_250m_16_days_NDVI"}]})],
    }


# ------------------------------------------------------------------ AppEEARS
def _credenciales() -> tuple[str, str]:
    valores = {}
    archivo = BACKEND / ".env"
    if archivo.exists():
        for linea in archivo.read_text(encoding="utf-8").splitlines():
            if "=" in linea and not linea.strip().startswith("#"):
                k, v = linea.split("=", 1)
                valores[k.strip()] = v.strip()
    usuario = os.environ.get("EARTHDATA_USERNAME") or valores.get("EARTHDATA_USERNAME")
    clave = os.environ.get("EARTHDATA_PASSWORD") or valores.get("EARTHDATA_PASSWORD")
    if not usuario or not clave:
        raise SystemExit("Faltan EARTHDATA_USERNAME y EARTHDATA_PASSWORD en backend/.env.")
    return usuario, clave


def _pedir(metodo: str, ruta: str, token: str | None = None, cuerpo=None, basic: str | None = None, crudo=False):
    cab = {"User-Agent": "tarpu-qentara-hackathon"}
    datos = None
    if token:
        cab["Authorization"] = f"Bearer {token}"
    if basic:
        cab["Authorization"] = f"Basic {basic}"
        cab["Content-Length"] = "0"
    if cuerpo is not None:
        datos = json.dumps(cuerpo).encode()
        cab["Content-Type"] = "application/json"
    with urllib.request.urlopen(urllib.request.Request(API + ruta, data=datos, headers=cab, method=metodo), timeout=300) as r:
        b = r.read()
    return b if crudo else json.loads(b.decode("utf-8"))


def entrar() -> str:
    u, c = _credenciales()
    return _pedir("POST", "/login", basic=base64.b64encode(f"{u}:{c}".encode()).decode())["token"]


def _registro() -> dict:
    return json.loads(REGISTRO.read_text(encoding="utf-8")) if REGISTRO.exists() else {}


def _escribir_atomico(ruta: Path, datos: bytes) -> None:
    """Escribe en un .part y lo renombra: un corte a mitad nunca deja un archivo a medias con el nombre final."""
    tmp = ruta.with_name(ruta.name + ".part")
    tmp.write_bytes(datos)
    os.replace(tmp, ruta)


def _guardar_registro(r: dict) -> None:
    _escribir_atomico(REGISTRO, json.dumps(r, ensure_ascii=False, indent=1).encode("utf-8"))


ERRORES_RED = (urllib.error.URLError, TimeoutError, ConnectionError, OSError)


def _ahora() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


# ------------------------------------------------------------------ comandos
def cmd_estado(token: str) -> None:
    """Todas las tareas de la cuenta, incluidas las de anoche (prueba por área)."""
    tareas = _pedir("GET", "/task", token=token)
    print(f"{len(tareas)} tareas en la cuenta:")
    for t in sorted(tareas, key=lambda x: x.get("created", "")):
        print(f"  {t.get('task_name',''):<40} {t.get('status',''):<11} creada {t.get('created','')[:19]}  "
              f"actualizada {t.get('updated','')[:19]}  id {t.get('task_id')}")
    (SALIDA).mkdir(exist_ok=True)
    (SALIDA / "estado_cuenta.json").write_text(json.dumps(tareas, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Guardado en {SALIDA / 'estado_cuenta.json'}")


def cmd_pedir(token: str, plan: str, desde: str, hasta: str) -> None:
    reg = _registro()
    for nombre, tipo, params in planes(desde, hasta)[plan]:
        ya = [k for k, v in reg.items() if v["nombre"] == nombre and v["desde"] == desde and v["hasta"] == hasta and v["estado"] != "error"]
        if ya:
            print(f"{nombre}: ya pedida ({ya[0]}, {reg[ya[0]]['estado']}); no se repite. Usa «esperar».")
            continue
        cuerpo = {"task_type": tipo, "task_name": f"tarpu_{nombre}", "params": dict(params)}
        if tipo == "area":
            cuerpo["params"]["output"] = {"format": {"type": "geotiff"}, "projection": "geographic"}
        try:
            r = _pedir("POST", "/task", token=token, cuerpo=cuerpo)
            reg[r["task_id"]] = {"nombre": nombre, "plan": plan, "tipo": tipo, "desde": desde, "hasta": hasta,
                                 "enviada": _ahora(), "estado": "enviada"}
            print(f"{nombre}: enviada ({r['task_id']})")
        except urllib.error.HTTPError as e:
            print(f"{nombre}: RECHAZADA HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:500]}")
    _guardar_registro(reg)


def _descargar(token: str, task_id: str, nombre: str) -> dict:
    carpeta = SALIDA / nombre
    carpeta.mkdir(parents=True, exist_ok=True)
    archivos = _pedir("GET", f"/bundle/{task_id}", token=token)["files"]
    total = 0
    for f in archivos:
        destino = carpeta / Path(f["file_name"]).name
        tam = f.get("file_size")
        # Se salta solo si ya está completo (mismo tamaño que anuncia AppEEARS); si no, se vuelve a bajar.
        if not (destino.exists() and (tam is None or destino.stat().st_size == tam)):
            _escribir_atomico(destino, _pedir("GET", f"/bundle/{task_id}/{f['file_id']}", token=token, crudo=True))
        total += tam or 0
    return {"archivos": len(archivos), "bytes": total, "carpeta": str(carpeta)}


def cmd_esperar(token: str, cada: int) -> None:
    """Consulta las tareas de tareas.json hasta que todas terminen; descarga las que terminan."""
    reg = _registro()
    while True:
        pendientes = [k for k, v in reg.items() if v["estado"] not in ("done", "error", "descargada")]
        if not pendientes:
            break
        for task_id in pendientes:
            v = reg[task_id]
            try:
                estado = _pedir("GET", f"/task/{task_id}", token=token).get("status")
            except urllib.error.HTTPError as e:
                print(f"{v['nombre']:<28} HTTP {e.code} al consultar; se reintenta en la próxima vuelta")
                if e.code in (401, 403):
                    token = entrar()
                continue
            except ERRORES_RED as e:
                print(f"{v['nombre']:<28} sin conexión ({e}); se reintenta en la próxima vuelta")
                continue
            minutos = round((datetime.now(timezone.utc) - datetime.fromisoformat(v["enviada"])).total_seconds() / 60, 1)
            print(f"{v['nombre']:<28} {estado:<11} {minutos} min")
            v["ultimo_estado"] = estado
            if estado == "done":
                v.setdefault("minutos", minutos)  # minutos hasta que AppEEARS la terminó (la primera vez que se vio «done»)
                try:
                    v.update(estado="descargada", terminada=_ahora(), **_descargar(token, task_id, v["nombre"]))
                    print(f"   -> descargada en {v['carpeta']}")
                except (urllib.error.HTTPError, *ERRORES_RED) as e:
                    print(f"   -> descarga cortada ({e}); se retoma en la próxima vuelta sin repetir lo ya bajado")
            elif estado == "error":
                v.update(estado="error", minutos=minutos)
        _guardar_registro(reg)
        if any(v["estado"] not in ("descargada", "error") for v in reg.values()):
            time.sleep(cada)
    resumen = {k: {x: v.get(x) for x in ("nombre", "plan", "desde", "hasta", "estado", "minutos", "archivos", "bytes")} for k, v in reg.items()}
    SALIDA.mkdir(exist_ok=True)
    (SALIDA / "resumen.json").write_text(json.dumps(resumen, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Todo terminado. Resumen: {SALIDA / 'resumen.json'}")


def main() -> None:
    a = argparse.ArgumentParser(description="Datos pesados de AppEEARS para los lugares de ejemplo de TARPU")
    sub = a.add_subparsers(dest="comando", required=True)
    sub.add_parser("estado")
    p = sub.add_parser("pedir")
    p.add_argument("plan", choices=["relieve", "hls", "smap", "imagenes_chivay", "modis_prueba"])
    p.add_argument("--desde", default="2025-01-01")
    p.add_argument("--hasta", default="2026-10-31")
    e = sub.add_parser("esperar")
    e.add_argument("--cada", type=int, default=60, help="segundos entre consultas")
    d = sub.add_parser("descargar")
    d.add_argument("task_id")
    d.add_argument("--nombre", default=None)
    c = sub.add_parser("cancelar")
    c.add_argument("task_id")
    args = a.parse_args()
    SALIDA.mkdir(exist_ok=True)
    token = entrar()
    if args.comando == "estado":
        cmd_estado(token)
    elif args.comando == "pedir":
        cmd_pedir(token, args.plan, args.desde, args.hasta)
    elif args.comando == "esperar":
        cmd_esperar(token, args.cada)
    elif args.comando == "descargar":
        print(_descargar(token, args.task_id, args.nombre or args.task_id))
    elif args.comando == "cancelar":
        # Borra la tarea en AppEEARS (sirve para liberar la cola si una se quedó trabada).
        _pedir("DELETE", f"/task/{args.task_id}", token=token, crudo=True)
        reg = _registro()
        if args.task_id in reg:
            reg[args.task_id]["estado"] = "error"
            reg[args.task_id]["nota"] = "cancelada a mano"
            _guardar_registro(reg)
        print(f"Tarea {args.task_id} cancelada.")


if __name__ == "__main__":
    sys.exit(main())

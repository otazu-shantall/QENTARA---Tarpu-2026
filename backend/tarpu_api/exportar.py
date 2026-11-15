"""Exporta las rutas GET a JSON estático para la web publicada (DT-13).

Uso, desde backend/:  .venv/Scripts/python -m tarpu_api.exportar [--destino RUTA]
Por defecto escribe en TARPU_EXPORT_DIR (../Codigo/public/api). /api/X → <destino>/X.json.
Solo exporta parcelas registradas con datos reales (con indicadores de su versión actual).
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import argparse
import json
from dataclasses import replace
from pathlib import Path

from fastapi.testclient import TestClient

from . import almacen, config


def _escribir(destino: Path, ruta_api: str, cuerpo: dict) -> Path:
    archivo = destino / (ruta_api.removeprefix("/api/") + ".json")
    archivo.parent.mkdir(parents=True, exist_ok=True)
    archivo.write_text(json.dumps(cuerpo, ensure_ascii=False, indent=1), encoding="utf-8")
    return archivo


def exportar(destino: Path | None = None) -> list[Path]:
    original = config.obtener()
    destino = destino or original.export_dir
    config.fijar(replace(original, modo="publicado"))
    try:
        from .main import app
        cliente = TestClient(app)
        escritos: list[Path] = []
        listas = cliente.get("/api/parcelas").json()
        exportables = []
        for p in listas["data"]:
            r = cliente.get(f"/api/parcelas/{p['id']}/indicadores")
            if r.status_code == 200:
                exportables.append(p)
        listas["data"] = exportables
        escritos.append(_escribir(destino, "/api/parcelas", listas))
        for ruta in ("/api/meta", "/api/catalogo"):
            escritos.append(_escribir(destino, ruta, cliente.get(ruta).json()))
        for p in exportables:
            base = f"/api/parcelas/{p['id']}"
            # rotaciones antes que agente: el banco del agente lee rotaciones.json
            for ruta in (base, f"{base}/indicadores", f"{base}/clima", f"{base}/rotaciones", f"{base}/agente", f"{base}/datos"):
                r = cliente.get(ruta)
                r.raise_for_status()
                escritos.append(_escribir(destino, ruta, r.json()))
        return escritos
    finally:
        config.fijar(original)


if __name__ == "__main__":
    a = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    a.add_argument("--destino", type=Path, default=None)
    args = a.parse_args()
    archivos = exportar(args.destino)
    print(f"{len(archivos)} archivos escritos en {(args.destino or config.obtener().export_dir)}")
    if not almacen.ids_parcelas():
        print("Aviso: no hay parcelas registradas; solo se exportaron meta, catálogo y la lista vacía.")

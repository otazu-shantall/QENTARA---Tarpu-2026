"""Almacén: el ÚNICO módulo que lee y escribe en disco (DISENO.md §9).

En la demo no hay base de datos (DT-13): cada parcela es una carpeta con JSON.
    almacen/parcelas/{id}/parcela.json · contexto.json · procesamiento.json · indicadores.json · rotaciones.json
    almacen/cache/{fuente}/{clave}/   archivos de los conectores del área de datos
Si después se pasa a PostGIS, solo cambia este archivo.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import json
import os
import re
import tempfile
from pathlib import Path
from typing import Any

from . import config

_ID = re.compile(r"^[a-z0-9-]{1,80}$")


def _raiz() -> Path:
    return config.obtener().almacen_dir


def _carpeta_parcela(parcela_id: str) -> Path:
    if not _ID.match(parcela_id):
        raise ValueError("id de parcela no válido")
    return _raiz() / "parcelas" / parcela_id


def _escribir_atomico(ruta: Path, texto: str) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=ruta.parent, prefix=".tmp-", suffix=ruta.suffix)
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(texto)
    os.replace(tmp, ruta)


def guardar(parcela_id: str, nombre: str, datos: Any) -> None:
    _escribir_atomico(_carpeta_parcela(parcela_id) / f"{nombre}.json", json.dumps(datos, ensure_ascii=False, indent=1))


def leer(parcela_id: str, nombre: str) -> Any | None:
    ruta = _carpeta_parcela(parcela_id) / f"{nombre}.json"
    if not ruta.exists():
        return None
    return json.loads(ruta.read_text(encoding="utf-8"))


def existe_parcela(parcela_id: str) -> bool:
    try:
        return (_carpeta_parcela(parcela_id) / "parcela.json").exists()
    except ValueError:
        return False


def ids_parcelas() -> list[str]:
    carpeta = _raiz() / "parcelas"
    if not carpeta.exists():
        return []
    return sorted(p.name for p in carpeta.iterdir() if (p / "parcela.json").exists())


def carpeta_cache(fuente: str, clave: str) -> Path:
    """Carpeta donde un conector deja sus archivos. Se crea si no existe."""
    if not re.match(r"^[a-z0-9_]+$", fuente) or not re.match(r"^[A-Za-z0-9_.-]+$", clave):
        raise ValueError("fuente o clave de caché no válida")
    ruta = _raiz() / "cache" / fuente / clave
    ruta.mkdir(parents=True, exist_ok=True)
    return ruta


def leer_texto(ruta: str | Path) -> str:
    """Lee un archivo de la caché (ingesta y datos detallados pasan por aquí)."""
    ruta = Path(ruta).resolve()
    if _raiz().resolve() not in ruta.parents:
        raise ValueError("solo se leen archivos del almacén")
    return ruta.read_text(encoding="utf-8")

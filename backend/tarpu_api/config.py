"""Configuración: variables de entorno con valores por defecto (DISENO.md §3).

Lee backend/.env si existe (formato CLAVE=valor). Las rutas relativas se resuelven desde backend/.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent


def _leer_env_archivo() -> dict[str, str]:
    archivo = BACKEND_DIR / ".env"
    valores: dict[str, str] = {}
    if archivo.exists():
        for linea in archivo.read_text(encoding="utf-8").splitlines():
            linea = linea.strip()
            if linea and not linea.startswith("#") and "=" in linea:
                clave, valor = linea.split("=", 1)
                valores[clave.strip()] = valor.strip()
    return valores


def _ruta(valor: str) -> Path:
    ruta = Path(valor)
    return ruta if ruta.is_absolute() else (BACKEND_DIR / ruta).resolve()


@dataclass
class Config:
    modo: str = "en_vivo"
    datos_dir: Path = field(default_factory=lambda: _ruta("../datos"))
    almacen_dir: Path = field(default_factory=lambda: _ruta("almacen"))
    catalogo: Path = field(default_factory=lambda: _ruta("catalogo/ecocrop_2026-11-14.json"))
    export_dir: Path = field(default_factory=lambda: _ruta("../Codigo/public/api"))
    cors: list[str] = field(default_factory=lambda: ["http://127.0.0.1:5173", "http://localhost:5173"])
    power_inicio: str = "2015-01-01"
    power_fin: str = "2025-12-31"

    @classmethod
    def desde_entorno(cls) -> "Config":
        env = {**_leer_env_archivo(), **os.environ}
        c = cls()
        if "TARPU_MODO" in env:
            if env["TARPU_MODO"] not in ("en_vivo", "publicado"):
                raise ValueError("TARPU_MODO debe ser en_vivo o publicado")
            c.modo = env["TARPU_MODO"]
        if "TARPU_DATOS_DIR" in env:
            c.datos_dir = _ruta(env["TARPU_DATOS_DIR"])
        if "TARPU_ALMACEN_DIR" in env:
            c.almacen_dir = _ruta(env["TARPU_ALMACEN_DIR"])
        if "TARPU_CATALOGO" in env:
            c.catalogo = _ruta(env["TARPU_CATALOGO"])
        if "TARPU_EXPORT_DIR" in env:
            c.export_dir = _ruta(env["TARPU_EXPORT_DIR"])
        if "TARPU_CORS" in env:
            c.cors = [o.strip() for o in env["TARPU_CORS"].split(",") if o.strip()]
        c.power_inicio = env.get("TARPU_POWER_INICIO", c.power_inicio)
        c.power_fin = env.get("TARPU_POWER_FIN", c.power_fin)
        return c


_config: Config | None = None


def obtener() -> Config:
    global _config
    if _config is None:
        _config = Config.desde_entorno()
    return _config


def fijar(c: Config) -> None:
    """Reemplaza la configuración (pruebas y exportación)."""
    global _config
    _config = c

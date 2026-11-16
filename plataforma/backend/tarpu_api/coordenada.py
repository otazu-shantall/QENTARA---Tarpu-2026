"""Trabajos de extracción por coordenada (capa 2, DT-22) y lectura en crudo de sus archivos, para la API.

Delega en tarpu_datos.coordenada.trabajos. archivo() solo sirve archivos .csv y .json de dentro del almacén.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

from pathlib import Path

from tarpu_datos.coordenada import trabajos
from tarpu_datos.archivos import relativa
from tarpu_datos.repositorio import obtener as repositorio

from . import config, errores, geometria

MAX_BYTES = 8_000_000


def iniciar(lat: float | None, lon: float | None, nombre: str | None, contorno: dict | None = None) -> dict:
    """Con contorno: se extrae en su centroide y el trabajo guarda la parcela (las celdas cubren la parcela)."""
    parcela = None
    if contorno:
        medidas = geometria.medir(contorno)
        lat, lon = medidas["centroide"]["lat"], medidas["centroide"]["lon"]
        parcela = {"contorno": contorno, "area_ha": medidas["area_ha"], "perimetro_m": medidas["perimetro_m"],
                   "pixeles_modis_250m": medidas["pixeles_modis_250m"]}
    if lat is None or lon is None:
        raise errores.datos_invalidos([{"campo": "lat/lon", "mensaje": "falta el punto o el contorno"}])
    return trabajos.iniciar(lat, lon, nombre, parcela)


def cancelar(claves: list[str]) -> list[dict]:
    salida = []
    for clave in claves:
        t = trabajos.cancelar(clave)
        salida.append(t if t else {"clave": clave, "estado": "no_existe"})
    return salida


def listar() -> list[dict]:
    trabajos.marcar_interrumpidos()
    return trabajos.listar()


def de_punto(lat: float, lon: float) -> dict | None:
    return trabajos.de_punto(lat, lon)


def estado(clave: str) -> dict:
    trabajos.marcar_interrumpidos()
    t = trabajos.estado(clave)
    if t is None:
        raise errores.datos_no_listos(f"No hay un trabajo con la clave {clave}.")
    return t


def _en_almacen(ruta: str, almacen: Path) -> Path:
    """Ruta dentro del almacén de ESTA API. Los trabajos guardan rutas absolutas de donde se extrajeron
    (Windows, contenedor o una carpeta anterior a DT-27): se toma lo que va después del último «almacen»."""
    partes = ruta.replace("\\", "/").split("/")
    if "almacen" in partes:
        resto = partes[len(partes) - 1 - partes[::-1].index("almacen") + 1:]
        return almacen.joinpath(*resto).resolve()
    return Path(ruta).resolve()


def archivo(ruta: str) -> dict:
    almacen = config.obtener().almacen_dir.resolve()
    p = _en_almacen(ruta, almacen)
    if not p.is_relative_to(almacen) or p.suffix not in (".csv", ".json"):
        raise errores.datos_invalidos([{"campo": "ruta", "mensaje": "solo archivos .csv o .json dentro del almacén"}])
    nombre = relativa(p.relative_to(almacen).as_posix())
    repo = repositorio()
    if repo.nombre == 'supabase':
        contenido = repo.leer_archivo(nombre)
        if contenido is not None:
            return {"ruta": nombre, "bytes": len(contenido), "recortado": len(contenido) > MAX_BYTES,
                    "contenido": contenido[:MAX_BYTES].decode('utf-8', errors='replace')}
    if not p.is_relative_to(almacen) or p.suffix not in (".csv", ".json") or not p.is_file():
        raise errores.datos_invalidos([{"campo": "ruta", "mensaje": "solo archivos .csv o .json dentro del almacén"}])
    tam = p.stat().st_size
    with p.open('rb') as f:
        texto = f.read(MAX_BYTES).decode('utf-8', errors='replace')
    return {"ruta": str(p.relative_to(almacen)), "bytes": tam, "recortado": tam > MAX_BYTES, "contenido": texto}

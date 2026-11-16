"""Nombres portables del almacén para Storage. Asistencia de IA (Codex); entrega/uso-de-ia.md."""
from pathlib import PurePosixPath


def relativa(ruta: str) -> str:
    partes = ruta.replace('\\', '/').split('/')
    if 'almacen' in partes:
        partes = partes[len(partes) - partes[::-1].index('almacen'):]
    if not partes or any(p in ('', '.', '..') or ':' in p for p in partes):
        raise ValueError('ruta de almacén no válida')
    nombre = PurePosixPath(*partes)
    if nombre.suffix not in ('.csv', '.json'):
        raise ValueError('solo archivos csv o json')
    return nombre.as_posix()

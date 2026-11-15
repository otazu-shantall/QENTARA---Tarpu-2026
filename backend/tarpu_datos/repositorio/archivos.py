"""Repositorio en archivos (backend/almacen/): el comportamiento de antes de Supabase.

Trabajos en almacen/trabajos/<clave>.json; cobertura de celdas en almacen/celdas.json (qué celda tiene serie y hasta
cuándo, para reutilizar entre parcelas vecinas). Las series siguen en los archivos de cada fuente.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import json
import threading
import time
from pathlib import Path

from ..fuentes.cliente import ahora_iso, escribir_atomico

ALMACEN = Path(__file__).resolve().parents[2] / 'almacen'


class RepositorioArchivos:
    nombre = 'archivos'

    def __init__(self) -> None:
        self.trabajos_dir = ALMACEN / 'trabajos'
        self.celdas_archivo = ALMACEN / 'celdas.json'
        self._lock = threading.Lock()

    # ---------------------------------------------------------- utilidades
    @staticmethod
    def _leer(ruta: Path):
        for _ in range(20):  # en Windows la lectura puede chocar con un reemplazo en curso
            try:
                return json.loads(ruta.read_text(encoding='utf-8'))
            except FileNotFoundError:
                return None
            except (PermissionError, json.JSONDecodeError):
                time.sleep(0.05)
        return None

    # ---------------------------------------------------------- trabajos
    def leer_trabajo(self, clave: str) -> dict | None:
        return self._leer(self.trabajos_dir / f'{clave}.json')

    def guardar_trabajo(self, t: dict) -> None:
        t['actualizado'] = ahora_iso()
        escribir_atomico(self.trabajos_dir / f'{t["clave"]}.json', json.dumps(t, ensure_ascii=False, indent=1))

    def listar_trabajos(self) -> list[dict]:
        return [t for t in (self._leer(r) for r in self.trabajos_dir.glob('*.json')) if t]

    def tomar_trabajo(self, trabajador: str) -> dict | None:
        return None  # en archivos no hay cola compartida: la API ejecuta en un hilo

    def pedir_cancelar(self, clave: str) -> None:
        t = self.leer_trabajo(clave)
        if t:
            t.setdefault('meta', {})['cancelar'] = True
            self.guardar_trabajo(t)

    def cancelacion_pedida(self, clave: str) -> bool:
        t = self.leer_trabajo(clave) or {}
        return bool(t.get('meta', {}).get('cancelar'))

    def latido(self, clave: str, trabajador: str) -> None:
        pass

    # ---------------------------------------------------------- celdas
    def cobertura(self, producto: str, clave_celda: str) -> dict | None:
        return (self._leer(self.celdas_archivo) or {}).get(clave_celda)

    def registrar_celda(self, celda: dict, producto: str, hasta: str | None, archivos: dict | None,
                        procedencia: dict | None = None, filas: dict | None = None) -> None:
        """Anota que la celda tiene serie hasta `hasta` y dónde están sus archivos (para reutilizarla)."""
        with self._lock:
            todo = self._leer(self.celdas_archivo) or {}
            todo[celda['clave']] = {'producto': producto, 'hasta': hasta, 'actualizado': ahora_iso(),
                                    'archivos': archivos, 'centro': celda.get('centro')}
            escribir_atomico(self.celdas_archivo, json.dumps(todo, ensure_ascii=False, indent=1))

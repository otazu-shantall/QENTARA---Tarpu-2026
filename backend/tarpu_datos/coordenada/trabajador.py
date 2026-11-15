"""Trabajador de la cola de extracciones (modo Supabase, DT-23).

Toma el trabajo pendiente más antiguo (public.tomar_trabajo, con FOR UPDATE SKIP LOCKED: varios trabajadores no se
pisan), lo ejecuta con trabajos.ejecutar y, mientras tanto, marca su latido cada pocos segundos y mira si alguien
pidió detenerlo. Si un trabajador se cae, la base devuelve su trabajo a la cola (public.reencolar_huerfanos).

En local corre como contenedor (infra/docker-compose.yml); en Google Cloud, como Cloud Run Job o servicio.
Uso (desde backend/, con TARPU_ALMACEN=supabase):
    python -m tarpu_datos.coordenada.trabajador            # bucle
    python -m tarpu_datos.coordenada.trabajador --una-vez  # toma un trabajo (si hay) y termina
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import argparse
import os
import socket
import sys
import threading
import time

from ..fuentes.cliente import log
from ..repositorio import obtener as repositorio
from . import trabajos

LATIDO_S = 5


def _vigia(clave: str, nombre: str, parar: threading.Event, fin: threading.Event) -> None:
    repo = repositorio()
    while not fin.wait(LATIDO_S):
        try:
            repo.latido(clave, nombre)
            if repo.cancelacion_pedida(clave):
                parar.set()
        except Exception as e:  # noqa: BLE001 - el vigía nunca tumba el trabajo
            log(f'trabajador: latido falló ({e})')


def una_vez(nombre: str) -> bool:
    repo = repositorio()
    repo.reencolar_huerfanos()
    t = repo.tomar_trabajo(nombre)
    if not t:
        return False
    log(f'trabajador {nombre}: toma {t["clave"]}')
    parar, fin = threading.Event(), threading.Event()
    vigia = threading.Thread(target=_vigia, args=(t['clave'], nombre, parar, fin), daemon=True)
    vigia.start()
    try:
        trabajos.ejecutar(t['clave'], parar)
    finally:
        fin.set()
        vigia.join(LATIDO_S + 1)
    return True


def main() -> int:
    a = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    a.add_argument('--una-vez', action='store_true')
    a.add_argument('--espera', type=float, default=5, help='segundos entre consultas a la cola vacía')
    args = a.parse_args()
    if repositorio().nombre != 'supabase':
        raise SystemExit('El trabajador necesita TARPU_ALMACEN=supabase (en modo archivos la API ejecuta en un hilo).')
    nombre = os.environ.get('TARPU_TRABAJADOR', f'{socket.gethostname()}-{os.getpid()}')
    log(f'trabajador {nombre}: escuchando la cola')
    if args.una_vez:
        una_vez(nombre)
        return 0
    while True:
        try:
            if not una_vez(nombre):
                time.sleep(args.espera)
        except Exception as e:  # noqa: BLE001 - el bucle nunca se cae
            log(f'trabajador: error {type(e).__name__}: {e}; se reintenta')
            time.sleep(args.espera)


if __name__ == '__main__':
    sys.exit(main())

"""Sube la base de Arequipa a Supabase Storage (bucket «base-arequipa») y la baja donde haga falta (DT-23).

    subir   almacen/base_arequipa → bucket, y registra cada mapa en public.capas_base (ruta, bytes, fuente)
    bajar   bucket → almacen/base_arequipa (lo que falte). Lo usa el contenedor al arrancar en la nube.

Por defecto NO se suben ni se bajan los JSON originales de POWER ni el censo (no los usa la API; quedan en el
equipo que extrae). Con --todo se incluyen.
Uso (desde backend/, con TARPU_ALMACEN=supabase y la clave de servicio):
    python -m tarpu_datos.base.sincronizar subir
    python -m tarpu_datos.base.sincronizar bajar [--destino RUTA]
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from ..fuentes.cliente import escribir_atomico, log
from ..repositorio import obtener as repositorio
from .leer import BASE

BUCKET = 'base-arequipa'
TIPOS = {'.tif': 'image/tiff', '.zip': 'application/zip', '.csv': 'text/csv', '.json': 'application/json', '.png': 'image/png'}
FUENTE = {'soilgrids': 'soilgrids', 'gaez': 'gaez', 'nasadem': 'nasadem', 'power': 'nasa_power', 'cenagro2012': 'cenagro',
          'derivados': 'nasadem'}


def _incluir(rel: str, todo: bool) -> bool:
    if todo:
        return True
    return not (rel.startswith('cenagro2012/') or (rel.startswith('power/') and rel.endswith('.original.json')))


def subir(todo: bool = False, hilos: int = 6) -> dict:
    repo = repositorio()
    if repo.nombre != 'supabase':
        raise SystemExit('Hace falta TARPU_ALMACEN=supabase.')
    archivos = [p for p in BASE.rglob('*') if p.is_file() and _incluir(p.relative_to(BASE).as_posix(), todo)]

    def una(p: Path):
        rel = p.relative_to(BASE).as_posix()
        repo.subir(BUCKET, rel, p.read_bytes(), TIPOS.get(p.suffix, 'application/octet-stream'))
        return rel, p.stat().st_size

    hechos, total = [], 0
    with ThreadPoolExecutor(hilos) as ex:
        for i, (rel, tam) in enumerate(ex.map(una, archivos), 1):
            hechos.append((rel, tam))
            total += tam
            if i % 50 == 0 or i == len(archivos):
                log(f'subir: {i}/{len(archivos)} archivos, {total / 1e6:.0f} MB')
    # ficha de cada mapa en capas_base
    import psycopg
    from psycopg.types.json import Jsonb
    with psycopg.connect(repo.dsn, autocommit=True) as c:
        for rel, tam in hechos:
            carpeta, nombre = rel.split('/', 1) if '/' in rel else ('', rel)
            if not (rel.endswith(('.tif', '.zip', '.png'))):
                continue
            partes = Path(nombre).stem.split('_')
            c.execute('''insert into public.capas_base (id, fuente_id, variable, profundidad, estadistico, bucket, ruta, crs, bytes, meta)
                         values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                         on conflict (id) do update set ruta = excluded.ruta, bytes = excluded.bytes, actualizado = now()''',
                      (f'{carpeta}:{Path(nombre).stem}', FUENTE.get(carpeta, carpeta),
                       partes[0] if carpeta == 'soilgrids' else Path(nombre).stem,
                       partes[1] if carpeta == 'soilgrids' and len(partes) > 1 else None,
                       partes[2] if carpeta == 'soilgrids' and len(partes) > 2 else None,
                       BUCKET, rel, 'EPSG:4326', tam, Jsonb({'carpeta': carpeta})))
    return {'archivos': len(hechos), 'mb': round(total / 1e6, 1)}


def _listar(repo, prefijo: str = '') -> list[dict]:
    """Lista recursiva del bucket (la API de Storage lista por carpeta)."""
    cuerpo = json.dumps({'prefix': prefijo, 'limit': 1000, 'offset': 0}).encode()
    req = urllib.request.Request(f'{repo.api}/storage/v1/object/list/{BUCKET}', data=cuerpo, method='POST',
                                 headers={'Authorization': f'Bearer {repo.clave}', 'apikey': repo.clave,
                                          'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=120) as r:
        items = json.loads(r.read())
    salida = []
    for it in items:
        ruta = f'{prefijo}{it["name"]}'
        if it.get('id') is None:  # carpeta
            salida += _listar(repo, ruta + '/')
        else:
            salida.append({'ruta': ruta, 'bytes': (it.get('metadata') or {}).get('size')})
    return salida


def bajar(destino: Path = BASE, todo: bool = False, hilos: int = 6) -> dict:
    repo = repositorio()
    objetos = [o for o in _listar(repo) if _incluir(o['ruta'], todo)]
    faltan = [o for o in objetos if not ((destino / o['ruta']).exists() and (destino / o['ruta']).stat().st_size == o['bytes'])]
    log(f'bajar: {len(objetos)} objetos en el bucket; faltan {len(faltan)}')

    def una(o):
        escribir_atomico(destino / o['ruta'], repo.bajar(BUCKET, o['ruta']))
        return o['bytes'] or 0

    with ThreadPoolExecutor(hilos) as ex:
        total = sum(ex.map(una, faltan))
    return {'objetos': len(objetos), 'bajados': len(faltan), 'mb': round(total / 1e6, 1)}


def main() -> int:
    a = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    a.add_argument('accion', choices=['subir', 'bajar'])
    a.add_argument('--todo', action='store_true', help='incluye los JSON originales de POWER y el censo')
    a.add_argument('--destino', default=str(BASE))
    args = a.parse_args()
    r = subir(args.todo) if args.accion == 'subir' else bajar(Path(args.destino), args.todo)
    print(json.dumps(r, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    sys.exit(main())

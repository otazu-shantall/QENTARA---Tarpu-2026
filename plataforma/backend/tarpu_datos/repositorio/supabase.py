"""Repositorio en Supabase (Postgres + PostGIS + Storage), DT-23.

Variables de entorno:
    TARPU_DB_URL                 cadena de conexión a Postgres (local: la que da `npm run db:status`)
    TARPU_SUPABASE_URL           URL de la API de Supabase (para Storage)
    TARPU_SUPABASE_SERVICE_KEY   clave de servicio (solo en el backend; nunca en el frontend)
Las series se guardan por celda (tablas celdas, extracciones y observaciones). Los originales del proveedor van al
bucket «originales» y los mapas de la base al bucket «base-arequipa».
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import csv
import json
import os
import urllib.parse
import urllib.request
from pathlib import Path

import psycopg
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb
from ..archivos import relativa

CAMPOS_TRABAJO = ('clave', 'nombre', 'estado', 'fuentes', 'parcela', 'aviso', 'motivo', 'creado', 'iniciado',
                  'terminado', 'actualizado', 'tomado_por', 'intentos', 'cancelar', 'meta')


class RepositorioSupabase:
    nombre = 'supabase'

    def __init__(self) -> None:
        self.dsn = os.environ.get('TARPU_DB_URL', 'postgresql://postgres:postgres@127.0.0.1:55322/postgres')
        self.api = os.environ.get('TARPU_SUPABASE_URL', 'http://127.0.0.1:55321').rstrip('/')
        self.clave = os.environ.get('TARPU_SUPABASE_SERVICE_KEY', '')

    def _con(self):
        return psycopg.connect(self.dsn, row_factory=dict_row, autocommit=True)

    # ---------------------------------------------------------- trabajos
    @staticmethod
    def _a_dict(fila: dict | None) -> dict | None:
        if not fila:
            return None
        t = {k: fila.get(k) for k in CAMPOS_TRABAJO}
        for k in ('creado', 'iniciado', 'terminado', 'actualizado'):
            if t.get(k) is not None:
                t[k] = t[k].isoformat(timespec='seconds')
        t['punto'] = {'lat': fila['lat'], 'lon': fila['lon']}
        t.update({k: v for k, v in (fila.get('meta') or {}).items() if k not in t})
        return t

    _SELECT = ('select *, extensions.st_y(punto) as lat, extensions.st_x(punto) as lon from public.trabajos')

    def leer_trabajo(self, clave: str) -> dict | None:
        with self._con() as c:
            return self._a_dict(c.execute(self._SELECT + ' where clave = %s', (clave,)).fetchone())

    def guardar_trabajo(self, t: dict) -> None:
        extra = {k: v for k, v in t.items() if k not in CAMPOS_TRABAJO and k != 'punto'}
        meta = {**(t.get('meta') or {}), **extra}
        with self._con() as c:
            c.execute(
                '''insert into public.trabajos (clave, nombre, punto, estado, fuentes, parcela, aviso, motivo, iniciado, terminado, meta)
                   values (%(clave)s, %(nombre)s, extensions.st_setsrid(extensions.st_makepoint(%(lon)s, %(lat)s), 4326),
                           %(estado)s, %(fuentes)s, %(parcela)s, %(aviso)s, %(motivo)s, %(iniciado)s, %(terminado)s, %(meta)s)
                   on conflict (clave) do update set nombre = excluded.nombre, estado = excluded.estado,
                       fuentes = excluded.fuentes, parcela = coalesce(excluded.parcela, public.trabajos.parcela),
                       aviso = excluded.aviso, motivo = excluded.motivo, iniciado = excluded.iniciado,
                       terminado = excluded.terminado, meta = excluded.meta, actualizado = now(),
                       cancelar = case when excluded.estado = 'pendiente' then false else public.trabajos.cancelar end''',
                {'clave': t['clave'], 'nombre': t.get('nombre'), 'lat': t['punto']['lat'], 'lon': t['punto']['lon'],
                 'estado': t['estado'], 'fuentes': Jsonb(t.get('fuentes') or {}),
                 'parcela': Jsonb(t['parcela']) if t.get('parcela') else None, 'aviso': Jsonb(t.get('aviso') or {}),
                 'motivo': t.get('motivo'), 'iniciado': t.get('iniciado'), 'terminado': t.get('terminado'),
                 'meta': Jsonb(meta)})

    def listar_trabajos(self) -> list[dict]:
        with self._con() as c:
            return [self._a_dict(f) for f in c.execute(self._SELECT + ' order by actualizado desc').fetchall()]

    def tomar_trabajo(self, trabajador: str) -> dict | None:
        with self._con() as c:
            fila = c.execute('select *, extensions.st_y(punto) as lat, extensions.st_x(punto) as lon '
                             'from public.tomar_trabajo(%s)', (trabajador,)).fetchone()
            return self._a_dict(fila)

    def pedir_cancelar(self, clave: str) -> None:
        with self._con() as c:
            c.execute('update public.trabajos set cancelar = true, actualizado = now() where clave = %s', (clave,))

    def cancelacion_pedida(self, clave: str) -> bool:
        with self._con() as c:
            f = c.execute('select cancelar from public.trabajos where clave = %s', (clave,)).fetchone()
            return bool(f and f['cancelar'])

    def latido(self, clave: str, trabajador: str) -> None:
        with self._con() as c:
            c.execute('update public.trabajos set latido = now(), tomado_por = %s where clave = %s', (trabajador, clave))

    def reencolar_huerfanos(self, minutos: int = 15) -> int:
        with self._con() as c:
            return c.execute('select public.reencolar_huerfanos(%s) as n', (minutos,)).fetchone()['n']

    # ---------------------------------------------------------- celdas y series
    def cobertura(self, producto: str, clave_celda: str) -> dict | None:
        with self._con() as c:
            filas = c.execute('select e.variable_id, e.hasta, e.actualizado, e.procedencia from public.celdas c '
                              'join public.extracciones e on e.celda_id = c.id '
                              'where c.producto_id = %s and c.clave = %s', (producto, clave_celda)).fetchall()
        if not filas:
            return None
        return {'producto': producto, 'hasta': max(str(f['hasta']) for f in filas if f['hasta']) if any(f['hasta'] for f in filas) else None,
                'actualizado': max(f['actualizado'] for f in filas).isoformat(timespec='seconds'),
                'variables': [f['variable_id'] for f in filas],
                'archivos': (filas[0]['procedencia'] or {}).get('archivos')}

    def registrar_celda(self, celda: dict, producto: str, hasta: str | None, archivos: dict | None,
                        procedencia: dict | None = None, filas: dict | None = None) -> None:
        """Guarda la celda y su serie: lee el normalizado y lo pasa a observaciones (una fila por fecha y variable)."""
        normalizado = (archivos or {}).get('normalizado')
        self.publicar_archivos(archivos)
        with self._con() as c:
            celda_id = c.execute('select public.celda_id(%s, %s, %s, %s, %s, %s::numeric) as id',
                                 (producto, celda['clave'], celda['centro']['lon'], celda['centro']['lat'],
                                  Jsonb(celda.get('huella')) if celda.get('huella') else None,
                                  celda.get('elevacion_m'))).fetchone()['id']
            if not normalizado or not Path(normalizado).exists():
                return
            with open(normalizado, encoding='utf-8') as f:
                lector = list(csv.reader(f))
            cabecera, cuerpo = lector[0], lector[1:]
            original = self.subir_original(producto, celda['clave'], (archivos or {}).get('original'))
            for j, col in enumerate(cabecera[1:], 1):
                var = f"{producto}:{col.split(' (')[0]}"
                if not c.execute('select 1 from public.variables where id = %s', (var,)).fetchone():
                    continue  # variable fuera del catálogo: no se inventa
                filas_obs = [(celda_id, var, r[0], float(r[j]) if r[j] != '' else None) for r in cuerpo if r and r[0]]
                with c.cursor() as cur:
                    cur.executemany('insert into public.observaciones (celda_id, variable_id, fecha, valor) values (%s, %s, %s, %s) '
                                    'on conflict (celda_id, variable_id, fecha) do update set valor = excluded.valor', filas_obs)
                fechas = [r[0] for r in cuerpo if r and r[0]]
                c.execute('''insert into public.extracciones (celda_id, variable_id, desde, hasta, filas, faltantes, estado,
                                 procedencia, archivo_original)
                             values (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                             on conflict (celda_id, variable_id) do update set desde = excluded.desde, hasta = excluded.hasta,
                                 filas = excluded.filas, faltantes = excluded.faltantes, estado = excluded.estado,
                                 procedencia = excluded.procedencia, archivo_original = excluded.archivo_original, actualizado = now()''',
                          (celda_id, var, min(fechas) if fechas else None, hasta or (max(fechas) if fechas else None),
                           len(filas_obs), sum(1 for x in filas_obs if x[3] is None),
                           'listo_con_vacios' if any(x[3] is None for x in filas_obs) else 'listo',
                           Jsonb({**(procedencia or {}), 'archivos': archivos}), original))

    # ---------------------------------------------------------- Storage
    def publicar_archivos(self, archivos: dict | None) -> None:
        """Publica antes de marcar listo: el lector no necesita el disco del trabajador."""
        for ruta in (archivos or {}).values():
            if isinstance(ruta, str) and Path(ruta).is_file():
                nombre = relativa(ruta)
                self.subir('originales', f'archivos/{nombre}', Path(ruta).read_bytes(),
                           'text/csv' if nombre.endswith('.csv') else 'application/json')

    def leer_archivo(self, nombre: str) -> bytes | None:
        import urllib.error
        nombre = relativa(nombre)
        destinos = [('originales', f'archivos/{nombre}')]
        if nombre.startswith('base_arequipa/'):
            destinos.append(('base-arequipa', nombre.removeprefix('base_arequipa/')))
        for bucket, clave in destinos:
            try:
                return self.bajar(bucket, clave)
            except urllib.error.HTTPError as e:
                # Storage también puede representar Object not found como HTTP 400.
                missing = e.code == 404
                if e.code == 400:
                    try:
                        missing = str(json.loads(e.read()).get('statusCode')) == '404'
                    except (ValueError, TypeError):
                        pass
                if not missing:
                    raise
        return None

    def _storage(self, metodo: str, ruta: str, datos: bytes | None = None, tipo: str = 'application/octet-stream'):
        cab = {'Authorization': f'Bearer {self.clave}', 'apikey': self.clave}
        if datos is not None:
            cab.update({'Content-Type': tipo, 'x-upsert': 'true'})
        url = f'{self.api}/storage/v1/object/{urllib.parse.quote(ruta)}'
        with urllib.request.urlopen(urllib.request.Request(url, data=datos, headers=cab, method=metodo), timeout=600) as r:
            return r.read()

    def subir(self, bucket: str, ruta: str, datos: bytes, tipo: str = 'application/octet-stream') -> str:
        self._storage('POST', f'{bucket}/{ruta}', datos, tipo)
        return f'{bucket}/{ruta}'

    def bajar(self, bucket: str, ruta: str) -> bytes:
        return self._storage('GET', f'{bucket}/{ruta}')

    def subir_original(self, producto: str, clave_celda: str, ruta_local: str | None) -> str | None:
        if not ruta_local or not Path(ruta_local).exists() or not self.clave:
            return None
        nombre = clave_celda.replace(':', '_').replace(',', '_').replace('=', '')
        return self.subir('originales', f'{producto}/{nombre}/{Path(ruta_local).name}', Path(ruta_local).read_bytes(),
                          'application/json')

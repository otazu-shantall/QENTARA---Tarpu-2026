"""Piezas comunes del paquete: peticiones, topes por servicio, caché atómica, avance y escritura.

- Peticiones GET con reintentos cortos ante 429, 5xx y cortes de red; un 4xx corta en seco y
  conserva el texto literal del proveedor como motivo.
- Un tope de peticiones simultáneas por servicio (semáforo) y un contador de errores para el log.
- Caché en disco con escritura atómica (archivo temporal + os.replace), para poder retomar.
- Escritura de los tres archivos de siempre: original, normalizado y procedencia.

Solo biblioteca estándar. Basado en datos/ndvi/consulta_ndvi.py (Cliente y Cache).
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import csv
import json
import os
import sys
import threading
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

USER_AGENT = 'tarpu-qentara-hackathon'
ESPERAS_CORTAS_S = (2, 4, 8)
_LOG = threading.Lock()


def log(mensaje: str) -> None:
    with _LOG:
        print(f'[{datetime.now().strftime("%H:%M:%S")}] {mensaje}', file=sys.stderr, flush=True)


def ahora_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec='seconds')


def clave_punto(lat: float, lon: float) -> str:
    """Igual que _clave_punto del backend (conectores.py), sin las fechas."""
    f = lambda v: f'{v:.4f}'.replace('-', 'm').replace('.', 'p')
    return f'{f(lat)}_{f(lon)}'


class PeticionFallida(Exception):
    def __init__(self, url: str, motivo: str, codigo: int | None = None) -> None:
        super().__init__(f'{motivo} en {url}')
        self.url, self.motivo, self.codigo = url, motivo, codigo


class Servicio:
    """Tope de peticiones simultáneas y estadísticas de un proveedor."""

    def __init__(self, nombre: str, tope: int) -> None:
        self.nombre = nombre
        self.tope = max(1, int(tope))
        self._semaforo = threading.BoundedSemaphore(self.tope)
        self._lock = threading.Lock()
        self.stats = {'peticiones': 0, 'correctas': 0, 'http_5xx': 0, 'http_429': 0, 'http_4xx': 0,
                      'timeouts_o_red': 0, 'reintentos': 0}

    def _contar(self, clave: str) -> None:
        with self._lock:
            self.stats[clave] += 1

    def resumen(self) -> str:
        s = self.stats
        fallos = s['http_5xx'] + s['http_429'] + s['timeouts_o_red']
        pct = 100 * fallos / s['peticiones'] if s['peticiones'] else 0
        return (f'{self.nombre}: {s["peticiones"]} peticiones, {s["correctas"]} correctas, '
                f'{s["http_5xx"]} 5xx, {s["http_429"]} 429, {s["timeouts_o_red"]} timeouts/red, '
                f'{s["http_4xx"]} otros 4xx ({pct:.1f} % de fallos recuperables), tope {self.tope}')

    def get(self, url: str, *, timeout: float = 60, esperas: tuple[float, ...] = ESPERAS_CORTAS_S,
            accept: str = 'application/json', etiqueta: str = '') -> bytes:
        """Devuelve el cuerpo en bytes. Reintenta tras cada espera de `esperas`."""
        peticion = urllib.request.Request(url, headers={'User-Agent': USER_AGENT, 'Accept': accept})
        motivo, codigo = 'sin intento', None
        for intento in range(len(esperas) + 1):
            with self._semaforo:
                self._contar('peticiones')
                try:
                    with urllib.request.urlopen(peticion, timeout=timeout) as respuesta:
                        cuerpo = respuesta.read()
                    self._contar('correctas')
                    return cuerpo
                except urllib.error.HTTPError as error:
                    codigo = error.code
                    try:
                        texto = error.read().decode('utf-8', 'replace').strip()
                    except Exception:  # noqa: BLE001 - el cuerpo del error es opcional
                        texto = ''
                    motivo = f'HTTP {error.code}' + (f': {texto[:500]}' if texto else '')
                    if error.code == 429:
                        self._contar('http_429')
                    elif error.code >= 500:
                        self._contar('http_5xx')
                    else:
                        self._contar('http_4xx')
                        raise PeticionFallida(url, motivo, codigo)
                except (urllib.error.URLError, TimeoutError, ConnectionError, OSError) as error:
                    self._contar('timeouts_o_red')
                    motivo, codigo = f'{type(error).__name__}: {error}', None
            if intento == len(esperas):
                break
            self._contar('reintentos')
            log(f'{self.nombre} {etiqueta} {motivo.splitlines()[0][:120]}; reintento {intento + 1}/{len(esperas)} '
                f'en {esperas[intento]} s')
            time.sleep(esperas[intento])
        raise PeticionFallida(url, f'{motivo} (tras {len(esperas)} reintentos)', codigo)

    def get_json(self, url: str, **kw) -> dict:
        cuerpo = self.get(url, **kw)
        try:
            return json.loads(cuerpo.decode('utf-8'))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise PeticionFallida(url, f'respuesta no es JSON: {error}')


def escribir_atomico(ruta: Path, contenido: str | bytes) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    temporal = ruta.with_name(f'{ruta.name}.{os.getpid()}.{threading.get_ident()}.tmp')
    if isinstance(contenido, bytes):
        temporal.write_bytes(contenido)
    else:
        temporal.write_text(contenido, encoding='utf-8')
    os.replace(temporal, ruta)


def _reciente(cuando: str | None, max_edad_dias: float) -> bool:
    try:
        edad = datetime.now(timezone.utc) - datetime.fromisoformat(cuando)
    except (TypeError, ValueError):
        return False
    return edad.total_seconds() <= max_edad_dias * 86400


class Cache:
    """Una carpeta de caché. Cada entrada JSON guarda {'request_url', 'response'}."""

    def __init__(self, carpeta: str | Path) -> None:
        self.carpeta = Path(carpeta)
        self.carpeta.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self.desde_cache = 0
        self.pedidos = 0

    def ruta(self, nombre: str) -> Path:
        return self.carpeta / nombre

    def leer_json(self, nombre: str) -> dict | None:
        archivo = self.ruta(nombre)
        if not archivo.exists():
            return None
        try:
            return json.loads(archivo.read_text(encoding='utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError):
            log(f'caché dañada, se vuelve a pedir: {archivo}')
            archivo.unlink(missing_ok=True)
            return None

    def escribir_json(self, nombre: str, contenido: dict) -> None:
        escribir_atomico(self.ruta(nombre), json.dumps(contenido, ensure_ascii=False))

    def obtener_json(self, nombre: str, servicio: Servicio, url: str, max_edad_dias: float | None = None,
                     **kw) -> dict:
        """max_edad_dias: si la entrada guardada es más antigua, se vuelve a pedir (listas que crecen)."""
        guardado = self.leer_json(nombre)
        if guardado and max_edad_dias is not None and not _reciente(guardado.get('requested_at'), max_edad_dias):
            guardado = None
        if guardado and 'request_url' in guardado and 'response' in guardado:
            with self._lock:
                self.desde_cache += 1
            return guardado
        datos = servicio.get_json(url, **kw)
        guardado = {'request_url': url, 'requested_at': ahora_iso(), 'response': datos}
        self.escribir_json(nombre, guardado)
        with self._lock:
            self.pedidos += 1
        return guardado

    def obtener_bytes(self, nombre: str, servicio: Servicio, url: str, **kw) -> tuple[bytes, bool]:
        """Devuelve (bytes, venía_de_caché). Guarda además un .url.json con la URL y la fecha."""
        archivo = self.ruta(nombre)
        meta = self.leer_json(f'{nombre}.url.json')
        if archivo.exists() and meta:
            with self._lock:
                self.desde_cache += 1
            return archivo.read_bytes(), True
        cuerpo = servicio.get(url, **kw)
        escribir_atomico(archivo, cuerpo)
        self.escribir_json(f'{nombre}.url.json', {'request_url': url, 'requested_at': ahora_iso()})
        with self._lock:
            self.pedidos += 1
        return cuerpo, False


class Progreso:
    """Cuenta peticiones terminadas y llama a progreso(hechos, total) del backend, con lock."""

    def __init__(self, total: int, funcion=None, etiqueta: str = '') -> None:
        self.total, self.hechos = total, 0
        self.funcion, self.etiqueta = funcion, etiqueta
        self._lock = threading.Lock()
        self.inicio = time.monotonic()

    def sumar_total(self, n: int) -> None:
        with self._lock:
            self.total += n

    def paso(self, detalle: str = '') -> None:
        with self._lock:
            self.hechos += 1
            hechos, total = self.hechos, self.total
        segundos = time.monotonic() - self.inicio
        log(f'{self.etiqueta} {hechos}/{total} ({segundos:.0f} s) {detalle}'.rstrip())
        if self.funcion:
            try:
                self.funcion(hechos, total)
            except Exception as error:  # noqa: BLE001 - el avance nunca debe romper la descarga
                log(f'la función de avance falló: {error}')


def escribir_tres(salida: str | Path, base: str, *, original: object, cabecera: list[str],
                  filas: list[list], procedencia: dict) -> dict[str, str]:
    """Escribe <base>.original.json, <base>.normalizado.csv y <base>.procedencia.json.

    Las celdas None se escriben vacías (nunca 0)."""
    carpeta = Path(salida)
    carpeta.mkdir(parents=True, exist_ok=True)
    rutas = {
        'original': carpeta / f'{base}.original.json',
        'normalizado': carpeta / f'{base}.normalizado.csv',
        'procedencia': carpeta / f'{base}.procedencia.json',
    }
    escribir_atomico(rutas['original'], json.dumps(original, ensure_ascii=False, indent=1))
    escribir_csv(rutas['normalizado'], cabecera, filas)
    escribir_atomico(rutas['procedencia'], json.dumps(procedencia, ensure_ascii=False, indent=1))
    return {k: str(v) for k, v in rutas.items()}


def escribir_csv(ruta: Path, cabecera: list[str], filas: list[list]) -> None:
    import io
    texto = io.StringIO()
    escritor = csv.writer(texto, lineterminator='\n')
    escritor.writerow(cabecera)
    for fila in filas:
        escritor.writerow(['' if v is None else v for v in fila])
    escribir_atomico(ruta, texto.getvalue())


def resultado(estado: str, archivos: dict | None = None, faltan: list | None = None,
              motivo: str | None = None) -> dict:
    return {'estado': estado, 'archivos': archivos, 'faltan': faltan or [], 'motivo': motivo}


def fecha_compacta(fecha: str) -> str:
    """AAAA-MM-DD -> AAAAMMDD."""
    datetime.strptime(fecha, '%Y-%m-%d')
    return fecha.replace('-', '')

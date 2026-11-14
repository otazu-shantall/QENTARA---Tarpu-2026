"""Lanza las consultas de muestras de datos de TARPU (Fase 1, área de datos).

Reúne, en un solo lugar, los comandos con los que se obtuvieron las muestras
de las tres fuentes para los dos puntos de referencia:

- NASA POWER (clima diario, 2025):      datos/power/consulta_power.py
- ISRIC SoilGrids (suelo, 0-5 y 5-15 cm): datos/soilgrids/consulta_soilgrids.py
- NDVI MODIS MOD13Q1 (2015 a 2026):      datos/ndvi/consulta_ndvi.py

Cada consulta deja tres archivos en datos/muestras/: original, normalizado y
procedencia.

Uso (desde la raíz del repositorio; este archivo va en datos/):
    python datos/obtener_muestras.py                 # todo
    python datos/obtener_muestras.py --ver           # solo muestra los comandos
    python datos/obtener_muestras.py --fuentes power soilgrids
    python datos/obtener_muestras.py --fuentes ndvi --puntos chivay

Notas:
- Solo usa la biblioteca estándar de Python. No necesita cuenta ni clave.
- El NDVI depende del servicio de ORNL, que a veces responde 502 o 503: puede
  tardar horas. Si se corta, vuelve a lanzar el mismo comando; el script de NDVI
  retoma desde su caché (datos/ndvi/cache/).
- SoilGrids pide como máximo unas 5 llamadas por minuto; aquí se hace una por punto.
- Escrito con asistencia de IA (Claude). Hay que declararlo en la entrega.
"""
import argparse
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

PUNTOS = {
    'majes': {'lat': '-16.351', 'lon': '-72.190'},
    'chivay': {'lat': '-15.64', 'lon': '-71.60'},
}

# Fuente -> (script, argumentos comunes). El orden es el de ejecución.
FUENTES = {
    'power': ('datos/power/consulta_power.py',
              ['--inicio', '20250101', '--fin', '20251231']),
    'soilgrids': ('datos/soilgrids/consulta_soilgrids.py', []),
    'ndvi': ('datos/ndvi/consulta_ndvi.py',
             ['--inicio', '20150101', '--fin', '20261114']),
}


def comando(fuente: str, punto: str) -> list[str]:
    script, comunes = FUENTES[fuente]
    p = PUNTOS[punto]
    return [sys.executable, script, '--lat', p['lat'], '--lon', p['lon'],
            *comunes, '--nombre', punto]


def main() -> None:
    args = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    args.add_argument('--fuentes', nargs='+', choices=sorted(FUENTES),
                      default=list(FUENTES), help='fuentes a consultar (por defecto, todas)')
    args.add_argument('--puntos', nargs='+', choices=sorted(PUNTOS),
                      default=list(PUNTOS), help='puntos a consultar (por defecto, ambos)')
    args.add_argument('--ver', action='store_true',
                      help='solo mostrar los comandos, sin ejecutarlos')
    a = args.parse_args()

    resultados = []
    for fuente in FUENTES:  # respeta el orden de FUENTES
        if fuente not in a.fuentes:
            continue
        for punto in PUNTOS:
            if punto not in a.puntos:
                continue
            cmd = comando(fuente, punto)
            texto = ' '.join(['python', *cmd[1:]])
            print(f'\n== {fuente} · {punto} ==\n{texto}')
            if a.ver:
                continue
            codigo = subprocess.run(cmd, cwd=RAIZ).returncode
            resultados.append((fuente, punto, codigo))

    if a.ver:
        return
    print('\nResumen:')
    for fuente, punto, codigo in resultados:
        print(f'  {fuente:<10} {punto:<7} {"OK" if codigo == 0 else f"ERROR (código {codigo})"}')
    if any(codigo != 0 for _, _, codigo in resultados):
        raise SystemExit(1)


if __name__ == '__main__':
    main()

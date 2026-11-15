# Trabajo en curso: cómo extraer los datos de la demo

> Escrito con asistencia de IA (Claude Code), 15/11/2026. Declarado en [entrega/uso-de-ia.md](../entrega/uso-de-ia.md).

Aquí se bajan **completos** los datos de los lugares de ejemplo y se suben al repositorio: son la capa 3 del esquema mixto (DT-22, [docs/11](../docs/11-esquema-mixto.md)), lo que el jurado prueba aunque falle la extracción por coordenada. **Obligatorios hoy: Majes riego y Chivay.** El S2 (Cabanaconde) entra si alcanza. La base de Arequipa (capa 1) será otra tarea (T02).

| Carpeta | Qué baja | Cuenta | Quién |
|---|---|---|---|
| [T01-paquete-extraccion/](T01-paquete-extraccion/README.md) | NASA POWER (19 variables), SoilGrids, FAO GAEZ, horas de luz y MODIS de ORNL (NDVI, ET, temperatura de superficie y cobertura) | No hace falta | Damaris |
| [T02-base-arequipa/](T02-base-arequipa/README.md) | **Base de Arequipa** (capa 1): POWER por celdas, SoilGrids, GAEZ, NASADEM y CENAGRO para toda la región | Solo NASADEM | Erick |
| [extraccion_pesada/](extraccion_pesada/README.md) | NASADEM (relieve), HLS (NDVI de 30 m), SMAP (humedad del suelo) e imágenes de Chivay, por AppEEARS | Earthdata | Un compañero |

## Los tres lugares

| Clave | Sector | Lat | Lon |
|---|---|---|---|
| `majes_riego` | S1 costa | −16.367023 | −72.185771 |
| `valle_s2` (Cabanaconde) | S2 valle | −15.612386 | −71.984857 |
| `chivay` | S3 altura | −15.64 | −71.60 |

## Antes de empezar

1. `git pull` en la raíz del repositorio.
2. Python 3.10 o más nuevo. Los dos scripts usan **solo la biblioteca estándar**: no hay que instalar nada.
3. Abrir una terminal **en la raíz del repositorio** (la carpeta `QENTARA - Tarpu 2026`).
4. Solo para `extraccion_pesada`: crear `backend/.env` (git lo ignora) con estas dos líneas. **La clave no se pega en el chat ni en ningún archivo que se suba.**

   ```
   EARTHDATA_USERNAME=tu_usuario
   EARTHDATA_PASSWORD=tu_clave
   ```

   AppEEARS procesa una tarea a la vez **por cuenta** (lo que se vio el 14/11). Si el compañero usa **su propia cuenta de Earthdata**, su cola no espera a la de Erick.

## A. T01 (Damaris): lo que falta

Majes riego y Chivay ya están extraídos en tu computadora. Falta el lugar S2 y subir las salidas.

```bash
cd trabajo/T01-paquete-extraccion
```

```bash
python -m tarpu_datos --lat -15.612386 --lon -71.984857 --nombre valle_s2 --fuentes power soilgrids gaez luz --inicio 2015-01-01 --fin 2025-12-31
```

```bash
python -m tarpu_datos --lat -15.612386 --lon -71.984857 --nombre valle_s2 --fuentes ornl --productos MOD13Q1 MOD16A2GF MOD11A2 --inicio 2015-01-01 --fin 2025-12-31 --tope-ornl 4
```

```bash
python -m tarpu_datos --lat -15.612386 --lon -71.984857 --nombre valle_s2 --fuentes ornl --productos MCD12Q1 --inicio 2015-01-01 --fin 2024-12-31 --tope-ornl 4
```

```bash
python -m tarpu_datos.pruebas
```

- **PowerShell 5.1:** no uses `2>&1 | Tee-Object`; corta la ejecución. Usa `cmd /c "python -m tarpu_datos ... >> cache\s2.log 2>&1"` (§9.6 de su README).
- **Al terminar:** sube `trabajo/T01-paquete-extraccion/salida/` (desde el 15/11 git ya no la ignora; `cache/` sigue ignorada).

## B. Extracción pesada (compañero)

Desde la raíz del repositorio, **en este orden**:

```bash
python trabajo/extraccion_pesada/pesados.py estado
```

Si en la lista sale `tarpu_modis_zonas` o `tarpu_dem90_arequipa` en «processing» o «pending», es la prueba de Erick de la noche del 14/11 y está ocupando la cola. Avísale; si te dice que la canceles, usa `cancelar` con su id (la cuenta tiene que ser la de Erick):

```bash
python trabajo/extraccion_pesada/pesados.py cancelar ID_DE_LA_TAREA
```

```bash
python trabajo/extraccion_pesada/pesados.py pedir relieve
```

```bash
python trabajo/extraccion_pesada/pesados.py pedir smap
```

```bash
python trabajo/extraccion_pesada/pesados.py pedir hls
```

```bash
python trabajo/extraccion_pesada/pesados.py pedir imagenes_chivay --desde 2026-08-01 --hasta 2026-10-31
```

```bash
python trabajo/extraccion_pesada/pesados.py esperar
```

`esperar` consulta cada 60 s, descarga lo que va terminando y escribe `salida/resumen.json` con los minutos de cada tarea. **Al terminar:** sube `trabajo/extraccion_pesada/salida/` y `tareas.json`.

## Si se corta la luz, el internet o se cierra la ventana

No se pierde lo hecho. Basta con **volver a lanzar el mismo comando**.

| Script | Qué guarda | Cómo retoma |
|---|---|---|
| T01 | Cada respuesta del proveedor en `cache/`, apenas llega, con escritura atómica | Relanzar el mismo comando: lo que está en caché no se vuelve a pedir |
| `pesados.py` | Cada tarea pedida en `tareas.json`. Las tareas siguen en los servidores de AppEEARS aunque tu computadora se apague | Relanzar `esperar` |
| `pesados.py`, descarga | Cada archivo se escribe primero como `.part` y se renombra al terminar; se comprueba el tamaño que anuncia AppEEARS | Un archivo a medias se vuelve a bajar; los completos se saltan |
| `pesados.py`, red | Un corte al consultar o al descargar no cierra el script | Lo reintenta en la vuelta siguiente |
| `pesados.py`, `pedir` dos veces | Si la misma tarea (nombre y fechas) ya está en `tareas.json`, no se vuelve a enviar | Para repetirla con otras fechas, usa otro `--desde` o `--hasta` |

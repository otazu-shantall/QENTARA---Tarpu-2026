# Extracción pesada (AppEEARS) para los lugares de ejemplo

> **15/11/2026:** la versión oficial de este script está ahora en `backend/tarpu_datos/fuentes/appeears.py` (se usa desde `backend/` con `python -m tarpu_datos.fuentes.appeears ...`). Esta copia queda como antecedente.

> Escrito con asistencia de IA (Claude Code), 15/11/2026. Declarado en [entrega/uso-de-ia.md](../../entrega/uso-de-ia.md).

Esta carpeta es para que **un compañero vaya bajando los datos lentos** mientras el resto trabaja. No toca `datos/`, `backend/` ni T01. Los datos livianos (POWER, SoilGrids, GAEZ, MODIS de ORNL por punto, horas de luz) los hace la tarea T01; aquí van solo los que pasan por **AppEEARS** (NASA, cuenta Earthdata).

## Los tres lugares

| Clave | Sector | Lat | Lon | De dónde sale |
|---|---|---|---|---|
| `majes_riego` | S1 costa | −16,367023 | −72,185771 | Punto de riego de Majes (ya usado en `datos/`). |
| `valle_s2` | S2 valle | −15,612386 | −71,984857 | Censo agropecuario 2012 (INEI): sector censal 00102, provincia 05 (Caylloma), distrito 03 = **Cabanaconde** (ubigeo 040503, tabla de ubigeos de SUNAT); piso Quechua; altitud declarada 2908 m; maíz amiláceo 56,7 de 94,6 ha. La altitud se comprueba con `pedir relieve`. |
| `chivay` | S3 altura | −15,64 | −71,60 | Punto de Chivay (ya usado en `datos/`). |

## Qué pasó anoche con la prueba por área (diagnóstico)

**No fue un error del script; fue el tamaño del pedido.** AppEEARS aceptó las tareas (si el script hubiera estado mal, la respuesta habría sido un rechazo HTTP 400 y no «processing»). Lo que se pidió en `modis_zonas` fue:

- 7 capas de 4 productos MODIS, de **enero de 2015 a octubre de 2026**, para 2 zonas de 10 × 10 km;
- eso son unas 270 fechas de NDVI (cada 16 días) × 2 capas, más unas 540 fechas de cada producto de 8 días × 4 capas, más 12 años de cobertura: **del orden de 2700 imágenes por zona, unas 5400 en total**, cada una recortada y reproyectada en el servidor.

Además, en la cuenta se vio que **AppEEARS procesa una tarea a la vez**: `dem90_arequipa` se quedó en «pending» porque esperaba a que terminara `modis_zonas`. Esto es lo que observamos, no una regla publicada.

Las tareas siguen en el servidor aunque se cierre la ventana. **Lo primero es ver si ya terminaron** (`estado`). Si `modis_zonas` sigue «processing» y bloquea la cola, se puede cancelar (`cancelar <task_id>`).

## Qué recomiendo

1. **Lo liviano ya está resuelto por otro camino.** El NDVI, el ET, la LST y la cobertura MODIS **por punto** salen del servicio de ORNL en segundos (T01). Para la demo no hace falta MODIS por área.
2. **Lo pesado, en pedidos pequeños y separados, por punto**, y con **menos años** (por defecto, enero de 2025 a octubre de 2026). Por punto, AppEEARS solo devuelve un valor por fecha, no imágenes: anoche, HLS + SMAP de tres meses para dos puntos tardó 19,4 min.
3. **Imágenes solo para Chivay**, de 10 × 10 km y pocos meses, una capa por pedido.
4. **Google Cloud (Earth Engine) no hace falta para la demo.** El plan no comercial exige una cuenta de facturación y tiene un tope mensual de cómputo; para tres lugares, AppEEARS alcanza. Queda como opción para cuando TARPU cubra toda la región.

## Cómo ejecutarlo

Requisitos: `backend/.env` con `EARTHDATA_USERNAME` y `EARTHDATA_PASSWORD` (git lo ignora; **nadie pega la clave en el chat**). Solo usa la biblioteca estándar de Python. Desde la raíz del repositorio:

```bash
# 0. Ver todas las tareas de la cuenta (también las de anoche) y guardar la lista
python trabajo/extraccion_pesada/pesados.py estado

# 1. Si modis_zonas sigue trabada y no la necesitamos, liberar la cola
python trabajo/extraccion_pesada/pesados.py cancelar <task_id_de_modis_zonas>

# 2. Pedidos, en este orden (de más rápido a más lento)
python trabajo/extraccion_pesada/pesados.py pedir relieve
python trabajo/extraccion_pesada/pesados.py pedir smap
python trabajo/extraccion_pesada/pesados.py pedir hls
python trabajo/extraccion_pesada/pesados.py pedir imagenes_chivay --desde 2026-08-01 --hasta 2026-10-31

# 3. Esperar y descargar solo (consulta cada 60 s; se puede cortar y volver a lanzar)
python trabajo/extraccion_pesada/pesados.py esperar
```

Cada `pedir` guarda el `task_id` en `tareas.json`. `esperar` sigue esas tareas, descarga las que terminan en `salida/<nombre>/` y deja `salida/resumen.json` con **cuántos minutos tardó cada una**. Si se corta la ventana, se vuelve a lanzar `esperar` y continúa.

| Plan | Qué pide | Por qué |
|---|---|---|
| `relieve` | NASADEM de 30 m, área de 10 × 10 km en los 3 lugares | Altitud, pendiente (método de Horn, clases FAO 2006) y comprobar la altitud del punto S2. Anoche tardó 3,1 min con 2 zonas. |
| `smap` | SMAP L3 (observado, 9 km, diario) y L4 (modelado, superficie y raíz), por punto | Humedad del suelo. L4 en Majes no ve el riego (0,024–0,047). |
| `hls` | NDVI de HLS Landsat y HLS Sentinel, 30 m, por punto | Verdor a escala de chacra; MODIS es de 250 m. |
| `imagenes_chivay` | NDVI de HLS como GeoTIFF, 10 × 10 km de Chivay | Las imágenes que pide la demo de altura. |
| `modis_prueba` | Solo diagnóstico: NDVI MODIS por área, 1 capa, 1 zona | Medir cuánto tarda 1 año (`--desde 2025-01-01 --hasta 2025-12-31`) y estimar si vale la pena pedir más. |

## Pruebas para decidir (con lo que devuelven)

Corre una por vez y mira `salida/resumen.json` (campo `minutos`):

1. **¿La cola está libre?** `estado`. Si sale alguna tarea «processing» de anoche, esa es la causa de que lo demás espere.
2. **¿Cuánto tarda un año de MODIS por área?** `pedir modis_prueba --desde 2025-01-01 --hasta 2025-12-31` y `esperar`. Si son pocos minutos, el problema de anoche era solo el volumen (2015–2026 × 7 capas).
3. **¿Cuánto tarda HLS por punto con 22 meses?** `pedir hls` y `esperar`. Si tarda demasiado, repetir con `--desde 2026-01-01`.
4. **¿Las imágenes de Chivay tienen nubes?** Abrir los GeoTIFF de `salida/img_chivay_*` (QGIS o cualquier visor). HLS trae nubes; las fechas sin dato vienen vacías.

## Lo que hay que mandar al backend

Todo lo de `salida/`, más `tareas.json`: **se suben al repositorio** (git ya no ignora `salida/`). Las instrucciones paso a paso y qué pasa si algo se corta están en [trabajo/README.md](../README.md). La procedencia de cada archivo es el producto y la versión que figuran en su nombre (por ejemplo `HLSL30_VI.020`), la fecha de la tarea y el `task_id`.

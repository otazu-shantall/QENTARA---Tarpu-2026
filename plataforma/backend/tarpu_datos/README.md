# tarpu_datos · extracción y actualización de datos (dentro del backend)

> 15/11/2026. Escrito con asistencia de IA (Claude Code). Declarado en [entrega/uso-de-ia.md](../../../entrega/uso-de-ia.md). Enfoque: esquema mixto, [DT-22](../../../docs/06-decisiones-y-riesgos.md) y [docs/11](../../../docs/11-esquema-mixto.md).

**Origen:** el paquete de la tarea T01 de Damaris (`trabajo/T01-paquete-extraccion/tarpu_datos`). Se copió al backend con las correcciones de abajo; **la copia de T01 no se tocó**. A partir de ahora, los cambios se hacen aquí. Hay que coordinarlo con Damaris para que las dos copias no se separen.

## Qué hay

Es la **carpeta oficial** de extracción. El plan de plataformas y de la capa 2 está en [../PLAN-PLATAFORMAS-Y-COORDENADA.md](../PLAN-PLATAFORMAS-Y-COORDENADA.md).

| Carpeta o módulo | Qué hace |
|---|---|
| `fuentes/` | Una fuente por módulo: `power`, `soilgrids`, `gaez`, `luz`, `ornl` (MODIS) y `appeears` (NASADEM, HLS, SMAP). Cada una deja original, normalizado y procedencia |
| `fuentes/cliente.py` | Peticiones con tope, reintentos, caché con antigüedad y escritura atómica |
| `base/extraer.py` | **Capa 1:** baja toda Arequipa (SoilGrids y GAEZ por área, POWER por celdas, NASADEM, CENAGRO) |
| `base/leer.py` | **Capa 1 en un punto**, sin descargar (0,2–0,5 s). Lo usa la API en `GET /api/base` |
| `coordenada/trabajos.py` | **Capa 2:** un trabajo por punto en segundo plano (POWER y MODIS hoy; HLS y SMAP con Earth Engine) |
| `actualizacion.py` | **Actualización periódica** de la base y de cada punto registrado |

## Qué se corrigió de T01 y por qué

| Problema | Efecto | Corrección |
|---|---|---|
| Los bloques de 10 fechas de MODIS se contaban desde la fecha de inicio pedida | Al ampliar el período cambiaban todos los bloques y se volvía a bajar todo, que para el NDVI de Majes fueron 37,8 min | `ornl.tramos_anclados`: los bloques se cuentan desde la primera fecha del producto en el punto. Al actualizar, solo se piden el último bloque y los nuevos |
| La lista de fechas de MODIS se guardaba para siempre | Nunca aparecían las fechas nuevas | Se vuelve a pedir si tiene más de 8 días (`Cache.obtener_json(max_edad_dias=...)`) |
| POWER exigía una fecha de fin fija | No se podía «actualizar hasta hoy» | Sin `fin`, pide hasta ayer y recorta al final los días que POWER aún no publica. Los anota en `days_trimmed_not_yet_published` |
| El nombre de los archivos llevaba el período | Cada actualización dejaba archivos nuevos | `archivo_base` fija el nombre. La caché sigue usando las fechas reales, para no devolver datos viejos |
| El paquete vivía en `trabajo/` | El backend no podía importarlo | Ahora es `backend/tarpu_datos`, junto a `tarpu_api` |

## Actualización periódica

| Tarea | Qué | Cada |
|---|---|---|
| `base_power` | POWER de las 63 celdas de Arequipa, hasta ayer | 7 días |
| `puntos_power` | POWER de cada punto registrado | 7 días |
| `puntos_modis` | MODIS de cada punto: NDVI, ET y PET, temperatura de superficie | 8 días |
| `puntos_cobertura` | MODIS MCD12Q1 de cada punto | 30 días |
| Estáticos | SoilGrids, GAEZ, NASADEM, CENAGRO | No se actualizan solos; se revisan a mano si el proveedor publica otra versión |

- Los períodos son una **elección operativa** del equipo, no una propiedad de las fuentes. Se cambian con `TARPU_PERIODOS`.
- Si una tarea falla, se anota en `almacen/actualizacion.json` y se reintenta en la vuelta siguiente; lo anterior no se borra.
- **En la API:** con `TARPU_ACTUALIZAR_CADA_HORAS=6` en `backend/.env`, la API lanza el bucle en segundo plano al arrancar.
- **En producción:** un programador de tareas (por ejemplo, Cloud Scheduler en Google Cloud) puede lanzar `una-vez`. Está pendiente de decidir con el servidor de la API (docs/11, §6).

## Medido en la primera actualización (15/11/2026)

- **POWER:** 63 celdas, hasta ayer, en unos 2–3 s por celda.
- **Cada variable tiene su propio retraso.** Pedido hasta el 14/11/2026:
  - el 13 y el 14/11 todavía no estaban publicados, así que se recortaron;
  - temperatura, lluvia y humedad llegan hasta el 12/11/2026;
  - `ALLSKY_SFC_PAR_TOT` y `CLOUD_AMT` solo hasta el 30/08/2026, con 74 días vacíos al final;
  - `ALLSKY_SFC_SW_DWN` tiene 4 días vacíos.
- Esos vacíos quedan en blanco y se anotan en `missing_days` de cada procedencia; nunca se rellenan.

## Comandos (desde `backend/`)

```bash
.venv/Scripts/python -m tarpu_datos.actualizacion estado
```

```bash
.venv/Scripts/python -m tarpu_datos.actualizacion agregar NOMBRE LAT LON
```

```bash
.venv/Scripts/python -m tarpu_datos.actualizacion una-vez
```

```bash
.venv/Scripts/python -m tarpu_datos.base.extraer estado
```

```bash
.venv/Scripts/python -m tarpu_datos.coordenada.trabajos pedir -15.612386 -71.984857 --nombre valle_s2 --esperar
```

```bash
.venv/Scripts/python -m tarpu_datos --lat -15.64 --lon -71.60 --nombre chivay --fuentes power soilgrids gaez luz --inicio 2015-01-01
```

- **Datos:** quedan en `backend/almacen/` (git lo ignora): `base_arequipa/`, `fuentes/<punto>/`, `cache/`, `puntos.json` y `actualizacion.json`.
- **Manifiesto:** el de la base está en `backend/catalogo/base_arequipa.json` y sí se sube.
- **Credenciales:** NASADEM usa la cuenta de Earthdata de `backend/.env`.

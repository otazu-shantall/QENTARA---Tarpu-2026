# Ficha · NDVI MODIS (MOD13Q1) por el servicio de ORNL

> Segunda fuente de NASA de la demo: la curva de verdor de la zona cada 16 días. Verificada el 14/11/2026 con series de 2015 a 2026 en Chivay y en Majes (riego), contrastada con la guía de usuario de MOD13 C6.1, la ficha del producto en Earthdata y la documentación del servicio de ORNL. Script: [consulta_ndvi.py](consulta_ndvi.py), escrito con asistencia de IA (Claude Code).
>
> Ficha redactada con asistencia de IA (Claude Code).

## Cómo se usa

```bash
python datos/ndvi/consulta_ndvi.py --lat -15.64 --lon -71.60 --inicio 20150101 --fin 20261114 --nombre chivay
python datos/ndvi/consulta_ndvi.py --lat -16.367023 --lon -72.185771 --inicio 20150101 --fin 20261114 --nombre majes_riego
```

Solo Python 3 con la biblioteca estándar. Por defecto usa `MOD13Q1`. El script también acepta `--producto VNP13A1` (VIIRS, 500 m), pero esa opción **no se ha probado**.

Deja tres archivos en `datos/muestras/`:

| Archivo | Qué es |
|---|---|
| `mod13q1-ndvi_<nombre>_<inicio>_<fin>.original.json` | Todas las respuestas del servicio (`bands`, `dates` y cada bloque de `subset`), sin tocar y con su URL |
| `mod13q1-ndvi_<nombre>_<inicio>_<fin>.normalizado.csv` | Una fila por fecha: `fecha`, `modis_date`, NDVI, `pixel_reliability` y `calidad`; los faltantes, vacíos |
| `mod13q1-ndvi_<nombre>_<inicio>_<fin>.procedencia.json` | Producto y versión, metadatos de las bandas, significado de la calidad, peticiones, reintentos, uso de la caché, celda, tesela, fechas, faltantes y conteo por calidad |

**Caché y reanudación:**
- **Qué guarda:** cada respuesta, en cuanto llega, en `datos/ndvi/cache/<producto>_<nombre>_<inicio>_<fin>/`. Esa carpeta está en `.gitignore`.
- **Si se corta:** si un bloque sigue fallando tras 10 reintentos, el script sale con un mensaje que dice cuántos bloques están guardados. Al relanzar el mismo comando, retoma donde quedó.
- **Para pedirlo todo de nuevo:** hay que borrar esa carpeta.

## Las siete preguntas

### ¿Qué producto y versión exactos?

- **Producto:** MOD13Q1, versión **061**. Nombre oficial: «MODIS/Terra Vegetation Indices 16-Day L3 Global 250m SIN Grid V061», del satélite Terra ([ficha en Earthdata](https://www.earthdata.nasa.gov/data/catalog/lpcloud-mod13q1-061)).
- **Bandas usadas:** `250m_16_days_NDVI` (NDVI) y `250m_16_days_pixel_reliability` (confiabilidad del píxel).
- **Servicio:** ORNL DAAC, *Terrestrial Ecology Subsetting & Visualization Services* (TESViS), también llamado MODIS/VIIRS Land Product Subsets ([documentación](https://modis.ornl.gov/data/modis_webservice.html)).
- **Composición:** según la guía de usuario de MOD13 C6.1, es un compuesto de 16 días con el método CV-MVC (*Constrained View angle – Maximum Value Composite*). Elige, en cada período, el mejor valor por nubes, ángulo de visión y NDVI.

### ¿Cómo se accede? (URL, cuenta, clave)

- **URL base:** `https://modis.ornl.gov/rst/api/v1/`. El script usa tres rutas:
  - `MOD13Q1/bands`: metadatos de cada banda;
  - `MOD13Q1/dates?latitude=…&longitude=…`: fechas disponibles en el punto;
  - `MOD13Q1/subset?latitude=…&longitude=…&band=…&startDate=…&endDate=…&kmAboveBelow=0&kmLeftRight=0`: valores de un píxel.
- **Cuenta y clave:** no hacen falta.
- **Límite documentado:** «There is a limit of a maximum ten modis dates per request». El script pide 10 fechas por bloque, así que una serie de 2015 a 2026 son 56 bloques más 2 peticiones de metadatos.
- **Límite de llamadas por minuto:** **no verificado**; la documentación leída no lo indica.
- **Estabilidad:** el servicio es inestable. Hubo 32 reintentos en Chivay, repartidos en dos ejecuciones, y 32 en Majes riego. La caché evita perder la descarga si se corta.

### ¿Qué formato devuelve?

JSON (el servicio también ofrece CSV, que el script no usa).

- **`bands`:** lista de bandas con `units`, `valid_range`, `fill_value`, `scale_factor` y `add_offset`. El script lee de aquí el relleno, el rango y la escala, en lugar de fijarlos en el código.
- **`dates`:** lista de `modis_date` (formato `AAAADDD` con prefijo `A`, por ejemplo `A2026289`) y `calendar_date`.
- **`subset`:**
  - **metadatos:** `cellsize`, `xllcorner` e `yllcorner`, en proyección sinusoidal;
  - **un registro por fecha**, con `modis_date`, `calendar_date`, `band`, `tile`, `proc_date` y `data` (lista con el valor del píxel).

### ¿Unidades y valor de relleno de los faltantes?

Valores según la guía de usuario de MOD13 C6.1 (tabla 1). Coinciden con lo que devuelve el servicio en `bands`:

| Banda | Unidad | Tipo | Rango válido | Relleno | Escala |
|---|---|---|---|---|---|
| `250m_16_days_NDVI` | Sin unidad (índice) | int16 | −2000 a 10000 | −3000 | 0,0001 |
| `250m_16_days_pixel_reliability` | Rango (`rank`) | int8 | 0 a 3 | −1 | — |

**Confiabilidad del píxel** (guía de usuario, tabla 4) y la etiqueta que usa el CSV:

| Código | Guía | Etiqueta en el CSV |
|---|---|---|
| −1 | Fill/No Data, Not Processed | vacío (faltante) |
| 0 | Good Data, «Use with confidence» | `bueno` |
| 1 | Marginal data, «Useful, but look at other QA information» | `marginal` |
| 2 | Snow/Ice, «Target covered with snow/ice» | `nieve o hielo` |
| 3 | Cloudy, «Target not visible, covered with cloud» | `nubes` |

- **NDVI normalizado:** es el valor del servicio por 0,0001. Un relleno, o un valor fuera del rango válido, queda vacío en el CSV y se cuenta en `missing`. **Nunca se convierte en cero.**
- **NDVI con calidad baja** (nubes o marginal): se conserva y se marca en la columna `calidad`; no se borra.

### ¿Resolución espacial y temporal? ¿Latencia?

| Aspecto | Valor | Fuente |
|---|---|---|
| Resolución espacial | 250 m nominal; la celda real mide **231,656 m** de lado | Ficha del producto; campo `cellsize` de la respuesta |
| Proyección | Cuadrícula sinusoidal, en teselas de unos 1200 × 1200 km; los dos puntos caen en la `h11v10` | Guía de usuario; campo `tile` |
| Resolución temporal | Compuesto de 16 días: 23 fechas por año | Guía de usuario; muestras |
| Cobertura temporal | Del 18/02/2000 a la actualidad | Ficha del producto |
| Última fecha disponible | 16/10/2026, en la consulta del 14/11/2026 | Muestras |
| Latencia oficial | **No verificada** | — |

- **Continuidad:** la retirada de MODIS y la continuidad con VIIRS (`VNP13A1`, a 500 m) siguen **sin verificar**. MOD13Q1 seguía publicando datos al 14/11/2026.

### ¿Cubre Arequipa?

Sí. En los dos puntos, el servicio devolvió **272 de 272 fechas** entre el 01/01/2015 y el 16/10/2026, sin faltantes en el NDVI ni en la calidad. MOD13Q1 es un producto de NASA de la lista de recursos del desafío, así que **cuenta como dato de NASA**.

### ¿Condiciones de uso y atribución?

- **Condiciones:** según la ficha del producto, MOD13Q1 se comparte «openly shared, without restriction», de acuerdo con la [guía de uso y cita de datos de EOSDIS](https://www.earthdata.nasa.gov/engage/open-data-services-software-policies/data-use-guidance).
- **Qué citar:** ORNL pide citar **por separado** la herramienta y el producto ([guía de citas de ORNL](https://modis.ornl.gov/citation.html)).
- **Cita del producto:** Didan, K. (2021). *MODIS/Terra Vegetation Indices 16-Day L3 Global 250m SIN Grid V061* [Data set]. NASA Land Processes Distributed Active Archive Center. <https://doi.org/10.5067/MODIS/MOD13Q1.061>
- **Cita de la herramienta** (servicio REST):
  - texto: ORNL DAAC. 2018. *Terrestrial Ecology Subsetting & Visualization Services (TESViS) RESTful Web Service*. ORNL DAAC, Oak Ridge, Tennessee, USA. <https://doi.org/10.3334/ORNLDAAC/1600>;
  - ORNL pide añadir la fecha de acceso, el producto, el punto (latitud y longitud con 4 decimales), el período y el tamaño del recorte. Aquí el recorte es un solo píxel: `kmAboveBelow=0` y `kmLeftRight=0`.

## Resultado del 14/11/2026

| | Chivay (−15,64; −71,60) | Majes riego (−16,367023; −72,185771) |
|---|---|---|
| Fechas (01/01/2015 – 16/10/2026) | 272 | 272 |
| Faltantes | 0 | 0 |
| Calidad: bueno / marginal / nieve o hielo / nubes | 214 / 56 / 0 / 2 | 195 / 72 / 0 / 5 |
| NDVI mínimo | 0,051 (06/03/2015) | 0,267 (08/05/2016) |
| NDVI máximo | 0,534 (07/04/2026) | 0,739 (07/04/2026) |
| Mediana · media | 0,181 · 0,207 | 0,475 · 0,473 |
| Fechas > 0,3 · > 0,5 | 42 · 2 | 267 · 98 |
| Media por calidad: bueno / marginal / nubes | 0,195 / 0,254 / 0,193 | 0,480 / 0,455 / 0,451 |

**NDVI medio por mes (2015–2026):**

| Mes | Ene | Feb | Mar | Abr | May | Jun | Jul | Ago | Sep | Oct | Nov | Dic |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Chivay | 0,231 | 0,284 | **0,333** | 0,305 | 0,218 | 0,175 | 0,146 | **0,134** | 0,144 | 0,153 | 0,152 | 0,171 |
| Majes riego | 0,447 | 0,466 | 0,467 | 0,452 | 0,476 | 0,492 | **0,516** | 0,496 | 0,483 | 0,452 | 0,466 | 0,454 |

- **Chivay** tiene un ciclo estacional claro: máximo en marzo, con la temporada de lluvias, y mínimo en agosto.
  - **Agosto a octubre de 2026:** el NDVI fue de **0,097 a 0,157**, todo con calidad «bueno». Es compatible con campos sin cultivo en la temporada seca, pero no lo demuestra.
  - **En «marginal»**, la media es mayor porque esas fechas se concentran en la temporada de lluvias (49 de 56 entre noviembre y abril), no porque la calidad suba el NDVI.
- **Majes riego** tiene verdor todo el año y una estacionalidad débil, compatible con riego por canales. La serie no dice qué cultivo hay.

## Límites (qué no dice)

- **Un píxel de unos 231 m no es una parcela.** Mezcla varias parcelas, caminos y bordes: es la curva de verdor de la **zona**. Para ver parcelas hace falta HLS (30 m).
- **El NDVI no mide fertilidad.** Es un índice de verdor: no dice nada directo del suelo, de los nutrientes ni del rendimiento.
- **La marca de calidad «nubes» no está contrastada con la documentación.** La guía define el código 3 como «Cloudy: target not visible, covered with cloud». Lo que no está comprobado es que, en estos puntos, la marca responda a nubes reales.
  - En el punto urbano de Majes, el 73 % de las fechas salieron como «nubes» y el NDVI no cambió respecto de las fechas «bueno».
  - El punto de riego, a unos 2 km y en las mismas fechas, no tuvo ninguna.
  - Es una sospecha, no una conclusión. No conviene filtrar la serie solo por esta marca sin revisarla antes.
- **El punto de Majes se eligió sobre campos de riego mirando la vista satélite.**
  - El punto anterior (−16,351; −72,190) caía en el **casco urbano** y daba un NDVI bajo, con mediana de 0,117 y máximo de 0,306.
  - Sus muestras se conservan en `datos/muestras/` como referencia (`mod13q1-ndvi_majes_20150101_20261114.*`), pero **no representan los cultivos de Majes**.
- **El punto de Chivay todavía no se ha comprobado en vista satélite.** No se sabe si cae sobre campos, ladera, pueblo o una mezcla. Hay que comprobarlo antes de presentarlo como curva de cultivo.
- **2026 tiene en Majes riego una media anual mayor que no tiene explicación:** 0,571, frente a 0,42–0,49 en los demás años, aunque solo llega hasta octubre.
  - Puede ser un cambio de cultivo o de manejo en el píxel, pero no está verificado.
  - No debe presentarse como una tendencia.
- **Un histórico no es un pronóstico.** La serie describe lo que pasó, no lo que pasará en la próxima campaña.

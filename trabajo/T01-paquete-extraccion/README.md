# T01 · Paquete de extracción de datos de TARPU

> **Para:** la persona del equipo que tome esta tarea (por área le corresponde a **Damaris**, `datos/`; si la hace otra persona, avísale a ella porque es su carpeta). **Pedida por:** Erick, 15/11/2026.
>
> **No depende de nada pendiente.** Todo lo que necesitas está en este archivo y fue **verificado con peticiones reales el 14 y 15/11/2026**. Lo que hagas lo usa el backend directamente.
>
> **Esta carpeta es tuya:** `trabajo/T01-paquete-extraccion/`. Trabaja solo aquí; no hace falta tocar `datos/` ni `backend/`. En `referencia/` tienes **copias** de todo lo que necesitas consultar (los originales siguen en su sitio). Cuando el paquete pase las comprobaciones de la sección 6, se integra en `datos/` junto con Damaris y Erick.

## 1. Qué hay que construir

Un paquete de Python en **`tarpu_datos/` (dentro de esta carpeta)** que, dado **un punto (latitud, longitud)**, obtiene los datos de TARPU de varias fuentes y los guarda **siempre en el mismo formato**. Reemplaza los scripts sueltos actuales (`power/`, `soilgrids/`, `ndvi/`), que siguen sirviendo de referencia.

```text
trabajo/T01-paquete-extraccion/tarpu_datos/
  __init__.py
  cliente.py     peticiones con reintentos cortos, tope de peticiones simultáneas por servicio, caché atómica y avance
  power.py       NASA POWER: 19 variables diarias en 1 petición
  soilgrids.py   SoilGrids por WCS: 11 propiedades × 3 profundidades × 3 valores
  gaez.py        FAO GAEZ: índice de aptitud por cultivo y tipo de agua
  luz.py         horas de luz por día según la latitud (FAO-56); sin red
  ornl.py        MODIS por el servicio de ORNL, cualquier producto y banda, en paralelo
  __main__.py    línea de comandos: python -m datos.tarpu_datos --lat … --lon … --fuentes power soilgrids …
  pruebas.py     comprobaciones de la sección 6
```

**Reglas** (de `datos/AGENTS.md` y DT-16):
- solo biblioteca estándar de Python; si algo lo impide, anótalo en este README;
- un faltante **nunca** se convierte en 0: queda vacío;
- sin claves en el código;
- en el encabezado de cada archivo: «Escrito con asistencia de IA (herramienta)», si la usas, y una fila en `entrega/uso-de-ia.md`.

## 2. La interfaz que espera el backend

Cada módulo de fuente expone **una función** con esta forma (el backend la llama directamente):

```python
def obtener(*, lat: float, lon: float, salida: str, cache: str,
            inicio: str | None = None, fin: str | None = None,   # AAAA-MM-DD; las fuentes estáticas lo ignoran
            progreso=None) -> dict:
    """Devuelve:
    {"estado": "listo" | "parcial" | "sin_datos",
     "archivos": {"original": ruta, "normalizado": ruta, "procedencia": ruta},
     "faltan": [...],          # lo que no llegó (fechas, capas), si es parcial
     "motivo": str | None}     # texto literal del error del proveedor, si falla
    progreso(hechos, total) se llama cada vez que termina una petición (para la barra de avance)."""
```

**Siempre tres archivos**, con el mismo nombre base:
1. **`.original.json`**: lo que respondió el proveedor, sin tocar, con la URL de cada petición.
2. **`.normalizado.csv`**: una tabla; la **unidad va en la cabecera entre paréntesis**, por ejemplo `T2M (C)`; la primera columna es `fecha` en las series.
3. **`.procedencia.json`**: fuente, producto, versión, URL, fecha de consulta, punto, unidades, resolución, faltantes y cita o licencia.

El backend lee el normalizado con un lector genérico: respeta exactamente ese formato.

## 3. Cada fuente, con lo verificado

### 3.1 `power.py` · NASA POWER

- **URL:** `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=…&community=AG&latitude=…&longitude=…&start=AAAAMMDD&end=AAAAMMDD&format=JSON`
- **Límite verificado:** **máximo 20 variables por petición** (con 21 responde 422).
- **Las 19 variables de TARPU, en una sola petición:**
  `T2M, T2M_MAX, T2M_MIN, T2M_RANGE, PRECTOTCORR, RH2M, T2MDEW, FROST_DAYS, ALLSKY_SFC_SW_DWN, ALLSKY_SFC_PAR_TOT, CLOUD_AMT, WS2M, GWETTOP, GWETROOT, GWETPROF, TSOIL1, TSOIL2, TS_MIN, EVLAND`
- **Medido:** 20 variables de 2015 a 2025 en Chivay, **3,1 s**, 0 faltantes.
- **Faltante:** el relleno es `header.fill_value` (−999). Queda vacío.
- **No uses** `IMERG_PRECTOT` ni `RZMC`: vinieron **vacías los 366 días** en Majes 2024.
- **Procedencia:** guarda la **elevación de la celda** que viene en `geometry.coordinates[2]`. Toma como modelo `datos/power/consulta_power.py`, que ya lo hace bien.

### 3.2 `soilgrids.py` · SoilGrids por WCS

La API REST de SoilGrids **no respondió en 150 s** con consultas grandes (dos veces). El **WCS** respondió en **1,1 s**. Usa WCS y deja la REST como respaldo.

- **URL (una por capa):**

  ```text
  https://maps.isric.org/mapserv?map=/map/{propiedad}.map&SERVICE=WCS&VERSION=2.0.1&REQUEST=GetCoverage
    &COVERAGEID={propiedad}_{profundidad}_{valor}&FORMAT=image/tiff
    &SUBSET=long({lon-0.002},{lon+0.002})&SUBSET=lat({lat-0.002},{lat+0.002})
    &SUBSETTINGCRS=http://www.opengis.net/def/crs/EPSG/0/4326&OUTPUTCRS=http://www.opengis.net/def/crs/EPSG/0/4326
  ```

- **Nombres de capa verificados** (GetCapabilities de `phh2o`): `phh2o_0-5cm_mean`, `phh2o_0-5cm_Q0.05`, `phh2o_0-5cm_Q0.5`, `phh2o_0-5cm_Q0.95`, `phh2o_0-5cm_uncertainty`; profundidades `0-5cm`, `5-15cm`, `15-30cm`.
- **Propiedades:** `phh2o, clay, sand, silt, soc, nitrogen, cec, bdod, cfvo, wv0033, wv1500`. Valores: `mean`, `Q0.05`, `Q0.95`. Son 99 peticiones: lánzalas en paralelo con un tope; ISRIC pide uso justo.
- **Respuesta:** un GeoTIFF de **2 × 2 píxeles** (≈ 600 bytes). Pídelo en TIFF, no en PNG ni JPEG, porque esos formatos pierden el valor.
- **Leer el GeoTIFF con la biblioteca estándar:** es TIFF sin comprimir de enteros de 16 bits; basta un lector pequeño con `struct`. Si no lo consigues, Pillow funciona (lo probamos), pero anota la dependencia.
- **Unidades:** el valor viene **multiplicado por un factor**. Verificado: pH 0–5 cm en Chivay = 69 → **6,9**. Los factores (`d_factor`) y unidades de **cada** propiedad salen de **una** consulta REST con todas las propiedades (`https://rest.isric.org/soilgrids/v2.0/properties/query?lon=…&lat=…&property=…`, campo `unit_measure`). Las de pH, arcilla, arena y carbono ya están en `datos/muestras/soilgrids_*.procedencia.json`. **No inventes un factor:** léelo.
- **Cita:** CC BY 4.0, Poggio et al. (2021), SOIL 7, 217–240.

### 3.3 `gaez.py` · FAO GAEZ v4

- **Buscar la capa:** `https://gaez-services.fao.org/server/rest/services/res05/ImageServer/query?where=…&outFields=objectid,name,crop,water_supply,input_level,year,variable&returnGeometry=false&f=json`
  - filtro: `crop='{cultivo}' and year='1981-2010' and sub_theme_name='Suitability Index' and input_level='High'`
- **Leer el valor en el punto:** `…/res05/ImageServer/identify?geometry={"x":lon,"y":lat,"spatialReference":{"wkid":4326}}&geometryType=esriGeometryPoint&mosaicRule={"mosaicMethod":"esriMosaicLockRaster","lockRasterIds":[objectid]}&returnGeometry=false&returnCatalogItems=false&f=json` → campo `value` (índice de 0 a 10 000).
- **Cultivos de GAEZ que nos sirven** (verificado; GAEZ **no** tiene quinua, haba, ajo, alcachofa, vid ni zapallo): Alfalfa, Barley, Carrot, Dry pea, Maize, Olive, Onion, Phaseolus bean, Sugarcane, Sweet potato, Tomato, Wetland rice, Wheat, White potato, Oat.
- **Tipos de agua:** `Rainfed`, `Irrigation`, `Gravity Irrigation`, `Sprinkler Irrigation`. Para algunos cultivos `Irrigation` vino vacía: revisa con `query` qué `water_supply` tiene cada uno y guarda los que existan. No supongas.
- **Variable:** guarda el texto de `variable`. Las que empiezan con `su` dicen «current cropland in grid cell»; las que empiezan con `sx`, «all land in grid cell».
- **Medido:** 12 consultas en 7,8 s. Celdas de 0,0833° (≈ 9 km).

### 3.4 `luz.py` · Horas de luz (FAO-56, sin red)

Allen et al. (1998), *FAO Irrigation and Drainage Paper 56*:
- δ = 0,409·sen(2π·J/365 − 1,39)
- ωs = arccos(−tan φ·tan δ)
- N = (24/π)·ωs

J es el día del año y φ la latitud en radianes. Salida: N por día y su mínimo y máximo.

### 3.5 `ornl.py` · MODIS por ORNL, en paralelo

- **Base:** `https://modis.ornl.gov/rst/api/v1/{producto}/subset?latitude=…&longitude=…&band=…&startDate=A2015001&endDate=…&kmAboveBelow=0&kmLeftRight=0`
- **Límites oficiales** ([documentación](https://modis.ornl.gov/data/modis_webservice.html)): **una banda** y **máximo 10 fechas** por petición. En `MCD12Q1`, **máximo 10 años** por petición (error verificado).
- **Medido:**
  - una petición tarda de 6 a 45 s;
  - **8 en paralelo tardaron 30 s en total** (4 en serie, 113 s);
  - `/bands` tarda ≈ 34 s y `/dates`, de 20 a 40 s: **guárdalos en caché** (uno por producto, y fechas por tesela).
- **Productos y bandas:**

| Producto | Bandas | Notas |
|---|---|---|
| `MOD13Q1` | `250m_16_days_NDVI`, `250m_16_days_pixel_reliability` | Igual que `datos/ndvi/consulta_ndvi.py`: copia su lógica de escala, relleno y calidad |
| `MOD16A2GF` | `ET_500m`, `PET_500m` | kg/m²/8 días, escala 0,1 |
| `MOD11A2` | `LST_Day_1km`, `LST_Night_1km` | Kelvin, escala 0,02 |
| `MCD12Q1` | `LC_Type1` | Clase IGBP anual |

- **Lo que pide el paralelo:**
  1. un **tope global de 8** peticiones simultáneas a ORNL (por cortesía; la documentación no da un límite);
  2. **lo más reciente primero**;
  3. un bloque que falla **no detiene** a los demás: se reintenta al final, con esperas cortas;
  4. si sigue fallando, el estado es `parcial` con las fechas que faltan;
  5. caché en disco por bloque, para retomar.
- **No uses** `SPL3SMP_E` ni `ECO4ESIPTJPL` en ORNL: respondieron «No data available for location» en Majes y en Chivay.

## 4. Los dos lugares de prueba

| Lugar | Latitud | Longitud |
|---|---|---|
| `majes_riego` | −16.367023 | −72.185771 |
| `chivay` | −15.64 | −71.60 |

## 5. Línea de comandos

Desde esta carpeta (`trabajo/T01-paquete-extraccion/`):

```bash
python -m tarpu_datos --lat -15.64 --lon -71.60 --nombre chivay --fuentes power soilgrids gaez luz --inicio 2015-01-01 --fin 2025-12-31
```

Deja los archivos en `salida/` y la caché en `cache/`, **dentro de esta carpeta**. Git ya ignora las dos.

## 6. Cómo saber que está bien (valores reales esperados)

| Comprobación | Valor esperado |
|---|---|
| POWER Chivay 2015–2025 | 4018 días; 0 faltantes; elevación de la celda 4351,89 m; `FROST_DAYS` > 0 en **322** días de julio sumando los 11 años |
| SoilGrids WCS, pH 0–5 cm, media | **Chivay 6,9** · **Majes riego 8,1** (los mismos que la REST en `datos/muestras/`) |
| GAEZ, papa, con riego, insumos altos (`suHi_wpo`, objectid 256952) | **Majes riego 3333** · Chivay 0 |
| GAEZ, papa, riego por gravedad (`suHg_wpo`, 256923) | Majes riego 5556 |
| GAEZ, cebada, con riego (`suHi_brl`, 256926) | Majes riego 5556 · Chivay 0 |
| GAEZ, en secano (`sxHr_wpo` 257881, `sxHr_brl` 257836) | 0 en los dos lugares |
| Horas de luz a −16,4° | Mínimo **11,02 h** (día 172) · máximo **12,98 h** (día 354) |
| MODIS `MCD12Q1` 2015–2024 | Majes riego: 14,14,14,14,12,12,12,14,14,14 · Chivay: 10 todos los años |
| MODIS `MOD13Q1` 2015-01-01 a 2026-10-16 | 272 fechas; mismos valores que `datos/muestras/mod13q1-ndvi_*` |
| Paralelo | Las 56 peticiones de NDVI de un lugar en **minutos**, no en horas; el log lo muestra |

## 7. Recursos que hay que revisar

En esta carpeta (copias):
- `referencia/scripts_datos/`: los scripts de Damaris que funcionan (`power/`, `soilgrids/`, `ndvi/`, `obtener_muestras.py`) y sus fichas `README.md`; reutiliza su lógica. También las reglas del área (`AGENTS.md`).
- `referencia/muestras/`: los resultados reales con los que comparar.
- `referencia/backend/ingesta.py`: **cómo lee el backend tu normalizado** (cabecera `nombre (unidad)`, vacío = sin dato). `conectores.py`: cómo se registran las fuentes.
- `referencia/backend/PLAN-DATOS-SATELITALES.md` y `PLAN-SECTORES-AREQUIPA.md`: por qué se eligieron estas fuentes y variables.
- `referencia/investigacion/cultivos_arequipa_2026-11-14.json`: los cultivos de GAEZ y EcoCrop con sus valores.

En el repositorio (originales): `backend/DISENO.md`, sección 7, y `docs/06-decisiones-y-riesgos.md` (DT-16 a DT-18).

En internet:
- [POWER, documentación de la API](https://power.larc.nasa.gov/docs/services/api/) y [lista de parámetros AG](https://power.larc.nasa.gov/api/system/manager/parameters?community=AG&temporal=daily).
- [SoilGrids WCS](https://maps.isric.org/) y [SoilGrids REST](https://rest.isric.org/soilgrids/v2.0/docs).
- [FAO GAEZ, servicio res05](https://gaez-services.fao.org/server/rest/services/res05/ImageServer).
- [ORNL MODIS web service](https://modis.ornl.gov/data/modis_webservice.html).
- [FAO-56](https://www.fao.org/3/x0490e/x0490e00.htm), capítulo 3, horas de luz.

## 8. Cómo entregar

1. Trabaja en `tarpu_datos/` (esta carpeta) y prueba con los dos lugares hasta que la tabla de la sección 6 coincida.
2. Sube un commit propio del área (sin coautoría automática de IA; el uso de IA se declara en el texto).
3. Avisa a Erick y a Damaris: el paquete se mueve a `datos/` y el backend reemplaza la llamada por línea de comandos por `obtener()`.

**Fuera de esta tarea:** NASADEM, SMAP y HLS (necesitan la cuenta de Earthdata; los lleva Erick) y el censo (CENAGRO 2012; lo lleva Erick).

## 9. Notas técnicas de la implementación (15/11/2026)

> Escrito con asistencia de IA (Claude Code). Lo verificado aquí se hizo con peticiones reales el 15/11/2026.

### 9.1 Diferencias con lo que decía este README

1. **El GeoTIFF del WCS viene comprimido con Deflate** (etiqueta TIFF 259 = 8), no sin comprimir como decía la §3.2. Se lee con `struct` y `zlib`, las dos de la biblioteca estándar: **no se usa Pillow**. Si un archivo no se puede leer, la capa queda vacía, el estado es `parcial` y el motivo se registra. Nunca se usa un valor inventado.
2. **La ventana de ±0,002° de la §3.2 no sirve para elegir el píxel.** Devuelve 2 × 2 píxeles y el punto cae justo en su esquina común, así que elegir uno depende del redondeo (en Chivay, arcilla 0–5 cm: 191, 190, 183 y 180). Con **±0,001°** el WCS devuelve **1 píxel centrado en el punto**. Comprobado: **32 de 32 valores** (phh2o, clay, sand y soc; mean, Q0.05, Q0.95 y uncertainty; 0–5 cm) son iguales a la REST guardada, en Chivay y en Majes riego. El original conserva todos los píxeles leídos.
3. **El subtema «Suitability Index» de GAEZ también devuelve capas «Share of grid cell…»** (`sx1…`, `sx2…`, `sx3…`), que son otra variable. Solo se leen las capas cuyo `variable` empieza por «Suitability index»; las demás quedan listadas en la procedencia (`layers_skipped_not_suitability_index`).

### 9.2 Formato del normalizado (acordado con Damaris)

- **Fuentes sin fechas (SoilGrids y GAEZ):** una sola fila con la columna `fecha` **vacía**. El lector del backend (`ingesta.leer_normalizado`) solo exige que la cabecera empiece por `fecha` y acepta la celda vacía. **Esa «fecha» no es una fecha de observación**: el suelo y la aptitud de GAEZ no tienen serie temporal. Así lo dice también la procedencia (`fecha_column_note`).
- **SoilGrids:** una columna por capa, `{propiedad}_{profundidad}_{valor} (unidad)`, con media, Q0.05, Q0.5, Q0.95 e incertidumbre. El formato largo anterior se conserva aparte, en `soilgrids_{nombre}.largo.csv`. Su última columna ahora es «incertidumbre (entero del proveedor, sin convertir)».
- **ORNL:** el normalizado solo lleva columnas numéricas, porque el lector del backend hace `float()` de cada celda. El texto va en `*.detalle.csv`: `modis_date`, valor crudo, etiqueta de calidad, clase IGBP y tesela. Las cabeceras usan el nombre de la banda y la unidad tal como la da `/bands`, por ejemplo `250m_16_days_NDVI (NDVI ratio - No units)`.

### 9.3 Factores de conversión de SoilGrids (`d_factor`)

- **Sembrados desde las procedencias REST del área de datos** (`referencia/muestras/soilgrids_*.procedencia.json`, consultas del 14/11/2026; los tres archivos coinciden):

  | Propiedad | Unidad mapeada → unidad final | `d_factor` |
  |---|---|---|
  | `phh2o` | pH*10 → «-» | 10 |
  | `clay` | g/kg → % | 10 |
  | `sand` | g/kg → % | 10 |
  | `soc` | dg/kg → g/kg | 10 |

- **Los otros 7** (silt, nitrogen, cec, bdod, cfvo, wv0033 y wv1500) salen de **una** consulta REST (`unit_measure`). Cada factor guarda su origen (archivo o URL, y fecha) en `cache/soilgrids/_factores.json` y en la procedencia.
- **Si la REST no responde:** esas capas quedan vacías, el estado es `parcial` y el motivo queda en la procedencia (`unit_factors_missing_reason`). Nunca se inventa un factor.

### 9.3 bis · Factores obtenidos por REST (15/11/2026)

- **Resultado:** la consulta REST de los 7 factores que faltaban agotó el tiempo (180 s) en el primer intento y respondió en el reintento.
- **Factores leídos de `unit_measure`:**
  - `d_factor` = 100: `nitrogen` y `bdod`;
  - `d_factor` = 10: `silt`, `cec`, `cfvo`, `wv0033` y `wv1500`.
- **Detalle:** las unidades de cada uno están en la procedencia de SoilGrids (`units`), con la URL y la fecha de la consulta.

### 9.4 Pendiente de verificar: `uncertainty` de SoilGrids

- La columna `…_uncertainty` del normalizado queda **vacía** y el estado de SoilGrids es `parcial` por ese motivo. El entero del proveedor se guarda en el original y en el `.largo.csv`.
- **Indicio, no cita:** en las muestras REST, el entero equivale a (Q0.95 − Q0.05) / Q0.5 × 10. Por ejemplo, pH en Chivay: (89 − 53) / 68 = 0,53 → 5; arcilla: (606 − 17) / 130 = 4,53 → 45. La REST da `uncertainty_unit` vacío.
- **Tarea:** confirmar la unidad y el factor en la documentación de ISRIC antes de rellenar la columna.

### 9.5 Paralelo y reintentos

- **Topes de peticiones simultáneas, todos parámetros:**
  - ORNL `--tope-ornl`, **4 por defecto**; subirlo a 8 solo si el resumen de 5xx del log lo justifica;
  - SoilGrids `--tope-soilgrids` = 4;
  - GAEZ `--tope-gaez` = 4.
- **Reintentos en línea:** cortos (2, 4 y 8 s).
- **Ronda final:** el bloque que falla pasa a ella, con la mitad de hilos y esperas de 15, 30, 60 y 120 s (`--espera-max-ornl`). Si aún falla, el estado es `parcial` y `faltan` lleva las fechas.
- **Caché:** cada respuesta se guarda en `cache/` apenas llega, así que un relanzamiento retoma.
- **Resumen:** `cache/ornl/_resumen_{nombre}_{productos}.json` guarda el tiempo total y el recuento de 5xx.
- **Prueba pequeña** (Chivay, 15/11/2026): `/bands` de MOD13Q1 respondió 503, 503 y 502 antes de responder. Los metadatos tardaron unos 4 minutos; el bloque de prueba, 32 s.
- **Tiempos medidos del NDVI** (MOD13Q1, 2015-01-01 a 2026-10-16), con ORNL degradado y el tope de 4:
  - Majes riego: **37,8 min**, 152 peticiones, el 62,5 % con fallos recuperables;
  - Chivay: **12,1 min**, el 35,6 % con fallos recuperables.
- **Las 8 salidas de ORNL** (4 productos × 2 lugares) terminaron con **0 bloques fallidos**.
- **Fechas de MOD11A2 y MOD16A2GF** (2015-01-01 a 2025-12-31): MOD11A2 tiene **505 fechas** y MOD16A2GF **506**. El servicio lista 505 para MOD11A2; la causa no está verificada.
- **Faltantes de LST en MOD11A2** (celdas vacías en el normalizado):

  | Lugar | `LST_Day_1km` | `LST_Night_1km` |
  |---|---|---|
  | Chivay | 3 | 25 |
  | Majes riego | 2 | 64 |

### 9.5 bis · Límite de GAEZ en Chivay (valores del 15/11/2026)

**Consulta:** los 15 cultivos de la §3.3; periodo 1981-2010; insumos altos; capas cuyo `variable` empieza por «Suitability index». Son **100 capas** por lugar, con los tipos de agua que devolvió `query`. Chivay se consultó en −15,64; −71,60 y Majes riego en −16,367023; −72,185771.

- **Chivay:** las **100 capas valen 0**, con prefijos `su…` y `sx…` y todos los tipos de agua.
- **Majes riego:** las capas de secano (`Rainfed` y `Rainfed All Phases`, `su…` y `sx…`) valen 0. Las de riego distintas de 0 son estas:

  | Cultivo | Irrigation | Gravity | Sprinkler | Drip |
  |---|---|---|---|---|
  | Alfalfa | 5556 | 3333 | 5556 | — |
  | Barley | 5556 | 0 | 0 | — |
  | Carrot | — | 1667 | 3333 | 3333 |
  | Dry pea | — | 3333 | 3333 | — |
  | Maize | — | 3333 | 3333 | — |
  | Onion | — | 3333 | 5556 | 5556 |
  | Phaseolus bean | — | 3333 | 3333 | 3333 |
  | Tomato | — | 1667 | 3333 | 3333 |
  | Wheat | 5556 | 3333 | 5556 | — |
  | White potato | 3333 | 5556 | 5556 | — |

  - «—»: el servicio no devolvió esa capa para el cultivo.
  - Olive, Sugarcane, Sweet potato, Wetland rice y Oat valen 0 en todas sus capas.

**Lo que se puede decir:** en Chivay, GAEZ no distingue ningún cultivo del catálogo, porque todas las capas leídas valen 0. **La causa no está verificada** y no se interpreta aquí. Queda como tarea: revisar en la documentación de GAEZ v4 qué significa el 0 en estas capas y qué cubre la celda de 0,0833° que contiene el punto.

**Tipos de agua:** `query` devolvió además **`Drip Irrigation`**, que no figuraba en la lista de la §3.3, para Carrot, Olive, Onion, Phaseolus bean y Tomato. Se guarda como cualquier otro tipo de agua.

### 9.6 Cómo lanzar y comprobar

```bash
# Rápidas (segundos): POWER, SoilGrids, GAEZ y luz
python -m tarpu_datos --lat -16.367023 --lon -72.185771 --nombre majes_riego --fuentes power soilgrids gaez luz --inicio 2015-01-01 --fin 2025-12-31
# ORNL, en otra terminal y un lugar a la vez (NDVI con el período de la §6)
python -m tarpu_datos --lat -15.64 --lon -71.60 --nombre chivay --fuentes ornl --productos MOD13Q1 --inicio 2015-01-01 --fin 2026-10-16 --tope-ornl 4
python -m tarpu_datos --lat -15.64 --lon -71.60 --nombre chivay --fuentes ornl --productos MCD12Q1 --inicio 2015-01-01 --fin 2024-12-31 --tope-ornl 4
# Comprobaciones de la §6, sobre lo que haya en salida/ (no descarga nada)
python -m tarpu_datos.pruebas
```

- **Prueba pequeña:** `--capas phh2o_0-5cm_mean,clay_0-5cm_mean`, `--cultivos "White potato"` y `--max-tramos 1`.
- **Rango de MCD12Q1:** las comprobaciones esperan el archivo con `2015-01-01` a `2024-12-31`.
- **En PowerShell 5.1, no usar `2>&1 | Tee-Object`** con el paquete: PowerShell convierte los mensajes del log (stderr) en errores y corta la ejecución. Hay que pasar por `cmd`:

  ```powershell
  cmd /c "python -m tarpu_datos ... >> cache\x.log 2>&1"
  ```

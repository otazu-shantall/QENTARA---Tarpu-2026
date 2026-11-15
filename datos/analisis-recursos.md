# Análisis de los recursos oficiales para TARPU (Arequipa)

> 14/11/2026. Parte de la investigación de Erick ([investigacion-erick.md](investigacion-erick.md)) y la contrasta con **consultas reales hechas hoy** al catálogo de NASA (CMR) y a los servicios de datos, sobre dos puntos de Arequipa:
>
> - **Majes** (−16,35; −72,19): costa, valle irrigado;
> - **Chivay** (−15,64; −71,60): sierra, Colca.
>
> Lo marcado como **verificado** se comprobó con una consulta. Lo marcado **por verificar** es información de la investigación o conocimiento general que no se confirmó aquí.

## 1. La conclusión corta

| Nivel | Fuentes | Por qué |
|---|---|---|
| **Núcleo de la demo, sin cuenta** | NASA POWER · NDVI de MODIS/VIIRS (servicio de ORNL) · capas de NASA GIBS · SoilGrids | Responden ya, sin registro, para los dos puntos. Cubren clima, vegetación y suelo |
| **Con cuenta Earthdata (gratis)** | HLS (NDVI a 30 m) · IMERG · SMAP · SRTM/NASADEM · ECOSTRESS | Más detalle; requieren crear una cuenta y descargar archivos |
| **Después del evento** | FAO GAEZ · ERA5 · GLDAS · Sentinel-2 a 10 m · GRACE | Útiles, pero más trabajo o menos necesarios para la demo |
| **No sirven para Arequipa** | Todos los recursos de USDA, USGS y PRISM, más OpenET, CoCoRaHS y NAIP; GEDI para cultivos | Solo cubren Estados Unidos, o miden bosques |

**Cambio importante respecto del plan anterior:** para la vegetación conviene usar **datos de NASA** (MODIS/VIIRS, o HLS a 30 m) antes que Sentinel-2. Cuentan como «dato de NASA» para el criterio *Relevance*, y hay versiones sin cuenta.

## 2. Arequipa no es un solo caso: costa y sierra

Datos reales de NASA POWER para los dos puntos de referencia (celda regional de ≈ 55 × 67 km). **Solo datos; sin interpretaciones.**

| | **Costa: Majes** (−16,35; −72,19) | **Sierra: Chivay** (−15,64; −71,60) |
|---|---|---|
| Período consultado | 2025 (365 días) | 2015–2025 (4018 días) |
| Elevación de la celda (POWER) | 835 m | 4352 m |
| Noches con mínima bajo 0 °C | 0 en 2025 | ≈ 29 por mes en julio y agosto (promedio 2015–2025) |
| Lluvia total | 169,6 mm en 2025 | Entre 176 mm (2021) y 405 mm (2025) por año |
| Cultivos que se siembran | Pendiente: verificar con estadísticas de MIDAGRI | Pendiente: verificar con estadísticas de MIDAGRI |
| Disponibilidad de imágenes sin nubes | Pendiente: medir con las fechas válidas reales | Pendiente: medir con las fechas válidas reales |

La lluvia de POWER en Majes es un valor de **celda regional**. Si representa o no al valle irrigado solo se sabrá comparándola con otra fuente (estación de SENAMHI o IMERG); hasta entonces se muestra como dato de la zona.

**Dato observado (verificado):** el NDVI de MODIS (píxel de 250 m) en el punto de Chivay fue **0,113 · 0,097 · 0,157 · 0,136 · 0,099** entre el 13/08 y el 16/10/2026. Es un dato de la zona. **No se interpreta** (por ejemplo, como «campo sin cultivo») sin un umbral citado y sin una serie más larga.

## 3. Qué hay realmente sobre Arequipa (verificado en CMR, 14/11/2026)

Último dato disponible en el catálogo de NASA para cada punto:

| Producto | Qué mide | Resolución | Último dato Majes | Último dato Chivay |
|---|---|---|---|---|
| SMAP `SPL3SMP_E` v006 | Humedad del suelo, primeros 5 cm | 9 km, diario | 12/11/2026 | 12/11/2026 |
| SMAP `SPL4SMGP` v008 | Humedad superficial y de raíz (modelada) | 9 km, 3 h | 10/11/2026 | 10/11/2026 |
| IMERG Late `GPM_3IMERGDL` v07 | Lluvia diaria | 0,1° | 13/11/2026 | 13/11/2026 |
| IMERG Final `GPM_3IMERGDF` v07 | Lluvia diaria calibrada | 0,1° | **30/09/2025** (fin de la colección en el catálogo) | 30/09/2025 |
| MODIS `MOD13Q1` v061 | NDVI y EVI | 250 m, 16 días | 16/10/2026 | 16/10/2026 |
| VIIRS `VNP13A1` v002 | NDVI y EVI (sucesor de MODIS) | 500 m, 16 días | 24/10/2026 | 24/10/2026 |
| **HLS** `HLSL30` / `HLSS30` v2.0 | Reflectancia armonizada Landsat + Sentinel-2 | **30 m** | 29/10 y 04/11/2026 | 30/10 y 04/11/2026 |
| ECOSTRESS `ECO_L2T_LSTE` v003 | Temperatura de superficie | 70 m | 09/11/2026 | 09/11/2026 |
| ECOSTRESS `ECO_L3T_JET` v003 | Evapotranspiración | 70 m | 20/10/2026 | 20/10/2026 |
| MODIS `MOD16A2GF` v061 | Evapotranspiración | 500 m, 8 días | 27/12/2025 | 27/12/2025 |
| MODIS `MOD11A2` v061 | Temperatura de superficie | 1 km, 8 días | 01/11/2026 | 01/11/2026 |
| SRTM `SRTMGL1` v003 / NASADEM | Elevación | 30 m | Estático (2000) | Estático (2000) |
| GLDAS Noah 2.1 | Clima y humedad del suelo modelados | 0,25°, 3 h | 31/07/2026 | 31/07/2026 |
| GEDI `GEDI02_A` v003 | Altura de vegetación (láser) | Huellas de ~25 m | 14/09/2025 | 22/03/2026 |
| NASA POWER (API) | Temperatura, lluvia, humedad, radiación | Celda regional | 365 días de 2025 descargados | No consultado |

**Conclusión:** todos los productos globales de NASA del desafío cubren Arequipa y siguen activos.

## 4. Qué se puede usar sin crear una cuenta (verificado)

| Servicio | Qué da | Prueba de hoy |
|---|---|---|
| **NASA POWER API** | Series diarias de clima por punto, en JSON | ✅ 365 días de Majes ([power/](power/consulta_power.py)) |
| **ORNL DAAC, MODIS/VIIRS Land Product Subsets** (`modis.ornl.gov/rst/api/v1/`) | Series de NDVI y otros productos en un punto, en JSON | ✅ 614 fechas de `MOD13Q1` en Majes (de 02/2000 a 10/2026). NDVI de Chivay descargado. ⚠️ **Inestable**: devolvió error 502 en varias peticiones; hay que reintentar y pedir pocas fechas por vez |
| **NASA GIBS** (WMTS) | Teselas de imagen listas para el mapa | ✅ Tesela PNG de NDVI MODIS descargada |
| **ISRIC SoilGrids API** | Propiedades del suelo por profundidad | ✅ Majes, 0–5 cm: pH 8,3 · arcilla 7,2 % · carbono orgánico 17,2 g/kg (predicción a 250 m) |

**Capas de GIBS** útiles para el mapa de TARPU (comprobadas en el catálogo del servicio):

- `MODIS_Terra_L3_NDVI_16Day`, `VIIRS_SNPP_L3_NDVI_16Day` y `VIIRS_NOAA20_NDVI_8Day`;
- `SMAP_L3_Passive_Enhanced_Day_Soil_Moisture` y `SMAP_L4_Analyzed_Root_Zone_Soil_Moisture`;
- `IMERG_Precipitation_Rate`;
- `MODIS_Terra_Land_Surface_Temp_Day`;
- `HLS_L30_Nadir_BRDF_Adjusted_Reflectance` y `HLS_S30_Nadir_BRDF_Adjusted_Reflectance`;
- `SRTM_Color_Index`.

**Oportunidad:** mostrar en el mapa capas de NASA (GIBS) en lugar de solo la imagen de Esri hace visible el dato de NASA (criterio *Relevance*) y evita la duda legal sobre las condiciones de Esri. Las capas de GIBS son imágenes para ver: para calcular hay que usar los valores numéricos de los productos.

## 5. Ficha por fuente

### Núcleo

**NASA POWER**: clima diario por punto.
- **Variables:** temperatura media, máxima y mínima; lluvia; humedad; radiación.
- **Uso en TARPU:** riesgo de helada (temperatura mínima), grados-día y estacionalidad.
- **Límite:** es una celda regional, no una medición en la parcela.

**MODIS y VIIRS (NDVI)**: la curva de verdor de la zona cada 16 días desde 2000.
- **Uso en TARPU:** detectar épocas sin cultivo y temporadas vulnerables, comparar años y ver cuándo empieza y termina la campaña.
- **Límite:** un píxel de 250 a 500 m mezcla varias parcelas.
- **Continuidad:** la investigación indica que MODIS se retira hacia 2026–2027 (**por verificar**). VIIRS es su sucesor y ya tiene el mismo producto.

**SoilGrids (ISRIC)**: pH, textura y carbono por profundidad.
- **Por qué:** reemplaza a Web Soil Survey y SSURGO, que solo cubren Estados Unidos.
- **Límite:** son predicciones a 250 m; no sustituyen un análisis de suelo.
- **Nota:** no está en la lista oficial; va en «otras referencias».

### Con cuenta Earthdata

**HLS (Harmonized Landsat Sentinel-2)**: no estaba en la investigación y es la mejor opción para ver parcelas.
- **Qué es:** une Landsat 8/9 y Sentinel-2 a **30 m**, corregidos para que sean comparables, con una revisita de pocos días.
- **Por qué importa:** es un producto de NASA (cuenta para *Relevance*) y permite NDVI a escala de parcela.
- **Acceso:** con cuenta Earthdata y [AppEEARS](https://appeears.earthdatacloud.nasa.gov/), que recorta por zona.

**IMERG**: lluvia.
- **Uso en TARPU:** sobre todo en la **sierra**.
- **Precisión sobre la investigación:** la versión *Final* (calibrada) llega en el catálogo solo hasta el 30/09/2025. Para la historia larga se usa la Final; para los meses recientes, la *Late*, que llega hasta ayer.

**SMAP**: humedad del suelo.
- **Uso en TARPU:** contexto regional en la sierra.
- **Límite:** en la costa, un píxel de 9 km mezcla desierto y campo irrigado, así que **no describe una parcela de Majes**.
- **Dos productos:** L3 (primeros 5 cm, observado) y L4 (incluye la zona de raíces, modelado).

**SRTM o NASADEM**: elevación a 30 m.
- **Uso en TARPU:** pendiente y riesgo de erosión, importantes en las laderas y los andenes de la sierra.

**ECOSTRESS**: temperatura de superficie y evapotranspiración a 70 m, a distintas horas del día.
- **Uso en TARPU:** estrés por calor y demanda de agua, útil en la **costa irrigada**.
- **Límite:** pasa de forma irregular; hay que comprobar cuántas escenas sin nubes hay por campaña.

### Después del evento

| Fuente | Para qué | Lo que hay que verificar |
|---|---|---|
| **FAO GAEZ** | Aptitud agroclimática por cultivo: clave para comparar rotaciones | **Si incluye quinua y haba.** Papa y cebada son cultivos comunes en estos catálogos, pero no lo confirmamos |
| **ERA5** (socio: ECMWF/Copernicus) | Reanálisis horario desde 1940 | Requiere cuenta en el Climate Data Store |
| **GLDAS** | Series modeladas de humedad del suelo y evaporación | Llega con meses de retraso (último dato: 31/07/2026) |
| **Sentinel-2 a 10 m** | Más detalle que HLS | Cuenta de Copernicus y procesamiento propio |
| **GRACE / GRACE-FO** | Tendencia del agua subterránea | Escala de cientos de kilómetros: solo contexto regional |

### Descartados

| Recurso | Motivo |
|---|---|
| USDA Ag Data Commons, Web Soil Survey, SSURGO/STATSGO2, Cropland Data Layer, NASS QuickStats, AMS Market News | Solo Estados Unidos |
| PRISM, CoCoRaHS, NLDAS | Solo Estados Unidos o Norteamérica |
| USGS NWIS, NLCD, LANDFIRE, NAIP, OpenET | Solo Estados Unidos |
| GEDI | Mide bosques y vegetación alta; hay datos sobre Arequipa, pero no sirven para cultivos bajos |

## 6. Qué necesita el desafío y qué dato lo responde

| Lo que sugiere el desafío | Dato para Arequipa |
|---|---|
| Épocas con el campo sin cultivo | NDVI MODIS/VIIRS (zona) y HLS (parcela) |
| Temporadas en que el cultivo es vulnerable | POWER (temperatura mínima y heladas) + NDVI |
| Lluvia y extremos | IMERG (sierra); POWER como apoyo |
| Humedad del suelo y agua | SMAP (sierra); ECOSTRESS y MOD16 (evapotranspiración, costa) |
| Riesgo de erosión | SRTM o NASADEM (pendiente) |
| Suelo | SoilGrids |
| Aptitud de cada cultivo de la rotación | FAO GAEZ (verificar cultivos) + catálogo agronómico de TARPU (INIA) |
| Mercado | Sin fuente global en la lista: buscar un equivalente peruano |

## 7. Equivalentes peruanos de lo que solo existe en Estados Unidos

Son **por verificar**: no se consultaron. Tarea de investigación para Derecho, con apoyo de Damaris.

| En Estados Unidos | Qué buscar en Perú |
|---|---|
| Cropland Data Layer, NASS QuickStats | Estadísticas de siembra y producción de MIDAGRI (SIEA) |
| AMS Market News | Precios de productos agrarios de MIDAGRI |
| PRISM, CoCoRaHS | Estaciones y datos grillados de SENAMHI |
| SSURGO, Web Soil Survey | Estudios de suelos de INIA o MIDAGRI; mientras tanto, SoilGrids |
| USGS NWIS | Datos de la Autoridad Nacional del Agua (ANA) |

## 8. Correcciones y precisiones a la investigación previa

| En la investigación | Precisión |
|---|---|
| IMERG Final «a los ~3,5 meses» | En el catálogo, la Final V07 termina el 30/09/2025. Para datos recientes hay que usar la Late (verificado) |
| Recomendación de Google Earth Engine o Planetary Computer | Earth Engine pide registro y un proyecto aprobado: es un riesgo durante el evento. Primero los servicios sin cuenta (sección 4) |
| Enlace de OpenET `etdata.org` | La página oficial del desafío enlaza `openetdata.org`. Da igual: OpenET solo cubre el oeste de Estados Unidos |
| FAO GAEZ «49 cultivos» | Sin verificar. Lo que importa es si incluye **quinua y haba** |
| MODIS «se retira entre 2026 y 2027» | Sin verificar. MODIS sigue publicando datos (último: 16/10/2026) y VIIRS ya cubre el mismo producto |
| No se mencionan HLS, GIBS, SoilGrids ni el servicio de ORNL | Se añaden: son las vías más rápidas para Arequipa |
| «Landsat 30 m sí permite ver parcelas» | Correcto. HLS lo combina con Sentinel-2 para tener más imágenes sin nubes |

## 9. Siguiente paso propuesto para el área de datos

1. Script de **NDVI MODIS/VIIRS por punto** con el servicio de ORNL, con reintentos, para los dos puntos y desde 2015. Mismo formato que POWER: original, normalizado y procedencia.
2. Script de **SoilGrids** por punto.
3. Crear la **cuenta Earthdata** y probar HLS y SRTM con AppEEARS para una zona pequeña de Majes y otra de Chivay.
4. Verificar si **FAO GAEZ** tiene quinua y haba.
5. Dejar la lista exacta de productos usados en [entrega/referencias.md](../entrega/referencias.md), para el campo *NASA Data*.

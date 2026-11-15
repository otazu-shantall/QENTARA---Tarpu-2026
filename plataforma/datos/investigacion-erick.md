# Análisis Técnico de Recursos: Field Shift — Adapting Farms with NASA Data (2026)

El desafío **"Field Shift: Adapting Farms with NASA Data"** (NASA Space Apps Challenge 2026) busca que los equipos construyan una herramienta de apoyo a la toma de decisiones (aplicación web, mapa interactivo o modelo predictivo) que ayude a los agricultores a elegir **rotaciones de cultivos resilientes** al clima y saludables para el suelo.

El conjunto de recursos oficiales se divide en **dos grandes bloques**:
1. **Datos Globales (Satélites NASA/ESA y Reanálisis):** Sirven para construir modelos aplicables en **cualquier parte del mundo** (incluyendo Latinoamérica).
2. **Datos Terrestres y Estadísticos de EE. UU. (USDA, USGS, OpenET, etc.):** Sirven como **verdad de campo (*ground truth*)** de altísima resolución y contexto económico/agronómico para entrenar o validar algoritmos si enfocas tu piloto en parcelas de Norteamérica.

---

## 1. Ficha Técnica de Satélites y Misiones Espaciales

Los datos de los satélites incluidos en el reto tienen alcances, formatos y restricciones técnicas específicas que debes considerar al diseñar tu solución:

| Misión / Sensor | Agencia | Resolución Espacial | Frecuencia / Revisita | Cobertura Geográfica | Formato de Entrega y Acceso |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SMAP** *(Soil Moisture Active Passive)* | NASA | **9 km** (interpolado) y **36 km** (nativo) | Cada **2 a 3 días** | Global (superficies terrestres no congeladas) | HDF5 / GeoTIFF vía **NASA Earthdata / NSIDC DAAC** |
| **GPM & IMERG** *(Precipitación)* | NASA / JAXA | **0.1° ($10\text{ km} \times 10\text{ km}$)** | Cada **30 minutos** (también diario/mensual) | Global ($60^\circ\text{N}$ a $60^\circ\text{S}$ con mayor precisión; grilla global) | HDF5, NetCDF4, GeoTIFF e imágenes PNG en **NASA Worldview** |
| **Landsat 8 y 9** *(OLI / TIRS)* | NASA / USGS | **30 m** (multiespectral), **15 m** (pancromático), **100 m** (térmico remuestreado a 30 m) | **8 días** combinados (16 días cada satélite) | Global (tierra firme y costas) | Cloud-Optimized GeoTIFF (COG) en **USGS EarthExplorer / AWS** |
| **MODIS** *(Terra y Aqua)* | NASA | **250 m** (rojo/NIR), **500 m** y **1,000 m** | **1 a 2 días** (paso mañana y tarde) | Global | HDF-EOS (grilla sinusoidal) vía **NASA Earthdata / LP DAAC** |
| **VIIRS** *(Suomi-NPP, NOAA-20/21)* | NASA / NOAA | **375 m** (bandas I) y **750 m** (bandas M); productos grillados a **500 m** | **Diaria** | Global | HDF5 / NetCDF4 vía **NASA Earthdata / LANCE** |
| **SRTM** *(Topografía Radar)* | NASA / NGA | **30 m** (1 arco-segundo) y **90 m** (3 arco-segundos) | **Estático** (misión única en febrero de 2000) | Casi global: entre **$60^\circ\text{N}$ y $56^\circ\text{S}$** (~80% de tierra firme) | Archivos `.HGT`, GeoTIFF y NetCDF4 vía **LP DAAC / OpenTopography** |
| **ECOSTRESS** *(En la EEI)* | NASA | **~70 m** ($69\text{ m} \times 38\text{ m}$ en nadir) | Variable (**1 a 5 días**, a distintas horas del día/noche) | Latitudes medias y tropicales: **$51.6^\circ\text{N}$ a $51.6^\circ\text{S}$** | HDF5 / GeoTIFF vía **NASA AppEEARS / LP DAAC** |
| **GEDI** *(Lidar en la EEI)* | NASA / UMD | Huellas láser de **~25–30 m** de diámetro (grillado L4B a **1 km**) | Muestreo por transectos (no es imagen continua) | Entre **$51.6^\circ\text{N}$ y $51.6^\circ\text{S}$** | HDF5 (huellas) y GeoTIFF (grillas) vía **LP DAAC / ORNL DAAC** |
| **Sentinel-2** *(Constelación MSI)* | ESA (Copernicus) | **10 m** (RGB + NIR), **20 m** (Red-Edge + SWIR) y **60 m** | **5 días** (con dos satélites activos) | Global (tierra firme y aguas costeras) | SAFE / JPEG2000 / COG vía **Copernicus Data Space** |

---

## 2. Análisis Detallado por Satélite y Cómo Aprovecharlos en el Reto

### 1. SMAP (Humedad del Suelo)
* **Web oficial:** [NASA SMAP](https://smap.jpl.nasa.gov/) | [Catálogo NASA Earthdata SMAP](https://www.earthdata.nasa.gov/data/platforms/space-based-platforms/smap)
* **Qué mide realmente:** El contenido volumétrico de agua ($\text{m}^3/\text{m}^3$) únicamente en los **primeros 5 cm superficiales del suelo** y el estado de congelamiento/descongelamiento. También existe un producto Nivel 4 que modela la humedad de la zona radicular (hasta 1 m) asimilando modelos hidrológicos.
* **Limitación clave:** Su radar activo falló en julio de 2015, por lo que hoy opera solo con su radiómetro pasivo. Esto significa que **no sirve para ver parcelas individuales pequeñas** (un píxel de 9 km o 36 km abarca cientos de fincas). Úsalo para caracterizar el **contexto hídrico regional o de cuenca** y detectar sequías tempranas antes de que afecten el follaje.

### 2. GPM & IMERG (Lluvia y Eventos Extremos)
* **Web oficial:** [NASA GPM](https://gpm.nasa.gov/) | [Portal de Datos IMERG](https://gpm.nasa.gov/data/imerg)
* **Qué mide realmente:** Combina una constelación internacional de satélites de microondas e infrarrojos para estimar tasa de precipitación ($\text{mm/h}$) y fase (lluvia líquida, nieve, granizo).
* **Cómo entregan la info:** Ofrece tres versiones (*Runs*) según la urgencia y calibración:
  * **Early Run:** disponible a las 4 horas (para alertas rápidas).
  * **Late Run:** a las ~14 horas.
  * **Final Run:** a los ~3.5 meses, calibrado con pluviómetros terrestres (ideal para análisis históricos de más de 20 años y tendencias climáticas).

### 3. Landsat 8/9, MODIS y VIIRS (Salud Vegetal y Fenología)
* **Webs oficiales:** [NASA Landsat](https://science.nasa.gov/mission/landsat/) | [USGS Landsat Data Access](https://www.usgs.gov/landsat-missions/landsat-data-access) | [NASA MODIS](https://terra.nasa.gov/data/modis-data) | [NASA Earthdata VIIRS](https://www.earthdata.nasa.gov/data/instruments/viirs)
* **Qué cubren y diferencias:**
  * **Landsat 8 y 9:** A 30 metros sí permite ver **parcelas agrícolas individuales**, calcular índices como NDVI, EVI o NDWI (estrés hídrico foliar) y detectar cuándo un campo queda en barbecho (suelo desnudo) entre cosechas. Su desventaja son las nubes (si está nublado el día que pasa, pierdes 8 o 16 días de datos).
  * **MODIS y VIIRS:** Tienen píxeles gruesos (250 m a 1 km), pero pasan **todos los días**. Son ideales para construir curvas fenológicas suaves (inicio de siembra, pico verde, cosecha) a nivel distrital o de grandes explotaciones. *Nota técnica:* MODIS (satélites Terra y Aqua) entra en fase de retiro operativo entre finales de 2026 y 2027, por lo que **VIIRS** es su sucesor directo para continuidad.

### 4. ECOSTRESS (Temperatura Superficial y Evapotranspiración)
* **Web oficial:** [NASA JPL ECOSTRESS](https://ecostress.jpl.nasa.gov/) | [NASA Earthdata ECOSTRESS](https://www.earthdata.nasa.gov/data/instruments/ecostress)
* **Qué mide realmente:** Está montado en la Estación Espacial Internacional (EEI) y mide radiación térmica infrarroja a **70 metros**. Genera productos de **Evapotranspiración (ET)** (cuánta agua transpira el cultivo más la que evapora el suelo) y el **Índice de Estrés Evaporativo (ESI)**.
* **Ventaja única:** A diferencia de Landsat o Sentinel-2 (que siempre pasan alrededor de las 10:30 a. m.), la órbita de la EEI no es heliosíncrona, por lo que ECOSTRESS toma datos **a distintas horas de la mañana y la tarde**. Esto detecta el "estrés térmico de mediodía", cuando las plantas cierran sus estomas por calor extremo.
* **Limitación:** No cubre latitudes por encima de $51.6^\circ\text{N}$ o por debajo de $51.6^\circ\text{S}$ (excluye Canadá norte, Escandinavia y Patagonia sur).

### 5. SRTM (Elevación y Pendiente)
* **Web oficial:** [NASA Earthdata SRTM](https://www.earthdata.nasa.gov/data/instruments/srtm) | [OpenTopography SRTM 30m](https://portal.opentopography.org/raster?opentopoID=OTSRTM.082015.4326.1)
* **Qué cubre:** Modelo Digital de Elevación (DEM) de 30 metros obtenido por interferometría de radar. No mide cambios temporales, pero a partir de él calculas **pendiente (*slope*)**, **orientación (*aspect*)** y **acumulación de flujo**. Es indispensable para recomendar cultivos de cobertura o raíces profundas en terrenos inclinados con riesgo de erosión hídrica.

### 6. GEDI (Estructura 3D y Biomasa con Láser)
* **Web oficial:** [NASA Earthdata GEDI](https://www.earthdata.nasa.gov/data/projects/gedi) | [Instrumento GEDI Lidar](https://www.earthdata.nasa.gov/data/instruments/gedi-lidar)
* **Qué cubre:** Un sensor Lidar en la EEI que dispara pulsos láser para medir altura de dosel y biomasa aérea.
* **Limitación para agricultura:** GEDI **no genera mapas continuos** (deja puntos muestreados separados cada 60 m en línea y 600 m entre líneas) y está optimizado para **bosques y vegetación alta**, no para cultivos bajos como trigo o papa. Úsalo solo para evaluar cortinas rompevientos, sistemas agroforestales o bordes boscosos alrededor de las parcelas.

### 7. Copernicus Sentinel-2 (ESA - Socio Espacial)
* **Web oficial:** [Copernicus Data Space Ecosystem](https://dataspace.copernicus.eu/data-collections/copernicus-sentinel-missions/sentinel-2) | [ESA Sentinel Online](https://sentinels.copernicus.eu/copernicus/sentinel-2)
* **Por qué es el mejor aliado:** Ofrece **10 metros de resolución** cada 5 días e incluye 3 bandas de **Borde Rojo (*Red-Edge*)**, diseñadas específicamente para detectar contenido de clorofila y nitrógeno en cultivos mucho antes de que la planta se vea amarilla a simple vista. Es el estándar de oro para agricultura de precisión gratuita.

---

## 3. Links Oficiales de Plataformas, Modelos y Bases Terrestres

Además de los satélites, el reto lista plataformas climáticas y bases de datos agrícolas. Aquí tienes sus enlaces oficiales y su alcance real:

### Modelos Climáticos y Agroecológicos (Cobertura Global)
* **NASA POWER (Agroclimatología):** [Portal Principal](https://power.larc.nasa.gov/) | [Data Access Viewer](https://power.larc.nasa.gov/data-access-viewer/)  
  Entrega series diarias/horarias de temperatura, radiación solar, humedad relativa, viento y precipitación en formato CSV, JSON o NetCDF mediante API REST sin necesidad de registro. Ideal para calcular grados-día de crecimiento (GDD) y riesgo de heladas.
* **NLDAS / GLDAS (Asimilación Terrestre):** [NASA LDAS](https://ldas.gsfc.nasa.gov/gldas/gldas)  
  GLDAS es global (resolución $0.25^\circ$, cada 3 horas) y NLDAS cubre Norteamérica ($0.125^\circ$, horario). Combinan satélites y modelos físicos para dar humedad del suelo en varias capas y flujos de energía en NetCDF/GRIB.
* **ERA5 (Reanálisis ECMWF):** [Copernicus Climate Data Store (CDS)](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview)  
  Reanálisis climático global horario desde 1940 hasta el presente a ~$0.25^\circ$ (~28 km). Excelente para rellenar vacíos históricos donde no hay estaciones meteorológicas.
* **FAO GAEZ (Zonas Agroecológicas Globales):** [FAO GAEZ Portal](https://www.fao.org/gaez/en)  
  Mapas globales de aptitud agroclimática y rendimiento potencial para 49 cultivos principales bajo distintos escenarios de riego y cambio climático.

### Datos Agrícolas, Suelos y Agua (Exclusivos de Estados Unidos)
*Si tu proyecto funciona a nivel global, no puedes depender exclusivamente de estas fuentes porque solo cubren territorio estadounidense, pero son excelentes para entrenar modelos de Machine Learning:*

* **USDA Ag Data Commons:** [https://agdatacommons.nal.usda.gov/](https://agdatacommons.nal.usda.gov/) — Repositorio abierto de investigaciones y datos experimentales agrícolas.
* **USDA Web Soil Survey (WSS):** [https://websoilsurvey.nrcs.usda.gov/](https://websoilsurvey.nrcs.usda.gov/) y bases espaciales **SSURGO / STATSGO2:** [NRCS SSURGO](https://www.nrcs.usda.gov/resources/data-and-reports/soil-survey-geographic-database-ssurgo) — Mapas detallados de textura, pH, materia orgánica y drenaje del suelo.
* **Cropland Data Layer (CDL) / CropScape:** [USDA CroplandCROS](https://croplandcros.scinet.usda.gov/) — Mapa anual a 30 m que identifica exactamente qué cultivo se sembró en cada parcela de EE. UU. (maíz, soya, trigo, algodón, alfalfa, etc.).
* **PRISM Climate Data:** [https://prism.oregonstate.edu/](https://prism.oregonstate.edu/) — Datos climáticos grillados de alta precisión para EE. UU.
* **NAIP (Imágenes Aéreas de 1 metro):** [USDA NAIP GeoHub](https://naip-usdaonline.hub.arcgis.com/) — Fotografía aérea RGB + Infrarrojo a 1 m de resolución.
* **USGS NLCD (Cobertura Terrestre):** [MRLC Consortium](https://www.mrlc.gov/) — Clasificación de uso de suelo a 30 m en EE. UU.
* **CoCoRaHS (Pluviómetros Ciudadanos):** [https://www.cocorahs.org/](https://www.cocorahs.org/) — Mediciones diarias de lluvia/nieve por voluntarios en Norteamérica.
* **USGS NWIS (Aguas Superficiales y Subterráneas):** [Water Data for the Nation](https://waterdata.usgs.gov/) — Caudales de ríos y niveles freáticos en tiempo real.
* **USDA AMS Market News (Precios de Mercado):** [My Market News](https://mymarketnews.ams.usda.gov/) — Precios diarios y demanda de cultivos para evaluar viabilidad económica de la rotación.
* **USDA NASS QuickStats:** [https://quickstats.nass.usda.gov/](https://quickstats.nass.usda.gov/) — Estadísticas históricas de rendimientos y hectáreas sembradas por condado.
* **OpenET (Evapotranspiración por Parcela):** [https://etdata.org/](https://etdata.org/) — Consumo real de agua de los cultivos a 30 m usando modelos ensemble basados en Landsat.
* **USFS LANDFIRE:** [https://www.landfire.gov/](https://www.landfire.gov/) — Capas de vegetación, ecosistemas y modelos de combustible forestal a 30 m.

---

## 4. Recomendación Estratégica para tu Arquitectura

Para destacar en este desafío sin ahogarte descargando terabytes de imágenes crudas:

1. **Usa APIs y plataformas en la nube:** Accede a **Sentinel-2**, **Landsat**, **SRTM**, **MODIS** y **GPM** directamente mediante **Google Earth Engine (GEE)**, **Microsoft Planetary Computer** o **NASA AppEEARS**, y consume **NASA POWER** vía su API JSON.
2. **Combina escalas correctamente:**
   * **Sentinel-2 (10 m)** o **Landsat (30 m):** Delimitar la parcela y ver el historial de rotación (NDVI/NDWI).
   * **ECOSTRESS (70 m):** Detectar estrés hídrico y térmico puntual.
   * **SRTM (30 m):** Calcular pendiente y riesgo de erosión.
   * **NASA POWER + GPM + SMAP:** Modelar el balance hídrico y climático regional.
3. **Define el alcance geográfico:**
   * **Piloto en EE. UU.:** Te permite cruzar automáticamente el historial real de cultivos (**USDA CDL**) y tipos de suelo (**SSURGO**) con las observaciones de NASA.
   * **Piloto Global / Latinoamérica:** Apóyate en **Sentinel-2 + Landsat + NASA POWER + GPM + SMAP + SRTM + FAO GAEZ** (todos con cobertura global).
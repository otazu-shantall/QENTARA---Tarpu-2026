# T03 · 2. Diccionario de variables

> **Área:** datos (Damaris). **Tarea:** [README.md](README.md), §3.2. **Estado:** borrador para revisar con Erick, 15/11/2026.
> Escrito con asistencia de IA (Claude Code); declarado en [entrega/uso-de-ia.md](../../../entrega/uso-de-ia.md).
>
> **Qué es:** cada variable que TARPU extrae hoy, con su unidad, conversión, relleno, rango, tipo, qué dice y qué no dice, y de qué archivo y campo sale cada dato. Es diseño: no cambia `backend/`.
>
> **Usa del [modelo lógico](modelo-logico.md):** los motivos de vacío (§4.1) y los identificadores de celda (§3). **Los indicadores** que salen de estas variables están en [agregaciones.md](agregaciones.md).

## Cómo leerlo

**Marcas de evidencia**, en cada celda que lo necesite:
- **✔** Verificado con datos: leído en un archivo de `trabajo/…/salida/` o `cache/`.
- **📘** Documentación del proveedor guardada en un archivo: metadatos de `/bands`, `request.json`, `metadata.xml` o el `README.md` de AppEEARS.
- **⚙** Según el código; no verificado con datos.
- **❓** Pendiente de verificar. Va a la lista del §11.

**Abreviaturas de rutas:**
- **T01** = `trabajo/T01-paquete-extraccion/salida/`
- **AppE** = `trabajo/extraccion_pesada/salida/`
- **inv** = `backend/investigacion/`
- **cat** = `backend/catalogo/`

**Lugar de las cifras:** salvo que se diga otra cosa, son de S2 (`valle_s2`). La estructura de los archivos es la misma en los tres lugares.

**Tipos:** **continua** (un valor numérico con unidad) o **categórica** (un código con etiqueta).

---

## 1. NASA POWER (API diaria)

- **Producto:** NASA/POWER *Source Native Resolution Daily Data*, POWER Daily API v2.10.3; fuentes `MERRA2`, `SYN1DEG` y `POWER` ✔ (T01 `power_chivay_20150101_20251231.original.json`, `header.title`, `header.api.version`, `header.sources`).
- **Escala:** meteorología en celdas de ½° × ⅝°; radiación en celdas de 1° × 1° 📘 (`datos/power/README.md`, tabla de resolución, con enlace a la documentación de POWER). Qué variables van en cada rejilla, además de `ALLSKY_SFC_SW_DWN`: ❓ (V-D01).
- **Celda:** modelo lógico §3. Chivay y S2 comparten celda: `cell_elevation_m` 4351,89 en las dos procedencias, y series idénticas en las 19 variables ✔ (agregaciones §3).
- **Frecuencia:** diaria. Período de T01: 2015-01-01 a 2025-12-31, 4018 días ✔ (`header.start`, `header.end`).
- **Hora:** `header.time_standard` = `LST` ✔.
- **Relleno:** −999.0 para todas las variables ✔ (`header.fill_value`; también `fill_value` de la procedencia). La documentación de POWER no lo publica, por eso se lee de cada respuesta (`datos/power/README.md`).
- **Rango válido:** la respuesta no publica ninguno ❓ (V-D02).
- **Vacío:** `relleno_del_proveedor`. Texto actual: «{variable}: {n} días con relleno {relleno}» (modelo lógico §4.2).
- **Conversión:** ninguna. El normalizado copia el valor y la unidad de la respuesta ✔: la cabecera de `power_*.normalizado.csv` repite `parameters.<VAR>.units`.
- **Nivel:** original (`.original.json`), normalizado (`.normalizado.csv`) y procedencia.
- **Latencia:** según el README de T03 (§3.2), PAR y nubosidad solo llegan hasta el 30/08/2026 en la base de Arequipa ⚙. No se verificó con datos, porque `backend/almacen/` no está en esta computadora (V-03).
- **Pantallas:** 5 (I01 a I06), 6 (motor) y 8 (datos detallados).
- **Fuente del nombre y la unidad de cada fila:** T01 `power_chivay_20150101_20251231.original.json`, campos `parameters.<VAR>.longname` y `parameters.<VAR>.units`.

| Variable | Qué dice (`longname`) ✔ | Unidad del proveedor ✔ | Unidad final | Factor | Relleno | Rango válido | Tipo | Qué no dice |
|---|---|---|---|---|---|---|---|---|
| `T2M` | Temperature at 2 Meters | C | °C | ninguno | −999.0 | ❓ | continua | No es la temperatura de la parcela: es la media de una celda de ½° × ⅝° |
| `T2M_MAX` | Temperature at 2 Meters Maximum | C | °C | ninguno | −999.0 | ❓ | continua | Ídem |
| `T2M_MIN` | Temperature at 2 Meters Minimum | C | °C | ninguno | −999.0 | ❓ | continua | Bajo 0 °C no es un diagnóstico de helada sobre el cultivo (`indicadores.py`) |
| `T2M_RANGE` | Temperature at 2 Meters Range | C | °C | ninguno | −999.0 | ❓ | continua | Que sea máx − mín del día ❓ (V-D03) |
| `PRECTOTCORR` | Precipitation Corrected | mm/day | mm/día | ninguno | −999.0 | ❓ | continua | No es IMERG: es la precipitación corregida de MERRA-2 (`datos/power/README.md`). Lluvia regional, no la de la parcela |
| `RH2M` | Relative Humidity at 2 Meters | % | % | ninguno | −999.0 | ❓ | continua | Humedad del aire de la celda, no la del suelo |
| `T2MDEW` | Dew/Frost Point at 2 Meters | C | °C | ninguno | −999.0 | ❓ | continua | No dice si hubo rocío o escarcha en la parcela |
| `FROST_DAYS` | Frost Days | Days | días | ninguno | −999.0 | ❓ | continua ❓ | La definición de POWER no está leída (V-D04). No se usa como «helada» |
| `ALLSKY_SFC_SW_DWN` | All Sky Surface Shortwave Downward Irradiance | MJ/m^2/day | MJ/m²/día | ninguno | −999.0 | ❓ | continua | Celda de 1° × 1° (`datos/power/README.md`), más grande que la de temperatura |
| `ALLSKY_SFC_PAR_TOT` | All Sky Surface Total PAR | MJ/m^2/day | MJ/m²/día | ninguno | −999.0 | ❓ | continua | Rejilla ❓ (V-D01). Latencia: ver arriba |
| `CLOUD_AMT` | Cloud Amount | % | % | ninguno | −999.0 | ❓ | continua | Rejilla ❓ (V-D01). No dice si había nubes sobre la parcela al pasar un satélite |
| `WS2M` | Wind Speed at 2 Meters | m/s | m/s | ninguno | −999.0 | ❓ | continua | Viento de la celda, no el de un valle o una ladera |
| `GWETTOP` | Surface Soil Wetness | 1 | sin unidad («1») | ninguno | −999.0 | ❓ | continua | Es una variable de modelo de la celda, no un análisis de suelo. La unidad «1» no tiene definición leída ❓ (V-D05) |
| `GWETROOT` | Root Zone Soil Wetness | 1 | sin unidad («1») | ninguno | −999.0 | ❓ | continua | Ídem |
| `GWETPROF` | Profile Soil Wetness | 1 | sin unidad («1») | ninguno | −999.0 | ❓ | continua | Ídem |
| `TSOIL1` | Soil Temperatures Layer 1 | C | °C | ninguno | −999.0 | ❓ | continua | Profundidad de la capa ❓ (V-D06). No es una medición en la parcela |
| `TSOIL2` | Soil Temperatures Layer 2 | C | °C | ninguno | −999.0 | ❓ | continua | Ídem |
| `TS_MIN` | Earth Skin Temperature Minimum | C | °C | ninguno | −999.0 | ❓ | continua | Temperatura de la superficie, no del aire: no es comparable con `T2M_MIN` |
| `EVLAND` | Evaporation Land | mm/day | mm/día | ninguno | −999.0 | ❓ | continua | No es el agua que necesita un cultivo (ETc = Kc × ETo, agregaciones §6) |

## 2. MODIS por ORNL (MOD13Q1, MOD16A2GF, MOD11A2 y MCD12Q1)

- **Servicio:** ORNL DAAC *MODIS/VIIRS Land Product Subsets* ✔ (T01 `mod13q1_valle_s2_…procedencia.json`, `source_id`).
- **Celda:** (producto, `xllcorner`, `yllcorner`) de la respuesta (modelo lógico §3). Tesela `h11v10` en los tres lugares ✔ (`detalle.csv`, columna `tesela`).
- **Conversión:** «value = raw * scale_factor (from /bands); fill or out of valid_range ⇒ empty. Categorical bands (quality, land cover) keep the raw class code» ✔ (procedencia, campo `conversion`).
- **Vacíos:**
  - `relleno_del_proveedor` y `fuera_de_rango_valido`. El texto actual, «{banda}: {n} fechas sin valor válido», junta los dos; se separan con el crudo de `.detalle.csv` (modelo lógico §4.2);
  - `fecha_ausente`: el 16/10/2022 en MOD11A2 (V-09);
  - `calidad_no_valida` para NDVI, según la propuesta de agregaciones I07.
- **Nivel:**
  - original (`.original.json`);
  - normalizado (`.normalizado.csv`, valor convertido);
  - detalle (`.detalle.csv`, crudo, calidad o clase, tesela);
  - procedencia.
- **Pantallas:** 5 (I07, I09 a I11) y 8.
- **Fuente de unidad, factor, relleno y rango de cada fila:** T01 `<producto>_valle_s2_…procedencia.json`, campo `bands.<banda>` (`units`, `scale_factor`, `fill_value`, `valid_range`) 📘. Son los metadatos de `/bands` de ORNL, guardados en la procedencia.

| Variable | Producto · píxel ✔ (`cellsize_m`) · frecuencia | Unidad del proveedor 📘 | Unidad final | Factor 📘 | Relleno 📘 | Rango válido 📘 | Tipo | Qué dice | Qué no dice |
|---|---|---|---|---|---|---|---|---|---|
| `250m_16_days_NDVI` | MOD13Q1 · 231,66 m · 16 días; 272 fechas, 2015-01-01 a 2026-10-16 ✔ (`dates_returned`) | NDVI ratio - No units | sin unidad | 0.0001 | −3000 | −2000 a 10000 | continua | «16 day NDVI average» 📘 (`description`) | No mide fertilidad (AGENTS.md §6). Un píxel de 231 m mezcla varias parcelas (`datos/ndvi/README.md`) |
| `250m_16_days_pixel_reliability` | MOD13Q1 · ídem | rank | código | — | −1 | 0 a 3 | categórica | 0 bueno · 1 marginal · 2 nieve o hielo · 3 nubes (`ornl.py:40`, guía de MOD13). La guía define el 3 como «Cloudy: target not visible, covered with cloud» (`datos/ndvi/README.md`) | En el punto urbano de Majes, la marca «nubes» no está contrastada (`datos/ndvi/README.md`, límites) |
| `ET_500m` | MOD16A2GF · 463,31 m · 8 días; 506 compuestos, 2015–2025 ✔ | kg/m^2/8day | kg/m²/8 días | 0.1 | 32767 | −32767 a 32700 | continua | «Evapotranspiration» 📘 | No es el agua que necesita un cultivo. Mostrar kg/m² como mm necesita cita (V-A06). Valores de 32701 a 32766: significado ❓ (V-A05) |
| `PET_500m` | MOD16A2GF · ídem | kg/m^2/8day | kg/m²/8 días | 0.1 | 32767 | −32767 a 32700 | continua | «Potential evapotranspiration» 📘 | Ídem |
| `LST_Day_1km` | MOD11A2 · 926,63 m · 8 días; 505 compuestos, 2015–2025 ✔ | Kelvin | K (en pantalla, °C = K − 273,15, definición del SI) | 0.02 | 0 | 7500 a 65535 | continua | «Daytime Land Surface Temperature» 📘 | Es la superficie, no el aire: no se compara con `T2M` |
| `LST_Night_1km` | MOD11A2 · ídem | Kelvin | ídem | 0.02 | 0 | 7500 a 65535 | continua | «Night Land Surface Temperature» 📘 | No es una helada sobre el cultivo. Contar «bajo 0 °C» lo decide el equipo (V-A07) |
| `LC_Type1` | MCD12Q1 · 463,31 m · anual; 10 años, 2015–2024 ✔ | class | código IGBP + etiqueta | — | 255 | 1 a 17 | categórica | «Land Cover Type 1: Annual International Geosphere-Biosphere Programme (IGBP) classification» 📘. Etiquetas en `ornl.py:42` (Sulla-Menashe y Friedl, 2018). S2: clase 10, «Grasslands», los 10 años ✔ | Clasifica un píxel de 463 m. No dice qué cultivo hay en la parcela |

## 3. HLS L30 y S30 (AppEEARS, por punto)

- **Producto:**
  - `HLSL30_VI.020` y `HLSS30_VI.020`, capa `NDVI` ✔ (AppE `hls_*_puntos/…-request.json`, `params.layers`);
  - cita 📘: Neigh, C. (2025), *HLS … Vegetation Indices Daily Global 30m v2.0*, LP DAAC (`…-metadata.xml`).
- **Píxel:** 30 m 📘 (`…-metadata.xml`, `gmd:spatialResolution`).
- **Celda:** (`HLS_Tile`, píxel). La fila y la columna del píxel no vienen en el CSV ❓ (V-B04). En Majes riego y Chivay, **dos teselas por fecha**; en S2, una (agregaciones I08).
- **Fechas:** de 2025-01-03 a 2026-10-30, según el lugar y el sensor ✔ (`…-results.csv`, `Date`).
- **Vacíos:**
  - −19999.0 se trata como vacío; que sea el relleno documentado ❓ (V-B01);
  - sin capa de calidad en la descarga, así que no se puede asignar `calidad_no_valida` ❓ (V-B02).
- **Pantallas:** 5 (I08) y 8.

| Variable | Unidad del proveedor | Unidad final | Factor | Relleno | Rango válido | Tipo | Qué dice | Qué no dice | Fuente del dato |
|---|---|---|---|---|---|---|---|---|---|
| `HLSL30_VI_020_NDVI` | ❓ (V-B05) | sin unidad ❓ | ya escalado: AppEEARS extrae «scaled data values» 📘 | −19999.0 observado ✔; documentado ❓ | ❓; observado de 0,0455 a 0,8489 ✔ | continua | NDVI de 30 m del sensor OLI (Landsat) 📘 (título de la cita) | No mide fertilidad. Sin la capa de calidad no distingue una observación con nubes. Si el punto cae en dos teselas, los valores pueden diferir | AppE `hls_landsat_puntos/tarpu-hls-landsat-puntos-HLSL30-VI-020-results.csv`, columna `HLSL30_VI_020_NDVI`; escala en `README.md`, línea 72 |
| `HLSS30_VI_020_NDVI` | ❓ (V-B05) | sin unidad ❓ | ídem 📘 | −19999.0 observado ✔; documentado ❓ | ❓; observado de −0,0109 a 0,8837 ✔ | continua | NDVI de 30 m del sensor MSI (Sentinel-2) 📘 | Ídem. No se mezcla con L30 sin una regla citada (V-B03) | AppE `hls_sentinel_puntos/tarpu-hls-sentinel-puntos-HLSS30-VI-020-results.csv`, columna `HLSS30_VI_020_NDVI` |

## 4. SMAP (AppEEARS, por punto)

- **Producto:**
  - **L3E:** `SPL3SMP_E.006`, pasada AM; cita 📘: O'Neill, P., et al. (2023), *SMAP Enhanced L3 Radiometer Global and Polar Grid Daily 9 km* (`smap_l3_puntos/…-metadata.xml`);
  - **L4:** `SPL4SMGP.008`; cita 📘: Reichle, R., et al. (2025), *SMAP L4 Global 3-hourly 9 km EASE-Grid Surface and Root Zone Soil Moisture* (`smap_l4_puntos/…-metadata.xml`).
- **Celda:** 9 km 📘 (`gmd:spatialResolution`, 9000 m), identificada por (`Line_Y`, `Sample_X`). Es la misma en L3E y L4: Majes riego (1040, 1154), Chivay (1030, 1161) y S2 (1030, 1156) ✔.
- **Fechas:**
  - **L3E:** diaria, de 2025-01-01 a 2026-10-31, con 667 de 669 días. Faltan el 18/03/2025 y el 18/10/2026 en los tres lugares ✔ (`Date`), que son `fecha_ausente`.
  - **L4:** cada 3 h, 5352 valores por lugar y capa, sin huecos ✔.
- **Pantallas:** 5 (I16 e I17) y 8.

| Variable | Producto | Unidad del proveedor | Unidad final | Factor | Relleno | Rango válido | Tipo | Qué dice | Qué no dice | Fuente del dato |
|---|---|---|---|---|---|---|---|---|---|---|
| `Soil_Moisture_Retrieval_Data_AM_soil_moisture` | L3E | ❓ (V-A11) | ❓ | ya escalado 📘 (`README.md`, línea 72) | −9999.0 ✔ (417 de 667 días en cada lugar, siempre con bandera 7) | ❓ | continua | Humedad del suelo estimada por radiómetro, pasada AM 📘 | No es un análisis de suelo (AGENTS.md §6). Describe una celda de 9 km | AppE `smap_l3_puntos/tarpu-smap-l3-puntos-SPL3SMP-E-006-results.csv`, columna `SPL3SMP_E_006_Soil_Moisture_Retrieval_Data_AM_soil_moisture` |
| `Soil_Moisture_Retrieval_Data_AM_retrieval_qual_flag` | L3E | bandera (número) | código + descripciones | — | — | ❓ | categórica | Valor de la bandera y, en columnas aparte, su descripción en texto según AppEEARS: «…has recommended quality», «…was attempted», «…was successful», estado de congelamiento ✔ | La descripción es del proveedor. Decidir qué valores entran es decisión de TARPU (agregaciones I16) | Ídem, columna `…_AM_retrieval_qual_flag` y sus columnas `…_Description` |
| `Geophysical_Data_sm_surface` | L4 | ❓ (V-B06) | ❓ | ya escalado 📘 | ❓; ningún negativo ni −9999 en los datos ✔ | ❓; observado de 0,0244756 a 0,2925797 ✔ | continua | Humedad superficial modelada, cada 3 h 📘 (título de la cita) | Es modelada, no observada. No es un análisis de suelo | AppE `smap_l4_puntos/tarpu-smap-l4-puntos-SPL4SMGP-008-results.csv`, columna `SPL4SMGP_008_Geophysical_Data_sm_surface` |
| `Geophysical_Data_sm_rootzone` | L4 | ❓ (V-B06) | ❓ | ya escalado 📘 | ❓; ídem ✔ | ❓; observado de 0,0219102 a 0,264301 ✔ | continua | Humedad de la zona de raíz modelada, cada 3 h 📘 | Ídem. La profundidad de la «zona de raíz» ❓ (V-B06) | Ídem, columna `SPL4SMGP_008_Geophysical_Data_sm_rootzone` |

## 5. NASADEM (relieve)

- **Producto:** `NASADEM_NC.001`; cita 📘: NASA JPL (2020), *NASADEM Merged DEM Global 1 arc second nc V001*, LP DAAC (AppE `relieve_3_zonas/tarpu-relieve-3-zonas-NASADEM-NC-001-metadata.xml`).
- **Píxel:** 30 m 📘 (`gmd:spatialResolution`). En la cabecera del GeoTIFF, 1/3600° ✔ (`…_aid0002.tif`, escala 0,000277…).
- **Celda:** (tesela, fila, columna) (modelo lógico §3).
- **Fecha:** `2000-02-11` ✔ (`NASADEM-NC-001-Statistics.csv`, columna `Date`).
- **Relleno:** nodata −32768 en la cabecera del GeoTIFF ✔ (`…_aid0002.tif`, leído con `_cabecera` de `leer.py`). Su motivo es `nodata_del_raster`.
- **En la base de Arequipa:** 20 teselas `.hgt` ⚙ (`backend/almacen/`, no verificado).
- **Pantallas:** 5 (I13 e I14), mapa y 8.

| Variable | Unidad del proveedor | Unidad final | Factor | Relleno | Rango válido | Tipo | Qué dice | Qué no dice | Fuente del dato |
|---|---|---|---|---|---|---|---|---|---|
| `NASADEM_HGT` | ❓ en los archivos de AppEEARS; «Elevation» 📘 | m ⚙ (`altitud_m` en `leer.py`) | ninguno ✔ (el píxel del punto de S2 vale 2663, igual que la cifra en metros de `PLAN-PLATAFORMAS-Y-COORDENADA.md:42`) | −32768 ✔ | ❓; observado de 2016 a 4416 en la zona de S2 ✔ | continua | Altitud del terreno en un píxel de 30 m | Describe la superficie de febrero de 2000. El 2663 de S2 es de ese píxel, en ladera, no de una chacra (V-07) | AppE `relieve_3_zonas/NASADEM_NC.001_NASADEM_HGT_doy2000042000000_aid0002.tif`; estadísticas en `NASADEM-NC-001-Statistics.csv` (`Minimum`, `Maximum`) |
| `NASADEM_NUM` | código | código + fuente | — | ❓ | ❓ | categórica | De qué fuente sale la altitud de cada píxel, según la tabla `Value`/`Source` (ej. 1 = SRTM (1); 42 = PRISM (2)) ✔ | Los códigos no son una medida de calidad: su significado más allá del nombre de la fuente ❓ (V-D07) | AppE `relieve_3_zonas/NASADEM-NUMNC-001-NASADEM-NUM-lookup.csv` y `NASADEM_NUMNC.001_NASADEM_NUM_…tif` |
| Pendiente (derivada) | — | % | Horn (1981), 3 × 3 📘 | sin pendiente si falta un vecino ⚙ | — | continua | Pendiente por píxel; clase FAO (2006), cuadro 7 (`leer.py:31-33`) | No es aptitud para un cultivo. Límites de las clases ❓ (V-A01) | `backend/tarpu_datos/base/leer.py` (`_relieve_parcela`); método en inv `relieve_erosion_rotacion_2026-11-15.json:5-6` |

## 6. SoilGrids (ISRIC)

- **Producto:** ISRIC SoilGrids 2.0, WCS y REST ✔ (T01 `soilgrids_valle_s2.procedencia.json`, `source_id`).
- **Píxel:**
  - 250 m ✔ (procedencia, `resolution`);
  - en la base, ≈ 250 m (0,00225°) ⚙ (cat `base_arequipa.json`, `soilgrids.resolucion`).
- **Celda:** (archivo, fila, columna) (modelo lógico §3).
- **Profundidades:** 0–5, 5–15 y 15–30 cm ✔ (T01 `soilgrids_valle_s2.largo.csv`, `profundidad`).
- **Estadísticos:**
  - en T01, media, Q0,05, Q0,5 y Q0,95 ✔ (`.largo.csv`);
  - en la base, media, Q0,05 y Q0,95 ⚙.
- **Conversión:** valor = entero / `d_factor`, según `unit_conversion` de la procedencia: «normalized = mapped integer / d_factor (d_factor read from SoilGrids REST unit_measure)».
- **Fuente de los 11 factores** ✔: `trabajo/T01-paquete-extraccion/salida/soilgrids_valle_s2.procedencia.json`, campo `units.<prop>` (`mapped_units`, `target_units`, `d_factor` y `origen`). Está en git, y es la fuente que cita esta tabla. `cat soilgrids_unidades.json` es una copia de esos valores.
- **Origen que registra ese mismo campo** (solo como origen, no como fuente de esta tabla):
  - `phh2o`, `clay`, `sand` y `soc`: «procedencia REST guardada», en `trabajo/T01-paquete-extraccion/referencia/muestras/soilgrids_chivay.procedencia.json` (consulta del 14/11/2026);
  - `silt`, `nitrogen`, `cec`, `bdod`, `cfvo`, `wv0033` y `wv1500`: «consulta REST», guardada en `trabajo/T01-paquete-extraccion/cache/soilgrids/rest_factores_silt-nitrogen-cec-bdod-cfvo-wv0033-wv1500.json`, que git ignora.
- **Vacíos:** `nodata_del_raster` («sin predicción en el píxel (nodata)», `soilgrids.py`). Donde no hay predicción (mar, agua, zonas urbanas o roca), la REST devuelve `null` (`datos/soilgrids/README.md`, Faltantes). El valor nodata del GeoTIFF ❓ (V-D08).
- **Rango válido:** no publicado en los archivos ❓ (V-D09).
- **Fecha:** estático (predicción). Su columna `fecha` va vacía a propósito ✔ (procedencia, `fecha_column_note`).
- **Pantallas:** 5 (I12), 6 y 8.
- **Fuente de unidades y factor de cada fila:** T01 `soilgrids_valle_s2.procedencia.json`, `units.<prop>.mapped_units`, `target_units` y `d_factor` ✔. Valores en T01 `soilgrids_valle_s2.largo.csv`.

| Variable | Unidad del proveedor ✔ | Unidad final ✔ | Factor (`d_factor`) ✔ | Relleno | Rango válido | Tipo | Qué dice | Qué no dice |
|---|---|---|---|---|---|---|---|---|
| `phh2o` | pH*10 | - (pH) | 10 | null o nodata | ❓ | continua | pH predicho (en agua, por el nombre `h2o`; el método ❓ V-D10) | Es una predicción a 250 m, no un análisis de suelo. Sin clases mientras no haya cita |
| `clay` | g/kg | % | 10 | ídem | ❓ | continua | Arcilla predicha | La textura no se evalúa: `sin_regla` (inv `metodos_citados_…json`, `textura`) |
| `sand` | g/kg | % | 10 | ídem | ❓ | continua | Arena predicha | Ídem |
| `silt` | g/kg | % | 10 | ídem | ❓ | continua | Limo predicho | Ídem |
| `soc` | dg/kg | g/kg | 10 | ídem | ❓ | continua | Carbono orgánico predicho | Incertidumbre muy alta en Majes y Chivay: no sirve para afirmar la fertilidad (`datos/soilgrids/README.md`, límites) |
| `nitrogen` | cg/kg | g/kg | 100 | ídem | ❓ | continua | Nitrógeno predicho | No es una dosis de abono ni un análisis |
| `cec` | mmol(c)/kg | cmol(c)/kg | 10 | ídem | ❓ | continua | Capacidad de intercambio catiónico predicha (nombre ❓ V-D10) | Ídem |
| `bdod` | cg/cm³ | kg/dm³ | 100 | ídem | ❓ | continua | Densidad aparente predicha (nombre ❓ V-D10) | Ídem |
| `cfvo` | cm³/dm³ | cm³/100cm³ | 10 | ídem | ❓ | continua | Fragmentos gruesos, en volumen (nombre ❓ V-D10) | Ídem |
| `wv0033` | (10-2 cm³/cm³)*10 | 10-2 cm³/cm³ | 10 | ídem | ❓ | continua | Contenido de agua a 33 kPa, por el código (nombre ❓ V-D10) | No es la humedad actual del suelo |
| `wv1500` | (10-2 cm³/cm³)*10 | 10-2 cm³/cm³ | 10 | ídem | ❓ | continua | Contenido de agua a 1500 kPa, por el código (nombre ❓ V-D10) | Ídem |
| `<prop>_uncertainty` | entero del proveedor; `uncertainty_unit` vacío ✔ (`rest_factores_…json`) | — (no se convierte) | ❓ (V-06) | — | ❓ | continua | **No es un vacío:** se guarda el entero sin convertir, con el motivo `sin_verificar` (modelo lógico §4.1). S2, pH 0–5 cm: 5 ✔ (`.largo.csv`) | Su significado no está verificado. El README de T01 (§9.4) da una equivalencia como indicio, no como cita |

## 7. FAO GAEZ v4 (aptitud)

- **Producto:** FAO GAEZ v4, servicio `res05` *ImageServer*, *Suitability Index*, 1981–2010, insumos altos ✔ (T01 `gaez_valle_s2.procedencia.json`, `source_id`, `product_id`, `period`, `input_level`; cat `base_arequipa.json:7-9`).
- **Celda:** 0,0833° (≈ 9 km). La clave es la capa (`objectid`) más la fila y la columna (modelo lógico §3).
- **Capas:** 100 de 190, las que empiezan por «Suitability index» (T01 `cache/gaez/query_Alfalfa-…json`, `response.features[].attributes`).
  - **«su…» = «current cropland in grid cell»:** 70 capas;
  - **«sx…» = «all land in grid cell»:** 30 capas.
- **Tipos de agua** ✔ (`attributes.water_supply`): `Rainfed`, `Rainfed All Phases`, `Gravity Irrigation`, `Sprinkler Irrigation`, `Irrigation` y `Drip Irrigation`.
- **Cultivos:** 15 ✔ (`attributes.crop`).
- **Vacíos:** `fallo_de_descarga` o valor no numérico (`gaez.py`).
- **Pantallas:** 5 (I18), 6 y 8.

| Variable | Unidad del proveedor | Unidad final | Factor | Relleno | Rango válido | Tipo | Qué dice | Qué no dice | Fuente del dato |
|---|---|---|---|---|---|---|---|---|---|
| `su<agua>_<cultivo>` (ej. `suHi_wpo`) | índice ✔ | índice 0–10 000 | ninguno | ❓ | 0 a 10 000 📘 (texto de `variable`: «Suitability index range (0 – 10000)») | continua | Aptitud del cultivo con ese tipo de agua, en la tierra **cultivada actualmente** de la celda, clima de 1981–2010 | No es la aptitud de la parcela. Sin clases (V-A10). **Capas distintas de 0, de 100** ✔ (recontado en T01 `gaez_<lugar>.normalizado.csv`): S2, **0** (100 en 0, 0 vacías); Chivay, **0** (100 en 0, 0 vacías); Majes riego, **26** (74 en 0). Si el 0 es aptitud nula o zona no evaluada: V-04 | T01 `gaez_<lugar>.normalizado.csv` (una columna por capa); `cache/gaez/<lugar>/identify_<objectid>.json`, `response.value` |
| `sx<agua>_<cultivo>` (ej. `sxHr_oat`) | índice ✔ | índice 0–10 000 | ninguno | ❓ | ídem 📘 | continua | Ídem, en **toda la tierra** de la celda | Ídem | Ídem |

## 8. Horas de luz (cálculo, sin red)

- **Método:** FAO-56, cap. 3, ec. 24, 25 y 34 📘 (T01 `luz_valle_s2_20150101_20251231.procedencia.json`, `citation`).
- **Celda:** sin rejilla, depende de la latitud (modelo lógico §3).
- **Período:** 2015-01-01 a 2025-12-31, 4018 días ✔ (`days`).
- **Vacíos:** `missing_days_polar` vacío ✔.
- **Pantallas:** 5 (I15) y 8.

| Variable | Unidad | Unidad final | Factor | Relleno | Rango válido | Tipo | Qué dice | Qué no dice | Fuente del dato |
|---|---|---|---|---|---|---|---|---|---|
| `N` | h ✔ (`units.N`) | h | — | — | físico, según la latitud; en S2 de 11,0724 a 12,9275 ✔ (`min.N_h`, `max.N_h`) | continua | Duración astronómica del día | «ignores clouds, slope and horizon» ✔ (`note`): no son horas de sol medidas | T01 `luz_valle_s2_…normalizado.csv`, columna `N (h)` |
| `dia_del_anio` | J ✔ (`units.dia_del_anio`) | día del año | — | — | 1 a 366 | categórica (índice) | El día usado en la ecuación | — | Ídem, columna `dia_del_anio (J)` |

## 9. IV CENAGRO 2012 (INEI) y sectores

- **Producto:** IV Censo Nacional Agropecuario 2012, microdatos `2012.zip`, Plataforma Nacional de Datos Abiertos 📘 (inv `relieve_erosion_rotacion_…json`, `cenagro_2012`).
- **Unidad:** la unidad agropecuaria, con coordenadas del **sector de enumeración**, no de la chacra (`backend/PLAN-PLATAFORMAS-Y-COORDENADA.md:42`; inv `cenagro2012_arequipa_por_codigo.json`, `advertencias`).
- **Datos:** `base_arequipa/cenagro2012/` no está en esta computadora ⚙ (V-03). Lo verificable está en `inv`.
- **Pantallas:** 6 (cultivos por sector) y 8.

| Variable | Unidad | Unidad final | Factor | Relleno | Rango válido | Tipo | Qué dice | Qué no dice | Fuente del dato |
|---|---|---|---|---|---|---|---|---|---|
| `WALTITUD` | ❓ (por el nombre, metros; V-D11) | ❓ | — | ❓ | ❓ | continua | Altitud (REC01) | Se repite dentro de un mismo sector de enumeración: no es la altitud de la chacra (inv `cenagro2012_arequipa_por_codigo.json`, `advertencias`) | inv `relieve_erosion_rotacion_…json`, `cenagro_2012.registro_01` |
| `WPISO` | código | código + nombre | — | ❓ | 1 a 9 📘 | categórica | Piso altitudinal: 1 Costa o chala, 2 Yunga fluvial, 3 Quechua, 4 Suni, 5 Puna, 6 Janca, 7 Rupa Rupa, 8 Omagua, 9 Yunga marítima | No es un sector de TARPU: los sectores agrupan pisos (DT-18) | cat `sectores.json`, `fuentes.pisos` |
| `LAT_DECI`, `LONG_DECI` | ❓ (por el nombre, grados decimales; V-D11) | ❓ | — | ❓ | ❓ | continua | Coordenadas del registro | Son del sector de enumeración, no de una chacra (S2: ladera, V-07) | inv `relieve_erosion_rotacion_…json`, `cenagro_2012.registro_01` |
| Superficie sembrada por cultivo y piso | ❓ (V-D11) | ❓ | — | — | — | continua | Suma por cultivo y piso en Arequipa (REDATAM) | Los códigos de cultivo de REC02 no tienen nombre sin la «Tabla de Cultivos» del INEI (`advertencias`) | inv `cenagro2012_arequipa_cultivos_por_sector.json`, `cultivos` |
| Sector (S1, S2, S3) (derivado) | — | código | — | `sin_dato` fuera de 0 a 4800 m ⚙ (`leer.py`, `sector`) | S1 a S3 | categórica | Sector de TARPU por la altitud (DT-18), con sus pisos del INEI | Es de uso interno: el usuario ve un mapa normal (`sectores.json`, `descripcion`) | cat `sectores.json`; `leer.py` (`sector`) |

## 10. Lo que no entra en este diccionario
- **Indicadores derivados** (I01 a I18): en [agregaciones.md](agregaciones.md).
- **Datos declarados** por el agricultor: en el modelo lógico, E02, y en `backend/contrato/esquemas/ContextoEntrada.json`.
- **Imágenes HLS de Chivay:** descargadas (commit `d41da14`), pero **todavía no se usan** en ningún indicador. Su estructura ✔:

  | | `img_chivay_landsat/` | `img_chivay_sentinel/` |
  |---|---|---|
  | Producto y capa (`…-request.json`, `params.layers`) | `HLSL30_VI.020`, `NDVI` | `HLSS30_VI.020`, `NDVI` |
  | Área pedida (`params.geo`) | rectángulo de −71,645 a −71,555 de longitud y de −15,685 a −15,595 de latitud | el mismo |
  | Período pedido (`params.dates`) | 2026-08-01 a 2026-10-31 | el mismo |
  | Proyección de salida (`params.output.projection`) | `geographic` | `geographic` |
  | Archivos en la carpeta | 27: 22 GeoTIFF y 5 de AppEEARS (`Statistics.csv`, `README.md`, `metadata.xml`, `granule-list.txt`, `request.json`) | 59: 54 GeoTIFF y los mismos 5 |
  | Fechas con imagen (`…-Statistics.csv`, columna `Date`) | **11**, de 2026-08-03 a 2026-10-30 | **27**, de 2026-08-01 a 2026-10-30 |
  | Imágenes por fecha | **2**, una por zona UTM: `_18S` y `_19S` (columna `UTM Zone`; 11 + 11) | **2**: `_18S` y `_19S` (27 + 27) |
  | Nombre del archivo | `HLSL30_VI.020_NDVI_doy<AAAADDD>_aid0001_<zona>.tif` | `HLSS30_VI.020_NDVI_doy<AAAADDD>_aid0001_<zona>.tif` |

  - **Dos zonas por fecha:** el rectángulo de Chivay cruza dos zonas UTM, y AppEEARS entrega una imagen por zona (`UTM Zone` 18S y 19S en `Statistics.csv`). Coincide con las dos teselas del CSV por punto (`18LZH` y `19LBC`, agregaciones I08).
  - **No se usan todavía:** falta la regla para unir o elegir la zona (V-B03) y la capa de calidad (V-B02), y no pasaron por ningún método de TARPU. `Statistics.csv` trae resúmenes del proveedor por imagen (`Count`, `Mean`, `Median`…), que **no son indicadores de TARPU**.

## 11. Pendientes de verificar

| Id | Qué falta | Cómo se resuelve |
|---|---|---|
| V-D01 | Qué variables de POWER van en la rejilla de 1° (además de `ALLSKY_SFC_SW_DWN`): `ALLSKY_SFC_PAR_TOT`, `CLOUD_AMT` | Documentación de fuentes de POWER |
| V-D02 | Rango válido de cada variable de POWER | Documentación de POWER |
| V-D03 | Definición de `T2M_RANGE` | Ídem |
| V-D04 | Definición de `FROST_DAYS` | Ídem |
| V-D05 | Significado de la unidad «1» de `GWETTOP`, `GWETROOT` y `GWETPROF` | Ídem |
| V-D06 | Profundidad de `TSOIL1` y `TSOIL2` | Ídem |
| V-D07 | Significado de los códigos de `NASADEM_NUM` más allá del nombre de la fuente | Guía de NASADEM |
| V-D08 | Valor nodata de los GeoTIFF de SoilGrids | Cabecera de un GeoTIFF de la base (`backend/almacen/`) |
| V-D09 | Rango válido de las propiedades de SoilGrids | Documentación de ISRIC |
| V-D10 | Nombre y método de cada propiedad de SoilGrids (`phh2o`, `cec`, `bdod`, `cfvo`, `wv0033`, `wv1500`) | Documentación de ISRIC |
| V-D11 | Unidades de `WALTITUD`, `LAT_DECI` y `LONG_DECI`, y de la superficie sembrada del CENAGRO | Guía estadística del INEI |
| V-03 | Base de Arequipa y CENAGRO completos | Pedir a Erick |
| V-06 | Factor y unidad de `uncertainty` | ISRIC (T01 §9.4) |
| V-04 | Si el 0 de GAEZ es aptitud nula o zona no evaluada (Chivay y S2: 0 de 100 capas distintas de 0) | Documentación de GAEZ v4 |
| V-A05, V-A06, V-A07, V-A10, V-A11 | MOD16 (32701 a 32766, kg/m² como mm), LST bajo 0 °C, clases de GAEZ, unidad de SMAP L3E | Agregaciones §8 |
| V-B01 a V-B06 | HLS (relleno, calidad, teselas, píxel, unidad) y SMAP L4 (unidad, relleno, calidad) | Agregaciones §8 |

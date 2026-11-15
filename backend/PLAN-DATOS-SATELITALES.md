# Plan de datos satelitales de TARPU (versión 2)

> Área de **Erick**, 14/11/2026. **Propuesta para aprobar**: si se aprueba, reemplaza DT-17 con una decisión nueva en `docs/06`. Nada está implementado.
>
> **Medido** = comprobado con peticiones reales el 14/11/2026, en el punto de Majes riego (−16,367023; −72,185771) o en el de Chivay (−15,64; −71,60). **Pendiente** = sin comprobar.
>
> La explicación completa para el equipo se dio en el chat. Este archivo es la referencia de trabajo.

## 1. Verificación de los recursos del desafío

| Recurso (lista oficial) | Vía probada | Resultado medido | Veredicto |
|---|---|---|---|
| NASA POWER | API diaria por punto, comunidad AG | **152 variables**; **máximo 20 por petición**; 20 variables × 2015–2025 en **3,1 s**, 0 faltantes | **Usar y ampliar** |
| POWER · `IMERG_PRECTOT` | Misma API | **366 de 366 días vacíos** (Majes, 2024) | Descartar por ahora |
| POWER · `RZMC` | Misma API | **366 de 366 días vacíos** | Descartar |
| MODIS (ORNL, sin cuenta) | `/products` | **46 productos** | Usar varios (abajo) |
| MOD13Q1 (NDVI) | ORNL | 272 fechas (2015–2026), píxel de 231,66 m | Usar |
| MOD16A2GF (evapotranspiración) | ORNL | Responde; bandas `ET_500m`, `PET_500m` (kg/m²/8 días, × 0,1); píxel de 463,3 m | **Usar** |
| MOD11A2 (temperatura de superficie) | ORNL | Responde; `LST_Night_1km` en Chivay, de junio a agosto de 2024: 0,7–2,9 °C | **Usar** |
| MCD12Q1 (cobertura del suelo) | ORNL | Majes riego: clase 14 (mosaico de cultivos y vegetación) y 12 (cultivos) en 2019–2021; Chivay: 10 (pastizal). **Máximo 10 años por petición** | **Usar** |
| MCD12Q2 (fenología) | ORNL | `Greenup` vacío (relleno) en Majes 2019–2023 | Descartar |
| MCD15A2H (área foliar) | ORNL | Bandas disponibles; sin serie probada | Opcional |
| SMAP (`SPL3SMP_E`) | ORNL | **«No data available for location»** en Majes y Chivay | Solo por AppEEARS (cuenta) |
| ECOSTRESS (`ECO4ESIPTJPL`) | ORNL | **«No data available for location»** en Majes y Chivay | Solo por AppEEARS (cuenta) |
| SMAP, SRTM/NASADEM, ECOSTRESS, HLS | AppEEARS, lista pública de productos | Existen: `SPL3SMP_E.006` y `SPL4SMGP.008` (9 km, diario, desde 2015-03-31), `NASADEM_NC.001` y `SRTMGL1_NC.003` (30 m, estático), `ECO_L3T_JET.002` y `ECO_L4T_ESI.002` (70 m, irregular), `HLSL30_VI.020` y `HLSS30_VI.020` (30 m) | Requieren **cuenta Earthdata**; tiempo **pendiente** de medir |
| GLDAS / IMERG (GES DISC Data Rods) | `hydro1.gesdisc` | Redirige a un aviso: **«The Hydrology Data Rods service will be discontinued»** | Descartar |
| SoilGrids | API REST | 4 propiedades: ≈ 10 s (Damaris). 11 propiedades × 3 profundidades: **no respondió en 150 s (dos veces)**. 1 propiedad: 11,8 s | Usar con cuidado |
| SoilGrids | **WCS** (`maps.isric.org`) | pH 0–5 cm, Chivay: **6,9 en 1,1 s** (igual que la muestra) | **Vía rápida** |
| SoilGrids | `/properties/layers` | **14 propiedades** disponibles | Ampliar |
| FAO GAEZ v4 | ImageServer `res05`, `identify` | **Papa** y **cebada**; **sin quinua ni haba**. Índice 0–10 000 en celdas de 0,0833° (≈ 9 km). 12 consultas en **7,8 s** | **Usar** |
| GEDI, GRACE | — | Escala o tema no útiles para una parcela | Descartar |
| NLDAS, Daymet | — | Solo Norteamérica | Descartar |
| ERA5 | — | Pide cuenta del CDS; POWER cubre lo mismo | Descartar |
| Sentinel-2 | — | No es de NASA; HLS lo incluye armonizado | Descartar |

**Valores reales de GAEZ** (índice 0–10 000, período 1981–2010, entradas altas): papa con riego, Majes 3333 y Chivay 0; papa con riego por gravedad, Majes 5556; cebada con riego, Majes 5556 y Chivay 0; secano, 0 en los dos lugares. `su*` = «current cropland in grid cell»; `sx*` = «all land in grid cell» (texto de GAEZ).

**Días de helada de POWER** (`FROST_DAYS`, definición de POWER: T2M baja al punto de rocío y ambos < 0 °C), Chivay, suma 2015–2025 por mes: ene 52 · feb 43 · mar 40 · abr 123 · may 248 · jun 318 · jul 322 · ago 322 · sep 199 · oct 157 · nov 106 · dic 60.

**Latencia de ORNL:** 6–45 s por petición; `/bands` ≈ 34 s; `/dates` 20–40 s; 8 peticiones en paralelo en 30 s.

## 2. Fuentes propuestas

| Nivel | Fuente | Variables | Escala | Acceso |
|---|---|---|---|---|
| A · segundos | NASA POWER | `T2M`, `T2M_MAX`, `T2M_MIN`, `T2M_RANGE`, `PRECTOTCORR`, `RH2M`, `T2MDEW`, `FROST_DAYS`, `ALLSKY_SFC_SW_DWN`, `ALLSKY_SFC_PAR_TOT`, `CLOUD_AMT`, `WS2M`, `GWETTOP`, `GWETROOT`, `GWETPROF`, `TSOIL1`, `TSOIL2`, `TS_MIN`, `EVLAND` (19, una petición) | ≈ 55 × 67 km | Sin cuenta |
| A | SoilGrids (WCS) | `phh2o`, `clay`, `sand`, `silt`, `soc`, `nitrogen`, `cec`, `bdod`, `cfvo`, `wv0033`, `wv1500`; 0–5, 5–15 y 15–30 cm; media, Q0,05 y Q0,95 | 250 m | Sin cuenta |
| A | FAO GAEZ v4 | Índice de aptitud de papa y cebada; secano, riego, gravedad y aspersión; 1981–2010 | ≈ 9 km | Sin cuenta |
| B · minutos | MOD13Q1 | NDVI + confiabilidad, 2015–hoy | 231,66 m · 16 días | Sin cuenta (ORNL) |
| B | MOD16A2GF | ET + PET, período a decidir | 463,3 m · 8 días | Sin cuenta (ORNL) |
| B | MOD11A2 | Temperatura de superficie de noche y de día, período a decidir | 1 km · 8 días | Sin cuenta (ORNL) |
| B | MCD12Q1 | Cobertura IGBP (`LC_Type1`), 2015–2024 | 463,3 m · anual | Sin cuenta (ORNL) |
| C · por medir | NASADEM / SRTM | Altitud; pendiente y orientación calculadas | 30 m | Cuenta Earthdata (AppEEARS) |
| C | SMAP L3E / L4 | Humedad del suelo observada | 9 km · diario | Cuenta Earthdata |
| Después | HLS NDVI, ECOSTRESS ET/ESI | Verdor y estrés hídrico dentro de la parcela | 30 m / 70 m | Cuenta Earthdata |

**Peticiones a ORNL por lugar nuevo** (8 en paralelo y 6–33 s por ronda, medidos):

| Conjunto | Peticiones | Rondas | Tiempo estimado |
|---|---|---|---|
| Solo NDVI 2015–hoy | 56 | 7 | 0,7–4 min |
| **Recomendado:** NDVI 2015–hoy + ET/PET, LST noche/día y cobertura en los últimos 5 años | ≈ 166 | 21 | 2–12 min |
| Todo desde 2015 | ≈ 278 | 35 | 3,5–19 min |

Los metadatos (`/bands` y `/dates`) se guardan en caché una vez por producto y tesela.

## 3. Extracción: rehacer los scripts de `datos/`

Un paquete común (área de Damaris; se acuerda con ella):

```text
datos/tarpu_datos/
  cliente.py      peticiones con reintentos cortos, tope de concurrencia por servicio, caché atómica y avance
  power.py        1 petición, hasta 20 variables
  soilgrids.py    WCS en paralelo (respaldo: REST con reintentos)
  gaez.py         consultas identify por cultivo, agua y nivel de insumos
  ornl.py         genérico por producto y banda (NDVI, ET, LST, cobertura), por bloques de 10 fechas
  appeears.py     si hay cuenta: tarea por punto o contorno, con espera del resultado
  __main__.py     CLI: python -m datos.tarpu_datos --lat … --lon … --fuentes …
```

Cada módulo expone `obtener(lat, lon, inicio, fin, salida, cache, progreso)` y escribe los tres archivos (original, normalizado y procedencia). Solo biblioteca estándar. El GeoTIFF de WCS, de 2 × 2 píxeles, se lee con un lector TIFF mínimo propio o con Pillow, si el área lo admite (**a decidir**).

## 4. Almacenamiento

- **Caché de fuentes:** `backend/almacen/cache/{fuente}/{clave}/`. La clave es el píxel (tesela + fila + columna) en MODIS, el punto redondeado en POWER y SoilGrids, y la celda en GAEZ.
- **Por parcela:** `parcela.json`, `contexto.json`, `procesamiento.json` (con el avance), `indicadores.json` (por secciones: terreno, clima, agua, suelo, verdor, superficie, cobertura y aptitud), `series/*.json` (para los gráficos) y `rotaciones.json`.
- **Formatos:** JSON y CSV, legibles y versionables. Una base de datos (PostGIS) queda para después.

## 5. Entrada al motor

| Criterio | Dato real | Regla citada | Estado |
|---|---|---|---|
| Temperatura | POWER `T2M` (meses declarados) | EcoCrop | Existe |
| Frío | POWER `T2M_MIN` ≤ letal; **más** `FROST_DAYS` (definición de POWER) como dato | EcoCrop | Ampliar |
| Lluvia | POWER `PRECTOTCORR` | EcoCrop | Existe |
| pH | SoilGrids, 3 profundidades, con intervalo | EcoCrop | Con dato |
| **Aptitud GAEZ** | Índice de GAEZ según el agua declarada (secano o riego) | FAO GAEZ v4 (el índice es la regla) | Nuevo; haba y quinua: `sin_regla` |
| **Altitud** | Altitud de la parcela (NASADEM), si hay cuenta | EcoCrop | Reemplaza la elevación de la celda de POWER |
| Textura | Clase de textura a partir de arcilla, arena y limo | Textura de EcoCrop + triángulo de textura USDA | **Pendiente:** copiar los campos de EcoCrop y la cita del triángulo |
| Agua del cultivo | ET₀ FAO-56 (Penman-Monteith) con POWER × Kc | FAO-56 | **Pendiente:** verificar los Kc en la tabla de FAO-56 |
| Familia | EcoCrop | — | Existe |

Solo descriptivos, sin regla: NDVI, ET/PET de MODIS, LST, cobertura, humedad del suelo, viento, radiación, nitrógeno, CIC, carbono y agua retenida.

## 6. Pantallas

0. **Mis lugares:** lugares de ejemplo (Majes riego y Chivay) y parcelas propias.
1. **Mi campo:** mapa y contorno, área, altitud y pendiente, cobertura por año, escala y avance de cada fuente.
2. **Clima:** temperaturas, días de helada, noches bajo 0 °C, temperatura de superficie nocturna, humedad y punto de rocío, viento, radiación, PAR y nubes.
3. **Agua:** lluvia, ET y PET de MODIS, humedad del suelo (superficie y raíces) y riego declarado.
4. **Suelo:** pH, textura, carbono, nitrógeno, CIC, densidad, piedras y agua retenida, con intervalos; temperatura del suelo.
5. **Verdor:** NDVI 2015–hoy con calidad, perfil mensual y último valor.
6. **Qué siembro después:** criterios por cultivo con su cita, vacíos y conflictos.
7. **Pregunta a Tarpu:** intenciones por sección.
8. **Ver y descargar:** por fuente, en los tres niveles.

## 7. Demo

- **Lugares de ejemplo** (Majes riego y Chivay), de tipo punto y sin contorno, precargados y exportados a la web estática.
- **Cualquier lugar:** requiere publicar la API en un servidor con disco persistente (decisión pendiente).

## 8. Decisiones pendientes

1. ¿Se aprueban las fuentes de los niveles A y B? Reemplazaría DT-17.
2. ¿Se crea una cuenta Earthdata para el nivel C (NASADEM y SMAP)? ¿Quién la crea?
3. ¿Qué períodos de ET y LST: 5 años o desde 2015?
4. ¿Se rehacen los scripts como paquete común? Hay que acordarlo con Damaris.
5. ¿Lector de GeoTIFF propio o Pillow para el WCS de SoilGrids?
6. ¿Se publica la API?
7. ¿Se añaden los criterios de textura y de agua del cultivo cuando se verifiquen sus citas?

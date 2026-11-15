# T03 · 3. Agregaciones para la pantalla «Cómo está mi campo»

> **Área:** datos (Damaris). **Tarea:** [README.md](README.md), §3.3. **Estado:** borrador para revisar con Erick, 15/11/2026.
> Escrito con asistencia de IA (Claude Code); declarado en [entrega/uso-de-ia.md](../../entrega/uso-de-ia.md).
>
> **Qué es:** cada indicador de la pantalla 5 ([docs/10 §2](../../docs/10-recorrido-y-escala.md)), con método citado, variables, celdas o píxeles, período y trato de los vacíos. Es diseño: no cambia `backend/`.
>
> **Usa del [modelo lógico](modelo-logico.md):** los motivos de vacío (§4.1), los identificadores de celda (§3) y las reglas de la relación parcela ↔ celda (E09: `centro_dentro`, `toca`, `contiene_centroide`).
>
> **Evidencia:** igual que en el modelo lógico. «Verificado con datos» = abierto en un archivo de `trabajo/…/salida/` o `cache/`. «Según el código» = leído en `backend/`, sin datos de `almacen/` (V-03 del modelo lógico).

## 1. Reglas comunes a todos los indicadores

1. **Un vacío nunca es 0.** La observación vacía lleva su motivo (modelo lógico §4.1). Un período con algún vacío **no entra** en sumas, promedios ni conteos de esa variable: se lista aparte con su número real de vacíos. Es la regla que ya aplica `indicadores.py` («Un mes con algún día sin dato no entra en los totales ni en los conteos de esa variable: se lista»).
2. **Ningún umbral sin cita (DT-16).** Si no hay cita, se muestra el dato **sin evaluarlo** y el indicador queda `sin_regla`.
3. **Cada indicador guarda** las consultas (E14) y las celdas (E08) que usó, con la regla de E09. Así la pantalla puede dar la escala, la fuente, el período y los faltantes (docs/10 §5.2).
4. **Período:** cada fuente tiene el suyo y **se muestra el suyo**. No se recorta todo al período común sin decirlo.
5. **Redondeo:** el de `indicadores.py`, a 1 decimal y hacia arriba en el empate, sobre la aritmética decimal del valor del CSV. Para las fuentes nuevas se propone la misma regla.
6. **No se interpreta.** Las frases describen («la mínima estuvo bajo 0 °C en promedio 29 noches»); no diagnostican («hay helada», «hay estrés»).

## 2. Resumen

| Id | Indicador | Fuente | Estado |
|---|---|---|---|
| I01 | Temperatura media del aire por mes | POWER `T2M` | ✅ implementado (`indicadores.py`) |
| I02 | Temperatura mínima registrada por mes | POWER `T2M_MIN` | ✅ implementado |
| I03 | Noches con mínima bajo 0 °C por mes | POWER `T2M_MIN` | ✅ implementado |
| I04 | Noches con mínima ≤ temperatura letal citada | POWER `T2M_MIN` + EcoCrop | ✅ implementado (para el motor) |
| I05 | Lluvia por mes y por año | POWER `PRECTOTCORR` | ✅ implementado |
| I06 | Meses con días sin dato | POWER | ✅ implementado |
| I19 | Clima del último año completo | POWER `T2M`, `PRECTOTCORR` | 🔎 **candidato**: ya lo calcula el frontend nuevo, no el backend (§3.1) |
| I07 | Verdor (NDVI) por fecha, 250 m | MODIS `MOD13Q1` | 📝 propuesto |
| I08 | Verdor (NDVI) por fecha, 30 m | HLS L30 y S30 | 📝 propuesto; descarga verificada, sin capa de calidad |
| I09 | Evapotranspiración real y potencial por compuesto | MODIS `MOD16A2GF` | 📝 propuesto |
| I10 | Temperatura de superficie de día y de noche | MODIS `MOD11A2` | 📝 propuesto |
| I11 | Cobertura del suelo por año | MODIS `MCD12Q1` | 📝 propuesto |
| I12 | Suelo estimado por propiedad y profundidad | SoilGrids | 🟡 parcial (`leer.py`, `_suelo_parcela`) |
| I13 | Altitud y pendiente | NASADEM | 🟡 implementado en `leer.py`; sin pantalla |
| I14 | Factor LS (erosión por pendiente) | NASADEM + método USLE | `fuera_de_validez` en Chivay; `sin_regla` sin λ (§4.3) |
| I15 | Horas de luz por mes | FAO-56 (cálculo) | 📝 propuesto |
| I16 | Humedad superficial del suelo | SMAP L3E | 📝 propuesto |
| I17 | Humedad superficial y de raíz (modelada) | SMAP L4 | 📝 propuesto; descarga verificada, unidad y relleno pendientes |
| I18 | Aptitud por cultivo y tipo de agua | FAO GAEZ v4 | 📝 propuesto; Chivay y S2 bloqueados por V-04 |

Fuera de la pantalla 5: la **ETo de Penman-Monteith** y el **agua del cultivo** (ETc = Kc × ETo) van al motor (pantalla 6). Se anotan en el §6 porque usan las mismas variables.

## 3. Clima (NASA POWER) · I01 a I06, ya implementados

**Común a I01–I06**
- **Celda:** la celda de 0,5° × 0,625° que contiene el centroide (`contiene_centroide`); hoy la serie se pide por punto, que cae en esa celda (`power_celda` en `leer.py`).
- **Período:** 2015-01-01 a 2025-12-31 (`TARPU_POWER_INICIO` y `TARPU_POWER_FIN`, docs/10 §6.3).
- **Vacío:** `relleno_del_proveedor` (relleno −999; `fill_value` de la procedencia de POWER). En S2: 0 días con relleno en las 19 variables (`power_valle_s2_…procedencia.json`, `missing_days`).
- **Avisos fijos** (`indicadores.py`, `AVISOS`): «Dato de la zona (celda de POWER), no medición dentro de la parcela» y «Registro del pasado, no pronóstico».
- **Aviso de altitud:** cuando la elevación de la celda difiere de la del punto en NASADEM, se dice con la cifra (`leer()`). Ejemplo verificado: la celda de Chivay está a 4351,89 m.
- **Limitación de S2 (afecta sobre todo a I03 e I04):**
  - **S2 y Chivay comparten la misma celda de POWER.** Las dos procedencias dan `cell_elevation_m` 4351,89 (`power_chivay_20150101_20251231.procedencia.json:17` y `power_valle_s2_20150101_20251231.procedencia.json:17`).
  - **El punto de S2 está 1689 m más abajo:** a 2663 m en NASADEM (§4.1; la misma diferencia figura en `backend/PLAN-PLATAFORMAS-Y-COORDENADA.md:35`).
  - **El clima de S2 sale de una celda mucho más alta que el valle,** así que sus temperaturas y sus noches bajo 0 °C quedan **sesgadas hacia el frío**. La tarjeta de S2 debe decirlo con las dos altitudes.
  - **La magnitud del sesgo no está medida** y no hay cita para corregirlo: no se corrige el dato, se avisa (V-A13).

| Id | Variables | Método (tal como está en `indicadores.py`) | Qué hace con los vacíos | Qué no significa |
|---|---|---|---|---|
| I01 | `T2M` (°C) | Promedio de todos los días de ese mes en el período | Excluye los días sin dato; el mes queda en `meses_con_dias_sin_dato` | No es la temperatura de la parcela |
| I02 | `T2M_MIN` (°C) | Mínimo de los días con dato de ese mes en todo el período | Excluye los días sin dato | No es la mínima de la planta |
| I03 | `T2M_MIN` | Por cada mes y año, cuenta los días con `T2M_MIN < 0`; luego promedia los años. El código dice: «"Bajo 0 °C" es la temperatura mínima del aire a 2 m, no un diagnóstico de helada sobre el cultivo» | Si al mes le falta algún día, ese año no entra en el promedio de ese mes | No usa la palabra «helada»: no hay una definición citada (`indicadores.py`) |
| I04 | `T2M_MIN` + temperatura letal de cada cultivo (`catalogo.temperaturas_letales()`, de FAO EcoCrop) | Igual que I03, con `≤ umbral` | Igual que I03 | Si EcoCrop no trae la letal, el criterio es `sin_regla` (`comparacion.py`) |
| I05 | `PRECTOTCORR` (mm/día) | Por mes: promedio de los totales mensuales. Por año: total, solo años completos | Un mes con algún día sin dato no entra; un año incompleto no tiene total | Lluvia regional, no la de la parcela (docs/10 §6.4) |
| I06 | `T2M`, `T2M_MIN`, `PRECTOTCORR` | Lista de (año, mes, días sin dato) | — | — |

### 3.1 I19 · Clima del último año completo (candidato)

**Dónde está hoy:** en el frontend nuevo, no en el backend: `climateYear` (`Codigo/src/nuevo/fieldData.ts`, líneas 58-98; `docs/informes/08-frontend-conectado-api.md`, §1). Lo calcula sobre el normalizado de la celda de POWER que devuelve `/api/base/parcela`.

| Campo | Lo que hace el código del frontend | Qué falta para aceptarlo |
|---|---|---|
| Variables | `T2M` y `PRECTOTCORR` | — |
| «Año completo» | El último año que tiene la fila del **31/12**. No comprueba que estén los 365 o 366 días; informa `days` | Definir «completo» igual que I05: todos los días del año presentes (`indicadores.py`, línea 109) |
| Temperatura | Media de los días **con dato**, del año y de cada mes. Los días sin dato se cuentan en `missingTemperature` | Igual que I01, pero de un solo año |
| Lluvia | Suma del año y de cada mes. **Si falta un día, la suma es `null`**; nunca 0 | Igual que I05 |
| Período | Un solo año, distinto de I01–I06, que promedian 2015–2025 | La tarjeta debe decir qué año es |
| Qué no significa | Un año, no el clima típico de la zona; registro del pasado, no pronóstico | — |

- **Por qué es candidato y no indicador:** el método (media y suma) es aritmética de la serie, sin umbral, así que DT-16 no lo impide. Pero no está en `backend/catalogo/indicadores.json` ni en este documento, y su definición de «completo» no es la de I05.
- **Por confirmar con Erick:** si entra como indicador del backend o se queda en el frontend.
- **Ejemplo** (no verificado aquí, `docs/informes/08-frontend-conectado-api.md`, Comprobaciones): un campo en Majes da 16,5 °C en 2025.

### 3.2 Dato de referencia de I03

**Recalculado:** en Chivay, en julio, la mínima estuvo bajo 0 °C en promedio **29,2 noches**.
- **Fuente:** `trabajo/T01-paquete-extraccion/salida/power_chivay_20150101_20251231.normalizado.csv`, columna `T2M_MIN (C)`, julio de 2015 a 2025, con el método de I03.
- **Cálculo:** los 11 julios están completos (31 días cada uno). Las noches con `T2M_MIN < 0` por año son 31, 29, 30, 31, 30, 28, 30, 30, 26, 26 y 30, que suman 321; 321 / 11 = 29,18, redondeado a 29,2. Coincide con docs/10 §5.2.
- **Ojo en S2:** las series de POWER de S2 y Chivay son **idénticas**: las 19 variables coinciden en los 4018 días (`power_valle_s2_…normalizado.csv` frente a `power_chivay_…normalizado.csv`). Su julio da, por tanto, la misma cifra (ver la limitación de arriba).

## 4. Relieve (NASADEM) · I13 e I14

### 4.1 I13 · Altitud y pendiente
- **Píxeles:** los de 1″ (≈ 30 m) **cuyo centro cae dentro** del contorno (`centro_dentro`, `_relieve_parcela` en `leer.py`). Si ninguno cae dentro: `sin_dato`, «la parcela es más pequeña que un píxel». Es el único dato que sí describe el interior de la parcela (README de T03, §2.3).
- **Método:** pendiente de Horn (1981) en 3 × 3, con las clases de FAO, *Guidelines for soil description* (2006), cuadro 7 (`leer.py`; `backend/investigacion/relieve_erosion_rotacion_2026-11-15.json`).
- **Límites de las clases**, en %, tal como están en `CLASES_PENDIENTE` (`leer.py`): plano < 0,2; nivelado < 0,5; casi nivelado < 1; muy suave < 2; suave < 5; inclinado < 10; fuertemente inclinado < 15; moderadamente empinado < 30; empinado < 60; muy empinado ≥ 60. **Verificar contra el cuadro 7 de FAO (2006)** (V-A01).
- **Salida:** altitud mínima, media y máxima; pendiente mínima, mediana y máxima; píxeles por clase (`leer.py`).
- **Período:** estático; NASADEM corresponde a la misión de febrero de 2000 (fecha `2000-02-11` en `NASADEM-NC-001-Statistics.csv`).
- **Vacíos:** `nodata_del_raster` o tesela ausente (`sin_dato`). Si la parcela cruza el borde de una tesela: `sin_dato`, caso no implementado (`leer.py`).
- **Qué no significa:** la clase de pendiente describe el terreno, no su aptitud para un cultivo.
- **Caso S2:** la coordenada se mantiene (decisión de Erick, 15/11/2026; V-07 del modelo lógico). La tarjeta debe decir que describe ese punto, en ladera: 2663 m en NASADEM frente a los 2908 m del censo.
  - **De dónde sale el 2663:** `trabajo/extraccion_pesada/salida/relieve_3_zonas/NASADEM_NC.001_NASADEM_HGT_doy2000042000000_aid0002.tif`, píxel (fila 162, columna 162), en el punto (−15.612386, −71.984857).
  - **Cómo se comprobó:** la cabecera da el origen (−72,0298611; −15,5673611) y un píxel de 1/3600°. El punto cae en la columna 162,01 y la fila 162,09, y el píxel vale 2663 (leído con Pillow).
  - Coincide con lo anotado en `backend/PLAN-PLATAFORMAS-Y-COORDENADA.md:42`.

### 4.2 Pantalla y mapa
- Es el único indicador que **puede colorear el interior** de la parcela, por píxel (README de T03, §2.3).
- Que se coloree o no lo decide Shantall.

### 4.3 I14 · Factor LS
- **Método:** Wischmeier y Smith (1978), USDA *Agriculture Handbook* 537, pp. 12-15: `LS = (λ/22,1)^m · (65,41 sin²θ + 4,56 sinθ + 0,065)`, con λ en metros. El exponente m es 0,5 si la pendiente es ≥ 5 %, 0,4 entre 3,5 y 4,5 %, 0,3 entre 1 y 3 % y 0,2 por debajo de 1 % (`metodos_citados_2026-11-15.json`, `factor_ls`).
- **Validez:** la fuente lo validó solo entre **3 y 18 %** de pendiente y con longitudes de ≈ 9 a 91 m (`metodos_citados_…json:46`, `limite_de_validez`). Fuera de ese rango, el indicador dice **«fuera de validez»** (estado `fuera_de_validez`) y no calcula LS.
- **La longitud λ no sale del DEM** sin un método adicional: la declara el usuario o queda sin evaluar. Dentro del rango de validez pero sin λ, el estado es `sin_regla`.
- **Chivay: «fuera de validez».** La pendiente mediana de la zona es del **33 %** (`backend/investigacion/relieve_erosion_rotacion_2026-11-15.json:44`, `chivay.pendiente_mediana_pct`), por encima del 18 %.
  - Esa mediana es de la zona de ≈ 10 × 10 km de AppEEARS, no de una parcela.
  - El punto de Chivay da 5,4 % (mismo archivo, `chivay.punto.pendiente_pct`).
  - Para una parcela, la validez se decide **con sus propios píxeles de NASADEM**; si su pendiente queda fuera de 3–18 %, el indicador dice «fuera de validez».
- **Hueco en la fuente:** m solo está definido para los tramos citados. El tramo entre 3 y 3,5 % y el que va de 4,5 a 5 % no tienen valor en el archivo (V-A02).
- **Ojo:** `relieve_erosion_rotacion_…json` todavía trae la forma de Moore y Burch (1986) con estado «pendiente». `metodos_citados_…json` la reemplaza explícitamente («reemplaza»). Se usa la de USLE.

## 5. Satélite por punto (MODIS por ORNL)

**Común a I07, I09, I10 e I11**
- **Píxel:** el que contiene el centroide (`contiene_centroide`), identificado por (producto, `xllcorner`, `yllcorner`) (modelo lógico §3).
- **Tamaño del píxel** (`cellsize_m` de las procedencias): 231,66 m en MOD13Q1; 463,31 m en MOD16A2GF y MCD12Q1; 926,63 m en MOD11A2.
- **Conversión** (procedencias de ORNL): «value = raw * scale_factor; fill or out of valid_range ⇒ empty. Categorical bands keep the raw class code».
- **Tesela:** `h11v10` en los tres lugares (`detalle.csv`).

### 5.1 I07 · Verdor (NDVI de MOD13Q1)
- **Variables:** `250m_16_days_NDVI` (escala 0,0001; relleno −3000; rango −2000 a 10000) y `250m_16_days_pixel_reliability` (relleno −1; rango 0 a 3) (`bands` de la procedencia).
- **Método:** serie por fecha, **sin agregar**. Es una línea por fecha (docs/10 §5.3).
- **Calidad**, según la guía de usuario de MOD13 citada en `ornl.py` (`CALIDAD`): 0 bueno · 1 marginal · 2 nieve o hielo · 3 nubes.
  - **Propuesta de este documento; la decide Erick:** **no cortar la línea** solo por la marca. Las fechas con código 2 o 3 se dibujan con **otro marcador** y la **etiqueta del proveedor** («nieve o hielo», «nubes»). El 1 se dibuja, marcado «marginal».
  - **Por qué no se corta:** la marca «nubes» no está contrastada (`datos/ndvi/README.md`, §Límites). En el punto urbano de Majes (−16,351; −72,190), **198 de 272 fechas (72,8 %)** tienen código 3, y su NDVI mediano (0,117) apenas difiere del de las fechas «bueno» (0,124).
    - **Ojo:** esa cifra sale de `datos/ndvi/cache/MOD13Q1_majes_20150101_20261114/`, un **caché que git ignora**, así que **no se puede reproducir desde el repositorio**. Las muestras que `datos/ndvi/README.md` dice conservar en `datos/muestras/` ya no están ahí.
  - **En los tres lugares de ejemplo** el código 3 es raro: **5, 2 y 0 fechas** (Majes riego, Chivay y S2; tabla de abajo).
  - Cortar o no, y si el 1 se trata distinto, depende de la guía de MOD13 (V-A03) y de la decisión de Erick. Mientras tanto, docs/10 §5.3 («cortada donde no hubo observación válida») queda pendiente de esa decisión.
  - **Choque con el frontend nuevo (commit `d78a70b`):** el frontend **sí corta**. Dibuja solo las fechas con fiabilidad 0 o 1, y deja 2 y 3 como vacío, citando la «MOD13 User Guide, pixel reliability» (`Codigo/src/nuevo/FieldEvidence.tsx`, líneas 91-94). En pantalla dice: «se omiten fechas con nubes o nieve» (línea 409; también en `docs/informes/08-frontend-conectado-api.md`, §3).
    - Si la propuesta de este documento se acepta, cambia el frontend: dibujaría los códigos 2 y 3 con otro marcador, sin cortar.
    - Si no, cambia este documento.
    - **Lo decide Erick** (V-A03). En los tres lugares de ejemplo la diferencia afecta a 5, 2 y 0 fechas.
- **Conteo verificado** (`mod13q1_*_detalle.csv`, 272 fechas, de 2015-01-01 a 2026-10-16):

  | Lugar | bueno | marginal | nubes | nieve o hielo |
  |---|---|---|---|---|
  | Majes riego | 195 | 72 | 5 | 0 |
  | Chivay | 214 | 56 | 2 | 0 |
  | S2 | 235 | 37 | 0 | 0 |

- **Vacíos:** `relleno_del_proveedor` (−3000) y `fuera_de_rango_valido`. En los tres lugares, 0 fechas sin valor de NDVI (`missing_values_by_band`). `calidad_no_valida` solo se usaría si Erick decide cortar la línea por la marca.
- **Promedios por año o por mes:** no se proponen. No hay un método citado para agregar NDVI entre fechas con distinta calidad, así que **sin regla**.
- **Qué no significa:** el NDVI no mide fertilidad (AGENTS.md §6). Ningún mes se rotula «sin cultivo» sin un umbral citado (docs/10 §4). Describe un píxel de 231,66 m, mayor que muchas parcelas.
- **Hallazgo abierto:** la media de 2026 en Majes riego es mayor que la de otros años y no tiene explicación.
  - **Recalculado** con `trabajo/T01-paquete-extraccion/salida/mod13q1_majes_riego_20150101_20261016.normalizado.csv`, columna `250m_16_days_NDVI`: la media de 2026 es **0,571**, sobre 19 fechas (2026-01-01 a 2026-10-16). Es la misma cifra de `en-curso.md`, que venía de `datos/muestras/`.
  - **Comparación** (mismo archivo, todas las fechas): 0,455 en 2024 (23 fechas) y 0,470 en 2025 (23 fechas).
  - **Solo con calidad 0** (`pixel_reliability` = 0): 0,592 en 2026 (16 fechas).
  - 2026 es un año incompleto: no es comparable con un año entero.

### 5.2 I09 · Evapotranspiración (MOD16A2GF)
- **Variables:** `ET_500m` y `PET_500m`, en kg/m²/8day; escala 0,1; relleno 32767; rango −32767 a 32700 (`bands`).
- **Método:** valor por compuesto, **sin sumar por mes**. Un compuesto de 8 días puede cruzar el fin de mes, y no hay un método citado para repartirlo (V-A04).
- **Período:** 2015-01-01 a 2025-12-31, 506 compuestos.
- **Vacíos:** `relleno_del_proveedor` (32767). Los valores entre 32701 y 32766 quedan fuera del rango válido (`fuera_de_rango_valido`); su significado está por leer en la guía de MOD16 (V-A05). En los tres lugares: 0 vacíos en las dos bandas (`missing_values_by_band`).
- **Unidad en pantalla:** kg/m² por 8 días, como da el proveedor. Mostrarla en mm requiere citar la equivalencia en la guía del producto (V-A06).
- **Qué no significa:** no es el agua que necesita un cultivo. Eso es ETc = Kc × ETo, en el motor (§6).

### 5.3 I10 · Temperatura de superficie (MOD11A2)
- **Variables:** `LST_Day_1km` y `LST_Night_1km`, en kelvin; escala 0,02; relleno 0; rango 7500 a 65535 (`bands`).
- **Método:** valor por compuesto de 8 días, en °C. La conversión de kelvin a °C restando 273,15 es la definición del SI, no una regla agronómica.
- **Conteo bajo 0 °C:** se propone con el mismo corte descriptivo de I03, como «compuestos con temperatura de superficie nocturna bajo 0 °C». Ese corte no es un umbral agronómico, y **usarlo para la superficie lo decide el equipo** (V-A07).
- **Período:** 2015-01-01 a 2025-12-31, 505 compuestos. Falta el **16/10/2022** en los tres lugares (`fecha_ausente`, V-09 del modelo lógico).
- **Vacíos verificados** (`missing_values_by_band`; crudo 0 = relleno):

  | Lugar | Día | Noche |
  |---|---|---|
  | Majes riego | 2 | 64 |
  | Chivay | 3 | 25 |
  | S2 | 3 | 31 |

- **Qué no significa:** es la temperatura de la superficie, no la del aire. No es comparable con I02 ni con I03, y no es una helada sobre el cultivo.

### 5.4 I11 · Cobertura del suelo (MCD12Q1)
- **Variable:** `LC_Type1`, clases IGBP del 1 al 17; relleno 255. Etiquetas de la *MCD12 User Guide* (Sulla-Menashe y Friedl, 2018), solo en `.detalle.csv`.
- **Método:** la clase de cada año, sin agregar.
- **Período:** 2015 a 2024, 10 años. Ejemplo verificado: en S2 la clase es 10, «Grasslands», los 10 años.
- **Vacíos:** `relleno_del_proveedor` (255).
- **Qué no significa:** clasifica un píxel de 463,31 m. No dice qué cultivo hay en la parcela.

### 5.5 I08 · Verdor de 30 m (HLS L30 y S30)
Verificado con la descarga del commit `2ba9f10`. Ruta: `trabajo/extraccion_pesada/salida/hls_landsat_puntos/` y `hls_sentinel_puntos/`; abajo, «L30» y «S30».

- **Productos y capa:** `HLSL30_VI.020` y `HLSS30_VI.020`, capa `NDVI` (`…-request.json`, `params.layers`). Cita del proveedor: Neigh, C. (2025), *HLS … Vegetation Indices Daily Global 30m v2.0*, LP DAAC (`…-metadata.xml`).
- **Rejilla:** 30 m (`…-metadata.xml`, `gmd:spatialResolution`, `uom="meters"`). El CSV da la tesela (`HLS_Tile`) pero **no la fila ni la columna del píxel**, así que el identificador de la celda queda pendiente (V-B04).
- **Valor:** columna `HLSL30_VI_020_NDVI` o `HLSS30_VI_020_NDVI` de `…-results.csv`. AppEEARS dice que extrae «scaled data values» (`README.md`, línea 72), así que el valor ya viene escalado.
  - **Unidad:** el archivo no la da (pendiente, V-B05). El NDVI es una razón sin unidad, como en MOD13Q1, pero eso está por confirmar en la guía de HLS.
- **Valor −19999.0:** es el único negativo menor que −1 en las seis series. **Se trata como vacío.** Que sea el relleno documentado del producto **está pendiente de verificar** en la guía de HLS, porque no aparece en los archivos descargados (V-B01). Mientras tanto, su motivo es `relleno_del_proveedor` (pendiente de verificar).
- **Calidad: no hay banderas en la descarga.** Solo se pidió la capa `NDVI`. AppEEARS dice que HLS trae una capa de calidad con nubes, sombra, nieve, agua y aerosoles, definida en la §6.4 de la guía de usuario de HLS (`README.md`, línea 141). **Sin esa capa, la línea no se puede cortar por nubes.** Se propone volver a pedir el punto con la capa de calidad (V-B02).
- **Dos teselas en el mismo punto:** en Majes riego (`18KYG` y `18KZG`) y en Chivay (`18LZH` y `19LBC`), **cada fecha trae dos valores**, uno por tesela, y a menudo difieren (ej. Chivay L30: 0,1808 frente a 0,1569). S2 cae en una sola tesela (`18LZH`).
  - **No se promedian.** Falta la regla para elegir una tesela, con cita (V-B03).
- **Conteo verificado** (`…-results.csv`, columnas `ID`, `Date`, `HLS_Tile` y la de NDVI; período pedido de 2025-01-01 a 2026-10-31):

  | Serie | Lugar | Filas (fechas × teselas) | −19999 | Válidos | Rango válido observado | Primera y última fecha |
  |---|---|---|---|---|---|---|
  | L30 | Majes riego | 158 (79 × 2) | 38 | 120 | 0,0664 a 0,8489 | 2025-01-03 · 2026-10-29 |
  | L30 | Chivay | 154 (77 × 2) | 70 | 84 | 0,0455 a 0,2385 | 2025-01-04 · 2026-10-30 |
  | L30 | S2 | 79 (79 × 1) | 25 | 54 | 0,2182 a 0,7378 | 2025-01-03 · 2026-10-29 |
  | S30 | Majes riego | 366 (187 fechas; 180 + 186) | 71 | 295 | 0,1276 a 0,8837 | 2025-01-03 · 2026-10-30 |
  | S30 | Chivay | 367 (187 fechas; 184 + 183) | 103 | 264 | −0,0109 a 0,2944 | 2025-01-08 · 2026-10-30 |
  | S30 | S2 | 184 (184 × 1) | 48 | 136 | 0,2167 a 0,7765 | 2025-01-08 · 2026-10-30 |

- **Diferencia entre teselas** (fechas con las dos válidas): L30 Majes, 8 de 60 distintas; L30 Chivay, 42 de 42; S30 Majes, 143 de 143; S30 Chivay, 127 de 127.
- **Método propuesto:** serie por fecha y por tesela, sin agregar y sin mezclar L30 con S30. Mezclarlas o elegir una tesela necesita una regla citada (V-B03).
- **Qué no significa:** el NDVI no mide fertilidad. Sin la capa de calidad, esta descarga no permite distinguir una observación con nubes de una sin nubes.

## 6. Agua del cultivo y ETo (fuera de la pantalla 5, para el motor)
- **Método:** ETo de Penman-Monteith de FAO-56 (ec. 6) con `T2M_MAX`, `T2M_MIN`, `RH2M`, `WS2M` y `ALLSKY_SFC_SW_DWN` de POWER. ETc = Kc × ETo, con los Kc de la Tabla 12 de FAO-56 (`metodos_citados_2026-11-15.json`).
- **Pendientes de la propia fuente** (mismo archivo): Kc ini en imagen, ecuaciones 62 y 65 de ajuste por clima árido, y la duración de etapas, que FAO da solo como guía.
- **Decisión que falta (V-A08):** la presión del aire de FAO-56 depende de la altitud. Hay que decidir si se usa la elevación de la celda de POWER o la de NASADEM en el centroide, y decirlo en pantalla. En Chivay difieren (celda a 4351,89 m).
- **Doble rejilla:** la radiación viene de la rejilla de 1° y el resto de variables de la de 0,5° × 0,625° (modelo lógico §1.1). El indicador guarda las dos celdas.

## 7. Suelo, aptitud, luz y humedad

### 7.1 I12 · Suelo estimado (SoilGrids)
- **Píxeles:** los de ≈ 250 m que **tocan** la parcela; si ninguno toca, el del centroide (`toca`, `_suelo_parcela`).
- **Variables:** 11 propiedades (`bdod`, `cec`, `cfvo`, `clay`, `nitrogen`, `phh2o`, `sand`, `silt`, `soc`, `wv0033`, `wv1500`) en 0–5, 5–15 y 15–30 cm, con media, Q0,05, Q0,5 y Q0,95 (`soilgrids_valle_s2.largo.csv`). Unidades y `d_factor` de `backend/catalogo/soilgrids_unidades.json`, leídos del campo `unit_measure` de la API REST de ISRIC (ej.: pH, `d_factor` 10; arcilla, g/kg → %).
- **Método actual** (`leer.py`): media aritmética de las medias de los píxeles que tocan, sin ponderar por área.
- **Propuesta:**
  - mostrar **por píxel** la media y el intervalo Q0,05–Q0,95;
  - no promediar los cuantiles entre píxeles: no hay un método citado para hacerlo (V-A09);
  - ponderar por área cubierta tampoco tiene método citado.
- **Vacíos:** `nodata_del_raster`.
- **`uncertainty`: no es un vacío.** Se guarda el **entero sin convertir**, con el motivo `sin_verificar`, porque su factor y su unidad no están verificados (V-06 del modelo lógico). Ejemplo: S2, pH de 0–5 cm, entero 5 (`soilgrids_valle_s2.largo.csv`). No se muestra como valor convertido.
- **Sin evaluar:**
  - **textura:** `sin_regla`, porque EcoCrop no define sus clases (`metodos_citados_…json`, `textura`). La clase textural USDA está pendiente de copiar sus límites del *Soil Survey Manual*;
  - **pH:** sin clases mientras no haya una cita.
- **Erodabilidad K:** la fórmula EPIC (Sharpley y Williams, 1990, ec. 2.96) está citada en `relieve_erosion_rotacion_…json`. Se propone calcularla con el limo real de SoilGrids, que ahora sí está en T01; la muestra anterior usó 100 − arena − arcilla. No está implementada.
- **Qué no significa:** es una predicción, no un análisis de suelo (docs/10 §6.4).

### 7.2 I18 · Aptitud por cultivo (FAO GAEZ v4)
- **Celda:** la de 0,0833° que contiene el centroide (`contiene_centroide`); la clave es la del modelo lógico §3.
- **Variable:** índice de 0 a 10 000, por cultivo y tipo de agua, período 1981–2010, insumos altos (`gaez.py`, `base_arequipa.json`).
  - Prefijo **«su…»:** «current cropland in grid cell».
  - Prefijo **«sx…»:** «all land in grid cell».
  - Es texto literal de `variable`, y los dos se muestran por separado.
- **Método:** el índice tal cual, **sin clases**. Las clases de aptitud de GAEZ no están copiadas con su cita en el repositorio (V-A10).
- **Vacíos:** `fallo_de_descarga` o valor no numérico.
- **Chivay y S2:** las 100 capas valen 0, sin capas vacías y ninguna distinta de 0 (T01 `gaez_chivay.normalizado.csv` y `gaez_valle_s2.normalizado.csv`, recontado). Majes riego: 26 de 100 distintas de 0 (`gaez_majes_riego.normalizado.csv`). **Chivay y S2 no se muestran** hasta resolver V-04 (si 0 es aptitud nula o una zona sin evaluar).
- **Qué no significa:** describe una celda de ≈ 9 km con clima de 1981–2010; no es la aptitud de la parcela.

### 7.3 I15 · Horas de luz
- **Método:** FAO-56, cap. 3, ec. 24, 25 y 34. Es la duración astronómica del día según la latitud: «ignores clouds, slope and horizon» (`luz_valle_s2_…procedencia.json`).
- **Salida:** mínimo y máximo por mes. Ejemplo verificado en S2: 11,0724 h el 21/06/2015 y 12,9275 h el 20/12/2015.
- **Vacíos:** `missing_days_polar` vacío; en Arequipa no aplica.
- **Qué no significa:** no son horas de sol medidas.

### 7.4 I16 · Humedad superficial (SMAP L3E, por AppEEARS)
- **Celda:** la de 9 km (EASE-Grid) que contiene el punto, identificada por (`Line_Y`, `Sample_X`).
- **Variable:** `Soil_Moisture_Retrieval_Data_AM_soil_moisture`, pasada de la mañana. **Unidad pendiente:** no aparece en los archivos descargados (`results.csv`, `README.md`, `metadata.xml`) (V-A11).
- **Calidad:** se usa la descripción del propio proveedor, columna `…retrieval_qual_flag_Recommended_Quality_Description`. Entra solo el valor con «Soil moisture retrieval has recommended quality». El resto va como `calidad_no_valida`; los −9999 van como `relleno_del_proveedor`.
- **Fechas:** **667 de 669 días** entre 2025-01-01 y 2026-10-31. Faltan el **18/03/2025** y el **18/10/2026** en los tres lugares (`fecha_ausente`; `…-results.csv`, columna `Date`).
- **Conteo verificado** (sobre esos 667 días):

  | Lugar | Relleno (−9999, bandera 7) | Sin calidad recomendada | Con calidad recomendada |
  |---|---|---|---|
  | Majes riego | 417 | 0 | 250 (bandera 8) |
  | Chivay | 417 | 63 (bandera 13) | 187 (bandera 8) |
  | **S2** | 417 | 250 (banderas 9 y 13) | **0** |

- **Consecuencia:** en S2 la tarjeta dice «sin dato con calidad recomendada en 2025–2026»; nunca 0.
- **Método propuesto:** valores por día, sin promedio mensual hasta citar un método (V-A12).
- **Qué no significa:** la humedad estimada de una celda de 9 km no es un análisis de suelo (AGENTS.md §6).

### 7.5 I17 · Humedad modelada (SMAP L4)
Verificado con la descarga del commit `2ba9f10`. Ruta: `trabajo/extraccion_pesada/salida/smap_l4_puntos/`.

- **Producto y capas:** `SPL4SMGP.008`, capas `Geophysical_Data_sm_surface` y `Geophysical_Data_sm_rootzone` (`tarpu-smap-l4-puntos-request.json`, `params.layers`). Cita del proveedor: Reichle, R., et al. (2025), *SMAP L4 Global 3-hourly 9 km EASE-Grid Surface and Root Zone Soil Moisture* (`…-SPL4SMGP-008-metadata.xml`).
- **Rejilla:** 9 km (`…-metadata.xml`, `gmd:spatialResolution`, 9000 `meters`), EASE-Grid (título de la cita).
- **Celda:** (`SPL4SMGP_008_Line_Y_9.00805km`, `SPL4SMGP_008_Sample_X_9.00805km`). Es la **misma celda que SMAP L3E** en cada lugar:

  | Lugar | Celda L4 | Celda L3E |
  |---|---|---|
  | Majes riego | (1040, 1154) | (1040, 1154) |
  | Chivay | (1030, 1161) | (1030, 1161) |
  | S2 | (1030, 1156) | (1030, 1156) |

  Chivay y S2 **no** comparten celda de SMAP; sí comparten la de POWER.
- **Frecuencia:** cada 3 horas, a las 01:30, 04:30, 07:30, 10:30, 13:30, 16:30, 19:30 y 22:30 UTC (columna `Date`). Del 2025-01-01 01:30 UTC al 2026-10-31 22:30 UTC: **669 días × 8 = 5352 valores por lugar y capa, sin huecos** (`…-results.csv`).
- **Unidad:** no aparece en los archivos descargados. **Pendiente de verificar** en la guía del producto (V-B06).
- **Relleno:** ningún valor negativo ni ningún −9999 en los 32 112 valores. El valor de relleno del producto **no aparece en los archivos: pendiente** (V-B06).
- **Calidad:** la descarga no trae banderas, porque solo se pidieron las dos capas. **Pendiente** (V-B06).
- **Rangos observados** (`…-results.csv`):

  | Lugar | Superficie | Raíz |
  |---|---|---|
  | Majes riego | 0,0244756 a 0,1710453 | 0,0219102 a 0,0462857 |
  | Chivay | 0,0511682 a 0,2925797 | 0,1340335 a 0,2395306 |
  | S2 | 0,0427613 a 0,2876837 | 0,0992421 a 0,264301 |

- **Método propuesto:** valores cada 3 h, sin promedio diario ni mensual hasta citar un método (V-A12).
- **S2:** L4 sí da valores en S2, donde L3E no tiene ninguno con calidad recomendada (§7.4). Son productos distintos (L4 es modelado) y la tarjeta debe decir cuál se muestra.
- **Qué no significa:** es humedad **modelada**, no observada directamente, y no es un análisis de suelo (AGENTS.md §6).

## 8. Pendientes de verificar

| Id | Qué falta | Cómo se resuelve |
|---|---|---|
| V-A01 | Que los límites de `CLASES_PENDIENTE` coincidan con el cuadro 7 de FAO (2006) | Leer el cuadro 7 de *Guidelines for soil description* |
| V-A02 | El exponente m de LS entre 3 y 3,5 % y entre 4,5 y 5 % | Wischmeier y Smith (1978), pp. 12-15 |
| V-A03 | El texto de la guía de MOD13 sobre los códigos 1 («marginal») y 3 («nubes») de `pixel_reliability`, y si la línea del NDVI se corta o solo se marca | Guía de usuario de MOD13; **lo decide Erick** |
| V-A04 | Método citado para repartir los compuestos de 8 días entre meses | Guía de MOD16 o FAO |
| V-A05 | Significado de los valores de 32701 a 32766 de MOD16A2GF | Guía de usuario de MOD16 |
| V-A06 | Cita para mostrar kg/m² como mm en MOD16A2GF | Guía de usuario de MOD16 |
| V-A07 | Si se cuenta «bajo 0 °C» en la temperatura de superficie nocturna | Decisión del equipo, registrada en docs/06 |
| V-A08 | Qué elevación usa la ETo: celda de POWER o NASADEM | Decisión del motor (Erick), con la cita de FAO-56 |
| V-A09 | Método para resumir SoilGrids cuando la parcela toca varios píxeles | Documentación de ISRIC |
| V-A10 | Clases del índice de aptitud de GAEZ v4, con cita | Documentación de GAEZ v4 |
| V-A11 | Unidad de la humedad de SMAP L3E | Guía de SPL3SMP_E v006 (NSIDC) |
| V-A12 | Método para resumir por mes la humedad de SMAP | Guía del producto |
| V-A13 | Magnitud del sesgo frío del clima de S2 (celda a 4351,89 m, punto a 2663 m) y cita para describirlo | Una fuente citada sobre la variación de la temperatura con la altura, o una estación de contraste en el valle; mientras tanto, solo aviso |
| V-04 | Si el 0 de GAEZ en Chivay y en S2 es aptitud nula o zona no evaluada | Modelo lógico §9 |
| V-05 | ~~HLS y SMAP L4: unidad, escala, relleno, calidad, fechas~~ | **Cerrada en lo que da la descarga** (commit `2ba9f10`): rejilla, capas, fechas y conteos en I08 e I17. Lo que falta sigue en V-B01 a V-B06 |
| V-B01 | Que −19999 sea el relleno documentado de HLS VI v2.0 | Guía de usuario de HLS |
| V-B02 | Capa de calidad de HLS (§6.4 de la guía) para cortar la línea por nubes | Volver a pedir los puntos con esa capa en AppEEARS |
| V-B03 | Regla citada para elegir una tesela de HLS cuando un punto cae en dos (Majes riego, Chivay), y para combinar o no L30 con S30 | Guía de usuario de HLS |
| V-B04 | Fila y columna del píxel de HLS (el CSV por punto solo da la tesela) | Pedido por área o guía de HLS |
| V-B05 | Unidad del NDVI de HLS | Guía de usuario de HLS |
| V-B06 | Unidad, relleno y banderas de calidad de SMAP L4 (`sm_surface`, `sm_rootzone`) | Guía de SPL4SMGP v008 (NSIDC) |
| V-09 | El 16/10/2022 que no publica MOD11A2 | Modelo lógico §9 |

# Ficha · NASA POWER

> Fuente de clima del núcleo sin cuenta y principal «dato de NASA» de la demo. Verificada el 14/11/2026 con consultas reales a Majes y Chivay y contrastada con la documentación oficial de POWER. Script: [consulta_power.py](consulta_power.py), escrito con asistencia de IA (Claude Code).
>
> Ficha redactada con asistencia de IA (Claude Code).

## Cómo se usa

```bash
python datos/power/consulta_power.py --lat -16.351 --lon -72.190 --inicio 20250101 --fin 20251231 --nombre majes
python datos/power/consulta_power.py --lat -15.64 --lon -71.60 --inicio 20250101 --fin 20251231 --nombre chivay
```

Solo Python 3 con la biblioteca estándar. Deja tres archivos en `datos/muestras/`:

| Archivo | Qué es |
|---|---|
| `power_<nombre>_<inicio>_<fin>.original.json` | Respuesta del proveedor, sin tocar |
| `power_<nombre>_<inicio>_<fin>.normalizado.csv` | Una fila por día, con las unidades en la cabecera; los faltantes, vacíos |
| `power_<nombre>_<inicio>_<fin>.procedencia.json` | URL exacta, fecha de consulta, versión de la API, unidades, valor de relleno, faltantes, elevación de la celda y fuentes |

## Las siete preguntas

### ¿Qué producto y versión exactos?

- **Producto:** NASA POWER (Prediction Of Worldwide Energy Resources), **Daily API**, punto, comunidad `AG` (agroclimática).
- **Versión:** `v2.10.3`, según la cabecera de la respuesta (`header.api.version`) en las dos consultas.
- **Título de la respuesta:** «NASA/POWER Source Native Resolution Daily Data».
- **Fuentes que declara la respuesta:** `MERRA2`, `SYN1DEG` y `POWER`. Según la documentación:
  - la meteorología viene de MERRA-2, y de GEOS-IT para el tramo más reciente;
  - la radiación viene de CERES SYN1deg, y de FLASHFlux para el tramo más reciente.

### ¿Cómo se accede? (URL, cuenta, clave)

- **URL:** `https://power.larc.nasa.gov/api/temporal/daily/point`, con `parameters`, `community`, `latitude`, `longitude`, `start`, `end` y `format=JSON`.
- **Cuenta y clave:** no hacen falta.
- **Límites documentados** ([API diaria](https://power.larc.nasa.gov/docs/services/api/temporal/daily/)):
  - hasta 20 parámetros por petición de punto;
  - basta una petición por celda: si una aplicación repite la misma ubicación, la documentación avisa de que «potentially» será bloqueada.
- **Límite numérico de llamadas:** no se encontró en la documentación.

### ¿Qué formato devuelve?

JSON con forma de GeoJSON `Feature`:

- `geometry.coordinates`: longitud, latitud y elevación;
- `header`: título, versión de la API, fuentes, `fill_value`, `time_standard`, `start` y `end`;
- `parameters`: unidad y nombre largo de cada variable;
- `properties.parameter`: una serie por variable, con claves de fecha `AAAAMMDD`;
- `messages`: vacío en las dos consultas.

`time_standard` es `LST` (hora solar local). Según la documentación, la API diaria usa LST por defecto y la agregación diaria se hace en hora solar local.

### ¿Unidades y valor de relleno de los faltantes?

Unidades y nombres según la respuesta del servicio:

| Variable | Nombre largo (servicio) | Unidad |
|---|---|---|
| `T2M` | Temperature at 2 Meters | °C |
| `T2M_MAX` | Temperature at 2 Meters Maximum | °C |
| `T2M_MIN` | Temperature at 2 Meters Minimum | °C |
| `PRECTOTCORR` | Precipitation Corrected | mm/día |
| `RH2M` | Relative Humidity at 2 Meters | % |
| `ALLSKY_SFC_SW_DWN` | All Sky Surface Shortwave Downward Irradiance | MJ/m²/día |

- **`PRECTOTCORR`:** según la documentación, es la precipitación de MERRA-2 sobre tierra con un forzamiento corregido con observaciones. No es IMERG, que en POWER es otro parámetro (`IMERG_PRECTOT`).
- **Valor de relleno:** `-999.0`, tomado de `header.fill_value` de la respuesta. **No se encontró en las páginas de documentación leídas**: el script lo lee de cada respuesta en lugar de suponerlo.
- **En el CSV**, un faltante queda vacío y se cuenta en `missing_days`. **Nunca se convierte en cero.**

### ¿Resolución espacial y temporal? ¿Latencia?

| Aspecto | Valor | Fuente |
|---|---|---|
| Resolución de la meteorología (MERRA-2) | ½° de latitud × ⅝° de longitud | [Fuentes de meteorología](https://power.larc.nasa.gov/docs/methodology/data/sources_meteorology/) |
| Resolución de la radiación (CERES SYN1deg) | 1° × 1° | [Fuentes de flujos](https://power.larc.nasa.gov/docs/methodology/data/sources_fluxes/) |
| Resolución temporal | Diaria | API diaria |
| Cobertura temporal de la API diaria | Del 01/01/1981 a casi tiempo real | API diaria |
| Latencia de la meteorología | Unos 2 días (GEOS-IT); MERRA-2 llega hasta un mes antes del tiempo real | Fuentes de meteorología |
| Latencia de la radiación | 5 a 7 días según la tabla, o unos 4 días según el texto (FLASHFlux); SYN1deg llega hasta 3–4 meses antes del tiempo real | Fuentes de flujos |

- **Discrepancias en la documentación oficial:**
  - la página de la API diaria menciona una grilla de 0,5° × 0,5°, mientras que la de meteorología dice ½° × ⅝°;
  - la latencia de FLASHFlux aparece como «about four days» en el texto y como 5–7 días en la tabla.
- **Punto o celda:** la documentación dice que los datos se entregan a la resolución nativa de cada fuente, y que los parámetros de MERRA-2 son la media de la celda. **No se encontró** si el valor de un punto se interpola o es el de la celda que lo contiene: no verificado.
- **Celdas distintas:** la temperatura y la radiación vienen de celdas de tamaño distinto (½° × ⅝° frente a 1° × 1°).

### ¿Cubre Arequipa?

Sí. POWER es global, y las dos consultas devolvieron 365 días de 2025 sin faltantes. POWER figura además en la lista de recursos oficiales del desafío ([docs/08](../../docs/08-desafio-oficial.md)), así que **cuenta como dato de NASA**.

### ¿Condiciones de uso y atribución?

- **Licencia o condiciones de uso:** **no se encontraron** en las páginas leídas (API diaria, metodología, referencias, agradecimientos). Queda por verificar; no se asume una licencia.
- **Cita:** la [página de referencias](https://power.larc.nasa.gov/docs/referencing/) pide incluir dos textos en cualquier publicación o producto.
  - *POWER's Reference*: «The data was obtained from National Aeronautics and Space Administration (NASA) Langley Research Center's Prediction Of Worldwide Energy Resources (POWER) project funded through the NASA Earth Science Division.»
  - *POWER's Data Reference*: la plantilla oficial dice «The data was obtained from the POWER Project's Hourly 2.x.x version on YYYY/MM/DD.», con el servicio, la versión y la fecha de acceso. Para estas muestras, la adaptación propuesta es «The data was obtained from the POWER Project's Daily API v2.10.3 on 2026/11/14.». La plantilla oficial dice «Hourly» aunque se usen datos diarios.
- **Petición del proyecto:** POWER pide que se le envíe la referencia o el enlace del trabajo a `larc-power-project@mail.nasa.gov`. Es una petición, no una condición.
- **DOI:** no se encontró.

## Resultado del 14/11/2026

| Punto | Rango de fechas | Días | Faltantes | Elevación de la celda | Consultado (UTC) |
|---|---|---|---|---|---|
| Majes (−16,351; −72,190) | 01/01/2025 – 31/12/2025 | 365 | 0 en las 6 variables | 835 m | 14/11/2026 14:23 |
| Majes riego (−16,367023; −72,185771) | 01/01/2025 – 31/12/2025 | 365 | 0 en las 6 variables | 1 941 m | 15/11/2026 01:27 |
| Chivay (−15,64; −71,60) | 01/01/2025 – 31/12/2025 | 365 | 0 en las 6 variables | 4 352 m | 14/11/2026 18:46 |

Resumen calculado del CSV normalizado:

| Punto | T media | T máx. más alta | T mín. más baja | Días con mínima < 0 °C | Lluvia acumulada |
|---|---|---|---|---|---|
| Majes | 18,4 °C | 26,4 °C | 11,0 °C | 0 | 169,6 mm |
| Majes riego | 16,5 °C | 26,0 °C | 7,7 °C | 0 | 194,0 mm |
| Chivay | 6,2 °C | 19,8 °C | −5,8 °C | 157 | 405,2 mm |

## Límites (qué no dice)

- **Es una celda de grilla amplia, no la parcela.** En Chivay, la elevación de la celda es de **4 352 m**, mientras que el pueblo está a unos **3 600 m**.
  - Por eso, las temperaturas mínimas y las heladas de la muestra (mínima de −5,8 °C y 157 días bajo 0 °C en 2025) **pueden estar exageradas** respecto del valle donde se cultiva.
  - Sirve como **contexto regional**, no como clima de una parcela.
  - Antes de usarlo en la demo, hay que **contrastarlo con una estación de SENAMHI** o **presentarlo como una aproximación regional**.
- **La elevación de la respuesta** (tercer valor de `geometry.coordinates`) no está definida en la documentación leída. Que sea la elevación media de la celda de MERRA-2 (la documentación dice que la elevación de la celda es «the mean elevation of the earth's surface under the grid») es probable, pero no está confirmado.
- **Un histórico no es un pronóstico.** La serie de 2025 describe ese año, no el próximo.
- **Distinta fuente y escala:** la radiación y la meteorología vienen de fuentes y celdas distintas, así que no hay que tratarlas como medidas en el mismo lugar.
- **Dos puntos a unos 2 km pueden dar temperaturas muy distintas por el borde de celda.**
  - **Comparación comprobada el 14/11/2026:** punto urbano de Majes (−16,351; −72,190, `power_majes_20250101_20251231.*`) frente al punto de riego (−16,367023; −72,185771, `power_majes_riego_20250101_20251231.*`).
  - **Lo que coincide:** la radiación es idéntica los 365 días: es la misma celda de 1° × 1°.
  - **Lo que difiere:** la temperatura y la humedad, todos los días, y la lluvia, en casi todos (coincide en 61). Son celdas distintas de ½° × ⅝°. Por ejemplo, la media del 01/01/2025 es de 20,08 °C en el punto urbano y de 16,50 °C en el de riego.
  - **Elevación de la celda:** 835 m en el punto urbano y 1 941 m en el de riego.
  - **Muestra de POWER para Majes:** la del punto de riego, `power_majes_riego_20250101_20251231`.
  - **Explicación posible (no verificada):** si POWER entrega la celda nativa de MERRA-2, con centros de longitud cada 0,625° desde −180°, el borde entre las celdas centradas en −72,5° y −71,875° pasa por −72,1875°. El punto urbano (−72,190) quedaría al oeste y el de riego (−72,1858) al este, cada uno en una celda con su propia elevación media. Esa diferencia de elevación explicaría la de temperatura. No está confirmado en la documentación, que tampoco dice si el valor de un punto se interpola.
- **La lluvia no es IMERG:** `PRECTOTCORR` es la precipitación corregida de MERRA-2. Para la lluvia de la sierra, el análisis propone IMERG como fuente principal.

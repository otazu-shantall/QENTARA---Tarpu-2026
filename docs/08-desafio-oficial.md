# Desafío oficial

> Leído del sitio oficial el **14/11/2026**: [Field Shift: Adapting Farms with NASA Data](https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/). Esto cierra buena parte de SUP-035 (el desafío exacto ya se conoce). Los textos entre comillas son citas del sitio; lo demás es resumen nuestro.

## Ficha

| Dato | Valor |
|---|---|
| Desafío | **Field Shift: Adapting Farms with NASA Data** |
| Evento | 2026 NASA Space Apps Challenge, **14 y 15 de noviembre de 2026** |
| Dificultad | Intermedia y avanzada |
| Temas | Artes y multimedia · Ciencias de la Tierra · Software |
| Equipo | Máximo 6 integrantes (somos 5) |

## Qué pide

Crear una **herramienta de apoyo a decisiones** que use observaciones de la Tierra de NASA, junto con información local de suelo, características de los cultivos y prioridades del agricultor, para ayudar a explorar **estrategias de rotación** que fortalezcan la salud del suelo y adapten las fincas a condiciones cambiantes.

Frase clave del resultado esperado: *"a supportive tool — one that helps identify patterns and possibilities, but does not replace farmer judgment or local agricultural expertise."*

## Lo que sugiere el desafío y cómo responde TARPU

Todo lo que el desafío propone lleva «may» (es opcional), pero es lo que los jueces esperan ver.

| El desafío sugiere | TARPU hoy | Qué falta |
|---|---|---|
| Combinar datos de NASA con información agrícola local | Primera consulta real a NASA POWER (`datos/`) | Llevar ese dato a la app |
| **Comparar al menos tres estrategias de rotación, incluida la actual** | Pantalla de rotaciones con papa (actual) y quinua, haba y cebada como candidatos, sin puntaje | Mostrar tres estrategias con sus razones |
| Para cada estrategia: por qué se sugiere, qué evidencia la respalda, qué beneficios ofrece, **qué vacíos de información hay** y qué riesgos necesitan revisión local | Es el principio central de TARPU («qué dice y qué no dice», no evaluable si falta evidencia) | Rellenarlo con evidencia real |
| Señalar épocas en que el campo queda sin cultivo o el cultivo es más vulnerable | — | Lectura de la serie climática por meses |
| Prioridades del agricultor (agua, forraje, fijación de nitrógeno, erosión, materia orgánica, mercado) | Propuesta de pesos en el informe (SUP-019) | Una entrada sencilla de prioridades |
| Explicar términos (evapotranspiración, NDVI, riesgo de helada, balance hídrico) | Agente y capas de evidencia | Ampliar las explicaciones |
| Aclarar la diferencia entre satélite y medición en campo | Límites científicos visibles en toda la app | — |
| Diseño centrado en el agricultor, fácil de interpretar | Dirección de diseño actual; falta adaptarla a personas mayores | Ver [areas/frontend.md](areas/frontend.md) |
| Recordar que apoya y no reemplaza el criterio local | Avisos en landing, agente y rotaciones | — |
| Mapas interactivos, líneas de tiempo, capas | Mapa real con Leaflet | Capas de datos |

**«SI» en el texto oficial** significa *Super Intelligence*: así llama el sitio a las herramientas de IA (aprendizaje automático, chatbots, generación de imágenes y modelos de lenguaje).

## Recursos oficiales del desafío

De la pestaña *Resources*. La columna «¿Sirve para Arequipa?» es la primera valoración. **El análisis detallado y verificado está en [datos/analisis-recursos.md](../datos/analisis-recursos.md):** comprueba en el catálogo de NASA qué productos tienen datos sobre Majes y Chivay, cuáles se usan sin cuenta, y añade HLS, GIBS y SoilGrids.

### Datos de NASA

| Recurso | Qué da | ¿Sirve para Arequipa? |
|---|---|---|
| [NASA POWER](https://power.larc.nasa.gov/) | Temperatura, humedad, radiación y climatología para agricultura | **Sí, global. Ya consultado** |
| [GPM / IMERG](https://gpm.nasa.gov/data) | Precipitación y acumulados | Sí, global |
| [SMAP](https://www.earthdata.nasa.gov/data/platforms/space-based-platforms/smap) | Humedad superficial del suelo cada 2 o 3 días | Sí, global (grilla gruesa) |
| [Landsat](https://earthexplorer.usgs.gov/), [MODIS](https://lpdaac.usgs.gov/products/), [VIIRS](https://search.earthdata.nasa.gov/search?q=VIIRS) | Reflectancia, NDVI e índices de vegetación (30 m; 250 a 1000 m) | Sí, global |
| [SRTM](https://www.earthdata.nasa.gov/data/instruments/srtm) | Elevación: pendiente, escorrentía, riesgo de erosión | Sí, global |
| [ECOSTRESS](https://ecostress.jpl.nasa.gov/data) | Temperatura de superficie y evapotranspiración | Sí, cobertura por comprobar |
| [NLDAS / GLDAS](https://www.earthdata.nasa.gov/) | Series de temperatura, lluvia, humedad del suelo | GLDAS es global; NLDAS solo Norteamérica |
| [GEDI](https://gedi.umd.edu/data) | Estructura de vegetación y biomasa | Poco útil para cultivos bajos |
| GRACE y GRACE-FO (citados en los objetivos) | Tendencias de agua a largo plazo | Global, escala regional muy gruesa |

### Socios y otras fuentes globales

| Recurso | Qué da | ¿Sirve para Arequipa? |
|---|---|---|
| [Copernicus Sentinel-2 (ESA)](https://dataspace.copernicus.eu/) | Imágenes multiespectrales de 10 a 20 m | Sí, global |
| [ERA5 (ECMWF)](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview) | Reanálisis horario del clima | Sí, global |
| [FAO GAEZ](https://gaez.fao.org/) | Aptitud agroclimática por cultivo, restricciones de suelo y agua | **Sí, global. Muy útil para rotaciones** |

### Solo Estados Unidos (no sirven para Arequipa)

USDA Ag Data Commons, Web Soil Survey, Cropland Data Layer (CropScape), PRISM, SSURGO/STATSGO2, NAIP, NLCD, CoCoRaHS, USGS NWIS, USDA AMS Market News, USDA NASS QuickStats, OpenET y LANDFIRE.

Sirven como **modelo de qué información local haría falta**. Para Perú habría que buscar los equivalentes (MIDAGRI, SENAMHI, INIA, ANA), que es una tarea para el área de investigación.

## Consecuencias para TARPU

- **El enfoque de rotaciones es exactamente el del desafío.** Lo que ya está definido (parcela, evidencia, agente, datos abiertos, límites visibles) responde a lo que se pide.
- **Para el criterio de Relevancia**, el dato de NASA debe ser parte central de la solución y no un añadido. POWER tiene que verse en la app.
- **Para ser elegibles a un premio global** hay que usar al menos un dato o recurso de NASA.
- El informe maestro usaba Sentinel-2 como fuente de vegetación. El desafío también cita Landsat y MODIS, que son de NASA y cuentan como dato de NASA.

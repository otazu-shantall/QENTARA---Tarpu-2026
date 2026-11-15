# Referencias

> Para el campo **«Space Agency Partner Data and Other References»**. La guía pide listar **todos** los datos, recursos y herramientas usados, incluidos código, texto e imágenes, aunque sean libres. Cada área añade lo suyo. Solo se lista lo que **de verdad se usa** en la versión enviada.

## Datos de NASA (van también en el campo «NASA Data»)

| Recurso | Uso en TARPU | Enlace | ¿Usado ya? |
|---|---|---|---|
| NASA POWER, Daily Point API (AG), v2.10.3 | Clima histórico de un punto de Majes, 2025 | https://power.larc.nasa.gov/ | ✅ consulta real en `datos/` |
| NASA POWER, Daily Point API (AG), v2.10.3 | Clima histórico de Chivay, 2025. Cita oficial (dos partes): «The data was obtained from National Aeronautics and Space Administration (NASA) Langley Research Center's Prediction Of Worldwide Energy Resources (POWER) project funded through the NASA Earth Science Division.» + «The data was obtained from the POWER Project's Daily API v2.10.3 on 2026/11/14.» (plantilla oficial adaptada; ver [ficha](../datos/power/README.md)) | https://power.larc.nasa.gov/docs/referencing/ | ✅ consulta real en `datos/` |
| MODIS/Terra Vegetation Indices 16-Day L3 Global 250m SIN Grid V061 (MOD13Q1) | Serie de NDVI 2015–2026 en Chivay y Majes (riego). Cita: Didan, K. (2021). *MODIS/Terra Vegetation Indices 16-Day L3 Global 250m SIN Grid V061* [Data set]. NASA Land Processes Distributed Active Archive Center. | https://doi.org/10.5067/MODIS/MOD13Q1.061 | ✅ consulta real en `datos/` ([ficha](../datos/ndvi/README.md)) |
| ORNL DAAC, TESViS RESTful Web Service (MODIS/VIIRS Land Product Subsets) | Herramienta con la que se obtuvo el NDVI de un píxel. Cita: ORNL DAAC. 2018. *Terrestrial Ecology Subsetting & Visualization Services (TESViS) RESTful Web Service*. ORNL DAAC, Oak Ridge, Tennessee, USA. Se añade fecha de acceso, producto, punto, período y tamaño del recorte (un píxel) | https://doi.org/10.3334/ORNLDAAC/1600 | ✅ usada en `datos/ndvi/` |

## Datos de agencias socias y otras fuentes

| Recurso | Uso | Enlace | ¿Usado ya? |
|---|---|---|---|
| ISRIC SoilGrids 2.0 (API REST v2.0, beta) | pH, arcilla, arena y carbono orgánico a 0–5 y 5–15 cm en Chivay y Majes. **No es un dato de NASA**: va solo aquí, no en «NASA Data». Licencia CC BY 4.0. Cita: Poggio, L., de Sousa, L. M., Batjes, N. H., Heuvelink, G. B. M., Kempen, B., Ribeiro, E., and Rossiter, D.: SoilGrids 2.0: producing soil information for the globe with quantified spatial uncertainty, *SOIL*, 7, 217–240, 2021. | https://doi.org/10.5194/soil-7-217-2021 | ✅ consulta real en `datos/` ([ficha](../datos/soilgrids/README.md)) |

## Mapas e imágenes

| Recurso | Uso | Enlace | Condiciones |
|---|---|---|---|
| Esri World Imagery | Mapa base satelital e imágenes de la landing | https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer | **Por revisar** |
| OpenStreetMap | Mapa base de calles | https://www.openstreetmap.org/copyright | ODbL; atribución obligatoria |

### Logo del equipo en el nuevo frontend

Logo QENTARA: imagen proporcionada como recurso del equipo, utilizada sin alteraciones en `frontend/public/brand/qentara-logo.jpeg`. Procedencia de archivos en [frontend/ASSETS.md](../frontend/ASSETS.md). Las fotografías de la galería adicional y la adaptación anterior del logo ya no se utilizan en la interfaz.

## Software y bibliotecas

| Recurso | Uso | Licencia |
|---|---|---|
| React 19 | Interfaz web | MIT |
| TypeScript 5.9 | Lenguaje | Apache 2.0 |
| Vite 8 | Compilación | MIT |
| Leaflet 1.9.4 | Mapa | BSD 2-Clause |
| Lucide | Iconos | ISC |
| Playwright | Pruebas | Apache 2.0 |
| Python 3 (biblioteca estándar) | Script de datos | PSF |

Las licencias de esta tabla hay que **confirmarlas** en cada proyecto antes de enviarlas.

## Tipografías

| Recurso | Uso | Licencia |
|---|---|---|
| Geist | Interfaz | Por confirmar (Google Fonts) |
| Instrument Serif | Titulares | Por confirmar (Google Fonts) |

## Documentos consultados

| Recurso | Uso | Enlace |
|---|---|---|
| INIA, Manual técnico: manejo integrado del cultivo de papa (2020) | Referencia sobre rotación | https://repositorio.inia.gob.pe/handle/20.500.12955/1146 |
| MIDAGRI, anuarios agropecuarios | Cifras del problema (pendiente de extraer) | https://www.gob.pe/institucion/midagri/colecciones/5149-anuarios-estadisticas-de-produccion-agropecuaria |
| INEI, Compendio Estadístico Arequipa 2024 | Cifras del problema (pendiente de extraer) | https://www.gob.pe/institucion/inei/informes-publicaciones/6453267-compendio-estadistico-arequipa-2024 |

## Herramientas de IA

Ver [uso-de-ia.md](uso-de-ia.md).

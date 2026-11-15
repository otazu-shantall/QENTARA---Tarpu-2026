# Registro de uso de IA

> Space Apps permite usar IA como herramienta, pero **exige declarar dónde y cómo**. Cada integrante anota aquí lo que use. Reglas en [docs/09-entrega-oficial.md](../docs/09-entrega-oficial.md#reglas-sobre-el-uso-de-ia).

## Qué exige la regla

| Tipo de contenido | Obligación |
|---|---|
| Imágenes y videos generados con IA | Marca de agua visible |
| Audio generado con IA | Declararlo en texto descriptivo y metadatos |
| Código y datos generados con IA | Declararlo en texto descriptivo y metadatos |
| Cualquier contenido generado | No usar ni modificar la marca de NASA |

La IA no debe usarse para idear la solución. La idea, el alcance y los límites de TARPU los definió el equipo.

## Registro

| Fecha | Quién | Herramienta | Para qué | Dónde quedó | ¿Declarado en el archivo? |
|---|---|---|---|---|---|
| Oct. 2026 | Erick | OpenAI Codex | Informe maestro y primer prototipo del dashboard | `Documentación/`, `Codigo/` | ❌ falta |
| 27/10/2026 | Erick | OpenAI Codex | Mapa real con Leaflet | `Codigo/src/features/monitor/` | ❌ falta |
| 09/11/2026 | Erick | Claude Code | Rediseño de landing y dashboard; versiones del logo en blanco y negro | `Codigo/`, `Codigo/public/brand/` | ❌ falta |
| 14/11/2026 | Erick | Claude Code | Organización de la documentación | `docs/` | — |
| 14/11/2026 | Erick | Claude Code | Script de consulta a NASA POWER | `datos/power/consulta_power.py` | ✅ en el encabezado |
| 14/11/2026 | Damaris | Claude Code | Script de consulta a ISRIC SoilGrids | `datos/soilgrids/consulta_soilgrids.py` | ✅ en el encabezado |
| 14/11/2026 | Damaris | Claude Code | Script de NDVI MODIS (MOD13Q1) por el servicio de ORNL, con caché y reanudación | `datos/ndvi/consulta_ndvi.py` | ✅ en el encabezado |
| 14/11/2026 | Damaris | Claude | Script que lanza las consultas de POWER, SoilGrids y NDVI para los dos puntos | `datos/obtener_muestras.py` | ✅ en el encabezado |
| 14/11/2026 | Damaris | Claude Code | Ficha de la fuente NASA POWER | `datos/power/README.md` | ✅ en el encabezado |
| 14/11/2026 | Damaris | Claude Code | Ficha de la fuente ISRIC SoilGrids | `datos/soilgrids/README.md` | ✅ en el encabezado |
| 14/11/2026 | Damaris | Claude Code | Ficha de la fuente NDVI MOD13Q1 | `datos/ndvi/README.md` | ✅ en el encabezado |
| 14/11/2026 | Damaris | Claude Code | Filas del área de datos en el registro de IA y en las referencias; propuesta de datos y estado | `entrega/uso-de-ia.md`, `entrega/referencias.md`, `docs/areas/propuesta-datos.md`, `docs/` | — |
| 14/11/2026 | Erick | Claude Code | Diseño del backend, catálogo citado, diagramas (mapa, archivos e interactivo) y guías de Derecho | `backend/` (incluye `backend/diagramas/`), `entrega/*.pdf` | ✅ en el diagrama interactivo y en los generadores de diagramas; ❌ falta en los PDF |
| 14/11/2026 | Erick | Claude Code | Código del backend (API, motor, agente, exportación) y sus pruebas | `backend/tarpu_api/`, `backend/tests/` | ✅ en el encabezado de cada archivo |
| 15/11/2026 | Erick | Claude Code | Investigación de fuentes, sectores y cultivos (datos reunidos de EcoCrop, INEI, GAEZ y POWER) y script de prueba de Earthdata | `backend/investigacion/`, `backend/herramientas/prueba_earthdata.py`, `prueba_earthdata_area.py` y `redatam_cenagro.py`, `docs/tareas/T01-paquete-extraccion.md`, `backend/PLAN-*.md` | ✅ en el encabezado del script y en la descripción del JSON |
| 15/11/2026 | Damaris | Claude Code | Paquete de extracción `tarpu_datos` (NASA POWER, SoilGrids por WCS, FAO GAEZ, horas de luz FAO-56 y MODIS por ORNL), sus comprobaciones y las notas técnicas de T01 | `trabajo/T01-paquete-extraccion/tarpu_datos/`, `trabajo/T01-paquete-extraccion/README.md` (§9) | ✅ en el encabezado de cada archivo y en la §9 |
| 15/11/2026 | Erick | Claude Code | Scripts de extracción pesada de AppEEARS (NASADEM, HLS, SMAP, imágenes de Chivay) y diagnóstico de la prueba por área | `trabajo/extraccion_pesada/` | ✅ en el encabezado del script y del README |
| 15/11/2026 | Erick | Claude Code | Paquete de extracción en el backend (copia corregida de T01), actualización periódica, integración en la API y pruebas | `backend/tarpu_datos/`, `backend/tarpu_api/main.py`, `backend/tests/test_tarpu_datos.py` | ✅ en el encabezado de cada archivo |
| 15/11/2026 | Erick | Claude Code | Extracción de la base de Arequipa (T02): SoilGrids y GAEZ por área, POWER por celdas, NASADEM y CENAGRO | `trabajo/T02-base-arequipa/` | ✅ en el encabezado del script y del README |
| 15/11/2026 | Erick | Claude Code | Guía única de Derecho en PDF (entrega, pitch, video y documentación), documento del esquema mixto (DT-22) y alineación de la documentación | `entrega/Guia_Derecho_Entrega_y_Pitch.pdf`, `docs/11-esquema-mixto.md`, `docs/` | ✅ en el pie de cada página y en los metadatos del PDF; en el encabezado de docs/11 |
| 15/11/2026 | Erick | Claude Code | Guía para lanzar las extracciones y retomar tras un corte; descargas atómicas y reintentos en `pesados.py` | `trabajo/README.md`, `trabajo/extraccion_pesada/pesados.py` | ✅ en el encabezado |
| 15/11/2026 | Erick | Claude Code | Fichas EcoCrop de forrajes, regla de cultivos por sector (generador y catálogo), métodos citados (Kc, LS, textura, rotación, beneficios) y decisiones DT-19 a DT-21 | `backend/investigacion/`, `backend/catalogo/sectores.json`, `backend/herramientas/generar_sectores.py`, `docs/06` | ✅ en el encabezado del script y en la descripción de los JSON |
| | | | | | |

## Pendientes

- [ ] Confirmar cómo se hicieron `Logo Tarpu.png` y `Tarpu_ Branding.png`. Si son generados con IA y se muestran en la entrega, necesitan **marca de agua visible**.
- [ ] Añadir al README del repositorio público una sección en inglés, «AI assistance», que diga qué partes se hicieron con ayuda de IA.
- [ ] Añadir la nota de IA a los archivos de código marcados con ❌.
- [ ] Pasar el resumen de esta tabla al campo *Use of Super Intelligence (SI)* del [formulario](formulario-envio.md).

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
| 15/11/2026 | Erick | Claude Code | Supabase local, esquema v0 y seed, repositorio archivos/Supabase, celdas y reutilización, trabajador, sincronización con Storage, Dockerfile y Docker Compose, huecos de T03 | `supabase/`, `infra/`, `backend/Dockerfile`, `backend/docker/`, `backend/tarpu_datos/` (`repositorio/`, `celdas.py`, `coordenada/`, `base/sincronizar.py`), `backend/catalogo/variables.json`, `indicadores.json`, `package.json` | ✅ en el encabezado de cada archivo |
| 15/11/2026 | Erick | Claude Code | Plan de carpetas oficiales, simulación con Docker y Supabase, despliegue y reutilización por celda | `docs/12-carpetas-docker-y-despliegue.md` | ✅ en el encabezado |
| 15/11/2026 | Erick | Claude Code | Enunciado de la tarea T03 (modelado de los datos) para Damaris | `trabajo/T03-modelado-datos/` | ✅ en el encabezado del README |
| 15/11/2026 | Erick | Claude Code | Pantalla de prueba v3: dibujo de la parcela por esquinas, imagen Clarity, detener extracciones; lectura de la base en toda la parcela y rutas de parcela y cancelación | `backend/prueba_web/`, `backend/tarpu_datos/base/leer.py`, `backend/tarpu_datos/coordenada/trabajos.py`, `backend/tarpu_datos/fuentes/ornl.py`, `backend/tarpu_api/` | ✅ en el encabezado de cada archivo |
| 15/11/2026 | Erick | Claude Code | Pantalla de prueba v2: logo, puntos extraídos, zoom hasta 21; rutas de lista de trabajos y separación de vacíos del proveedor | `backend/prueba_web/`, `backend/tarpu_datos/coordenada/trabajos.py`, `backend/tarpu_api/` | ✅ en el encabezado de cada archivo |
| 15/11/2026 | Erick | Claude Code | Pantalla web de prueba de la integración, mapa de sectores desde NASADEM y rutas de trabajos y archivos en la API | `backend/prueba_web/index.html`, `backend/tarpu_datos/base/mapa.py`, `backend/tarpu_api/coordenada.py`, `backend/tarpu_api/main.py` | ✅ en el encabezado de cada archivo |
| 15/11/2026 | Erick | Claude Code | Carpeta oficial `tarpu_datos` ordenada, lector de la base en un punto, ruta `GET /api/base`, trabajos por coordenada y plan de plataformas | `backend/tarpu_datos/`, `backend/tarpu_api/base.py`, `backend/PLAN-PLATAFORMAS-Y-COORDENADA.md`, `backend/catalogo/soilgrids_unidades.json` | ✅ en el encabezado de cada archivo |
| 15/11/2026 | Erick | Claude Code | Paquete de extracción en el backend (copia corregida de T01), actualización periódica, integración en la API y pruebas | `backend/tarpu_datos/`, `backend/tarpu_api/main.py`, `backend/tests/test_tarpu_datos.py` | ✅ en el encabezado de cada archivo |
| 15/11/2026 | Erick | Claude Code | Extracción de la base de Arequipa (T02): SoilGrids y GAEZ por área, POWER por celdas, NASADEM y CENAGRO | `trabajo/T02-base-arequipa/` | ✅ en el encabezado del script y del README |
| 15/11/2026 | Erick | Claude Code | Guía única de Derecho en PDF (entrega, pitch, video y documentación), documento del esquema mixto (DT-22) y alineación de la documentación | `entrega/Guia_Derecho_Entrega_y_Pitch.pdf`, `docs/11-esquema-mixto.md`, `docs/` | ✅ en el pie de cada página y en los metadatos del PDF; en el encabezado de docs/11 |
| 15/11/2026 | Erick | Claude Code | Guía para lanzar las extracciones y retomar tras un corte; descargas atómicas y reintentos en `pesados.py` | `trabajo/README.md`, `trabajo/extraccion_pesada/pesados.py` | ✅ en el encabezado |
| 15/11/2026 | Erick | Claude Code | Fichas EcoCrop de forrajes, regla de cultivos por sector (generador y catálogo), métodos citados (Kc, LS, textura, rotación, beneficios) y decisiones DT-19 a DT-21 | `backend/investigacion/`, `backend/catalogo/sectores.json`, `backend/herramientas/generar_sectores.py`, `docs/06` | ✅ en el encabezado del script y en la descripción de los JSON |
| 15/11/2026 | Damaris | Claude Code | T03, modelo lógico de los datos del esquema mixto: entidades, identificación de celdas, vacíos, procedencia y diagrama | `trabajo/T03-modelado-datos/modelo-logico.md` | ✅ en el encabezado |
| 15/11/2026 | Damaris | Claude Code | T03, agregaciones de la pantalla 5: método citado, celdas, período y vacíos de cada indicador | `trabajo/T03-modelado-datos/agregaciones.md` | ✅ en el encabezado |
| 15/11/2026 | Damaris | Claude Code | T03, diccionario de variables (POWER, MODIS, HLS, SMAP, NASADEM, SoilGrids, GAEZ, luz y CENAGRO) y filas de HLS y SMAP L4 con la descarga | `trabajo/T03-modelado-datos/diccionario-variables.md`, `agregaciones.md`, `modelo-logico.md` | ✅ en el encabezado |
| 15/11/2026 | Damaris | Claude Code | T03, contrato de datos por pantalla (las 9 pantallas de docs/10, con su fuente, campos y vacíos) | `trabajo/T03-modelado-datos/contrato-pantallas.md` | ✅ en el encabezado |
| 15/11/2026 | Damaris | Claude Code | T03, revisión con los commits de Erick hasta d78a70b: modelo lógico (P-01 a P-04, V-02, estados), agregaciones (NDVI, I19), contrato sobre el frontend nuevo y modelo físico como delta del esquema v0 | `trabajo/T03-modelado-datos/modelo-logico.md`, `agregaciones.md`, `contrato-pantallas.md`, `modelo-fisico.md` | ✅ en el encabezado |
| 15/11/2026 | Integrante de QENTARA de este chat | OpenAI Codex | Frontend nuevo a partir de las referencias del usuario, preparación de consultas reales guardadas, conversación guiada, dibujo, descargas y pruebas de interfaz | `Codigo/src/nuevo/`, `Codigo/scripts/prepare-reference-data.py`, `Codigo/src/main.tsx`, `Codigo/index.html`, `Codigo/tests/browser.mjs`, `docs/informes/07-frontend-nuevo.md` | ✅ en encabezados y metadatos del JSON |
| 15/11/2026 | Erick | Claude Code | Conexión del frontend nuevo con la API: cliente, datos reales de la base por campo, trabajos satelitales con seguimiento y detención, NDVI de MODIS, archivos en crudo, zonas en el mapa y ajuste de la prueba de interfaz | `Codigo/src/nuevo/api.ts`, `fieldData.ts`, `FieldEvidence.tsx`, `FieldFiles.tsx`, `MiniChart.tsx`, cambios en `App.tsx`, `FieldDashboard.tsx`, `FieldMap.tsx`, `dashboard.css`, `Codigo/tests/browser.mjs` | ✅ en el encabezado |
| 15/11/2026 | Erick | Claude Code | Frontend unido: portada de Codex en `frontend/`, panel de Shantall con vidrio, cliente de la API, evidencia real (POWER y MODIS), panel de datos de la parcela con extracción y «Detener», campos del servidor, mapa nítido con zoom 21 y nueva prueba de navegador | `frontend/src/features/landing/CodexLanding.tsx`, `frontend/src/services/{api,remote,parcelData}.ts`, `frontend/src/features/dashboard/ParcelDataPanel.tsx`, `frontend/src/features/parcels/ServerFields.tsx`, `frontend/src/styles/{glass,landing-codex}.css`, cambios en `App.tsx`, `WorkspaceProvider.tsx`, `WorkspaceLayout.tsx`, `OverviewPage.tsx`, `ParcelEditorPage.tsx`, `FieldMap.tsx`, `StudyPage.tsx`, `HistoryPage.tsx`, `tests/browser.mjs`, `backend/tarpu_api/config.py` (CORS 5174) | ✅ en el encabezado |
| | | | | | |
| 14/11/2026 | Shantall · frontend | OpenAI Codex | Base modular y prototipo de escritorio, pruebas, adaptación de la muestra existente de POWER a JSON y documentación técnica | `frontend/`, `docs/` | ✅ encabezados de código y metadatos del paquete de muestra |
| 14/11/2026 | Shantall · frontend | OpenAI Codex | Ampliación del frontend: Estudio técnico, datos sintéticos separados, agregación/exportación, catálogo, formularios, conversación por turnos y pruebas | `frontend/`, documentación del área en `docs/` | ✅ encabezados de código y metadatos de datos/exportaciones |
| 14/11/2026 | Shantall · frontend | OpenAI Codex | Ajuste visual de vidrio, temas y tipografía; patrones de parcela sintéticos, prioridad de ejemplo y gráficos; verificación | `frontend/`, documentación del área | ✅ encabezados de código y registro de ejemplos sintéticos |
| 15/11/2026 | Shantall · frontend | OpenAI Codex | Cabecera continua y transparente, navegación por secciones y distribución de controles del mapa compacto; verificación | `frontend/`, documentación del área | ✅ encabezados de código existentes y registro |
| 15/11/2026 | Shantall · frontend | OpenAI Codex | Opacidad de navbar, botón verde y paleta compartida de acceso/registro; revisión visual | `frontend/`, documentación del área | ✅ encabezado de estilos y registro |
| 15/11/2026 | Shantall · frontend | OpenAI Codex e image_gen | Paleta del inicio, galería agrícola, pie compacto y adaptación del fondo del logo QENTARA | `frontend/`, documentación del área | ✅ encabezados, marca visible en adaptación y [registro visual](../frontend/ASSETS.md) |
| 15/11/2026 | Shantall · frontend | OpenAI Codex | Selector de tema público con persistencia, actualización del recurso QENTARA y retirada de galería adicional | `frontend/`, documentación del área | ✅ encabezados de código; nuevo logo copiado sin edición ni generación |
| 15/11/2026 | Shantall · frontend | OpenAI Codex | Integración con el repositorio compartido, conciliación de documentación, traslado de entrada de frontend y retirada de Codigo conservando historial | `frontend/`, `docs/`, `AGENTS.md`, `.claude/launch.json` | ✅ encabezados de código existentes y registro |

## Pendientes

- [ ] Confirmar cómo se hicieron `Logo Tarpu.png` y `Tarpu_ Branding.png`. Si son generados con IA y se muestran en la entrega, necesitan **marca de agua visible**.
- [ ] Añadir al README del repositorio público una sección en inglés, «AI assistance», que diga qué partes se hicieron con ayuda de IA.
- [ ] Añadir la nota de IA a los archivos de código marcados con ❌.
- [ ] Pasar el resumen de esta tabla al campo *Use of Super Intelligence (SI)* del [formulario](formulario-envio.md).

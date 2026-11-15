# Estado actual

> Última actualización: **15 de noviembre de 2026**. Desafío: **Field Shift: Adapting Farms with NASA Data** ([08](08-desafio-oficial.md)); el envío oficial cierra el **domingo 15/11/2026 a las 11:59 p. m.**, hora del evento local ([09](09-entrega-oficial.md)). El equipo se dividió en cuatro áreas ([07](07-equipo-y-areas.md)). TARPU está en **planificación y definición de producto**, con un **prototipo visual** local (landing y dashboard de siete vistas). El informe maestro está en la versión **0.4** (23/10/2026). El backend ya funciona con datos reales de NASA POWER, pero todavía no está conectado a las pantallas. No hay cálculo NDVI, modelo de IA ni autenticación.
>
> **Informes de cada trabajo:** [informes/](informes/README.md). **Si algo quedó a medias**, la bitácora para retomar está en [informes/en-curso.md](informes/en-curso.md).

## Resumen

- **Revisión del repositorio (14/11/2026):** compilación, 8 pruebas de frontend, 15 de backend y suite de interfaz aprobadas. Se identificaron pendientes de vigencia de resultados en agente/datos detallados y se reprodujeron fallos ante meses parciales y resúmenes ausentes. El backend sigue sin integrarse con las pantallas y parte de sus archivos permanece sin seguimiento en Git. Alcance, evidencias y orden propuesto en [informe 06](informes/06-analisis-repositorio.md).

- **Producto definido:** identidad, problema, misión, visión, valores, objetivos, territorio (todo Arequipa), agricultor autónomo, agente integrado, datos detallados y exportación están **confirmados** (DEC-001 a DEC-008). Ver [01](01-vision-y-alcance.md) y [06](06-decisiones-y-riesgos.md).
- **Abierto:** stack del producto, fuentes exactas, reglas agronómicas, precios, identidad visual y lema. Son los 37 supuestos (SUP) del anexo D del informe.
- **Prototipo visual** (`Codigo/`):
  - **Landing** en `#/`, con hero satelital real de Majes, capas de evidencia explicadas, principios y territorio.
  - **Dashboard** con siete vistas: Vista general, Mis parcelas, Monitor satelital, Clima e históricos, Rotaciones, Explorar datos y Mis informes.
  - **Real:** el mapa base (Esri World Imagery y OpenStreetMap) y las imágenes satelitales.
  - **De demostración:** parcelas, indicadores, series, registros y respuestas del agente, todos rotulados como tales.
- **Logo:** se usa en blanco y negro desde el rediseño del 09/11/2026. Los originales a color se conservan.
- **Datos, fase 1 (14/11/2026):**
  - **Fuentes listas:** POWER, SoilGrids y NDVI MOD13Q1 tienen script, muestras y ficha, para Chivay y Majes. Ninguna llega todavía a la app.
  - **Cambio de punto en Majes:** se pasó al punto de riego (−16,367023; −72,185771), porque el anterior (−16,351; −72,190) caía en el casco urbano. La muestra de POWER del punto de riego es `power_majes_riego_20250101_20251231.*`; la del punto urbano se conserva solo como referencia.

- **Nueva base de datos y reglas (15/11/2026):**
  - **DT-19** reemplaza DT-17: POWER (19 variables), SoilGrids, GAEZ, MODIS de ORNL, NASADEM, HLS, SMAP y el IV CENAGRO 2012.
  - **DT-20:** en cada sector se muestran los 8 cultivos con más superficie en el censo 2012 que tengan ficha EcoCrop, y el resto en «ver más» (`backend/catalogo/sectores.json`).
  - **DT-22 (reemplaza DT-21): esquema mixto.** Base de Arequipa guardada (capa 1), series de satélite extraídas por coordenada en Google Cloud con aviso al usuario (capa 2) y Majes riego y Chivay completos para el jurado. La API interna sí se usa; la pública para terceros queda para después. Ver [11](11-esquema-mixto.md).
  - **Lugar de ejemplo S2:** Cabanaconde (Caylloma), −15,612386; −71,984857, 2908 m según el censo; maíz amiláceo.
  - **Métodos con cita** en `backend/investigacion/metodos_citados_2026-11-15.json`: Kc de FAO-56, factor LS de USLE (válido solo en pendientes de 3 a 18 %; Chivay tiene 33 %), textura sin regla (EcoCrop no define sus clases), rotación de costa sin secuencia oficial encontrada.
- **Guía de Derecho:** una sola guía en PDF para la persona a cargo de la entrega (`entrega/Guia_Derecho_Entrega_y_Pitch.pdf`), con el esquema mixto, los datos reales para el pitch y el guion del video.
- **Prueba por área de AppEEARS (14–15/11/2026):** `modis_zonas` (7 capas × 2015–2026 × 2 zonas) siguió «processing» más de 2 h; no fue un error del script, sino el volumen. Los datos pesados se piden ahora en tareas pequeñas por punto con `trabajo/extraccion_pesada/pesados.py`.

## Inventario

| Pieza | Estado | Ubicación | Notas |
|---|---|---|---|
| Informe maestro | ✅ v0.4 | `Documentación/` (.md, .tex, .pdf) | Documento formal. No recoge todavía el prototipo ni el rediseño. |
| Documentación de trabajo | ✅ | `docs/` | Esta carpeta, al estilo del proyecto Pulse (14/11/2026). |
| Guía para asistentes de IA | ✅ | `AGENTS.md` (Codex) y `CLAUDE.md` (Claude Code, importa `AGENTS.md`) | Reglas que no se deben romper. |
| Landing | ✅ prototipo | `Codigo/src/features/landing/` | Sin cifras de impacto ni logos de socios. |
| Dashboard (7 vistas) | ✅ prototipo | `Codigo/src/features/` | Datos sintéticos rotulados. |
| Mapa geográfico | ✅ real | `Codigo/src/features/monitor/` | Leaflet. Las zonas de La Joya, Majes y Camaná son de navegación, no parcelas. |
| Agente | 🟡 guiado | `Codigo/src/lib/domain.ts` (`answerQuestion`) | Respuestas locales fijas; no hay modelo de IA. |
| Exportación CSV/JSON y PDF | 🟡 con sintéticos | `Codigo/src/lib/download.ts`, `features/reports/` | La exportación funciona; los datos no son reales. |
| Pruebas | ✅ | `Codigo/tests/` | 8 de lógica y la suite Playwright completa, que pasan (09/11/2026). |
| **Consulta real a NASA POWER** | ✅ | `datos/power/consulta_power.py`, `datos/muestras/` | 365 días de 2025 para Majes y Chivay, 0 faltantes. El backend ya la usa (serie 2015–2025, en vivo). |
| Análisis de los recursos oficiales | ✅ | `datos/analisis-recursos.md` | Verificado en el catálogo de NASA para Majes y Chivay: qué sirve, qué se usa sin cuenta y qué solo cubre EE. UU. |
| Otras fuentes (GIBS, HLS, IMERG, SMAP…) | 🟡 | `datos/` | Accesos probados; falta convertirlos en scripts como el de POWER (Damaris). MODIS y SoilGrids ya tienen script (filas siguientes). |
| **Consulta real a SoilGrids** | ✅ | `datos/soilgrids/consulta_soilgrids.py`, `datos/muestras/` | pH, arcilla, arena y carbono a 0–5 y 5–15 cm para Majes riego, Majes urbano y Chivay; 0 faltantes. No es un dato de NASA. |
| **Consulta real a NDVI MOD13Q1** | ✅ | `datos/ndvi/consulta_ndvi.py`, `datos/muestras/` | 272 fechas (2015–2026) para Majes riego, Majes urbano y Chivay; 0 faltantes. Servicio de ORNL inestable; el script guarda caché y retoma. |
| Lanzador de muestras | ✅ | `datos/obtener_muestras.py` | Lanza las tres consultas para Majes riego y Chivay. |
| Fichas de las fuentes | ✅ | `datos/power/`, `datos/soilgrids/`, `datos/ndvi/` (`README.md`) | Las 7 preguntas de `datos/README.md`, con citas verificadas y límites. |
| Recorrido del usuario y escala posible | ✅ plan | `docs/10-recorrido-y-escala.md` | Recorrido de 9 pasos, dibujo del contorno, consulta en el centroide, píxeles de MODIS por parcela, territorio y fechas verificados |
| Guías de las cuatro áreas | ✅ | `datos/`, `backend/`, `entrega/`, `docs/areas/frontend.md` | Base para que cada uno arranque. |
| Borradores de la entrega | 🟡 | `entrega/` | Formulario en inglés, guion, referencias y registro de IA, por completar. |
| **Backend (API, motor y agente)** | ✅ construido | `backend/tarpu_api/` (índice en `backend/README.md`) | FastAPI con datos reales de NASA POWER, probado en vivo de punta a punta (14/11/2026); 15 pruebas que pasan. Motor sin puntaje ni pesos (DT-16) con rangos citados de FAO EcoCrop; agente guiado sin modelo de IA. MODIS y SoilGrids aparecen «no disponible» en el backend hasta conectar los scripts de `datos/` (tarea T01). Falta conectarlo a las pantallas. |
| Paquete de extracción T01 | 🟡 datos subidos (Damaris, 15/11/2026) | `trabajo/T01-paquete-extraccion/salida/` | Chivay: POWER, SoilGrids, GAEZ, luz y 4 productos MODIS. Majes riego: SoilGrids, GAEZ y 4 productos MODIS; **faltan POWER 2015–2025 y luz**. Comprobaciones de la §6 en OK. SoilGrids sin la incertidumbre (factor por verificar). La celda de POWER de Chivay está a 4351,89 m y el punto a 3643 m (NASADEM). |
| Extracción pesada (AppEEARS) | 🟡 scripts listos | `trabajo/extraccion_pesada/` | NASADEM, HLS, SMAP e imágenes de Chivay para los tres lugares de ejemplo; los ejecuta un compañero con la cuenta de Earthdata. |
| Cultivos por sector y métodos citados | ✅ | `backend/catalogo/sectores.json`, `backend/investigacion/` | DT-20; Kc, LS, K, horas de luz, rotación de sierra. |
| Base de Arequipa (capa 1, DT-22) | ✅ extraída (15/11/2026) | `backend/tarpu_datos/`, datos en `backend/almacen/base_arequipa/` | SoilGrids (99 mapas), GAEZ (100), POWER (63 celdas), NASADEM (20 teselas) y CENAGRO. ≈ 620 MB fuera de git; manifiesto en `backend/catalogo/base_arequipa.json`. Falta la carga a la base de datos. |
| Extracción y actualización en el backend | ✅ | `backend/tarpu_datos/` | Paquete T01 corregido (MODIS solo pide lo nuevo; POWER hasta ayer) y `actualizar.py` con períodos por fuente, también dentro de la API. 17 pruebas que pasan. |
| Trabajos por coordenada en Google Cloud (capa 2) | ❌ | — | Falta el proyecto de Google Cloud con Earth Engine, el servidor de la API interna y el canal del aviso. |
| Base de datos, autenticación | ❌ | — | Demo sin base de datos (DT-13); PostGIS y cuentas siguen propuestos (SUP-015, SUP-026). |
| Repositorio git | ✅ | [https://github.com/otazu-shantall/QENTARA---Tarpu-2026](https://github.com/otazu-shantall/QENTARA---Tarpu-2026) | Publicado el 14/11/2026, rama `main`. Falta confirmar que sea público y elegir la licencia. |

## Para retomar

```bash
npm --prefix Codigo run dev
```

Abre http://127.0.0.1:5173/ (landing) o http://127.0.0.1:5173/#/overview (dashboard). Más detalle en [desarrollo.md](desarrollo.md).

## Avisos

- El mapa y las imágenes satelitales **necesitan internet** (teselas de Esri y OpenStreetMap). Sin conexión aparecen los estados de error y un degradado de respaldo.
- Las fichas e informes creados en la demo se guardan **solo en ese navegador** (`localStorage`).
- `tmp/` guarda auxiliares de sesiones anteriores (generador del PDF, capturas, perfiles de navegador). No es software de TARPU.

## Pendientes conocidos del prototipo

- Las series del gráfico no coinciden con los registros de «Explorar datos».
- Las parcelas creadas localmente reciben indicadores de ejemplo (NDVI 0,60…) que entran en el promedio de «Todas mis parcelas».
- Los botones de zona del mapa también seleccionan la parcela con el mismo id.

## Próximo paso

Cada área arranca con su guía ([07](07-equipo-y-areas.md)). Lo más urgente, por orden de dependencia:

1. **Entrega:** confirmar el registro de los cinco en el mismo evento local y hacer las preguntas al líder local ([entrega/pendientes-legales.md](../entrega/pendientes-legales.md)).
2. **Cada área:** revisar y versionar los cambios locales pendientes; Git ya está inicializado y la publicación está registrada. Confirmar el acceso público y que el código necesario esté incluido.
3. **Datos y backend:** llevar el dato real de POWER a una pantalla.
4. **Frontend y backend:** acordar el recorrido mínimo y el contrato de datos.
5. **Entrega:** demo y formulario en inglés.

Lo que hay que entregar está en [05](05-entregables.md) y las reglas oficiales en [09](09-entrega-oficial.md).

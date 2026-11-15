# 08 · Frontend conectado con el backend

> 15/11/2026 · Erick, con Claude Code. Junta el frontend nuevo de Codex (`Codigo/src/nuevo/`, [informe 07](07-frontend-nuevo.md)) con la API del esquema mixto (DT-22, DT-23). La página de prueba `backend/prueba_web/` solo servía para comprobar el backend; lo que hacía ahora vive en el frontend.

## Qué hace ahora un campo dibujado

1. **Al guardarlo**, la pantalla pide `POST /api/base/parcela` con el contorno y muestra lo que devuelve la capa 1 (base de Arequipa):
   - superficie medida (WGS84), altitud media y pendiente mediana (NASADEM, píxeles de 30 m dentro del campo);
   - pH, arena, limo y arcilla de 0–5 cm (SoilGrids 2.0, píxeles de 250 m que tocan el campo);
   - sector (S1, S2 o S3) y los cultivos con más superficie sembrada en él (IV CENAGRO 2012, DT-20), rotulados como descripción de la zona, no como recomendación;
   - clima del último año completo de la celda de NASA POWER: media de la temperatura diaria y suma de la lluvia diaria, por mes y del año. Si falta un día de lluvia, ese mes queda sin total;
   - los avisos del backend (por ejemplo, la diferencia de altitud entre la celda de POWER y el campo).
2. **«Traer datos satelitales»** pide `POST /api/trabajos` con el contorno (capa 2). La tarjeta sigue el trabajo cada 3 s, muestra el estado de cada fuente y su motivo, y permite **Detener** (`POST /api/trabajos/cancelar`) y **Volver a intentar**. Si el centroide ya tiene trabajo, se recupera solo (`GET /api/trabajos/punto`).
3. **Cuando MODIS termina**, se muestra el NDVI de MOD13Q1 (últimas 23 composiciones de 16 días). Solo se dibujan las observaciones con fiabilidad 0 (buena) o 1 (marginal); 2 (nieve o hielo) y 3 (nubes) quedan como vacío (MOD13 User Guide). También la última clase de cobertura MCD12Q1 (IGBP).
4. **«Mis datos»** del campo lista los archivos que guardó el servidor (original, normalizado, detalle y procedencia de POWER y de cada producto de MODIS), con **Ver** (tabla con las 40 filas más recientes, o el JSON) y **Descargar**, vía `GET /api/archivo`. También se descarga el contorno y la respuesta completa de la base.
5. **«Mis campos»** muestra además los campos que ya tienen trabajo en el servidor; se abren como campo en el navegador.

## Mapa

- Imagen **Esri World Imagery Clarity** (más nítida), zoom hasta 21 (imagen real hasta 17 en zonas rurales; desde ahí se amplía).
- Capa de **zonas S1, S2 y S3** desde `/api/base/sectores` y `.png`, con leyenda, botón para ocultarla y atenuación a partir del zoom 14. Si la API no responde, el mapa sigue sin ella.

## Archivos

- Nuevos: `src/nuevo/api.ts` (cliente; dirección en `VITE_TARPU_API`, por defecto `http://127.0.0.1:8000`), `fieldData.ts` (carga y seguimiento), `FieldEvidence.tsx` (tarjetas), `FieldFiles.tsx` (archivos y puntos extraídos), `MiniChart.tsx` (gráfico separado de `FieldDashboard.tsx`).
- Cambiados: `App.tsx`, `FieldDashboard.tsx`, `FieldMap.tsx`, `dashboard.css`, `tests/browser.mjs`.
- Sin claves en el frontend. Sin reglas agronómicas: solo medias y sumas de la serie, con su método en pantalla.

## Comprobaciones

- `npm run build`, `npm test` (8 de 8) y `npm run test:ui` aprobados con la API encendida en el puerto 8000.
- En el navegador: un campo en Majes muestra altitud 1391 m, pendiente 2,3 %, pH 8,2, sector S1, clima 2025 (16,5 °C) y NDVI 0,543 del 16/10/2026. Un campo vecino nuevo lanzó su trabajo, se detuvo («Detenido») y se volvió a lanzar.

## Lo que falta

- Las rutas antiguas de `/api/parcelas` (motor, indicadores y agente) siguen sin pantalla en el frontend nuevo; el chat todavía usa las respuestas guardadas.
- Los lugares de referencia (Majes riego y Chivay) siguen leyendo `reference-data.json`; sirven también si la API no está encendida.
- HLS y SMAP salen «no disponible» hasta la vía de Google Earth Engine.
- Al desplegar hay que fijar `VITE_TARPU_API` con la dirección de Cloud Run y añadir ese origen al CORS del backend.

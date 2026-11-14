# Estado actual

> Última actualización: **14 de noviembre de 2026**. Desafío: **Field Shift: Adapting Farms with NASA Data** ([08](08-desafio-oficial.md)); el envío oficial cierra el **domingo 15/11/2026 a las 11:59 p. m.**, hora del evento local ([09](09-entrega-oficial.md)). El equipo se dividió en cuatro áreas ([07](07-equipo-y-areas.md)). TARPU está en **planificación y definición de producto**, con un **prototipo visual** local (landing y dashboard de siete vistas). El informe maestro está en la versión **0.4** (23/10/2026). No hay backend, datos agronómicos reales, cálculo NDVI, modelo de IA ni autenticación conectados.
>
> **Informes de cada trabajo:** [informes/](informes/README.md). **Si algo quedó a medias**, la bitácora para retomar está en [informes/en-curso.md](informes/en-curso.md).

## Resumen

- **Producto definido:** identidad, problema, misión, visión, valores, objetivos, territorio (todo Arequipa), agricultor autónomo, agente integrado, datos detallados y exportación están **confirmados** (DEC-001 a DEC-008). Ver [01](01-vision-y-alcance.md) y [06](06-decisiones-y-riesgos.md).
- **Abierto:** stack del producto, fuentes exactas, reglas agronómicas, precios, identidad visual y lema. Son los 37 supuestos (SUP) del anexo D del informe.
- **Prototipo visual** (`Codigo/`):
  - **Landing** en `#/`, con hero satelital real de Majes, capas de evidencia explicadas, principios y territorio.
  - **Dashboard** con siete vistas: Vista general, Mis parcelas, Monitor satelital, Clima e históricos, Rotaciones, Explorar datos y Mis informes.
  - **Real:** el mapa base (Esri World Imagery y OpenStreetMap) y las imágenes satelitales.
  - **De demostración:** parcelas, indicadores, series, registros y respuestas del agente, todos rotulados como tales.
- **Logo:** se usa en blanco y negro desde el rediseño del 09/11/2026. Los originales a color se conservan.

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
| **Consulta real a NASA POWER** | ✅ | `datos/power/consulta_power.py`, `datos/muestras/` | 365 días de 2025 para Majes, 0 faltantes. Todavía no llega a la app. |
| Análisis de los recursos oficiales | ✅ | `datos/analisis-recursos.md` | Verificado en el catálogo de NASA para Majes y Chivay: qué sirve, qué se usa sin cuenta y qué solo cubre EE. UU. |
| Otras fuentes (MODIS/VIIRS, SoilGrids, GIBS, HLS, IMERG, SMAP…) | 🟡 | `datos/` | Accesos probados; falta convertirlos en scripts como el de POWER (Damaris). |
| Guías de las cuatro áreas | ✅ | `datos/`, `backend/`, `entrega/`, `docs/areas/frontend.md` | Base para que cada uno arranque. |
| Borradores de la entrega | 🟡 | `entrega/` | Formulario en inglés, guion, referencias y registro de IA, por completar. |
| Backend, base de datos, autenticación | ❌ | — | Solo propuestos (SUP-015, SUP-026). |
| Motor agronómico | ❌ | — | Reglas y pesos solo propuestos (SUP-018, SUP-019). |
| Repositorio git | ❌ | — | La carpeta no es un repositorio. Hay `.gitignore` listo; falta inicializarlo y publicarlo (el enlace de la entrega debe ser público). |

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
2. **Todos:** inicializar git y publicar el repositorio.
3. **Datos y backend:** llevar el dato real de POWER a una pantalla.
4. **Frontend y backend:** acordar el recorrido mínimo y el contrato de datos.
5. **Entrega:** demo y formulario en inglés.

Lo que hay que entregar está en [05](05-entregables.md) y las reglas oficiales en [09](09-entrega-oficial.md).

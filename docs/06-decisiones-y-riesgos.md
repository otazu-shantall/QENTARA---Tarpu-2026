# Decisiones, riesgos y preguntas abiertas

Estados: **Tomada** · **Propuesta** (pendiente de confirmar) · **Reemplazada**.

Las decisiones de producto (DEC) se registran en el anexo G del [informe maestro](../Documentación/TARPU_Documentacion_Maestra.md#anexo-g-control-de-cambios-y-decisiones), que manda. Las decisiones de trabajo del prototipo y de organización (DT) solo están aquí hasta que el informe las recoja. Ninguna aprobación conceptual valida fórmulas, cobertura, resultados de campo ni rentabilidad.

## Decisiones de producto

Todas: **Tomada · 23/10/2026 (usuario)**.

| ID | Decisión | Alcance de la confirmación |
|---|---|---|
| DEC-001 | Orientar inicialmente el producto a todo Arequipa y pulir el análisis en Perú | Prioridad territorial; no acredita cobertura útil de cada producto en todas las ubicaciones |
| DEC-002 | Que el agricultor comprenda directamente los resultados con un agente integrado | Orientación de experiencia; proveedor y diseño técnico por validar (SUP-034) |
| DEC-003 | Acceso a datos más detallados sin evaluación agronómica, con opción de exportarlos | Capacidad del producto; interfaz, formatos y límites siguen propuestos (SUP-021) |
| DEC-004 | Visión y trabajo sin horizontes en años ni calendarios estimados de desarrollo | Se presentan orden, entregables y dependencias; se conservan períodos científicos y unidades de operación |
| DEC-005 | Aceptar la presentación y las descripciones del proyecto | Definición del producto, equipo, territorio y vías de consulta; no acredita implementación |
| DEC-006 | Aceptar la formulación del problema y su justificación | Magnitud, frecuencia y efectos requieren evidencia |
| DEC-007 | Aceptar misión, visión (sin horizonte temporal) y valores | El lema y los elementos visuales no se aprueban por extensión |
| DEC-008 | Aceptar objetivos y propuesta de valor orientados a la comprensión autónoma del agricultor | Umbrales, pruebas y solución técnica no equivalen a resultados |

Los antiguos SUP-001, SUP-003 y SUP-004 se cerraron por estas confirmaciones. No se reutilizan.

## Decisiones de trabajo del prototipo y de organización

### DT-01 · Construir un prototipo visual en `Codigo/`
**Tomada · 24/10/2026 (usuario).** El usuario autorizó empezar el dashboard y pidió una carpeta de código nueva en la raíz. No incluye documentos maestros ni archivos de procesamiento de informes. Informe: [01-dashboard-inicial](informes/01-dashboard-inicial.md).

### DT-02 · Stack del prototipo: React + TypeScript + Vite + Leaflet + CSS propio
**Propuesta · 24/10/2026.** Se eligió para construir el prototipo. **No aprueba** el stack del producto (FastAPI, PostGIS, MapLibre… siguen en SUP-015).

### DT-03 · Mapa base real en lugar del mapa SVG sintético
**Tomada · 27/10/2026 (usuario).** Esri World Imagery y OpenStreetMap, cargados en vivo con créditos visibles. Se retiraron los polígonos y la falsa capa NDVI. El proveedor definitivo para producción sigue por revisar. Informe: [02-mapa-real](informes/02-mapa-real.md).

### DT-04 · Glasmorfismo y logo lateral de 178 px
**Reemplazada por DT-05 · 27/10/2026 (usuario).** Fue la dirección visual del 27/10.

### DT-05 · Dirección visual «mapa protagonista» y landing editorial
**Propuesta · 09/11/2026, pedida por el usuario, pendiente de su visto bueno.** Sale de cinco referencias que aportó el usuario:

- **Dashboard:** superficies blancas sobre gris claro, barra de iconos, mapa satelital con tarjetas flotantes, titulares serif y la interfaz en Geist.
- **Landing:** titulares serif sobre una imagen aérea.

Reemplaza a DT-04. La identidad visual sigue siendo SUP-013. Detalle en [diseno/README.md](diseno/README.md) e informe [03-redisenio-visual](informes/03-redisenio-visual.md).

### DT-06 · Logo en blanco y negro
**Tomada · 09/11/2026 (usuario).** Se usa el logo existente en monocromo (versiones negra y blanca, con y sin texto). Los originales a color se conservan.

### DT-07 · Documentación de trabajo al estilo del proyecto Pulse
**Tomada · 14/11/2026 (usuario).** Se organiza `docs/` con documentos numerados, estado actual, decisiones, informes por trabajo y bitácora.

- **Sin plan de entregas, hitos ni tiempos.** En su lugar, [05-entregables.md](05-entregables.md) dice qué hay que entregar y su estado.
- **El informe maestro se mantiene** como documento formal, y `docs/` lo resume.
- **No se movieron de sitio** `Documentación/` ni el Contexto Integral, para no romper el generador del PDF.

### DT-08 · Plataformas: web, luego Android, luego iOS
**Tomada · 14/11/2026 (Erick).** TARPU tendrá página web; después una app de Android; y una app de iOS que se deja implementada, aunque quizá sin lanzar todavía. La web se piensa para teléfono y la lógica vive en el backend, para que las apps la reutilicen.

### DT-09 · División del equipo en cuatro áreas
**Tomada · 14/11/2026 (Erick).**

- **Damaris:** extracción de datos satelitales.
- **Shantall:** frontend y experiencia de usuario, con enfoque claro, conciso y fácil para personas mayores.
- **Erick:** backend, conectores y motor.
- **Los dos integrantes de Derecho:** entrega, pitch e investigación.

Cada área trabaja en su carpeta. Primero se investiga y se hace la base; luego se une todo y se vuelve a segmentar con las pantallas definidas. Detalle en [07](07-equipo-y-areas.md).

### DT-10 · El frontend actual es una guía, no el diseño final
**Tomada · 14/11/2026 (Erick).** Lo que hay en `Codigo/` sirve de base y ejemplo. Las pantallas definitivas se deciden al unir el trabajo. Afecta a DT-05, que sigue como propuesta.

### DT-11 · Desafío: Field Shift: Adapting Farms with NASA Data
**Tomada · 14/11/2026 (Erick aportó los recursos oficiales).** Cierra la parte de SUP-035 sobre el desafío exacto y los requisitos de entrega, leídos del sitio oficial ([08](08-desafio-oficial.md), [09](09-entrega-oficial.md)). Siguen abiertas las dudas para el líder local.

### DT-12 · Organización del hackathon en tres fases
**Tomada · 14/11/2026 (Erick).**

1. Cada área planifica su parte.
2. Reunión de unión a las **2 horas** de empezar, donde se definen las pantallas y se vuelve a dividir el trabajo.
3. Construcción.

Detalle en [ROADMAP.md](../ROADMAP.md).

## Riesgos

Prioridades cualitativas del informe (SUP-032), sin probabilidad medida.

| Riesgo | Prioridad | Señal | Respuesta |
|---|---|---|---|
| Escala inadecuada para parcelas | Alta | Poca cobertura útil o píxeles mezclados | Limitar el uso o cambiar de fuente |
| Acceso o latencia del proveedor | Alta | Descarga no reproducible o dato poco reciente | Alternativa documentada y caché |
| Reglas sin revisar | Alta | Falta especialista o hay desacuerdo crítico | Mantener la comparación como experimental |
| Interpretación errónea | Alta | El usuario confunde puntaje con certeza | Cambiar lenguaje y representación |
| Costos superiores al modelo | Alta | La carga o el soporte superan el escenario | Medir, limitar cupos y revisar precio |
| Exposición de datos | Alta | Acceso cruzado o enlace público involuntario | Suspender acceso, contener y corregir |
| **Sobrecarga de alcance** | Alta | Fuentes y funciones avanzan sin un recorrido completo | Priorizar la demostración de [05](05-entregables.md) |
| Prototipo confundido con producto | Alta | Se presentan datos sintéticos como reales | Mantener rótulos «Demo» y «sin conexión activa» |
| **Entrega fuera de regla** | Alta | Demo de más de 30 s o 7 diapositivas, textos sin inglés, enlaces privados o IA sin declarar | Listas de [09](09-entrega-oficial.md) y de `entrega/` |
| **Dato de NASA solo decorativo** | Alta | La app no muestra un dato real de NASA | Llevar POWER a la pantalla: es el criterio Relevance |
| Adopción limitada | Media | No se repite una tarea útil | Revisar segmento y propuesta |
| Dependencia de una persona | Media | Falta documentación o acceso compartido | Esta carpeta, `AGENTS.md` y la bitácora |

## Preguntas abiertas

Los 37 supuestos activos están en el anexo D del informe. Los que más afectan al trabajo inmediato:

| Código | Pregunta |
|---|---|
| SUP-013 | ¿Se aprueban la identidad visual y el lema («Datos para cosechar un mejor mañana»)? |
| SUP-016 | ¿Qué producto exacto de POWER se conecta primero y cómo se verifica? |
| SUP-021 | ¿Qué formatos de exportación y qué alcance de descarga? |
| SUP-034 | ¿Qué modelo y proveedor usa el agente, con qué contexto y qué costo? |
| SUP-035 | Desafío y requisitos ya conocidos (DT-11). Quedan las dudas para el líder local de [entrega/pendientes-legales.md](../entrega/pendientes-legales.md) |
| SUP-015 | ¿Se confirma el stack del producto (FastAPI, PostGIS, MapLibre)? |
| SUP-002 | ¿Papa, quinua, haba y cebada son el catálogo correcto para Arequipa? |

# Documentación de TARPU

Documentos de trabajo de QENTARA para organizarnos. Son breves y prácticos, y cada uno enlaza al **informe maestro** cuando hace falta más detalle.

**Para el hackathon, empieza por el [ROADMAP](../ROADMAP.md)**: qué le toca a cada uno, fases y reunión de unión.

Orden de lectura recomendado:

| # | Documento | Para qué sirve |
|---|---|---|
| 00 | [Estado actual](00-estado-actual.md) | Qué existe, qué falta y dónde estamos. Se actualiza cada vez que cambia algo verificable. |
| 01 | [Visión y alcance](01-vision-y-alcance.md) | Qué es TARPU, para quién es, qué entra y qué queda fuera. |
| 02 | [Arquitectura](02-arquitectura.md) | Cómo está hecho el prototipo y qué arquitectura se propone para el producto. |
| 03 | [Datos y fuentes](03-datos-y-fuentes.md) | Fuentes candidatas, niveles de datos y límites científicos que no se negocian. |
| 04 | [Módulos](04-modulos.md) | La landing y las siete vistas: qué muestran, qué es real y qué es de demostración. |
| 05 | [Entregables](05-entregables.md) | Lo que hay que entregar y en qué estado está cada cosa. Sin plazos. |
| 06 | [Decisiones y riesgos](06-decisiones-y-riesgos.md) | Decisiones tomadas, propuestas abiertas y riesgos. |
| 07 | [Equipo y áreas](07-equipo-y-areas.md) | Quién hace qué, plataformas, etapas de trabajo y cómo compartir el repositorio. |
| 08 | [Desafío oficial](08-desafio-oficial.md) | Qué pide «Field Shift» y los recursos oficiales, con lo que sirve para Arequipa. |
| 09 | [Entrega oficial](09-entrega-oficial.md) | Formulario, demo, reglas de IA, licencia y criterios de evaluación. |
| 12 | [Carpetas, Docker y despliegue](12-carpetas-docker-y-despliegue.md) | **Plan del backend completo:** carpetas oficiales, Supabase simulado con Docker, una sola imagen para Cloud Run, reutilización por celda y huecos para T03. |
| 11 | [Esquema mixto](11-esquema-mixto.md) | **Enfoque vigente del motor (DT-22):** base de Arequipa guardada, extracción por coordenada en Google Cloud con aviso al usuario y lugares de ejemplo completos para el jurado. |
| 10 | [Recorrido y escala](10-recorrido-y-escala.md) | Lo que ve el usuario paso a paso, cómo se dibuja la parcela, cómo se calcula solo su espacio, cómo se muestran los datos y en qué rango de tamaño, territorio y fechas es posible. |
| — | [Guía de diseño del frontend](diseno/guia-frontend.md) | Diseño, arquitectura y referencias del área; estado vigente en frontend/README.md. |
| — | [areas/frontend.md](areas/frontend.md) | Guía del área de frontend y experiencia de usuario. |
| — | [tareas/](tareas/README.md) | Tareas autocontenidas para repartir: qué hacer, recursos y cómo comprobarlo. |
| — | [areas/propuesta-*.md](areas/) | Plantillas de propuesta de cada área para la reunión de unión: [datos](areas/propuesta-datos.md), [frontend](areas/propuesta-frontend.md), [backend](../backend/PROPUESTA.md) (vive en `backend/`, con todo lo del área), [entrega](areas/propuesta-entrega.md). |
| — | [Desarrollo](desarrollo.md) | Cómo levantar el código, probarlo y dónde está cada cosa. |
| — | [diseno/](diseno/README.md) | Referencias visuales, sistema visual y capturas del diseño actual. |
| — | [informes/](informes/README.md) | Un informe por cada trabajo terminado y la bitácora para retomar lo que esté a medias. |
| — | [backend/diagramas/](../backend/diagramas/) | Diagramas del backend: mapa de módulos, archivos e interactivo. Todo lo del backend está reunido en [backend/](../backend/README.md). |
| — | [historial/](historial/README.md) | Material de sesiones anteriores. Solo lectura. |

## Carpetas de cada área

| Área | Carpeta | Guía |
|---|---|---|
| Datos satelitales | `datos/` | [datos/README.md](../datos/README.md) |
| Frontend | `frontend/` | [areas/frontend.md](areas/frontend.md) |
| Backend, conectores y motor | `backend/` | [backend/README.md](../backend/README.md) |
| Entrega, pitch e investigación | `entrega/` | [entrega/README.md](../entrega/README.md) |

## El informe maestro

El documento formal del proyecto sigue siendo la **documentación maestra**, en tres formatos con el mismo contenido:

- [TARPU_Documentacion_Maestra.md](../Documentación/TARPU_Documentacion_Maestra.md): texto editable principal.
- `TARPU_Documentacion_Maestra.tex`: fuente de maquetación.
- `TARPU_Documentacion_Maestra.pdf`: versión de lectura.

Los documentos de esta carpeta **resumen y organizan**; no reemplazan al informe maestro. Si un documento de aquí y el informe dicen cosas distintas sobre el producto, manda el informe (y su anexo G de decisiones) hasta que se actualice. Lo que el informe todavía no recoge, como el estado del prototipo, lo describen estos documentos.

## Reglas para mantener la documentación

1. Cada cambio verificable (código, documentación o decisión) termina actualizando `00-estado-actual.md`.
2. Cada trabajo terminado deja su informe en `informes/`. Mientras está a medias, se va anotando en `informes/en-curso.md`.
3. Las decisiones nuevas se registran en `06` con fecha, quién decidió y estado. No se borran las anteriores: se marcan como reemplazadas.
4. Los códigos **DEC-xxx** y **SUP-xxx** son los del informe maestro. No se renumeran ni se reutilizan.
5. **Sin plazos de desarrollo.** No se escriben horas, días, semanas ni calendarios de construcción. Sí se pueden escribir fechas de lo que ya pasó, períodos de datos (series, campañas agrícolas) y las **fechas oficiales del evento**, que no las ponemos nosotros. **Excepción acordada (Erick, 14/11/2026):** el ROADMAP fija la reunión de unión a las 2 horas de empezar la fase 1.
6. Nada se marca como terminado sin haberlo probado. Lo sintético se rotula como sintético y lo propuesto como propuesto.
7. Si cambia el contenido del producto en el informe maestro, se actualizan juntos el `.md`, el `.tex` y el `.pdf` (ver `AGENTS.md`, sección 7).

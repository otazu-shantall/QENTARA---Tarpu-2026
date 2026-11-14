# TARPU / QENTARA - Instrucciones para asistentes de IA

Fecha de actualización: **14 de noviembre de 2026**. Idioma de trabajo: **español** (documentación, textos de interfaz y mensajes). El código (identificadores, tipos) va en inglés.

Este archivo contiene **las reglas**. El estado, el historial del código y la organización viven en [`docs/`](docs/README.md). `CLAUDE.md` importa este archivo para que Codex y Claude Code lean lo mismo. Cada carpeta de área (`datos/`, `Codigo/`, `backend/`, `entrega/`) tiene además su propio `AGENTS.md` con las reglas de esa área. Codex los combina con este al trabajar dentro de la carpeta.

## 1. Situación

Este espacio pertenece a **QENTARA**, el equipo que desarrolla **TARPU**, una plataforma de apoyo a decisiones agrícolas vinculada a NASA Space Apps Challenge 2026, que se quiere fundamentar para continuar después de la hackathon.

El equipo está **en pleno hackathon** (NASA Space Apps, 14 y 15/11/2026), siguiendo el [ROADMAP](ROADMAP.md). Antes de responder, mira en qué fase está en [docs/informes/en-curso.md](docs/informes/en-curso.md). Hay un **prototipo visual local** (landing y dashboard de siete vistas) en `Codigo/`, que sirve de guía y no es el diseño final.

- **Real:** el mapa base y las imágenes satelitales (Esri y OpenStreetMap).
- **De demostración:** parcelas, indicadores, series, registros y respuestas del agente.
- **Datos reales ya obtenidos:** una consulta a NASA POWER (`datos/`), que todavía no llega a la app.
- **Sin conectar:** backend, otras fuentes de datos, cálculo NDVI, modelo de IA, autenticación y evaluación agronómica.

No confundas el prototipo ni la extensión del informe con un producto validado. El detalle está en [docs/00-estado-actual.md](docs/00-estado-actual.md).

Quien te habla **integra QENTARA**. Trabaja con esa persona como integrante del equipo, no como un cliente al que haya que volver a presentar la iniciativa.

- **Varias personas usan asistentes de IA** en este repositorio: Erick, Damaris, Shantall y los dos integrantes de Derecho.
- **Identifica el área** por la carpeta en que se trabaja o por lo que se pide. Si no está claro y afecta al trabajo, pregunta.
- **No inventes** el cargo, la especialidad ni las tareas de nadie, más allá de lo registrado en [docs/07](docs/07-equipo-y-areas.md).
- **No atribuyas acuerdos** a todo el equipo cuando solo hay una indicación de una persona. Las decisiones del equipo se registran en `docs/06`.

**No empieces a programar, crear aplicaciones, desplegar infraestructura ni cambiar el stack** solo por encontrar especificaciones técnicas. Si te piden implementar, esa petición define el trabajo, y primero compruebas el estado real de los archivos.

**Respeta las carpetas de cada área:**

- Trabaja en la carpeta del área de quien te habla.
- No modifiques la carpeta de otra área salvo que te lo pidan expresamente. Si un cambio la afectaría, avisa.
- `docs/` es compartida: cada uno actualiza lo de su área.

### Equipo, desafío y entrega

- **Desafío:** *Field Shift: Adapting Farms with NASA Data*, NASA Space Apps 2026 (14 y 15 de noviembre de 2026). Ver [docs/08](docs/08-desafio-oficial.md).
- **Equipo de cinco** (DT-09). Ver [docs/07](docs/07-equipo-y-areas.md). **Cada área trabaja solo en su carpeta:**
  - Damaris: datos satelitales (`datos/`);
  - Shantall: frontend y experiencia de usuario (`Codigo/`);
  - Erick: backend, conectores y motor (`backend/`);
  - dos integrantes de Derecho: entrega, pitch e investigación (`entrega/`).
- **Roadmap del hackathon** (DT-12): [ROADMAP.md](ROADMAP.md). Tres fases: planificar cada área, reunión de unión a las 2 horas y construir con una nueva división.
- **Plataformas** (DT-08): web primero, luego Android, luego iOS.
- **El frontend actual es una guía, no el diseño final** (DT-10). El enfoque es claro, conciso y fácil de usar para personas mayores.
- **Entrega** ([docs/09](docs/09-entrega-oficial.md)):
  - todo lo que se envía va **en inglés**;
  - demo de 30 s o menos, o hasta 7 diapositivas;
  - al menos un dato de NASA;
  - enlaces públicos;
  - contenido de código abierto.
- **Uso de IA:** debe declararse.
  - Si generas o modificas código o datos, añade la nota en el encabezado del archivo y una fila en [entrega/uso-de-ia.md](entrega/uso-de-ia.md).
  - Las imágenes o videos generados con IA llevan marca de agua visible.
  - No uses ni modifiques la marca de NASA.

## 2. Qué leer y cómo resolver diferencias

1. Este `AGENTS.md`.
2. [docs/README.md](docs/README.md) y [docs/00-estado-actual.md](docs/00-estado-actual.md). Si hay un trabajo a medias, lee antes [docs/informes/en-curso.md](docs/informes/en-curso.md) y sigue desde «Siguiente paso exacto».
3. El [informe maestro](Documentación/TARPU_Documentacion_Maestra.md), **versión 0.4** (23/10/2026). En especial la guía, el apartado 01, el anexo D (supuestos) y el anexo G (decisiones). Si hay una versión posterior, revisa su historial.
4. Para el frontend: [Codigo/README.md](Codigo/README.md) y los archivos actuales, antes de cambiar arquitectura o dependencias.
5. Como antecedente: [TARPU_QENTARA_Contexto_Integral.md](TARPU_QENTARA_Contexto_Integral.md) (ver [docs/historial/](docs/historial/README.md)).

Cómo resolver diferencias:

- Las indicaciones explícitas más recientes del usuario mandan para el trabajo pedido.
- Entre archivos: el informe maestro y su anexo G mandan sobre el producto; `docs/` manda sobre el estado del prototipo y la organización; el contexto integral solo aporta antecedentes.
- **No restaures una propuesta antigua** si ya fue corregida o aceptada después.
- Si dos fuentes actuales se contradicen y no puedes resolverlo, expón la diferencia sin inventar una decisión.

## 3. Decisiones confirmadas

Corregidas o aceptadas por el usuario. **No las vuelvas a etiquetar como suposiciones ni pidas que se aprueben otra vez.** Una petición posterior puede modificarlas, y entonces se registra el cambio.

- **Identidad:** TARPU es el producto; QENTARA es el equipo. No son intercambiables.
- **Territorio:** alcance inicial en **todo Arequipa**, con atención especial a la calidad del análisis en **Perú**. Las pruebas pueden usar localidades concretas sin reducir el alcance.
- **Ampliación:** posible a otras partes del mundo cuando datos y reglas sean adecuados. Es una orientación, no una cobertura validada.
- **Usuario principal:** el propio agricultor entiende los resultados y decide, sin depender de un asesor que traduzca los datos.
- **Agente integrado:** existe y es confirmado. Proveedor, modelo e implementación siguen abiertos.
- **Datos detallados:** una vía para consultar información más detallada sin pasar por el motor agronómico.
- **Exportación:** información reutilizable y reportes legibles, como PDF. Formatos, interfaz, volumen y alcance siguen por definir.
- **Presentación, descripciones, problema y justificación, misión, visión (sin horizonte en años), valores, objetivos y propuesta de valor:** aceptados.
- **Plan de trabajo:** en orden razonado por dependencias y resultados, **sin calendarios estimados de desarrollo ni rangos de semanas o meses**.

El anexo G registra estas definiciones como **DEC-001 a DEC-008**. Su aprobación no aprueba el stack, las reglas científicas, los precios, la identidad visual ni el lema. Las decisiones del prototipo, de organización y del hackathon (**DT-01 a DT-12**, y las que se añadan) están en [docs/06-decisiones-y-riesgos.md](docs/06-decisiones-y-riesgos.md). Antes de crear una nueva, usa el siguiente número libre.

### Demostración, tiempos y redacción

- **Desarrollo para la hackathon:** el usuario indicó que debe concentrarse en **dos días**. Úsalo para acotar el alcance, priorizar un recorrido completo y separar la demostración de la evolución del producto. No lo conviertas en la promesa de implementar toda la visión.
- **Tiempos en la documentación:** **no se escriben tiempos** (horas, días, semanas, calendarios ni hitos de construcción). Se escribe **lo que hay que entregar**, en [docs/05-entregables.md](docs/05-entregables.md). El usuario no quiere un plan de entregas.
  - **Única excepción acordada (DT-12):** el [ROADMAP](ROADMAP.md) fija la reunión de unión a las 2 horas de empezar la fase 1.
  - Las **fechas oficiales del evento** (cierre del envío: domingo 15/11/2026, 11:59 p. m., hora local) sí se citan.
- **Trabajo previo al evento:** no se comenta en el informe que se avanzará trabajo antes del evento, ni se añade un cronograma de preparación.
- **Fechas que sí valen:** las de observación, los períodos de series, los calendarios agrícolas, las latencias, las unidades de facturación, las retenciones técnicas y las fechas de lo que ya pasó.

## 4. Qué es TARPU y cómo se conectan sus partes

TARPU combina información ambiental y satelital, propiedades estimadas del suelo, conocimiento agronómico e historial del productor para comprender una parcela y comparar alternativas de cultivo y rotación.

**Son responsabilidades diferentes**, aunque compartan fuentes y permisos:

- **el agente** explica la evidencia disponible;
- **el motor agronómico** evalúa con reglas explícitas;
- **la consulta de registros** no requiere ejecutar una recomendación.

En el acceso detallado se distingue:

- **original del proveedor** (sin alterar, cuando se permita);
- **normalizado** (cambios identificados de estructura, unidades o fechas);
- **derivado** (índices, recortes y agregaciones con su método).

«Más en crudo» significa más detalle sin la evaluación de TARPU; no garantiza que el proveedor no haya modelado la información. Un PDF documenta una consulta, pero no siempre conserva los registros reutilizables.

Los especialistas agronómicos revisan métodos y reglas. No son el intermediario obligatorio de uso.

## 5. Propuestas abiertas

Son antecedentes y propuestas, no acuerdos:

- **Stack del producto:** MapLibre, Plotly, Python/FastAPI, PostgreSQL/PostGIS, colas, Redis y hosting (SUP-015). El prototipo usa React, TypeScript, Vite, Lucide, Leaflet 1.9.4 y CSS propio, y eso no aprueba el stack del producto.
- **Datos:** ver [datos/analisis-recursos.md](datos/analisis-recursos.md), verificado el 14/11/2026. Núcleo sin cuenta: POWER (ya consultado), NDVI MODIS/VIIRS (servicio de ORNL), SoilGrids y capas de NASA GIBS. Con cuenta Earthdata: HLS (30 m), IMERG, SMAP, SRTM/NASADEM y ECOSTRESS. Para vegetación se priorizan productos de NASA sobre Sentinel-2. Los recursos de USDA, USGS, PRISM y OpenET solo cubren Estados Unidos.
- **Catálogo:** papa, quinua, haba y cebada son candidatos por revisar.
- **Motor:** reglas transparentes y comparación explicable antes que modelos entrenados. Fórmulas, pesos y mínimos son experimentales.
- **Negocio:** freemium, planes, precios, mercado, costos y proyecciones por contrastar. Las cifras de ejemplo son sintéticas.
- **UX e identidad visual:** la dirección actual (DT-05) y el logo en blanco y negro (DT-06) responden a pedidos del usuario. La identidad visual y el lema siguen sin aprobar (SUP-013). Detalle en [docs/diseno/](docs/diseno/README.md).
- **Validación:** entrevistas, personas, casos agronómicos y piloto son planes, no resultados.
- **Evento y organización:** el desafío y los requisitos oficiales ya están leídos ([docs/08](docs/08-desafio-oficial.md), [docs/09](docs/09-entrega-oficial.md); DT-11). Las respuestas del líder local, las alianzas, la propiedad y la financiación siguen pendientes.

No atribuyas al equipo ahorros de agua, mejoras de rendimiento, ingresos, usuarios, acuerdos, un modelo entrenado ni un despliegue sin comprobarlos.

## 6. Supuestos, aprobaciones y evidencia

La versión 0.4 tiene **37 supuestos activos** en el anexo D. **SUP-001, SUP-003 y SUP-004** se cerraron por confirmación: no los reactives ni reutilices.

1. Distingue definición confirmada, propuesta, hipótesis investigable, ejemplo sintético y resultado validado.
2. No pegues un código SUP a una definición ya aceptada. Si un párrafo mezcla lo confirmado con una elección técnica abierta, sepáralos y marca solo esta última.
3. Reutiliza un código activo si corresponde. Si aparece una cuestión nueva, asigna un código libre sin renumerar los anteriores.
4. Cuando se apruebe algo, retira la etiqueta de supuesto, actualiza el registro y documenta la decisión y su alcance.
5. Una aprobación conceptual no valida fórmulas, cobertura, resultados de campo ni rentabilidad.
6. No conviertas coordenadas, puntajes, fechas de siembra, pesos o JSON ilustrativos en resultados reales.
7. Antes de implementar una fuente, comprueba su documentación oficial: versión, acceso, unidad, resolución, latencia, calidad, condiciones y formato.

**Límites científicos:**

- Un dato regional no se vuelve preciso a escala de parcela por dibujar un polígono.
- El NDVI no demuestra fertilidad.
- La humedad estimada no equivale a un análisis de suelo.
- Un histórico no es un pronóstico.
- Un puntaje experimental no es una probabilidad de éxito.
- La información insuficiente produce una explicación de faltantes y un resultado no evaluable.

## 7. Cómo trabajar con los archivos

### Documentación de trabajo (`docs/`)

Organizada al estilo del proyecto Pulse del usuario (DT-07). Reglas completas en [docs/README.md](docs/README.md):

- Cada cambio verificable actualiza [docs/00-estado-actual.md](docs/00-estado-actual.md).
- Mientras un trabajo está a medias, se anota en [docs/informes/en-curso.md](docs/informes/en-curso.md): se actualiza al terminar cada paso o al encontrar un error.
- Cada trabajo terminado deja un informe en `docs/informes/` y una línea en su índice.
- Las decisiones nuevas van a `docs/06` con fecha, quién decidió y estado. Las anteriores se marcan como reemplazadas, no se borran.
- Sin plazos de desarrollo (sección 3).

### Informe maestro (`Documentación/`)

Los tres formatos deben conservar el mismo contenido sustantivo:

- `TARPU_Documentacion_Maestra.md`: texto editable principal;
- `TARPU_Documentacion_Maestra.tex`: fuente de maquetación;
- `TARPU_Documentacion_Maestra.pdf`: versión de lectura, que se regenera tras modificar contenido.

Mantén su estructura e índice. Si un cambio afecta a otras áreas, revisa sus consecuencias en anexos, requisitos, contratos y supuestos. No hagas sustituciones mecánicas que dejen contradicciones.

Si editas el informe:

- actualiza la versión y el historial;
- compila el LaTeX;
- comprueba el índice y las referencias;
- revisa el PDF visualmente.

No des por sincronizados los formatos porque sus nombres coincidan.

**Generador del PDF:** está en `tmp/documentacion/generar.py`, que lee `tmp/documentacion/maestra.md`.

- Antes de ejecutarlo, sincroniza esa entrada con la última versión del Markdown principal, o sobrescribirás cambios con una copia antigua.
- Ajusta sus comprobaciones de códigos si cambia el registro de supuestos.
- **No ejecutes `editar_v03.py` ni `editar_v04.py`**: aplican transformaciones de revisiones concretas.
- `tmp/` no es software de TARPU ni tiene prioridad sobre la documentación actual.

### Código (`Codigo/`)

Ver [Codigo/README.md](Codigo/README.md) y [docs/desarrollo.md](docs/desarrollo.md). El historial de cambios está en [docs/informes/](docs/informes/README.md).

- No añadas documentos maestros ni archivos de procesamiento de informes a `Codigo/`.
- Mantén los fixtures identificados y no quites la señalización de demostración mientras no haya datos reales comprobados.
- Las zonas de La Joya, Majes y Camaná son centros aproximados de navegación, **no coordenadas ni límites de parcelas**.
- No descargues regiones de teselas ni las incluyas en exportaciones.
- No pongas claves de proveedores en el frontend.
- El logo vigente es el de blanco y negro de `Codigo/public/brand/` (`tarpu-logo-*`, `tarpu-mark-*`); el original a color se conserva.
- Después de un cambio, desde la raíz: `npm --prefix Codigo run build` y `npm --prefix Codigo test`. Si hay un navegador disponible, también `npm --prefix Codigo run test:ui`, con `dev` encendido.

Este `AGENTS.md` se actualiza cuando cambian las reglas o se cierra una decisión importante. El estado del día a día va en `docs/00-estado-actual.md`.

## 8. Cómo continuar con el integrante de QENTARA

- **Al iniciar:** sitúa el trabajo en una o dos líneas (estado según `docs/00`) y continúa con la petición concreta. No reabras todas las decisiones ni generes un cuestionario general antes de aportar trabajo útil.
- **Si piden planificar el siguiente avance**, las cuestiones abiertas son estas (opciones de trabajo, no órdenes de implementarlas):
  - delimitar el recorrido demostrable;
  - concretar qué debe explicar el agente;
  - elegir la consulta detallada y la exportación básica;
  - relacionar pantallas con datos realmente disponibles;
  - definir cómo comprobar reglas y cobertura.
- **Al escribir:** con claridad y con ejemplos identificados como tales. No llenes vacíos con compromisos o cifras inventadas. Explica qué quedó decidido, qué propones y qué evidencia resolverá lo pendiente.

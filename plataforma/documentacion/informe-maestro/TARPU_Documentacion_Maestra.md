# TARPU - Documento maestro del proyecto

**Equipo:** QENTARA  
**Contexto de origen:** NASA Space Apps Challenge 2026  
**Versión:** 0.4 - definiciones confirmadas y supuestos pendientes diferenciados  
**Fecha de revisión:** 23 de octubre de 2026, America/Lima  
**Estado:** Definiciones y directrices confirmadas por el usuario, con propuestas técnicas y aspectos pendientes identificados por separado; no acredita implementación, validación en campo ni acuerdos comerciales.  
**Lema de trabajo:** Datos para cosechar un mejor mañana. **[SUP-013]**

Este documento desarrolla la identidad, la investigación, el negocio, el producto, la ciencia, la ingeniería y la continuidad de TARPU. Su propósito es permitir que QENTARA discuta decisiones concretas, distribuya trabajo y construya una demostración verificable que pueda evolucionar hacia un producto útil. La documentación está desarrollada; la ejecución y la validación conservan sus estados propios.

## Guía de uso

La base interna es `TARPU_QENTARA_Contexto_Integral.md`, versión 1.0, complementada por las indicaciones del usuario del 23/10/2026. Estas confirman la orientación inicial a todo Arequipa, la comprensión autónoma del agricultor mediante un agente integrado, el acceso a datos detallados sin evaluación agronómica y la presentación del trabajo en orden de dependencias, sin plazos estimados de desarrollo. Siguen por confirmar el stack, la cobertura efectiva de cada producto, los formatos finales de exportación, los precios y las reglas agronómicas.

**SUP significa suposición.** Cada marcador  identifica una decisión de trabajo, hipótesis o valor tentativo que requiere confirmación. El registro del anexo D explica su contenido, responsable funcional y prueba de cierre. Los códigos permanecen estables entre Markdown, LaTeX y PDF. Una propuesta detallada sigue siendo una suposición hasta que exista evidencia o aprobación registrada.

Se emplean seis estados: **contexto recuperado**, **confirmado por el usuario**, **referencia externa consultada**, **suposición**, **ejemplo sintético** y **validado**. La presentación, las descripciones, la formulación del problema y su justificación, la misión, la visión, los valores y los objetivos corregidos o aceptados por el usuario tienen estado confirmado; no se etiquetan como suposiciones. La confirmación de una definición de producto no equivale a una validación empírica de sus resultados. Esta edición no declara resultados propios como validados. Las referencias externas respaldan características de una fuente o un método; no validan automáticamente la aplicación de ese método a una parcela de Arequipa. La fecha de consulta de las referencias es 19/10/2026, salvo indicación distinta.

Las frases normativas, como "el sistema deberá", describen requisitos de trabajo. Las orientaciones confirmadas por el usuario se distinguen de sus decisiones de implementación todavía propuestas. Los números comerciales y las metas de prueba mantienen su condición de supuestos. No se atribuyen al equipo entrevistas, hectáreas atendidas, ingresos, ahorro de agua o rendimiento que no estén documentados.

Cada sección desarrolla su contenido y distingue las definiciones confirmadas de las decisiones todavía propuestas. Los cierres de validación identifican la evidencia que falta; no sustituyen su contenido por una lista de tareas. La fuente editable principal de esta edición es el Markdown; el LaTeX y el PDF reproducen su contenido. Toda nueva versión debe conservar esta correspondencia. **[SUP-040]**

## Índice

1. [01. Identidad, visión y fundamentos](#01-identidad-visión-y-fundamentos)
2. [02. Investigación, mercado y público objetivo](#02-investigación-mercado-y-público-objetivo)
3. [03. Modelo de negocio](#03-modelo-de-negocio)
4. [04. Producto, UX y requisitos](#04-producto-ux-y-requisitos)
5. [05. Fundamento científico y datos](#05-fundamento-científico-y-datos)
6. [06. Ingeniería y desarrollo DEV](#06-ingeniería-y-desarrollo-dev)
7. [07. Validación e impacto](#07-validación-e-impacto)
8. [08. Estrategia, roadmap y hackathon](#08-estrategia-roadmap-y-hackathon)
9. [Anexo A. Matriz de seguimiento](#anexo-a-matriz-de-seguimiento)
10. [Anexo B. Estructura de repositorios y documentación](#anexo-b-estructura-de-repositorios-y-documentación)
11. [Anexo C. Referencias y alcance de verificación](#anexo-c-referencias-y-alcance-de-verificación)
12. [Anexo D. Registro de suposiciones](#anexo-d-registro-de-suposiciones)
13. [Anexo E. Contratos y ejemplos sintéticos](#anexo-e-contratos-y-ejemplos-sintéticos)
14. [Anexo F. Aceptación y trazabilidad](#anexo-f-aceptación-y-trazabilidad)
15. [Anexo G. Control de cambios y decisiones](#anexo-g-control-de-cambios-y-decisiones)

## 01. Identidad, visión y fundamentos

### Presentación general

TARPU es una plataforma de apoyo a decisiones agrícolas del equipo QENTARA. Integra información ambiental, observaciones satelitales, propiedades estimadas del suelo y datos aportados por el productor para describir una parcela y comparar alternativas de cultivo y rotación. Su alcance territorial inicial se orienta a todo el departamento de Arequipa, con especial atención a la calidad del análisis en el contexto peruano. Se contempla que pueda utilizarse en otras partes del mundo, condicionando esa ampliación a la disponibilidad y representatividad de los datos y a la adecuación local de las reglas. El material de origen vincula el proyecto a NASA Space Apps Challenge 2026. La prioridad territorial está confirmada por el usuario; la cobertura efectiva y la pertinencia de cada resultado deben verificarse.

La unidad de trabajo es la parcela con su historial de campañas. Su geometría permite asociar información espacial; su historial aporta el contexto que los satélites no observan por sí solos: qué se sembró, cuándo, qué riego existe y qué busca el productor. La salida central es una comparación explicada con fuentes, fechas, limitaciones y preguntas que el agricultor puede consultar con el agente integrado en la aplicación. El agente debe ayudarle a comprender qué representa un dato, por qué aparece una alternativa y qué información falta para evaluarla. La app incorporará además un apartado de datos detallados, con acceso a registros y metadatos sin aplicarles el motor de recomendaciones, para cualquier persona que quiera revisar esa información, incluido el propio agricultor. La disposición de ese apartado y sus formatos de exportación siguen siendo decisiones de diseño.

**Descripción breve.** TARPU ayuda a los agricultores a comprender las condiciones de sus parcelas y comparar alternativas de cultivo y rotación. Combina datos ambientales, información satelital e historial agrícola para presentar indicadores y explicaciones trazables, con una experiencia accesible, un agente integrado y límites científicos visibles. Es una iniciativa del equipo QENTARA.

**Descripción ampliada.** TARPU busca acercar información útil a quienes planifican campañas agrícolas. A partir de una parcela identificada en un mapa y de los datos de manejo declarados por su productor, reúne series climáticas, observaciones de vegetación y propiedades estimadas del suelo. Organiza esos insumos en indicadores comprensibles y permite explorar alternativas de cultivo y rotación mediante reglas explícitas. Cada resultado conserva su procedencia, su período y sus restricciones de interpretación. El agricultor puede consultar al agente integrado para comprender los datos y los motivos de una comparación. También dispone de una vía de acceso a registros y metadatos más detallados, sin evaluación del motor agronómico, y podrá exportar información en formatos adecuados al tipo de dato o consultar un reporte legible, como un PDF. La propuesta comienza con una demostración acotada y evoluciona mediante pruebas con agricultores y revisión agronómica. QENTARA pretende que el proyecto continúe después de la hackathon, con una base técnica mantenible, investigación de usuarios y un modelo de sostenibilidad. El beneficio esperado es mejorar el acceso y la comprensión de información relevante para decidir. La reducción de pérdidas, el ahorro de agua y la mejora de rendimiento deberán evaluarse mediante pilotos; no son resultados demostrados de TARPU. La selección de formatos y el alcance de descarga se mantienen como propuesta.

QENTARA se trata como equipo y TARPU como producto. No se atribuye personería jurídica, registro de marca, significado lingüístico ni propiedad institucional a ninguno. El origen del nombre y la titularidad se documentarán con la declaración del equipo y, si corresponde, sus instrumentos formales.

### Problema y justificación

El problema de trabajo es la dificultad de convertir información ambiental dispersa en criterios comprensibles para planificar una campaña. Un productor puede conocer su terreno y recibir orientación local, pero necesitar apoyo para comparar condiciones históricas, revisar cambios observados y entender qué limitaciones afectan una alternativa. La magnitud y frecuencia de esta necesidad en el público elegido requieren evidencia de campo.

El árbol de problemas propuesto parte de cuatro causas: información en servicios separados; diferencias de escala y lenguaje técnico; historial agrícola incompleto; y asesoramiento o tiempo insuficientes para integrar los datos. El problema central es una comparación difícil de alternativas. Sus efectos hipotéticos son mayor tiempo de búsqueda, decisiones con información incompleta y dificultad para explicar o revisar una elección. No se establece una relación causal medida entre esos efectos y pérdidas agrícolas.

TARPU se justifica si reduce trabajo de interpretación y permite que el usuario reconozca condiciones relevantes y límites de la evidencia. La ventaja debe comprobarse frente a las prácticas actuales del productor, incluida la consulta a un agrónomo. Mostrar más capas no constituye por sí mismo un beneficio: cada indicador debe relacionarse con una pregunta agrícola y una acción de revisión.

La investigación territorial utilizará el [compendio agrícola de MIDAGRI](https://www.gob.pe/institucion/midagri/colecciones/5149-anuarios-estadisticas-de-produccion-agropecuaria) y el [Compendio Estadístico Arequipa 2024 del INEI](https://www.gob.pe/institucion/inei/informes-publicaciones/6453267-compendio-estadistico-arequipa-2024) como puntos de acceso a información oficial. Esta edición verifica la existencia de esas publicaciones, pero no extrae ni afirma cifras de productores, conectividad o pérdidas. Esas magnitudes deben calcularse con año, ámbito, unidad y tabla de origen antes de usarse en un pitch.

### Misión, visión y valores

**Misión:** transformar información ambiental y agronómica en explicaciones accesibles que ayuden a los agricultores a comprender sus parcelas y evaluar alternativas de campaña.

**Visión:** consolidar una herramienta confiable y accesible que permita a los agricultores comprender sus parcelas y tomar decisiones informadas con datos ambientales y conocimiento agronómico contextualizado. Se busca pulir la experiencia y la calidad del análisis en Arequipa y Perú, y ampliar su utilidad a otros territorios cuando sus datos, reglas y experiencia de uso hayan sido validados localmente.

Los valores se traducen en conductas observables: rigor significa conservar fórmulas y versiones; transparencia significa mostrar datos faltantes y procedencia; accesibilidad significa que la tarea principal pueda completarse sin interpretar un mapa técnico; utilidad local significa revisar reglas con especialistas del territorio; y respeto por los datos significa controlar quién puede consultar o compartir una parcela.

### Objetivos y propuesta de valor

El objetivo general es construir y evaluar una demostración que conecte datos reales con una comparación explicable de alternativas agrícolas. La propuesta de valor es que el propio agricultor comprenda qué información respalda una alternativa, explore sus dudas con el agente integrado y pueda revisar registros detallados cuando lo necesite. El acceso a datos y exportaciones también debe servir a personas con mayor familiaridad técnica, sin convertir esa experiencia en un requisito para usar la app.

| Objetivo | Resultado de trabajo | Evidencia de cumplimiento |
| --- | --- | --- |
| Conectar parcela y datos reales | Recorrido esencial: parcela de prueba, consulta POWER y gráfico con fuente, período y unidad | Solicitud reproducible, datos conservados y recorrido ejecutado |
| Facilitar la comprensión con el agente integrado | Recorrido esencial: preguntas sobre datos y limitaciones respaldadas en la evidencia disponible | Conversaciones de prueba con respuestas trazables y faltantes reconocidos |
| Habilitar consulta detallada y exportación | Recorrido esencial: registros y metadatos sin evaluación agronómica, con descarga básica de la selección | Vista tabular y archivo que conserve unidades, fechas, procedencia y advertencias |
| Incorporar evidencia de vegetación | Ampliación del recorrido: observación válida procesada y visualizada con cobertura útil calculada | Activo, máscara, cálculo y ficha de calidad |
| Comparar alternativas de cultivo | Ampliación del recorrido: catálogo acotado con reglas explícitas y motivos visibles; carácter experimental hasta revisión | Catálogo, entradas, cálculo y estado de revisión identificables |
| Evaluar comprensión del prototipo | Validación del producto: el agricultor identifica fuente, limitación y motivo principal sin depender de un intermediario | Tareas observadas y registro de errores; metas cuantitativas en el protocolo de validación |
| Revisar sostenibilidad | Validación del producto: costos por análisis y parcela, junto con necesidades de uso y compra | Hoja de costos y evidencia comercial diferenciada de los escenarios sintéticos |

El cuadro presenta un orden recomendado de construcción y comprobación, sin asignar fechas ni duraciones. El recorrido esencial concentra la demostración en una consulta real que el agricultor pueda comprender, explorar con el agente y descargar; las ampliaciones y los estudios de validación no se presentan como obligaciones equivalentes para esa demostración. El reporte PDF puede complementar la descarga cuando esté implementado. Las metas de aceptación y decisiones de implementación siguen sujetas a validación. El éxito de un objetivo no valida automáticamente los restantes: una consulta correcta no prueba una recomendación útil ni una intención de pago.

### Alcance, límites y glosario

El alcance territorial confirmado comprende todo Arequipa como prioridad inicial y busca una base de análisis adecuada al contexto peruano. El uso en otras partes del mundo se contempla como posibilidad condicionada por los datos y las reglas disponibles. La cobertura se evaluará por ubicación, variable, producto y período, indicando dónde hay datos útiles y dónde la información es parcial o insuficiente. Los casos de prueba y las entrevistas pueden seleccionarse en localidades accesibles sin reducir por ello el alcance del producto a un único distrito.

Como selección todavía propuesta, el catálogo inicial candidato incluye papa, quinua, haba y cebada; su pertinencia y variedades requieren revisión local. Se propone explorar parcelas de 0,5 a 10 hectáreas como criterio inicial de investigación, no como definición legal de pequeño productor. **[SUP-002]**

El MVP incluye identificación de parcela, historial básico, clima histórico, evidencia satelital disponible y comparación de candidatos con reglas explícitas. Incluye al agente integrado para comprender los resultados y una vía de consulta de registros detallados con exportación básica. Las integraciones complementarias y las exportaciones de archivos pesados se incorporan cuando su acceso y calidad estén comprobados. Se excluyen de su primera aceptación la predicción de rendimiento, la rentabilidad específica, las prescripciones de fertilización, el control de riego, el diagnóstico de plagas, el pronóstico de heladas a nivel de planta y la recomendación de fechas precisas de siembra. Esas funciones requerirían entradas y validaciones adicionales. **[SUP-012, SUP-021, SUP-034, SUP-037]**

| Término | Uso en TARPU |
| --- | --- |
| Parcela | Geometría y contexto de una unidad de manejo; el dibujo no acredita propiedad legal |
| Campaña | Registro de un cultivo y su período en una parcela, con manejo declarado |
| Rotación | Sucesión de cultivos; evaluar solo el cultivo siguiente no equivale a validar una secuencia completa |
| NDVI | Índice espectral de contraste entre infrarrojo cercano y rojo; no es una medición directa de fertilidad |
| GPM / IMERG | Misión y producto relacionado con estimación de precipitación; debe identificarse corrida y versión |
| SMAP | Misión con productos de humedad del suelo; grilla, huella y profundidad dependen del producto |
| Píxel / resolución | Celda de un ráster y escala de representación; no garantizan exactitud local |
| GeoTIFF / COG | Archivo ráster georreferenciado; COG organiza el acceso eficiente a partes del archivo |
| GeoJSON | Representación de geometrías y atributos para intercambio |
| API | Contrato de comunicación entre aplicaciones |
| CRS / SRID | Sistema de referencia espacial y su identificador |
| Anomalía | Diferencia respecto de una referencia explícita comparable |
| Cobertura válida | Proporción espacial o temporal que supera controles definidos |
| Escenario | Evaluación condicionada por entradas y reglas; no es una predicción garantizada |
| Trazabilidad | Posibilidad de reconstruir un resultado desde sus fuentes y transformaciones |

**Definiciones confirmadas:** presentación, descripciones, formulación del problema y justificación, misión, visión, valores y objetivos incorporan las correcciones y la aceptación del usuario. Quedan establecidos el alcance inicial en todo Arequipa, la prioridad del contexto peruano, la posible ampliación territorial, el uso directo por el agricultor, el agente integrado, el acceso a datos detallados y exportables, y la presentación del trabajo sin plazos estimados. **Pendientes de implementación y comprobación:** cobertura y calidad de cada fuente, catálogo local, reglas agronómicas, formatos concretos, diseño técnico y pruebas de aceptación. Estos pendientes se desarrollan con sus códigos específicos en las secciones correspondientes.

## 02. Investigación, mercado y público objetivo

### Contexto agrícola y análisis del problema

La investigación se organizará por sistema productivo y acceso al agua dentro de Arequipa, con atención a las diferencias del contexto peruano. Un promedio regional no describe todas las decisiones del territorio; se debe registrar localidad, altitud cuando exista una fuente adecuada, disponibilidad de riego, cultivo, variedad, calendario y tamaño de unidad de manejo. Los casos de campo se seleccionarán por diversidad y accesibilidad, y la comprobación de cobertura incluirá ubicaciones distribuidas por Arequipa; una muestra local no prueba por sí sola representatividad de todo el departamento. **[SUP-005]**

La ficha territorial tendrá seis bloques: ubicación administrativa; superficie y cultivos con año y fuente; manejo del agua; riesgos reportados y evidencia disponible; conectividad observada; y red de asesoramiento. Las estadísticas oficiales se registrarán separadas de las respuestas de entrevistas. Las hectáreas cultivadas por campaña no deben sumarse como si fueran productores únicos ni usarse como número de cuentas potenciales.

El árbol de actores ubica al agricultor como usuario y decisor de manejo. El agente integrado forma parte de la experiencia de consulta y explicación, mientras el apartado de datos detallados permite una lectura técnica directa a quien la necesite. Los especialistas agronómicos participan en la validación de métodos y reglas; las organizaciones pueden facilitar pruebas o financiar el acceso. Proveedores de datos, investigadores y autoridades son actores de soporte potenciales; su presencia en el mapa no acredita alianzas. **[SUP-005, SUP-011, SUP-034]**

Las preguntas de investigación son: qué decisión se tomó recientemente; qué información se consultó; qué dificultad concreta apareció; qué costo de tiempo o dinero tuvo; qué parte de la información no se entendió; y qué resultado permitiría evaluar una mejora. Se documentará evidencia contraria, como productores satisfechos con sus medios actuales o parcelas donde los datos remotos no aporten suficiente detalle.

### Segmentos de usuarios

| Segmento hipotético | Tarea principal | Papel económico posible | Criterio de selección para investigar |
| --- | --- | --- | --- |
| Productor con una o pocas parcelas | Revisar condiciones y comparar candidatos para la siguiente campaña | Usuario y beneficiario; pagador por confirmar | Participa en la decisión, aporta historial y acepta seguimiento |
| Usuario con mayor familiaridad técnica, incluido el agricultor | Consultar series, metadatos y archivos sin evaluación del motor agronómico | Usuario del mismo producto; compra avanzada por validar | Puede describir qué variables, detalle y formatos necesita |
| Asociación o cooperativa | Acompañar miembros y organizar visitas | Facilitador o comprador | Tiene un responsable y una necesidad verificable de seguimiento |
| Institución o programa agrícola | Evaluar un piloto y reportar actividades | Comprador o financiador | Puede definir resultados, presupuesto y proceso de contratación |

La segmentación completa es **[SUP-002]**. No se considera que todo agricultor de Arequipa sea cliente potencial accesible. Se diferencian elegibilidad científica, acceso comercial y disposición a usar o pagar. Un predio sin una observación satelital útil puede seguir obteniendo contexto climático, pero esa diferencia debe ser visible.

### Personas, tareas y recorrido

Las siguientes son **personas sintéticas [SUP-005]**, construidas para diseñar y contrastar tareas; no representan entrevistas realizadas.

**Persona P1: productor que planifica su próxima campaña.** Conoce las prácticas de su parcela, toma decisiones con apoyo familiar o técnico y usa el teléfono para comunicarse. Necesita comprender condiciones y alternativas sin aprender teledetección. Su tarea es: "Cuando voy a planificar una campaña, quiero comparar opciones con las condiciones y recursos de mi parcela para saber qué revisar antes de elegir". Su barrera hipotética es la desconfianza ante un puntaje sin explicación. El resultado deseable es poder explicar con sus palabras por qué una opción necesita más revisión.

**Persona P2: agricultor o usuario que desea revisar datos detallados.** Conoce o quiere examinar series, tablas y mapas con mayor profundidad. Necesita filtrar variables y períodos, comprobar unidades y procedencia y descargar una selección sin que el motor de recomendaciones la convierta en una evaluación. Su tarea es: "Cuando quiero contrastar una información, quiero consultar y exportar los registros y sus metadatos para analizarlos con el nivel de detalle que necesito". Su barrera hipotética es que una tarjeta resumida o un PDF no conserve los registros subyacentes. El resultado deseable es alternar entre explicación accesible y evidencia detallada con trazabilidad. **[SUP-005, SUP-021]**

**Persona P3: responsable de una organización.** Necesita coordinar acceso, conocer qué parcelas se revisaron y evaluar si el servicio merece continuidad. Su tarea es: "Cuando financio acompañamiento agrícola, quiero conocer uso, calidad y resultados observables sin exponer datos individuales fuera de los permisos acordados". Su barrera hipotética es un informe de impacto sin línea base.

| Etapa del recorrido | Acción esperada | Fricción hipotética | Respuesta de diseño |
| --- | --- | --- | --- |
| Primer contacto | Entender para qué sirve TARPU | Promesas vagas o lenguaje técnico | Explicar una tarea y mostrar un caso trazable |
| Identificación | Localizar o dibujar una parcela | Mapa pesado o límites difíciles | Búsqueda, acompañamiento y confirmación de geometría |
| Contexto | Registrar cultivo, historial y agua | Información incompleta | Permitir desconocido y explicar por qué se pide |
| Consulta | Revisar clima y vegetación | Confundir escala regional con local | Fecha, resolución y limitación junto al indicador |
| Comparación | Revisar candidatos y motivos | Interpretar puntaje como certeza | Restricciones, desglose y datos ausentes |
| Decisión y seguimiento | Consultar dudas al agente integrado, revisar evidencia y registrar lo decidido | Falta de comprensión o continuidad | Explicación trazable, consulta detallada y reporte recuperable |

El recorrido y sus soluciones son **[SUP-005, SUP-014]**. Deben observarse también abandonos y uso asistido; una tarea completada con intervención del moderador no cuenta como éxito autónomo.

### Competencia e investigación de campo

Se compararán cuatro clases de alternativas: práctica habitual y asesoramiento; servicios meteorológicos; visores geoespaciales; y plataformas de gestión o monitoreo agrícola. Esta clasificación es una matriz de investigación, no un ranking comercial. No se asignan precios, cobertura o funcionalidades a empresas sin comprobarlas en sus fuentes y, cuando corresponda, probarlas. **[SUP-005]**

Una primera comparación documental permite identificar alternativas concretas. Las capacidades siguientes provienen de sus propias fuentes; la facilidad de uso, cobertura útil en el territorio, planes, soporte y costo total deberán probarse con el mismo caso de parcela antes de puntuar una comparación comercial.

| Alternativa localizada | Capacidad documentada | Pregunta para contrastar con TARPU |
| --- | --- | --- |
| [NASA Worldview](https://www.earthdata.nasa.gov/home) | Exploración interactiva de capas satelitales y acceso a datos | Qué tarea puede resolver ya el usuario con un visor y cuánto acompañamiento necesita |
| [FAO WaPOR](https://www.fao.org/land-water/resources/tools/databases/wapor/en) | Base de datos satelitales orientada al monitoreo de productividad del agua | Qué productos y niveles sirven al ámbito elegido y si complementan o sustituyen una parte del análisis |
| [Atfarm](https://support.at.farm/hc/es-es/articles/18253470818332--C%C3%B3mo-puedo-monitorear-la-biomasa-de-mi-parcela) | Monitoreo de biomasa por parcela, con selección de mapas y fechas en web y móvil | Qué valor adicional aporta la comparación con historial y reglas revisadas en el territorio |
| Práctica habitual y asesoramiento | Alternativa a observar directamente durante entrevistas, sin capacidad atribuida de antemano | Cuándo TARPU mejora una tarea y cuándo la práctica actual es suficiente |

Las preguntas de diferenciación son **[SUP-005]**. No se infiere de estas páginas que una alternativa carezca de una función que no menciona, ni que TARPU sea superior.

La ficha competitiva documentará tarea resuelta, público, territorio, acceso desde móvil, entrada de historial, fuente de cada variable, explicación de resultados, manejo de faltantes, exportación, costo total y fecha de revisión. La diferenciación de TARPU a contrastar es la combinación de historial agrícola y comparación explicable con procedencia accesible. Puede resultar insuficiente o ya estar cubierta por otras soluciones.

**Plan de descubrimiento [SUP-006]:** realizar 16 entrevistas a productores, cuatro a especialistas agronómicos para revisar contexto y reglas y dos a responsables de organizaciones. Es una muestra intencional para aprender, no una estimación estadística representativa. Se buscará diversidad de riego, tamaño de parcela, conectividad y familiaridad digital. La captación no se limitará a integrantes cercanos al equipo. Las sesiones durarán aproximadamente 30 a 45 minutos, con permiso específico para grabar.

Guion propuesto de entrevista:

1. Describir la última decisión real de cultivo o cambio de campaña y quién participó.
2. Reconstruir qué información se consultó y en qué orden, pidiendo ejemplos disponibles.
3. Identificar incertidumbres, decisiones postergadas y alternativas descartadas.
4. Preguntar por riego, historial, restricciones de recursos y diferencias entre parcelas.
5. Observar una consulta actual desde el teléfono, si la persona acepta.
6. Mostrar una tarea del prototipo después de entender su práctica y observar su ejecución.
7. Pedir que explique fuente, fecha, límite y motivo de una alternativa.
8. Explorar quién contrataría o financiaría el servicio y qué tendría que demostrar.
9. Registrar objeciones y razones para no usarlo.
10. Acordar si puede ser contactado para otra revisión.

La encuesta breve posterior recogerá frecuencia de decisiones, fuentes utilizadas, acceso a asesoramiento, conectividad y relevancia de las tareas. La disposición de pago declarada se tratará como señal débil; se distinguirá de una prueba pagada, una carta de intención y un contrato.

Cada hallazgo tendrá identificador `INV-XXX`, segmento, fecha, evidencia anonimizada, interpretación y contraejemplos. Los datos personales y audios se almacenarán separados de la síntesis. Se priorizará una necesidad cuando aparezca en varios casos independientes y pueda relacionarse con una tarea concreta; el umbral de priorización se discutirá al cerrar las entrevistas. **[SUP-006, SUP-039]**

**Cierre de validación del área:** entregar fichas territoriales con fuentes, matriz competitiva revisada, síntesis de entrevistas y personas corregidas. Si la comparación de cultivos no resulta una necesidad prioritaria, revisar el MVP antes de ampliar integraciones. **[SUP-005, SUP-006]**

## 03. Modelo de negocio

### Hipótesis de modelo comercial

La hipótesis es sostener un acceso esencial para productores mediante servicios profesionales y contratos con organizaciones. El valor de pago propuesto está en gestionar varias parcelas, conservar análisis, compartir trabajo y recibir acompañamiento; el acceso a datos abiertos por sí solo no explica una suscripción. **[SUP-007]**

| Plan tentativo | Usuario y comprador | Alcance de trabajo propuesto | Límite a validar |
| --- | --- | --- | --- |
| Tarpu Campo | Productor; financiado por el proyecto o una organización | Una parcela, resumen climático, evidencia y comparación disponible | Dos análisis nuevos al mes; consultar resultados existentes no consume otro análisis |
| Tarpu Pro | Productor o usuario que requiere gestión y consulta avanzadas | Hasta 20 parcelas, historial, comparativas, datos detallados y exportaciones ampliadas | 40 análisis nuevos al mes; ampliaciones según costo medido |
| Tarpu Organizaciones | Asociación, cooperativa o empresa | Espacio compartido, permisos y seguimiento | Cupos por contrato; no prometer capacidad ilimitada |
| Tarpu Institucional | Programa o entidad financiadora | Piloto con alcance, capacitación y evaluación acordados | Contrato por servicio y período; alcance definido por entregables |

Planes, nombres y límites son **[SUP-007]**. La diferencia entre Organizaciones e Institucional reside en el tipo de servicio y acompañamiento propuesto; puede simplificarse a una única oferta organizacional si las entrevistas no justifican separarlos. No hay cobros activos ni condiciones comerciales aprobadas.

**Precios de prueba [SUP-008]:** S/ 0 para Campo, S/ 120 mensuales para Pro y una referencia exploratoria desde S/ 600 mensuales para un espacio organizacional pequeño, siempre con alcance cotizado. Son importes creados para diseñar entrevistas y escenarios; no son precios de mercado, ofertas ni disposición de pago demostrada. El servicio institucional se presupuestaría según parcelas, procesamiento, capacitación y evaluación. Los impuestos y costos de facturación deben validarse antes de contratar.

### Business Model Canvas

| Bloque | Desarrollo propuesto | Prueba que puede refutarlo |
| --- | --- | --- |
| Segmentos | Agricultores como usuarios directos; personas que requieren datos detallados y organizaciones como segmentos complementarios | No existe una tarea recurrente ni un responsable de compra |
| Propuesta de valor | Entender condiciones, comparar candidatos y conservar evidencia para conversar y dar seguimiento | El usuario obtiene lo mismo con menos esfuerzo usando sus medios actuales |
| Canales | Contacto directo con agricultores, demostraciones de la app y captación mediante organizaciones | El costo de incorporación supera el valor o no hay acceso al público |
| Relaciones | Inicio acompañado, consulta autónoma y revisión técnica cuando corresponda | El usuario necesita asistencia en cada consulta y no hay financiación para ella |
| Ingresos | Suscripción profesional, piloto contratado y servicio organizacional | No hay compras reales al costo necesario para operar |
| Recursos | Equipo, motor versionado, conectores, catálogo local, infraestructura y confianza | No se puede mantener calidad o acceso a datos |
| Actividades | Integrar, validar, explicar, dar soporte y medir uso y costo | El procesamiento o soporte crece más rápido que los ingresos |
| Socios | Agrónomos, organizaciones y entidades académicas potenciales | No se consiguen acuerdos concretos de revisión o pilotaje |
| Costos | Desarrollo, operación, almacenamiento, datos/servicios cuando apliquen, visitas y validación | El margen no cubre soporte y renovación tecnológica |

El Canvas completo es **[SUP-007, SUP-011]**. Proveedores de datos abiertos no se presentan como socios de QENTARA. Un enlace a NASA o Copernicus no implica respaldo institucional al producto.

### Value Proposition Canvas

Para el productor, el trabajo funcional es comprender su parcela y comparar alternativas; el trabajo emocional hipotético es sentirse capaz de interpretar la información que recibe; y el trabajo social posible es discutir su decisión con su familia u otras personas de confianza. Los dolores a contrastar son fragmentación, falta de contexto y dificultad para reconocer incertidumbre. Las ganancias esperadas son claridad, menor tiempo de búsqueda y continuidad del historial. El agente integrado acompaña la comprensión y el acceso a datos detallados permite profundizar cuando el usuario lo desee. **[SUP-005, SUP-007, SUP-034]**

La respuesta del producto será un resumen breve, evidencia accesible y una comparación que muestre motivos y faltantes. El ajuste se medirá con tareas: localizar un período, reconocer una limitación y explicar una diferencia entre candidatos. Un mapa atractivo o una valoración general positiva no bastan para afirmar ajuste producto-mercado.

Para quien requiere mayor detalle, el trabajo es contrastar registros, unidades, fechas y fuentes y reutilizar una selección en sus herramientas. Se propone consulta tabular y exportación con metadatos, sin exigir esta forma de trabajo al agricultor que prefiere explicaciones sencillas. Para la organización, el trabajo es facilitar el acceso y evaluar uso; se propone un espacio con permisos y métricas de servicio. Ningún plan debe vincular el pago con una recomendación artificialmente favorable ni ocultar la calidad del dato a usuarios gratuitos. El acceso detallado es una capacidad del producto; los cupos o prestaciones ampliadas siguen siendo hipótesis comerciales. **[SUP-007, SUP-021]**

### Mercado, precios y economía unitaria

La unidad de mercado principal será el comprador y la unidad de costo será el análisis nuevo, distinguiendo parcela activa, consulta de un resultado y escena procesada. Hectáreas, cuentas y organizaciones se medirán por separado. El TAM expresa el universo coherente con el servicio; el SAM limita territorio, cultivos, datos y canal; el SOM se construye desde la capacidad real de captar y atender compradores. **[SUP-009]**

**Ejemplo aritmético de mercado, íntegramente sintético [SUP-009]:** si un universo hipotético tuviera 5.000 compradores elegibles del plan avanzado y un ingreso anual de S/ 1.440 por comprador, el TAM ilustrativo sería S/ 7.200.000 anuales. Si solo 1.200 fueran atendibles con el territorio y canal elegidos, el SAM sería S/ 1.728.000. Si se adquirieran y retuvieran 60 cuentas durante un año completo, el ingreso anualizado sería S/ 86.400, equivalente al 5% de esas 1.200 cuentas. Estas poblaciones no describen Arequipa; el escenario sirve para mostrar el método y deberá reemplazarse por un conteo fundamentado. La adquisición gradual produciría un ingreso reconocido menor durante el primer año.

**Modelo unitario ilustrativo [SUP-010]:** una cuenta Pro paga S/ 120 al mes, mantiene 20 parcelas activas y ejecuta 40 análisis nuevos. Se supone un costo variable de S/ 0,80 por análisis, S/ 8 de almacenamiento/transferencia asignable y S/ 20 de soporte mensual. El costo variable sería S/ 60 y la contribución S/ 60 por cuenta, equivalente al 50% del ingreso del escenario. No incluye impuestos, morosidad ni costos fijos; no constituye rentabilidad neta.

| Cálculo | Fórmula y resultado del escenario |
| --- | --- |
| Costo de procesamiento | 40 análisis por S/ 0,80 = S/ 32 al mes |
| Costo variable total | 32 + 8 + 20 = S/ 60 por cuenta al mes |
| Contribución | 120 - 60 = S/ 60 por cuenta al mes |
| Punto de equilibrio operativo simplificado | S/ 3.000 de costos fijos / S/ 60 = 50 cuentas equivalentes |
| Recuperación de adquisición | CAC sintético S/ 180 / S/ 60 = 3 meses |
| LTV de contribución simplificado | S/ 60 / abandono mensual supuesto 0,05 = S/ 1.200 |
| Relación ilustrativa | LTV / CAC = 1.200 / 180 = 6,67 |

Todos los valores son **[SUP-010]**. La fórmula de LTV supone contribución y abandono estables, sin descuento y con comportamiento homogéneo; no debe usarse para decidir inversión sin cohortes reales. El punto de equilibrio tampoco paga automáticamente una plantilla completa. Cuentas organizacionales y gratuitas deben imputarse por sus cargas reales, no convertirse mecánicamente en cuentas Pro.

La sensibilidad muestra por qué medir importa: con 80 análisis por cuenta y los mismos demás supuestos, el costo variable sería S/ 92 y la contribución S/ 28; con S/ 3.000 fijos se necesitarían 108 cuentas redondeando hacia arriba. Si la adquisición cuesta S/ 180, la recuperación sería de aproximadamente 6,43 meses. La frecuencia de análisis, el soporte y el acceso a activos son variables críticas. **[SUP-010]**

El registro mensual de costos debe separar solicitudes al proveedor, bytes descargados, tiempo de cómputo, almacenamiento, transferencias, soporte y visitas. Se medirá la reutilización por celda o escena para evitar cobrar o procesar de nuevo resultados idénticos. Los descuentos y cupos gratuitos deberán tener un financiador o un límite sostenible. **[SUP-010, SUP-024]**

### Go-to-market, alianzas y riesgos

Se propone contrastar la propuesta directamente con agricultores y con organizaciones que puedan facilitar su participación. La secuencia comercial es contacto, entrevista de necesidad, demostración de una tarea, prueba acordada, evaluación y propuesta de continuidad. La demostración debe permitir que el agricultor comprenda resultados con el agente y, si lo desea, abra los datos detallados. Cada etapa conserva responsable, evidencia, objeción y siguiente acción. **[SUP-011]**

Los indicadores del embudo serán organizaciones contactadas, reuniones útiles, pruebas iniciadas, usuarios activados, pruebas completadas, contratos y renovaciones. La activación se define como una parcela registrada con una consulta de evidencia completada; no como crear una cuenta. Se reportarán recuentos y denominadores, sin atribuir conversiones a una población no observada. **[SUP-011]**

La propuesta a un aliado debe concretar qué aporta cada parte: acceso voluntario a participantes, revisión agronómica, capacitación o financiación. Debe indicar duración, uso de datos, entregables y derecho a retirarse del estudio cuando corresponda. No se publicarán logos ni se anunciarán alianzas antes de documentar autorización. **[SUP-011, SUP-039]**

Los riesgos de negocio son utilidad poco percibida, estacionalidad del uso, dificultad de incorporación, ciclos de compra largos y costo de procesamiento y del agente integrado. Se responderá con entrevistas, pruebas de tareas, medición de costos y límites de oferta. Si el usuario no comprende los resultados, se revisarán las explicaciones y el flujo de consulta; si necesita más detalle, se evaluará el apartado de datos y sus exportaciones. La necesidad de un intermediario permanente se tratará como una señal para mejorar la experiencia autónoma del agricultor. **[SUP-007, SUP-011, SUP-034]**

**Cierre de validación del área:** el responsable de negocio reemplazará poblaciones y precios sintéticos, medirá costos por carga real y registrará pruebas de compra. Hasta entonces los números anteriores sirven para discutir el modelo, no para presentar tracción, valoración o ingresos. **[SUP-007, SUP-011]**

## 04. Producto, UX y requisitos

### PRD y alcance del MVP

**Problema de producto [SUP-012]:** una persona que planifica una campaña necesita reunir condiciones e historial de una parcela y comprender cómo influyen en la comparación de candidatos. El MVP debe demostrar esa tarea de principio a fin, con datos reales en las capas implementadas y separación explícita de la evaluación experimental.

El recorrido mínimo aceptable es: abrir una parcela, verificar su geometría, registrar el cultivo anterior y el agua disponible, consultar una serie climática, revisar su procedencia, hacer una pregunta al agente integrado y abrir los registros detallados de esa misma consulta. Debe poder exportarse una selección básica. La evidencia de vegetación y la comparación se incorporan con sus datos y reglas comprobados. Si la información necesaria no existe, la experiencia explica la insuficiencia y qué permitiría continuar. **[SUP-012, SUP-020, SUP-021, SUP-034]**

Se propone construir por dependencias. **MVP-A** demuestra parcela, POWER, persistencia, API, gráfico trazable, consulta de registros y exportación básica. El agente integrado responde preguntas sobre esa evidencia disponible. **MVP-B** añade una capa de vegetación y comparación experimental del catálogo acotado, y amplía el contexto que puede explicar el agente. IMERG, SoilGrids y las descargas de archivos pesados complementan la solución cuando sus conectores hayan superado verificación; una fuente fallida se mostrará como no disponible. La demostración no simulará una integración ausente ni una respuesta de agente no ejecutada como si fueran reales. **[SUP-012, SUP-016, SUP-021, SUP-034]**

| Requisito | Prioridad propuesta | Criterio de aceptación |
| --- | --- | --- |
| RF-01 Identificar parcela | Obligatorio A | Crear y recuperar geometría válida; mostrar área calculada, origen y versión |
| RF-02 Registrar contexto | Obligatorio A | Guardar cultivo anterior, riego y período; admitir desconocido sin transformarlo en cero |
| RF-03 Consultar clima | Obligatorio A | Serie real con unidades, fuente, rango, faltantes y fecha de procesamiento |
| RF-04 Consultar evidencia | Obligatorio A | Cada indicador enlaza a producto, método y calidad; ejemplos sintéticos llevan etiqueta |
| RF-05 Visualizar vegetación | Obligatorio B | Escena válida, máscara aplicada, cobertura útil y leyenda numérica |
| RF-06 Comparar candidatos | Obligatorio B | Reglas y entradas versionadas; exclusiones y faltantes visibles; no emitir resultado si fallan mínimos |
| RF-07 Ajustar prioridades | Deseable B | Pesos válidos y misma entrada científica; recalcular solo evaluación, conservando escenario anterior |
| RF-08 Exportar y compartir | Exportación tabular básica A; reporte legible B | Exportar una selección con permiso, fuente, período, unidades y advertencias; PDF como reporte, no sustituto de los registros |
| RF-09 Gestionar acceso | Obligatorio para datos privados | Un usuario sin autorización no obtiene geometrías, archivos ni trabajos de otra parcela |
| RF-10 Seguir procesamiento | Obligatorio si hay trabajos largos | Identificador persistente, estado, progreso por etapa y recuperación tras recargar |
| RF-11 Consultar al agente integrado | Obligatorio en el recorrido demostrable | Responder sobre la parcela y evidencia autorizadas, mostrar respaldo y reconocer datos ausentes |
| RF-12 Acceder a datos detallados | Obligatorio para las fuentes del recorrido | Mostrar registros y metadatos sin aplicar el motor agronómico; identificar originales y transformaciones técnicas |

La prioridad y los criterios son **[SUP-012]**. Una demo pública puede utilizar únicamente parcelas sintéticas o autorizadas; la gestión privada completa puede diferirse si el despliegue se limita a un conjunto de demostración claramente aislado.

**Requisitos no funcionales propuestos [SUP-025]:** consultas cacheadas con p95 inferior a dos segundos en el servidor; acuse de trabajo en menos de dos segundos; primer resumen textual visible en menos de cinco segundos en una prueba móvil limitada a 1 Mbps; hasta diez análisis concurrentes en el entorno piloto; y disponibilidad objetivo del 99% mensual para el servicio piloto acordado. No son mediciones obtenidas. Los procesos externos no se incluyen en la latencia de consulta cacheada; deben medirse aparte y comunicar espera real. No se ofrece un SLA comercial con estos objetivos.

La definición de terminado exige recorrido ejecutado, evidencia preservada, permisos comprobados, manejo de fallo de proveedor, ausencia de resultados sintéticos sin etiqueta, revisión de texto y reproducción de al menos un resultado desde sus entradas. El anexo F convierte esa definición en una matriz de comprobación. **[SUP-012]**

### Catálogo funcional

| Módulo | Entradas | Procesamiento y salida | Fase y dependencia |
| --- | --- | --- | --- |
| Mis parcelas | Polígono, nombre e historial declarado | Validar geometría y mostrar ficha versionada | MVP-A; almacenamiento espacial |
| Clima y riesgos | Coordenadas, período y series | Resúmenes históricos; avisos sobre datos, sin pronóstico propio | MVP-A; POWER |
| Monitor satelital | Geometría y escenas con bandas y calidad | Máscara, NDVI, estadísticas y capa con fecha | MVP-B; acceso a activos |
| Agua y suelo | Información de riego y capas edáficas | Fichas por profundidad y límites de interpretación | MVP-B condicionado; SoilGrids |
| Rotaciones | Historial, catálogo y restricciones | Comparar siguiente cultivo y conservar motivos | MVP-B experimental; reglas revisadas |
| Simulador | Escenario base y prioridades | Reordenar candidatos comparables; guardar diferencias | MVP-B deseable; motor |
| Alertas | Estado de datos y umbrales aprobados | Avisos de actualización o faltantes; riesgos agrícolas futuros | Producto posterior para alertas agronómicas |
| Agente integrado | Pregunta y evidencia autorizada de la parcela | Explicación en lenguaje sencillo con referencias y límites | Recorrido demostrable; texto como interacción inicial propuesta |
| Datos detallados y exportación | Selección de variables, períodos, registros y metadatos | Consulta sin evaluación agronómica; CSV/JSON y otros formatos según el dato | MVP-A básico; formatos y alcance por validar |
| Reportes | Selección o resultado y permisos | Resumen legible con trazabilidad y advertencias, exportable a PDF | MVP-B; no reemplaza datos reutilizables |
| Gestión | Identidad, organización y membresías | Acceso por rol y administración de cupos | Piloto privado y evolución |

La asignación funcional es **[SUP-012, SUP-034]**. Los avisos de datos, por ejemplo "la escena tiene demasiadas nubes", son distintos de alertas agronómicas como "habrá helada". El MVP puede ofrecer los primeros sin afirmar que resuelve las segundas.

### Historias y flujos de usuario

**HU-01. Registrar una parcela [SUP-012].** Como productor, quiero localizar y confirmar mi parcela para consultar información asociada. Dada una geometría válida, al confirmar se guarda una versión y se muestra su área; si hay autointersección o coordenadas inválidas, se explica el problema antes de guardar. Dibujar una parcela no constituye prueba de titularidad.

**HU-02. Consultar clima [SUP-012].** Como usuario, quiero entender condiciones históricas de un período. Dada una serie almacenada, la pantalla muestra variable, unidad, fuente, rango y días faltantes. Al cambiar el período, se actualizan serie y cobertura. Si la respuesta externa falla, el sistema conserva el último resultado y su fecha, cuando esté disponible y permitido, y explica su antigüedad.

**HU-03. Entender una capa [SUP-012].** Como productor, quiero saber qué representa el mapa. Al activar vegetación se muestran fecha de adquisición, índice, escala, cobertura válida y áreas sin datos. Una escena vacía no se rellena con color verde ni se representa como NDVI cero. La ficha permite consultar el motivo de descarte.

**HU-04. Comparar candidatos [SUP-018, SUP-020, SUP-034].** Como agricultor, quiero explorar alternativas y consultar sus motivos con el agente integrado. Al solicitar una comparación se fija una copia del historial, los indicadores y las prioridades. Cada alternativa muestra elegibilidad, motivos y datos ausentes. Si falta una condición excluyente, el resultado indica no evaluable o revisión necesaria, en lugar de inventar un valor. El agente explica esos resultados y remite a su evidencia.

**HU-05. Ajustar prioridades [SUP-019].** Como usuario, quiero comparar cómo cambia el orden cuando doy más peso al agua. El sistema valida pesos no negativos cuya suma sea 100, mantiene idénticas las entradas científicas y conserva la versión anterior. Los candidatos no elegibles no se vuelven elegibles por aumentar un peso.

**HU-06. Revisar y compartir [SUP-026].** Como agricultor autorizado sobre mi parcela, quiero guardar una observación y emitir un reporte. El comentario identifica autor y fecha, sin sobrescribir el cálculo. El reporte conserva las advertencias. Revocar acceso impide nuevas consultas y descargas mediante enlaces privados; no puede retirar copias que otra persona ya haya descargado legítimamente.

**HU-07. Recuperar una consulta [SUP-014, SUP-024].** Como usuario con conexión intermitente, quiero volver al último resultado. La pantalla muestra qué está guardado y cuándo se obtuvo; la caché local privada es opcional y debe poder borrarse. Una solicitud de análisis no se repite automáticamente si ya existe el mismo trabajo. No se promete procesamiento remoto sin conexión.

**HU-08. Consultar al agente [DEC-002].** Como agricultor, quiero preguntar qué significa un indicador, por qué se muestra una alternativa y qué información falta. La respuesta conserva la parcela activa, distingue dato de interpretación y permite abrir la evidencia. Si no hay respaldo para responder, el agente comunica la limitación sin inventar observaciones ni modificar las reglas.

**HU-09. Revisar datos detallados [DEC-003].** Como usuario que necesita registros completos, quiero filtrar variables y períodos, ver unidades, calidad y procedencia y descargar mi selección sin solicitar una evaluación agronómica. Los datos originales y los normalizados se identifican por separado; un archivo derivado se etiqueta con su método. La descarga conserva los faltantes y sus metadatos. Un reporte PDF puede acompañarla, pero no reemplaza los datos tabulares o geoespaciales reutilizables.

El flujo normal comprende identificación, contexto, evidencia, consulta al agente y, cuando los insumos lo permitan, comparación y revisión. El acceso a datos detallados permanece disponible para consultar evidencia sin pasar por una recomendación. Los desvíos explícitos son geometría inválida, dato insuficiente, escena descartada, fallo de fuente, sesión vencida, falta de permiso y cancelación del usuario. Cada desvío ofrece una acción concreta: corregir, completar, cambiar período, reintentar, volver a iniciar sesión o solicitar acceso. **[SUP-012]**

### Diseño visual y accesibilidad

La dirección de borrador es verde y crema, con mapas y gráficos legibles. Se propone una interfaz móvil centrada en una pregunta por pantalla, con resumen textual antes del mapa y evidencia disponible sin ocultarla en un apartado técnico profundo. El glasmorfismo, si se utiliza, se limita a superficies decorativas que mantengan contraste. **[SUP-013]**

| Token propuesto | Valor inicial | Función |
| --- | --- | --- |
| Color primario | #1F4D2E | Acciones principales e identidad |
| Fondo | #F7F5EA | Superficie general |
| Texto | #18271D | Lectura principal |
| Superficie | #FFFFFF | Tarjetas y formularios |
| Advertencia | #8A5200 | Avisos acompañados de texto e icono |
| Error | #A12622 | Fallos y correcciones |
| Tipografía | Fuente del sistema sans serif | Disponibilidad y menor carga |
| Texto base | 16 px con interlineado 1,5 | Lectura móvil |
| Área táctil de diseño | 44 por 44 px | Objetivo propio de comodidad táctil |

Los tokens son **[SUP-013]**, no una identidad aprobada ni un logo. Los pares de color se comprobarán con contenido real. Se tomará [WCAG 2.2](https://www.w3.org/TR/WCAG22/) como referencia de accesibilidad; la norma establece, entre otros criterios, contraste mínimo de 4,5:1 para texto normal con sus excepciones. El objetivo táctil de 44 px es una elección del proyecto y no una cita del mínimo AA.

La navegación propuesta tiene cinco destinos: Parcelas, Evidencia, Datos, Comparar y Reportes; la parcela activa permanece visible. El agente integrado es accesible desde las pantallas de consulta y mantiene el contexto autorizado. Datos ofrece la vista detallada sin obligar a abandonar las explicaciones sencillas. En una pantalla pequeña, el mapa puede expandirse a petición. Los gráficos incluyen tabla o resumen equivalente, etiquetas de ejes y unidad. El teclado debe permitir completar las tareas y los mensajes de error deben asociarse al campo correspondiente. Los estados no se distinguen solo por color. **[SUP-013]**

El lenguaje muestra "lluvia estimada en la zona" cuando corresponde a una celda regional, "sin observación válida" cuando faltan píxeles y "comparación experimental" mientras no haya validación agronómica. Se evitan frases como "tu suelo está fértil" a partir de NDVI o "siembra mañana" a partir de un histórico. Las escalas y porcentajes se acompañan de qué significan y de qué no permiten concluir.

Para baja conectividad se priorizan resumen y tablas, se cargan mapas bajo demanda, se reducen imágenes y se conserva el estado del trabajo. El español es el idioma inicial propuesto; otros idiomas requieren investigación, traducción revisada y pruebas con hablantes. La consulta al agente integrado forma parte de la experiencia inicial; voz y Android son ampliaciones condicionadas a su necesidad y viabilidad. **[SUP-014, SUP-034]**

**Cierre de validación del área:** revisar prioridades con el equipo, probar tareas en teléfonos reales y conservar resultados de accesibilidad. Las pantallas deben corresponder a fuentes y métodos implementables; los estados vacíos y de error forman parte de la aceptación. **[SUP-012, SUP-014]**

## 05. Fundamento científico y datos

### Fuentes y variables

La selección científica separa misión, producto y servicio de acceso. NASA POWER es un servicio de datos; IMERG es un producto de precipitación; Sentinel-2 pertenece a Copernicus; SoilGrids es una fuente complementaria de ISRIC. Integrarlos no convierte todas las variables en mediciones NASA ni en mediciones de campo.

Se propone un catálogo por niveles: POWER para el primer recorrido; Sentinel-2 para vegetación; IMERG y SoilGrids como complementos; SMAP, MODIS, VIIRS y Landsat como opciones posteriores con preguntas específicas. Cada conector debe registrar el identificador realmente utilizado y verificar acceso con una descarga reproducible. **[SUP-016]**

| Fuente y candidato | Variable y uso previsto | Escala y límite de trabajo | Estado en esta edición |
| --- | --- | --- | --- |
| POWER Daily Point | T2M, T2M_MIN, T2M_MAX; series históricas | Contexto climático de grilla; no confirma helada en una planta | API documentada; conector TARPU no ejecutado |
| GPM IMERG V07 Final, candidato | Precipitación y acumulados históricos | Grilla 0,1 grados y base media horaria; corrida Final no es tiempo real | Selección de versión y colección por confirmar |
| Sentinel-2 L2A | Reflectancia, B04 y B08 para NDVI, clasificación de escena | Bandas a distintas resoluciones; nubes y píxeles mezclados | Producto candidato; probar colección y activos |
| SoilGrids250m 2.0 | pH, textura y carbono por profundidad | Predicciones a 250 m; no sustituye análisis de suelo | Descarga por archivos/servicios como ruta candidata |
| SMAP SPL3SMP_E, candidato | Humedad superficial regional | Producto con grilla de 9 km; grilla no equivale a detalle efectivo de 9 km | Versión vigente y calidad por seleccionar |
| Landsat 8/9 Collection 2 Level-2 | Reflectancia y vegetación | Calidad y correcciones propias; no mezclar directamente con otra misión | Alternativa posterior |
| MODIS / VIIRS | Series regionales de vegetación | Producto, composición temporal y QA por especificar | Sin selección de producto en esta versión |
| Catálogo agronómico | Familia, variedad, campaña y requerimientos | Evidencia local y revisión por especialista | Construcción manual versionada |

Las selecciones son **[SUP-016, SUP-038]**. Las características indicadas se apoyan en [NASA POWER](https://power.larc.nasa.gov/docs/services/api/temporal/daily/), [NASA IMERG V07](https://gpm.nasa.gov/resources/documents/imerg-v07-technical-documentation), [Copernicus Sentinel-2](https://documentation.dataspace.copernicus.eu/Data/SentinelMissions/Sentinel2.html), [SoilGrids](https://docs.isric.org/globaldata/soilgrids/SoilGrids_faqs.html) y el [catálogo de SMAP en NSIDC](https://nsidc.org/data/spl3smp_e/versions/3). La referencia de SMAP corresponde a una versión concreta consultada; no se la declara la versión vigente preferida.

El tutorial de [POWER sobre consultas API](https://power.larc.nasa.gov/docs/tutorials/service-data-request/api/) distingue resolución meteorológica de 0,5 por 0,625 grados y solar de 1 por 1 grado; la documentación diaria indica conservar la resolución de origen de cada parámetro. TARPU registrará la escala de la variable y el producto usados, en lugar de asignar una única resolución a todas las respuestas. La consulta por coordenadas no significa que el valor mida exactamente ese punto.

IMERG ofrece distintas corridas y latencias. Se propone Final para estudios históricos y se reservarán Early/Late para una necesidad posterior de menor latencia. No se mezclan corridas o versiones sin documentar la transición. El servicio que entregue el subconjunto y su unidad deben verificarse antes de sumar valores. Referencia: [descripción oficial de IMERG](https://gpm.nasa.gov/data/imerg). **[SUP-016]**

SoilGrids proporciona propiedades estimadas y mapas de incertidumbre por profundidad. La [documentación de capas](https://docs.isric.org/globaldata/soilgrids/SoilGrids_faqs_01.html) describe media, mediana y cuantiles 0,05 y 0,95. La [documentación de acceso](https://docs.isric.org/globaldata/soilgrids/SoilGrids_faqs_02.html) consultada indica pausa de su API REST y recomienda alternativas; por ello la propuesta evita depender de esa API para el MVP. Esto verifica una indicación documental, no un monitoreo en vivo de todos sus servicios.

El catálogo agronómico inicial tendrá papa, quinua, haba y cebada como fichas de trabajo, con nombre científico y familia revisados, variedades locales, duración de campaña, agua, clima, suelo, restricciones y bibliografía. No se rellenan rangos de tolerancia con cifras genéricas como si fueran válidas para cualquier variedad. EcoCrop se conserva como referencia histórica candidata; su distribución y adecuación local no se verificaron en esta edición. Se propone combinar fuentes identificables y revisión agronómica con campos explícitos de desconocido. **[SUP-002, SUP-038]**

Como respaldo agronómico inicial se incorpora el [Manual técnico: manejo integrado del cultivo de papa, INIA, 2020](https://repositorio.inia.gob.pe/handle/20.500.12955/1146). Su apartado de rotación aborda secuencias andinas y la necesidad de revisar antecedentes sanitarios. Sirve para fundamentar preguntas del catálogo; no valida automáticamente el ranking experimental ni su aplicación a cualquier parcela de Arequipa.

| Ficha inicial | Identificación de referencia | Función en el catálogo y revisión local propuesta |
| --- | --- | --- |
| CUL-001 Papa | Solanum tuberosum L.; cultivo de tubérculo | Registrar variedad, campaña y antecedentes; examinar por qué repetir o cambiar cultivo requiere contexto sanitario y de manejo |
| CUL-002 Quinua | Chenopodium quinoa Willd.; grano andino | Comparar candidato con variedad, período, destino y agua; no asumir que toda quinua tiene la misma tolerancia |
| CUL-003 Haba | Vicia faba L.; leguminosa | Examinar su papel en una secuencia y el manejo de residuos; no convertir presencia de leguminosa en dosis de fertilización calculada |
| CUL-004 Cebada | Hordeum vulgare L.; cereal | Distinguir destino de grano o forraje y su calendario; revisar compatibilidad con agua e historial |

La identificación se apoya también en la [guía de variedades del INIA](https://repositorio.inia.gob.pe/bitstreams/0d597e50-7526-41fe-92a5-d158d88bff55/download). La selección y uso dentro de TARPU son **[SUP-002, SUP-038]**. Cada ficha se completa con regla, variable, unidad, rango, condiciones de aplicación, fuente y revisor antes de habilitar un criterio cuantitativo. Si esos rangos no están respaldados para la variedad y zona, la ficha permite comparación cualitativa y declara el criterio no evaluable; no recibe valores inventados.

### Matriz de integración

Cada integración se considerará lista cuando un tercero pueda repetir la selección, recuperar el activo y obtener el mismo indicador con la misma versión de código. Documentar un endpoint no equivale a haber logrado ese resultado. **[SUP-016, SUP-036]**

| Variable visible | Origen y acceso propuesto | Formato y transformación | Persistencia y salida |
| --- | --- | --- | --- |
| Temperatura histórica | POWER Daily Point, HTTPS | JSON; fechas, unidades y códigos de faltante del proveedor | Observaciones por soporte espacial; API de clima y gráfico |
| Lluvia acumulada | IMERG, Earthdata/GES DISC según colección | HDF5 o NetCDF; extraer grilla, controlar tiempo y convertir tasa si aplica | Series, cobertura e indicador acumulado |
| Vegetación | Catálogo STAC de Copernicus y acceso autorizado a activos | Metadatos, bandas y QA; reflectancia, máscara, NDVI y estadística zonal | Activo original referenciado, COG y resumen por parcela |
| pH y textura | Descargas o servicios de ISRIC | Ráster; interpretar unidad, factor y profundidad del producto | Ficha edáfica y rango de incertidumbre disponible |
| Historial de campaña | Formulario del productor | JSON validado; fechas, cultivo y declaración de origen | Campañas versionadas y contexto de evaluación |
| Criterios de cultivo | Catálogo revisado | Tabla/JSON; unidad, fuente y versión de cada regla | Reglas, elegibilidad y motivos |

La ruta de vegetación utiliza el [catálogo STAC documentado por Copernicus](https://documentation.dataspace.copernicus.eu/APIs/STAC.html) para descubrir escenas y sus activos; la descarga y sus credenciales se verifican aparte. El catálogo no garantiza que todos los activos sean COG ni que la búsqueda calcule el NDVI.

La ficha de conector contendrá identificador, fuente, producto, versión, licencia/atribución, variable, unidad de origen y canónica, CRS, resolución, soporte temporal, calidad, autenticación, método de descarga, límites documentados, política de caché, última prueba, activo de muestra y contacto funcional. Se propone una prueba por conector con solicitud conservada sin credenciales, metadatos, checksum y resultado esperado. **[SUP-016, SUP-036]**

El almacenamiento distinguirá original, normalizado y derivado. Una actualización de reglas no reescribe datos originales. Una corrección del proveedor genera nueva versión de ingesta. La reutilización se basará en producto, versión, celda/escena, rango y variables; dos parcelas que comparten celda no requieren necesariamente dos descargas. **[SUP-024]**

### Indicadores y reglas agronómicas

El motor se organiza en cuatro pasos: comprobar evidencia, determinar elegibilidad, calcular criterios comparables y redactar una explicación estructurada. El primer prototipo compara el siguiente cultivo condicionado al historial; una secuencia de varias campañas se identifica como extensión experimental y exige evaluar cada transición y sus fechas. **[SUP-018]**

**Diccionario de indicadores propuesto [SUP-017, SUP-018]:**

| Indicador | Definición operativa | Tratamiento de insuficiencia |
| --- | --- | --- |
| Lluvia acumulada | Suma de láminas de lluvia válidas del período; si la fuente es tasa, integrar por duración | Publicar suma parcial y cobertura; no llamarla acumulado completo si faltan intervalos |
| Temperatura media | Promedio de temperaturas diarias válidas del período declarado | Mostrar cantidad esperada y válida; no rellenar con cero |
| Días bajo umbral | Contar días con mínima menor que un umbral versionado | Llamar indicador de frío regional; umbral agrícola exige evidencia local |
| Anomalía de lluvia | Acumulado del período menos promedio de períodos equivalentes de una referencia definida | No calcular sin referencia suficiente; separar productos y corridas |
| Anomalía estandarizada | Diferencia respecto de media dividida entre desviación de la referencia | No calcular si la desviación es cero o la muestra es insuficiente |
| NDVI por observación | (Reflectancia NIR - reflectancia roja) / (NIR + roja) en píxeles válidos | Excluir denominador próximo a cero y píxeles inválidos |
| Resumen de NDVI | Mediana y cuantiles de píxeles válidos con método espacial registrado | No presentar variación intraparcela cuando el soporte no la permite |
| Cambio entre observaciones | Diferencia entre resúmenes comparables y sus fechas | No atribuir causa ni proyectar futuro a partir de dos puntos |
| Cobertura temporal | Intervalos válidos / intervalos esperados | Denominador calculado para el calendario y zona temporal usados |
| Cobertura espacial | Área válida dentro de la parcela / área de la parcela | Píxeles parciales ponderados o método alternativo declarado |

Para precipitación expresada en mm/h y registros de media hora, la integración de un intervalo completo es tasa por 0,5 h. Un valor ya expresado en mm por período no se vuelve a multiplicar. Los intervalos faltantes no se asumen secos. La fórmula requiere comprobar la semántica del producto elegido. **[SUP-018]**

En vegetación se aplicará la corrección de reflectancia definida por el producto antes del índice. Para Sentinel-2 se revisarán bandas, offset, escala y clasificación; las máscaras categóricas se remuestrean con un método apropiado, como vecino más cercano. Landsat Collection 2 Level-2 utiliza factores y offset propios documentados por [USGS](https://www.usgs.gov/faqs/how-do-i-use-a-scale-factor-landsat-level-2-science-products); no se reutiliza una fórmula de lectura de otra misión sin verificarla. **[SUP-016]**

La elegibilidad distingue **apto para evaluar**, **requiere revisión**, **no elegible según una regla respaldada** y **no evaluable por falta de evidencia**. Un cultivo no se descarta solo porque el NDVI actual sea bajo. Una incompatibilidad excluyente exige regla identificada, contexto de aplicación y revisión agronómica; si no existe esa evidencia, se expresa como condición por revisar. **[SUP-018, SUP-020]**

Los criterios de puntuación propuestos son adecuación del agua, compatibilidad climática, compatibilidad edáfica y coherencia con el historial/rotación. La función de cada criterio debe devolver un valor entre 0 y 1 desde una regla publicada y sus unidades, o desconocido. Los rangos y funciones no están calibrados en esta edición; hasta su revisión, cualquier puntuación calculada con entradas sintéticas se etiqueta como demostrativa. **[SUP-018]**

**Ponderación inicial experimental [SUP-019]:** agua 0,30; clima 0,25; suelo 0,25; historial y rotación 0,20. La puntuación es `100 * suma(peso_j * criterio_j)` cuando todos los criterios requeridos son evaluables y sus pesos suman 1. Es un orden relativo dentro de una configuración, no una probabilidad de éxito, rendimiento, rentabilidad o seguridad.

Si falta un criterio de peso positivo, no se renormaliza silenciosamente para mejorar el resultado: el puntaje queda sin calcular y se muestra la comparación cualitativa disponible. Se puede definir un perfil reducido con otros criterios solo si se nombra, versiona y utiliza para todos los candidatos comparados; sus puntajes no se mezclan con los del perfil completo. El usuario no puede convertir una restricción excluyente en una simple preferencia. **[SUP-020]**

**Ejemplo sintético de método [SUP-019]:** un candidato ficticio con criterios 0,8 en agua, 0,6 en clima, 0,7 en suelo y 0,9 en historial obtiene `100 * (0,30*0,8 + 0,25*0,6 + 0,25*0,7 + 0,20*0,9) = 74,5`. El ejemplo no se atribuye a quinua, haba ni otra especie. Si no se dispone del criterio de suelo, el puntaje es `null`, no 74,5 ni un valor recalculado ocultamente.

La explicación final contiene candidato, elegibilidad, razones favorables, condiciones limitantes, evidencia utilizada, faltantes y siguiente revisión sugerida. Una variación pequeña de pesos que cambie el primer lugar debe mostrarse como orden sensible a prioridades. No se publican categorías "riesgo bajo" o "confianza alta" hasta definir y validar una escala separada. Se muestra calidad de evidencia de forma descriptiva. **[SUP-018, SUP-020]**

La estimación hídrica avanzada se reserva para una metodología específica. [FAO-56](https://www.fao.org/4/X0490E/x0490e0a.htm) relaciona evapotranspiración de cultivo y de referencia mediante `ETc = Kc * ETo` bajo sus condiciones de aplicación. Usarla exigiría coeficientes por etapa, entradas meteorológicas y un balance que considere suelo, lluvia y riego. Un dato de lluvia o humedad superficial aislado no basta para recomendar una dosis de riego. **[SUP-037]**

### Calidad, límites y trazabilidad

Cada valor tendrá una procedencia que permita responder qué representa, cuándo fue observado, cuándo se procesó, qué parte del territorio cubre y qué transformaciones sufrió. Se conservarán unidad, escala, producto, versión, cobertura y banderas. Fecha de adquisición, fecha de publicación, fecha de consulta y fecha de procesamiento son campos distintos. **[SUP-017]**

**Política provisional de mínimos [SUP-017]:** para un resumen temporal completo se exigirá al menos 90% de intervalos válidos y se informarán rachas de faltantes; para publicar una estadística de vegetación como representativa se exigirá al menos 80% de área válida y cinco píxeles equivalentes válidos. Son umbrales de diseño por probar, no garantías científicas. La forma, el borde y la mezcla de coberturas pueden hacer inadecuada una parcela aunque cumpla esos números. Si no cumple, puede mostrarse la observación como parcial con sus límites, pero no utilizarse como evidencia representativa sin revisión.

La representatividad se evalúa para cada fuente. Una parcela de dos hectáreas no adquiere detalle de humedad o precipitación a esa escala por dibujar un polígono preciso. Remuestrear un dato de 250 m a 10 m no crea nueva información. Los píxeles de una misma escena pueden tener dependencia espacial y no se cuentan como mediciones independientes de campo.

No se completa una climatología extensa con un solo año. Se propone una referencia de al menos diez años comparables para exploración de anomalías, con revisión de representatividad y sensibilidad; se denominará referencia de trabajo, no normal climática oficial. El período exacto debe elegirse según la serie disponible y su consistencia. **[SUP-017]**

Los controles automáticos revisarán esquema, unidades, calendario, duplicados, rangos físicos, códigos de relleno, geometría, CRS, calidad y consistencia de versión. Un valor sospechoso se marca y conserva para revisión, en lugar de corregirse sin registro. Las nubes se controlan sobre la parcela; el porcentaje de nubosidad total de la escena sirve solo para preseleccionar. **[SUP-017, SUP-036]**

El contrato de procedencia incluirá `source_id`, `product_id`, `product_version`, `asset_id`, `observed_start`, `observed_end`, `processed_at`, `unit`, `spatial_support`, `quality_flags`, `coverage`, `method_version` y `input_hash`. Las reglas y datos declarados tendrán su propia versión y origen. Un resultado conservará la geometría vigente al calcularse y se marcará como desactualizado si esta cambia. **[SUP-023]**

**Cierre de validación del área:** ciencia y datos deben seleccionar productos exactos, conservar muestras reales, verificar unidades y comparar indicadores con referencias independientes donde existan. Agronomía debe revisar reglas y casos antes de presentar alternativas como recomendaciones operativas. La disponibilidad documental comprobada no acredita conectores ejecutados. **[SUP-016, SUP-020, SUP-036]**

## 06. Ingeniería y desarrollo DEV

### Arquitectura y stack

Se propone un monolito modular para el backend, una aplicación web móvil y un proceso de ingesta/ejecución separado cuando la carga lo requiera. Esta organización permite compartir lógica y contratos durante el prototipo sin exigir una infraestructura distribuida extensa. El despliegue inicial puede ejecutar distintos procesos sobre la misma base de código; no implica que el procesamiento pesado ocurra dentro de una petición HTTP. **[SUP-015]**

| Capa | Elección de trabajo | Responsabilidad y alternativa |
| --- | --- | --- |
| Web | React y TypeScript | Flujos, accesibilidad y consumo de API; versión fijada al crear proyecto |
| Mapas | MapLibre | Geometrías y capas; proveedor de mapa base y condiciones por seleccionar |
| Gráficos | Plotly, condicionado al tamaño de carga | Series y exploración; evaluar librería menor si perjudica experiencia móvil |
| API | Python y FastAPI | Validación, permisos, contratos y coordinación |
| Datos | PostgreSQL con PostGIS | Relaciones, geometrías, soporte espacial, trabajos e indicadores |
| Archivos | Directorio local de desarrollo y objetos privados en despliegue | Rásteres, manifiestos y exportaciones; URL temporal para acceso autorizado |
| Procesamiento | pandas, xarray, rasterio y herramientas por formato | Lectura, normalización y cálculo; instalar solo lo requerido por cada conector |
| Trabajos | Registro durable en base y worker inicial | Colas dedicadas cuando concurrencia y reintentos lo justifiquen |
| Operación | Contenedores y automatización de comprobaciones | Entornos reproducibles y despliegue con migraciones |

Todas las elecciones de implementación son **[SUP-015]**. No se fijan versiones de librerías no probadas. Al iniciar el repositorio se generarán archivos de bloqueo, imagen base y matriz de compatibilidad para Python, Node, GDAL, PostgreSQL y PostGIS. Su actualización se revisará con las pruebas relevantes.

**Vista C4 de contexto propuesta:** agricultores y personas que requieren datos detallados usan TARPU directamente; organizaciones administran acceso; proveedores entregan observaciones o activos; revisores agronómicos mantienen reglas; operación mantiene el servicio. El agente integrado consulta únicamente información autorizada y ayuda a interpretarla. El flujo de datos privados pertenece a TARPU y los accesos a terceros se realizan desde el servidor salvo recursos públicos del mapa base. **[SUP-015, SUP-026, SUP-034]**

**Vista de contenedores propuesta:** navegador, API, worker, base de datos y almacenamiento de objetos. La API autentica, autoriza, consulta resultados y registra trabajos. El worker ejecuta conectores y motor. La base conserva estados y trazabilidad; los objetos contienen archivos pesados. Redis y una cola dedicada se incorporan por necesidad demostrada. **[SUP-015, SUP-024]**

```text
Agricultor / usuario de datos / organización
               |
               v
Web: parcela -> evidencia / datos -> agente / comparación -> exportación
               |
               v
API FastAPI: identidad, permisos, contratos y trabajos
          |                       |
          v                       v
PostgreSQL/PostGIS          Worker de procesamiento
          ^                  |              |
          |                  v              v
  resultados y versiones   conectores    motor de reglas
                             |
                             v
              proveedores y objetos geoespaciales
```

**Vista de componentes del backend:** `identity` resuelve identidad y permisos; `parcels` gestiona geometrías e historial; `sources` conoce productos y soportes; `ingestion` normaliza; `indicators` calcula; `evaluations` aplica reglas; `agent` consulta evidencia autorizada y explica; `exports` prepara registros y metadatos; `jobs` coordina; `reports` genera resúmenes legibles; y `audit` registra eventos. Los conectores no renderizan tarjetas y el frontend no contiene reglas agronómicas ocultas. La consulta de datos detallados no ejecuta una evaluación del motor. **[SUP-015, SUP-021, SUP-034]**

La elección se formalizará en ADR-001, arquitectura inicial; ADR-002, persistencia espacial; ADR-003, productos y escala; ADR-004, procesamiento y cola; y ADR-005, identidad y privacidad. Son registros por abrir, no decisiones históricamente aprobadas. Cada ADR incluirá problema, alternativas, decisión propuesta, evidencia, consecuencias y estado. **[SUP-029]**

### Backend y contratos API

La API propuesta se versiona bajo `/api/v1`. Los identificadores externos serán UUID y los códigos de error serán estables. Las fechas de calendario usarán ISO 8601 y las marcas de tiempo incluirán zona; los registros internos se conservarán en UTC, mostrando America/Lima cuando sea la preferencia de interfaz. Las series de un proveedor mantendrán además su estándar temporal de origen. **[SUP-021]**

La adopción de FastAPI se apoya en su soporte documentado para OpenAPI y esquemas de validación, descrito en [sus características oficiales](https://fastapi.tiangolo.com/features/). Ese soporte no sustituye las reglas del dominio ni la autorización por recurso, que deberán implementarse en TARPU.

| Método y ruta propuesta | Entrada y respuesta principal | Permiso y condición |
| --- | --- | --- |
| GET /api/v1/me | Identidad y organizaciones accesibles | Sesión válida |
| GET /api/v1/parcels | Lista con cursor y filtros permitidos | Solo parcelas autorizadas |
| POST /api/v1/parcels | Nombre, GeoJSON y contexto; responde 201 | Permiso de creación en organización |
| GET /api/v1/parcels/{id} | Ficha y versión de geometría | Lectura de parcela |
| PATCH /api/v1/parcels/{id} | Cambios y versión esperada | Edición; conflicto devuelve 409 |
| POST /api/v1/parcels/{id}/campaigns | Cultivo, fechas, riego y origen | Edición de historial |
| GET /api/v1/parcels/{id}/climate | Variables y rango; serie y procedencia | Lectura; nunca oculta faltantes |
| GET /api/v1/parcels/{id}/layers | Capas, fechas, calidad y acceso temporal | Lectura autorizada de activos |
| GET /api/v1/parcels/{id}/indicators | Indicadores y métodos aplicados | Lectura de parcela |
| POST /api/v1/parcels/{id}/analyses | Período y productos; 202 con trabajo | Edición/solicitud y cupo disponible |
| POST /api/v1/parcels/{id}/evaluations | Perfil, prioridades y versiones; 202 | Contexto válido o error semántico |
| GET /api/v1/jobs/{id} | Estado, etapas y código de fallo | Mismo permiso que recurso de origen |
| GET /api/v1/evaluations/{id} | Resultado inmutable y explicación | Lectura de parcela asociada |
| POST /api/v1/evaluations/{id}/reports | Formato y alcance; 202 | Permiso para exportar evaluación |
| GET /api/v1/parcels/{id}/observations | Variable, período y cursor; registros con unidad, calidad y procedencia | Lectura; sin aplicar reglas agronómicas |
| POST /api/v1/parcels/{id}/exports | Selección, nivel original/normalizado y formato; 202 | Lectura y exportación autorizadas; límites de tamaño |
| POST /api/v1/parcels/{id}/agent/messages | Pregunta y referencias de contexto; respuesta y evidencia | Lectura de parcela; contexto limitado a recursos autorizados |

Los contratos son **[SUP-021]** y no endpoints desplegados. La lista no implica un proveedor de identidad ni una implementación existente. Los recursos de trabajo y archivo nunca se vuelven públicos por conocer su identificador.

La respuesta de serie contiene variable, unidad, soporte espacial, estándar temporal, rango solicitado, puntos, faltantes, cobertura y procedencia. El punto individual representa `value: null` si no hay dato válido y conserva el motivo. El recurso de observaciones presenta registros sin evaluación agronómica y señala si son originales o normalizados. La exportación incluye filtros, unidades, campos de calidad, método de extracción y manifiesto de procedencia. Se proponen CSV y JSON para tablas, GeoJSON para geometrías y archivos nativos o GeoTIFF/COG cuando proceda por producto, acceso y tamaño. Un PDF es la salida legible de una selección o evaluación, no un reemplazo del archivo reutilizable. Una respuesta de evaluación contiene versiones de parcela, historial, indicadores, catálogo y reglas, más elegibilidad, criterios, puntaje opcional y explicación por candidato. El anexo E ofrece ejemplos válidos de JSON íntegramente sintéticos. **[SUP-021]**

Los errores siguen una estructura `error.code`, `error.message`, `error.details` y `request_id`. Se propone 400 para sintaxis de consulta, 401 para falta de sesión, 403 para operación prohibida cuando no revele recursos ajenos, 404 para recurso no visible, 409 para conflicto o estado incompatible, 422 para contenido semánticamente inválido, 429 para cupo/límite y 503 para indisponibilidad temporal. Un fallo de proveedor dentro de un trabajo se registra en ese trabajo y no se convierte en un éxito sin datos. **[SUP-021]**

La paginación usa cursor con máximo inicial de 100 elementos y orden estable. El rango climático máximo inicial será de diez años por solicitud, con descargas históricas más amplias mediante trabajo. Los límites son de operación propuesta y deberán ajustarse al proveedor, al costo y al caso de uso. **[SUP-021, SUP-025]**

Las creaciones costosas admiten clave de idempotencia por usuario y operación. Si se repite la misma clave con otro cuerpo se devuelve conflicto; si coincide se recupera el trabajo previo. La clave de reutilización científica se calcula aparte desde geometría/versiones, producto, período y método. Así se evita confundir un reintento de red con un análisis nuevo. **[SUP-021, SUP-024]**

### Pipelines geoespaciales

El pipeline propuesto separa descubrimiento, descarga, validación, normalización, cálculo y publicación. Cada etapa escribe un manifiesto con entradas, checksum, versión de código, duración, unidades y salida. Solo una ejecución completa o un resultado parcial descrito explícitamente puede publicarse. **[SUP-024]**

1. Validar permisos, geometría, período, productos y presupuesto de solicitud.
2. Resolver qué soportes espaciales o escenas intersectan la parcela y qué datos ya existen.
3. Descubrir activos y conservar sus identificadores y metadatos.
4. Descargar con autenticación del servidor y límites de tamaño y tiempo.
5. Verificar integridad, dimensiones, fechas, unidad, CRS y calidad.
6. Aplicar factores de escala, offset y códigos de relleno antes de cálculos.
7. Reproyectar o recortar solo cuando sea necesario, conservando la escala de origen.
8. Aplicar máscaras y calcular cobertura y estadística con un método declarado.
9. Guardar observaciones o activos normalizados, indicadores y su procedencia.
10. Publicar el resultado de forma atómica y actualizar estado del trabajo.

La geometría de intercambio se propone en WGS84, SRID 4326, con coordenadas GeoJSON en orden longitud y latitud. Para áreas se usará cálculo geodésico o una proyección métrica apropiada al territorio; no se interpreta `ST_Area` de una geometría en grados como metros cuadrados. [PostGIS documenta](https://postgis.net/docs/ST_Area.html) la diferencia entre geometría y geografía. La elección concreta para TARPU es **[SUP-022]**.

Las estadísticas zonales deben registrar si usan intersección ponderada, centros de píxel u otro método y qué ocurre con bordes. El remuestreo categórico debe conservar clases; el continuo debe justificarse según la variable. No se suaviza una capa para sugerir una precisión inexistente. El pipeline conserva la referencia espacial original y la usada en cada derivado. **[SUP-022]**

**Estados del trabajo [SUP-024]:** `queued`, `running`, `succeeded`, `partial`, `failed` y `cancelled`. Se propone progreso por etapas verificadas, sin porcentajes ficticios de descarga desconocida. Un worker registra heartbeat y un vencimiento de su toma; si se reinicia, otro proceso puede recuperar trabajo sin publicar duplicados. La publicación se protege con una clave única del resultado y transacciones.

En el primer recorrido se puede ejecutar la ingesta mediante un comando controlado y consultar resultados persistidos. Cuando el usuario solicite procesamiento largo, se propone un registro durable de trabajos y un worker único; el reclamo de tareas debe ser transaccional. Una cola dedicada con Redis y RQ/Celery se evaluará al necesitar varios workers o reintentos más complejos. Esta alternativa requiere su propio ADR y prueba, sin introducirla por aparecer en el diagrama histórico. **[SUP-024]**

**Política provisional [SUP-024]:** hasta tres reintentos ante fallos transitorios con espera creciente y variación aleatoria; respetar instrucciones del proveedor; no reintentar indefinidamente credenciales inválidas o archivos corruptos. Se propone un límite inicial de 15 minutos por trabajo y 250 MB por solicitud de procesamiento, ajustable por producto. El original válido puede reutilizarse, pero un derivado fallido nunca se marca como correcto.

La caché de consulta y la conservación científica cumplen funciones distintas. Se propone actualizar datos recientes diariamente cuando el producto lo permita; revisar retrospectivamente los últimos siete días de POWER y un período mayor si su política de revisión lo requiere; buscar escenas nuevas sin redescargar las ya verificadas; y fijar SoilGrids por versión. Son reglas de exploración que deben ajustarse a la latencia y revisiones documentadas del producto. **[SUP-024]**

### Modelo de datos

El diseño distingue dato externo, soporte espacial y asociación a parcela. Una observación regional puede servir a varias parcelas, por lo que no debe duplicarse como si fueran mediciones independientes. Las asociaciones conservarán método de extracción y geometría de la parcela utilizada. **[SUP-023]**

| Entidad propuesta | Campos centrales | Relaciones y restricciones |
| --- | --- | --- |
| users | id UUID, identity_subject, display_name, created_at | Identidad externa única; no guardar contraseñas si se usa proveedor |
| organizations | id, name, status | Espacio de administración; no acredita entidad legal |
| memberships | user_id, organization_id, role, status | Par único; roles y revocación auditados |
| parcels | id, organization_id, name, current_version, created_by | No borrar historial al modificar geometría |
| parcel_versions | parcel_id, version, geom, area_m2, valid_from, declared_origin | Geometría válida, no vacía y SRID definido |
| crops | id, scientific_name, common_name, botanical_family, catalog_version | Especie y variedad diferenciadas |
| campaigns | id, parcel_id, crop_id, dates, irrigation, source, revision | Fecha final posterior a inicial; solapamiento requiere tipo de manejo |
| data_products | id, provider, product_code, version, license_uri, metadata | Producto y versión identificables |
| spatial_supports | id, product_id, geometry, grid_key, resolution_metadata | Celda o huella compartida; clave única por producto |
| assets | id, product_id, uri, checksum, observed_range, qa_metadata | URI privada; integridad y estado registrados |
| observations | id, support_id, variable, interval, value, unit, quality, source_asset | Clave por soporte, variable, intervalo y revisión |
| parcel_observation_links | parcel_version_id, observation_id, extraction_method | Mantener relación y evitar duplicado semántico |
| indicators | id, parcel_version_id, name, period, value, coverage, method_version | Valor nulo permitido con motivo; linaje separado |
| rule_sets | id, version, status, source_refs, reviewed_by, reviewed_at | Estado experimental/revisado/retirado, sin editar versión publicada |
| evaluations | id, parcel_version_id, snapshot, weights, rule_set_id, input_hash | Entradas congeladas y resultado reproducible |
| evaluation_candidates | evaluation_id, crop_id, eligibility, criteria, score, reasons | Score opcional; motivos y evidencia por criterio |
| jobs | id, resource_id, state, attempts, heartbeat, error_code, input_hash | Transiciones válidas y acceso heredado del recurso |
| audit_events | actor, action, resource, timestamp, request_id | Excluir secretos y limitar datos personales |

El esquema completo es **[SUP-023]**. Los campos flexibles de metadatos pueden usar JSONB, pero las claves de relación, fechas, permisos y unidades canónicas deben poder validarse. Se propone un linaje normalizado de indicadores a observaciones/activos para evitar depender únicamente de un texto explicativo.

Relaciones principales: una organización tiene miembros y parcelas; una parcela tiene versiones y campañas; un producto tiene soportes y activos; un soporte tiene observaciones; una versión de parcela se asocia a observaciones e indicadores; una evaluación fija esos indicadores y un conjunto de reglas; y cada evaluación tiene candidatos. Un cultivo no representa automáticamente una variedad ni una campaña específica.

Se propone índice espacial GiST sobre geometrías, índices compuestos sobre observaciones por soporte/variable/tiempo y claves únicas de producto y revisión. Las fechas usan tipos temporales adecuados, las magnitudes almacenan unidad y los puntajes admiten `null`. No se admite `-999` como reemplazo universal de desconocido dentro del dominio; los códigos del proveedor se conservan en original y se normalizan explícitamente. **[SUP-023]**

Los cambios de geometría crean versión nueva. Las evaluaciones anteriores siguen referidas a la anterior; la interfaz puede mostrar que existe una geometría más reciente. Las correcciones de historial generan revisión y no alteran silenciosamente resultados publicados. Una eliminación de datos personales exige revisar dependencias y políticas; no se promete borrar todos los respaldos de forma inmediata. **[SUP-023, SUP-028, SUP-039]**

Las migraciones incluirán creación de extensiones, tablas, restricciones, índices y carga de catálogos con procedencia. Se ensayará actualización sobre una copia de prueba y restauración antes de producción. No se aplicarán cambios manuales de esquema sin una migración registrada. **[SUP-029]**

### Frontend, mapas y visualización

La arquitectura web propuesta separa rutas, componentes visuales y servicios de API. Las reglas de cálculo pertenecen al backend; la web formatea unidades y representa el resultado. El estado de parcela activa, filtros y trabajo en curso se conserva en la URL o un estado persistente controlado; los datos privados no se guardan sin criterio en almacenamiento local. **[SUP-015, SUP-026]**

| Ruta de interfaz propuesta | Contenido | Estados que debe cubrir |
| --- | --- | --- |
| /parcelas | Lista y creación | Vacío inicial, carga, error y sin permiso |
| /parcelas/:id | Ficha, mapa y contexto | Geometría nueva, contexto incompleto y versión anterior |
| /parcelas/:id/evidencia | Clima, vegetación y suelo disponibles | Sin cobertura, dato parcial, fecha antigua y fuente fallida |
| /parcelas/:id/datos | Registros, filtros, unidades, calidad, procedencia y exportación | Original/normalizado identificado, selección vacía y descarga limitada por tamaño |
| /parcelas/:id/comparar | Perfil, prioridades y candidatos | Listo, procesando, no evaluable y resultado experimental |
| /evaluaciones/:id | Resultado conservado | Versión vigente o desactualizada y evidencia accesible |
| /reportes | Exportaciones autorizadas | En proceso, disponible, vencida y fallida |

Las rutas y componentes son **[SUP-013, SUP-021]**. Componentes centrales: `ParcelSelector`, `EvidenceCard`, `QualityNotice`, `ClimateSeries`, `LayerLegend`, `CandidateComparison`, `WeightEditor`, `JobStatus`, `ProvenancePanel`, `DataTable`, `ExportSelector` y `AgentPanel`. Los nombres son de diseño, no archivos existentes.

Los polígonos se intercambian como GeoJSON. Los rásteres se publican mediante teselas o un servicio compatible evaluado para MapLibre; un COG no se considera automáticamente una URL que el mapa pueda dibujar sin integración. La API devuelve acceso autorizado y leyenda junto con fechas y rangos; los colores no sustituyen el índice numérico. **[SUP-015]**

Los gráficos muestran discontinuidades donde falta dato. La precipitación acumulada parcial no se compara como completa con otra ventana. Los ejes explicitan unidades y zona temporal. Las exportaciones deben reproducir valores y advertencias de la evaluación guardada, sin recalcular con reglas nuevas en el momento de descargar. **[SUP-012, SUP-021]**

El agente integrado recibe la pregunta y el contexto autorizado de la parcela: observaciones, indicadores y evaluaciones existentes cuando las haya. Puede explicar variables y calidad incluso si todavía no existe una recomendación; para explicar un candidato utiliza sus motivos y reglas guardados. Debe distinguir observación, estimación e interpretación, mostrar qué evidencia respalda la respuesta y reconocer los faltantes. Si una pregunta requiere pronóstico, precio o diagnóstico no disponible, comunica la limitación. No sobrescribe el motor ni presenta una conclusión sin respaldo como dato de la parcela. Esta función está confirmada por el usuario.

Se propone comenzar con texto; modelo, proveedor, límites de contexto y costo requieren prueba. Voz y Android son ampliaciones condicionadas a necesidad y viabilidad. **[SUP-034]**

### Acceso a datos detallados y exportación

La sección Datos permite consultar información sin pasar por una evaluación del motor agronómico. Distingue **originales del proveedor**, conservados sin alteración cuando estén disponibles y su acceso sea permitido; **registros normalizados**, con conversiones de unidad, fecha o estructura identificadas; y **derivados**, como índices, agregaciones o recortes, que se muestran separados y con su método. Normalizar, recortar o aplicar controles técnicos no convierte una estimación satelital en medición de campo. Ningún nivel se etiqueta como original si fue transformado. **[SUP-021, SUP-023]**

La tabla de consulta ofrece filtros de fuente, variable, período, unidad, calidad y nivel de procesamiento. El usuario puede ver metadatos, cantidad de registros, cobertura y faltantes antes de descargar. Se propone una exportación tabular básica para el recorrido demostrable; archivos geoespaciales pesados requieren verificar disponibilidad, licencia, tamaño y costo. Los formatos son decisiones propuestas y no garantías de que cada proveedor ofrezca todos ellos. **[SUP-021]**

Cada exportación conserva selección, fecha de extracción, producto y versión, geometría utilizada, unidades, estándar temporal y controles o transformaciones realizados. Los permisos son los mismos de la consulta de parcela. No se crea una recomendación para habilitar la descarga; los resultados del motor se exportan solo si el usuario los selecciona expresamente como otro tipo de contenido. Un reporte PDF resume y documenta la selección, mientras el archivo estructurado conserva los registros necesarios para reutilizarla. **[SUP-021, SUP-023, SUP-026]**

### Seguridad, calidad y despliegue

Se propone identidad mediante un proveedor compatible con estándares y sesión web controlada por servidor, con cookies HttpOnly y Secure; las decisiones de SameSite, CSRF y dominios se probarán para el despliegue concreto. No se guardan credenciales de proveedores geoespaciales en el navegador ni en el repositorio. La elección de proveedor de identidad sigue abierta. **[SUP-026]**

Los roles de trabajo serán propietario del espacio, editor y lector. Un usuario adicional puede ser editor solo en parcelas o espacios autorizados. La consulta de cualquier evaluación, trabajo, reporte o activo verifica la autorización sobre la parcela de origen. Los permisos se prueban también al cambiar un identificador y al revocar membresía. Una política de filas en base puede añadirse como defensa adicional; no reemplaza la comprobación de dominio. **[SUP-026]**

Las entradas se validarán con límites de tamaño, geometría, período y número de vértices. Se restringirán los orígenes CORS y destinos de descarga; el worker no aceptará URLs arbitrarias aportadas por usuarios para acceder a redes internas. Se registrarán eventos con identificador de solicitud, sin tokens, contraseñas o coordenadas innecesarias en logs. Los activos privados usarán enlaces temporales y permisos coherentes con la API. **[SUP-026]**

**Estrategia de pruebas propuesta [SUP-036]:** cálculos con entradas pequeñas verificables; conectores con muestras reales y respuestas de error; contratos API; autorización por recurso; cambios de versión; reinicio de worker; y recorrido desde parcela hasta reporte. Se probará que ausencia de información bloquea o limita la evaluación, que un reintento no duplica costos y que un resultado conserva su procedencia.

No se fija una cobertura porcentual como sustituto de calidad. Casos críticos: año bisiesto, dato faltante, tasa frente a acumulado, offset espectral, escena nublada sobre parcela, geometría inválida, cambio de versión, prioridad inválida y acceso de otra organización. Las pruebas del motor deben incluir contraejemplos y casos revisados por especialistas, no solo reproducir el código.

El despliegue piloto propuesto incluye web, API, base y almacenamiento privado, con worker si hay análisis a demanda. El proveedor se elegirá según compatibilidad geoespacial, costo medido, respaldo, acceso del equipo y condiciones de datos; no se asume una cuenta de nube existente. Desarrollo, pruebas y producción mantendrán credenciales separadas. **[SUP-027]**

La automatización de entrega verificará formato, tipos, pruebas relevantes, migraciones, construcción de contenedores y exposición de secretos. El despliegue ejecutará migraciones controladas, comprobación de salud y una consulta de humo. La reversión de aplicación debe considerar si una migración sigue siendo compatible; restaurar base requiere una decisión de recuperación, no una acción automática sin evaluar pérdida. **[SUP-027, SUP-029]**

**Respaldo y retención propuestos [SUP-028]:** copia diaria de base cifrada y retención de 30 días; versionado de objetos críticos cuando el proveedor lo permita; objetivo RPO de 24 horas y RTO de ocho horas para el piloto; ensayo mensual de restauración. RPO representa pérdida máxima objetivo de datos y RTO tiempo objetivo de recuperación. Su cumplimiento debe medirse antes de prometerlo.

Se propone retener originales seleccionados y manifiestos mientras se usen para reproducir resultados; derivados regenerables pueden eliminarse después de 90 días sin uso si se conserva linaje. Audios de investigación se conservarán hasta 90 días después de su transcripción revisada, salvo consentimiento y necesidad distintos. Estas reglas requieren conciliación con permisos, licencias, privacidad y costo; no constituyen una política legal final. **[SUP-028, SUP-039]**

El monitoreo medirá fallos por conector, edad del último dato, cobertura válida, tiempo en cola, duración de análisis, costo por resultado, consultas denegadas y uso de almacenamiento. Una alarma por fallo debe identificar responsable funcional y acción de diagnóstico. El sistema distinguirá falta de dato del proveedor de un error propio de procesamiento. **[SUP-025, SUP-027]**

### Repositorio y contribución

Se propone un repositorio único con aplicaciones, pipelines, reglas, muestras autorizadas, infraestructura y documentación técnica. El anexo B contiene el árbol de destino. Ese árbol no describe software ya creado. **[SUP-029]**

El README deberá explicar requisitos, preparación de entorno, variables sin valores secretos, migraciones, carga de catálogo, ejecución de una ingesta mínima y cómo abrir la web. Los comandos definitivos se escribirán cuando existan los servicios y se hayan probado en un entorno limpio. No se presentan comandos ficticios como instalación operativa.

La contribución usará ramas breves por cambio y solicitud de revisión. Cada cambio de datos o reglas declarará qué entradas y resultados afecta. Un cambio agronómico requiere revisión de ciencia/agronomía además de revisión de código; un cambio de permisos requiere casos de autorización. Los commits no incluirán credenciales, datos de productores sin autorización ni grandes rásteres descargables sin una estrategia explícita. **[SUP-029]**

Se propone que cada PR incluya problema, comportamiento esperado, evidencia de comprobación, impacto documental y necesidad de migración. Las etiquetas de versión distinguirán prototipo, piloto y producto; un número de versión no acredita validación. El registro de decisiones conserva quién aprobó y qué evidencia se usó. **[SUP-029, SUP-040]**

**Cierre de validación del área:** ingeniería debe probar un entorno desde cero, ejecutar un recorrido real, registrar versiones y comprobar restauración y autorización antes de manejar datos privados de piloto. Las especificaciones anteriores son diseños propuestos, no una auditoría de código existente. **[SUP-015, SUP-021, SUP-029]**

## 07. Validación e impacto

### Hipótesis y pruebas

La validación comprobará por separado necesidad, comprensión, funcionamiento, adecuación agronómica y viabilidad comercial. Una demostración que se ejecuta correctamente no demuestra que los usuarios la necesiten; una opinión favorable no demuestra que la recomendación sea correcta. **[SUP-030]**

| Hipótesis de trabajo | Método propuesto | Criterio inicial para revisar |
| --- | --- | --- |
| H-01 Existe una dificultad recurrente de integrar información | Entrevistas y reconstrucción de decisiones | Casos independientes con ejemplos y consecuencias observables |
| H-02 La evidencia se entiende | Tareas con diez participantes | Al menos ocho identifican fuente, período y limitación sin ayuda |
| H-03 La comparación es explicable | Reexplicación del resultado y contraste de candidatos | Al menos ocho de diez expresan el motivo principal sin interpretar el puntaje como certeza |
| H-04 El motor respeta restricciones | Casos revisados por especialistas | Ninguna violación crítica no resuelta en el conjunto de aceptación |
| H-05 El servicio cabe en el costo | Instrumentación y carga piloto | Contribución positiva en un escenario medido, incluyendo soporte |
| H-06 Existe intención de continuidad | Uso posterior y pruebas de compra | Solicitud concreta de continuidad o prueba contratada; opiniones separadas de pagos |

La tabla es **[SUP-030]**. Los tamaños y metas son criterios de trabajo para decidir iteraciones, no evidencia de significación estadística ni promesa de adopción.

El protocolo de usabilidad propone diez participantes agricultores, incluyendo tres que deseen explorar la vista de datos detallados. Se buscará diversidad de familiaridad digital; el perfil técnico no sustituye la comprobación con quienes necesitan explicaciones sencillas. Se realizará una sesión por persona con tareas neutrales, sin enseñar dónde hacer clic. Se usarán teléfonos disponibles en la muestra y se registrarán conexión, asistencia, tiempo, error, abandono y comprensión. La muestra puede incorporar personas del descubrimiento, dejando constancia del aprendizaje previo. **[SUP-030]**

Las tareas serán localizar una parcela, corregir contexto, identificar un período, reconocer una capa parcial, preguntar al agente por una variable o alternativa, revisar el respaldo de su respuesta, abrir los datos detallados, exportar una selección y recuperar una consulta. Se medirá éxito autónomo, éxito asistido y fallo por separado. La evaluación de comprensión preguntará qué no puede concluirse de los datos y comprobará que el usuario distinga registros originales, transformaciones y resultados del motor. Las grabaciones son opcionales y sujetas a consentimiento; se puede participar sin aceptar una grabación. **[SUP-006, SUP-030, SUP-039]**

La evidencia de cada sesión incluirá código de participante, perfil relevante, dispositivo, tarea, observación, explicación dada, ayuda y hallazgo. No se publicarán nombres o polígonos personales en la síntesis. Los hallazgos se priorizarán por bloqueo de tarea, riesgo de interpretación y frecuencia observada, conservando el denominador.

### Validación técnica y agronómica

**Plan técnico propuesto [SUP-036]:** conservar un conjunto de muestras con metadatos y licencias, más casos sintéticos de borde. Cada cálculo tendrá una salida comprobable y tolerancia numérica justificada. Se comparará el resultado extraído con el original y, cuando exista una referencia independiente adecuada, se medirá el error respecto de ella.

| Nivel | Comprobación | Resultado exigido antes de publicar |
| --- | --- | --- |
| Conector | Variables, unidades, fechas, faltantes y autenticación | Respuesta interpretada correctamente y fallo reconocible |
| Geometría | SRID, área, intersección y versión | Ubicación correcta y cálculo de superficie coherente |
| Indicador | Fórmula, intervalos y control de calidad | Resultado reproducible dentro de tolerancia definida |
| Motor | Restricciones, criterios, pesos y explicación | Ninguna exclusión crítica ignorada; datos ausentes visibles |
| API | Contrato, permisos, límites e idempotencia | Recursos privados protegidos y reintentos sin duplicados |
| Operación | Reinicio, recuperación y restauración | Estados consistentes y evidencia de recuperación |

Se propone una evaluación agronómica de 20 casos documentados: doce con información suficiente, cuatro con faltantes y cuatro con incompatibilidades o situaciones límite. Dos revisores agronómicos evaluarían de forma independiente si los motivos y restricciones son razonables para el contexto descrito; no se presupone que esos revisores ya estén comprometidos. Se registrará desacuerdo y resolución, sin exigir que expertos diferentes produzcan un ranking idéntico. **[SUP-036]**

La revisión distinguirá errores críticos, relevantes y de presentación. Un error crítico incluye recomendar una opción excluida por una restricción respaldada, usar unidades incorrectas o presentar evidencia insuficiente como completa. Un fallo crítico impide publicar esa función hasta corregir y volver a comprobar los casos afectados. El conjunto se ampliará con contraejemplos surgidos en campo. **[SUP-036]**

Si se compara una estimación con estaciones o mediciones, se registrarán ubicación, período, instrumento, calidad y diferencia de soporte espacial. Se podrán calcular MAE, sesgo y RMSE sobre pares comparables, mostrando número de pares y faltantes. Las mediciones puntuales no se tratarán como verdad completa de una celda extensa, y una correlación alta no equivale a ausencia de sesgo.

La calidad de recomendación se examinará por adecuación de restricciones, claridad de motivos, estabilidad ante cambios y utilidad para la tarea. La concordancia con un experto es una señal de revisión, no prueba de aumento de rendimiento. Tampoco se usarán como validación etiquetas generadas por las mismas reglas que se están evaluando. **[SUP-036]**

### Impacto y aprendizaje

El primer impacto evaluable es informativo: comprensión, tiempo para encontrar información, capacidad de reconocer faltantes y decisión documentada. Cambios productivos, ahorro de agua y reducción de pérdidas necesitan seguimiento de campaña y una comparación apropiada. El sistema no los inferirá a partir del número de consultas. **[SUP-031]**

**Piloto propuesto [SUP-031]:** acompañar diez parcelas con productores que acepten registrar contexto y consultas a lo largo de una campaña agrícola. Se contrastarán la comprensión directa, las preguntas al agente y el acceso a datos detallados. La evaluación de efectos productivos depende del ciclo real del cultivo y de contar con una línea base y seguimiento suficientes; no se declara obtenida a partir de la demostración. Se propone una línea base antes del uso, revisión de la primera consulta, registros de decisiones y revisión al cierre de la campaña.

| Indicador | Definición propuesta | Fuente y límite |
| --- | --- | --- |
| Comprensión | Participantes que reconocen motivo y limitación / participantes evaluados | Tarea observada; muestra acotada |
| Tiempo de búsqueda | Tiempo de una tarea comparable con práctica actual y con TARPU | Misma pregunta y orden de prueba controlado cuando sea posible |
| Activación | Usuarios que completan consulta con evidencia / incorporados | Evento de producto, no beneficio agrícola |
| Uso recurrente | Usuarios con consulta útil en más de una revisión / activados | Interpretar según estacionalidad de campaña |
| Decisión apoyada | Decisiones donde el usuario identifica qué dato revisó y cómo influyó | Declaración registrada; no prueba causal por sí sola |
| Agua aplicada | Volumen medido o estimado con método explícito por superficie y período | No sustituir volumen por número de riegos |
| Rendimiento | Producción cosechada / superficie cosechada, con unidad y fuente | Requiere campaña concluida y comparabilidad |
| Costo de atención | Costos observados / parcelas activas o análisis nuevos | Incluir soporte y visitas |

No se fijan porcentajes de ahorro o mejora sin línea base. Si el piloto es observacional, se informarán asociaciones y posibles factores de confusión: variedad, clima, manejo, acceso al agua y precios. Un estudio posterior podría utilizar comparación concurrente o asignación apropiada, con diseño acordado por especialistas y participantes. **[SUP-031]**

El ciclo de aprendizaje registra hipótesis, evidencia, interpretación, decisión y siguiente prueba. Se mantendrán también resultados negativos. Si el dato no representa adecuadamente parcelas pequeñas, se comunicará su alcance regional o se buscará una fuente más apropiada; si el agricultor no entiende los puntajes, se revisarán lenguaje, comparación y respuestas del agente. La vista de datos detallados aporta una opción de profundización, sin sustituir la experiencia comprensible. **[SUP-030, SUP-031]**

**Cierre de validación del área:** aprobar protocolo antes de recolectar resultados, conservar consentimiento, publicar métricas con sus denominadores y mantener separados resultados de usabilidad, ciencia e impacto productivo. No se registran participantes o resultados reales en esta edición. **[SUP-030, SUP-031, SUP-036]**

## 08. Estrategia, roadmap y hackathon

### Roadmap

El roadmap presenta una secuencia de trabajo por dependencias y evidencia de salida. La demostración prioriza un recorrido integrado y verificable; las integraciones complementarias, la investigación de campo y la expansión conservan sus condiciones de validación. El orden permite distinguir lo necesario para demostrar el funcionamiento de lo que requiere evidencia adicional. **[SUP-012, SUP-032]**

| Orden recomendado | Trabajo | Entregable | Condición de salida |
| --- | --- | --- | --- |
| 1. Delimitar la demostración | Precisar pregunta del agricultor, ubicaciones de prueba en Arequipa, variables y fuente accesible | Alcance del recorrido y ficha de datos | Pregunta concreta y consulta reproducible |
| 2. Conectar parcela y evidencia | Construir el recorrido de datos, persistencia, API y gráfico | MVP-A con fuente, unidad, período y faltantes | Consulta real y fallos reconocibles |
| 3. Abrir registros y exportación | Presentar los datos de la consulta y sus metadatos sin evaluación agronómica | Tabla filtrable y descarga básica | Originales y transformaciones identificados |
| 4. Integrar el agente | Conectar preguntas con la evidencia autorizada y sus límites | Respuestas explicables con referencias | Reconoce datos ausentes y no inventa observaciones |
| 5. Añadir evidencia y comparación | Incorporar capa válida, catálogo acotado y reglas explícitas | MVP-B con motivos y estado experimental visible | Cobertura comprobada y abstención ante faltantes |
| 6. Comprobar y presentar | Revisar recorrido, comprensión, permisos y contenido de la demo | Versión demostrable y manifiesto de evidencia | Fallos críticos resueltos; capacidades reales y futuras distinguidas |
| 7. Contrastar en campo | Investigar necesidades, revisar reglas y seguir parcelas | Evidencia de uso, calidad y costo | Resultados y limitaciones documentados |
| 8. Consolidar y ampliar | Ajustar operación, oferta y pertinencia territorial | Producto y cobertura ampliados según evidencia | Validación local y capacidad de soporte |

La ruta crítica de la demostración es dato real, semántica correcta, presentación comprensible, consulta al agente y acceso a la evidencia. Se prioriza una consulta integrada sobre una lista extensa de conectores. Las descargas pesadas, voz, Android y modelos predictivos se incorporan cuando se justifiquen y puedan comprobarse. Un componente no disponible se identifica como tal, sin fingir una integración ejecutada. **[SUP-012, SUP-021, SUP-034]**

### Gestión y riesgos

Se proponen roles funcionales, sin asignar nombres: producto/UX, ciencia y datos, agronomía, ingeniería, negocio/investigación y operación. Una persona puede cubrir más de un rol si tiene capacidad, pero cada entregable tendrá un único responsable de cierre. La aprobación científica no se infiere de una aprobación visual o de código. **[SUP-032]**

| Entregable | Responsable propuesto | Revisor necesario |
| --- | --- | --- |
| Alcance y requisitos | Producto | Ingeniería, ciencia y agronomía |
| Productos y conectores | Ciencia y datos | Ingeniería |
| Reglas y catálogo | Agronomía | Ciencia y producto |
| API, base y permisos | Ingeniería | Operación y producto |
| Investigación y compra | Negocio/investigación | Producto |
| Privacidad y consentimiento | Responsable de datos por designar | Revisión especializada según el caso |
| Demo y pitch | Producto | Todos los responsables de afirmaciones presentadas |
| Despliegue y recuperación | Operación | Ingeniería |

La gobernanza es **[SUP-032]**. Se propone revisar avance y suposiciones al cerrar cada entregable; el tablero usará estados por hacer, en curso, en revisión, validado y bloqueado, con evidencia de salida. Los bloqueos conservarán causa y siguiente acción; no se ocultarán tras porcentajes de avance. **[SUP-040]**

| Riesgo | Prioridad inicial supuesta | Señal de activación | Respuesta y responsable |
| --- | --- | --- | --- |
| Escala inadecuada para parcelas | Alta | Poca cobertura útil o píxeles mezclados | Limitar uso o cambiar fuente; ciencia |
| Acceso o latencia del proveedor | Alta | Descarga no reproducible o dato insuficientemente reciente | Alternativa documentada y caché; ciencia/ingeniería |
| Reglas no revisadas | Alta | Falta especialista o desacuerdo crítico | Mantener comparación experimental y limitar salida; agronomía |
| Interpretación errónea | Alta | Usuario confunde score con certeza | Cambiar lenguaje y representación; producto |
| Costos superiores al modelo | Alta | Carga o soporte excede escenario | Medir, limitar cupos y revisar precio; negocio/operación |
| Exposición de datos | Alta | Acceso cruzado o enlace público involuntario | Suspender acceso, contener y corregir; operación |
| Sobrecarga de alcance | Alta | Fuentes y funciones avanzan sin recorrido completo | Priorizar MVP-A y dependencias; producto |
| Adopción limitada | Media | No se repite una tarea útil o no se acepta seguimiento | Revisar segmento y propuesta; investigación |
| Dependencia de una persona | Media | Falta documentación o acceso compartido seguro | Transferencia, revisión y recuperación; coordinación |

Las prioridades son cualitativas **[SUP-032]**. No se les atribuye una probabilidad medida. La matriz se revisará después de pruebas y podrá elevar o reducir prioridad con evidencia.

**Presupuesto por actividades, ilustrativo [SUP-010, SUP-032]:** se suponen bolsas de S/ 1.800 para infraestructura/servicios, S/ 1.500 para campo, S/ 2.000 para revisión agronómica y S/ 700 para materiales y otros gastos. La base suma S/ 6.000; una contingencia del 20% añade S/ 1.200 y da S/ 7.200 de desembolso de referencia. Estas cantidades describen categorías para discutir recursos; no son cotizaciones, fondos disponibles ni el costo medido de la demostración. El trabajo del equipo y el costo del agente deben valorarse con evidencia propia, sin asignar aquí horas estimadas de desarrollo. El escenario unitario mensual de la sección 03 corresponde a operación hipotética y no se suma automáticamente a estas bolsas de proyecto.

### Entrega NASA Space Apps

El contexto atribuye el origen a NASA Space Apps Challenge 2026. No se recuperó el desafío exacto, el registro del equipo, la sede ni los requisitos de entrega. El portal oficial no pudo recuperarse mediante la consulta web de esta revisión; por tanto no se incorporan fechas, reglas, límites de video o criterios de evaluación como si hubieran sido verificados. **[SUP-035]**

Se propone un paquete reutilizable: ficha de proyecto, problema y público con evidencia, explicación del uso real de datos espaciales, metodología, demo reproducible, repositorio con licencia definida, video con alternativa de respaldo y plan posterior. Cada afirmación del pitch deberá corresponder a una evidencia o estar identificada como hipótesis o función futura. **[SUP-035]**

**Guion propuesto para la demostración [SUP-035]:** presentar la pregunta del agricultor; abrir la parcela y su contexto; mostrar datos reales con fuente, período y calidad; consultar su significado al agente integrado; abrir los registros detallados y descargar una selección; y mostrar vegetación o comparación experimental cuando estén implementadas y respaldadas. El cierre explica límites y evidencia de validación. La extensión y el formato de presentación se ajustarán a los requisitos oficiales cuando estén confirmados, sin atribuirles una duración no verificada. Se preparará una grabación que muestre la misma versión y datos si la conexión falla.

La demo comenzará identificando si la parcela es sintética o autorizada y qué integraciones son reales. Una evaluación con criterios ficticios se rotulará sintética en pantalla y en voz. La frase de valor se apoyará en la tarea demostrada; no se afirmará ahorro de agua, incremento de rendimiento, alianza con NASA o IA entrenada sin evidencia propia.

El paquete incluirá un manifiesto de demostración: versión de aplicación, fecha de corte, productos, activos, métodos, reglas, limitaciones y forma de repetir el recorrido. Si el evento exige un formato distinto, se adaptará después de verificar sus instrucciones oficiales. **[SUP-035]**

### Continuidad poshackathon

La continuidad se apoya en tres pruebas: utilidad para una tarea, calidad técnica/agronómica y sostenibilidad de atención. El siguiente paso tras la demo será un piloto con alcance acordado, no la expansión simultánea a nuevas regiones o una promesa comercial de predicción. **[SUP-031, SUP-033]**

Se propone un acuerdo interno que identifique autoría, contribuciones, acceso a cuentas, decisiones, uso del nombre, licencias de código y datos, salida de integrantes y derechos sobre nuevas aportaciones. No se selecciona forma societaria ni licencia jurídica definitiva sin aprobación del equipo y revisión apropiada. Los datos abiertos conservan sus condiciones propias; una licencia de código no concede derechos sobre todos los datos del sistema. **[SUP-033, SUP-039]**

Las vías de financiación a explorar son piloto pagado, programas de innovación, cooperación académica y aportes del equipo. Son posibilidades sin acuerdos existentes. Toda solicitud de apoyo debe separar costo de desarrollo, costo operativo y costo de validación, además de señalar la evidencia que el financiamiento permitiría obtener. **[SUP-011, SUP-033]**

Los criterios para continuar son una tarea comprendida, ausencia de fallos críticos no resueltos, acceso sostenible a datos, capacidad de soporte y una ruta plausible de financiación. Si no se cumplen, se reducirá el alcance o se revisará la propuesta. El aprendizaje y los límites documentados son entregables del proyecto aunque una hipótesis comercial resulte falsa. **[SUP-033]**

**Cierre de validación del área:** asignar nombres y disponibilidad, aprobar prioridades y recursos, seleccionar el desafío si sigue siendo pertinente, y registrar acuerdos de pilotaje y propiedad. Ninguna tabla de esta sección implica compromisos personales o financieros ya asumidos. **[SUP-032, SUP-033, SUP-035]**

## Anexo A. Matriz de seguimiento

El estado "desarrollado para revisión" describe la documentación de esta edición, no la ejecución del proyecto. Los responsables siguientes son roles propuestos; deben asignarse personas antes de iniciar actividades. La siguiente revisión se vincula a un hito para evitar inventar fechas de compromiso. **[SUP-032, SUP-040]**

| Documento o conjunto | Responsable funcional | Estado documental | Evidencia de cierre y revisión |
| --- | --- | --- | --- |
| Project Overview | Producto | Presentación y descripciones confirmadas por el usuario | Comprobar que los materiales posteriores respeten las definiciones aceptadas |
| Problema y justificación | Investigación | Formulación confirmada; magnitud por contrastar | Estadísticas y decisiones reales para dimensionar el problema |
| Público y personas | Investigación | Personas sintéticas | Entrevistas y segmentación; antes de congelar MVP-B |
| Business Model Canvas | Negocio | Hipótesis desarrollada | Compra y costos; antes de oferta pagada |
| Propuesta de valor | Producto/negocio | Enfoque confirmado; utilidad por evaluar | Tareas y valor percibido; la prueba no reabre la definición aprobada sin nueva decisión |
| PRD, MVP e historias | Producto | Especificación propuesta | Alcance aprobado y aceptación; por corte |
| Fuentes y metodología | Ciencia/agronomía | Diseño con referencias | Muestras y reglas revisadas; antes de publicar resultados |
| Arquitectura y ADR | Ingeniería | Diseño propuesto | Prueba de entorno y ADR aceptados; al iniciar código |
| Base de datos | Ingeniería | Modelo propuesto | Migraciones y revisión de linaje; antes de persistencia real |
| API | Ingeniería | Contratos propuestos | OpenAPI y pruebas; por versión |
| Validación | Investigación/ciencia | Protocolo propuesto | Consentimiento, casos y resultados; antes y después de piloto |
| Roadmap y riesgos | Coordinación | Orden sin plazos confirmado; recursos y riesgos por contrastar | Disponibilidad y matriz revisada; por entregable |
| Pitch y demo | Producto | Guion propuesto | Afirmaciones y versión verificadas; antes de presentar |
| Seguridad y operación | Operación | Política técnica propuesta | Permisos, respaldo y restauración; antes de piloto privado |

## Anexo B. Estructura de repositorios y documentación

Se conserva la organización híbrida del contexto: una herramienta de conocimiento puede reunir estrategia e investigación, mientras GitHub u otro control de versiones conserva código y especificaciones técnicas. No se presupone que exista un espacio Notion o repositorio remoto. Cada tema tendrá una fuente principal y enlaces a las demás, evitando documentos duplicados con decisiones diferentes. **[SUP-029, SUP-040]**

Árbol propuesto para el futuro repositorio de software:

```text
tarpu/
  apps/
    web/                      interfaz y pruebas de tareas
    api/                      contratos y módulos de dominio
  packages/
    contracts/                esquemas compartidos cuando sean necesarios
  pipelines/
    connectors/               clientes por producto
    processing/               calidad, normalización e indicadores
  rules/                      catálogo y reglas versionadas
  samples/                    muestras autorizadas y manifiestos
  tests/                      cálculos, contratos y recorridos críticos
  infrastructure/             entornos y despliegue
  docs/
    architecture/             C4 y ADR
    api/                      OpenAPI y ejemplos
    database/                 modelo, diccionario y migraciones
    data-sources/             fichas y pruebas de acceso
    processing/               fórmulas y calidad
    recommendations/          reglas, restricciones y revisión
    research/                 síntesis anonimizada
    security/                 identidad, privacidad y permisos
    testing/                  conjuntos y resultados
    deployment/               operación y recuperación
  README.md
  CONTRIBUTING.md
```

La organización de conocimiento propuesta tendrá Inicio, Investigación, Negocio, Producto, Ciencia, Ingeniería, Validación, Roadmap, Entrega y Referencias. Los datos personales de entrevistas y las credenciales no formarán parte de un espacio general de documentación. Los archivos grandes se registrarán mediante manifiestos y almacenamiento apropiado. **[SUP-029, SUP-039]**

Para esta entrega se mantienen los tres archivos existentes de `Documentación`: Markdown, fuente LaTeX y PDF. No se crean aplicaciones o infraestructura a partir del árbol anterior. **La documentación especifica trabajo futuro; no declara que ese trabajo ya esté implementado.**

## Anexo C. Referencias y alcance de verificación

Consulta documental realizada el 19/10/2026. Se citan fuentes primarias para características técnicas y fuentes públicas oficiales para contexto territorial. La verificación de documentación no incluye ejecución de conectores TARPU, disponibilidad autenticada de activos, auditoría de licencias de cada archivo ni validación de campo.

| ID | Referencia primaria | Uso y límite de esta edición |
| --- | --- | --- |
| REF-01 | [NASA POWER Daily API](https://power.larc.nasa.gov/docs/services/api/temporal/daily/) | Series diarias y resolución de origen; no prueba consulta propia |
| REF-02 | [NASA POWER tutorial API](https://power.larc.nasa.gov/docs/tutorials/service-data-request/api/) | Diferencia de resolución meteorológica y solar |
| REF-03 | [NASA IMERG](https://gpm.nasa.gov/data/imerg) | Corridas y acceso general; fijar colección y versión |
| REF-04 | [NASA IMERG V07 Technical Documentation](https://gpm.nasa.gov/resources/documents/imerg-v07-technical-documentation) | Grilla y base temporal del candidato V07; no declara versión más reciente |
| REF-05 | [Copernicus Sentinel-2](https://documentation.dataspace.copernicus.eu/Data/SentinelMissions/Sentinel2.html) | Niveles de producto, bandas y clasificación |
| REF-06 | [Copernicus STAC](https://documentation.dataspace.copernicus.eu/APIs/STAC.html) | Descubrimiento de escenas y activos; descarga por probar |
| REF-07 | [SoilGrids visión general](https://docs.isric.org/globaldata/soilgrids/SoilGrids_faqs.html) | Producto a 250 m y profundidades; predicción global |
| REF-08 | [SoilGrids capas](https://docs.isric.org/globaldata/soilgrids/SoilGrids_faqs_01.html) | Propiedades y cuantiles de incertidumbre |
| REF-09 | [SoilGrids acceso](https://docs.isric.org/globaldata/soilgrids/SoilGrids_faqs_02.html) | Aviso documental de API pausada y alternativas |
| REF-10 | [NSIDC SPL3SMP_E versión 3](https://nsidc.org/data/spl3smp_e/versions/3) | Ejemplo concreto de producto SMAP en grilla de 9 km; selección final pendiente |
| REF-11 | [USGS factores Landsat](https://www.usgs.gov/faqs/how-do-i-use-a-scale-factor-landsat-level-2-science-products) | Interpretación de escala y offset; conector no implementado |
| REF-12 | [FAO-56, evapotranspiración de cultivo](https://www.fao.org/4/X0490E/x0490e0a.htm) | Relación ETc/Kc/ETo; no es metodología completa de riego TARPU |
| REF-13 | [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Referencia de accesibilidad; no certifica el prototipo |
| REF-14 | [FastAPI características](https://fastapi.tiangolo.com/features/) | OpenAPI y validación; no acredita backend propio |
| REF-15 | [PostGIS ST_Area](https://postgis.net/docs/ST_Area.html) | Área según tipo y referencia espacial |
| REF-16 | [MIDAGRI, anuarios agropecuarios](https://www.gob.pe/institucion/midagri/colecciones/5149-anuarios-estadisticas-de-produccion-agropecuaria) | Fuente para investigación; sin extracción de cifras de mercado |
| REF-17 | [INEI, Compendio Arequipa 2024](https://www.gob.pe/institucion/inei/informes-publicaciones/6453267-compendio-estadistico-arequipa-2024) | Publicación territorial localizada; sin estadísticas atribuidas en esta edición |
| REF-18 | [INIA, manual técnico de papa, 2020](https://repositorio.inia.gob.pe/handle/20.500.12955/1146) | Referencia para rotación e historial sanitario; no calibración local del motor |
| REF-19 | [INIA, guía de generación y lanzamiento de variedades](https://repositorio.inia.gob.pe/bitstreams/0d597e50-7526-41fe-92a5-d158d88bff55/download) | Identificación de cultivos; no acredita variedades seleccionadas para el piloto |
| REF-20 | [Atfarm, monitoreo de biomasa](https://support.at.farm/hc/es-es/articles/18253470818332--C%C3%B3mo-puedo-monitorear-la-biomasa-de-mi-parcela) | Función descrita por el proveedor; sin prueba de compra o cobertura local |
| REF-21 | [FAO WaPOR](https://www.fao.org/land-water/resources/tools/databases/wapor/en) | Alternativa/complemento relacionado con productividad del agua; aplicación territorial por verificar |
| REF-22 | [NASA Earthdata, herramientas](https://www.earthdata.nasa.gov/home) | Descripción de Worldview; sin evaluación comparativa de usuarios |

El [portal NASA Space Apps](https://www.spaceappschallenge.org/) es una referencia pendiente de recuperar: la consulta devolvió un error de acceso. Los requisitos y el desafío concreto no se verificaron. [Earthdata](https://www.earthdata.nasa.gov/), [AppEEARS](https://appeears.earthdatacloud.nasa.gov/) y [EcoCrop](https://ecocrop.apps.fao.org/) se conservan como referencias del contexto, sin declarar verificación de sus flujos autenticados o distribución actual de datos. **[SUP-035, SUP-038]**

## Anexo D. Registro de suposiciones

Este registro contiene únicamente los 37 supuestos activos sobre investigación, implementación, validación y negocio que el usuario no ha definido todavía. Las definiciones y directrices aceptadas están en el anexo G y no figuran aquí como suposiciones. Los antiguos códigos de alcance territorial, identidad y objetivos se cerraron por confirmación del usuario; su historial se conserva en el control de cambios, sin reutilizar sus identificadores. La cobertura científica y la ejecución se comprueban con sus códigos específicos, sin volver a poner en duda la decisión de producto. Los responsables son funciones por asignar, no personas comprometidas. **[SUP-040]**

| Código | Suposición y alcance | Responsable y condición de cierre |
| --- | --- | --- |
| SUP-002 | Productores de 0,5 a 10 ha como criterio exploratorio; papa, quinua, haba y cebada como catálogo candidato | Investigación/agronomía: confirmar segmento y especies/variedades con evidencia local |
| SUP-005 | Personas sintéticas, hipótesis de uso, actores y recorrido a contrastar; magnitud del problema por investigar | Investigación: entrevistas y observación; la formulación del problema ya está aceptada y no depende de aprobar este supuesto |
| SUP-006 | Muestra de descubrimiento de 16 productores, cuatro especialistas agronómicos y dos organizaciones; sesiones de 30-45 minutos | Investigación: protocolo y reclutamiento viable; especialistas revisan contexto, sin actuar como intermediarios obligatorios de uso |
| SUP-007 | Freemium, planes y cupos; comprador profesional/organizacional como hipótesis | Negocio: pruebas de uso, costo y compra; ajustar oferta |
| SUP-008 | Precios de prueba Campo S/ 0, Pro S/ 120 y referencia organizacional desde S/ 600 | Negocio: probar disposición de pago y alcance; aprobar condiciones antes de ofertar |
| SUP-009 | Método de mercado con universo sintético de 5.000, 1.200 atendibles y 60 cuentas anuales | Negocio/investigación: sustituir cantidades por conteos verificables y capacidad de captación |
| SUP-010 | Costos, márgenes, CAC, abandono, LTV y presupuestos numéricos ilustrativos | Negocio/operación: medir cargas, obtener cotizaciones y separar desembolso de costo económico |
| SUP-011 | Captación directa de agricultores y mediante organizaciones; pilotos y alianzas potenciales | Negocio: registrar acceso, acuerdos, embudo y pruebas concretas de continuidad |
| SUP-012 | Organización técnica en cortes MVP-A/B, prioridades operativas y criterios de terminado | Producto/ingeniería/ciencia: concretar implementación de las funciones confirmadas y demostrar aceptación |
| SUP-013 | Tokens, navegación, componentes, dirección visual y lema de trabajo aún no aprobado expresamente | Producto/UX: pruebas de legibilidad, accesibilidad y tareas; aprobación de identidad visual y lema |
| SUP-014 | Español inicial, consulta móvil, carga progresiva y recuperación con conexión intermitente | UX/ingeniería: observar condiciones de uso y probar dispositivos/red |
| SUP-015 | Monolito modular, React/TypeScript, FastAPI, PostgreSQL/PostGIS y herramientas complementarias | Ingeniería: ADR, versiones fijadas y recorrido en entorno reproducible |
| SUP-016 | Selección de productos candidatos y rutas de integración; prioridad POWER, Sentinel-2 y complementos | Ciencia/ingeniería: producto exacto, acceso, unidad, muestra y prueba de conector |
| SUP-017 | Mínimos 90% temporal, 80% espacial, cinco píxeles equivalentes y referencia exploratoria de diez años | Ciencia: ensayar representatividad y sensibilidad; revisar umbrales por variable |
| SUP-018 | Método de elegibilidad, indicadores y comparación del siguiente cultivo con reglas explícitas | Agronomía/ciencia: fuentes locales, funciones y revisión de casos |
| SUP-019 | Pesos experimentales 30/25/25/20 y cálculo de score; ejemplo ficticio de 74,5 | Agronomía/producto: validar utilidad, sensibilidad y comunicación; no usar como probabilidad |
| SUP-020 | Bloqueo de puntaje con criterios necesarios ausentes; perfiles explícitos y sin riesgo/confianza calibrados | Agronomía/UX: revisar casos de abstención y comprensión |
| SUP-021 | Recursos API, esquemas, errores y límites; formatos y alcance de exportación de registros, geometrías y reportes | Ingeniería: OpenAPI, archivos de muestra y pruebas de permisos, metadatos y reutilización |
| SUP-022 | WGS84/4326 en intercambio, cálculo geodésico o métrico y extracción espacial documentada | Ciencia/ingeniería: pruebas de área, ubicación y estadística por producto |
| SUP-023 | Entidades, linaje, revisiones y persistencia de snapshots | Ingeniería/ciencia: modelo físico, migraciones y reproducción sin sobrescritura |
| SUP-024 | Trabajos durables, caché, actualizaciones, tres reintentos, límite de 15 min/250 MB y cola condicionada | Ingeniería/operación: probar carga, fallos e idempotencia; ajustar al producto |
| SUP-025 | Objetivos p95 de consulta, carga móvil, diez análisis concurrentes y disponibilidad del piloto | Operación: mediciones bajo condiciones declaradas antes de comprometer servicio |
| SUP-026 | Identidad por proveedor, sesión segura y roles propietario/editor/lector con control por recurso | Ingeniería: seleccionar proveedor y probar autorización, revocación y acceso a archivos |
| SUP-027 | Despliegue con servicios separados y proveedor a elegir; monitoreo y automatización | Operación: costo medido, entorno, cuenta autorizada y entrega reproducible |
| SUP-028 | Respaldo diario, 30 días, RPO 24 h, RTO 8 h y retenciones de derivados/audios de referencia | Operación/datos: restauración probada y política acorde con consentimiento y licencias |
| SUP-029 | Repositorio único, estructura, ramas breves, PR, migraciones y ADR propuestos | Ingeniería/equipo: aprobar proceso y probar incorporación de otra persona |
| SUP-030 | Protocolo de diez agricultores, tres de ellos interesados en datos detallados; metas ocho de diez | Investigación: aprobar tareas y ejecutar evaluación con evidencia y límites |
| SUP-031 | Piloto de diez parcelas durante una campaña; métricas informativas y agrícolas separadas | Investigación/agronomía: acuerdo, línea base, seguimiento y diseño de comparación |
| SUP-032 | Roles funcionales, prioridades de riesgo, dependencias y recursos de ejecución | Coordinación: asignar personas y recursos reales sin fijar duraciones de construcción en el informe |
| SUP-033 | Continuidad, acuerdos internos, financiación y propiedad por definir | Equipo: decisiones registradas y revisión apropiada de acuerdos |
| SUP-034 | Modalidad inicial de interacción, modelo, proveedor, configuración, contexto y costo del agente; voz y Android como ampliaciones | Producto/ingeniería: seleccionar y probar estos detalles; la existencia del agente integrado ya es una decisión confirmada |
| SUP-035 | Entrega vinculada al contexto Space Apps 2026, desafío sin recuperar y guion ordenado por recorrido | Coordinación: confirmar evento/desafío/requisitos y ajustar materiales sin inventar reglas o duraciones |
| SUP-036 | Conjunto de validación, 20 casos y dos revisores; pruebas técnicas y agronómicas | Ciencia/agronomía: reunir muestras, revisores y resultados con criterios de fallo |
| SUP-037 | Fuera de la primera aceptación: rentabilidad, dosis de riego, rendimiento y pronósticos precisos | Producto/agronomía: nueva metodología y fuentes antes de ampliar alcance |
| SUP-038 | Catálogo manual versionado con revisión; EcoCrop solo como candidato histórico | Agronomía/ciencia: procedencia, licencia, variedad y revisión de cada regla |
| SUP-039 | Tratamiento de privacidad, consentimiento, atribución y licencias como diseño a revisar | Responsable de datos/equipo: políticas y revisión especializada antes de uso real |
| SUP-040 | Markdown principal, sincronía de formatos, revisión por entregable y registro de evidencia/decisiones | Coordinación: adoptar proceso, mantener historial y verificar cada nueva edición |

## Anexo E. Contratos y ejemplos sintéticos

Todos los UUID, fechas, valores y resultados de este anexo son **ejemplos sintéticos [SUP-021]**. No identifican una parcela, trabajo o consulta real. Las estructuras son contratos propuestos y no respuestas capturadas de un servicio TARPU.

### Solicitud de evaluación

El servidor resuelve la parcela del path y comprueba sus permisos antes de fijar versiones. Los cuatro pesos son fracciones y deben sumar 1 dentro de una tolerancia numérica documentada. Si la campaña o los indicadores cambiaron, se crea una evaluación nueva. **[SUP-019, SUP-021]**

```json
{
  "parcel_version": 1,
  "campaign_revision": 1,
  "profile": "experimental_v1",
  "rule_set_version": "draft-0.1",
  "weights": {
    "water": 0.30,
    "climate": 0.25,
    "soil": 0.25,
    "rotation": 0.20
  },
  "candidate_crop_ids": [
    "00000000-0000-4000-8000-000000000101"
  ],
  "purpose": "demonstration"
}
```

### Acuse de trabajo

Respuesta 202 propuesta. `Location` puede señalar el recurso de seguimiento. El estado en cola no significa que los datos ya se hayan descargado ni que la evaluación vaya a ser suficiente. **[SUP-021, SUP-024]**

```json
{
  "job_id": "00000000-0000-4000-8000-000000000201",
  "state": "queued",
  "status_url": "/api/v1/jobs/00000000-0000-4000-8000-000000000201",
  "created_at": "2026-10-19T15:00:00Z",
  "synthetic_example": true
}
```

### Resultado con evidencia insuficiente

El siguiente resultado ilustra una ejecución que terminó y determinó que no hay evidencia suficiente para puntuar. No es un fallo del servicio ni una recomendación negativa sobre un cultivo real. `execution_state` describe el proceso; `assessment_state` describe si el contenido pudo evaluarse. **[SUP-020, SUP-021]**

```json
{
  "evaluation_id": "00000000-0000-4000-8000-000000000301",
  "execution_state": "succeeded",
  "assessment_state": "insufficient_evidence",
  "parcel_version": 1,
  "campaign_revision": 1,
  "profile": "experimental_v1",
  "rule_set_version": "draft-0.1",
  "synthetic_example": true,
  "alternatives": [
    {
      "candidate_crop_id": "00000000-0000-4000-8000-000000000101",
      "display_name": "Candidato ficticio A",
      "eligibility": "not_evaluable",
      "score": null,
      "criteria": {
        "water": null,
        "climate": null,
        "soil": null,
        "rotation": null
      },
      "reasons": [
        "El ejemplo no contiene indicadores reales ni reglas revisadas."
      ],
      "missing_inputs": [
        "irrigation_context",
        "validated_crop_rules",
        "environmental_indicators"
      ]
    }
  ],
  "provenance": {
    "source_assets": [],
    "method_version": "draft-0.1",
    "processed_at": "2026-10-19T15:01:00Z",
    "input_hash": null
  },
  "warnings": [
    "Ejemplo sintético; no usar para una decisión agrícola."
  ]
}
```

En una evaluación real se guardaría un hash calculado de entradas normalizadas; el `null` anterior indica que aquí no se ejecutó ese cálculo. No se utiliza una cadena ficticia con apariencia de checksum real. Una evaluación publicada con insumos reales debe resolver linaje y versiones antes de aceptarse. **[SUP-023]**

### Error de validación

El error sintético muestra una validación de pesos. El mensaje se redacta para el usuario y el código permite actuar al cliente sin interpretar texto libre. **[SUP-021]**

```json
{
  "error": {
    "code": "INVALID_WEIGHTS",
    "message": "Las prioridades deben sumar 1 y no admitir valores negativos.",
    "details": {
      "expected_sum": 1.0,
      "received_sum": 0.8
    }
  },
  "request_id": "00000000-0000-4000-8000-000000000401"
}
```

## Anexo F. Aceptación y trazabilidad

La matriz siguiente es un plan de comprobación, con estado **sin ejecutar** para todos los casos de software. Los identificadores relacionan requisito, prueba y evidencia que deberá conservarse. La revisión de esta documentación no se confunde con aprobar esos casos. **[SUP-012, SUP-036]**

| Caso | Requisito o riesgo cubierto | Acción y resultado esperado | Evidencia futura |
| --- | --- | --- | --- |
| AT-01 | RF-01 geometría | Guardar polígono válido; rechazar autointersección; calcular área con referencia correcta | Petición, respuesta y contraste geométrico |
| AT-02 | RF-02 historial | Registrar desconocido sin convertirlo en cero; corregir mediante revisión | Historial de cambios y evaluación anterior intacta |
| AT-03 | RF-03 clima | Extraer una muestra real y conservar unidad, período y faltantes | Original, manifiesto e indicador reproducido |
| AT-04 | RF-04 procedencia | Abrir evidencia desde cualquier indicador publicado | Fuente, producto, versión, fecha y método visibles |
| AT-05 | RF-05 vegetación | Procesar escena con nube sobre parcela; excluir píxeles y mostrar cobertura | Máscara, activo y cálculo de área válida |
| AT-06 | RF-06 abstención | Solicitar comparación sin criterio necesario | Score nulo y listado de faltantes; sin ranking engañoso |
| AT-07 | RF-06 restricciones | Intentar favorecer por pesos un candidato no elegible | Restricción preservada y motivo identificable |
| AT-08 | RF-07 prioridades | Cambiar pesos válidos y repetir cálculo con mismas entradas | Nueva evaluación y anterior conservada |
| AT-09 | RF-08 reporte | Exportar evaluación guardada después de actualizar reglas | Reporte mantiene su versión y advertencias originales |
| AT-10 | RF-09 acceso | Consultar parcela, trabajo y activo de otra organización | Acceso denegado sin revelar contenido privado |
| AT-11 | RF-10 recuperación | Reiniciar worker durante análisis y repetir solicitud | Trabajo recuperable; publicación y costo sin duplicación indebida |
| AT-12 | Calidad temporal | Incluir año bisiesto y períodos con faltantes | Cobertura y acumulado coherentes con calendario |
| AT-13 | Semántica de lluvia | Comparar tasa horaria y lámina por intervalo | Integración correcta sin doble multiplicación |
| AT-14 | Semántica espectral | Leer producto con escala y offset | Índice calculado desde reflectancias correctas |
| AT-15 | Desactualización | Cambiar geometría o historial tras una evaluación | Resultado previo conserva entradas y muestra nueva versión disponible |
| AT-16 | Baja conectividad | Interrumpir red y recuperar consulta | Último estado identificable sin fingir dato reciente |
| AT-17 | Restauración | Recuperar respaldo en entorno separado | Tiempo, integridad y pérdida medidos respecto de objetivos |
| AT-18 | Comprensión | Pedir fuente, motivo y limitación sin ayuda | Registro por participante y denominador explícito |
| AT-19 | Agronomía | Revisar casos suficientes, faltantes y excluyentes | Evaluaciones independientes y resolución de errores críticos |
| AT-20 | Costo | Ejecutar carga conocida con instrumentación | Tiempo, bytes, cómputo y soporte por unidad |
| AT-21 | RF-11 agente | Preguntar por evidencia existente, ausente y de otra parcela sin autorización | Respuesta respaldada o límite explícito; sin acceso cruzado ni datos inventados |
| AT-22 | RF-12 datos detallados | Abrir y filtrar registros sin evaluación de cultivo | Niveles original/normalizado/derivado identificados; unidades y faltantes conservados |
| AT-23 | RF-08 exportación básica | Descargar selección y cotejarla con la consulta | Archivo reutilizable con mismos registros y metadatos; PDF diferenciado |

La aceptación de MVP-A requiere AT-01 a AT-04, AT-21 a AT-23 y los casos de permisos, fechas y fallos que apliquen. MVP-B añade capa, comparación y casos de semántica relacionados. El piloto privado exige autorización y recuperación probadas. Los cambios de alcance deben registrar qué casos dejan de aplicar y por qué. **[SUP-012]**

## Anexo G. Control de cambios y decisiones

**Versión 0.1:** borrador fundacional recuperado, con texto base y pendientes. **Versión 0.2:** desarrollo de todas las áreas originales, índice navegable en Markdown, registro de 40 suposiciones, requisitos y aceptación, contratos sintéticos, modelo de datos, metodología, investigación, escenarios de negocio y referencias primarias. La ampliación no representa aprobación de esas propuestas.

**Versión 0.3 - 23/10/2026:** incorporación de las indicaciones del usuario sobre alcance inicial en todo Arequipa, calidad del análisis en Perú, posible uso en otros territorios, autonomía del agricultor, agente integrado y acceso a datos detallados/exportables. Se eliminan el horizonte en años de la visión y los plazos estimados de desarrollo; los objetivos y el roadmap se expresan por resultados y dependencias. Se actualizan producto, negocio, contratos, validación y registro de suposiciones para mantener coherencia. Problema y justificación conserva su redacción.

**Versión 0.4 - 23/10/2026:** retirada de las etiquetas de suposición de los apartados corregidos o aceptados por el usuario. Se confirman presentación, descripciones, formulación del problema y justificación, misión, visión, valores y objetivos. Los detalles técnicos, las estimaciones comerciales y las validaciones no ejecutadas mantienen sus supuestos propios.

Los códigos `SUP-001`, `SUP-003` y `SUP-004` quedan cerrados por confirmación y retirados del registro de supuestos activos; se conservan aquí solo como historial y no se reutilizan. El registro activo contiene 37 códigos. El contenido técnico pendiente se conserva bajo sus identificadores específicos.

Directrices y definiciones confirmadas por el usuario el 23/10/2026:

| ID | Directriz | Alcance de la confirmación |
| --- | --- | --- |
| DEC-001 | Orientar inicialmente el producto a todo Arequipa y pulir el análisis en Perú | Prioridad territorial; no acredita cobertura útil de cada producto en todas las ubicaciones |
| DEC-002 | Facilitar que el agricultor comprenda directamente los resultados con un agente integrado | Orientación de experiencia; proveedor y diseño técnico todavía por validar |
| DEC-003 | Ofrecer acceso a datos más detallados sin evaluación agronómica y opción de exportarlos | Capacidad del producto; interfaz, formatos y límites concretos siguen propuestos |
| DEC-004 | Expresar visión y trabajo sin horizontes en años ni calendarios estimados de desarrollo | Mantener orden de tareas, entregables y dependencias; conservar períodos científicos y unidades de operación pertinentes |
| DEC-005 | Aceptar la presentación y las descripciones del proyecto con las correcciones incorporadas | Definición del producto, equipo, territorio y vías de consulta; no acredita implementación |
| DEC-006 | Aceptar la formulación del problema y su justificación | Marco del proyecto confirmado; magnitud, frecuencia y efectos requieren evidencia, sin datos inventados |
| DEC-007 | Aceptar misión, visión sin horizonte temporal y valores | Formulación confirmada; el lema de trabajo y los elementos visuales no se aprueban por extensión |
| DEC-008 | Aceptar objetivos y propuesta de valor orientados a la comprensión autónoma del agricultor | Objetivos y orden de trabajo confirmados; umbrales, pruebas y solución técnica no equivalen a resultados obtenidos |

La base de esta edición es el archivo de contexto y las indicaciones anteriores del usuario. No se verificaron nuevas implementaciones externas. La revisión modifica documentación y no declara conexiones, entrevistas o despliegues ejecutados.

Plantilla de decisión propuesta **[SUP-040]**:

```text
ID: DEC-XXX
Tema y código SUP relacionado:
Estado: propuesto / aprobado / descartado / sustituido
Descripción y ámbito:
Evidencia y enlaces:
Alternativas consideradas:
Consecuencias y límites:
Responsable:
Quién aprueba y cuándo:
Versión del documento o software afectada:
Próxima revisión o condición de reapertura:
```

Una actualización cambia el estado del supuesto, registra su decisión y corrige todos los apartados afectados. No elimina la procedencia anterior ni transforma un ejemplo sintético en dato real por quitarle la etiqueta. Los códigos de supuestos retirados no se reutilizan para otro significado.

Antes de publicar una edición se comprobarán índice, referencias, fórmulas, códigos, JSON y correspondencia de Markdown/LaTeX/PDF. Las páginas PDF deben revisarse visualmente para detectar texto cortado, tablas ilegibles o encabezados aislados. Las verificaciones documentales no reemplazan los casos de aceptación del software. **[SUP-040]**

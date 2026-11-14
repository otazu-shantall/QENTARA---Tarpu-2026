# TARPU / QENTARA — Contexto integral del proyecto

**Documento de transferencia de conocimiento para otro chat y para el equipo.**

- Fecha de consolidación: **19 de octubre de 2026**, zona horaria America/Lima.
- Versión de esta consolidación: **1.0**.
- Conversación de origen: **QENTARA - infoDEV**.
- Identificador: `6ad55817-92c4-83e9-9bfe-94633db00cfa`.
- Idioma de trabajo recuperado: español.
- Finalidad: conservar el contexto, las propuestas, las preguntas y los límites de evidencia para continuar el proyecto sin inventar decisiones.
- Alcance: todo el contenido sustantivo recuperado de las fuentes descritas en la sección 1. **No constituye una transcripción íntegra de todo el historial original.**

> **Advertencia de procedencia:** la herramienta de lectura del chat devolvió cinco intervenciones del usuario, pero las respuestas del asistente eran referencias sin texto. El usuario aportó después tres respuestas extensas: estructura documental, cuadro de fuentes y explicación del backend. Además, existe un PDF local de documentación maestra, expresamente rotulado como borrador. Esta consolidación integra esas fuentes y conserva las lagunas. No permite asegurar que se hayan recuperado mensajes anteriores sobre diseño, branding u otras decisiones.

## Índice

1. [Fuentes, estados y reglas de interpretación](#1-fuentes-estados-y-reglas-de-interpretación)
2. [Contexto rápido para el siguiente chat](#2-contexto-rápido-para-el-siguiente-chat)
3. [Identidad, visión, problema y propuesta de valor](#3-identidad-visión-problema-y-propuesta-de-valor)
4. [Público, investigación y mercado](#4-público-investigación-y-mercado)
5. [Producto, UX/UI y branding](#5-producto-uxui-y-branding)
6. [Fuentes, APIs, formatos y calidad científica](#6-fuentes-apis-formatos-y-calidad-científica)
7. [Arquitectura, backend y flujo de datos](#7-arquitectura-backend-y-flujo-de-datos)
8. [Base de datos y almacenamiento](#8-base-de-datos-y-almacenamiento)
9. [Motor agronómico, recomendaciones y voz](#9-motor-agronómico-recomendaciones-y-voz)
10. [Roadmap, MVP y orden de construcción](#10-roadmap-mvp-y-orden-de-construcción)
11. [Modelo de negocio y sostenibilidad](#11-modelo-de-negocio-y-sostenibilidad)
12. [Documentación integral y organización del trabajo](#12-documentación-integral-y-organización-del-trabajo)
13. [Validación, impacto, seguridad y operación](#13-validación-impacto-seguridad-y-operación)
14. [Registro de decisiones, hipótesis y ejemplos](#14-registro-de-decisiones-hipótesis-y-ejemplos)
15. [Preguntas abiertas y decisiones pendientes](#15-preguntas-abiertas-y-decisiones-pendientes)
16. [Historial recuperado de preguntas del usuario](#16-historial-recuperado-de-preguntas-del-usuario)
17. [Referencias y recursos mencionados](#17-referencias-y-recursos-mencionados)
18. [Guía de continuidad y mantenimiento](#18-guía-de-continuidad-y-mantenimiento)
19. [Anexo de conservación del borrador local](#19-anexo-de-conservación-del-borrador-local)

## 1. Fuentes, estados y reglas de interpretación

### 1.1. Fuentes efectivamente disponibles

| Código | Fuente | Qué permite recuperar | Límite |
| --- | --- | --- | --- |
| U0 | Solicitud actual del usuario | Necesidad de un `.md` exhaustivo, estructurado y descargable; temas que debe cubrir; separación de hechos, decisiones, hipótesis y pendientes | Es un requisito de esta entrega, no una aprobación retrospectiva de cada propuesta técnica |
| U1–U5 | Cinco mensajes del usuario recuperados de la conversación de origen | Preguntas sobre backend, cuadro de fuentes, documentación integral, versiones `.tex`/`.md` y transferencia de contexto | Las cinco respuestas asociadas llegaron como referencias sin su texto |
| A-DOC | Respuesta histórica pegada por el usuario: «TARPU — Estructura de documentación integral del proyecto» | Ocho áreas documentales, público, módulos, modelo comercial, organización Notion/GitHub y prioridades | Es una propuesta del asistente; no contiene actas de aprobación del equipo |
| A-FUENTES | Respuesta histórica pegada por el usuario: «TARPU — Cuadro de fuentes satelitales, APIs, formatos y procesamiento» | Matriz de fuentes, accesos, formatos, librerías, prioridades e integraciones sugeridas para el MVP | No equivale a conectores implementados ni a comprobación actual de los servicios |
| A-DEV | Respuesta histórica pegada por el usuario: «TARPU — ¿Cómo conectaremos los datos de la NASA con nuestro backend y la aplicación?» | Arquitectura, ejemplo POWER, base de datos, pantallas, API, trabajos asíncronos, motor, voz y secuencia de desarrollo | Incluye ejemplos ficticios y lenguaje de intención; no demuestra ejecución |
| P0 | PDF local `tmp/tarpu-pdf/TARPU_Documentacion_Maestra.pdf`, 11 páginas físicas | Documento maestro, versión 0.1, fechado 19/10/2026, con texto base y pendientes | Se declara «Borrador fundacional — sujeto a validación». Su autoría y aprobación no se verificaron |

**Ubicación del PDF en el entorno de esta entrega:** `C:\Users\Ericko\Documents\ChatGPT\Nasa Space Apps\tmp\tarpu-pdf\TARPU_Documentacion_Maestra.pdf`.

El PDF se utilizó como fuente complementaria, no como sustituto silencioso de las respuestas ausentes. Su contenido textual se conserva en el anexo final para evitar perder detalles del borrador. Los identificadores de secciones de P0 se refieren a su numeración interna; la portada y el índice añaden páginas físicas.

### 1.2. Estados que debe respetar cualquier continuación

| Estado | Significado | Ejemplo en TARPU |
| --- | --- | --- |
| **CONFIRMADO POR EL USUARIO** | Hay una petición o afirmación explícita del usuario en el material recuperado | El proyecto es para una hackathon y se quiere preparar para continuar después |
| **CONSTA EN EL BORRADOR** | Está escrito en A-DOC, A-FUENTES, A-DEV o P0, pero no hay aprobación explícita recuperada | Arequipa como contexto inicial; React/FastAPI como arquitectura propuesta |
| **PROPUESTA** | Alternativa de producto, técnica, negocio o proceso presentada para considerar | Cuatro integraciones iniciales; PostgreSQL/PostGIS; planes Tarpu Pro |
| **HIPÓTESIS** | Supuesto sobre usuarios, mercado, impacto o adecuación que requiere evidencia | Pequeños productores como segmento inicial; freemium sostenible |
| **EJEMPLO FICTICIO** | Dato, coordenada, puntaje, fecha o respuesta inventados para explicar una idea | Quinua con 82 puntos en el JSON de ejemplo |
| **PENDIENTE** | Investigación, definición, validación o ejecución aún necesaria | Producto exacto de SMAP; umbrales agronómicos; precios |
| **NO RECUPERADO** | El material alude a información previa que no está disponible | Mockups originales y posibles decisiones anteriores de branding |

**Distinción central:** que una recomendación esté bien explicada o se repita en varias respuestas no la convierte en una decisión aprobada. No se recuperó un registro formal de aprobación del stack, alcance del MVP, precios, diseño ni metodología agronómica.

### 1.3. Qué no demuestra esta documentación

No acredita código operativo, consultas reales a APIs, infraestructura desplegada, cuentas de proveedores, usuarios registrados, estudios de campo, acuerdos con instituciones, resultados agrícolas, ingresos ni modelos predictivos entrenados. Las referencias a esas capacidades describen intenciones, propuestas o elementos por validar.

No se hizo una auditoría externa de la vigencia de endpoints, cuotas, formatos, productos o disponibilidad de servicios. Esos datos se preservan como contexto histórico. Antes de implementar, deben verificarse en la documentación oficial del producto concreto.

## 2. Contexto rápido para el siguiente chat

**TARPU** es el nombre del producto descrito en el material; **QENTARA** figura como equipo. El proyecto se plantea para **NASA Space Apps Challenge 2026**, con **Arequipa** como contexto inicial según las respuestas y el borrador. La intención explícita del usuario es que vaya más allá de la hackathon y tenga una base de producto seria: visión, negocio, público, respaldo científico, experiencia de usuario y desarrollo técnico.

La propuesta consiste en apoyar decisiones agrícolas por parcela combinando información satelital, datos meteorológicos, propiedades estimadas del suelo, requerimientos de cultivos y datos declarados por el productor. El objetivo no es solamente mostrar clima o mapas: se busca convertir datos dispersos en indicadores comprensibles, comparaciones de cultivos y alternativas de rotación explicadas.

La arquitectura sugerida es una web en React con mapas MapLibre y gráficos, una API Python/FastAPI, PostgreSQL/PostGIS, almacenamiento separado de archivos geoespaciales y procesos de ingesta/análisis. Redis y una cola de trabajos son ampliaciones condicionadas por la carga; Android/Kotlin aparece como evolución futura. **Todo ello sigue siendo propuesta en la evidencia disponible.**

Fuentes candidatas: NASA POWER, GPM IMERG, SMAP, MODIS, VIIRS, Landsat 8/9, Sentinel-2, SoilGrids y FAO EcoCrop. La selección recomendada para un primer MVP ampliado fue POWER + IMERG + Sentinel-2 + SoilGrids, acompañados por un catálogo agronómico y el historial del agricultor. El primer recorrido técnico recomendado fue aún más pequeño: parcela/coordenadas → POWER → Python → PostgreSQL → FastAPI → gráfico React.

Los principios repetidos son trazabilidad, lenguaje sencillo, límites científicos explícitos y separación entre observaciones, estimaciones, predicciones y recomendaciones. Un dato regional no debe presentarse como medición precisa de una parcela; NDVI no equivale a fertilidad; históricos no bastan para predecir el futuro. Los ejemplos de puntuaciones y ventanas de siembra son ficticios.

El negocio propuesto es freemium con servicios avanzados para técnicos y organizaciones, posibles contratos B2B/B2G y acceso esencial para pequeños productores. No hay precios, ventas, rentabilidad ni disposición de pago demostrados.

## 3. Identidad, visión, problema y propuesta de valor

### 3.1. Nombres, contexto y relación entre TARPU y QENTARA

| Elemento | Contexto recuperado | Estado / fuente |
| --- | --- | --- |
| TARPU | Producto/plataforma agrícola | Consta en A-DOC, A-FUENTES, A-DEV y P0 |
| QENTARA | Equipo al que se atribuye TARPU | Consta en A-DOC y P0; no implica sociedad legal |
| Evento | NASA Space Apps Challenge 2026 | Consta en las respuestas y P0; el usuario confirma genéricamente que es una hackathon |
| Territorio | Arequipa como contexto inicial | Consta en el borrador; alcance exacto pendiente |
| Lema | «Datos para cosechar un mejor mañana» | Portada de P0; no se recuperó aprobación del lema |
| Origen del nombre | A-DOC propone documentarlo | No recuperado: no inventar traducción, etimología ni historia |
| Nombre legal, entidad, propiedad | No definidos en la evidencia | Pendiente |

No asumir que TARPU y QENTARA son nombres intercambiables ni que hubo un cambio de marca entre ellos. La relación equipo/producto es la que consta en las fuentes; cualquier otra debe confirmarse.

### 3.2. Presentación general del borrador

P0 describe TARPU como una plataforma de apoyo a decisiones agrícolas que integra observaciones satelitales, información climática y conocimiento agronómico para ayudar a productores a comprender sus parcelas y evaluar alternativas de rotación. Se plantea una evolución hacia un producto real después del evento.

**Necesidades expresadas por el usuario:** fundamentar, pensar y documentar el proyecto con seriedad; incluir modelo de negocio, público dirigido y documentación DEV; desarrollar cada parte con texto base orientador y subpuntos pendientes claramente marcados.

### 3.3. Problema que se propone atender

Los textos plantean que la variabilidad de precipitaciones, las bajas temperaturas y la información fragmentada dificultan decidir qué sembrar, cuándo hacerlo y cómo rotar. También señalan que interpretar herramientas científicas puede ser una barrera para los productores.

Estas afirmaciones son la **formulación inicial del problema**, no un estudio de mercado terminado. Faltan estadísticas verificadas de Arequipa, testimonios, magnitud de las pérdidas, causas priorizadas y comparación con alternativas actuales.

### 3.4. Misión, visión y valores del texto base

- **Misión propuesta:** acercar información geoespacial y agronómica comprensible a quienes toman decisiones sobre la tierra.
- **Visión propuesta:** consolidar una plataforma confiable, inclusiva y escalable para una agricultura más informada y resiliente.
- **Valores propuestos:** rigor científico, accesibilidad, transparencia, utilidad local y respeto por los datos de los usuarios.
- **Objetivo general propuesto:** desarrollar y validar una herramienta que integre datos ambientales y reglas agronómicas para comparar opciones de manejo y rotación por parcela.
- **Valor central propuesto:** transformar información dispersa en indicadores, mapas y explicaciones accionables.

Pendientes: validar la redacción con el equipo, fijar horizonte temporal, objetivos SMART, métricas, supuestos y resultados esperados. Preparar descripciones cortas de 50 y 150 palabras.

### 3.5. Alcance y límites

El primer alcance de P0 contempla parcelas de ejemplo, visualización climática/geoespacial y una comparación explicable de cultivos. Pronósticos precisos, ingresos estimados y alertas operativas requieren fuentes y validación adicionales.

TARPU se plantea como apoyo, no como sustitución de una evaluación agronómica. No se prometen rendimientos garantizados ni resultados de impacto sin pruebas. Esto forma parte del alcance del producto descrito, no de una evaluación de riesgos nueva añadida aquí.

## 4. Público, investigación y mercado

### 4.1. Segmentos planteados

| Segmento | Necesidad propuesta | Funciones que podrían aportar valor | Estado |
| --- | --- | --- | --- |
| Pequeños productores agrícolas | Información comprensible de su parcela desde el celular | Consulta básica, indicadores, explicaciones y alternativas de campaña | Hipótesis de público principal |
| Ingenieros agrónomos y asesores | Análisis detallado y seguimiento | Históricos, comparación de parcelas, reportes y escenarios | Segmento por validar |
| Cooperativas y asociaciones | Acompañar varios productores y consolidar información | Gestión de varias parcelas y reportes agregados | Segmento por validar |
| Empresas agrícolas e instituciones | Monitoreo de mayor escala e integración | Indicadores agregados, soporte, integraciones y servicios especializados | Posibles clientes; no acuerdos existentes |

Se debe separar **usuario**, **beneficiario**, **comprador** y **cliente pagador**. Podrían ser personas o entidades distintas. No se dispone de entrevistas ni evidencia suficiente de adopción o capacidad de pago.

### 4.2. Persona y tarea de referencia

P0 propone como ejemplo un productor que conoce su terreno, pero necesita comparar riesgos de nuevas campañas sin interpretar mapas científicos. Su tarea principal sería entender las condiciones de la parcela y decidir qué alternativa investigar o consultar con un técnico.

El ejemplo no es una persona entrevistada. Pendiente elaborar de dos a cuatro personas basadas en campo, Jobs To Be Done, mapa de experiencia y barreras reales.

### 4.3. Investigación requerida

- Contexto agrícola de Arequipa: principales cultivos, clima, riego, calendarios y riesgos.
- Segmentación geográfica, económica, productiva y tecnológica.
- Tamaño de las parcelas, idioma, alfabetización digital, conectividad y acceso a teléfonos.
- Decisiones actuales: qué se siembra, cuándo, con qué recursos y con qué fuentes de consejo.
- Árbol de problemas: causas, efectos, actores y prioridades.
- Entrevistas, encuestas, observaciones, consentimiento y registro de hallazgos.
- Alternativas actuales y competencia: servicios meteorológicos, visores satelitales y gestión agrícola.
- Comparación de cobertura, datos, facilidad, precio y confianza.
- Disposición a usar y pagar; necesidades de cada segmento; validación de beneficios.

La diferenciación propuesta es integrar fuentes y explicar rotaciones en lenguaje cotidiano. No afirmar que TARPU es único, superior o el primero sin comparación documentada.

## 5. Producto, UX/UI y branding

### 5.1. Visión funcional completa

Los diez módulos de A-DOC representan el catálogo de producto, **no diez entregables comprometidos para la hackathon**.

| Módulo | Contenido propuesto | Dependencias / estado |
| --- | --- | --- |
| Mis parcelas | Delimitación, ubicación, superficie e historial | Geometrías y registros del productor; propuesta |
| Monitor satelital | NDVI, vegetación y observaciones | Producto adecuado, fechas y calidad; propuesta |
| Clima y riesgos | Lluvia, temperatura, sequía y heladas | Distinguir histórico, observación y pronóstico; propuesta |
| Agua y suelo | Humedad estimada y propiedades edáficas | Escala y profundidad de datos; propuesta |
| Rotaciones | Secuencias, compatibilidad y alternativas | Historial y reglas agronómicas; propuesta |
| Simulador | Escenarios y prioridades del agricultor | Motor de evaluación validable; propuesta |
| Alertas | Notificaciones según riesgos y datos disponibles | Umbrales y condiciones operativas pendientes |
| Asistente | Explicaciones sencillas y voz | Resultados del backend como fuente; propuesta |
| Reportes | Análisis, exportación y trazabilidad | Contratos y formatos pendientes |
| Gestión | Usuarios, parcelas y organizaciones | Cuentas, permisos y multiusuario; alcance pendiente |

### 5.2. MVP planteado en el borrador

Identificar una parcela, consultar indicadores trazables, visualizar una capa geoespacial y comparar alternativas con reglas transparentes. Debe distinguirse lo implementado, lo simulado y lo futuro. Faltan prioridades finales, criterios de aceptación, exclusiones, dependencias y definición de terminado.

### 5.3. Preguntas que la experiencia aspira a ayudar a responder

En A-DEV se usa el caso hipotético de un agricultor de Arequipa que tiene papa y abre su parcela:

- ¿Cuánto ha llovido históricamente en esa zona?
- ¿Qué tan frecuentes han sido las heladas?
- ¿Cómo ha variado la humedad del suelo?
- ¿Qué comportamiento ha tenido la vegetación?
- ¿Qué cultivos podrían ser adecuados para la siguiente campaña?
- ¿Qué rotación representa menos riesgo climático?
- ¿Cuándo sería conveniente sembrar?
- ¿Qué información respalda la recomendación y qué incertidumbre tiene?

Son preguntas objetivo del producto. No demuestran que ya puedan responderse todas con las fuentes disponibles.

### 5.4. Relación entre pantallas y backend

| Pantalla propuesta | Información / presentación | Ejemplo histórico de endpoint |
| --- | --- | --- |
| Mi parcela | React + MapLibre; mapa base, GeoJSON del polígono, datos registrados e indicadores | `GET /api/parcelas/12` |
| Análisis satelital | Rásteres procesados, filtros de calidad y capas superpuestas | `GET /api/parcelas/12/capas/ndvi` |
| Clima histórico | Series y estadísticas; Plotly para tendencias, vacíos de datos y referencias | `GET /api/parcelas/12/clima` |
| Rotaciones inteligentes | De tres a cinco escenarios, puntajes, riesgos, períodos y explicaciones; ciclos visuales, tarjetas y gráficos | `POST /api/parcelas/12/simulaciones` |

Los paths y el identificador `12` son **ejemplos de contrato**, no endpoints comprobados ni una parcela real. Los mapas de calor, las capas, los diagramas de rotación y las tarjetas deberían representar un análisis específico, no solo adornar la interfaz.

### 5.5. Historia de usuario recuperada

> Como agricultor, quiero seleccionar mi parcela y ver las condiciones recientes para entender qué factores debo revisar antes de planificar la siguiente campaña.

Criterio ilustrativo: cada indicador muestra fecha, unidad, fuente y advertencia de resolución. Pendientes historias de registro, trazado, consulta, comparación, exportación y fallos de conexión.

### 5.6. Dirección visual que consta en P0

- Estética agritech con **verde y crema**.
- Mapas, planos vegetales y gráficos legibles.
- Componentes de alto contraste.
- Glasmorfismo moderado.
- Información crítica explicada también con texto, sin depender exclusivamente del color.

**No recuperado:** logos originales, tipografías, códigos de color, tokens, iconos, pantallas finales, navegación aprobada, archivos Figma ni diseños editables. A-DEV alude a mockups previos y dice que ya se había hablado de cómo se vería la app, pero esa alusión no permite reconstruirlos ni confirmar aprobaciones.

### 5.7. Requisitos y trabajo UX pendiente

Preparar arquitectura de información, menús y rutas; wireframes; sistema visual con colores, tipografía, componentes, iconos y estados; prototipos interactivos y pruebas. Definir lenguaje sencillo, idioma, legibilidad, navegación, tamaño táctil, diseño responsive, estados vacíos, errores, períodos sin datos y baja conectividad.

La voz es una posibilidad de accesibilidad y explicación; no consta que esté implementada. Cada pantalla debe corresponder a una necesidad del usuario y a datos efectivamente obtenibles.

### 5.8. Referencias visuales externas

Las respuestas pegadas incluían imágenes de agricultura y de aplicaciones ajenas. Se conservan los títulos y enlaces en la sección 17 como referencias de inspiración, no como diseños propios, usuarios entrevistados, socios ni evidencia de funcionalidades de TARPU. No se recuperaron las imágenes de posibles mockups originales.

## 6. Fuentes, APIs, formatos y calidad científica

### 6.1. Distinciones básicas del planteamiento

A-FUENTES distingue misión satelital, producto, plataforma de acceso y fuente complementaria. NASA POWER se presenta como plataforma que integra observaciones/modelos, no como un satélite individual. SoilGrids se incorpora como información complementaria de suelo. Sentinel-2, SoilGrids y EcoCrop no se presentan como fuentes NASA.

Las tablas siguientes conservan las alternativas históricas. **Producto, versión, bandas, resolución, latencia, cobertura, autenticación, disponibilidad y formato deben comprobarse antes de implementar.** No asumir una API homogénea ni que todos los proveedores entregan un indicador listo en JSON.

### 6.2. Matriz completa de fuentes recuperada

| Fuente / misión | Variables y usos propuestos | Acceso mencionado | Formatos mencionados, condicionados al producto/servicio | Manejo propuesto |
| --- | --- | --- | --- | --- |
| NASA POWER | Temperatura media/máxima/mínima, radiación solar, humedad relativa y meteorología; históricos climáticos | POWER Daily API por latitud, longitud y fechas | JSON, CSV, ASCII; otro párrafo también menciona NetCDF | Python, `requests`, `pandas`; normalizar series, indicadores y gráficos |
| GPM — IMERG | Precipitación, acumulados, intensidad, anomalías, variabilidad y patrones de sequía | GES DISC, Earthdata, servicios de subconjuntos | HDF5, NetCDF4 y otras salidas según servicio | `xarray`, `h5py`, `rioxarray`; extraer área y calcular acumulados |
| SMAP | Humedad superficial estimada y variación temporal; contexto regional | Earthdata/NSIDC, CMR y descargas | HDF5, NetCDF según producto | `h5py`, `xarray`; extraer celdas e indicadores regionales |
| MODIS — Terra/Aqua | NDVI, EVI, temperatura superficial, cobertura terrestre y evolución vegetal | AppEEARS o Earthdata | GeoTIFF, NetCDF4, HDF según producto/salida | `rasterio`, `xarray`, `numpy`; filtrar calidad y analizar índices |
| VIIRS — Suomi NPP / NOAA-20 | Índices de vegetación y observaciones de superficie; complemento/alternativa MODIS | AppEEARS / Earthdata | HDF5, GeoTIFF, NetCDF según producto/salida | Rásteres y series temporales |
| Landsat 8/9 — USGS/NASA | NDVI con mayor detalle y cambios de cobertura/vegetación | USGS M2M, LandsatLook o catálogos STAC compatibles | GeoTIFF/COG y metadatos JSON | `rasterio`, `numpy`; bandas, nubes, NDVI y recorte por parcela |
| Sentinel-2 — ESA/Copernicus | NDVI, vigor vegetal y cambios dentro de la parcela cuando la resolución lo permite | Copernicus Data Space, STAC y servicios de procesamiento | JPEG2000; GeoTIFF/COG según acceso | `rasterio`, `rioxarray`; bandas, índices y capas visuales |
| SoilGrids — ISRIC | Textura, carbono orgánico, pH y propiedades estimadas por profundidad | Mapas descargables y servicios OGC disponibles | GeoTIFF/COG y respuestas geoespaciales | `rasterio`, `geopandas`; extraer valores por parcela/profundidad |
| FAO EcoCrop | Requerimientos de temperatura, lluvia y crecimiento de cultivos | Dataset FAO, descarga/importación según disponibilidad | Tabulares según distribución | Normalizar catálogo en PostgreSQL para compatibilidad agronómica |

No se han seleccionado identificadores exactos de productos ni se han confirmado todas las modalidades de acceso. Las operaciones de «calcular índices» o «extraer por parcela» requieren una especificación por producto; esta tabla no es un conector implementado.

### 6.3. Prioridades y dificultad propuestas

| Fuente | Prioridad histórica sugerida | Dificultad estimada en el chat | Motivo de la propuesta |
| --- | --- | --- | --- |
| NASA POWER | Alta | Baja | Consulta directa y series fáciles de procesar |
| GPM IMERG | Alta | Media | Análisis de precipitación |
| Sentinel-2 | Alta | Media-alta | Detalle espacial de vegetación |
| MODIS / VIIRS | Media | Media | Históricos y comparación regional |
| SMAP | Media | Media-alta | Humedad regional; limitación para parcelas pequeñas |
| SoilGrids | Alta | Media | Compatibilidad de suelo |
| Landsat 8/9 | Media | Media-alta | Complemento de vegetación |
| FAO EcoCrop | Alta | Media | Requerimientos de cultivos |

Estas prioridades son una recomendación del asistente, no una planificación aprobada ni una estimación de esfuerzo medida.

### 6.4. Selección inicial recomendada

A-FUENTES propone cuatro integraciones: **POWER para clima, IMERG para precipitación, Sentinel-2 para vegetación y SoilGrids para suelo**. En paralelo, catálogo agronómico e historial del productor. SMAP, MODIS, VIIRS y Landsat quedan como ampliaciones progresivas.

Esto describe un **MVP ampliado propuesto**. A-DEV recomienda primero demostrar un único recorrido con POWER. Son niveles distintos de avance, no evidencia de cuatro conectores ya hechos.

### 6.5. Formatos y transformaciones del planteamiento

| Formato | Contenido descrito | Herramientas propuestas | Destino propuesto |
| --- | --- | --- | --- |
| JSON | Fechas, valores, estructuras y metadatos | `requests`, `pandas` | SQL e interfaz JSON de TARPU |
| CSV | Series tabulares | `pandas` | Observaciones y estadísticas |
| ASCII | Salida mencionada para POWER | Método no desarrollado | Pendiente especificar lector y normalización |
| HDF5 | Conjuntos científicos multidimensionales | `h5py`, `xarray` | Subconjuntos, series y rásteres |
| NetCDF / NetCDF4 | Variables con dimensiones espaciales/temporales | `xarray`, `netCDF4` | Indicadores, series y capas |
| GeoTIFF / COG | Ráster georreferenciado con valores por píxel | `rasterio`, `rioxarray` | Estadísticas zonales, mapas y teselas |
| JPEG2000 | Bandas de imágenes, como Sentinel-2 | `rasterio`, GDAL | Índices, composiciones y capas procesadas |
| GeoJSON | Puntos y polígonos | `geopandas`, `shapely` | Parcelas y geometrías de MapLibre |
| STAC JSON | Catálogo de escenas, fechas, cobertura y enlaces | `pystac-client` | Descubrir y seleccionar activos a descargar |

Ejemplo conceptual recuperado: GeoTIFF con valores NDVI → Python recorta y analiza → capa visual en MapLibre. Primero se conservan los valores numéricos y se calculan estadísticas; luego se aplica una escala de color. El catálogo STAC se mencionó para localizar escenas, no como sustituto de todos sus archivos.

La escala visual de NDVI de la respuesta era demostrativa. Su interpretación real depende del producto, estación, cultivo y umbrales. No se recuperaron colores ni cortes numéricos aprobados.

### 6.6. Acceso, autenticación y disponibilidad

A-FUENTES indica que algunos productos NASA requieren cuenta Earthdata y autenticación, mientras que POWER permite consultas públicas. Debe comprobarse por servicio/producto; no se recuperaron cuentas ni credenciales del equipo.

La respuesta histórica también afirma que la **API REST de SoilGrids estaba temporalmente pausada** y recomienda descargas geoespaciales alternativas. Se preserva como afirmación de ese texto, **no como comprobación de su estado actual**. La planificación propuesta evitaba depender de esa API para producción.

A-DEV recoge una advertencia de POWER sobre solicitudes redundantes a la misma celda y plantea almacenar/reutilizar resultados. No se preservó una cuota numérica ni una política vigente validada; deben consultarse antes de operar.

### 6.7. Escala, incertidumbre y límites

- Una parcela dibujada con precisión no vuelve precisas todas las fuentes a esa escala.
- El ejemplo de A-DEV habla de una parcela hipotética de **2 hectáreas** y de una cuadrícula IMERG de aproximadamente **10 km × 10 km**. Esa cifra se conserva como aproximación explicativa histórica, no como especificación definitiva del producto seleccionado.
- Distinguir **datos regionales**, **datos de mayor detalle espacial** y **datos declarados por el productor**.
- La humedad satelital estimada no es una medición directa completa del terreno.
- NDVI no mide por sí solo fertilidad.
- Temperatura satelital o regional no equivale a una helada confirmada a nivel de planta.
- Datos históricos no son pronósticos.
- Un indicador observado, una estimación, una predicción y una recomendación son objetos distintos y deben presentarse como tales.

### 6.8. Trazabilidad y matriz técnica pendiente

Cada resultado debería conservar fuente, producto, versión, fecha de observación, fecha de procesamiento, unidad, resolución espacial y calidad. Se deben documentar cobertura, latencia, profundidad cuando aplique, máscaras de nubes, valores ausentes, incertidumbre y comparación con campo.

La matriz técnica propuesta como siguiente paso debe unir **variable visible → fuente → producto → resolución → frecuencia → acceso → formato → procesamiento → almacenamiento → endpoint → componente visual**. Añadir autenticación, cuotas, fallos, caché, reintentos, ejemplo de respuesta y prueba reproducible.

## 7. Arquitectura, backend y flujo de datos

### 7.1. Arquitectura propuesta, no implementada

```text
Fuentes externas + catálogo agronómico + datos del productor
             |
             v
Conectores Python / consultas / descargas / ingesta programada
             |
             v
Validación -> limpieza -> normalización -> análisis geoespacial
             |
             +--> PostgreSQL + PostGIS: parcelas, series e indicadores
             +--> Archivos/objetos: originales y rásteres pesados
             +--> Redis: caché/colas, solo si se necesita
             |
             v
Motor TARPU: indicadores -> riesgos -> reglas -> escenarios explicados
             |
             v
API TARPU / FastAPI: JSON y servicios geoespaciales
             |
             +--> Web móvil y dashboard React
             +--> MapLibre / gráficos Plotly
             +--> Asistente de voz: explica resultados existentes
             +--> Android con Kotlin: evolución futura
```

Este esquema es una reorganización textual de A-DEV y A-FUENTES. No fija despliegue, microservicios, topología de red ni proveedor de nube.

### 7.2. Tecnologías mencionadas y función prevista

| Capa | Propuesta | Condición / estado |
| --- | --- | --- |
| Frontend | React | Web móvil y dashboard; sin código recuperado |
| Mapas | MapLibre | Polígonos, capas y leyendas |
| Gráficos | Plotly | Series de clima y tendencias |
| API | Python / FastAPI / OpenAPI | Contratos y documentación; por definir |
| Ingesta y tabulares | `requests`, `pandas`, Earthaccess | Según proveedor; selección por conector pendiente |
| Multidimensional | `xarray`, `h5py`, `netCDF4` | Depende de producto y formato |
| Geoespacial | `rasterio`, `rioxarray`, `geopandas`, `shapely`, GDAL, `numpy` | Procesamiento de bandas, geometrías y estadísticas |
| Catálogos | STAC / `pystac-client` | Búsqueda de escenas |
| Persistencia | PostgreSQL + PostGIS | Base principal propuesta |
| Archivos | Almacenamiento de archivos u objetos | Proveedor, rutas y retención sin decidir |
| Caché / tareas | Redis, Celery o RQ | Opcionales cuando el procesamiento lo requiera |
| Android | Kotlin | Futuro; API reutilizable |
| Contenedores y automatización | Docker y CI/CD | Documentación/configuración pendiente |

No se recuperaron versiones fijadas, decisiones ADR aprobadas, repositorios operativos ni proveedor de hosting.

### 7.3. Responsabilidad del backend

El frontend consultaría la API propia de TARPU en lugar de llamar a todos los proveedores cada vez que se abre una parcela. El backend permitiría controlar transformaciones, conservar procedencia, reutilizar datos y evitar procesar repetidamente grandes volúmenes.

No todo se descargaría en tiempo real: habría datos actualizados periódicamente, indicadores precalculados y análisis bajo demanda. La política concreta de actualización/caché está pendiente.

### 7.4. Ejemplo histórico de conexión a NASA POWER

**Ejemplo didáctico no ejecutado.** Se reconstruyeron los saltos de línea del código pegado por el usuario, que llegaron concatenados. No se añadieron credenciales ni se verificó una respuesta real.

```python
import requests

url = "https://power.larc.nasa.gov/api/temporal/daily/point"
params = {
    "latitude": -16.40,
    "longitude": -71.54,
    "start": "20250101",
    "end": "20251231",
    "community": "AG",
    "parameters": "T2M,T2M_MAX,T2M_MIN",
    "format": "JSON",
}

response = requests.get(url, params=params, timeout=60)
response.raise_for_status()
data = response.json()
temperaturas = data["properties"]["parameter"]
print(temperaturas["T2M"])
```

Las coordenadas `-16.40, -71.54` son ilustrativas, cercanas a Arequipa; no representan una parcela identificada del proyecto. El rango `20250101`–`20251231`, los parámetros y el timeout son parte del ejemplo, no una configuración aprobada para producción.

Flujo explicado: respuesta de POWER → convertir fechas y detectar valores inválidos → calcular indicadores → almacenar series/resultados reutilizables → FastAPI → React. Faltan validaciones de unidades, metadatos, errores, faltantes y condiciones del servicio.

### 7.5. Pipeline geoespacial

Secuencia de P0: descubrir/descargar producto → validar metadatos → reproyectar cuando corresponda → aplicar calidad → recortar o agregar espacialmente → calcular indicadores → publicar resultados.

Pendientes: CRS/SRID, tamaño de píxel, escala de análisis, formatos intermedios, versionado, costo, idempotencia del procesamiento a definir, reintentos y pruebas. La idempotencia es una pregunta de implementación de esta consolidación; los demás elementos constan en P0/A-DOC.

### 7.6. API y contratos

Recursos iniciales mencionados: parcelas, clima, capas, indicadores y simulaciones. A-DOC propone documentar métodos HTTP, parámetros, respuestas, errores, autenticación y autorización. FastAPI/OpenAPI sería la base del catálogo, con ejemplos reales cuando existan.

Pendientes: esquemas concretos, códigos de error, permisos por parcela, paginación, límites, pruebas y ejemplos ejecutados. Los paths de la sección 5 son ilustrativos.

### 7.7. Trabajos asíncronos

1. El usuario selecciona parcela y prioridades y solicita un análisis.
2. FastAPI crea un trabajo y devuelve identificador/estado de procesamiento.
3. Un worker Python consulta fuentes, reutiliza caché y calcula indicadores.
4. El frontend consulta el estado y muestra resultados disponibles.

Redis con Celery o RQ aparece como alternativa si los tiempos de descarga/procesamiento lo exigen. A-DEV propone también precalcular indicadores regionales de Arequipa y actualizarlos periódicamente.

**Matiz importante:** Redis aparece en el esquema conceptual, pero el mismo texto recomienda no introducir MongoDB, PostgreSQL y Redis simultáneamente al comienzo. El mínimo sugerido es PostgreSQL/PostGIS más archivos; Redis se agrega por necesidad. MongoDB no se descarta por principio: se supedita a una necesidad concreta aún no identificada.

## 8. Base de datos y almacenamiento

### 8.1. Propuesta principal

PostgreSQL + PostGIS para cuentas, geometrías, series e indicadores. El texto atribuye a PostGIS consultas de intersecciones, distancias, áreas y asociación espacial entre datos y parcelas.

Los archivos grandes, como GeoTIFF o NetCDF, se mantendrían fuera de la base relacional, en archivos u objetos, guardando sus referencias en PostgreSQL. P0 mantiene el mismo criterio para rásteres pesados.

### 8.2. Tablas iniciales propuestas en A-DEV

| Tabla | Contenido previsto | Lo que no está definido |
| --- | --- | --- |
| `usuarios` | Cuentas y preferencias | Campos, proveedor de identidad y roles |
| `parcelas` | Nombre, superficie, ubicación y polígono | SRID, restricciones y propiedad |
| `cultivos` | Catálogo y requerimientos agronómicos | Fuente exacta, unidades y versión |
| `campanas` | Historial de siembras por parcela | Modelo temporal y datos obligatorios |
| `fuentes_datos` | Producto, versión, resolución y procedencia | Identificadores y relaciones |
| `observaciones` | Variables y series temporales | Granularidad y normalización |
| `indicadores` | Resultados por parcela y período | Fórmulas/versionado del cálculo |
| `escenarios_rotacion` | Alternativas evaluadas | Secuencias y restricciones |
| `evaluaciones` | Puntajes, riesgos e incertidumbre | Escalas, pesos y validación |
| `recomendaciones` | Resultados y explicaciones | Reglas de publicación y trazabilidad |

P0 usa además «simulaciones» como entidad general. No se debe deducir que exista otra tabla aprobada ni que haya un esquema relacional final.

Los nombres anteriores son literales de la propuesta. La columna de indefiniciones organiza los pendientes; no describe una base existente.

### 8.3. Datos declarados por el productor

Cultivo actual, fecha de siembra, disponibilidad de riego, historial de cultivos y otras condiciones locales. Son importantes para compensar límites de observación y contextualizar la comparación.

No se recuperaron formularios definitivos, registros reales ni política de validación de esa información.

### 8.4. Documentación pendiente

Modelo entidad-relación, diccionario de campos/tipos, restricciones y relaciones; modelo espacial con geometrías y SRID; índices espaciales; migraciones; retención; respaldo y recuperación. Falta decidir cómo conservar versiones de producto, reglas y resultados de forma reproducible.

## 9. Motor agronómico, recomendaciones y voz

### 9.1. Tres niveles de transformación

| Nivel | Contenido propuesto | Ejemplos |
| --- | --- | --- |
| 1. Originales | Datos con fuente, fecha, resolución y calidad | Temperatura diaria, lluvia, humedad estimada, vegetación, suelo |
| 2. Indicadores | Cálculos que resumen e interpretan las series | Lluvia acumulada, anomalías, frecuencia de frío, tendencia NDVI, déficit hídrico estimado, compatibilidad climática |
| 3. Recomendaciones | Comparar opciones y explicarlas | Cultivos, secuencias, riesgos, ventanas de siembra, ventajas y limitaciones |

No se recuperaron ecuaciones, datasets de calibración ni umbrales científicos aprobados. «Déficit hídrico estimado» es un indicador candidato, no una variable demostrada como calculable con los datos ya integrados.

### 9.2. Factores propuestos para rotación

Cultivo previo, secuencias de campañas anteriores, familia botánica, agua/riego, clima, suelo, duración de campaña, posibles efectos sobre el suelo y objetivos del agricultor. La comparación no debe reducirse a escoger una especie siguiente sin considerar contexto e historial.

Se propone empezar con reglas transparentes y puntuaciones justificables. Machine Learning podría incorporarse después, cuando existan datos adecuados para entrenamiento y validación. No hay un modelo entrenado ni se plantea IA predictiva como requisito para que el primer prototipo sea útil.

### 9.3. Simulador conceptual recuperado

Caso ficticio: productor con papa que quiere ahorrar agua. La demostración mostraba prioridades modificables:

| Criterio | Peso ilustrativo |
| --- | ---: |
| Disponibilidad de agua | 35 |
| Compatibilidad climática | 25 |
| Conservación del suelo | 25 |
| Rentabilidad estimada | 15 |

| Orden ilustrativo | Secuencia | Puntaje ficticio |
| --- | --- | ---: |
| 1 | Papa → Quinua | 79/100 |
| 2 | Papa → Haba | 73/100 |
| 3 | Papa → Cebada | 71/100 |

**Estos números fueron inventados para demostrar el cambio de orden al ajustar prioridades. No son recomendaciones agronómicas, probabilidades, resultados calculados ni estimaciones reales de riesgo.** No se recuperó la fórmula del simulador. La rentabilidad requeriría precios, costos y rendimientos esperados adicionales.

### 9.4. Respuesta JSON ficticia del ejemplo de API

```json
{
  "parcela_id": 12,
  "estado": "completado",
  "prioridad": "ahorrar_agua",
  "alternativas": [
    {
      "cultivo_siguiente": "quinua",
      "puntaje": 82,
      "riesgo": "bajo",
      "ventana_siembra": {
        "inicio": "2027-01-01",
        "fin": "2027-02-15"
      },
      "explicacion": "Texto generado por el motor",
      "confianza": "media"
    }
  ],
  "actualizado_en": "2026-10-18"
}
```

Todos los valores, fechas y textos son ilustrativos. `Texto generado por el motor` es un **placeholder** explícito. El puntaje `82` pertenece a este ejemplo y el `79` al simulador anterior: no intentar reconciliarlos ni deducir una modificación real del algoritmo. «Confianza media» y «riesgo bajo» no tienen una escala validada recuperada.

El ejemplo ilustra separación de responsabilidades: el backend entrega estructura y el frontend decide si la presenta en tarjeta, gráfico o diagrama. Esa API podría reutilizarse en Android/Kotlin en el futuro.

### 9.5. Pasado, presente reciente y futuro

| Capacidad | Insumos planteados | Límite |
| --- | --- | --- |
| Analizar el pasado | Históricos satelitales/meteorológicos | No equivale a predicción |
| Describir condiciones recientes | Observaciones con latencias propias | No equivale siempre a tiempo real |
| Estimar lo que podría suceder | Pronósticos, escenarios climáticos o modelos adicionales | Fuentes y validación pendientes |

POWER, GPM, SMAP y MODIS no se presentaron como un sistema completo de pronóstico agrícola. Las ventanas de siembra requerirían climatología, requisitos de cultivo y pronósticos cuando corresponda. Ingresos y rentabilidad exigirían información económica adicional. Evitar prometer desde el prototipo cosechas, heladas o rentabilidad precisas.

### 9.6. Asistente de voz

El asistente propuesto **explica evaluaciones del backend**; no produce una recomendación independiente sin apoyo. Flujo de ejemplo:

1. El agricultor pregunta: «¿Por qué me recomiendas sembrar quinua?».
2. El sistema identifica la parcela activa y consulta su evaluación.
3. Se entrega al modelo de lenguaje contexto estructurado: variables, riesgos, prioridades y explicación agronómica.
4. El modelo convierte esos resultados en lenguaje sencillo.
5. La síntesis de voz reproduce la explicación.
6. Si faltan datos, el sistema comunica esa insuficiencia.

No se seleccionaron proveedor, modelo, reconocimiento de voz, sintetizador, idioma final, costo ni política operativa. La pregunta de quinua es ilustrativa, no una recomendación vigente.

## 10. Roadmap, MVP y orden de construcción

### 10.1. Roadmap estratégico de cuatro fases

| Fase propuesta | Contenido | Estado |
| --- | --- | --- |
| 1. Hackathon / MVP | Parcelas de ejemplo, datos reales, indicadores climáticos/satelitales, mapa y demostración fundamentada de recomendaciones | Por delimitar y ejecutar |
| 2. Validación piloto | Agricultores y agrónomos, usabilidad, calibración y evaluación | Sin participantes/resultados recuperados |
| 3. Producto funcional | Cuentas, múltiples parcelas, automatización, historial, alertas y reportes | Visión futura |
| 4. Escalamiento | Regiones, organizaciones, integraciones, servicios comerciales y análisis avanzados | Visión futura |

Faltan fechas, responsables, presupuesto, dependencias, hitos y criterios de salida. La mención de 2026 no es un calendario de implementación aprobado.

### 10.2. Secuencia técnica de cinco pasos de A-DEV

1. **Clima real primero:** FastAPI conectado a POWER, PostgreSQL, coordenadas y gráficos históricos en React.
2. **Gestión geoespacial:** polígonos en PostGIS, parcelas en MapLibre y asociación de datos por ubicación.
3. **Capas satelitales:** GPM y productos de vegetación/humedad, procesamiento ráster y capas temáticas.
4. **Motor agronómico:** catálogo, compatibilidad, historial, prioridades y puntuaciones explicables.
5. **Experiencia ampliada:** escenarios, reportes, voz, caché, tareas asíncronas y posteriormente Android.

La condición de incorporar colas depende del tiempo real de procesamiento; esta lista no exige esperar al último paso si una integración previa ya las necesita.

### 10.3. Primer recorrido completo recomendado

**Parcela de ejemplo en Arequipa → consulta POWER → procesamiento Python → PostgreSQL → FastAPI → gráfico React.**

Se propuso como siguiente prueba para establecer una base reutilizable antes de sumar fuentes. No consta que se haya ejecutado. Antes del backend completo, se recomendó completar la matriz técnica de integración descrita en la sección 6.8.

### 10.4. Hackathon y continuidad

La entrega debería explicar problema, público, solución, uso real de datos espaciales, metodología, demo, límites y siguientes pasos. Preparar submission, pitch deck, guion, video/capturas, repositorio y evidencia de resultados reales. Confirmar los requisitos oficiales del evento antes de cerrar materiales; no se recuperaron reglas ni fechas oficiales verificadas.

Después: investigación aplicada o potencial emprendimiento, validación con usuarios, alianzas, sostenibilidad, roles, propiedad intelectual y financiamiento. No hay compromisos de aliados ni financiación confirmados.

## 11. Modelo de negocio y sostenibilidad

### 11.1. Requisito del usuario y pregunta central

El **modelo de negocio es un apartado requerido explícitamente por el usuario**. La propuesta es tratarlo como área estratégica completa: cómo generar valor para productores y sostener económicamente TARPU después de la hackathon.

### 11.2. Hipótesis comercial y planes tentativos

Freemium + B2B/B2G: acceso esencial para pequeños productores y servicios avanzados para técnicos, organizaciones e instituciones.

| Nombre tentativo | Público / propuesta de valor | Condición |
| --- | --- | --- |
| Tarpu Campo | Gratuito: consulta de parcela, indicadores básicos, alertas disponibles y recomendaciones iniciales | Hipótesis de plan y nombre; alcance sin aprobar |
| Tarpu Pro | Técnicos: varias parcelas, comparativas, reportes y escenarios | Funciones, límites y precio pendientes |
| Tarpu Organizaciones | Cooperativas, empresas e instituciones: multiusuario, agregados, soporte e integraciones | Sin contrato ni cliente validado |
| Tarpu Institucional | Proyectos con gobiernos locales, programas agrícolas y desarrollo rural | Posibilidad B2G; sin acuerdo existente |

Los dos últimos planes pueden solaparse; no se recuperó una definición comercial que los diferencie definitivamente. No se han fijado precios ni proyecciones de ingresos.

### 11.3. Business Model Canvas inicial

| Bloque | Contenido propuesto |
| --- | --- |
| Segmentos | Productores, técnicos y organizaciones |
| Propuesta de valor | Indicadores comprensibles y escenarios de rotación |
| Canales | Web móvil, alianzas y capacitación |
| Relaciones | Autoservicio acompañado y soporte |
| Recursos | Equipo, datos, motor agronómico e infraestructura |
| Actividades | Integrar, validar y explicar datos |
| Socios | Especialistas, cooperativas y entidades de datos; universidades y actores agrícolas por explorar |
| Costos | Desarrollo, nube, almacenamiento, procesamiento, soporte, operación y validación |
| Ingresos | Suscripciones, servicios/contratos institucionales, posibles licencias y alianzas |

Todos los bloques son iniciales y requieren contraste con evidencia. La presencia de una entidad como «socio potencial» no implica relación establecida.

### 11.4. Value Proposition Canvas

Trabajos: planificar campañas y gestionar riesgos. Dolores: incertidumbre, información dispersa y herramientas complejas. Ganancias esperadas: claridad, ahorro de tiempo y explicaciones. Respuesta propuesta: mapas, comparación y reportes contextualizados.

Pendiente cuantificar prioridades por segmento y comprobar beneficios en pruebas, diferenciando necesidades del usuario, comprador y beneficiario.

### 11.5. Mercado, costos y modelo financiero

Documentar TAM/SAM/SOM con poblaciones, superficies, supuestos y fuentes verificables. Estudiar precios según disposición de pago y costos de consultas, parcelas y procesamiento. Incluir costo por usuario, costo por parcela, CAC, LTV, margen, escenarios y sensibilidad.

A-DOC propone un modelo financiero editable para simular usuarios, costos y crecimiento. **No se recuperó ese archivo ni cifras calculadas.** No inventar mercado, CAC, LTV, margen o ingresos para llenar casillas.

### 11.6. Go-to-market y dimensión social

Ruta posible: piloto con productores/asesores de una zona de Arequipa → iteración → cooperativas e instituciones. Explorar universidades y organizaciones agrícolas como aliados. Definir canales, retención, capacitación, soporte, presupuesto y responsables.

Riesgos comerciales señalados: beneficio poco percibido, complejidad, conectividad, confianza, competencia, adopción y sostenibilidad. Se propone compatibilizar viabilidad comercial con acceso a funciones esenciales para pequeños productores; esto es una intención de diseño comercial, no impacto demostrado.

## 12. Documentación integral y organización del trabajo

### 12.1. Expectativa del usuario

La documentación debe ir más allá de presentar la hackathon: servir para construir la app, incorporar integrantes, presentarla a instituciones, buscar financiamiento y evaluar un emprendimiento. El usuario pidió texto base desarrollado y subpuntos pendientes visibles, y anteriormente solicitó versiones `.tex` y `.md` con el mismo contenido.

Esta entrega es el **archivo de contexto `.md` solicitado ahora**. No supone que se hayan recuperado los archivos originales `.tex` y `.md`. El PDF local conserva una redacción fundacional relacionada, con sus propias advertencias.

### 12.2. Las ocho áreas propuestas

#### Área 1. Identidad, visión y fundamentos

| Documento | Contenido |
| --- | --- |
| Project Overview / presentación | Qué es TARPU, qué hace, a quién ayuda y propuesta principal |
| Problem Statement | Problema agrícola, Arequipa y consecuencias |
| Justificación | Necesidad de la solución y relevancia satelital |
| Misión, visión y valores | Propósito y crecimiento |
| Objetivos | General, específicos y resultados esperados |
| Propuesta de valor | Beneficio concreto para el agricultor |
| Alcance y limitaciones | Qué resolverá y qué queda fuera |
| Glosario | NDVI, humedad, rotación, API, resolución y conceptos asociados |

Añadir origen del nombre, identidad visual y relación TARPU/QENTARA. Esos detalles deben investigarse o recuperarse, no inventarse.

#### Área 2. Investigación, problema y público

Contexto agrícola; análisis de causas/efectos/actores; segmentación; User Personas; Jobs To Be Done; Customer Journey Map; competencia; investigación de campo; validación de necesidades. Separar hipótesis de hallazgos comprobados.

#### Área 3. Negocio y viabilidad

Business Model Canvas; Value Proposition Canvas; segmentación de clientes; análisis TAM/SAM/SOM; ingresos; precios; costos; Unit Economics; Go-To-Market; alianzas; riesgos comerciales; impacto social y modelo financiero editable.

#### Área 4. Producto y UX

PRD; definición de MVP; catálogo de funcionalidades; historias con aceptación; flujos; arquitectura de información; wireframes; sistema UI; accesibilidad/usabilidad; prototipos y pruebas UX. Producto, datos disponibles y capacidad del equipo deben evolucionar juntos.

#### Área 5. Ciencia, satélites y agronomía

Catálogo de fuentes; matriz de integración; diccionario de variables con unidad/origen/significado; metodología de indicadores; metodología de rotaciones; modelo de riesgos con umbrales/pesos/incertidumbre; calidad y validación; límites científicos; bibliografía técnica y científica.

Un resultado como «riesgo climático medio» debe poder reconstruirse desde entradas, método y reglas. Esta frase es un ejemplo de exigencia de trazabilidad, no una clasificación disponible.

#### Área 6. Ingeniería y desarrollo DEV

| Subárea | Documentos / contenido previsto |
| --- | --- |
| A. Arquitectura | System Architecture; C4 de contexto/contenedores/componentes; stack y justificación; ADR; requisitos no funcionales de rendimiento, disponibilidad, seguridad y escalabilidad |
| B. Backend/API | Backend Architecture; API Specification con métodos/parámetros/respuestas/errores; autenticación/autorización; lógica de negocio; background jobs; manejo de errores/logging; OpenAPI y ejemplos reales |
| C. Datos e integración | Data Architecture; ingesta; limpieza/reproyección/recortes/agregaciones; procesamiento geoespacial; procedencia/versión/fecha/calidad; frecuencias de actualización y caché |
| D. Base de datos | Modelo ER; diccionario con tipos/restricciones/relaciones; modelo espacial/SRID/índices/consultas; migraciones; backup y recuperación |
| E. Frontend | Componentes/rutas/carpetas; librería reutilizable; estado de parcelas/filtros/consultas; integración API; MapLibre/capas/polígonos/leyendas; gráficos/unidades/incertidumbre |
| F. Calidad y operación | Estrategia de pruebas; seguridad/secretos/permisos; setup local; Docker; CI/CD; guía de despliegue y entornos; monitoreo/logs/métricas/alertas operativas; contribución/ramas/commits/PR |

La documentación técnica debe permitir a otro desarrollador comprender el sistema, configurar el entorno y contribuir. No se propone escribir todos los documentos antes de programar: deben evolucionar junto con las decisiones y el código.

#### Área 7. Validación, resultados e impacto

Plan de validación; pruebas de usabilidad; validación agronómica; evaluación técnica; indicadores de impacto; piloto; limitaciones y aprendizajes. Definir participantes, método y criterios antes de interpretar resultados.

#### Área 8. Estrategia, roadmap y hackathon

Product Roadmap; hitos técnicos/científicos/comerciales; gestión de tareas; registro de riesgos; submission; pitch deck; guion de demo; evidencia (capturas, video, resultados y repositorio); plan poshackathon.

### 12.3. Organización híbrida sugerida

**Notion:** estrategia, investigación, negocio, producto y gestión. **GitHub:** documentación técnica versionada junto con código. La propuesta busca una fuente de verdad por tema y evitar copias contradictorias. No consta que estos espacios existan ni se recuperaron URLs.

Índice propuesto para Notion:

```text
00 · Inicio y visión general
01 · Investigación y mercado
02 · Modelo de negocio
03 · Producto y experiencia UX
04 · Ciencia y metodología
05 · Ingeniería — índice técnico
06 · Validación e impacto
07 · Roadmap y gestión
08 · NASA Space Apps — Entregables
09 · Referencias y recursos
```

Árbol propuesto para GitHub; **no es un inventario de archivos existentes**:

```text
tarpu/
├── apps/
│   ├── web/
│   └── api/
├── packages/
├── pipelines/
├── tests/
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   ├── data-sources/
│   ├── processing/
│   ├── recommendations/
│   ├── security/
│   ├── testing/
│   └── deployment/
├── infrastructure/
├── README.md
└── CONTRIBUTING.md
```

### 12.4. Catorce documentos fundacionales priorizados

1. Project Overview.
2. Problem Statement y justificación.
3. Público objetivo y User Personas.
4. Business Model Canvas.
5. Propuesta de valor.
6. Product Requirements Document.
7. MVP Scope y User Stories.
8. Fuentes de datos y metodología.
9. Arquitectura de software.
10. Diseño de base de datos.
11. Especificación de API.
12. Plan de validación.
13. Roadmap y riesgos.
14. Pitch y demostración.

El bloque interactivo copiado decía «0 de 14 documentos completados», incluía filtros «Todos / Prioridad alta / Prioridad media» y «Reiniciar». Son elementos de aquella presentación, no un conteo verificado del avance actual. En el texto pegado la etiqueta «Alta» es visible hasta Arquitectura; no se reconstruyen las prioridades que no quedaron inequívocas para las otras filas.

Orden narrativo recomendado: identidad/problema → negocio → PRD y arquitectura en conjunto → metodología científica y validación. La estructura completa podría superar 50 documentos; no se propone redactarlos todos de inmediato.

### 12.5. Gobierno documental

Cada documento debería tener responsable, versión, fecha, referencias y estado: borrador, en revisión o validado. Distinguir decisiones aprobadas, hipótesis, simulaciones y funciones futuras. Mantener registro de cambios y actualizar documentación con cada cambio relevante.

P0 incluye una matriz inicial para Project Overview, Canvas, PRD/MVP, fuentes/metodología y arquitectura/API: responsables por asignar; evidencia pendiente; revisión por definir; estados de borrador/hipótesis/investigación/propuesta. No hay responsables nominados.

## 13. Validación, impacto, seguridad y operación

### 13.1. Hipótesis de validación

P0 plantea comprobar que un usuario pueda identificar condiciones relevantes de su parcela y entender por qué se sugiere una alternativa. Evaluar tareas observables, no solo opiniones generales.

Pendientes: muestra, consentimiento, tareas, métricas, protocolo, criterios de éxito y registro de resultados. No hay entrevistas ni pruebas terminadas recuperadas.

### 13.2. Validación técnica y agronómica

Comparar indicadores con referencias cuando existan, revisar cálculos y pedir evaluación a agrónomos. Medir por separado **calidad del dato** y **calidad de la recomendación**. Definir datasets, casos límite, evaluadores, métricas de error y resultados.

La evaluación técnica propuesta incluye tiempos de respuesta, errores, disponibilidad y rendimiento. Las pruebas planteadas cubren cálculos, conectores, API, integración y recorridos críticos de extremo a extremo.

### 13.3. Impacto

Indicadores candidatos: comprensión, tiempo para encontrar información, adopción, uso recurrente y decisiones apoyadas. Ahorro de agua, aumento de rendimiento y reducción de pérdidas son **objetivos/hipótesis**, no resultados demostrados.

Pendiente piloto con línea base, seguimiento, limitaciones, aprendizaje y plan de mejora. No hay porcentajes de impacto validados.

### 13.4. Seguridad y operación propuestas

Autenticación, autorización por parcela, acceso controlado, secretos fuera del repositorio, logs sin información sensible y copias de seguridad. Documentar entornos, Docker, CI/CD, monitoreo, recuperación, privacidad y pruebas de carga.

Son elementos de la documentación prevista. No se recuperó evidencia de su configuración ni política legal final. Los riesgos regulatorios se mencionan como análisis pendiente, sin afirmaciones sobre requisitos jurídicos concretos.

### 13.5. Riesgos señalados en el material

Cobertura espacial insuficiente; latencia y calidad; complejidad técnica; falta de validación agronómica; adopción limitada; confianza; conectividad; costos y sostenibilidad; beneficios poco percibidos. Crear matriz de probabilidad/impacto, mitigaciones, responsables y presupuesto. No se recuperaron valoraciones numéricas de riesgo.

## 14. Registro de decisiones, hipótesis y ejemplos

### 14.1. Directrices explícitas del usuario

| ID | Directriz | Evidencia |
| --- | --- | --- |
| U-01 | El proyecto es para una hackathon | U3 |
| U-02 | Prepararlo con visión de continuidad y fundamento | U3 |
| U-03 | Incluir modelo de negocio, público y DEV | U3 |
| U-04 | Desarrollar partes con texto orientador y subpuntos faltantes marcados | U4 |
| U-05 | Entregar documentación en `.tex` y `.md` con igual contenido en aquella solicitud | U4; archivos originales no recuperados |
| U-06 | Conservar todo el contexto y las preguntas para otro chat | U5 y U0 |
| U-07 | Esta entrega debe ser un `.md` descargable y distinguir estados de evidencia | U0 |

### 14.2. Propuestas que no deben promoverse a aprobadas

| ID | Propuesta / hipótesis | Fuente | Estado conservado |
| --- | --- | --- | --- |
| P-01 | Arequipa como contexto inicial | A-DOC, A-DEV, P0 | Consta en borrador; alcance exacto pendiente |
| P-02 | Pequeños productores como segmento prioritario | A-DOC, P0 | Hipótesis de mercado |
| P-03 | React, MapLibre, Plotly, FastAPI | A-DEV, P0 | Stack sugerido |
| P-04 | PostgreSQL/PostGIS más archivos | A-DEV, P0 | Arquitectura sugerida |
| P-05 | POWER + IMERG + Sentinel-2 + SoilGrids | A-FUENTES | Integraciones MVP recomendadas |
| P-06 | Redis/Celery/RQ según necesidad | A-DEV | Ampliación condicionada |
| P-07 | Reglas agronómicas explicables primero | A-DEV | Método propuesto, sin fórmulas aprobadas |
| P-08 | Machine Learning después de contar con datos | A-DEV | Posibilidad futura |
| P-09 | Web y futura app Android/Kotlin | A-DEV | Evolución de plataforma |
| P-10 | Freemium + B2B/B2G, cuatro nombres de planes | A-DOC | Hipótesis comercial |
| P-11 | Verde/crema, alto contraste y glasmorfismo moderado | P0 | Dirección visual de borrador |
| P-12 | Notion y GitHub con documentación híbrida | A-DOC, P0 | Organización sugerida |
| P-13 | Ocho áreas documentales y cuatro fases de roadmap | A-DOC, P0 | Estructura propuesta |

No se recuperaron decisiones técnicas o comerciales con una aprobación explícita del equipo. La aceptación del usuario de seguir desarrollando la documentación no demuestra por sí sola aprobación individual de cada tecnología, plan o umbral.

### 14.3. Inventario de datos ficticios y placeholders

| Elemento | Clasificación | Uso permitido |
| --- | --- | --- |
| Parcela de 2 ha | Ejemplo | Explicar resolución |
| Coordenadas `-16.40, -71.54` | Ilustrativas | Explicar consulta POWER |
| Año de consulta 2025 | Parámetro del ejemplo | Explicar una solicitud, sin asumir datos obtenidos |
| Parcela `12` | Identificador ficticio | Ejemplos de API |
| Pesos 35/25/25/15 | Ficticios | Demostrar prioridades |
| Puntajes 79/73/71 | Ficticios | Simulador conceptual |
| Puntaje 82 y riesgo bajo | Ficticios | Estructura JSON distinta |
| Siembra 01/01/2027–15/02/2027 | Ficticia | Campo ilustrativo; no calendario agronómico |
| Actualización 18/10/2026 del JSON | Ficticia | Mostrar un metadato |
| «Texto generado por el motor» | Placeholder | Pendiente explicación real |
| «Confianza media» | Etiqueta ilustrativa | Pendiente definición/calibración |
| Tarpu Campo/Pro/Organizaciones/Institucional | Nombres tentativos | Exploración comercial |
| Responsables «por asignar» | Placeholder de gestión | Completar con asignación real |
| Fechas y versiones de P0 | Metadatos del archivo | No confundir con hitos de producto o resultados |

## 15. Preguntas abiertas y decisiones pendientes

Las preguntas siguientes organizan los pendientes recuperados. Su formulación interrogativa es editorial: salvo las citas de la sección 16, **no son una transcripción literal de preguntas históricas**. No hay respuestas implícitas por estar incluidas aquí.

### 15.1. Identidad y alcance

- ¿Cuál es el origen del nombre TARPU y cómo lo explica el equipo?
- ¿Qué relación formal existe entre TARPU y QENTARA?
- ¿Se aprueban el lema, misión, visión y valores del borrador?
- ¿Cuál es la zona inicial exacta dentro de Arequipa y qué cultivos se priorizan?
- ¿Qué desafío concreto del evento se aborda y cuáles son sus requisitos oficiales?
- ¿Qué entra y qué queda fuera del MVP? ¿Qué se mostrará con datos reales y qué como demo?

### 15.2. Usuarios y mercado

- ¿El pequeño productor es el segmento más urgente y accesible?
- ¿Qué tamaño de parcela, conectividad, idioma y habilidades digitales tiene?
- ¿Quién decide, quién usa, quién recibe el beneficio y quién paga?
- ¿Qué problemas y alternativas actuales se observaron en campo?
- ¿Qué persona, Jobs To Be Done y journey se sustentan en entrevistas?
- ¿Cuál es la disposición a pagar y qué ventajas se perciben frente a alternativas?

### 15.3. Datos y ciencia

- ¿Qué producto/version/banda exactos se usarán en cada fuente?
- ¿Con qué cobertura, resolución, latencia y profundidad cuenta cada variable?
- ¿Sirve el producto para variación dentro de la parcela o solo contexto regional?
- ¿Cómo se accede hoy, con qué autenticación, cuotas, licencias y formatos?
- ¿Cuál es el acceso vigente a SoilGrids y qué alternativa será operativamente estable?
- ¿Cuál es la distribución disponible de EcoCrop y cómo se valida/adapta a cultivos locales?
- ¿Qué datos de riego, siembra e historial debe aportar el productor?
- ¿Cómo se gestionan nubes, faltantes, calidad y diferencias temporales/espaciales?
- ¿Qué referencia se usará para validar cada indicador?
- ¿Qué pronóstico adicional se necesita para hablar de futuras ventanas de siembra?
- ¿De dónde saldrán precios, costos y rendimientos para evaluar rentabilidad?

### 15.4. Recomendaciones

- ¿Qué reglas, restricciones, fórmulas, ventanas temporales y pesos usará el motor?
- ¿Cómo participan familia botánica, secuencias previas, campaña, riego y suelo?
- ¿Qué es restricción excluyente y qué es criterio ponderado? Esta distinción queda como pregunta de diseño, no como regla existente.
- ¿Qué especialista revisará los casos y con qué evidencia regional?
- ¿Qué significa riesgo bajo/medio/alto y cómo se define la confianza?
- ¿Qué información mínima hace posible recomendar y qué ocurre cuando falta?
- ¿Se propondrán cultivos, secuencias completas, fechas o solamente comparación exploratoria?
- ¿Cómo se conserva la explicación reproducible y la versión de reglas/datos?
- ¿Qué necesidad real justificaría Machine Learning más adelante?

### 15.5. Ingeniería y UX

- ¿Se adopta formalmente el stack propuesto? ¿Qué alternativas se evaluaron?
- ¿Cuáles son los contratos JSON, recursos y errores de API definitivos?
- ¿Qué CRS/SRID, geometrías, unidades, índices y migraciones se usarán?
- ¿Cuál será el almacenamiento de archivos, su retención y respaldo?
- ¿Qué se precalcula, qué se actualiza periódicamente y qué se calcula a demanda?
- ¿Cuándo hace falta cola? ¿Celery, RQ u otra opción? ¿Qué aporta Redis?
- ¿Qué límites de tiempo/costo y qué estado visible tiene un análisis largo?
- ¿Cómo se autorizan accesos a parcelas y organizaciones?
- ¿Qué mockups, tipografías, paleta exacta y componentes fueron realmente aprobados?
- ¿Cómo se muestran incertidumbre, antigüedad, ausencia de datos y baja conectividad?
- ¿Qué alcance de voz y Android puede esperar la primera versión?
- ¿Qué proveedor, entorno, monitoreo y estrategia de despliegue se elegirán?

### 15.6. Negocio, validación y gestión

- ¿Qué funciones serán esenciales gratuitas y cuáles avanzadas?
- ¿Cómo se diferencian organizaciones e instituciones y cuál es el comprador inicial?
- ¿Qué TAM/SAM/SOM y precios se sustentan en fuentes y entrevistas?
- ¿Cuál es el costo por parcela/consulta y la viabilidad de cada plan?
- ¿Qué piloto, muestra, tareas y criterios de éxito se acordarán?
- ¿Qué impacto se medirá con línea base y seguimiento?
- ¿Quién asume cada tarea, documento, hito y riesgo?
- ¿Cómo se resolverán propiedad intelectual, roles, alianzas y financiamiento?
- ¿Qué lugar será la fuente de verdad de cada documento para evitar duplicación?

### 15.7. Información todavía no recuperada

Faltan, si existieron: conversaciones anteriores sobre el concepto original, branding y mockups; respuesta exacta que acompañaba los archivos `.tex`/`.md`; archivos fuente de esa entrega; decisiones aprobadas fuera de los mensajes disponibles; repositorio y estado actual de implementación; fuentes/evidencias de usuarios y validación.

No se deben completar estas lagunas atribuyendo nuevas ideas al equipo o al chat anterior. Pueden incorporarse después con su fuente y estado.

## 16. Historial recuperado de preguntas del usuario

Se conserva el orden conversacional de las cinco intervenciones disponibles. La lectura indicó que no había más páginas disponibles en ese acceso; esto no prueba que nunca existiera más contexto. Los títulos temáticos siguientes son editoriales y las citas mantienen el texto recibido.

### U1. Conexión de información, backend y visualización

> Ahora quiero que desarrollemos un poco mas sobre, como vamos a conectar toda la informacion que queremos en la idea, con nuestro backend, como lo vamos a hacer, uqiero que me ayudes a informarme y contextualizarme en como hariamos posible tal conexion y todo el mostrado de esa misma info, como podriamos hacerla y todo eso.

Intervención `ddaf2962-2b45-48bf-9c7a-f7be9ca633a3`. Respuesta asociada originalmente inaccesible `9639ab98-74e9-49b2-a32e-5b047ddb8ee6`; el usuario aportó después A-DEV, congruente con este tema, sin que se verificara identidad técnica entre ese pegado y el identificador.

### U2. Cuadro de satélites, variables, acceso, formatos y manejo

> quiero que me des un cuadro en edonde me muestres las fuentes (Satelites), luego lo que se puede o vamos a sacar de ahi, y como lo vamos a sacar, con que api o como, y luego en que tipo de formato viene cada una de esas, y como podriamos manejarlas

Intervención `93ece84c-3120-42ec-9f69-e2ee48a429aa`. Respuesta asociada `1d73f76e-7469-4816-9e1e-f6fd863edc18`; el contenido A-FUENTES fue aportado por el usuario posteriormente.

### U3. Documentación más allá de la hackathon

> Bien ahora necesitamos hacerl a documentacion de el proyecto, Tu sabes que este proyecto es para una hackaton, pero nosotros quweremos aramar todo como si fuera ir ma alla, tipo como una idea bien funcdamentada, documentad y pensada, por eso ahora quiero que me ayudes a ver que partes pueden tener la documentacion, pero algo que si quiero que haya es el "Modelo de Negocio", y luego el prublico dirigido y todas esas partes, y no olbidar tambien la documentacion en cuanto al desarrollo dev.

Intervención `5e6ffbc4-4271-405a-983d-ec44f026b9a6`. Respuesta asociada `dbcb0598-bdea-4200-9e28-d7a27d87989d`; A-DOC fue aportado después por el usuario.

### U4. Desarrollo inicial y doble formato

> Bien, puedes desarrollar cad parte, pero tipo, un poco, pero dejar tambien ahi bien marcados los sub puntos que falta en cada partecita, y el texto de ejemplo maso para guiarse en como va,o al menos el ttexto intructorio de cada punto que si sea el que va a ir como ogirnal con la vision y todo lo que ya estabamos viendo.
>
> Quiero que me des el documento en latex formato .tex, y tambien en formato .md, obviamente ambos con el mismo contenido

Intervención `23d4f23d-c19e-4982-ad20-2e63c15c92de`. Respuesta asociada `1913f61c-adab-482f-ac6e-6f444e9db0ae`; texto exacto y adjuntos originales no recuperados. P0 proporciona un borrador complementario, sin demostrar que sea idéntico a los dos archivos pedidos.

### U5. Transferencia de todo el conocimiento y preguntas

> quiero que todo el conocimento de este  chat, e caunto a todo tarpu y todo todo todo, me lo des bien estructurado en un archivo .md, para poder entrenar a otro chat con el contexto, y no te ovlides de las preguntas en cuanto como podriamos hacer este proyecto, tod considera poner todo

Intervención `90b7b268-7066-40be-a2da-f9404d3e2273`. No se recuperó respuesta posterior dentro de esa conversación.

## 17. Referencias y recursos mencionados

### 17.1. Accesos oficiales que aparecen en las fuentes

Se normalizaron enlaces eliminando únicamente el parámetro de seguimiento `utm_source=chatgpt.com` cuando estaba presente. Se conservan como bibliografía inicial; **no se verificó aquí disponibilidad ni vigencia**.

| Recurso | Enlace histórico |
| --- | --- |
| NASA POWER — API | [Documentación de servicios](https://power.larc.nasa.gov/docs/services/api/) |
| NASA POWER — Daily API | [Documentación diaria](https://power.larc.nasa.gov/docs/services/api/temporal/daily/) |
| POWER — punto diario | [URL del ejemplo de solicitud](https://power.larc.nasa.gov/api/temporal/daily/point) |
| NASA Earthdata | [Portal](https://www.earthdata.nasa.gov/) |
| NASA Earthdata Search | [Búsqueda de productos](https://search.earthdata.nasa.gov/) |
| NASA AppEEARS | [Servicio](https://appeears.earthdatacloud.nasa.gov/) |
| GPM | [Datos](https://gpm.nasa.gov/data/) |
| GPM IMERG | [Directorio de productos de precipitación](https://gpm.nasa.gov/data/directory) |
| USGS M2M | [Acceso API](https://m2m.cr.usgs.gov/) |
| Copernicus Data Space | [Documentación](https://documentation.dataspace.copernicus.eu/) |
| Copernicus STAC | [Documentación STAC](https://documentation.dataspace.copernicus.eu/APIs/STAC.html) |
| SoilGrids | [Documentación y acceso](https://docs.isric.org/globaldata/soilgrids/) |
| FAO EcoCrop | [Portal mencionado](https://ecocrop.apps.fao.org/) |
| PostGIS | [Documentación](https://postgis.net/documentation/) |
| FastAPI | [Documentación](https://fastapi.tiangolo.com/) |

Otros nombres conservados sin inventar un enlace específico no aportado: GES DISC, NSIDC, CMR, LandsatLook, Earthaccess, servicios OGC, Celery y RQ. Deben seleccionarse referencias exactas al implementar.

### 17.2. Referencias visuales adjuntas a las respuestas históricas

Los enlaces siguientes son los recursos de imagen pegados por el usuario. No son necesariamente las páginas originales de sus autores. No se verificaron, descargaron ni se atribuyen derechos de uso al equipo. Se mantienen para conservar la pista de contexto visual.

| Contexto | Título visible | Recurso histórico |
| --- | --- | --- |
| Pequeños productores | Alternativa ecológica: El agua de rocoto podría servir como plaguicida natural | [Imagen de referencia](https://images.openai.com/static-rsc-4/gqr4gjH7NP5WkBnvLhHUxPgPO46CXKfsE__G70I4fn50J4K5I4Otlv3olM5ffFydrAIDZ1gGcZY85ZJBLy4Nlos7WKDHubgvuF106zo6Esb8LG8nsP052tpOxiEFhF7RKgNLNwxAbV1v-fxS8jTGINOO8JbYnYG3lQav5Dq_NDI?purpose=inline) |
| Técnicos / tecnología | Piura será escenario del “Vive Agro 4.0”, primer evento de agricultura ‘smart’ en Perú | [Imagen de referencia](https://images.openai.com/static-rsc-4/xFssQcjOLv0M-4zoIPXAcuqE9WluHztdqgwqupxgaU1Md_ndKx6gMGUPDBpTjNdrwvow4hQa7_R3bKizRXe27_EEkEoHyC_nk8xWV9BHaq8K-kvi0sLPJ4hLHfS1OmJibg2PfjEhWj94Bgg4BGkndnx2qJ5q6ChdsOZiLLnLZ_o?purpose=inline) |
| Cooperativas | Meet Cooperativa Agraria Cacaotera Choba Choba — Yellow Seed / Conscious Cacao Stories / Medium | [Imagen de referencia](https://images.openai.com/static-rsc-4/HyeLZw14xukI3jKlJYXUhCzcMuBxA5iy6ZCTJxwGmL_mQqRJiY5w6IfHvYeXXiTo2jyyA8BAhFMs8-PGLZbauM1xgy54lxEd9Oa3pblwu6bCuCNS6DQKPKyZCr3YThDDxKesffuLG3etHp0m_lEFbtMsRoK6wdA1sl_Dh_k0UvQ?purpose=inline) |
| Empresas / instituciones | Consultancy Sessions for Investors — FarmBridge Consulting | [Imagen de referencia](https://images.openai.com/static-rsc-4/h2LbwIYRJM2pMRwj8gjvej7ENRu2S5rtzHSFexw_6DL4Ynudf8mlcdnEKKvxwkjmjW5OetgGVQeeJPybxkUyirlod41dshIxQkIUyv2W_WDo6jPWF2cAXqoN-KxKruREFuL3aqHMDJQGbDs7VD23WGp-GxaarkmGed0K-BoAHR0?purpose=inline) |
| Mi parcela | Atfarm: Aplicación de agricultura de precisión de Yara — Yara España | [Imagen de referencia](https://images.openai.com/static-rsc-4/SEfy_BZ7zrAsKwDeCQWXZIEp3fAIMIiQQyb508mG37WVqKnblRZD5Ywn70dti1q_4d3zRBV_aPllD3uqWBd0Se6DCstO5cN8W-Nl2_ISJYN-GHpRQyMcIU4oxxIJSTDDMcYf9jFqMk7Syrx0WrzhJgAxQpGIZRfM_MgLnm3qwDs?purpose=inline) |
| Análisis satelital | Plot IQ · AI-native drone field mapping · KinetiCloud | [Imagen de referencia](https://images.openai.com/static-rsc-4/eTsd8VxvOWVyfF4wb1bFd3B0l_7NvU_viW-QPipYsesrmMGZfeDIkBoirhe99ykT8REakE2Ua4IwZx70Vo9BdusiYmjvwMNFKoIjJWJB8zFo2SWZ0Vn1aJLL6YG9R_O1seVtiwhuz-SBDxH_XK7NacBjVEWh6t4qRVTVjPHbzmw?purpose=inline) |
| Clima histórico | AgroSphere - Smart Agriculture Assistant — Bohdan Krasutskyi / Dribbble | [Imagen de referencia](https://images.openai.com/static-rsc-4/SULaEn_okAxMDDQSduGsLRapTzueSkYArZOU7qul1X6oMfYRJ-AP91LgqPi2Prh5GcbZMlEsLCHSeXJ-G-YJ31nx8fxSDJUHSDGxH9URrxSbpGwGP1_1DT6tR6gxHtx3iTH1E84LqdYN2n9c9sSxXMge59KnbFK7h2maIKmeOF4?purpose=inline) |
| Rotaciones | Smart Farming App / Agriculture Farming Mobile App UI — wincasoft / Wincasoft Official / Dribbble | [Imagen de referencia](https://images.openai.com/static-rsc-4/gGtfY8LXuGn4mc98K5JrVJpUESZgEffTLlNbAV3R6p41JgN2RWnWafI4YU45JhPlvazFtaMwlC0IC8-ZeeuAyyz-TM9ksbpurpxwo7KmY1-S334nVP5k7S1aRciTiACDbrElaAE9AdX_z3H-5c6PeXwjCm4KHJF5YuRGjQZReyM?purpose=inline) |

Los artefactos de interfaz copiados —favicons, «Docs», «+1», «+2», botones de reinicio y filtros— no son evidencia científica ni requisitos del producto. Se preserva su significado contextual donde importa; no se interpretan como decisiones.

## 18. Guía de continuidad y mantenimiento

### 18.1. Cómo usar este archivo en otro chat

Adjuntar el archivo completo y pedir que se use como contexto del proyecto, manteniendo los estados de evidencia. «Entrenar» se entiende aquí como **contextualizar una conversación**; no se documentó un proceso de ajuste de modelos ni un dataset de entrenamiento formal.

Reglas de continuidad derivadas de la petición del usuario:

1. Mantener TARPU como producto y QENTARA como equipo según el contexto recuperado, salvo corrección del usuario.
2. Distinguir directrices explícitas del usuario, propuestas del asistente, borradores, hipótesis, ejemplos y lagunas.
3. No presentar código de ejemplo como integración ejecutada ni pantallas inspiracionales como diseños propios.
4. No convertir puntajes, fechas, riesgos o confidencias ilustrativos en recomendaciones reales.
5. No afirmar que existe implementación, validación, mercado, socios o ingresos sin evidencia.
6. Antes de implementar datos externos, comprobar producto, acceso, condiciones, escala, latencia y formato oficiales.
7. Construir producto y arquitectura de manera coordinada con la disponibilidad científica de datos.
8. Añadir nueva información con procedencia, fecha y estado; conservar contradicciones hasta resolverlas explícitamente.

### 18.2. Qué debería confirmar primero el siguiente trabajo

Revisar el alcance del MVP y el estado real del repositorio si existe; elegir zona/cultivos y productos exactos; aprobar o modificar el stack; ejecutar el recorrido POWER completo; definir reglas agronómicas y validadores; investigar usuarios y viabilidad comercial. Son pasos recomendados en el material, no tareas ya realizadas por esta consolidación.

### 18.3. Plantilla editorial para nuevas decisiones

La siguiente plantilla es una herramienta añadida en esta consolidación, **no un registro histórico existente**:

```text
ID:
Tema:
Estado: propuesta / hipótesis / aprobado / descartado / pendiente
Descripción:
Quién y cuándo lo aprobó, si corresponde:
Fuente o evidencia:
Alternativas consideradas:
Consecuencias y límites:
Responsable:
Fecha de próxima revisión:
```

### 18.4. Cobertura de esta entrega

| Tema solicitado | Dónde se conserva | Límite principal |
| --- | --- | --- |
| Visión y problema | 2–3 | Texto base, sin medición del problema |
| Público y mercado | 4 y 11 | Segmentos hipotéticos |
| UX/UI y branding | 5 | Mockups originales y tokens no recuperados |
| Arquitectura y backend | 7 | Propuestas, sin implementación comprobada |
| Fuentes, APIs y formatos | 6 y 17 | Productos/vigencia por verificar |
| Base de datos y flujo | 7–8 | Diseño inicial, sin esquema final |
| Recomendaciones y voz | 9 | Sin fórmulas aprobadas ni validación |
| Roadmap | 10 | Sin fechas o responsables acordados |
| Negocio | 11 | Sin precios o resultados económicos |
| Documentación | 12 y 19 | Borradores y estructura, no todos los archivos originales |
| Validación e impacto | 13 | Planes/hipótesis, sin resultados |
| Decisiones, placeholders, pendientes | 14–15 | Aprobaciones técnicas no recuperadas |
| Preguntas históricas | 16 | Cinco intervenciones disponibles |

## 19. Anexo de conservación del borrador local

**Fuente P0:** extracción textual del PDF local de 11 páginas físicas. Se conserva para que la síntesis no elimine subpuntos ni redacciones del borrador. No es una nueva fuente independiente ni demuestra aprobación. Puede repetir contenido ya organizado arriba.

La extracción puede conservar uniones de palabras, guiones de final de línea, cuadrados de checklist o numeración de la maquetación. Se omite deliberadamente cualquier afirmación de que esta versión textual sea el `.tex` o `.md` original. Las marcas «PÁGINA FÍSICA» corresponden al orden del PDF, no a sus números impresos.


### PÁGINA FÍSICA 1 DEL PDF FUENTE

```text
TARPU
Documento maestro del proyecto
Datos para cosechar un mejor mañana
Equipo QENTARA
NASA Space Apps Challenge 2026
Versión 0.1· 19 de octubre de 2026
Borrador fundacional — sujeto a validación
```

### PÁGINA FÍSICA 2 DEL PDF FUENTE

```text
TARPU · QENTARA Documentación maestra
Índice
Propósito y guía de uso 3
1. 01. Identidad, visión y fundamentos 3
1.1. Presentación general . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3
1.2. Problema y justificación . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3
1.3. Misión, visión y valores . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3
1.4. Objetivos y propuesta de valor . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3
1.5. Alcance, límites y glosario . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 4
2. 02. Investigación, mercado y público objetivo 4
2.1. Contexto agrícola y análisis del problema . . . . . . . . . . . . . . . . . . . . . . . 4
2.2. Segmentos de usuarios . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 4
2.3. Personas, tareas y recorrido . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 4
2.4. Competencia e investigación de campo . . . . . . . . . . . . . . . . . . . . . . . . . 4
3. 03. Modelo de negocio 5
3.1. Hipótesis de modelo comercial . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5
3.2. Business Model Canvas . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5
3.3. Value Proposition Canvas . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5
3.4. Mercado, precios y economía unitaria . . . . . . . . . . . . . . . . . . . . . . . . . . 5
3.5. Go-to-market, alianzas y riesgos . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5
4. 04. Producto, UX y requisitos 6
4.1. PRD y alcance del MVP . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6
4.2. Catálogo funcional . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6
4.3. Historias y flujos de usuario . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6
4.4. Diseño visual y accesibilidad . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6
5. 05. Fundamento científico y datos 6
5.1. Fuentes y variables . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6
5.2. Matriz de integración . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7
5.3. Indicadores y reglas agronómicas . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7
5.4. Calidad, límites y trazabilidad . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7
6. 06. Ingeniería y desarrollo DEV 7
6.1. Arquitectura y stack . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7
6.2. Backend y contratos API . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7
6.3. Pipelines geoespaciales . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7
6.4. Modelo de datos . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8
6.5. Frontend, mapas y visualización . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8
6.6. Seguridad, calidad y despliegue . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8
6.7. Repositorio y contribución . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8
7. 07. Validación e impacto 8
7.1. Hipótesis y pruebas . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8
7.2. Validación técnica y agronómica . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9
7.3. Impacto y aprendizaje . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9
1
```

### PÁGINA FÍSICA 3 DEL PDF FUENTE

```text
TARPU · QENTARA Documentación maestra
8. 08. Estrategia, roadmap y hackathon 9
8.1. Roadmap . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9
8.2. Gestión y riesgos . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9
8.3. Entrega NASA Space Apps . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9
8.4. Continuidad poshackathon . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9
9. Anexo A. Matriz de seguimiento sugerida 10
10.Anexo B. Estructura de repositorios y documentación 10
11.Anexo C. Referencias iniciales para verificar 10
2
```

### PÁGINA FÍSICA 4 DEL PDF FUENTE

```text
TARPU · QENTARA Documentación maestra
Propósito y guía de uso
Reunir una primera redacción de la visión, el negocio, el producto, el fundamento científico y
el desarrollo técnico de TARPU. Cada apartado contiene texto base reutilizable y un bloque de
pendientes. Los ejemplos no son resultados medidos ni funciones ya implementadas.
Texto base:redacción inicial, sujeta a revisión y citas.
Pendiente por completar:tareas de investigación, decisión o desarrollo.
Regla de evidencia:distinguir hechos, hipótesis, simulaciones y funcionalidades futuras.
Mantenimiento: asignar responsable, estado, fecha y versión.
1. 01. Identidad, visión y fundamentos
1.1. Presentación general
TARPU es una plataforma de apoyo a decisiones agrícolas que integra observaciones satelitales,
información climática y conocimiento agronómico para ayudar a los productores a comprender sus
parcelas y evaluar alternativas de rotación de cultivos. Nace como propuesta del equipo QENTARA
para NASA Space Apps Challenge 2026, con Arequipa como contexto inicial y vocación de evolución
hacia un producto real.
Pendiente por completar
□ Precisar nombre legal del proyecto, equipo, alcance geográfico inicial y descripción corta de 50 y
150 palabras.
1.2. Problema y justificación
La variabilidad de las precipitaciones, los episodios de bajas temperaturas y la limitada
disponibilidad de información integrada pueden dificultar las decisiones de siembra y rotación.
TARPU busca traducir datos complejos en información clara y contextualizada; no sustituye la
evaluación de un agrónomo ni garantiza rendimientos.
Pendiente por completar
□ Incorporar estadísticas verificadas de Arequipa, testimonios de productores, fuentes y magnitud
del problema.
1.3. Misión, visión y valores
Misión: acercar información geoespacial y agronómica comprensible a quienes toman decisiones
sobre la tierra. Visión: consolidar una plataforma confiable, inclusiva y escalable para una agricultura
más informada y resiliente. Valores: rigor científico, accesibilidad, transparencia, utilidad local y
respeto por los datos de los usuarios.
Pendiente por completar
□ Validar la formulación con el equipo y definir horizonte temporal e indicadores de cumplimiento.
1.4. Objetivos y propuesta de valor
Objetivo general: desarrollar y validar una herramienta que integre datos ambientales y reglas
agronómicas para comparar opciones de manejo y rotación por parcela. Valor central: convertir
información dispersa en indicadores, mapas y explicaciones accionables.
Pendiente por completar
□ Definir objetivos SMART, métricas, supuestos y alcance de cada entrega.
3
```

### PÁGINA FÍSICA 5 DEL PDF FUENTE

```text
TARPU · QENTARA Documentación maestra
1.5. Alcance, límites y glosario
El primer alcance comprende parcelas de ejemplo, visualización climática y geoespacial, y una
demostración explicable de comparación de cultivos. Los pronósticos precisos, estimaciones de
ingresos y alertas operativas exigirán fuentes y validación adicionales.
Pendiente por completar
□ Completar lista de exclusiones, dependencias y glosario: NDVI, GPM, SMAP, GeoTIFF, API,
píxel, resolución y anomalía.
2. 02. Investigación, mercado y público objetivo
2.1. Contexto agrícola y análisis del problema
La investigación partirá de los sistemas productivos de Arequipa y de cómo los agricultores
deciden qué sembrar, cuándo hacerlo y qué recursos utilizar. Se distinguirán factores climáticos,
edáficos, económicos y tecnológicos.
Pendiente por completar
□ Reunir fuentes oficiales, principales cultivos por zona, acceso al riego, conectividad y calendario
agrícola; construir árbol de problemas.
2.2. Segmentos de usuarios
Público prioritario hipotético: pequeños productores que necesitan información sencilla desde
un teléfono. Segmentos secundarios: agrónomos, cooperativas, asociaciones, empresas e instituciones
que gestionan múltiples parcelas. Usuario, beneficiario y cliente pagador no siempre serán la misma
persona.
Pendiente por completar
□ Definir tamaño de parcela, idioma, acceso a internet, alfabetización digital, necesidades y
disposición de pago por segmento.
2.3. Personas, tareas y recorrido
Persona inicial de referencia: productor que conoce su terreno, pero necesita comparar riesgos
de nuevas campañas sin interpretar mapas científicos. Tarea principal: entender condiciones de su
parcela y decidir qué alternativa investigar o consultar con un técnico.
Pendiente por completar
□ Entrevistar usuarios reales; elaborar 2–4 personas, Jobs To Be Done, mapa de experiencia y
barreras.
2.4. Competencia e investigación de campo
Se compararán servicios meteorológicos, visores satelitales y soluciones de gestión agrícola por
cobertura, facilidad de uso, datos, precio y confianza. La diferenciación propuesta de TARPU es
integrar fuentes y explicar rotaciones en lenguaje cotidiano.
Pendiente por completar
□ Crear matriz competitiva verificable, guion de entrevistas, encuesta y registro de hallazgos; evitar
afirmaciones no comprobadas.
4
```

### PÁGINA FÍSICA 6 DEL PDF FUENTE

```text
TARPU · QENTARA Documentación maestra
3. 03. Modelo de negocio
3.1. Hipótesis de modelo comercial
Se explorará un modelo freemium con acceso básico para pequeños productores y servicios
avanzados para técnicos, cooperativas, empresas e instituciones. Es una hipótesis que deberá
validarse antes de fijar precios o afirmar rentabilidad.
Pendiente por completar
□ Definir propuesta por plan, funciones gratuitas, límites, comprador, usuario y mecanismo de
cobro.
3.2. Business Model Canvas
Segmentos: productores, técnicos y organizaciones. Propuesta: indicadores comprensibles y
escenarios de rotación. Canales: web móvil, alianzas y capacitación. Relaciones: autoservicio
acompañado y soporte. Recursos: equipo, datos, motor agronómico e infraestructura. Actividades:
integrar, validar y explicar datos. Socios: especialistas, cooperativas y entidades de datos. Costos:
desarrollo, nube, soporte y validación. Ingresos: suscripciones o contratos institucionales hipotéticos.
Pendiente por completar
□ Completar y contrastar los nueve bloques con entrevistas y evidencia.
3.3. Value Proposition Canvas
Trabajos del usuario: planificar campañas y gestionar riesgos. Dolores: información dispersa,
incertidumbre y herramientas complejas. Ganancias esperadas: decisiones más claras, ahorro de
tiempo y acceso a explicaciones. TARPU propone mapas, comparaciones y reportes contextualiza-
dos.
Pendiente por completar
□ Cuantificar prioridades por segmento y comprobar beneficios en pruebas.
3.4. Mercado, precios y economía unitaria
La estimación de TAM, SAM y SOM se construirá desde poblaciones y superficies verificables,
sin inventar cifras. Los precios deberán considerar disposición de pago y costo de atender parcelas,
consultas y procesamiento.
Pendiente por completar
□ Calcular TAM/SAM/SOM con fuentes, CAC, LTV, costo por parcela, margen, escenarios y
sensibilidad.
3.5. Go-to-market, alianzas y riesgos
Una ruta inicial posible es pilotar con productores y asesores de una zona de Arequipa, iterar
el producto y después acercarse a cooperativas e instituciones. El principal riesgo comercial es
ofrecer un beneficio no percibido o demasiado complejo.
Pendiente por completar
□ Definir canales, pilotos, acuerdos, presupuesto, responsables, barreras de adopción y riesgos
regulatorios.
5
```

### PÁGINA FÍSICA 7 DEL PDF FUENTE

```text
TARPU · QENTARA Documentación maestra
4. 04. Producto, UX y requisitos
4.1. PRD y alcance del MVP
El MVP deberá permitir identificar una parcela, consultar indicadores ambientales trazables,
visualizar una capa geoespacial y comparar opciones de cultivo mediante reglas transparentes. Se
separará claramente lo implementado, lo simulado y lo futuro.
Pendiente por completar
□ Definir funcionalidades obligatorias, criterios de aceptación, dependencias, exclusiones y definición
de terminado.
4.2. Catálogo funcional
Módulos previstos: gestión de parcelas, clima, mapas satelitales, suelo y agua, historial de
campañas, rotaciones, simulador, alertas, reportes y asistente de voz. No todos pertenecen al MVP.
Pendiente por completar
□ Crear fichas por módulo: usuario, problema, entradas, procesamiento, salidas, prioridad y estado.
4.3. Historias y flujos de usuario
Ejemplo: Como agricultor, quiero seleccionar mi parcela y ver las condiciones recientes para
entender qué factores debo revisar antes de planificar la siguiente campaña. Criterio: visualizar
fecha, unidad, fuente y advertencia de resolución de cada indicador.
Pendiente por completar
□ Añadir historias de registro, trazado, consulta, comparación, exportación y fallos de conexión.
4.4. Diseño visual y accesibilidad
La interfaz combinará estética agritech verde/crema, mapas y planos vegetales, gráficos legibles
y componentes de alto contraste. El glasmorfismo será moderado. La información crítica se explicará
en texto, no solo mediante colores.
Pendiente por completar
□ Definir sistema de diseño, estados vacíos, errores, idioma, tamaño táctil, pruebas de usabilidad y
modo de baja conectividad.
5. 05. Fundamento científico y datos
5.1. Fuentes y variables
Fuentes candidatas: NASA POWER para series meteorológicas; GPM IMERG para preci-
pitación; SMAP para humedad superficial regional; MODIS/VIIRS y Landsat para vegetación;
Sentinel-2 para mayor detalle espacial; SoilGrids para propiedades estimadas del suelo; y catálogos
agronómicos para requerimientos de cultivos. No todas son misiones NASA.
Pendiente por completar
□ Seleccionar productos exactos, versiones, bandas, resoluciones, cobertura, latencia, licencias,
acceso y referencias oficiales.
6
```

### PÁGINA FÍSICA 8 DEL PDF FUENTE

```text
TARPU · QENTARA Documentación maestra
5.2. Matriz de integración
Cada fuente tendrá un conector documentado con autenticación, API o descarga, forma-
to de origen (JSON, CSV, HDF5, NetCDF, GeoTIFF/COG o JPEG2000), transformaciones,
almacenamiento y política de actualización.
Pendiente por completar
□ Registrar endpoints comprobados, ejemplos de respuesta, cuotas, fallos, caché y prueba reprodu-
cible.
5.3. Indicadores y reglas agronómicas
Indicadores candidatos: lluvia acumulada, anomalías, temperaturas extremas, tendencia NDVI
y compatibilidad de requerimientos de cultivo. La comparación de rotaciones considerará cultivo
previo, familia botánica, agua, clima, suelo y objetivos del productor.
Pendiente por completar
□ Documentar fórmulas, ventanas temporales, pesos, umbrales, incertidumbre y revisión por
agrónomos.
5.4. Calidad, límites y trazabilidad
Un píxel satelital puede ser mayor que una parcela. Las estimaciones de humedad no equivalen
a mediciones directas del terreno; NDVI no mide por sí solo fertilidad; datos históricos no son
pronósticos. Cada resultado conservará fuente, fecha, unidad, resolución y calidad.
Pendiente por completar
□ Definir validaciones, máscaras de nubes, valores ausentes, comparación con campo, citas y
mensajes de incertidumbre.
6. 06. Ingeniería y desarrollo DEV
6.1. Arquitectura y stack
Arquitectura propuesta: frontend React con mapas MapLibre; backend Python/FastAPI;
PostgreSQL/PostGIS para parcelas y series; almacenamiento de objetos para rásteres; procesos de
ingesta y análisis con pandas, xarray y rasterio. Se añadirá cola de tareas si la carga lo exige.
Pendiente por completar
□ Dibujar diagramas C4, justificar alternativas, fijar versiones y registrar decisiones ADR.
6.2. Backend y contratos API
El frontend consultará nuestra API, no directamente todas las fuentes externas. Endpoints
iniciales: parcelas, clima, capas, indicadores y simulaciones. FastAPI expondrá documentación
OpenAPI y contratos de errores consistentes.
Pendiente por completar
□ Definir esquemas de petición/respuesta, autenticación, paginación, límites, pruebas y ejemplos.
6.3. Pipelines geoespaciales
Flujo: descubrir/descargar producto, validar metadatos, reproyectar cuando corresponda, aplicar
control de calidad, recortar o agregar espacialmente, calcular indicadores y publicar resultados.
Trabajos largos se ejecutarán de forma asíncrona.
Pendiente por completar
7
```

### PÁGINA FÍSICA 9 DEL PDF FUENTE

```text
TARPU · QENTARA Documentación maestra
□ Especificar CRS/SRID, tamaño de píxel, formatos intermedios, versionado, reintentos y costo de
procesamiento.
6.4. Modelo de datos
Entidades iniciales: usuarios, parcelas, campañas, cultivos, fuentes, observaciones, indicadores,
simulaciones y recomendaciones. Las geometrías vivirán en PostGIS y los rásteres pesados fuera de
la base relacional.
Pendiente por completar
□ Elaborar MER, diccionario de datos, restricciones, índices espaciales, migraciones y retención.
6.5. Frontend, mapas y visualización
React mostrará capas temáticas, series temporales, comparaciones y explicaciones. GeoJSON
servirá para polígonos; GeoTIFF/COG o teselas para capas ráster, y JSON para indicadores. La
UI distinguirá datos medidos, estimados y demostrativos.
Pendiente por completar
□ Documentar rutas, componentes, estado, leyendas, escalas, errores, pruebas y diseño responsive.
6.6. Seguridad, calidad y despliegue
Aplicaremos autenticación, autorización por parcela, secretos fuera del repositorio, control de
acceso a datos, logs sin información sensible y copias de seguridad. Las pruebas cubrirán conectores,
cálculos, API y recorridos críticos.
Pendiente por completar
□ Configurar entornos, Docker, CI/CD, monitoreo, plan de recuperación, política de privacidad y
pruebas de carga.
6.7. Repositorio y contribución
El repositorio contendrá aplicaciones, pipelines, infraestructura, pruebas y documentación
versionada. Cada cambio relevante incluirá descripción, pruebas y actualización documental.
Pendiente por completar
□ Escribir README, CONTRIBUTING, convención de ramas, commits, revisión de PR y guías
de instalación.
7. 07. Validación e impacto
7.1. Hipótesis y pruebas
Hipótesis inicial: un usuario podrá identificar condiciones relevantes de su parcela y comprender
por qué se propone una alternativa de cultivo. Se probará con tareas observables, no solo opiniones
generales.
Pendiente por completar
□ Definir muestra, consentimiento, tareas, métricas, criterios de éxito y protocolo.
8
```

### PÁGINA FÍSICA 10 DEL PDF FUENTE

```text
TARPU · QENTARA Documentación maestra
7.2. Validación técnica y agronómica
Compararemos indicadores con fuentes de referencia cuando existan, revisaremos cálculos y
solicitaremos evaluación de agrónomos. La calidad del dato y la calidad de la recomendación se
medirán por separado.
Pendiente por completar
□ Fijar datasets de prueba, casos límite, evaluadores, métricas de error y resultados.
7.3. Impacto y aprendizaje
Indicadores posibles: comprensión, tiempo para encontrar información, uso recurrente y deci-
siones apoyadas. Ahorro de agua, mejora de rendimiento o reducción de pérdidas serán hipótesis
hasta disponer de evidencia de campo.
Pendiente por completar
□ Diseñar piloto, línea base, seguimiento, resultados, limitaciones y plan de mejora.
8. 08. Estrategia, roadmap y hackathon
8.1. Roadmap
Fase 1: MVP demostrable con datos reales y límites explícitos. Fase 2: pilotos con productores
y expertos. Fase 3: producto con cuentas, historial y procesos automatizados. Fase 4: expansión
geográfica e institucional.
Pendiente por completar
□ Asignar hitos, fechas, responsables, dependencias y criterios de salida por fase.
8.2. Gestión y riesgos
Se gestionarán tareas por prioridad y responsable, con registro de decisiones. Riesgos principales:
cobertura espacial insuficiente, latencia de datos, complejidad técnica, adopción limitada y falta de
validación agronómica.
Pendiente por completar
□ Crear matriz probabilidad-impacto, mitigaciones, tablero de trabajo y presupuesto.
8.3. Entrega NASA Space Apps
La presentación explicará problema, público, solución, uso real de datos espaciales, demostración,
metodología, limitaciones y próximos pasos. El pitch distinguirá prototipo de capacidades futuras.
Pendiente por completar
□ Confirmar requisitos oficiales del evento, preparar video, repositorio, demo, diapositivas y guion.
8.4. Continuidad poshackathon
Después del evento, el equipo podrá mantener el proyecto como iniciativa de investigación
aplicada y potencial emprendimiento, priorizando evidencia, adopción y sostenibilidad.
Pendiente por completar
□ Definir propiedad intelectual, roles, aliados, fuentes de financiamiento y calendario de validación.
9
```

### PÁGINA FÍSICA 11 DEL PDF FUENTE

```text
TARPU · QENTARA Documentación maestra
9. Anexo A. Matriz de seguimiento sugerida
Documento Responsable Estado Evidencia Revisión
Project Overview Por asignar Borrador Pendiente Por definir
Business Model Canvas Por asignar Hipótesis Pendiente Por definir
PRD y MVP Por asignar Borrador Pendiente Por definir
Fuentes y metodología Por asignar Investigación Pendiente Por definir
Arquitectura y API Por asignar Propuesta Pendiente Por definir
10. Anexo B. Estructura de repositorios y documentación
Notion: estrategia, negocio, investigación y producto.
GitHub: apps/web, apps/api, pipelines, tests, infrastructure y docs.
Subcarpetas docs: architecture, api, database, data-sources, processing, recommendations,
security y deployment.
11. Anexo C. Referencias iniciales para verificar
NASA POWER: https://power.larc.nasa.gov/docs/services/api/
NASA Earthdata: https://www.earthdata.nasa.gov/
NASA AppEEARS: https://appeears.earthdatacloud.nasa.gov/
GPM: https://gpm.nasa.gov/data/
Copernicus: https://documentation.dataspace.copernicus.eu/
SoilGrids: https://docs.isric.org/globaldata/soilgrids/
PostGIS: https://postgis.net/documentation/
FastAPI: https://fastapi.tiangolo.com/
Verificar productos, endpoints, condiciones de acceso y vigencia antes de implementar.
10
```

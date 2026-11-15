# Decisiones, riesgos y preguntas abiertas

Estados: **Tomada** · **Propuesta** (pendiente de confirmar) · **Reemplazada**.

Las decisiones de producto (DEC) se registran en el anexo G del [informe maestro](../plataforma/documentacion/informe-maestro/TARPU_Documentacion_Maestra.md#anexo-g-control-de-cambios-y-decisiones), que manda. Las decisiones de trabajo del prototipo y de organización (DT) solo están aquí hasta que el informe las recoja. Ninguna aprobación conceptual valida fórmulas, cobertura, resultados de campo ni rentabilidad.

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

### DT-13 · Backend: API FastAPI y exportación a JSON estático
**Tomada · 14/11/2026 (Erick, responsable del área).** Python 3.13 con FastAPI y Pydantic para desarrollar. Un comando exporta las rutas `GET` a JSON estático con las mismas rutas, para la demo pública. Sin base de datos en la demo. Detalle en [backend/PROPUESTA.md](../plataforma/backend/PROPUESTA.md). Cierra SUP-015 **solo para el hackathon**; el stack del producto sigue abierto.

### DT-14 · Agente guiado con datos, sin modelo de IA en la demo
**Tomada · 14/11/2026 (Erick).** Reconoce intenciones y responde con plantillas a partir de los datos y resultados reales, citando la fuente. Un modelo de lenguaje queda como ampliación (SUP-034 sigue abierto para el producto).

### DT-15 · Publicación de la demo en Vercel o Netlify
**Tomada · 14/11/2026 (Erick).** Sitio estático compilado desde `Codigo/`, con los JSON exportados. La elección entre las dos plataformas queda para la reunión de unión.

### DT-16 · Cero supuestos en la demo
**Tomada · 14/11/2026 (Erick).** La demo es una demo, pero tiene que funcionar bien y todo lo que muestre tiene que ser cierto.

1. Cada valor viene de una fuente real con su procedencia, o lo declara el usuario y se muestra como «declarado por ti».
2. Ninguna regla, umbral, rango, límite ni peso se usa sin cita; sin ella, el dato se muestra sin evaluarlo.
3. Nada sintético en la demo: ni parcelas, ni personajes, ni valores de ejemplo.
4. Sin interpretaciones sin evidencia.
5. Lo que no se sabe se lista como tarea de verificación, nunca se rellena.
6. Lo que no se pueda hacer bien se deja fuera, en vez de simularlo.

**Consecuencias:**
- El motor de la demo **no tiene puntaje ni pesos** (los de SUP-019 no tienen fuente). Compara cada criterio con los rangos de FAO EcoCrop, copiados con su cita en `backend/catalogo/`.
- Desaparecen los límites de tamaño y el umbral de representatividad inventados: se muestran los conteos reales de píxeles.
- Los datos sintéticos del prototipo (`Codigo/src/data/demo.ts`) se sustituyen por datos de la API antes de la entrega.

Detalle en [backend/DISENO.md](../plataforma/backend/DISENO.md).

### DT-17 · Solo tres fuentes de datos en la demo
**Reemplazada por DT-19 el 15/11/2026.** Tomada el 14/11/2026 (Erick). La demo usa **solo**:

| Fuente | Qué da | Escala | Acceso |
|---|---|---|---|
| **NASA POWER** (API diaria por punto) | Temperatura, lluvia, humedad, radiación | Celda de 0,5° × 0,625° (≈ 55 × 67 km en Arequipa) | Sin cuenta |
| **NDVI de MODIS** (`MOD13Q1` v061, servicio de ORNL) | Verdor de la zona cada 16 días | Píxel nominal de 250 m | Sin cuenta |
| **SoilGrids** (ISRIC) | pH y otras propiedades del suelo, predichas | 250 m | Sin cuenta |

**Consecuencias:**
- Salen de la demo HLS, SRTM y NASADEM (vía AppEEARS), IMERG, SMAP, ECOSTRESS, VIIRS y las capas de NASA GIBS. No hace falta cuenta de Earthdata.
- Ninguna de las tres fuentes describe el interior de una parcela pequeña: TARPU consulta el **centroide** de la parcela y muestra la escala de cada dato. El módulo `zonal` (estadística dentro del contorno a 30 m) deja de hacer falta.
- Precisión: POWER y SoilGrids no son imágenes de satélite. POWER combina modelos y satélites, y SoilGrids es una predicción. El único satélite directo es MODIS.
- **Afecta al área de datos:** Damaris prepara los conectores de MODIS (ORNL) y SoilGrids. Hay que confirmarlo con ella en la reunión de unión.

### DT-18 · Arequipa se analiza por sectores de altitud
**Tomada · 15/11/2026 (Erick).**

| Sector | Regiones naturales (Pulgar Vidal) | Altitud |
|---|---|---|
| **S1 · Costa y valles bajos** | Chala + Yunga marítima | 0–2300 m |
| **S2 · Valles interandinos** | Quechua | 2300–3500 m |
| **S3 · Altoandino** | Suni + Puna | 3500–4800 m |

- **Límites:** los de las regiones naturales de Javier Pulgar Vidal. **Comprobados el 15/11/2026** con la variable de piso del censo agropecuario del INEI (ver DT-20).
- **Qué define cada sector:** las variables que se muestran primero, las fuentes lentas que se piden y el orden de los criterios al comparar cultivos (orden, no pesos).
- **Uso interno:** el usuario ve un mapa normal; los sectores no se muestran como capa.
- **Ampliación:** la misma lógica servirá después para todo el Perú. Hará falta añadir las regiones de selva de Pulgar Vidal.
- **Evidencia:** la climatología regional de NASA POWER (2001–2025) muestra 0 días de helada al año por debajo de ≈ 2300 m, y de 22,8 a 319 por encima de ≈ 3500 m. Detalle en [backend/PLAN-SECTORES-AREQUIPA.md](../plataforma/backend/PLAN-SECTORES-AREQUIPA.md).
- **Cuenta de Earthdata:** la creó Erick para las fuentes que la necesitan. Las credenciales van en `backend/.env`, que git ignora; nunca en el repositorio ni en el chat.

### DT-19 · Fuentes y variables de la demo (reemplaza DT-17)
**Tomada · 15/11/2026 (Erick).** DT-17 se quedaba corta. La demo usa estas fuentes, todas medidas con peticiones reales en Majes riego y Chivay (detalle en [backend/PLAN-DATOS-SATELITALES.md](../plataforma/backend/PLAN-DATOS-SATELITALES.md)):

| Fuente | Variables | Escala | Acceso | Quién la baja |
|---|---|---|---|---|
| **NASA POWER** (diaria, comunidad AG) | 19: `T2M`, `T2M_MAX`, `T2M_MIN`, `T2M_RANGE`, `PRECTOTCORR`, `RH2M`, `T2MDEW`, `FROST_DAYS`, `ALLSKY_SFC_SW_DWN`, `ALLSKY_SFC_PAR_TOT`, `CLOUD_AMT`, `WS2M`, `GWETTOP`, `GWETROOT`, `GWETPROF`, `TSOIL1`, `TSOIL2`, `TS_MIN`, `EVLAND` | ≈ 55 × 67 km | Sin cuenta | T01 |
| **SoilGrids** (WCS) | `phh2o`, `clay`, `sand`, `silt`, `soc`, `nitrogen`, `cec`, `bdod`, `cfvo`, `wv0033`, `wv1500`; 0–5, 5–15 y 15–30 cm; media, Q0,05 y Q0,95 | 250 m | Sin cuenta | T01 |
| **FAO GAEZ v4** | Índice de aptitud de papa y cebada (riego, gravedad, secano), 1981–2010 | ≈ 9 km | Sin cuenta | T01 |
| **MODIS** (ORNL) | `MOD13Q1` NDVI y confiabilidad; `MOD16A2GF` ET y PET; `MOD11A2` temperatura de superficie de día y de noche; `MCD12Q1` cobertura `LC_Type1` | 250 m a 1 km | Sin cuenta | T01 |
| **NASADEM** (AppEEARS) | Altitud; pendiente calculada (método de Horn, clases FAO 2006) | 30 m | Cuenta Earthdata | `trabajo/extraccion_pesada/` |
| **HLS** L30 y S30 (AppEEARS) | NDVI por punto; imágenes de Chivay | 30 m | Cuenta Earthdata | `trabajo/extraccion_pesada/` |
| **SMAP** L3E y L4 (AppEEARS) | Humedad del suelo (L3 observada; L4 superficie y raíz, modelada) | 9 km | Cuenta Earthdata | `trabajo/extraccion_pesada/` |
| **IV CENAGRO 2012** (INEI) | Superficie sembrada por cultivo y piso altitudinal; meses de siembra | Unidad agropecuaria | Sin cuenta | Hecho (`backend/investigacion/`) |

**Métodos con cita** (en `backend/investigacion/`): horas de luz (FAO-56), factor K del suelo (EPIC, Sharpley y Williams 1990, ec. 2.96), factor LS (USLE, Wischmeier y Smith 1978, válido solo en pendientes de 3 a 18 %), Kc del cultivo (FAO-56, Tabla 12), rotación de sierra (SENASA, guía BPA de haba).

**Fuera:** ECOSTRESS (2 pasadas en Majes y 1 en Chivay en tres meses: demasiado irregular), `IMERG_PRECTOT` y `RZMC` de POWER (vacíos), MCD12Q2 (vacío), GLDAS por Data Rods (servicio que se da de baja).

**Consecuencias:** se necesita la cuenta de Earthdata solo para NASADEM, HLS y SMAP; esos datos se bajan una vez para los lugares de ejemplo y se guardan (no en vivo). Lo demás sigue consultándose en el centroide de la parcela, con la escala de cada dato a la vista.

### DT-20 · Qué cultivos muestra TARPU en cada sector
**Tomada · 15/11/2026 (Erick).** En cada sector (DT-18) se ordenan las especies por **superficie sembrada en el IV CENAGRO 2012**, sumando los nombres del censo que son la misma especie de EcoCrop (p. ej., maíz amiláceo, chala y choclo son *Zea mays*). Se muestran primero **las 8 con más superficie que tengan ficha de EcoCrop**; las demás con ficha van a **«ver más»**.

- Las asociaciones del censo («Haba-Maíz») y los nombres sin especie identificable no se evalúan y se listan aparte.
- «Rye grass» no dice la especie: el usuario la declara (*Lolium perenne* o *L. multiflorum*).
- El orden es por superficie de 2012, **no un puntaje**: no dice qué cultivo es mejor.
- Resultado en `backend/catalogo/sectores.json` (lo genera `backend/herramientas/generar_sectores.py`):
  - **S1:** alfalfa, arroz, maíz, tuna, olivo, cebolla, papa, ajo.
  - **S2:** alfalfa, maíz, papa, arveja, orégano, haba, cebolla, tuna.
  - **S3:** alfalfa, papa, cebada, maíz, haba, avena, olluco, arveja.
- **Límites de los pisos:** la variable `WPISO` del censo (INEI, *Guía estadística del IV CENAGRO*). En los microdatos de Arequipa, los rangos de altitud por piso coinciden con los de Pulgar Vidal (Quechua 2301–3500 m; Suni 3501–4000 m). Esto cierra el pendiente de DT-18.

### DT-21 · La API no se publica
**Reemplazada por DT-22 el 15/11/2026.** Tomada el 15/11/2026 (Erick). No se aloja la API en ningún servidor ni se ofrece como servicio. FastAPI se usa solo en local para generar los JSON (DT-13). La demo pública es el sitio estático (DT-15), que **muestra los datos y permite descargarlos** (CSV, JSON y PDF). Sin servidor no hay claves que proteger en producción ni costos de alojamiento. Consultar una parcela nueva en vivo queda para después de la hackathon.

### DT-22 · Esquema mixto: base de Arequipa y extracción por coordenada
**Tomada · 15/11/2026 (Erick).** Reemplaza DT-21. Detalle en [11-esquema-mixto.md](11-esquema-mixto.md).

- **Por coordenada, desde ya:** es la esencia de TARPU. El usuario marca su campo y TARPU extrae los datos de ese punto.
- **Capa 1, base de Arequipa:** lo estático o de celda grande (NASADEM y pendiente, SoilGrids, GAEZ, POWER, censo, sectores, cultivos y horas de luz) se baja **una vez para todo Arequipa** y se guarda.
- **Capa 2, por coordenada:** las series de satélite (MODIS, HLS, SMAP) se extraen solo para el punto del usuario, en **Google Cloud**, como un trabajo en segundo plano. **Cuando termina, se avisa al usuario** y vuelve a entrar con todo listo. Lo ya pedido se guarda y no se repite.
- **API interna:** sí se usa; es el motor. Lo que no se ofrece en la hackathon es una **API pública para terceros**, que queda como valor agregado.
- **Demo:** sigue vigente. Majes riego y Chivay se extraen **completos hoy** y se guardan, para que el jurado pruebe TARPU aunque Google Cloud o un proveedor fallen. El S2 (Cabanaconde) entra si alcanza.
- **Respaldo:** ORNL (T01) y AppEEARS (`trabajo/extraccion_pesada/`) siguen siendo la vía de respaldo de la capa 2.
- **Pendiente:** proyecto de Google Cloud con Earth Engine (lo crea Erick), servidor de la API interna, canal del aviso e identificación del usuario sin cuentas. Lista completa en [11, §6](11-esquema-mixto.md#6-por-verificar-antes-de-construir-cada-pieza).
- **Afecta a:** DT-13 (la exportación estática queda como respaldo de los lugares de ejemplo) y DT-15 (el frontend puede seguir siendo estático, pero llama a la API interna).

### DT-23 · Backend con Supabase (simulado con Docker) y despliegue en Google Cloud Run
**Tomada · 15/11/2026 (Erick).** Plan completo en [12-carpetas-docker-y-despliegue.md](12-carpetas-docker-y-despliegue.md).

- **Base de datos:** Supabase (Postgres + PostGIS + Storage). En local, con Docker y la CLI de Supabase, como en Pulse/OS; en producción, Supabase en la nube. **Reemplaza el «sin base de datos» de DT-13.**
- **API, trabajador y actualizador:** Google Cloud Run, con una sola imagen construida desde `backend/`. El trabajador toma los trabajos de una cola en la base; la web solo habla con la API.
- **Las series se guardan por celda o píxel del producto**, no por parcela. Así una parcela vecina que cae en la misma celda reutiliza la extracción.
- **Mapas grandes:** se simulan con Supabase Storage. Supabase Storage o Google Cloud Storage se decide al desplegar, con los límites reales del plan a la vista.
- **T03:** el esquema v0 deja huecos para el modelo de Damaris (variables, indicadores, vistas por pantalla y migraciones nuevas).

### DT-24 · Frontend nuevo basado en las referencias actuales

**Sustituida en ubicación y presentación por DT-25.** La conexión previa con la API se conserva en Git y en el informe 08.

**Indicada · 15/11/2026 (usuario de este chat).** Alcance de la petición de frontend.

- Construir una implementación nueva en `Codigo/`, tomando las referencias recién aportadas y el contenido actual del proyecto.
- Portada agrícola fotográfica con navegación flotante. Dashboard satelital con datos en tarjetas laterales y una ficha flotante, según las referencias que el usuario destacó.
- Letras cómodas para personas mayores, controles amplios, logo de TARPU en negro o blanco, agente y chat accesibles desde el recorrido.
- Considerar las futuras integraciones y mantener este trabajo en el frontend. La aprobación final del diseño y la conexión de servicios tienen seguimiento propio.
- Reemplaza la dirección de DT-05 para la interfaz vigente. DT-05 conserva su valor histórico para el prototipo anterior.

### DT-25 · Frontend de escritorio en `frontend/`

**Indicada por Shantall · 15/11/2026.** Alcance del área de frontend y su integración en el repositorio.

- `frontend/` contiene la implementación vigente; se retira `Codigo/` después de incorporar los cambios remotos. Las versiones anteriores permanecen en Git.
- Se conserva el trabajo actual de datos, backend, extracción, Supabase, infraestructura y entrega. No se sustituye por el estado anterior del prototipo local.
- La interfaz se diseña para computadora, con sidebar izquierda, temas claro/oscuro desde el inicio, Estudio técnico, varias parcelas y asistente de chat/voz con burbujas; avatar humano posterior.
- El frontend incorpora una muestra local de POWER y escenarios rotulados para revisar el diseño. Su conexión con el backend actual no se da por trasladada; DT-16 sigue aplicando a la entrega.
- Los registros locales anteriores de frontend se conservan en [historial](historial/decisiones-frontend-locales.md), sin reemplazar la numeración del equipo.

### DT-26 · Frontend unido: portada de Codex, panel de Shantall y datos reales

**Indicada por Erick · 15/11/2026.** Complementa DT-25 (no la reemplaza): `frontend/` sigue siendo la implementación vigente.

- **Portada:** la de Codex (la de vidrio, hasta `e08ea68`), en `frontend/src/features/landing/CodexLanding.tsx`. La portada de Shantall queda en el código, sin ruta.
- **Panel:** el de Shantall (sidebar, Mi campo, Historial, Recomendaciones, Estudio técnico e Informes), con vidrio en tarjetas, pestañas y controles del mapa, al estilo de Codex.
- **Datos:** reales, de la API (esquema mixto, DT-22), siguiendo el contrato de T03: Majes, Cabanaconde y Chivay como puntos de consulta, y el contorno dibujado con su base de Arequipa y su extracción satelital (con «Detener»). **Se retiran del selector las parcelas de ejemplo** (DT-16).
- **Mapa:** el de la pantalla de prueba (imagen nítida, zoom 21, dibujo por esquinas, campos ya analizados en el servidor). **El usuario no ve los sectores**: solo el mapa, su parcela y sus datos.
- Lo que falta pulir se acuerda después; ver [informe 17](informes/17-frontend-unido.md).

### DT-27 · Una sola carpeta para el producto: `plataforma/`

**Indicada por Erick · 15/11/2026.** Reemplaza la sección 2 de [docs/12](12-carpetas-docker-y-despliegue.md) en cuanto a la ubicación de las carpetas (el resto del plan sigue).

- `plataforma/` reúne todo TARPU: `frontend/`, `backend/` (con `investigacion/` y `catalogo/`), `supabase/`, `infra/`, `datos/` y `documentacion/` (informe maestro y modelo de datos de T03). Es lo que se prueba en local y lo que se sube a cada plataforma al desplegar.
- `npm start` en `plataforma/` enciende Docker, Supabase, la API y el trabajador, y la web. `npm run detener` lo apaga.
- Fuera quedan la organización del equipo (`docs/`, `ROADMAP.md`, `AGENTS.md`), la entrega (`entrega/`) y las tareas en curso (`trabajo/`).
- Se dejó el repositorio de siempre (`otazu-shantall/QENTARA---Tarpu-2026`); el intento de mudarlo a otro repositorio se descartó.
- Detalle en [informe 18](informes/18-carpeta-plataforma.md).

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
| Datos sintéticos en la demo | Alta | La demo muestra un valor que no viene de una fuente real | DT-16: se sustituyen todos por datos de la API; lo que no llegue no se muestra |
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

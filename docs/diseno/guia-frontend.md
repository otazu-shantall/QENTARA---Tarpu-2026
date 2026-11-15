# Guía de diseño y arquitectura del frontend

> **Frontend · 14/11/2026.** Guía de diseño y arquitectura basada en referencias visuales y revisión estática del código. Alcance vigente (DT-25): computadora, chat y voz iniciales, y avatar posterior. Documento de la fase 1 del [ROADMAP](../../ROADMAP.md); complementa la [guía del área](../areas/frontend.md) y concreta la [propuesta de frontend](../areas/propuesta-frontend.md). Distingue diseño deseado y recomendaciones. El primer prototipo ya está implementado en `frontend/` ([informe 09](../informes/09-arquitectura-y-prototipo-frontend.md)); no acredita validación con agricultores.

> **Revisión implementada vigente:** [informe 10](../informes/10-estudio-tecnico-y-conversacion.md) y [frontend/README.md](../../plataforma/frontend/README.md): Estudio técnico, conversación visual con reescucha por turnos, múltiples parcelas de ejemplo y formularios. Las descripciones de integración siguen siendo propuestas; no hay autenticación o proveedor de IA conectado.

## 1. Qué queda definido y qué sigue abierto

TARPU debe ayudar al agricultor de **Arequipa** a comprender su campo, consultar evidencia y comparar alternativas. La web se diseña para **computadora**, con ratón, teclado y sidebar izquierda. El alcance inicial sigue siendo todo Arequipa; un ejemplo de Majes o Chivay no representa todas sus condiciones agrícolas. El nuevo desarrollo se encuentra en `frontend/`. El prototipo de referencia de `Codigo/` permanece en el historial Git.

| Tema | Estado y alcance |
|---|---|
| Inicio con imagen del campo, frase y «Descubre» hacia registro/inicio de sesión | Parte del recorrido de acceso |
| Sidebar izquierda después del acceso | Navegación con etiquetas junto a iconos |
| Ubicación actual y contorno editable | Permiso de ubicación tras pulsar el botón |
| Historial ambiental y explicaciones sencillas | Cada evento conserva su evidencia y método |
| Consulta técnica secundaria | Acceso «Datos avanzados» con retorno claro |
| Asistente desde el inicio | Chat escrito y conversación por voz obligatorios; burbujas de estado como representación inicial; avatar humano animado posterior |
| Plataforma y carpeta | Web para computadora en `frontend/`; primer prototipo local disponible |
| Tema claro u oscuro | Ambas variantes implementadas; elección y pruebas con usuarios pendientes |
| Stack, autenticación, fuentes, reglas y proveedor audiovisual | Recomendaciones y decisiones pendientes con las áreas correspondientes |
| Pronósticos o posibilidades futuras | Distinguir escenarios de pronósticos. No hay capacidad predictiva validada ni se modifica la exclusión actual de SUP-037 |

Las pantallas definitivas y el contrato se acuerdan en la reunión de unión. La identidad visual y el lema siguen abiertos; el logo vigente es el monocromo de `frontend/public/brand/`.

## 2. Cómo interpretar las seis referencias

Referencias visuales del 14/11/2026, identificadas por el final de su nombre `Captura de pantalla 2026-11-14 … .png`. Son referencias externas de composición, no diseños propios ni resultados de TARPU; sus derechos de reproducción no se han comprobado.

| Captura | Qué orienta | Adaptación |
|---|---|---|
| 115220 | Imagen agrícola, frase y acción | Fotografía con permiso/procedencia, preferiblemente del contexto arequipeño; texto con contraste y «Descubre» |
| 115345 | Sidebar, panel y mapa amplio | Menú breve; controles de capas separados de navegación global |
| 115406 | Tema oscuro y eventos | Comparar lectura; evento con fecha, fuente y respaldo |
| 115423 | Tema claro y capa coloreada | Leyenda, unidad y fecha; no trasladar dosis o productividad de la referencia |
| 115515 | Aviso contextual sobre mapa | Mensaje breve y enlace a evidencia; no deducir causas del color |
| 115530 | Fechas, lista de campos y capas | Parcela activa y línea temporal sin saturar el mapa |

Se toma la jerarquía y distribución, sin copiar marcas, valores, diagnósticos o precisión aparente. Un mapa atractivo no justifica pintar indicadores no calculados.

También se revisaron visualmente las cinco referencias ya guardadas en el repositorio:

| Recurso | Aplicación al nuevo diseño de computadora |
|---|---|
| [Mapa con panel izquierdo](referencias/ref-1-mapa-con-panel-izquierdo.webp) | Resumen y controles al lado del mapa; jerarquía de indicadores |
| [Zona con panel derecho](referencias/ref-2-zona-con-panel-derecho.webp) | Detalle contextual desplegable sin perder el campo seleccionado |
| [Alerta sobre mapa](referencias/ref-3-alerta-sobre-mapa.webp) | Mensaje contextual breve con acción y acceso a evidencia |
| [Selección de parcelas](referencias/ref-4-seleccion-de-parcelas.webp) | Contorno destacado, lista de parcelas y controles de selección |
| [Landing editorial](referencias/ref-5-landing-editorial.webp) | Fotografía amplia, titular y llamada a la acción |

El logo y sus variantes siguen disponibles en `frontend/public/brand/`. Estos archivos forman parte de los recursos visuales de referencia del proyecto.

## 3. Hallazgos del código actual

Revisión estática del 14/11/2026. No equivale a ejecutar la app o repetir las pruebas históricas.

| Archivo o pieza | Existe | Desarrollo pendiente |
|---|---|---|
| `features/landing/LandingPage.tsx` | Inicio con imágenes de Esri y entrada directa a demo | Falta «Descubre» → acceso |
| `app/App.tsx` | Rutas hash manuales, contexto y persistencia local | Sin sesión; separar composición, rutas y estado |
| `components/layout/Sidebar.tsx` | Barra de 84 px y siete destinos | Comparar sidebar con palabras amplias y menú reducido |
| `features/monitor/FarmMap.tsx` | Leaflet, zoom, zonas, proveedores y errores | Sin geolocalización ni dibujo; recentrar vuelve a una zona fija |
| `features/parcels/ParcelsPage.tsx` | Ficha local sin polígono | Asigna valores ficticios de NDVI, temperatura, humedad y lluvia al crear |
| `features/climate/EvolutionChart.tsx`, `data/demo.ts` | Gráfico SVG y registros de tabla | Gráfico usa `metricSeries`; tabla usa `observations`: no comparten serie. Fechas fijadas en octubre de 2026 |
| `features/rotations/RotationsPage.tsx` | Candidatos ilustrativos | Falta comparar estrategias con la actual como base y evidencia del motor |
| `features/assistant/AssistantDrawer.tsx`, `lib/domain.ts` | Respuestas locales por palabras clave | Sin modelo, evidencia real, streaming o audiovisual |
| `features/data/DataPage.tsx`, `lib/download.ts` | Filtros, metadatos y descarga de toda la selección | Datos sintéticos; niveles solo normalizado/derivado |
| `types/index.ts` | `Parcel` mezcla identidad e indicadores obligatorios | Separar geometría, contexto, observaciones y calidad; admitir ausencia de indicador |
| `styles/base.css`, `app.css`, `tokens.css` | Tokens, foco y estilos adaptables | Cuerpo de 15 px, etiquetas de 11–13 px y botones base de 42 px requieren revisión |

Revisión histórica: rutas relativas a `Codigo/src/` en Git, anterior a DT-25. Se reutilizan componentes, logos, créditos, estados del mapa, diálogos nativos y exportaciones. `localStorage` sigue siendo almacenamiento de demostración, no gestión de cuentas privadas. Los botones de zona actualmente también pueden cambiar la parcela seleccionada; conviene separar ambas acciones.

## 4. Recorrido y pantallas

### Inicio y acceso

Imagen del campo como fondo, capa de contraste, logo y mensaje breve. **Texto de ejemplo para revisar:** «Comprende tu campo. Explora qué sembrar después». Apoyo: «Información ambiental y satelital para apoyar tus decisiones en Arequipa». No se declara este texto como lema aprobado.

**«Descubre» → pantalla de acceso → «Crear cuenta» / «Iniciar sesión».** Con sesión válida, abrir el espacio de parcelas. El valor del proyecto se explica antes de pedir datos personales. Método de acceso por acordar con Erick: evaluar enlace por correo frente a contraseña, considerando recuperación y conectividad. Un formulario visual no equivale a autenticación real.

### Espacio del agricultor

Sidebar izquierda de escritorio con logo y cuatro destinos propuestos: **Mi campo**, **Historial**, **Opciones de cultivo** y **Mis informes**. «Mi campo» incluye selector de parcelas y mapa. «Pregunta a Tarpu» es una acción persistente; ayuda, cuenta y datos avanzados tienen menor jerarquía.

La composición aprovecha el ancho de computadora: sidebar, panel de información y mapa. Se adapta a ventanas de escritorio de distinto tamaño sin ocultar acciones; teléfono y navegación inferior quedan fuera del enfoque actual.

| Pantalla | Pregunta | Acción y contenido |
|---|---|---|
| Mi campo, sin parcelas | ¿Dónde está mi parcela? | Ubicación actual o búsqueda manual → «Marcar mi parcela» |
| Delimitación | ¿Qué terreno quiero consultar? | Puntos, contorno y superficie estimada → «Guardar parcela» |
| Contexto | ¿Qué sabemos del manejo? | Cultivo actual/anterior, campaña, riego y prioridades; aceptar «No lo sé» |
| Mi campo, con parcela | ¿Qué información hay? | Resumen textual, pocos indicadores, fuente y fecha; mapa opcional |
| Historial | ¿Qué ocurrió y con qué respaldo? | Serie, eventos documentados y notas diferenciadas del productor |
| Opciones de cultivo | ¿Qué puedo considerar después? | Actual y dos alternativas como mínimo: motivos, evidencia, vacíos y riesgos |
| Pregunta a Tarpu | ¿Qué significa? | Escribir o hablar; respuesta por texto y voz, burbujas de estado y «Ver evidencia» |
| Mis informes | ¿Cómo guardo lo consultado? | Resumen y descargas; PDF diferenciado de registros reutilizables |
| Datos avanzados | ¿Cómo reviso registros y métodos? | Tabla, filtros, calidad, niveles y metadatos |

La agrupación es propuesta para la reunión. Datos detallados también se abre desde «Ver evidencia» y nunca exige ejecutar una evaluación agronómica.

### Bocetos de estructura

```text
INICIO PÚBLICO
[Logo TARPU]                                      [Iniciar sesión]
┌──────────────── Imagen referencial del campo ──────────────────┐
│  Comprende tu campo. Explora qué sembrar después.               │
│  Explicación breve para el agricultor de Arequipa               │
│                        [Descubre]                             │
└───────────────────────────────────────────────────────────────┘

ESCRITORIO · MI CAMPO
┌─────────────────┬─────────────────────────────────────────────┐
│ Logo TARPU      │ Parcela activa ▾              Fecha / cuenta│
│ Mi campo        ├──────────────────┬──────────────────────────┤
│ Historial       │ Resumen sencillo│                          │
│ Opciones cultivo│ Fuente y fecha  │         MAPA             │
│ Mis informes    │ Acción principal│ Capas / leyenda / fecha  │
│                 │ Ver evidencia   │                          │
│ Datos avanzados ├──────────────────┴──────────────────────────┤
│ Ayuda / cuenta  │                  [Pregunta a Tarpu]        │
└─────────────────┴─────────────────────────────────────────────┘

ASISTENTE EN COMPUTADORA · PANEL LATERAL
[Conversación sobre la parcela activa]        [Cerrar]
[Burbujas + estado: Escuchando / Preparando / Hablando]
[Transcripción y respuesta con evidencia]
[Escribir pregunta] [Enviar] [Hablar] [Detener]
```

Son bocetos de distribución. La comparación visual de alta fidelidad y las pruebas con agricultores siguen pendientes.

## 5. Geolocalización y contorno

La parcela se delimita mediante un **polígono por puntos con vértices movibles**. Arrastrar un único marcador no identifica todo el terreno.

1. «Usar mi ubicación» explica su finalidad y solicita permiso solo después del clic. La página no puede forzar «Permitir». La API requiere contexto seguro y permiso explícito ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition)).
2. Mostrar posición y precisión aproximada. Es la ubicación del dispositivo, que puede estar lejos del campo; no es el contorno ni una confirmación de propiedad.
3. Mantener alternativa manual: buscar localidad, mover el mapa o introducir coordenadas. El geocodificador está por elegir; sin él se conserva navegación manual. Fuera de Arequipa, explicar el alcance y permitir volver sin inventar un análisis local.
4. «Marcar mi parcela» activa dibujo: cada clic fija una esquina y una línea provisional muestra el siguiente segmento. Añadir alternativa con teclado y controles «Añadir punto»/«Deshacer» para no depender de arrastre preciso.
5. «Cerrar contorno» necesita al menos tres vértices distintos y geometría válida; también puede cerrarse en el primer punto. Ofrecer «Deshacer punto», «Cancelar» y una instrucción corta.
6. Antes de guardar se pueden mover esquinas y reiniciar. Mostrar distancias en m/km y superficie estimada en ha; no calcular áreas como grados cuadrados. El backend valida geometría y devuelve superficie canónica y versión.
7. Guardar nombre y contexto tras confirmación. Modificar contorno crea versión; resultados anteriores mantienen la geometría con que se calcularon.

Cubrir permiso denegado, posición no disponible, tiempo agotado, baja precisión, mapa sin conexión, contorno cruzado y cancelación. No rastrear continuamente para dibujar; mantener el borrador separado del registro guardado. No enviar ubicación del dispositivo al avatar. El backend debe validar la pertenencia territorial con una referencia adecuada si se restringe el análisis a Arequipa.

## 6. Capas, históricos y posibilidades futuras

El mapa base ubica el campo; la capa científica requiere datos georreferenciados y método. El polígono no crea precisión adicional. Mostrar **variable, unidad, fecha de observación, fuente, escala, cobertura válida y leyenda**; las áreas sin datos permanecen identificadas.

| Interés | Presentación | Condición |
|---|---|---|
| Calor | Temperatura del aire o de superficie, identificadas por separado | Producto y significado definidos; no intercambiar magnitudes |
| Humedad | Del aire o del suelo; profundidad cuando proceda | Humedad relativa de POWER no es humedad del suelo |
| Vegetación | «Verdor observado (NDVI)» y evolución | Calidad e índice comprobados; no equivale a fertilidad o diagnóstico |
| Lluvia | Acumulado del período y cobertura | Conservar faltantes y distinguir suma parcial |
| Sequía o episodios de calor | Evento documentado o indicador con método | No declarar sequía solo porque llovió poco ni ola de calor por un máximo aislado |
| Notas del agricultor | «Registrado por el productor», con fecha | No confundir declaración con detección satelital |

La primera muestra es POWER para Majes en 2025, todavía fuera de la app. Su API diaria entrega series meteorológicas y solares ([NASA POWER](https://power.larc.nasa.gov/docs/services/api/temporal/daily/)); la resolución depende de la variable ([tutorial](https://power.larc.nasa.gov/docs/tutorials/service-data-request/api/)). Un año no basta para inventar una climatología extensa.

MODIS/VIIRS, HLS, GIBS, SoilGrids, IMERG, SMAP y ECOSTRESS son candidatos según el [análisis interno](../../plataforma/datos/analisis-recursos.md); no quedan seleccionados por esta guía ni se ha repetido aquí su prueba de acceso. Una imagen GIBS sirve para visualizar; el cálculo necesita el producto numérico apropiado.

**Historial:** explicación del período antes de la serie. Resumen, gráfico, tabla, agente y descarga usan la misma consulta. Lagunas visibles, sin rellenar cero o dibujar continuidad falsa; avisar si las capas tienen fechas distintas.

**Escenario:** «Qué cambiaría si dispongo de menos agua» expresa una condición elegida y resultados de reglas explícitas. Conserva entradas, método, incertidumbre y faltantes; no promete que ese futuro ocurrirá.

**Pronóstico:** exige una fuente/modelo apto, con emisión, horizonte, validez, escala y validación. No extrapolar el gráfico en el frontend ni tratar una respuesta del agente como predicción. Se mantiene fuera de la primera aceptación (SUP-037) hasta definir metodología y respaldo con datos/backend.

**Orientación agrícola local:** pedir localidad, altitud con fuente cuando corresponda, variedad, historial, riego y prioridades. Costa irrigada y sierra no reciben una única receta. Papa, quinua, haba y cebada siguen siendo candidatos por revisar; no son recomendaciones para cualquier parcela. El motor puede devolver «No evaluable». Dosis, fechas precisas, rentabilidad y rendimiento requieren metodologías adicionales.

## 7. Experiencia sencilla y datos avanzados

La vista inicial responde una pregunta con lenguaje cotidiano. Cada tarjeta explica qué vemos, de dónde sale y qué falta; el término técnico queda disponible como detalle.

«Datos avanzados» aparece al final de la sidebar o en «Más», con descripción «Registros, unidades y métodos». Su entrada es deliberada; conserva parcela/filtros, muestra una etiqueta de vista avanzada y «Volver a Mi campo». No se activa automáticamente por tocar el mapa o conversar.

Esta separación organiza información; **no controla permisos**. Todo usuario autorizado sobre su parcela puede consultar su evidencia, incluido el agricultor. Si se necesitan restricciones por rol, las aplica el backend. No se exige ser especialista ni solicitar una comparación para acceder a registros.

Distinguir original del proveedor, normalizado y derivado. PDF resume; CSV/JSON conservan registros, unidades, fechas, procedencia y faltantes. No incluir regiones de teselas del mapa base en exportaciones.

## 8. Chat y voz desde el inicio; avatar posterior

El asistente incluye **chat escrito y conversación por voz desde el inicio**. Ambos usan parcela/período, preguntas sugeridas, evidencia enlazable y reconocimiento de insuficiencia. **El agente explica y el motor evalúa.** No añade mediciones ni cambia reglas. La voz comprende entrada por micrófono, transcripción y respuesta hablada; no se reduce a leer un texto ya escrito.

Al principio el asistente se representa mediante burbujas, sin imagen humana. Sus estados reflejan el proceso real: «Escuchando» cuando el micrófono está activo, «Preparando respuesta» durante el procesamiento y «Hablando» al reproducir audio. Se muestra texto de estado y alternativa con movimiento reducido; las burbujas no fingen una llamada conectada ni una respuesta que aún no existe.

Ampliación deseada: mujer u hombre virtual con voz y movimiento labial sincronizado. Un bucle moviendo la boca no equivale a una conversación en tiempo real. Texto, audio y video deben corresponder a la misma respuesta y turno.

Flujo propuesto: pregunta escrita o audio voluntario → backend autoriza contexto → agente consulta evidencia → respuesta/referencias → voz → avatar sincronizado → navegador. Interrumpir cancela la salida pendiente. Claves permanentes en servidor; al cliente solo credenciales temporales, limitadas a la sesión prevista.

| Modalidad | Criterio de incorporación |
|---|---|
| Texto inicial obligatorio | Evidencia comprobable y errores controlados |
| Voz inicial obligatoria | Escucha, transcripción, respuesta hablada en español, interrupción y controles |
| Burbujas iniciales | Estado real de escucha, procesamiento y reproducción; alternativa sin animación |
| Avatar posterior | Sustituye la representación visual; mantiene conversación, evidencia, controles y voz |

LiveAvatar es un candidato a estudiar: su documentación describe sesiones y transporte WebRTC; eso no verifica su precio, calidad en español o adecuación para TARPU ([referencia oficial](https://liveavatar.readme.io/reference/create_session_token_v1_sessions_token_post)). Los proveedores de agente, voz y avatar están pendientes de selección.

Controles: escribir, activar/desactivar micrófono, reproducir/detener voz, interrumpir y ocultar video. Permiso de micrófono solo al usarlo; cámara del usuario innecesaria. Si falla el audiovisual, continuar por texto sin perder contexto. Cerrar libera micrófono/conexión.

Mostrar «Asistente virtual de IA» y marca visible de IA en imagen/video generados, conforme a las reglas del proyecto. No presentar al personaje como agrónomo real ni usar una imagen sin derechos. Género, apariencia y voz quedan abiertos y no bloquean el chat.

## 9. Comparar variante clara y oscura

Ambas usan contenido, estructura y controles equivalentes. El tema no cambia el grado de evidencia o significado de las capas.

| Aspecto | A · Paneles claros | B · Paneles oscuros |
|---|---|---|
| Sidebar | Verde bosque y logo blanco | Verde casi negro y logo blanco |
| Contenido | Fondo cálido y tarjetas blancas | Carbón y superficies diferenciadas |
| Mapa | Imagen satelital con paneles claros | Misma imagen con paneles oscuros |
| Ventaja a comprobar | Lectura de texto y tablas | Separación entre controles e imagen |
| Riesgo a comprobar | Gris tenue y contraste sobre imágenes claras | Reflejos, contraste y lectura prolongada |

Recomendación: A como primera candidata, comparada con B en la misma computadora y contenido. Probar lectura, elección de parcela, fecha, acceso a evidencia y uso del asistente con teclado/micrófono. **No hay variante elegida.**

Tokens candidatos: cuerpo de 18 px, contenido mínimo de 16 px; interlineado aproximado 1,5; controles de al menos 48 px; espaciado consistente 8/16/24/32 px; sidebar propuesta 240–264 px. Son valores por comprobar, no una identidad aprobada. Sans serif para lectura/controles; serif en titulares si conserva legibilidad. En imágenes, fondo de contraste detrás del texto.

Contraste mínimo 4,5:1 para texto normal; foco, teclado, ampliación de texto, lector de pantalla y movimiento reducido. No comunicar estados solo por color. El tamaño táctil de 48 px es una regla del proyecto, no una cita del mínimo AA ([WCAG 2.2](https://www.w3.org/TR/WCAG22/)).

## 10. Arquitectura y herramientas recomendadas

Base implementada para el prototipo en `frontend/`: **React + TypeScript + Vite** y organización por funcionalidades, tomando el prototipo como referencia y separando interfaz, contratos y adaptadores. La calidad visual depende de jerarquía, consistencia y revisión de estados. React Router, TanStack Query, Zod, Leaflet y CSS con tokens forman la base actual (DT-25); el stack de producción sigue abierto.

| Pieza | Recomendación y motivo |
|---|---|
| Aplicación | Conservar stack existente. No se identificó un requisito de renderizado de servidor que justifique migrar a Next.js ahora |
| Navegación | React Router declarativo para acceso, rutas públicas y espacio de trabajo; hash o URLs normales según hosting ([documentación](https://reactrouter.com/start/declarative/installation)) |
| Estado remoto | TanStack Query al conectar API: caché, carga, invalidación y errores; caché no equivale a persistencia ([documentación](https://tanstack.com/query/latest/docs/framework/react/overview)) |
| Estado visual | Hooks locales y Context pequeño para paneles, tema y borrador geométrico; separados de respuestas del servidor |
| Contratos | Zod en frontera de API para validar JSON recibido; TypeScript no lo valida en ejecución ([documentación](https://zod.dev/basics)) |
| Formularios | HTML semántico primero; React Hook Form si crecen pasos y validaciones; validación también en servidor ([documentación](https://react-hook-form.com/get-started)) |
| Componentes | CSS propio con tokens; Radix Primitives en controles complejos cuando aporte foco/teclado. No certifica la app ([accesibilidad](https://www.radix-ui.com/primitives/docs/overview/accessibility)) |
| Mapa/editor | Conservar Leaflet; candidato Leaflet-Geoman Free para dibujo/edición. Verificar versión, licencia y funciones Free antes de instalar ([dibujo](https://geoman.io/docs/leaflet/modes/draw-mode), [comparación oficial](https://geoman.io/comparisons/leaflet-geoman-vs-leaflet-draw)) |
| Mayor carga cartográfica | Evaluar MapLibre GL JS si se justifica por capas/rendimiento; su renderizador usa WebGL. No hace falta migrar para dibujar un contorno ([documentación](https://maplibre.org/maplibre-gl-js/docs/)) |
| Gráficos | Conservar SVG para series sencillas: arreglar consistencia, huecos, ejes y tabla alternativa antes de sumar librerías |
| Marca/iconos | Lucide y logos existentes; cada icono con palabra |
| Pruebas | Mantener `node:test` y Playwright; ampliar casos con cada recorrido implementado |

No sumar simultáneamente Tailwind, otro kit visual y el CSS existente. Si se elige shadcn/ui u otra base, resolver tokens y mantenimiento como una decisión propia. Figma es una opción para comparar bocetos.

### Estructura de destino propuesta

```text
frontend/src/
  app/                  rutas, composición y proveedores
  components/
    layout/             PublicLayout, WorkspaceLayout, Sidebar
    ui/                 Button, Field, Dialog, EmptyState
  features/
    landing/            inicio público
    auth/               acceso y estado de sesión
    parcels/            selección, geometría y contexto
    monitor/            mapa, capas, editor y geolocalización
    climate/            series e historial
    rotations/          comparación y escenarios
    assistant/          chat, voz y burbujas; adaptador de avatar posterior
    data/               vista avanzada y exportación
    reports/            resúmenes
  services/
    api/                cliente, contratos y validación
    adapters/           implementación demo o HTTP
  types/                entidades separadas
  lib/                  utilidades puras
  data/                 fixtures identificados como demo
  styles/               tokens, base, temas y composición
```

La estructura muestra la separación objetivo. La implementación actual, más compacta, está descrita en [frontend/README.md](../../plataforma/frontend/README.md): contratos y adaptadores en `services/`, mapa/editor encapsulado y voz en un hook. No se han creado directorios vacíos para funciones futuras. Flujo: pantalla → hook de funcionalidad → servicio/contrato → API. Componentes comunes no importan fixtures o reglas agronómicas. Editor, voz y avatar quedan detrás de adaptadores, sin propagar objetos de sus SDK por toda la app.

Separar `Parcel` (identidad/versiones), `ParcelGeometry`, `FarmContext`, `Observation`, `EvidenceSummary` y `Evaluation`. Indicadores ausentes usan `null` y motivo; una parcela nueva no recibe valores ficticios por defecto. Procedencia distingue sintético, proveedor y declaración del productor, además del nivel original/normalizado/derivado.

Claves de consulta incluyen usuario/espacio autorizado, parcela/versión, fuente, variables y período según recurso. Cerrar sesión limpia caché privada y conexiones. Reintentos no duplican creaciones; una ruta protegida en React no sustituye autorización del backend.

Cargar mapa y audiovisual bajo demanda; no abrir video al entrar a la app. Conservar parcela/período en URL cuando sea adecuado, sin tokens ni conversaciones privadas. Datos cacheados muestran fecha; no prometer procesamiento remoto sin red.

## 11. Matriz para acordar con Erick y Damaris

Contrato de datos pendiente de coordinación entre frontend, backend y datos. Cruzar con [borrador del backend](../../plataforma/backend/README.md).

| Pantalla | Datos mínimos | Estados |
|---|---|---|
| Acceso | Sesión, usuario, expiración y errores | Sin sesión, enviando, error y vencida |
| Parcelas | ID, nombre, ubicación, geometría/versiones y superficie | Vacío, carga, fallo y sin permiso |
| Delimitación | GeoJSON, origen, validación y versión | Borrador, inválido, guardando, conflicto y guardado |
| Contexto | Cultivo, variedad, campaña, riego y prioridades; desconocidos | Incompleto y guardado |
| Resumen/mapa | Indicadores, unidad, procedencia, escala, calidad y descriptor de capa | Real/demo por elemento, parcial, sin cobertura y fuente caída |
| Historial | Observaciones y eventos con método/referencia; notas separadas | Sin evento documentado, período vacío y dato antiguo |
| Comparación | Actual + alternativas, condiciones, motivos, evidencia, faltantes, riesgos y versión de reglas | Procesando, experimental, revisión y no evaluable; puntaje opcional |
| Chat | Turno, contexto autorizado, respuesta y referencias | Respondiendo, cancelado, sin respaldo y fallo |
| Voz inicial y burbujas | Captura voluntaria, transcripción, audio de respuesta y estado del mismo turno | Escuchando, preparando, hablando, interrumpido, permiso denegado y error |
| Avatar posterior | Sesión efímera, medio y estado del mismo turno | Conectando, hablando, interrumpido y retorno a texto |
| Datos avanzados | Selección, registros, niveles, metadatos, cobertura, paginación y total | Vacío, descarga, error y selección demasiado grande |
| Informes | Copia de selección/resultados, versiones, fecha y advertencias | Preparando, disponible, vencido y fallido |

No todas las variables existen para toda fecha/lugar. Evitar un indicador global de «datos reales» si se mezclan ejemplos y observaciones. Distinguir fallo de proveedor de evaluación sin evidencia suficiente.

## 12. Entregables y comprobación

Para la reunión: propuesta del área, bocetos de estructura, variantes por comparar y matriz de datos. La guía y propuesta están redactadas; faltan comparación visual de alta fidelidad, elección de tema y pruebas con agricultores.

Orden de construcción por dependencias: navegación/componentes para computadora → acceso según contrato → parcela/contexto → consulta real compartida por resumen, gráfico, tabla y archivo → comparación explicada y asistente por chat/voz con burbujas → avatar y ampliaciones. Chat y voz pertenecen al alcance inicial aunque se construyan por pasos. Este orden no sustituye la asignación de tareas de la fase 2.

Criterios de aceptación de la implementación:

- «Descubre» lleva al acceso; sesión válida abre su espacio y sesión vencida se explica.
- Denegar ubicación permite continuar manualmente; no se solicita al cargar la landing.
- Crear/cerrar/corregir/cancelar polígono funciona; guardar no inventa indicadores.
- Navegar por zonas no cambia silenciosamente la parcela activa.
- Resumen, gráfico, tabla, respuesta y descarga coinciden en evidencia y período.
- Sin cobertura no se colorea el campo como sano/seco; faltantes no son cero.
- Comparación incluye actual y dos alternativas; puede declarar no evaluable sin puntaje.
- Datos avanzados tiene entrada deliberada, retorno y autorización coherente.
- Chat y voz reconocen insuficiencia; burbujas corresponden al estado real, la voz se puede interrumpir y cerrar libera micrófono/conexiones. Si falla la voz, el chat sigue disponible, pero una vista de solo texto no completa el requisito de voz.
- Computadora, ratón, teclado, contraste, ampliación de texto y fallo de red permiten el recorrido esencial.

Al modificar código: `npm --prefix frontend run build`, `npm --prefix frontend test` y `npm --prefix frontend run test:ui`, con `dev` en 5174. Hay once pruebas de dominio y recorrido de escritorio, incluidos estados de voz simulados.

Las fuentes web enlazadas se consultaron el 14/11/2026 para fundamentar recomendaciones; no constituyen pruebas de versiones, coste o rendimiento en TARPU. La [guía del área](../areas/frontend.md) conserva comandos de ejecución y localización de archivos.

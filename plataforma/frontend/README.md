# TARPU · Frontend de escritorio

Prototipo local con inicio panorámico, acceso, múltiples parcelas, lectura ambiental sencilla, historial, Estudio técnico, catálogo de cultivos y conversación por voz. Los temas claro y oscuro siguen disponibles para comparar. La identidad visual y la validación con agricultores permanecen abiertas.

## Presentación visual vigente

La cabecera del inicio utiliza vidrio con opacidad moderada, ocupa todo el ancho y permanece fija al borde superior, sin márgenes laterales ni esquinas redondeadas. La navegación a Equipo encuadra la sección sin dejar contenido anterior visible. La sidebar tiene transparencia y desenfoque con paletas propias clara y oscura. Los títulos son más contenidos y el texto principal más grande. Las barras de desplazamiento se ocultan visualmente; las páginas y tablas siguen admitiendo desplazamiento, y las tablas extensas reciben foco por teclado.

En las parcelas de ejemplo, «Mapa base», «Calor», «Humedad del suelo» y «Vegetación» cambian la representación del contorno. Los patrones espaciales son sintéticos, fijos y recortados a la parcela; no son mediciones satelitales ni datos regionales interpolados por píxel. Se identifica su origen en el mapa. Las parcelas reales o declaradas no reciben esos patrones. En el historial, la humedad del aire y la lluvia no se sustituyen por una capa de suelo.

El catálogo se ordena de mayor prioridad a menor en los ejemplos, con una primera opción destacada; la prioridad es una secuencia ficticia por escenario. Las parcelas reales o declaradas conservan el estado sin evaluación y no reciben un orden recomendado. Los gráficos sencillos y técnicos tienen colores por variable y modos de área, líneas y barras, sin cambiar los registros ni completar huecos.

En el mapa compacto de Historial, los controles están a la izquierda y la leyenda abajo a la derecha, conservando las dimensiones del mapa.

Detalles: [informe visual](../../docs/informes/11-vidrio-capas-y-graficos.md) y [ajuste de cabecera y controles](../../docs/informes/12-cabecera-continua-y-controles-mapa.md).

El inicio comparte la paleta del dashboard y permite alternar entre tema claro y oscuro desde la navbar. La elección se conserva al recargar y al entrar en acceso o en el espacio de trabajo. La imagen satelital principal, la estructura sin galería adicional y el pie compacto se mantienen. La sección del equipo utiliza el nuevo logo QENTARA. [Recursos y procedencia](ASSETS.md); [presentación vigente](../../docs/informes/15-tema-publico-y-logo-qentara.md).

## Ejecutar

Desde la raíz del repositorio, con Node.js 24 o posterior:

```powershell
npm --prefix frontend ci
npm --prefix frontend run dev
```

Abrir [http://127.0.0.1:5174/](http://127.0.0.1:5174/), pulsar «Descubre TARPU» y entrar mediante el formulario de prueba o «Entrar al prototipo sin completar datos».

```powershell
npm --prefix frontend run build
npm --prefix frontend test
npm --prefix frontend run test:ui
```

La suite de Chrome requiere `dev` encendido y Google Chrome instalado. Capturas en `frontend/test-results/` y build en `frontend/dist/`, ambos ignorados por Git. `npm --prefix frontend run format` aplica Prettier. La carpeta `Codigo/` fue retirada (DT-25). Su implementación y la conexión anterior con la API permanecen en Git hasta `e08ea68`; no están trasladadas automáticamente a este prototipo.

## Recorrido y datos

| Ruta | Función |
|---|---|
| `#/` | Imagen de lado a lado, barra superior compacta, «Descubre» en la primera vista y sección de QENTARA |
| `#/acceso` | Crear cuenta: nombres, apellidos, DNI opcional, correo, usuario, contraseña y confirmación; acceso: usuario y contraseña |
| `#/app` | Selector de parcela, mapa, contexto y lectura sencilla de frío, calor y agua |
| `#/app/parcela/nueva` | Dibujo, cierre, edición y guardado del contorno declarado |
| `#/app/historial` | Variables por día, semana o mes, rango de fechas e intervalos; sucesos ficticios en los ejemplos |
| `#/app/estudio-tecnico` | Series, registros completos, diccionario, fuentes/calidad y exportación |
| `#/app/datos` | Acceso compatible que redirige a Estudio técnico |
| `#/app/opciones` | Catálogo por hortalizas, legumbres, frutas y flores, fichas y comparación con la continuidad |
| `#/app/informes` | Resúmenes locales descargables como JSON; PDF pendiente |
| Panel del asistente | Chat escrito y acceso a la sala de conversación con burbujas |
| Mi proveedor de IA | Selección de preferencia y condiciones; cuenta aún sin vincular |

El selector distingue tres clases de parcela:

- **Ejemplo:** Los Olivos y El Molino, con contornos ficticios y 304 registros diarios sintéticos entre enero y octubre de 2026. Permiten ver todas las variables; no representan mediciones, diagnósticos, alertas reales ni resultados de un motor. La ubicación no determina una zona climática ni dispara reglas territoriales.
- **Referencia real:** punto de Majes con 365 registros de NASA POWER de 2025, empaquetados desde el CSV normalizado y su procedencia en `datos/muestras/`. Se conservan las seis variables disponibles: temperatura media, máxima, mínima, lluvia, humedad del aire y radiación solar. No es una consulta en vivo ni una medición dentro de un polígono.
- **Declarada:** un contorno creado en el editor y su contexto básico. No hereda valores de las otras parcelas y muestra faltantes hasta asociar una consulta real.

Una banda de procedencia identifica el origen en todas las pantallas del espacio de trabajo. La parcela activa se conserva en este navegador; las descargas incluyen su identificador y el origen. NDVI, humedad del suelo y temperatura superficial tienen valores solo en los escenarios ficticios; sus productos reales están sin conectar. No hay clasificación costa/sierra por coordenadas.

## Arquitectura

SPA modular con React, TypeScript y Vite; rutas hash con React Router, evidencia con TanStack Query, esquemas Zod, mapas Leaflet y CSS con tokens. Las rutas de consulta y el mapa se cargan bajo demanda.

| Capa | Ubicación | Responsabilidad |
|---|---|---|
| Composición | `src/app/` | Rutas, contexto estable, proveedor, parcela, período y tema |
| Presentación | `src/components/` | Layout, iconos y diálogo nativo con foco/restauración |
| Funcionalidades | `src/features/` | Inicio, acceso, parcelas, mapa, clima, catálogo, asistente, estudio e informes |
| Contratos/adaptadores | `src/services/` | `EvidenceRepository` y `AssistantService`; implementación local reemplazable |
| Entidades | `src/types/domain.ts` | Tipos, origen, unidades, frecuencia y validación en ejecución |
| Lógica pura | `src/lib/` | Contorno/GeoJSON, resúmenes, agregación y exportación del estudio |
| Datos | `src/data/` | Muestra real, escenarios sintéticos separados y fichas con referencias |
| Sistema visual | `src/styles/` | Tokens, componentes, composición y ampliación de pantallas |

El objeto de Leaflet no sale del componente del mapa. La geometría usa `[longitud, latitud]`. Cambiar de parcela desmonta el mapa anterior y cancela sus animaciones antes de reconstruir la vista. El historial y el estudio usan las mismas observaciones seleccionadas, con rangos compartidos. Agrupar por semanas o meses no cambia la frecuencia de una fuente.

La agregación usa medias de valores válidos y suma de lluvia diaria. Las semanas empiezan el lunes. No se interpola; un intervalo parcial conserva el número de registros válidos. La humedad del aire no se interpreta como humedad del suelo; NDVI no equivale a fertilidad; una mínima no demuestra daño por helada y la falta de lluvia no diagnostica sequía.

## Descargas para estudios

| Formato | Contenido | Uso |
|---|---|---|
| CSV UTF-8 | Fechas, todas las variables disponibles, unidades en encabezados, parcela, origen, fuente y advertencia | Excel, R, Python |
| JSON | Registros y manifiesto: parcela, selección, unidades, procedencia, frecuencia, nivel, faltantes y límites | Análisis reproducible e integración |
| GeoJSON | Polígono, identificador, nombre y origen declarado/sintético | QGIS y otros SIG |

Se respeta el período y la búsqueda por fecha, sin limitar la descarga a la página de tabla visible. Los faltantes son `null` en JSON y celdas vacías en CSV. GeoJSON se habilita solo con un contorno válido; la referencia de Majes no lo tiene. No se descargan teselas ni capas ráster. GeoTIFF y NetCDF requerirían productos reales y un servicio de exportación; no se ofrecen como descargas ficticias.

## Conversación de voz y cuenta de IA

El chat escrito conserva sus mensajes. La conversación de voz abre una sala con aura y burbujas que representan conexión, escucha, preparación, respuesta y pausa; no muestra el dictado como un mensaje que haya que enviar. Hay inicio, pausa/reanudación, finalización, escucha de ejemplo sin micrófono y subtítulos opcionales de la respuesta.

La **prueba actual es por turnos**: reconocimiento del navegador → respuesta guiada local → síntesis → nueva escucha automática. Requiere permiso solo al iniciar; los servicios del navegador pueden procesar audio. No existe streaming bidireccional, interrupción natural de una respuesta por voz ni IA remota conectada. Cerrar la sala, cambiar de parcela o finalizar cancela reconocimiento, síntesis, solicitudes y temporizadores. El avatar humano permanece como ampliación posterior.

La preferencia OpenAI/Gemini/Claude se guarda sin claves, tokens ni contraseñas. No inicia OAuth, vincula cuentas, consulta saldo ni cobra. Una suscripción del chat no habilita automáticamente cualquier aplicación externa: OpenAI separa la API de ChatGPT y contempla créditos vinculables en planes elegibles; Gemini tiene acceso y facturación de API propios; Anthropic también distingue la API de sus planes de chat. No hay un precio de TARPU aprobado ni un plan garantizado por S/20.

Para voz de IA realmente fluida, el frontend debe consumir una sesión temporal autorizada: por ejemplo WebRTC con OpenAI o Live API con Gemini. La emisión de credenciales temporales, el acceso, los límites y la facturación requieren coordinación con backend. Claude necesitaría además una capa de audio elegida y evaluada. Esta revisión no modifica el backend ni incorpora claves al navegador.

Fuentes oficiales consultadas: [OpenAI: facturación](https://help.openai.com/en/articles/9039756-managing-billing-for-chatgpt-and-the-api-platform), [OpenAI: voz con WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc), [Gemini: facturación](https://ai.google.dev/gemini-api/docs/billing), [Gemini: credenciales temporales](https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens), [Anthropic: planes y API](https://support.claude.com/en/articles/9876003-why-is-claude-api-usage-billed-separately-from-my-paid-claude-plan).

## Acceso y privacidad del prototipo

Las pantallas de acceso y registro comparten los tokens de color de la aplicación y se adaptan al tema claro y oscuro. La cabecera pública mantiene una opacidad moderada y su botón de acceso utiliza verde. [Revisión de paleta](../../docs/informes/13-paleta-de-acceso.md).

`type="password"` oculta los caracteres; eso no cifra ni autentica una contraseña. Los campos tienen `autocomplete` de usuario, contraseña actual/nueva, nombre y correo. El guardado y la sincronización con el Administrador de contraseñas de Google dependen del navegador y de la integración real de acceso; el frontend no los fuerza ni afirma haberlos realizado. [Ayuda oficial de Chrome](https://support.google.com/chrome/answer/6197437?hl=es-419).

Los formularios validan campos, DNI opcional de ocho dígitos, correo y coincidencia de contraseñas. No se crean cuentas reales. Se guarda solo el nombre de la sesión; «Recordar mi usuario» conserva únicamente ese usuario. DNI, correo y contraseñas no se persisten ni envían. Parcelas, tema, resúmenes, preferencia de proveedor y parcela activa son locales. No hay sincronización ni autorización multiusuario.

## Catálogo para Arequipa

Ocho fichas permiten explorar cebolla, ajo, haba, arveja, palta, uva, rosa y clavel. No se filtran por clima, altitud ni coordenadas de la parcela y no tienen puntajes de aptitud. Se pueden comparar hasta tres alternativas junto al cultivo actual. Se muestran condiciones por revisar y faltantes, sin dosis ni fechas de siembra prescritas.

Las fichas de cebolla, ajo, palta y uva enlazan antecedentes regionales; haba tiene una guía general. Arveja y flores conservan rótulos de ejemplo o documentación pendiente; su presencia en el catálogo no acredita aptitud para Arequipa. Las pautas de preparación son preguntas de revisión sobre suelo, agua, historial y contexto local, no un tratamiento agronómico.

Fuentes: [MIDAGRI/AGROIDEAS: cultivos en Majes](https://www.gob.pe/institucion/agroideas/noticias/1387514-midagri-impulsa-reconversion-productiva-en-beneficio-de-pequenos-agricultores-de-uva-en-arequipa), [SENAMHI: calor y ajo en Arequipa](https://www.gob.pe/institucion/senamhi/noticias/1003142-arequipa-temperaturas-calidas-durante-verano-2024-afectaron-el-rendimiento-del-ajo), [SENASA: buenas prácticas para haba](https://www.gob.pe/institucion/senasa/informes-publicaciones/939548-guia-de-buenas-practicas-agricolas-para-cultivo-de-habas).

## Verificación y límites

Once pruebas de dominio (incluidas capas y prioridad de ejemplo): geometrías, área, faltantes, ventanas, aislamiento de parcelas, respuestas guiadas, agregación temporal y exportación con procedencia. Chrome verifica hero/CTA en 1280×768, 1440×900 y 1920×1080; formularios sin persistir secretos; selección, historial, estudio, descargas, catálogo, voz, pausa, permisos denegados y cuatro vistas sin desborde en tres anchos. También se comprueban cabecera fija, vidrio, tipografía, capas aisladas, prioridad por ejemplo y gráficos por tipo. Los estados de audio se verifican con dobles de Web Speech; una conversación con micrófono y altavoz reales permanece pendiente.

No hay backend, autenticación real, modelo de IA, diagnóstico, pronóstico ni motor de recomendaciones. El mapa y la imagen Esri requieren conexión; los datos empaquetados son locales. La accesibilidad y comprensión con agricultores, el PDF y la versión en inglés de la entrega siguen pendientes. El prototipo no certifica ningún resultado de campo.

## Estado de integración con el equipo

Se mantienen las áreas actuales de backend, datos, extracción, Supabase e infraestructura. Este frontend conserva sus adaptadores locales; el contrato vigente de [T03](../documentacion/modelo-de-datos/contrato-pantallas.md) y los endpoints del [backend](../backend/README.md) todavía deben conectarse. La integración anterior es referencia histórica en los informes [07](../../docs/informes/07-frontend-nuevo.md) y [08](../../docs/informes/08-frontend-conectado-api.md). Los ejemplos del prototipo no cumplen por sí solos la regla de la demo DT-16.

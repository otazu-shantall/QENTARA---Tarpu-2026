# 23 · Correcciones de datos, tutorial y asistente dentro del chat

> 15/11/2026. Petición de Erick tras la revisión 22. Implementación y documentación con asistencia de IA (Codex), declaradas en `entrega/uso-de-ia.md`.

## Repositorio y alcance

Primero se subió el estado previo a `origin/main`, incluido el informe 22, en `a502fca`. Después se aplicaron estas correcciones en `plataforma/`. No se ejecutó un despliegue público.

## Correcciones

- **Rotación:** formulario por parcela, recuperación de su propio contexto guardado y cancelación de peticiones al salir. Una respuesta de A no se muestra bajo B. El motor recibe el contexto de la propia petición para evitar leer el de otra comparación concurrente.
- **MODIS:** unión por fecha sin restringirse al calendario de POWER. Los días satelitales nuevos conservan clima y lluvia ausentes como `null`; se ordenan las fechas y se mantiene el control de fiabilidad de NDVI.
- **Caché:** vigencia acotada y anulación explícita al reintentar o completar una extracción. La cancelación también comprueba la parcela activa.
- **Archivos entre servicios:** el trabajador publica CSV y JSON de la extracción en Storage antes de registrar la celda. La API interna consulta Storage aunque no tenga el disco del trabajador. Las rutas del trabajo se traducen a nombres portables; se rechaza salir del almacén. El modo de archivos local continúa disponible.
- **Tutorial:** posición calculada con el tamaño real de la tarjeta y de la ventana; resaltado recortado a la vista; navegación y salida visibles. Si el texto necesita más espacio, se desplaza dentro de la tarjeta. Foco de teclado contenido y restaurado al cerrar.
- **Chat y voz:** conversación en el mismo panel, con orbe animado según escucha, preparación y habla. El reconocimiento, la respuesta, los mensajes y la reproducción comparten el mismo recorrido. Pausar, detener o cerrar cancela la entrada y la respuesta pendiente; no se abre la antigua ventana de voz.
- **Lluvia:** la respuesta guiada devuelve la suma de los días con dato en mm, su período y la advertencia de cobertura; no devuelve humedad relativa como respuesta de precipitación.
- **Arranque:** se comprueba que una web existente apunte a la API correcta. Si usa otra configuración, se conserva esa web y se abre TARPU en otro puerto local disponible. Se añaden esos orígenes locales a los valores por defecto de CORS; `TARPU_CORS` sigue fijando los dominios de publicación.

## Qué hace ahora la IA

`POST /api/ia/responder` lee el lugar y prepara evidencia en el servidor: lectura de suelo y relieve con citas, resumen de los registros de POWER por año y observaciones recientes de MODIS cuando existen. La pregunta y el historial se distinguen de las fuentes. El proveedor explica esa evidencia; no modifica el catálogo ni las reglas del motor.

Se conservan las fechas, unidades y faltantes. Se comprueba que la respuesta no añada cifras ausentes del contexto; si falla, se usa el modo guiado. **Este control no valida agronómicamente todas las frases de un modelo.** No hay diagnóstico validado, pronóstico ni recomendación nueva de riego. Los límites del modelo y las reglas científicas siguen sujetos a revisión.

Claude, OpenAI y Gemini tienen adaptadores configurables por API. La presencia de una clave se rotula como **configuración**, sin afirmar que una petición real haya sido aceptada. El mismo texto recibido se muestra y se lee mediante el navegador. No se ha integrado audio nativo de un proveedor ni voz simultánea de tiempo real.

## Suscripciones: viabilidad verificada

| Opción | Resultado de la consulta oficial | Implementación |
|---|---|---|
| ChatGPT / acceso usado por Codex | Existe SIWC con permiso opcional para usar un plan elegible en aplicaciones abiertas/locales. El alojamiento remoto compartido requiere otra habilitación | OAuth PKCE/OIDC local, en una instalación personal; botón «Continue with ChatGPT» |
| Claude | La documentación restringe ofrecer inicio de sesión Claude.ai o intermediar planes personales en aplicaciones de terceros sin autorización | API del servidor; no se simula inicio de sesión de suscripción |
| Gemini | La facturación de Gemini API tiene su propio proyecto y nivel. No se verificó un flujo de suscripción para TARPU | API del servidor; no se presenta Google SSO como permiso de inferencia |

Fuentes consultadas el 15/11/2026: [SIWC y aplicaciones locales](https://developers.openai.com/siwc/token-sharing-open-source), [registro y verificación OIDC](https://developers.openai.com/siwc/token-sharing-open-source/sign-in), [requisitos de inferencia SIWC](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference), [términos SIWC](https://openai.com/policies/sign-in-with-chatgpt-terms/), [autenticación de Claude](https://code.claude.com/docs/en/legal-and-compliance), [facturación de Gemini API](https://ai.google.dev/gemini-api/docs/billing).

La documentación de Gemini CLI y la página de retirada de Code Assist para consumidores no coinciden sobre los planes personales. No se trasladó una autenticación de CLI a TARPU basándose en esa diferencia. No se accedió a credenciales de Codex, Claude o Gemini instaladas en la computadora.

## Usar la conexión personal de ChatGPT

Desde `plataforma/`, con las dependencias de frontend y `backend/requirements.txt` instaladas:

```powershell
npm run start:personal
```

Abrir la dirección que imprima el lanzador, entrar al chat, pulsar «Conexión de IA» y «Continue with ChatGPT». La autorización ocurre en OpenAI; hay que conceder por separado el permiso de uso del plan. Volver al chat tras el callback. Si ya hay otra API en 8000 con un modo incompatible, el lanzador lo informa para cerrarla sin matar procesos ajenos.

Este modo usa API en `127.0.0.1`, sin Docker, solo para un usuario. No activar `TARPU_CHATGPT_LOCAL` en Cloud Run ni en un servidor compartido. Los tokens permanecen en memoria; la cookie de sesión es HttpOnly, las transacciones son de un solo uso y se validan firma, emisor, audiencia, caducidad, nonce y permisos. El identificador del host y del registro se conserva en el almacén ignorado por Git, sin tokens. Al reiniciar se requiere iniciar sesión nuevamente. La aplicación refresca el token durante la sesión y deja de usar el plan si se retira su permiso.

Para el servidor compartido, configurar una de las API mediante `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` o `GEMINI_API_KEY`, y opcionalmente `TARPU_IA_PROVEEDOR` y el modelo correspondiente. Los ejemplos de entorno tienen solo nombres y valores públicos. Las credenciales no se introducen en el frontend.

## Preparar archivos de trabajos anteriores

Las extracciones nuevas publican sus archivos. Para los trabajos previos, ejecutar desde backend con `TARPU_ALMACEN=supabase` y las credenciales del servidor configuradas:

```powershell
python -m tarpu_datos.publicar_archivos
```

El comando enumera los archivos publicados y los faltantes, sin descargar proveedores ni crear extracciones. Se ejecutó contra **Supabase local: 60 archivos publicados, 0 faltantes**. No se ha ejecutado contra el proyecto remoto. La base regional mantiene su sincronización propia. La persistencia de las rutas antiguas de parcelas y contextos sigue usando JSON local y necesita su revisión antes de escalar a varias instancias de API.

## Verificación y límites

- Compilación TypeScript y Vite: correcta.
- `npm run pruebas`: **14 pruebas de frontend y 37 de backend aprobadas**.
- `npm run pruebas:navegador`: **dos recorridos Chrome aprobados** sobre la web que apunta a la API actual, en el puerto alternativo 5175 durante esta revisión.
- El recorrido original comprueba acceso de demostración, datos reales, historial, motor, informes, dibujo, extracción y temas.
- El nuevo recorrido comprueba cambio de parcela durante una comparación, recuperación de contexto propio, conversación dentro del chat, igualdad de texto mostrado y hablado, interrupción sin audio tardío y tutorial con panel abierto en 1366×768, 1024×600 y 800×500. Se inspeccionaron las capturas del orbe y del tutorial.
- Las pruebas de voz usan reconocimiento y síntesis **simulados**: no validan el micrófono real, calidad de una voz instalada ni servicios de reconocimiento externos.
- Las pruebas automáticas de servicios separados usan dos carpetas y un Storage simulado a través del adaptador real. Además, se comprobó **Supabase Storage local real**: una API con un almacén vacío recibió exactamente los mismos bytes del CSV normalizado del trabajador. No acredita una prueba de Cloud Run ni una migración de archivos en producción.
- OAuth se prueba con firma RSA, validación de emisor, estado, cookie, rechazo de otro origen, permiso y renovación. **No se inició sesión con una cuenta real ni se consumió una suscripción o API de IA.** Quedan pendientes la autorización interactiva y una petición real al proveedor elegido.

No se añaden fuentes científicas, umbrales ni puntajes agronómicos. DT-16 sigue vigente.

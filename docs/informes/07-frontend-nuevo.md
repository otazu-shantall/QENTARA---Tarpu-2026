# 07 · Frontend nuevo de TARPU

**Fecha del trabajo** 15/11/2026. **Petición** construir una interfaz nueva con las referencias del usuario, lectura cómoda para personas mayores, logo monocromo, agente y chat. **Asistencia** OpenAI Codex.

## Resultado

La entrada de `Codigo/` utiliza `src/nuevo/`. La implementación tiene una portada con fotografía de trigo y cielo, logo blanco y navegación flotante. El dashboard sigue la referencia que el usuario destacó, con mapa a toda altura, tarjetas apiladas en el panel izquierdo y ficha flotante del lugar. Los acentos lima relacionan ambas pantallas.

El usuario pidió dos ajustes durante la revisión. Primero, una composición más cercana al dashboard satelital con panel de datos. Después, una portada fotográfica inspirada en su referencia agrícola. La versión entregada incorpora ambos pedidos. La aprobación final del diseño sigue pendiente de su revisión.

## Recorrido disponible

- Portada y cuatro destinos de trabajo, Mi campo, Cultivos, Mis datos y Agente TARPU.
- Cambio entre Majes riego y Chivay, mapas Esri y OpenStreetMap, zoom y centrado.
- Tarjetas de temperatura y lluvia de 2025, NDVI observado y pH estimado con su fuente. Series visuales de clima y vegetación y detalles de relieve.
- Dibujo de esquinas con deshacer, cancelar, comprobar cruces y guardar. También se pueden ingresar las coordenadas mediante texto.
- Guardado de campos declarados en el navegador, selección posterior, eliminación y descarga GeoJSON. Las consultas ambientales de esos campos quedan pendientes.
- Catálogo de ocho cultivos por sector según CENAGRO 2012, búsqueda y consulta conjunta de hasta tres fichas.
- Registros filtrables por texto, tipo y fecha, con paginación, descarga CSV, consulta JSON, procedencia e impresión.
- Conversación guiada en una vista completa y en un panel modal. Ambos comparten la conversación de la consulta activa. Las respuestas incluyen fuentes y lectura en voz alta cuando está disponible.

## Procedencia

`Codigo/scripts/prepare-reference-data.py` prepara las consultas guardadas desde `datos/muestras/`, `backend/catalogo/sectores.json` y la investigación de relieve. Escribe `Codigo/src/nuevo/reference-data.json`, que identifica su origen y la asistencia de IA. Conserva los registros, los valores ausentes y la procedencia de las fuentes.

El clima procede de las muestras reales diarias de NASA POWER de 2025. Los resúmenes usan media aritmética de temperatura y suma de lluvia del período. El NDVI conserva sus fechas y calidad. El suelo conserva profundidad y percentiles 5 y 95. Las superficies de cultivo describen el censo de 2012.

La fotografía de portada es de Arnaud Weyts, publicada en Unsplash, con atribución visible y registro en `Codigo/public/images/README.md`. Se verificó su publicación y licencia en la fuente el 15/11/2026.

## Comprobaciones

- Compilación de producción y tipos de TypeScript aprobados.
- Las ocho pruebas anteriores de dominio continúan pasando y se conservan como antecedente.
- Recorrido nuevo de Playwright aprobado con Chrome local. Comprueba navegación, cambio de consulta, capas del mapa, chat con contexto, filtros, CSV con fuente, fichas, dibujo, persistencia, GeoJSON, ampliación de letra y cartografía sin conexión.
- Revisado el desborde horizontal en 1440, 1024, 768, 390 y 375 px. Se inspeccionaron capturas de portada, dashboard, datos, cultivos, agente y móvil.
- Se corrigió un fallo al cambiar de mapa y después de lugar. Retirar los eventos de una capa antes de eliminarla impedía que Leaflet liberara sus suscripciones. La limpieza elimina primero la capa y después sus eventos.
- Se corrigió el cierre del menú móvil al elegir la vista que ya estaba abierta.

## Integraciones pendientes

Los puntos de referencia son consultas guardadas. La conexión en vivo de la API, los trabajos de extracción, la evaluación del motor y el modelo generativo del agente se incorporarán con los contratos correspondientes. Las fichas conjuntas de cultivos muestran información censal y el estado pendiente de la evaluación. La persistencia de campos es local al navegador.

Este trabajo se aplicó al frontend y su documentación. En la sesión hubo commits y cambios concurrentes del área de backend. Su implementación tiene seguimiento propio.

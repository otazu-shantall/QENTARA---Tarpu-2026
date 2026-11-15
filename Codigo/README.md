# Frontend de TARPU

**Interfaz vigente · 15/11/2026.** El punto de entrada carga `src/nuevo/`, construido con las referencias nuevas del usuario. La portada usa una fotografía real de trigo, navegación flotante, logo blanco y acentos lima. El dashboard presenta un mapa satelital a toda altura, tarjetas de datos a la izquierda y una ficha flotante del lugar.

```powershell
npm --prefix Codigo run dev
```

| Ruta | Contenido |
|---|---|
| `#/` | Portada |
| `#/campo` | Mapa, consultas de referencia y dibujo de campos |
| `#/cultivos` | Cultivos del sector según CENAGRO 2012 y selección de fichas |
| `#/datos` | Registros, filtros, CSV, JSON, procedencia e impresión |
| `#/agente` | Conversación guiada con fuentes, compartida con el panel de chat |

El cuerpo usa 18 px y los textos de apoyo, al menos 16 px. La navegación incluye palabras y existe una opción para ampliar la letra. El chat ofrece lectura en voz alta cuando el navegador la admite.

## Datos de esta interfaz

- Las consultas guardadas de Majes riego y Chivay se generan desde archivos reales del repositorio. Clima diario de 2025, NDVI de 2015–2026, propiedades de suelo con profundidad y percentiles, relieve y catálogo por sector.
- `scripts/prepare-reference-data.py` prepara `src/nuevo/reference-data.json` a partir de `datos/muestras/` y catálogos e investigación de `backend/`. La generación lee esos archivos y escribe el resultado dentro de `Codigo/`.
- Los campos dibujados y sus declaraciones se guardan con la clave `tarpu.fields.v2` de `localStorage`. Sus datos llegan de la API del backend (`src/nuevo/api.ts`): la base de Arequipa al guardarlos y los datos satelitales al pedirlos. La dirección se fija con `VITE_TARPU_API` (por defecto `http://127.0.0.1:8000`); el backend se enciende desde `backend/` con `.venv/Scripts/uvicorn tarpu_api.main:app --port 8000`. Detalle en `docs/informes/08-frontend-conectado-api.md`.
- Las respuestas del chat usan datos guardados y reglas de conversación en `src/nuevo/data.ts`. La conexión con un modelo generativo y con el agente de la API está pendiente.
- Las fichas de cultivos muestran superficie histórica del censo. La evaluación agronómica depende de la futura integración del motor y del contrato de T03.
- La fotografía y su atribución se documentan en `public/images/README.md`.

## Archivos activos y comprobaciones

`src/nuevo/App.tsx` compone las vistas, `Landing.tsx` presenta la portada, `FieldDashboard.tsx` organiza el dashboard, `FieldMap.tsx` gestiona el mapa y el dibujo, y `Chat.tsx` implementa la conversación. `data.ts` contiene los tipos de pantalla y el acceso a las consultas guardadas. La sustitución de este acceso por un adaptador de API deberá conservar procedencia, períodos, faltantes y estados pendientes.

```powershell
npm --prefix Codigo run build
npm --prefix Codigo test
npm --prefix Codigo run test:ui
```

`test:ui` verifica el recorrido nuevo con Chrome. Usa `TARPU_BASE_URL` para un puerto diferente. `npm test` conserva las ocho pruebas del dominio del prototipo anterior como antecedente.

## Antecedente del primer prototipo

La descripción siguiente documenta la versión anterior, cuyo código sigue conservado en `src/app/`, `src/features/`, `src/data/`, `src/lib/` y `src/styles/`. El punto de entrada vigente utiliza la implementación de `src/nuevo/` descrita arriba.

Primer frontend local de TARPU, producto del equipo QENTARA. Incluye una **landing pública** (`#/`) y un **dashboard** con siete vistas. **El mapa base y las imágenes satelitales usan cartografía real; los valores y las fichas de parcelas siguen siendo sintéticos. El agente utiliza respuestas locales guiadas.**

## Ejecutar

Requisito: **Node.js 24 o posterior** y npm.

```powershell
cd Codigo
npm install
npm run dev
```

Abre la dirección que imprime Vite, normalmente **http://127.0.0.1:5173/**. La raíz muestra la landing; el botón «Abrir la demo» lleva a `#/overview`. La aplicación usa rutas con hash, por ejemplo `/#/data`, para permitir recargas y alojamiento estático sin reglas adicionales del servidor.

```powershell
npm run build
npm run preview
npm test
```

`build` comprueba TypeScript y genera `dist/`. `preview` sirve esa compilación en el puerto 4173. En un entorno con npm configurado globalmente en modo offline, usa `npm install --offline=false` cuando tengas conexión al registro. El lockfile utiliza las URLs públicas de npm; no requiere el auxiliar de caché usado durante esta sesión.

## Stack elegido

- **React 19 + TypeScript:** componentes con contratos claros y estados locales tipados. [Documentación de React](https://react.dev/learn/typescript).
- **Vite 8:** desarrollo y compilación del frontend. El cargador nativo de configuración y Node 24 evitan procesos auxiliares innecesarios en este entorno Windows. [Documentación de Vite](https://vite.dev/guide/).
- **CSS propio:** `styles/tokens.css` (colores, tipografía, radios, sombras), `base.css` (botones, formularios, diálogos), `landing.css`, `app.css` (shell y vistas del dashboard), `print.css` y `features/monitor/map.css`. Superficies claras, tarjetas blancas, acentos verdes y movimiento con alternativa `prefers-reduced-motion`.
- **Tipografía:** **Geist** para la interfaz e **Instrument Serif** para titulares, desde Google Fonts; sin conexión se usan fuentes del sistema.
- **Lucide:** iconos vectoriales consistentes.
- **Leaflet 1.9.4:** mapa navegable con imagen satelital Esri World Imagery y calles OpenStreetMap. Las teselas requieren internet. [Referencia de Leaflet](https://leafletjs.com/reference.html).
- **SVG:** gráficos e indicadores; no se utilizan campos inventados para dibujar el mapa.
- **localStorage:** únicamente fichas e informes de demostración en este navegador. No hay servidor, autenticación o base de datos conectados.

Esta elección implementa el prototipo visual solicitado; no aprueba por extensión el stack de backend ni las propuestas científicas del informe.

## Estructura

```text
Codigo/
  public/
    brand/               logo y referencia de branding proporcionados
  src/
    app/                 composición, contexto y navegación del espacio
    components/
      layout/            navegación, cabecera y filtros comunes
      ui/                iconos, diálogo y encabezado reutilizables
    features/
      landing/           página pública de inicio
      dashboard/         resumen e indicadores
      parcels/           fichas y formulario local
      monitor/           Leaflet, mosaicos satelitales estáticos, atribución y zonas de referencia
      climate/           series y contexto histórico
      rotations/         candidatos y criterios por revisar
      data/              registros, filtros, metadatos y descarga
      assistant/         conversación guiada en panel lateral
      reports/           informes locales y resumen imprimible
    data/                fixtures sintéticos y etiquetas
    lib/                 filtrado, exportación, persistencia y respuestas
    styles/              tokens y estilos adaptables
    types/               contratos del frontend
  tests/                 lógica de dominio y recorrido de navegador
  index.html
  vite.config.ts
```

La composición está en `src/app/App.tsx`. Cada funcionalidad reside en su carpeta; los elementos visuales comunes no dependen de una pantalla concreta. Los datos de prueba se concentran en `src/data/demo.ts` para sustituirlos por servicios sin rehacer toda la interfaz. La lógica de datos no está escondida en los componentes visuales.

## Qué se puede probar

- Recorrer la landing: hero con imagen satelital real de Majes, franja de fuentes candidatas, capas de evidencia interactivas («qué dice / qué no dice»), pasos, principios, territorio y llamada a la demo.
- Navegar por las siete vistas del dashboard y recargarlas directamente. En escritorio se usa una barra de iconos; en teléfonos, una navegación inferior.
- Seleccionar una parcela y el período de las series.
- Navegar por cartografía real, cambiar entre imagen satelital y calles, acercar, desplazar y recentrar el mapa. Los accesos de La Joya, Majes y Camaná son zonas aproximadas de navegación, no ubicaciones de parcelas medidas.
- Cambiar la variable de los gráficos y consultar puntos con ratón o teclado.
- Buscar y crear fichas de parcelas locales. Las nuevas no tienen geometría u observaciones conectadas.
- Abrir el agente, utilizar preguntas sugeridas y escribir consultas. Se informa que son respuestas guiadas, sin modelo conectado.
- Filtrar registros por variable, nivel y búsqueda; consultar metadatos y paginar.
- Descargar **toda la selección filtrada** en CSV o JSON, independientemente de la página de la tabla. Los faltantes siguen siendo faltantes.
- Guardar informes con una copia de sus indicadores en el navegador; prepararlos para imprimir o guardar como PDF mediante el diálogo de impresión.
- Usar navegación móvil, diálogos nativos, foco de teclado y preferencias de movimiento reducido.

La precipitación del resumen es un indicador ilustrativo de siete días, señalado en la tarjeta; el filtro de período corresponde a las series y a los registros consultables. No se interpreta como una estimación operativa de la parcela.

## Marca y recursos

Se analizaron `Logo Tarpu.png` y `Tarpu_ Branding.png`, proporcionados en la raíz. Sus originales se conservan. Las copias utilizadas están en `public/brand/`.

**Rediseño del 09/11/2026**, a petición del usuario: interfaz más fresca, inspirada en referencias de dashboards agrícolas centrados en el mapa y en una landing editorial. El logo se usa en **blanco y negro**. A partir del original se generaron `tarpu-logo-black.png`/`tarpu-logo-white.png` (logotipo completo) y `tarpu-mark-black.png`/`tarpu-mark-white.png` (solo el símbolo); el sol queda integrado en el monocromo. El original a color se conserva y solo lo usa la referencia de branding.

La paleta pasa a neutros claros (`--bg #F2F2EF`, superficies blancas, tinta `#111311`) con acentos de la marca: verde `#2E7D4F`, verde claro `#A4C183`, sol `#F4B23E` y bosque `#1F4D2E`. Ya no se usa el glasmorfismo generalizado del 27/10/2026; solo las tarjetas flotantes sobre el mapa conservan un ligero desenfoque. La identidad visual sigue siendo una propuesta (SUP-013).

## Mapa geográfico

El mapa anterior, dibujado con campos SVG, se sustituyó por **Leaflet y teselas reales**. Los proveedores y los centros aproximados de navegación se configuran en `src/features/monitor/mapConfig.ts`:

- **Satélite:** [Esri World Imagery](https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer). Es un mosaico con fechas y resolución variables, sin prometer captura reciente o en vivo.
- **Calles:** [OpenStreetMap](https://www.openstreetmap.org/), con créditos visibles y enlace para corregir el mapa. Se respeta el caché HTTP del navegador, sin precargar regiones ni descargar teselas masivamente. [Política de uso](https://operations.osmfoundation.org/policies/tiles/).
- Los créditos de Esri se complementan por extensión y zoom cuando responde su servicio de atribución. El texto se escapa antes de insertarlo. Si no responde, permanecen los créditos generales del proveedor.

Los accesos a La Joya, Majes y Camaná sitúan el mapa en zonas de referencia de Arequipa. **No son los límites ni las coordenadas de las parcelas ficticias.** No se dibujan polígonos inventados o colores NDVI sobre predios ajenos. Las fichas nuevas muestran ubicación pendiente. La capa de análisis de vegetación continúa sin conectar.

**Mosaicos estáticos (`TileMosaic.tsx`):** la landing y las fichas de parcela muestran unas pocas teselas de Esri World Imagery como imagen, sin crear un mapa Leaflet por tarjeta. Se cargan bajo demanda (`loading="lazy"` salvo el hero), llevan el crédito visible «Esri World Imagery» y tienen un degradado de respaldo si fallan. En las fichas muestran la **zona de referencia**, no los límites de la parcela.

**Corrección del 09/11/2026:** al cambiar de mapa base, la capa anterior se retiraba con `tiles.off()` antes de `map.removeLayer()`. Eso borraba el listener con el que Leaflet desregistra sus eventos, y el siguiente zoom fallaba (`Cannot read properties of null (reading 'getCenter')`). Ahora se retira primero la capa.

El mapa se carga al aproximarse al viewport y libera eventos y observadores al desmontarse. `ResizeObserver` adapta su tamaño y acomoda los controles a la altura de los créditos. Hay estados de carga, error parcial, error total, reintento y cambio de proveedor. La rueda no captura el scroll de la página; se usan botones, teclado o el gesto de pellizco para el zoom.

Estos servicios públicos se usan para el prototipo local. Antes de un despliegue debe revisarse el proveedor y sus condiciones para la carga prevista. No se incluyen teselas en las exportaciones de registros ni se requieren claves secretas en este frontend.

## Pruebas y límites de verificación

`npm test` comprueba selección/agregación, filtros, conservación de faltantes, CSV y límites de las respuestas guiadas. `npm run build` comprueba tipos y compilación de producción.

`npm run test:ui` ejecuta una revisión funcional y adaptable con Playwright y Chrome instalado. Se lanza en una segunda terminal mientras está activo `npm run dev`; también admite `TARPU_BASE_URL` y `TARPU_BROWSER_CHANNEL`. Cubre la landing y el acceso a la demo, los controles del mapa, el cambio de proveedor, el estado ante bloqueo de teselas, la descarga JSON, la conversación, la persistencia y la ausencia de desborde horizontal en ocho vistas móviles (landing y siete vistas del dashboard).

**Estado al 09/11/2026:** la suite de navegador se ejecutó por primera vez y pasó completa con Chrome local. Su primera ejecución detectó el fallo de Leaflet descrito en «Mapa geográfico». También pasaron TypeScript, la compilación de producción y las ocho pruebas de dominio. Además se revisaron visualmente la landing y las siete vistas en 1440 px y 375 px. Esto no sustituye pruebas con teléfonos reales ni con usuarios.

Los resultados temporales y capturas se guardan en `test-results/` y no se versionan. `node_modules/`, `dist/` y la caché npm también están ignorados.

## Siguiente integración

1. Acordar la propuesta visual (landing y dashboard) con QENTARA y revisar legibilidad en teléfonos reales.
2. Definir contratos y un adaptador de datos separado de las pantallas.
3. Conectar fuentes comprobadas y añadir estados de carga, error, fecha y cobertura real.
4. Incorporar delimitaciones reales autorizadas y capas científicas georreferenciadas, separadas del mapa base ya conectado.
5. Conectar al agente con evidencia autorizada y proveedor elegido por el equipo.
6. Añadir identidad, permisos, persistencia de servidor y evaluación agronómica revisada cuando corresponda.

No introducir claves de proveedores en este frontend ni presentar los fixtures como resultados obtenidos. El acceso a datos detallados sigue siendo independiente del motor de recomendaciones.

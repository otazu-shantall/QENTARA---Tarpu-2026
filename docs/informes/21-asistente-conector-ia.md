# 21 · Asistente rehecho, conector de IA, ventanas amplias y recorridos por sección

> 15/11/2026 · Erick, con Claude Code. Pedido de Erick tras el [informe 20](20-pulido-interactivo.md).

## Qué cambió

- **Interfaz del asistente (Yachaq):** panel nuevo con burbujas de conversación, la fuente de cada respuesta como etiqueta, sugerencias al inicio, barra de escritura con micrófono y botón de enviar, e **indicador de «escribiendo»** (tres puntos) en lugar del texto de carga anterior.
- **Conector de IA en el backend** (`tarpu_api/ia.py`), con el reparto de trabajo explícito:
  - **TARPU** lee los datos, compara los cultivos y redacta cada respuesta con su fuente.
  - **La IA solo da voz natural:** recibe la respuesta ya hecha y la reescribe para decirla en voz alta. Sus instrucciones le prohíben añadir datos, cifras o recomendaciones.
  - Rutas: `GET /api/ia/estado` (qué proveedor está conectado; nunca devuelve claves) y `POST /api/ia/naturalizar`.
  - La clave vive solo en el servidor (`ANTHROPIC_API_KEY` en `infra/.env` o `backend/.env`). Sin clave, o si el proveedor falla o declina, se usa el texto de TARPU y se dice el motivo.
  - Proveedor programado: Anthropic (SDK oficial `anthropic`, modelo `claude-opus-5-5` con esfuerzo bajo y reemplazo automático ante una negativa). OpenAI y Gemini figuran como «previstos», sin código.
  - En el panel, «Escuchar» pide la versión natural si hay IA conectada y la lee con la voz del navegador.
- **«Mi proveedor de IA»:** muestra el estado real del servidor, la tabla «quién hace qué», los proveedores con su estado y los pasos para conectar uno.
- **Ventanas emergentes amplias:** «¿Qué es este dato?» ahora ocupa hasta 900 px y se ordena en bloques: tu dato, de dónde sale (fuente, escala y cada cuánto), qué es, cómo leerlo y lo que no dice (`dashboard/about.ts`).
- **Tamaños más contenidos** en todas las secciones (títulos, texto, tarjetas, botones), con el cuerpo en 16 px como mínimo.
- **Recorridos por sección** (`help/Tour.tsx`): Mi campo, Dibujar una parcela, Historial, Rotación de cultivos, Mis informes, Estudio técnico, Ayuda y fuentes, y el asistente. Cada uno se abre la primera vez que se entra a esa sección (o que se abre el asistente) y se repite desde Ayuda.

## Límites

- **El conector con IA no se probó con una clave real:** no hay clave en este equipo. Se comprobó el camino sin clave (devuelve el texto de TARPU con su motivo) y que la ruta de estado responde. La primera prueba con clave hay que hacerla y escucharla.
- La voz sigue siendo la del navegador (síntesis local). Una voz sintetizada por un proveedor requeriría otro servicio.
- La sala de conversación por voz de Shantall no se rediseñó; solo usa el nombre del asistente.

## Comprobaciones

- Backend: 22 pruebas (incluida la de capas con `ia` y `lectura`). Frontend: 11 pruebas y compilación.
- Recorrido en Chrome contra la API de Docker, incluidos el recorrido de Mi campo, el de Historial al entrar por primera vez, la ventana de detalle y el asistente.

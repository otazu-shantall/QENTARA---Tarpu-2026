# Módulos

> Descripción histórica del prototipo retirado de `Codigo/`. El frontend vigente está en `frontend/` (DT-25); rutas y capacidades actuales en [frontend/README.md](../frontend/README.md).

**Interfaz vigente desde el 15/11/2026.** La entrada de `Codigo/` utiliza `src/nuevo/`, con portada y cuatro destinos de trabajo, Mi campo, Cultivos, Mis datos y Agente TARPU. Hay consultas reales guardadas, campos declarados localmente y conversación guiada con fuentes. La API, el motor y la IA generativa tienen su integración pendiente. Recorrido y comprobaciones en [informe 07](informes/07-frontend-nuevo.md). Las siete vistas descritas a continuación pertenecen al prototipo anterior conservado en el repositorio.

> Qué hace cada parte del prototipo, qué es real y qué es de demostración, y con qué requisito del informe se relaciona (RF-xx, apartado 04 del [informe maestro](../Documentación/TARPU_Documentacion_Maestra.md#04-producto-ux-y-requisitos)). Código en `Codigo/src/features/`.

## Landing · `#/`

**Para qué:** presentar TARPU y llevar a la demo.

**Contenido:**

- hero con imagen satelital real de Majes;
- franja de fuentes candidatas;
- dos tarjetas de capacidades (monitor y agente);
- capas de evidencia con «qué dice / qué no dice»;
- cuatro pasos, principios, territorio, llamada a la demo y pie.

**Reglas:**

- Las cifras del hero son definiciones del producto (Arequipa, cuatro fuentes candidatas, un agente), no logros.
- Las fuentes aparecen como «sin conexión activa».
- No hay logos de socios ni cifras de impacto.

**Archivos:** `features/landing/LandingPage.tsx` y `styles/landing.css`.

## Dashboard

| Vista | Ruta | Qué muestra | Real | De demostración | Requisito |
|---|---|---|---|---|---|
| Vista general | `#/overview` | Resumen de la parcela, 4 indicadores, agente, gráfico, rotación y mapa con tarjeta flotante | Mapa base | Indicadores, serie y rotación | RF-03, RF-04, RF-11 |
| Mis parcelas | `#/parcels` | Fichas con imagen de su zona; crear una ficha local | Imagen satelital de la zona | Parcelas y valores | RF-01 (sin geometría todavía) |
| Monitor satelital | `#/monitor` | Mapa grande, cambio de mapa base, zonas y panel de fuentes y límites | Mapa base y créditos | — (no hay capa NDVI) | RF-05 (pendiente) |
| Clima e históricos | `#/climate` | Indicadores, serie por variable y avisos de interpretación | — | Series | RF-03 |
| Rotaciones | `#/rotations` | Quinua, haba y cebada como candidatos y qué revisar antes de comparar | — | Candidatos ilustrativos, sin puntaje | RF-06 (sin motor) |
| Explorar datos | `#/data` | Registros filtrables, metadatos y descarga CSV/JSON de toda la selección | Exportación | Registros | RF-12, RF-08 |
| Mis informes | `#/reports` | Guardar resúmenes en el navegador e imprimirlos como PDF | Impresión | Contenido | RF-08 |

## Agente · panel lateral

- **Cómo se abre:** con el botón flotante «Pregunta a Tarpu» o desde las tarjetas.
- **Qué responde:** con texto guiado sobre el NDVI, el agua, las fuentes, la exportación y las rotaciones. Siempre dice que no hay un modelo de IA conectado.
- **Requisito:** RF-11. El proveedor y el modelo siguen abiertos (SUP-034).
- **Archivos:** `features/assistant/` y `lib/domain.ts`.

## Relación con los requisitos del informe

| Requisito | Cubierto por el prototipo | Falta |
|---|---|---|
| RF-01 Identificar parcela | Fichas sin geometría | Dibujar o importar un polígono válido, área y versión |
| RF-02 Registrar contexto | — | Cultivo anterior, riego y período, con «desconocido» |
| RF-03 Consultar clima | Gráfico y unidades | Serie real con fuente, rango y faltantes |
| RF-04 Consultar evidencia | Rótulos de procedencia | Enlace a producto, método y calidad reales |
| RF-05 Visualizar vegetación | — | Escena válida, máscara, cobertura y leyenda |
| RF-06 Comparar candidatos | Pantalla sin puntaje | Reglas versionadas y abstención |
| RF-08 Exportar | CSV, JSON y PDF de sintéticos | Datos reales y permisos |
| RF-11 Agente | Respuestas guiadas | Modelo conectado a evidencia autorizada |
| RF-12 Datos detallados | Tabla, filtros, niveles y metadatos | Originales del proveedor |

Los casos de prueba de aceptación (AT-01 a AT-23) están en el anexo F del informe. Todos siguen **sin ejecutar** contra datos reales.

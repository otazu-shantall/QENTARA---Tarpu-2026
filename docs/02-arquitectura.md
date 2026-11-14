# Arquitectura

> Dos partes: lo que **existe** (el prototipo visual de `Codigo/`) y lo que se **propone** para el producto. Lo propuesto está en el apartado 06 del [informe maestro](../Documentación/TARPU_Documentacion_Maestra.md#06-ingeniería-y-desarrollo-dev) y es SUP-015: no está aprobado por el hecho de que exista el prototipo.

## 1. Lo que existe: el prototipo visual

| Capa | Elección | Notas |
|---|---|---|
| Web | React 19 + TypeScript + Vite 8 | Una sola página con rutas por hash (`#/`, `#/overview`, `#/data`…) para alojarla como sitio estático. |
| Mapa | Leaflet 1.9.4 | Mapas base Esri World Imagery y OpenStreetMap, cargados en vivo con créditos visibles. |
| Imágenes satelitales estáticas | `TileMosaic` propio | Unas pocas teselas de Esri como imagen, para la landing y las fichas. |
| Gráficos | SVG propio | Series ilustrativas. |
| Iconos | Lucide | — |
| Estilos | CSS propio con tokens | `Codigo/src/styles/`: `tokens`, `base`, `landing`, `app` y `print`. |
| Persistencia | `localStorage` | Solo fichas e informes de demostración en el navegador. |
| Pruebas | `node:test` + Playwright | 8 pruebas de lógica y un recorrido completo en Chrome. |

**Organización del código** (`Codigo/src/`):

```
app/          composición, rutas y contexto compartido
components/   barra de iconos, cabecera, filtros, iconos, diálogos
features/     landing, dashboard, parcels, monitor, climate, rotations, data, assistant, reports
data/         fixtures sintéticos (demo.ts)
lib/          filtrado, exportación, persistencia y respuestas guiadas
styles/       tokens y hojas de estilo
types/        contratos del frontend
```

**Reglas del prototipo:**

- Los datos de prueba viven solo en `data/demo.ts`, para sustituirlos por servicios sin rehacer las pantallas.
- La lógica de datos no se esconde en los componentes visuales.
- No hay claves de proveedores en el frontend.
- La señalización de demostración no se quita mientras no haya datos reales comprobados.

## 2. Lo que se propone para el producto (SUP-015)

Un monolito modular con una web móvil y un proceso de ingesta separado cuando la carga lo requiera.

| Capa | Propuesta | Responsabilidad |
|---|---|---|
| Web | React y TypeScript | Flujos, accesibilidad y consumo de la API |
| Mapas | MapLibre (el prototipo usa Leaflet) | Geometrías y capas científicas |
| API | Python y FastAPI | Validación, permisos, contratos y coordinación |
| Datos | PostgreSQL + PostGIS | Parcelas, geometrías, trabajos e indicadores |
| Archivos | Almacenamiento privado de objetos | Rásteres, manifiestos y exportaciones |
| Procesamiento | pandas, xarray, rasterio | Lectura, normalización y cálculo |
| Trabajos | Registro durable en base y un worker | Colas y Redis solo si se demuestra la necesidad |

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

**Módulos del backend propuestos:**

| Módulo | Qué hace |
|---|---|
| `identity` | Identidad y permisos |
| `parcels` | Geometrías e historial |
| `sources` | Catálogo de productos y fuentes |
| `ingestion` | Normalización de lo que llega de los proveedores |
| `indicators` | Cálculo de indicadores |
| `evaluations` | Aplicación de reglas |
| `agent` | Explicación de la evidencia autorizada |
| `exports` | Preparación de descargas |
| `jobs` | Coordinación de trabajos |
| `reports` | Reportes legibles |
| `audit` | Registro de eventos |

La consulta de datos detallados **no ejecuta** el motor.

**Recorrido técnico propuesto:** parcela y contexto → fuente real → procesamiento y persistencia → API → visualización comprensible → consulta al agente → registros detallados y exportación.

## 3. Registros de arquitectura por abrir (ADR)

| ADR | Tema | Estado |
|---|---|---|
| ADR-001 | Arquitectura inicial | Por abrir |
| ADR-002 | Persistencia espacial | Por abrir |
| ADR-003 | Productos y escala | Por abrir |
| ADR-004 | Procesamiento y cola | Por abrir |
| ADR-005 | Identidad y privacidad | Por abrir |

Cada ADR tendrá problema, alternativas, decisión propuesta, evidencia, consecuencias y estado (SUP-029). Cuando uno se apruebe, se registra en [06](06-decisiones-y-riesgos.md).

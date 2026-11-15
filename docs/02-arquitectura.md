# Arquitectura

> Dos partes: lo que **existe** (el prototipo de escritorio de `frontend/`) y lo que se **propone** para el producto. Lo propuesto está en el apartado 06 del [informe maestro](../plataforma/documentacion/informe-maestro/TARPU_Documentacion_Maestra.md#06-ingeniería-y-desarrollo-dev) y es SUP-015: no está aprobado por el hecho de que exista el prototipo.

## 0. Enfoque de datos vigente (DT-22)

Esquema mixto: base de Arequipa guardada, extracción por coordenada en Google Cloud con aviso al usuario y API interna del motor. Detalle en [11-esquema-mixto.md](11-esquema-mixto.md). El backend de la hackathon está en `backend/` (DT-13, DT-14).

## 1. Frontend vigente de escritorio

`frontend/` es la aplicación actual (DT-25). Arquitectura y límites completos en [frontend/README.md](../plataforma/frontend/README.md).

| Capa | Implementación |
|---|---|
| Web | React, TypeScript, Vite y rutas hash con React Router |
| Evidencia | TanStack Query, Zod y adaptador local sustituible |
| Mapa | Leaflet 1.9.4; Esri/OSM con atribución y editor de contorno |
| Estilos | CSS con tokens, temas claro/oscuro y sidebar de vidrio |
| Consultas | Muestra histórica local de POWER; escenarios rotulados y parcelas declaradas sin indicadores |
| Asistente | Respuestas guiadas locales y voz del navegador; IA remota pendiente |
| Pruebas | `node:test` y recorrido Playwright en Chrome |

`src/app/` compone rutas y contexto; `features/` organiza las pantallas; `services/` define adaptadores y contratos; `lib/` conserva la lógica pura. No hay claves de proveedores ni una conexión automática con la API del equipo.

La implementación conectada anterior se conserva en Git (commit `e08ea68`, carpeta `Codigo/`) y en el [informe 08](informes/08-frontend-conectado-api.md). Sus llamadas a base, trabajos y archivos son referencia para la integración pendiente con T03; no se dan por trasladadas. La regla DT-16 aplica a la entrega, que todavía debe sustituir los escenarios del prototipo por evidencia real.

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

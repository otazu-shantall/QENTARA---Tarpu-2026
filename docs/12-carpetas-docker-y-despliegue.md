# Carpetas oficiales, simulación con Docker + Supabase y despliegue

> Plan del 15/11/2026 (Erick). Escrito con asistencia de IA (Claude Code). Sigue el mismo camino que funcionó en Pulse/OS:
>
> 1. todo el backend corre en local con **Supabase en Docker**;
> 2. se prueba ahí;
> 3. se despliega casi sin cambios.
>
> Desarrolla [DT-22](06-decisiones-y-riesgos.md) y [11](11-esquema-mixto.md). Las decisiones nuevas van como **DT-23** (sección 9). **Por verificar** = no comprobado todavía.

## 1. La idea en una página

| Pieza | Qué es | En local (simulación) | En producción |
|---|---|---|---|
| **Base de datos** | Parcelas, series, celdas, trabajos, catálogos | **Supabase en Docker** (`npx supabase start`) | **Supabase en la nube** (`supabase db push`) |
| **Archivos grandes** | Mapas de la base de Arequipa, originales de cada fuente | Supabase Storage local | Supabase Storage o Google Cloud Storage (por decidir, sección 9) |
| **API** | FastAPI (`tarpu_api`): la usa la web | Contenedor `api` (Docker Compose) | **Google Cloud Run** (servicio) |
| **Trabajador** | Hace las extracciones pesadas que piden los usuarios | Contenedor `trabajador` | **Cloud Run Jobs** o un servicio siempre encendido (por decidir) |
| **Actualizador** | Actualiza POWER y MODIS cada cierto tiempo | Contenedor `actualizador` | **Cloud Scheduler** → Cloud Run Job |
| **Web** | El frontend (Shantall) | `npm run dev` | Vercel o Netlify (DT-15) |

**La regla:** la web solo habla con la API, la API y el trabajador solo hablan con Supabase, y el trabajador nunca recibe pedidos de Internet. La API **crea trabajos** en la base, y el trabajador los toma, extrae, guarda y marca listo. Es el mismo patrón de cola de Pulse/OS.

```text
 Web ──► API (Cloud Run) ──► Supabase (Postgres + PostGIS + Storage)
                                  ▲            │ cola de trabajos
                                  │            ▼
                    Trabajador (Cloud Run Job) ──► NASA POWER · ORNL (MODIS) · AppEEARS · Earth Engine
                    Actualizador (Cloud Scheduler)
```

**«Si lo conectamos con Google Cloud, que solo jale la carpeta»:** `backend/` tiene **un solo `Dockerfile`** y una sola imagen, con tres modos de arranque (`api`, `trabajador`, `actualizador`). Desplegar es construir esa imagen desde la carpeta y darle la URL y las claves de Supabase como variables de entorno. No cambia ni una línea de código entre local y nube.

## 2. Carpetas oficiales del repositorio

```text
QENTARA - Tarpu 2026/
├── Codigo/                    FRONTEND (Shantall). No se toca desde backend.
├── backend/                   BACKEND (Erick): una imagen de Docker
│   ├── Dockerfile             imagen única: api | trabajador | actualizador
│   ├── requirements.txt
│   ├── tarpu_api/             API (FastAPI): rutas, motor, agente, contrato con la web
│   │   └── pantallas/         respuestas por pantalla (contrato de T03)           ← hueco para T03
│   ├── tarpu_datos/           EXTRACCIÓN (oficial)
│   │   ├── fuentes/           una fuente por módulo (POWER, SoilGrids, GAEZ, ORNL, AppEEARS, luz; Earth Engine después)
│   │   ├── base/              capa 1: extraer, leer, mapa
│   │   ├── coordenada/        capa 2: trabajos y trabajador (cola en la base)
│   │   ├── celdas.py          clave de celda o píxel de cada producto (reutilización)  ← nuevo
│   │   ├── repositorio/       dónde se guarda: archivos (hoy) o Supabase (nuevo), con la misma interfaz
│   │   └── actualizacion.py
│   ├── catalogo/              EcoCrop, sectores, unidades, manifiesto de la base,
│   │                          variables.json e indicadores.json                     ← huecos para T03
│   ├── tests/                 pruebas de Python
│   └── prueba_web/            pantalla de prueba de la integración
├── supabase/                  BASE DE DATOS (nuevo, como en Pulse/OS)
│   ├── config.toml
│   ├── migrations/            esquema versionado: nunca se edita una migración ya aplicada
│   ├── seed.sql               catálogos (fuentes, productos, variables, sectores, cultivos)
│   └── tests/                 pruebas de SQL (pgTAP)
├── infra/                     DESPLIEGUE (nuevo)
│   ├── docker-compose.yml     api + trabajador + actualizador contra Supabase local
│   ├── .env.example           variables sin valores
│   └── gcp/                   pasos y archivos para Cloud Run y Cloud Scheduler
├── trabajo/                   tareas en curso (T01, T02, T03, extracción pesada)
├── datos/                     área de datos (Damaris): fichas y antecedentes
├── docs/  entrega/  Documentación/
```

**Qué no se mueve:**

- `Codigo/`, que es el área de Shantall;
- `datos/` y `trabajo/`, que son antecedentes y tareas.

**Qué es nuevo:** `supabase/`, `infra/`, `backend/Dockerfile`, `tarpu_datos/repositorio/`, `tarpu_datos/celdas.py`, `tarpu_api/pantallas/` y los dos catálogos para T03.

## 3. Reutilizar datos entre parcelas vecinas (y guardarlo en la base)

La idea de Erick: si una parcela pequeña ya se analizó y otra cercana cae **en la misma celda o píxel** de una fuente, no se vuelve a extraer: se reutiliza.

**Clave:** las series se guardan **por celda o píxel de cada producto, no por parcela.** Cada fuente tiene su propia malla:

| Producto | Unidad espacial | Clave de la celda | ¿Se puede calcular antes de pedir? |
|---|---|---|---|
| POWER | Celda de 0,5° × 0,625° (radiación: 1° × 1°) | Centro de la celda | Sí. **Además ya está entera en la base de Arequipa:** una parcela nunca vuelve a pedir POWER, lee su celda |
| MOD13Q1 (NDVI) | Píxel de 231,66 m, proyección sinusoidal | `MOD13Q1:x,y` de la esquina del píxel, en metros (ORNL devuelve `xllcorner`, `yllcorner` y `cellsize`; comprobado el 15/11/2026) | Sí, con la fórmula de la proyección sinusoidal de MODIS (por verificar contra ORNL antes de usarla) |
| MOD16A2GF, MCD12Q1 | Píxel de 463,3 m | Ídem | Sí |
| MOD11A2 | Píxel de 926,6 m | Ídem | Sí |
| SoilGrids, GAEZ, NASADEM | Ya están para toda la región | — | No se extraen por parcela |
| HLS (30 m), SMAP (9 km) | Malla propia | Por definir con Earth Engine | — |

**Flujo con reutilización:**

1. Llega una parcela. `celdas.py` calcula qué celda o píxel de cada producto contiene su centroide.
2. Para cada uno, se busca en la base si esa celda ya tiene la serie hasta la fecha de hoy (tabla `extracciones`).
3. Si la tiene, el trabajo marca la fuente como **«reutilizado»** y enlaza la parcela a esa celda (tabla `parcela_celdas`). Tarda menos de un segundo.
4. Si no la tiene, o le faltan fechas, se extrae **solo lo que falta** (los bloques anclados ya hacen esto) y se guarda **en la celda**, no en la parcela.
5. El actualizador mantiene al día **celdas**, no parcelas. Así, una celda con diez parcelas se actualiza una sola vez.

Ejemplo: dos parcelas vecinas cuyos centroides caen en el mismo píxel de MOD13Q1 (≈ 230 m de lado). Hoy, la segunda vuelve a pedir todo a ORNL (unos 12 minutos para un punto nuevo); con este cambio, reutiliza la serie en segundos. (Las dos parcelas de prueba de Majes del 15/11/2026 están a ≈ 1,4 km entre sí: caen en píxeles distintos.)

**Límite que hay que decir en pantalla:** si la parcela es más grande que el píxel, el centroide representa solo una parte. Más adelante se puede pedir cada píxel que toque la parcela (ORNL acepta un recuadro alrededor del punto).

## 4. Base de datos (versión 0, hecha por Erick, para que T03 la refine)

Esquema inicial, pensado para que el modelo de Damaris (T03) se **coloque** encima sin bloquear el avance:

| Tabla | Qué guarda | Clave |
|---|---|---|
| `fuentes`, `productos`, `variables` | Catálogo: unidad, escala, frecuencia, «qué no dice» (sale de `catalogo/variables.json`, T03) | id de texto |
| `celdas` | Una celda o píxel de un producto, con su geometría (PostGIS) | `producto + clave` |
| `extracciones` | Qué período tiene cada celda, de cuándo, con qué estado y procedencia | `celda + variable` |
| `observaciones` | La serie: fecha, valor (o vacío), calidad y nivel | `celda + variable + fecha` |
| `capas_base` | Los mapas de la base: fuente, variable, profundidad, ruta en Storage, CRS y resolución | id |
| `parcelas` | Contorno (PostGIS), área, centroide, sector y dueño (cuando haya cuentas) | uuid |
| `parcela_celdas` | Qué celda de cada producto cubre la parcela y cuánto de la parcela cubre | `parcela + celda` |
| `contexto_declarado` | Lo que dice el agricultor (origen «declarado») | parcela |
| `trabajos` | La cola: estado por fuente, intentos, quién lo tomó, latido, fechas, aviso | uuid |
| `evaluaciones` | El resultado del motor por cultivo y criterio, con su cita | `parcela + cultivo + criterio` |

Las **vistas** (`vista_*`) dan la forma que necesita cada pantalla. Cuando T03 entregue su contrato por pantalla, solo cambian las vistas y `tarpu_api/pantallas/`, no la ingesta.

**Huecos que llena T03, sin que nadie espere a nadie:**

| Hueco | Hoy | Lo reemplaza T03 con |
|---|---|---|
| `catalogo/variables.json` | Lo mínimo para que funcione (unidad y escala) | Su diccionario de variables (§3.2 de T03) |
| `catalogo/indicadores.json` | Los dos indicadores que ya existen (heladas y lluvia por mes) | Sus agregaciones con método y cita (§3.3) |
| `tarpu_api/pantallas/*.py` y las `vista_*` | Respuestas de la pantalla de prueba | Su contrato por pantalla (§3.4) |
| Migraciones nuevas | Esquema v0 | Su modelo físico (§3.5), como migraciones nuevas, nunca editando las aplicadas |

## 5. Dónde viven los archivos grandes

La base de Arequipa pesa ≈ 620 MB:

- NASADEM: 227 MB en zip;
- SoilGrids: 124 MB;
- POWER: 135 MB de JSON original;
- CENAGRO: 127 MB.

Propuesta:

- **Rasters** (SoilGrids, GAEZ, NASADEM, mapa de sectores) en un **bucket**. La API baja a su disco temporal solo lo que necesita: una tesela de NASADEM de 1° pesa unos 13 MB. Los rasters se pueden pasar a GeoTIFF optimizado (COG) para leerlos por partes.
- **Series** (POWER de las 63 celdas, MODIS por píxel): en tablas, porque se consultan por fecha y por celda.
- **Originales del proveedor** (JSON tal cual): en el bucket, con su ruta en `extracciones`, para la descarga «en crudo».

**Por verificar antes de decidir el plan:** los límites del plan gratuito de Supabase, tanto de tamaño de la base como de Storage. Si no alcanzan, los rasters van a Google Cloud Storage y en Supabase quedan solo las tablas.

## 6. Orden de trabajo (por dependencias, sin plazos)

| # | Paso | Qué queda funcionando | Depende de |
|---|---|---|---|
| 0 | Encender **Docker Desktop** e instalar la CLI de Supabase (`npx supabase`) | `docker info` responde | — |
| 1 | `supabase/` con `config.toml`, migración v0 y `seed.sql` | `npx supabase start` levanta Postgres + PostGIS + Storage + Studio en local | 0 |
| 2 | `tarpu_datos/repositorio/`: misma interfaz para archivos y para Supabase; `TARPU_ALMACEN=archivos\|supabase` | El backend corre igual que hoy, o contra la base local | 1 |
| 3 | Carga de la base de Arequipa: rasters al bucket, POWER a `observaciones`, catálogos al `seed` | `GET /api/base` responde leyendo de Supabase | 2 |
| 4 | `celdas.py` + reutilización + trabajos en la tabla `trabajos` (cola con `FOR UPDATE SKIP LOCKED`) | Dos parcelas vecinas: la segunda sale «reutilizado» en segundos | 2 |
| 5 | `backend/Dockerfile` + `infra/docker-compose.yml` (api, trabajador, actualizador) | Todo el backend en contenedores contra Supabase local; la pantalla de prueba funciona igual | 3, 4 |
| 6 | Huecos de T03 conectados (variables, indicadores, pantallas, vistas) | Cuando Damaris entregue, se coloca sin tocar la ingesta | 4 |
| 7 | Despliegue: Supabase en la nube (`db push`), imagen a Artifact Registry, Cloud Run (api), Cloud Run Job (trabajador y actualizador), Cloud Scheduler, Secret Manager | La misma pantalla, en una URL pública | 5; proyecto de Google Cloud y de Supabase creados por Erick |
| 8 | El frontend de Shantall apunta a la URL de la API | La app real con datos reales | 7 |

Cada paso deja algo que se puede probar. Hasta el paso 5, el backend sigue funcionando como hoy (`TARPU_ALMACEN=archivos`), así que la pantalla de prueba no se rompe mientras tanto.

## 7. Qué hace falta de Erick

- **Encender Docker Desktop** cuando empiece el paso 1.
- **Crear los proyectos** de Supabase y de Google Cloud, con sus cuentas y su facturación, cuando llegue el paso 7.
- **Confirmar las decisiones** de la sección 9.

## 8. Mientras tanto

**¿Hay que apagar el motor híbrido?** No para planificar ni para los pasos 1 y 2. El paso 3 mueve la base de Arequipa a Supabase y el paso 5 usa los puertos de Docker. Para esos se avisará antes: la API de la pantalla de prueba conviene apagarla, para que no lea archivos a medio mover.

## 9. Decisiones (DT-23, por confirmar)

1. **Base de datos:** Supabase (Postgres + PostGIS + Storage). En local, Docker con la CLI de Supabase, como en Pulse/OS; en producción, Supabase en la nube. Reemplaza el «sin base de datos» de DT-13.
2. **API, trabajador y actualizador en Google Cloud Run**, con una sola imagen construida desde `backend/`.
3. **Las series se guardan por celda o píxel del producto**, no por parcela, para reutilizarlas entre parcelas vecinas.
4. **Rasters:** en Supabase Storage o en Google Cloud Storage, según los límites del plan (por verificar).
5. **Trabajador:** Cloud Run Job lanzado al crear un trabajo, o servicio siempre encendido que vigila la cola. Recomendación: un Job, porque solo cuesta mientras trabaja. Por verificar cómo se lanza desde la API.

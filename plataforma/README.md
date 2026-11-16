# TARPU · Plataforma

> Escrito con asistencia de IA (Claude Code), 15/11/2026. Registro en [../entrega/uso-de-ia.md](../entrega/uso-de-ia.md). Decisión: DT-27 en [../docs/06-decisiones-y-riesgos.md](../docs/06-decisiones-y-riesgos.md).

Esta carpeta es **TARPU completo**: lo que se prueba en local y lo que se sube a cada plataforma al desplegar. Fuera de ella quedan solo la organización del equipo (`docs/`, `ROADMAP.md`), la entrega del hackathon (`entrega/`) y las tareas de trabajo (`trabajo/`).

## Encender todo con un comando

Requisitos: Docker Desktop, Node.js 24 o posterior y, para el modo sin Docker, el entorno de Python de `backend/.venv`.

Desde esta carpeta:

```bash
npm install
```

```bash
npm start
```

`npm start` hace, en orden:

1. enciende Docker Desktop si está apagado;
2. levanta **Supabase local** (Postgres + PostGIS + Storage). La primera vez aplica las migraciones y el catálogo (`supabase/seed.sql`);
3. construye y levanta la **API** y el **trabajador** en Docker (`infra/docker-compose.yml`). La API queda en http://127.0.0.1:8010 y su documentación en `/docs`;
4. levanta la **página web** en http://127.0.0.1:5174, apuntando a esa API, y abre el navegador.

Ctrl+C cierra la web. Docker y Supabase siguen encendidos para la próxima vez.

| Comando | Para qué |
|---|---|
| `npm start` | Todo: Docker, Supabase, API, trabajador y web |
| `npm run start:sin-docker` | Prueba rápida: API con Python en el puerto 8000 (datos en archivos) y web |
| `npm run detener` | Apaga los contenedores y Supabase (los datos se conservan) |
| `npm run estado` | Qué está encendido |
| `npm run pruebas` | Pruebas del frontend y del backend |
| `npm run pruebas:navegador` | Recorrido en Chrome (con la web y la API encendidas) |
| `npm run db:reset` | Vuelve a crear la base local desde las migraciones |

**Datos locales que git no sube:** `backend/almacen/` (base de Arequipa y series, unos 400 MB), `backend/.env` (credenciales de Earthdata) e `infra/.env` (clave local de Supabase; `npm start` la crea sola). En una computadora nueva, la base de Arequipa se baja del Storage con `python -m tarpu_datos.base.sincronizar bajar` desde `backend/`, o se vuelve a extraer (`backend/README.md`).

## Qué hay aquí

| Carpeta | Qué es | Área |
|---|---|---|
| [frontend/](frontend/README.md) | La web: portada, panel, mapa, historial, estudio técnico, informes y asistente | Shantall (frontend), con la integración de Erick |
| [backend/](backend/README.md) | API (FastAPI), extracción oficial (`tarpu_datos/`), motor, agente, catálogos e investigación | Erick |
| [backend/investigacion/](backend/investigacion/) | Fuentes de la investigación de cultivos: métodos citados (FAO-56, USLE, textura, rotación), censo 2012, EcoCrop | Erick |
| [backend/catalogo/](backend/catalogo/) | EcoCrop, sectores y cultivos por sector (DT-20), variables e indicadores | Erick y Damaris |
| [supabase/](supabase/) | Base de datos: migraciones, catálogo y configuración local | Erick |
| [infra/](infra/docker-compose.yml) | Docker Compose: API, trabajador y actualizador contra Supabase | Erick |
| [datos/](datos/README.md) | Fichas de cada fuente, muestras y análisis de recursos | Damaris |
| [documentacion/informe-maestro/](documentacion/informe-maestro/TARPU_Documentacion_Maestra.md) | Informe maestro del producto (md, tex y pdf) | Equipo |
| [documentacion/modelo-de-datos/](documentacion/modelo-de-datos/README.md) | T03: modelo lógico, diccionario de variables, agregaciones, contrato por pantalla y modelo físico | Damaris |
| [scripts/](scripts/) | `iniciar.mjs` y `detener.mjs` | — |

Documentación técnica del backend: [DISENO.md](backend/DISENO.md), [MODULOS.md](backend/MODULOS.md), [PLAN-PLATAFORMAS-Y-COORDENADA.md](backend/PLAN-PLATAFORMAS-Y-COORDENADA.md). Esquema mixto: [../docs/11](../docs/11-esquema-mixto.md). Despliegue: [../docs/12](../docs/12-carpetas-docker-y-despliegue.md).

## Cómo se conecta

```text
 Web (frontend/) ──► API (backend/, contenedor api) ──► Supabase (Postgres + PostGIS + Storage)
                                                          ▲        │ cola de trabajos
                                                          │        ▼
                              Trabajador (contenedor) ──► NASA POWER · ORNL (MODIS) · AppEEARS
```

- La web solo habla con la API (`VITE_TARPU_API`). No lleva claves.
- La API lee la base de Arequipa al instante y crea trabajos por coordenada; el trabajador los toma, extrae y guarda por celda o píxel (reutilización entre parcelas vecinas, DT-23).

## Conexión personal de ChatGPT

Con las dependencias instaladas, `npm run start:personal` abre una instalación local de un usuario, sin Docker. En el chat, «Conexión de IA» permite iniciar el flujo oficial de OpenAI y autorizar el uso del plan elegible. No activa una cuenta compartida para la web. Las credenciales quedan en memoria; tras reiniciar hay que volver a iniciar sesión. Cuenta real todavía sin verificar. [Configuración, fuentes y límites](../docs/informes/23-correcciones-chat-voz-publicacion.md).

## Despliegue

**Corrección del 15/11/2026 (Codex):** la lectura de los CSV del trabajador ya tiene una vía por Storage. Antes de separar servicios, publicar también los archivos de trabajos anteriores con `python -m tarpu_datos.publicar_archivos` desde backend y las credenciales del repositorio Supabase. No se ha probado un despliegue remoto; la persistencia de las rutas antiguas de parcelas sigue en JSON local. La tabla siguiente expresa los destinos propuestos, sin acreditar que todo el recorrido ya funcione allí.

Cada pieza sale de su carpeta (docs/12):

| Pieza | Carpeta | Plataforma |
|---|---|---|
| Base de datos | `supabase/` | Supabase en la nube (`supabase db push`) |
| API, trabajador y actualizador | `backend/` (un `Dockerfile`, tres modos) | Google Cloud Run (servicio y jobs) y Cloud Scheduler |
| Web | `frontend/` (`npm run build` → `dist/`) | Vercel o Netlify, con `VITE_TARPU_API` = URL de Cloud Run |

Falta crear los proyectos de Supabase y de Google Cloud, y añadir el dominio de la web al CORS de la API (`TARPU_CORS`).

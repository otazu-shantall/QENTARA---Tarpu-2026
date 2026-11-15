# 18 · Carpeta única `plataforma/` y arranque con `npm start`

> 15/11/2026 · Erick, con Claude Code. Decisión DT-27.

## Qué se hizo

- **Repositorio:** se volvió al de siempre (`otazu-shantall/QENTARA---Tarpu-2026`) como `origin`; se borraron la referencia al repositorio `erickvillacisE/Tarpu` y su rama de respaldo local.
- **Movimiento (con `git mv`, se conserva el historial):**

  | Antes | Ahora |
  |---|---|
  | `backend/`, `frontend/`, `supabase/`, `infra/`, `datos/` | `plataforma/<igual>` |
  | `Documentación/` | `plataforma/documentacion/informe-maestro/` |
  | `trabajo/T03-modelado-datos/` | `plataforma/documentacion/modelo-de-datos/` |
  | `package.json` (CLI de Supabase) | `plataforma/package.json` |

- **Enlaces:** se reescribieron 135 enlaces relativos de los `.md` del repositorio para que apunten a las rutas nuevas, conservando los finales de línea. Quedan rotos solo 13 enlaces que ya lo estaban, en copias de referencia antiguas de `trabajo/T01-paquete-extraccion/referencia/`.
- **Rutas de código:** `config.py` exporta a `../frontend/public/api`; `appeears.py` usa la carpeta del backend en vez de la raíz del repositorio; `.gitignore` y `.claude/launch.json` con las rutas nuevas. Las claves (`backend/.env`, `infra/.env`) y la base local (`backend/almacen/`) se movieron con sus carpetas y siguen ignoradas por git.
- **Arranque:** `plataforma/scripts/iniciar.mjs` (`npm start`): enciende Docker Desktop si hace falta, levanta Supabase (con reintentos mientras sus contenedores arrancan), crea `infra/.env` con la clave local si no existe, construye y levanta la API y el trabajador, y abre la web apuntando a la API en el puerto 8010. `npm run start:sin-docker` usa la API con Python en el puerto 8000. `npm run detener` apaga contenedores y Supabase.
- `Codigo/` (solo restos sin seguimiento: compilados y dependencias) se borró del disco.

## Comprobaciones

- Pruebas del backend (21) y del frontend (11), y compilación del frontend, después del movimiento.
- `npm start` probado de punta a punta: Docker, Supabase, API y trabajador en contenedores, y la web. Chivay muestra clima de POWER y NDVI de MODIS leídos de la API en Docker; la prueba de navegador pasa contra ese arranque.
- Los trabajos guardan rutas absolutas (Windows, contenedor o carpeta anterior); la API ahora las traduce a su propio almacén (`coordenada.py`, `_en_almacen`), y la web conserva el clima si falla un archivo de MODIS.

## Pendiente

- Probar `npm start` en una computadora limpia: la base de Arequipa (`backend/almacen/`) no está en git y se baja del Storage o se vuelve a extraer.
- Despliegue en la nube (Supabase y Google Cloud), con `VITE_TARPU_API` y `TARPU_CORS`.

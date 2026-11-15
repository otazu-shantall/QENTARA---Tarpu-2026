# Plan: dónde se sube la base y cómo funciona la extracción por coordenada

> Área de **Erick**, 15/11/2026. Escrito con asistencia de IA (Claude Code). Desarrolla [DT-22](../../docs/06-decisiones-y-riesgos.md) y [docs/11](../../docs/11-esquema-mixto.md).
>
> **Hecho y medido** = funciona hoy en local. **Propuesta** = a confirmar por Erick; nada está desplegado. No hay costos en este documento: cada servicio se cotiza en la calculadora oficial de Google Cloud antes de activarlo.

## 1. Lo oficial: `backend/tarpu_datos/`

```
backend/
├── tarpu_api/                 API interna (FastAPI): rutas, motor, agente
│   └── base.py                GET /api/base?lat=&lon= → capa 1 en un punto
├── tarpu_datos/               EXTRACCIÓN OFICIAL (reemplaza datos/*.py, trabajo/T01 y trabajo/T02 como versión vigente)
│   ├── fuentes/               una fuente por módulo: power, soilgrids, gaez, luz, ornl (MODIS), appeears (NASADEM, HLS, SMAP)
│   │   └── cliente.py         peticiones con tope, reintentos, caché con antigüedad y escritura atómica
│   ├── base/                  CAPA 1 · toda Arequipa
│   │   ├── extraer.py         baja SoilGrids, GAEZ, POWER (63 celdas), NASADEM (20 teselas) y CENAGRO
│   │   └── leer.py            consulta todo en un punto (0,2–0,5 s), sin descargar
│   ├── coordenada/            CAPA 2 · por coordenada
│   │   └── trabajos.py        un trabajo por punto, en segundo plano, con estado por fuente y aviso
│   └── actualizacion.py       actualización periódica (POWER cada 7 días, MODIS cada 8, cobertura cada 30)
├── catalogo/                  base_arequipa.json (manifiesto), soilgrids_unidades.json, sectores.json, ecocrop
└── almacen/                   DATOS (git lo ignora): base_arequipa/, fuentes/<punto>/, trabajos/, cache/
```

**Antecedentes (no se borran, ya no son la versión vigente):** `datos/*/consulta_*.py` (Damaris, primeras muestras), `trabajo/T01-paquete-extraccion/` (origen de `fuentes/`), `trabajo/extraccion_pesada/pesados.py` (origen de `fuentes/appeears.py`) y `backend/herramientas/prueba_*.py`.

## 2. La base de Arequipa ya está configurada en el backend

| Pieza | Estado |
|---|---|
| Datos extraídos (≈ 620 MB) en `almacen/base_arequipa/` | ✅ SoilGrids 99 mapas · GAEZ 100 · POWER 63 celdas · NASADEM 20 teselas · CENAGRO |
| Lectura en un punto (`base/leer.py`) | ✅ Majes riego 0,48 s y Chivay 0,24 s. Coinciden con lo medido por otras vías: altitud de Majes 1391 m (AppEEARS: 1390), pH 8,2; Chivay 3642 m (3643), pH 6,9 |
| Ruta de la API `GET /api/base?lat=&lon=` | ✅ relieve, sector y cultivos, suelo, aptitud GAEZ, celda de clima, procedencia y avisos |
| Aviso de escala del clima | ✅ automático. Celda de POWER frente al punto: Majes +550 m, Chivay +710 m, Cabanaconde +1689 m |
| Actualización periódica | ✅ `actualizacion.py`; en la API con `TARPU_ACTUALIZAR_CADA_HORAS` |
| Pruebas | ✅ 18 (incluida una con la base real, que se salta si la base no está en la computadora) |

**Hallazgos de la lectura** (medidos, sin interpretar más allá de lo que dicen):

- **Pendiente:** depende de la malla. En Chivay, el `.hgt` original da 2,1 % («suave») y el recorte de AppEEARS dio 5,4 % («inclinado») en el mismo punto. A 30 m, un píxel de diferencia cambia la clase. TARPU debe mostrar la pendiente de la zona (distribución) además de la del punto.
- **Cabanaconde (S2):** NASADEM da 2663 m y 125 % de pendiente, frente a los 2908 m que declara el censo para su sector censal. Las coordenadas del censo son de un sector, no de una chacra. **Antes de usarlo como lugar de ejemplo hay que elegir el punto en la vista satelital.**
- **GAEZ:** algunas capas vienen vacías en el archivo (TIFF disperso); se leen como 0 según la convención de GDAL, igual que lo que devuelve GAEZ por punto.

## 2 bis. Pantalla de prueba

`backend/prueba_web/index.html`, servida por la propia API en `/prueba/`. No es el diseño de TARPU; sirve para comprobar que todo está conectado:

- **Mapa:** de Arequipa, con los sectores calculados desde NASADEM (`GET /api/base/sectores` y `.png`; celdas de 0,01°, generado en 3 s).
- **Datos base:** clic en cualquier punto → la capa 1 en crudo (`GET /api/base`).
- **Datos pesados:** botón «Extraer datos pesados» → `POST /api/trabajos` y `GET /api/trabajos/{clave}` cada 4 s.
- **Archivos en crudo:** original, normalizado y procedencia de cada fuente (`GET /api/archivo`, solo `.csv` y `.json` del almacén).

Probado el 15/11/2026:

- Chivay, capa 1: 534 ms.
- Chivay, trabajo de capa 2: menos de 20 s, porque reutilizó lo ya bajado.
- El NDVI de Chivay se ve en crudo (272 fechas).
- Sin errores en el servidor ni en la consola.

**Versión 2 de la pantalla (15/11/2026):**

- logo de TARPU en negro y pestañas «Punto seleccionado» y «Puntos extraídos» (`GET /api/trabajos` y `GET /api/trabajos/punto`);
- zoom hasta 21 con escala métrica.

Medido ese día: Esri tiene imagen real hasta el zoom 17 en el campo (Majes, Chivay, Camaná, La Joya; ≈ 1 m por píxel). Desde el 18 devuelve «Map data not yet available». Solo la ciudad de Arequipa llega al 19. Por eso el mapa amplía la imagen del zoom 17 y lo indica con «ampliado». Hay una capa aparte con la imagen real de la ciudad hasta el 19.

**Versión 3 de la pantalla (15/11/2026):**

- **Imagen más nítida:** Esri World Imagery «Clarity» como mapa principal. En el mismo zoom 17 se ve mucho más nítida que la estándar (comparado en Majes) y también llega hasta el 17. Más allá se amplía.
- **Dibujo de la parcela por esquinas:** se toca una esquina, «Guardar punto» y una línea punteada sigue al cursor hasta la siguiente. Hay «Deshacer», «Cerrar parcela» y «Empezar de nuevo», con Enter y Retroceso como atajos.
- **Al cerrar la parcela:** `POST /api/base/parcela` lee la capa 1 en todo su espacio:
  - relieve en cada píxel de 30 m dentro;
  - suelo en los píxeles de 250 m que la tocan;
  - GAEZ y POWER en la celda que la contiene, mayor que la parcela.

  Prueba en Majes, 1,1 ha: 12 píxeles de NASADEM, 1 de suelo y 0,18 píxeles de MODIS, en 0,8 s.
- **Datos pesados:** el trabajo guarda el contorno y extrae en el centroide.
- **Detener extracciones:** «Detener» en cada trabajo y «Detener seleccionados» en «Puntos extraídos» (`POST /api/trabajos/cancelar`). La extracción para antes del siguiente bloque de ORNL (medido: 2,2 s). Lo bajado queda guardado y volver a pedirla continúa desde ahí.
- **Límites:**
  - Detener solo funciona en el mismo proceso de la API que lanzó el trabajo.
  - Si la API se reinicia a mitad de una extracción, el trabajo queda «en proceso». Se detiene y se vuelve a pedir, y continúa con lo ya bajado.

**Error corregido (15/11/2026): extracciones que no arrancaban.**

- **Qué pasaba:** en Windows, `os.replace` falla con «Acceso denegado» si otro hilo está leyendo el archivo en ese instante. La pantalla consulta el trabajo cada 4 s, así que el hilo de la extracción se caía al anotar su primer avance. El trabajo quedaba para siempre «en proceso», con las fuentes en «pendiente».
- **Medido:** 2766 escrituras rechazadas en 5 s de lecturas simultáneas; 0 después del arreglo.
- **Arreglo:**
  - `escribir_atomico` reintenta el reemplazo;
  - un trabajo que falla queda en «error» con su motivo;
  - un trabajo «en curso» cuyo hilo ya no existe pasa a «interrumpido» y se puede retomar con lo ya bajado.

## 3. Plataformas (propuesta, a confirmar)

Un solo proveedor, **Google Cloud**, porque la capa 2 ya se decidió allí (DT-22) y así todo queda en un proyecto.

| Pieza | Propuesta | Para qué | Alternativa |
|---|---|---|---|
| Archivos de la base (rasters, CSV, zip) | **Cloud Storage** (un bucket) | Guardar `almacen/base_arequipa/` tal cual; después, convertir los rasters a GeoTIFF optimizado (COG) | — |
| Datos consultables | **Por ahora, archivos** (`leer.py` ya responde en menos de 0,5 s). Después, **PostgreSQL + PostGIS** en Cloud SQL | Cargar series de POWER, puntos del censo y trabajos cuando haya muchos usuarios | Mantener archivos más tiempo |
| API interna | **Cloud Run** (contenedor con FastAPI) | Responder al frontend; leer la base; crear trabajos | Una máquina virtual (Compute Engine) |
| Trabajos por coordenada | **Cloud Run Jobs** o **Cloud Tasks** | Ejecutar `trabajos.ejecutar` fuera del pedido del usuario | Hoy, un hilo dentro de la API (funciona en local) |
| Actualización periódica | **Cloud Scheduler** | Lanzar `actualizacion una-vez` según los períodos | Hoy, el bucle dentro de la API |
| Capa 2, vía principal | **Google Earth Engine** (registrar el proyecto para uso no comercial) | MODIS, HLS y SMAP por punto | ORNL y AppEEARS, ya escritos |
| Claves (Earthdata, Google) | **Secret Manager** | Que no estén en el repositorio ni en el contenedor | Variables de entorno de Cloud Run |
| Frontend | Vercel o Netlify (DT-15) | Sitio estático que llama a la API | Firebase Hosting |
| Aviso al usuario | **Por decidir** | Avisar cuando el trabajo termina | En la app (el usuario vuelve a entrar), correo o notificación push |

**Por verificar al crear el proyecto:**

- que Cloud Run pueda montar el bucket como carpeta;
- los límites y el costo de cada servicio;
- que Earth Engine no comercial cubra este uso y cuánto cómputo da;
- que su catálogo tenga cada producto (MOD13Q1, MOD16A2GF, MOD11A2, MCD12Q1, HLS, SMAP L3/L4) y con qué versión.

## 4. Cómo se sube (pasos, en orden de dependencia)

1. **Erick crea el proyecto de Google Cloud** y habilita Cloud Storage, Cloud Run, Cloud Scheduler, Secret Manager y Earth Engine. La cuenta y la facturación son suyas.
2. **Bucket:** subir `backend/almacen/base_arequipa/` y `backend/catalogo/` (por ejemplo, `gcloud storage cp -r backend/almacen/base_arequipa gs://BUCKET/base_arequipa`).
3. **Claves:** guardar `EARTHDATA_USERNAME` y `EARTHDATA_PASSWORD` en Secret Manager.
4. **Contenedor:** un `Dockerfile` en `backend/` con `tarpu_api` y `tarpu_datos`. Al arrancar, la base se lee del bucket montado (o se copia).
5. **Cloud Run:** desplegar la API con `TARPU_ALMACEN_DIR` apuntando a la base y las claves desde Secret Manager.
6. **Cloud Scheduler:** una tarea que llame a la actualización según los períodos.
7. **Earth Engine:** registrar el proyecto y añadir `fuentes/earthengine.py` como vía principal de la capa 2.
8. **Frontend:** apuntar a la URL de Cloud Run.

Nada de esto se ha hecho. Cada paso que crea un recurso o publica algo se confirma antes.

## 5. Extracción por coordenada (capa 2): la lógica del código

```
Usuario marca su campo
   │
   ▼
POST /api/parcelas → contorno y centroide (geometria.py, ya existe)
   │
   ├─► capa 1 al instante: base/leer.py (relieve, sector, cultivos, suelo, aptitud, celda de clima)
   │
   └─► POST …/procesar → coordenada/trabajos.iniciar(lat, lon)
            │  un trabajo por punto (clave = coordenada con 4 decimales); si ya existe y está listo, se reutiliza
            ▼
        trabajo en segundo plano (hoy: hilo · en Google Cloud: Cloud Run Jobs o Cloud Tasks)
            ├─ power  → fuentes/power.py, hasta ayer                     (segundos)
            ├─ modis  → hoy ORNL; después Earth Engine                    (minutos la primera vez)
            ├─ hls    → Earth Engine (respaldo: AppEEARS)                 (pendiente)
            └─ smap   → Earth Engine (respaldo: AppEEARS)                 (pendiente)
            │  estado por fuente en almacen/trabajos/<clave>.json, escrito tras cada fuente
            ▼
        listo / parcial → el motor recalcula (motor.comparar ya existe) → aviso «por_enviar»
            ▼
        el punto queda en actualizacion.py → se mantiene al día solo
```

| Pieza | Estado |
|---|---|
| `trabajos.py` con POWER y MODIS (ORNL), estado por fuente, reanudable | ✅ probado el 15/11/2026 en Cabanaconde, un punto nuevo: 6 min. POWER «parcial» por el retraso de 2 variables; MODIS: 3 productos completos y la temperatura de superficie con 2 fechas vacías. El punto quedó registrado para actualizarse |
| Integrarlo en `procesamiento.py` y en el registro de `conectores.py` | ⏳ siguiente paso de código |
| `fuentes/earthengine.py` (MODIS, HLS, SMAP) | ⏳ tras crear el proyecto de Google Cloud |
| Reutilizar entre parcelas vecinas: clave por píxel de cada producto (por ejemplo, el mismo píxel MODIS de 250 m) en vez de por coordenada exacta | ⏳ propuesta |
| Aviso al usuario | ⏳ falta el canal |

## 6. Lo que necesito que decidas

1. **¿Confirmas Google Cloud** con las piezas de la sección 3? Si sí, se registra como decisión nueva.
2. **¿Base de datos ahora o después?** Recomiendo seguir con archivos para la hackathon (ya funciona) y pasar a PostGIS después.
3. **Canal del aviso:** en la app, correo o push.
4. **Proyecto de Google Cloud:** lo creas tú. Cuando exista, sigo con Earth Engine y el despliegue.

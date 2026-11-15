# T03 · Modelado de los datos del esquema mixto

> **Para:** Damaris (área de datos). **Pide:** Erick, 15/11/2026. Escrito con asistencia de IA (Claude Code); declarado en [entrega/uso-de-ia.md](../../entrega/uso-de-ia.md).
>
> **En una frase:** el backend ya extrae datos con el esquema mixto (base de Arequipa + datos pesados por parcela). Falta **modelarlos**: decidir qué entidades hay, cómo se guardan, cómo se agregan y qué forma tienen para que la web los muestre. El modelado va de la mano con lo que se ve en pantalla, así que esta tarea parte de las dos cosas.

## 1. Lo que ya tenemos (y cómo se extrae)

### 1.1 El esquema mixto (DT-22)

Decisión completa en [docs/11-esquema-mixto.md](../../docs/11-esquema-mixto.md). Resumen:

| Capa | Qué es | Cómo se obtiene | Dónde vive el código |
|---|---|---|---|
| **1 · Base de Arequipa** | Lo estático o de celda grande: relieve, suelo, aptitud, clima por celdas, censo, sectores, cultivos | Se baja **una vez para toda la región** y se consulta al instante | `backend/tarpu_datos/base/` (`extraer.py`, `leer.py`, `mapa.py`) |
| **2 · Por parcela** | Series de satélite: verdor, evapotranspiración, temperatura de superficie, cobertura (y HLS y SMAP cuando haya Earth Engine) | Un **trabajo en segundo plano** por parcela; se avisa al terminar | `backend/tarpu_datos/coordenada/trabajos.py` |
| **Actualización** | POWER cada 7 días, MODIS cada 8, cobertura cada 30; solo lo nuevo | Automática | `backend/tarpu_datos/actualizacion.py` |
| **Fuentes** | Un módulo por fuente (de tu T01, corregido) | — | `backend/tarpu_datos/fuentes/` |

Tu paquete de T01 es la base de `fuentes/`. Las correcciones y el porqué están en [backend/tarpu_datos/README.md](../../backend/tarpu_datos/README.md).

### 1.2 Cómo verlo funcionando

1. Desde la raíz del repositorio:

   ```powershell
   backend\.venv\Scripts\python.exe -m uvicorn tarpu_api.main:app --app-dir backend --port 8000
   ```

2. Abre http://127.0.0.1:8000/. Es la **pantalla de prueba** (no es el diseño final):
   - mapa de Arequipa con los 3 sectores;
   - dibujas tu parcela por esquinas;
   - ves los datos base de todo su espacio, en crudo;
   - extraes los datos pesados y sigues su avance;
   - la pestaña «Puntos extraídos» lista todo lo pedido.
3. La base de Arequipa (≈ 620 MB) **no está en git**: está en `backend/almacen/base_arequipa/` de la computadora de Erick. Para tenerla, se regenera con:

   ```powershell
   cd backend
   .\.venv\Scripts\python.exe -m tarpu_datos.base.extraer soilgrids
   .\.venv\Scripts\python.exe -m tarpu_datos.base.extraer gaez
   .\.venv\Scripts\python.exe -m tarpu_datos.base.extraer power
   ```

   NASADEM (`nasadem`) pide la cuenta de Earthdata en `backend/.env`. Pídele a Erick que te pase las teselas o la cuenta.

### 1.3 Qué datos produce hoy (formato real)

| Qué | Dónde | Forma | Ejemplo real |
|---|---|---|---|
| Mapas de suelo (SoilGrids) | `almacen/base_arequipa/soilgrids/*.tif` | 99 GeoTIFF EPSG:4326 (11 propiedades × 3 profundidades × media, P5 y P95), enteros sin convertir | pH 0–5 cm en Majes = 82 → 8,2 (`÷ d_factor`, en `catalogo/soilgrids_unidades.json`) |
| Mapas de aptitud (GAEZ) | `almacen/base_arequipa/gaez/*.tif` + `_capas.json` | 100 GeoTIFF de celda de 0,0833°, índice 0–10 000 | Majes, papa con riego por gravedad: 5556 |
| Clima por celda (POWER) | `almacen/base_arequipa/power/power_celda_*.{original.json, normalizado.csv, procedencia.json}` | 63 celdas, 19 variables diarias, de 2015 hasta ayer | Celda de Chivay: 4334 días; elevación de la celda 4351,89 m |
| Relieve (NASADEM) | `almacen/base_arequipa/nasadem/*.zip` | 20 teselas `.hgt` de 1'' (≈ 30 m) | Majes 1391 m |
| Censo 2012 | `almacen/base_arequipa/cenagro2012/` | CSV del INEI (REC01 = unidades agropecuarias con coordenadas, altitud y piso) | — |
| Mapa de sectores | `almacen/base_arequipa/derivados/sectores_0p01.{png,json}` | Celdas de 0,01° clasificadas S1, S2, S3 | — |
| Manifiesto de la base | `backend/catalogo/base_arequipa.json` (sí está en git) | Fuente, URL, caja, resolución, nivel, fallos y fecha de cada fuente | — |
| Datos de una parcela (capa 2) | `almacen/fuentes/<nombre>/` | Por producto, los mismos tres archivos que en T01, más `.detalle.csv` en MODIS | `mod13q1_chivay_20150101_ultimo.normalizado.csv`: 272 fechas |
| Trabajo de una parcela | `almacen/trabajos/<clave>.json` | Estado por fuente, vacíos del proveedor, fallos, contorno y aviso | `listo_con_vacios`: MOD11A2 con 16 fechas sin valor de día y 38 de noche |
| Puntos y actualización | `almacen/puntos.json`, `almacen/actualizacion.json` | Puntos registrados; última vuelta por tarea | — |

**Lo que da la API hoy:**

| Ruta | Qué devuelve |
|---|---|
| `GET /api/base?lat=&lon=` | Capa 1 en un punto |
| `POST /api/base/parcela` | Capa 1 en todo el espacio de un contorno: relieve en cada píxel de 30 m dentro, suelo en los píxeles de 250 m que la tocan, celdas de GAEZ y POWER |
| `POST /api/trabajos` y `GET /api/trabajos[/{clave}]` | Capa 2 |
| `POST /api/trabajos/cancelar` | Detener uno o varios trabajos |
| `GET /api/archivo` | Cualquier archivo en crudo |

Todas usan el sobre común `{data, procedencia, avisos, modo, generado}` ([contrato/esquemas/Sobre.json](../../backend/contrato/esquemas/Sobre.json)).

**El hueco que esta tarea ayuda a cerrar:** las rutas de parcela que alimentan el motor (`/api/parcelas/{id}/indicadores`, `/clima`, `/rotaciones`, `/datos`) todavía leen solo POWER por el camino antiguo. Los datos del esquema mixto (base, trabajos, MODIS, suelo) **aún no entran en indicadores ni en el motor**. Tu modelo define cómo deben entrar.

## 2. Lo que tiene que mostrar la web (lo que ya está definido)

Fuentes: [docs/10 §2 y §5](../../docs/10-recorrido-y-escala.md), [docs/08](../../docs/08-desafio-oficial.md), [docs/01](../../docs/01-vision-y-alcance.md) y el prototipo en `Codigo/`. Las pantallas finales las define Shantall; su plantilla [propuesta-frontend.md](../../docs/areas/propuesta-frontend.md) tiene una tabla «Datos que necesita cada pantalla» **todavía vacía**: hay que llenarla con ella.

### 2.1 El recorrido (docs/10 §2, ajustado al esquema mixto)

| # | Pantalla | Qué ve el usuario | Datos que necesita |
|---|---|---|---|
| 1 | Ubicar mi campo | Mapa satelital | — (teselas de Esri) |
| 2 | Dibujar mi parcela | Contorno por esquinas; área | Geometría: área, perímetro, centroide, píxeles de MODIS |
| 3 | Contar mi campo | Cultivo actual y anterior, riego, meses en campo («No sé» siempre posible) | Datos declarados (origen «declarado») |
| 4 | Preparando tus datos | Lo de la base **al instante**; el estado de cada fuente pesada; aviso al terminar | Capa 1 + trabajo (estados por fuente) |
| 5 | Cómo está mi campo | Frases y tarjetas: temperatura, noches bajo 0 °C, lluvia, verdor, suelo, pendiente | Indicadores agregados con escala, fuente, período y faltantes |
| 6 | ¿Qué siembro después? | El cultivo actual y los demás, **criterio por criterio**, sin puntaje | Motor: estado por criterio (`dentro_optimo`, `dentro_absoluto`, `fuera_absoluto`, `sin_dato`, `sin_regla`), con su cita y sus vacíos |
| 7 | Pregunta a TARPU | Respuestas con la cita | Agente guiado: mismos datos y reglas |
| 8 | Ver y descargar | Registros sin pasar por el motor, con su nivel (original, normalizado, derivado) | Datos detallados y exportación (CSV/JSON, PDF) |

### 2.2 Qué lleva cada dato en pantalla (docs/10 §5.2)

**Frase · valor y unidad · escala** («tu zona: celda de ≈ 55 × 67 km») **· fuente y período · origen** (fuente o «declarado por ti») **· faltantes · qué no significa** («es un registro del pasado, no un pronóstico») **· enlace a los datos**.

**Consecuencia para el modelo:** cada valor tiene que poder llevar consigo su procedencia, escala, período y faltantes. No basta con guardar el número.

### 2.3 Gráficos y mapa (docs/10 §5.3)

- Noches bajo 0 °C y lluvia: **barras por mes**, con los meses sin dato como hueco.
- Verdor: **línea por fecha**, cortada donde no hubo observación válida (calidad de MOD13Q1).
- Mapa: el contorno siempre. **Nunca se colorea el campo con un dato de una fuente que no describe su interior.** Hoy, con NASADEM de 30 m, sí hay datos dentro de la parcela (altitud y pendiente por píxel).

### 2.4 Lo que pide el desafío (docs/08)

**Al menos tres estrategias de rotación, incluida la actual.** Para cada una: por qué, qué evidencia la respalda, qué beneficios tiene (solo con cita), **qué vacíos de información hay** y qué riesgos necesitan revisión local.

## 3. Tu tarea: modelar los datos

Propuesta de entregables, en orden de dependencia. Si ves una forma mejor, proponla.

### 3.1 Entidades y relaciones (modelo lógico)

Partir de esta lista y corregirla:

| Entidad | Qué es | Atributos clave |
|---|---|---|
| Parcela | El contorno dibujado | id, contorno (GeoJSON), área, perímetro, centroide, sector, fecha |
| Contexto declarado | Lo que dice el agricultor | cultivo actual y anterior, riego, meses en campo; origen «declarado» |
| Fuente | NASA POWER, MODIS (ORNL), SoilGrids, GAEZ, NASADEM, CENAGRO, (HLS, SMAP) | id, proveedor, licencia o cita, URL |
| Producto y variable | Ej.: MOD13Q1 / NDVI | unidad, escala espacial, frecuencia, latencia, factor de conversión, qué dice y qué no |
| Celda o píxel | La unidad espacial de cada fuente | fuente, geometría o centro, resolución; ej. celda de POWER con su elevación |
| Observación (serie) | Un valor en una fecha | variable, celda o píxel, fecha, valor (o vacío), calidad, nivel |
| Capa estática | Un mapa de toda la región | fuente, variable, profundidad, estadístico, archivo, CRS |
| Trabajo | La extracción de la capa 2 de una parcela | estado por fuente, vacíos del proveedor, fallos, fechas, aviso |
| Procedencia | De dónde viene cada cosa | URL, fecha de consulta, versión, método |
| Indicador derivado | Lo que muestra la pantalla 5 (ej. noches bajo 0 °C por mes) | método citado, período, faltantes |
| Evaluación del motor | Un criterio de un cultivo para una parcela | estado, dato usado, rango citado, cita, vacío |

**Pregunta central a resolver:** ¿la serie se guarda por **parcela** o por **celda o píxel de la fuente**? Hoy se guarda por punto. Pero dos parcelas en la misma celda de POWER, o en el mismo píxel de MODIS, comparten el dato. Guardarlo por celda evita bajar dos veces lo mismo. Propón cuál y por qué.

### 3.2 Diccionario de variables

Una tabla con **todas** las variables que hoy extraemos. Columnas:

- id y nombre;
- fuente y producto;
- unidad final y factor de conversión;
- escala espacial y frecuencia;
- latencia observada (ej. POWER: PAR y nubosidad solo llegan hasta el 30/08/2026);
- nivel (original, normalizado o derivado);
- **qué dice y qué no dice**;
- en qué pantalla aparece.

Tus fichas de `datos/*/README.md` y la sección 9 del README de T01 ya tienen buena parte.

### 3.3 Agregaciones para la pantalla

Para cada indicador de la pantalla 5:

- de qué variables sale;
- **con qué método citado**;
- qué período cubre;
- cómo cuenta los faltantes.

Ejemplos que ya existen: `backend/tarpu_api/indicadores.py` (noches con mínima bajo 0 °C por mes y lluvia por mes, desde POWER). Hay que añadir NDVI (respetando su calidad), ET y PET, temperatura de superficie, suelo y pendiente.

**Ningún umbral sin cita (DT-16).** Si no hay cita, se muestra el dato sin evaluarlo.

### 3.4 Forma de la respuesta por pantalla (contrato con el frontend)

Para cada pantalla de 2.1, el JSON que necesita. Partir de lo que ya devuelven `/api/base/parcela` y `/api/trabajos/{clave}` (verlos en la pantalla de prueba, «en crudo»). Acordarlo con Shantall y con Erick.

### 3.5 Modelo físico

**Hoy son archivos** (DT-13: sin base de datos en la demo). Hay dos propuestas abiertas, sin decidir:

- **PostgreSQL + PostGIS** en Cloud SQL (SUP-015);
- **rasters como GeoTIFF optimizado (COG)** en Cloud Storage.

Están en [backend/PLAN-PLATAFORMAS-Y-COORDENADA.md](../../backend/PLAN-PLATAFORMAS-Y-COORDENADA.md). Propón:

- las tablas (o la estructura de archivos) que saldrían del modelo lógico;
- qué va como raster y qué como tabla;
- qué índices espaciales hacen falta.

**No crees ninguna base de datos ni ningún recurso en la nube:** es un diseño.

## 3 bis. Dónde se coloca tu trabajo (ya está preparado)

El backend ya tiene una base de datos real (Supabase local, DT-23) y huecos esperando tu modelo. No tienes que esperar a nadie ni tocar código para que entre:

| Tu entregable | Dónde se coloca | Qué pasa al colocarlo |
|---|---|---|
| Diccionario de variables (§3.2) | `backend/catalogo/variables.json`: las 26 variables ya están, con `que_no_dice`, escala, frecuencia, latencia, pantalla y cita en `null` | `backend/herramientas/generar_seed.py` lo pasa a la tabla `variables` |
| Agregaciones (§3.3) | `backend/catalogo/indicadores.json`: hay 2 implementados y el NDVI por definir | Erick programa cada indicador nuevo a partir de su ficha |
| Contrato por pantalla (§3.4) | `contrato-pantallas.md` en esta carpeta | Se vuelve vistas `vista_*` en la base y respuestas en `tarpu_api/` |
| Modelo físico (§3.5) | Migraciones nuevas en `supabase/migrations/` sobre el esquema v0 (`20261115000100_esquema_v0.sql`) | `npm run db:reset` las aplica |

**El esquema v0 ya resuelve tu pregunta central (§3.1) con una propuesta:** las series se guardan **por celda o píxel** de cada producto (tablas `celdas`, `extracciones`, `observaciones` y `parcela_celdas`). Revísala: si propones otra cosa, se cambia con una migración nueva.

Para mirar las tablas: `npm run db:start` en la raíz y Studio en http://127.0.0.1:55323. Más detalle en [docs/12](../../docs/12-carpetas-docker-y-despliegue.md).

## 4. Reglas

- **Trabaja en esta carpeta.** No modifiques `backend/`, `Codigo/` ni la carpeta de otra área. Lo que propongas para el código se lo pasas a Erick.
- **DT-16, cero supuestos:**
  - cada valor con su fuente y su procedencia;
  - un faltante nunca se convierte en 0;
  - ningún umbral, rango ni peso sin cita;
  - lo que no se sabe va como tarea de verificación.
- **Límites científicos:**
  - un dato regional no se vuelve de parcela por dibujar un polígono;
  - el NDVI no mide fertilidad;
  - la humedad estimada no es un análisis de suelo;
  - un histórico no es un pronóstico.
- **Uso de IA:** nota en el encabezado de cada archivo y una fila en `entrega/uso-de-ia.md`.

## 5. Qué entregar (en esta carpeta)

| Archivo | Contenido | Está hecho cuando |
|---|---|---|
| `modelo-logico.md` | Entidades, relaciones (diagrama) y la respuesta a «¿por parcela o por celda?» | Cada dato de la sección 1.3 tiene su entidad |
| `diccionario-variables.md` | La tabla de 3.2 | Están todas las variables de POWER, SoilGrids, GAEZ, NASADEM, MODIS y CENAGRO, con «qué no dice» |
| `agregaciones.md` | Los indicadores de 3.3, con método y cita | Ningún indicador sin método citado o marcado «sin regla» |
| `contrato-pantallas.md` | El JSON por pantalla (3.4), revisado con Shantall | Las 8 pantallas tienen su forma de datos |
| `modelo-fisico.md` | La propuesta de 3.5 | Erick puede implementarla sin adivinar |

## 6. Lo que sigue abierto (no lo decidas tú sola)

- **Base de datos ahora o después**, y **Google Cloud como plataforma**: los decide Erick.
- **Canal del aviso** al usuario: sin decidir.
- **Pantallas finales:** las define Shantall.
- **Incertidumbre de SoilGrids:** su factor sigue por verificar (T01 §9.4).
- **Cabanaconde (S2):** el punto del censo cae en una ladera de 125 % de pendiente; hay que elegir uno en una chacra.

# Diseño del backend de TARPU

> **15/11/2026:** las fuentes vigentes son las de **DT-19** y el enfoque de datos es el **esquema mixto (DT-22)**, en [docs/11](../docs/11-esquema-mixto.md). Donde este diseño hable de tres fuentes (DT-17) o de una web sin servidor, manda docs/11.
>
> Área de **Erick**. 14/11/2026: revisado para quitar todo supuesto (DT-16), ajustado a las tres fuentes de la demo (DT-17) y alineado con el código ya construido. Explica **cómo se conecta todo**:
>
> - qué herramientas usamos y cómo;
> - qué módulos intervienen en cada paso del recorrido;
> - cómo se habla con el área de datos (Damaris) y con el frontend (Shantall);
> - en qué orden se construye y qué está hecho.
>
> Complementa los [diagramas](diagramas/), [MODULOS.md](MODULOS.md) (qué es cada módulo) y [docs/10-recorrido-y-escala.md](../docs/10-recorrido-y-escala.md) (lo que ve el usuario). Decisiones: DT-13, DT-14, DT-15, **DT-16** y **DT-17**.
>
> **La extracción de datos es del área de datos.** Aquí solo se define cómo la invoca y la usa el backend.

## 1. Las reglas principales

**Cero supuestos (DT-16).** La demo debe funcionar al 100 % y **todo lo que muestre debe ser cierto**:

1. **Cada valor viene de una fuente real**, con su procedencia (fuente, producto, fechas, unidad y escala), **o lo ingresa el usuario**, y entonces se muestra como «declarado por ti».
2. **Ninguna regla, umbral, rango ni peso se usa sin cita.** Si no hay una fuente que lo respalde, no se aplica, y la pantalla muestra el dato con la frase «no hay una regla con fuente para evaluarlo».
3. **Nada sintético en la demo:** ni parcelas, ni personajes, ni valores de ejemplo.
4. **Nada de interpretaciones sin evidencia.** Se describe el dato («hubo 29 noches bajo 0 °C»), sin conjeturar lo que «podría significar».
5. **Lo que no se sabe se lista** como tarea de verificación, con cómo verificarlo. Nunca se rellena.
6. **Lo que no se pueda hacer bien se deja fuera**, en vez de simularlo.

**Tres fuentes (DT-17).** La demo usa solo **NASA POWER**, el **NDVI de MODIS** (`MOD13Q1` v061, servicio de ORNL) y **SoilGrids**. Las tres se consultan en un **punto**: el centroide de la parcela. Ninguna describe el interior de una parcela pequeña, así que cada dato se muestra con su escala.

## 2. Qué hace el backend

- Recibe y valida la parcela que dibuja el usuario.
- Pide a los conectores del área de datos los datos del centroide de **esa** parcela y sigue su estado.
- Calcula indicadores descriptivos (conteos, promedios y totales de datos reales).
- Compara cultivos con rangos **citados** de FAO EcoCrop.
- Prepara respuestas del agente con datos reales.
- Lo sirve todo con un contrato fijo (API) y lo exporta a JSON para la web publicada.

**No** descarga datos (eso es de los conectores), **no** pinta pantallas y **no** guarda claves en el código.

## 3. Herramientas y cómo las usamos

Instaladas y probadas el 14/11/2026 en Windows con Python 3.13. Las versiones exactas están en [requirements.txt](requirements.txt).

| Herramienta | Versión | Para qué | Cómo la usamos |
|---|---|---|---|
| **Python** | 3.13 | Lenguaje | Entorno virtual en `backend/.venv`, ignorado por git |
| **FastAPI** | 0.163 | API | Una ruta por pantalla; documentación automática en `/docs`; `BackgroundTasks` para preparar los datos sin bloquear |
| **Uvicorn** | 0.54 | Servidor | `uvicorn tarpu_api.main:app --reload --port 8000` |
| **Pydantic** | 2.14 | Contrato | Cada entrada es un modelo; `model_json_schema()` genera `contrato/esquemas/` |
| **Shapely** | 2.2 | Geometría | Leer el GeoJSON; `is_valid` y `explain_validity` (por qué un contorno no es válido); centroide y recuadro |
| **pyproj** | 3.8 | Área | `Geod(ellps="WGS84").geometry_area_perimeter()` para el área y el perímetro reales |
| **Biblioteca estándar** | — | Series y cálculo | `csv` para leer el normalizado; `decimal` para sumas exactas y redondeo hacia arriba en el empate (333,35 → 333,4) |
| **pytest** + **httpx** | 9.2 / 0.28 | Pruebas | `TestClient` de FastAPI para probar las rutas sin levantar el servidor |

En la demo **no se usan** base de datos, colas, Redis ni contenedores (DT-13). Tampoco rasterio, NumPy ni pandas: con las tres fuentes de DT-17 no hay imágenes que recortar.

### Configuración (`config.py`)

Variables de entorno, o `backend/.env` (copiar de [.env.example](.env.example)). Ninguna es secreta.

| Variable | Por defecto | Para qué |
|---|---|---|
| `TARPU_MODO` | `en_vivo` | `en_vivo` (API) o `publicado` (JSON exportado). **Los datos son reales en los dos casos** |
| `TARPU_DATOS_DIR` | `../datos` | Dónde están los conectores del área de datos |
| `TARPU_ALMACEN_DIR` | `almacen` | Parcelas, resultados y caché; ignorado por git |
| `TARPU_CATALOGO` | `catalogo/ecocrop_2026-11-14.json` | Catálogo con valores citados |
| `TARPU_EXPORT_DIR` | `../Codigo/public/api` | Adónde escribe `exportar.py` |
| `TARPU_CORS` | `http://127.0.0.1:5173,http://localhost:5173` | Origen del frontend en desarrollo |
| `TARPU_POWER_INICIO` · `TARPU_POWER_FIN` | `2015-01-01` · `2025-12-31` | Período de la serie diaria de POWER (el del ejemplo de Chivay) |

## 4. El recorrido visto desde el backend

Cada fila es un paso del [recorrido del usuario](../docs/10-recorrido-y-escala.md). **Síncrono** = responde al momento. **En segundo plano** = la pantalla consulta el estado hasta que termina.

| # | Pantalla | Petición | Módulos, en orden | Lee | Escribe | Modo |
|---|---|---|---|---|---|---|
| 0 | Inicio | `GET /api/meta` · `GET /api/catalogo` | `meta` · `catalogo` | `config`, catálogo | — | Síncrono |
| 1 | Ubicar mi campo | — | (solo en el navegador) | — | — | — |
| 2 | **Dibujar mi parcela** | `POST /api/parcelas` | `esquemas` → **`geometria`** → `parcelas` → `almacen` | GeoJSON enviado | `parcela.json` | Síncrono |
| 2b | Redibujar | `PUT …/contorno` | `geometria` → `parcelas` (versión + 1) | — | `parcela.json` | Síncrono |
| 3 | **Contar mi campo** | `PUT …/contexto` | `esquemas` → `parcelas` → `catalogo` (avisa si un cultivo no está) → `almacen` | Catálogo | `contexto.json` | Síncrono |
| 4a | Preparar los datos | `POST …/procesar` | `procesamiento` → **`conectores`** → *conectores del área de datos* | Parcela | `procesamiento.json` y caché | **En segundo plano** |
| 4b | Ver el avance | `GET …/procesamiento` | `procesamiento` → `almacen` | `procesamiento.json` | — | Síncrono |
| 4c | Al terminar cada fuente | (interno) | `ingesta` (vía `almacen`) → `indicadores` → `almacen` | Caché | `indicadores.json` | En segundo plano |
| 5 | **Cómo está mi campo** | `GET …/indicadores` · `…/clima` | `indicadores` → `almacen` | `indicadores.json` | — | Síncrono |
| 6 | **Qué siembro después** | `GET …/rotaciones` | **`motor`**: `estrategias` → `evidencia` → `comparacion` → `presentacion` → `explicacion` | Contexto, indicadores y catálogo | `rotaciones.json` | Síncrono |
| 7 | Pregunta a Tarpu | `GET …/agente` · `POST /api/agente` | **`agente`**: `intenciones` → `plantillas` → `banco` | Indicadores, rotaciones y procesamiento | — | Síncrono |
| 8 | Ver y descargar | `GET …/datos` | `datos_detallados` → `ingesta` | Caché | — | Síncrono, **sin motor** |
| — | Publicar | `python -m tarpu_api.exportar` | `exportar` → cada ruta `GET` con `TestClient` | Todo | `Codigo/public/api/**.json` | Comando |

### 4.1 Paso 2 en detalle: registrar la parcela

```text
POST /api/parcelas  { "nombre": "...", "contorno": { GeoJSON Polygon } }
  │
  ├─ esquemas.ParcelaNueva               valida la forma del JSON (422 si no)
  ├─ geometria.validar(contorno)         Shapely: ≥ 3 puntos distintos, cerrado, sin cruces
  │     └─ si no es válido → 400 { codigo: "contorno_invalido", detalle: explain_validity }
  ├─ geometria.area_y_perimetro          pyproj.Geod, geodésicos sobre WGS84
  ├─ geometria.pixeles_modis_250m        cuántos píxeles nominales de MODIS (6,25 ha) caben: dato geométrico, no un umbral
  ├─ geometria.centroide / recuadro      el centroide es el punto que se consulta en las tres fuentes
  └─ parcelas.crear(...)                 id, versión 1, almacen.guardar
  ← 201 { id, area_ha, perimetro_m, pixeles_modis_250m, centroide, recuadro }
```

**No se aplican límites de tamaño inventados.** La pantalla muestra el área y cuántos píxeles de MODIS caben. Si sale menos de 1, el NDVI describe un píxel más grande que la parcela, y eso se dice. Si el equipo decide un mínimo o un máximo, se registra en `docs/06` con su motivo y entonces se aplica.

### 4.2 Paso 4 en detalle: preparar los datos de la parcela

```text
POST /api/parcelas/{id}/procesar
  └─ procesamiento.iniciar(id)        marca cada fuente con conector «en_proceso» y las demás «no_disponible» (con su motivo)
     y lanza procesamiento.procesar(id) con BackgroundTasks
        para cada fuente registrada en conectores.py que tenga conector:
          ├─ conector.obtener(lat, lon, inicio, fin)   en el centroide; reutiliza la caché si ya están los tres archivos
          │     escribe original, normalizado y procedencia en almacen/cache/{fuente}/{clave}/
          ├─ si la procedencia informa días sin dato → «parcial», con el número real
          └─ si falla → «no_disponible», con el motivo literal; las demás siguen
        indicadores.actualizar(id)    ingesta lee la caché (vía almacen) y recalcula con lo disponible
GET /api/parcelas/{id}/procesamiento  ← { estado, fuentes: [ { id, nombre, estado, motivo, actualizado } ] }
```

Medido el 14/11/2026 con el servidor real: preparar la serie 2015–2025 de POWER para un punto de Chivay tardó **4,1 s**.

### 4.3 Paso 6 en detalle: comparar cultivos

El motor **no inventa** pesos, umbrales ni beneficios. Compara datos reales con rangos citados de **FAO EcoCrop** ([catalogo/ecocrop_2026-11-14.json](catalogo/ecocrop_2026-11-14.json)):

```text
motor.comparar(parcela, contexto, indicadores)
  1 estrategias   E1 = el cultivo que declara el usuario (repetirlo)
                  E2… = TODOS los cultivos del catálogo con otra familia que el actual
                  (con papa: haba, cebada y quinua → 4 estrategias; el desafío pide al menos 3)
  2 evidencia     qué datos reales hay y cuáles faltan
  3 comparacion   por criterio, sin pesos ni puntaje:
                  · temperatura  promedio de las medias mensuales de los meses DECLARADOS (POWER)
                                 frente al rango óptimo y absoluto  → dentro_optimo | dentro_absoluto | fuera_absoluto
                  · frío         noches con T2M_MIN ≤ temperatura letal de EcoCrop en esos meses → medido (sin evaluar)
                  · lluvia       promedio de los totales anuales (POWER) frente al rango anual → dentro_optimo | …
                                 si el usuario declaró riego, se dice que la lluvia no es su única agua
                  · suelo        pH de SoilGrids frente al rango de EcoCrop → dentro_optimo | … (hoy sin_dato: falta el conector)
                  · familia      misma o distinta que el cultivo actual → informativo (sin valorarlo)
                  · altitud      elevación de la celda de POWER frente a la altitud máxima → informativo | conflicto_entre_fuentes
                  si falta el dato: sin_dato · si EcoCrop no trae la regla: sin_regla
  4 presentacion  ordena los criterios según las prioridades que DECLARA el usuario (sin convertirlas en pesos)
  5 explicacion   frases armadas solo con los datos y la cita; vacíos y conflictos de fuente
  ← N estrategias, cada una con sus criterios, sus frases, sus vacíos, sus conflictos y su cita
```

**Conflicto verificado que el motor muestra en lugar de decidir:** EcoCrop da una altitud máxima absoluta de 2800 m para la papa y de 2700 m para la haba. La celda de NASA POWER consultada para Chivay está a 4352 m. EcoCrop describe la especie, no las variedades locales. Por eso:

- la altitud **no** excluye ningún cultivo;
- se muestra como «conflicto entre fuentes».

**Beneficios** (por ejemplo, «fija nitrógeno»): se muestran **solo con cita**. Hasta incorporar una fuente (INIA u otra), el campo dice «sin beneficio citado».

## 5. Qué módulos usa cada parte

✎ = escribe · ● = usa · ○ = lee.

| Módulo ↓ / usado por → | `POST parcelas` | `contexto` | `procesar` | `indicadores` | `rotaciones` | `agente` | `datos` | `exportar` |
|---|---|---|---|---|---|---|---|---|
| `config` | ● | ● | ● | ● | ● | ● | ● | ● |
| `esquemas` | ● | ● | ● | ● | ● | ● | ● | ● |
| `errores` | ● | ● | ● | ● | ● | ● | ● | ● |
| `almacen` | ✎ | ✎ | ✎ | ○ | ✎ | ○ | ○ | ○ |
| `geometria` | ● | | | | | | | |
| `parcelas` | ✎ | ✎ | ○ | ○ | ○ | ○ | ○ | ○ |
| `conectores` | | | ● | | | ○ | ○ | |
| `ingesta` | | | ● | | | | ● | |
| `indicadores` | | | ✎ | ● | ○ | ○ | ○ | ○ |
| `catalogo` | | ○ | ○ | | ● | | | ● |
| `motor/*` | | | | | ● | | | ● |
| `agente/*` | | | | | | ● | | ● |
| `datos_detallados` | | | | | | | ● | ● |
| `procesamiento` | | | ● | | | | | |
| `meta` | | | | | | | | ● |

**Dependencias permitidas** (de arriba abajo; nada importa hacia arriba; lo comprueba `tests/test_capas.py`):

```text
capa 4 · API      main · esquemas · meta · procesamiento · exportar
capa 3 · lógica   motor/ · agente/
capa 2 · núcleo   parcelas · geometria · ingesta · indicadores · datos_detallados
capa 1 · apoyo    config · almacen · catalogo · conectores · errores
```

- `motor` y `agente` **no** descargan: solo leen lo ya calculado. El agente lee el registro de conectores solo para describir las fuentes.
- `datos_detallados` **no** importa `motor`.

## 6. Módulos de apoyo

| Módulo | Hace | Por qué |
|---|---|---|
| `config.py` | Lee las variables de entorno y `backend/.env` (sección 3) | Que el mismo código funcione en cada computadora y en la exportación |
| `almacen.py` | Guarda y lee los JSON de cada parcela en `almacen/parcelas/{id}/` y da acceso a la caché | Es el **único** módulo que toca el disco. `ingesta` lee la caché a través de él. Si después se pasa a PostGIS, solo cambia este |
| `conectores.py` | **Registro** de las tres fuentes: función, punto, al momento, resolución y motivo si no hay conector | Punto de unión con Damaris (sección 7) |
| `catalogo.py` | Carga el catálogo citado y **rechaza** cualquier regla sin fuente | Que el motor no pueda usar un valor sin cita |
| `errores.py` | Errores con código estable para el frontend | Cualquier capa puede lanzarlos sin importar la API |

## 7. Cómo nos conectamos con el área de datos (Damaris)

El backend **orquesta**; los conectores **descargan**. Propuesta de interfaz para acordar con Damaris (el archivo es suyo):

```python
# en datos/<fuente>/... (área de datos)
def obtener(*, lat: float, lon: float,
            inicio: str, fin: str,                 # AAAA-MM-DD (MODIS y POWER; SoilGrids no tiene fechas)
            salida: str) -> dict: ...
# devuelve { "estado": "listo" | "sin_datos",
#            "archivos": { "original": ruta, "normalizado": ruta, "procedencia": ruta },
#            "motivo": str | None }               # texto literal del proveedor o del error
```

| Regla del conector | Por qué la necesita el backend |
|---|---|
| Escribe siempre los tres archivos (original, normalizado y procedencia) con el mismo nombre base | `ingesta` sabe qué leer |
| El normalizado empieza con la columna `fecha` y pone la unidad entre paréntesis en la cabecera, como `T2M (C)` | `ingesta` lee cualquier fuente igual |
| La procedencia lleva `source_id`, `product_id`, versión, fechas, unidades, resolución, `missing_days` y URL | El contrato de salida la muestra tal cual |
| Faltante = celda vacía en el CSV | Nunca se confunde con 0 |
| Si falla, devuelve `sin_datos` con el motivo real; no corta el programa | `procesamiento` marca esa fuente y sigue con las demás |
| Funciona también por línea de comandos | Damaris prueba sin el backend |

**Hoy:** `consulta_power.py` ya escribe los tres archivos y acepta `--salida`. `conectores.py` lo invoca **por su línea de comandos, sin modificarlo**. Cuando exista `obtener()`, solo cambia `conectores._power()`. **Se lo propongo a Damaris; su archivo no se cambia sin ella.**

**Registro de fuentes** (`conectores.py`, DT-17):

| Fuente | Pide | Cómo responde | Resolución | Estado del conector |
|---|---|---|---|---|
| NASA POWER | punto (centroide) | Al momento | Celda de 0,5° × 0,625° (≈ 55 × 67 km en Arequipa) | ✅ Conectado y probado en vivo |
| NDVI de MODIS (`MOD13Q1` v061, ORNL) | punto | Al momento; respondió 502 en varias pruebas | Píxel nominal de 250 m, cada 16 días | ❌ Falta el conector en `datos/`. La consulta manual se probó (Chivay) |
| SoilGrids (ISRIC) | punto | Al momento | 250 m (predicción) | ❌ Falta el conector en `datos/`. La consulta manual se probó (Majes) |

Mientras falte un conector, esa fuente aparece «no disponible» con ese motivo, y lo que depende de ella sale `sin_dato`.

## 8. Cómo nos conectamos con el frontend (Shantall)

| Acuerdo | Detalle |
|---|---|
| Dirección base | `VITE_API_BASE`: `http://127.0.0.1:8000` en vivo; vacía en la web publicada, que lee `/api/…json` |
| Formato | Sobre común: `{ data, procedencia, avisos, modo, generado }` |
| Origen de cada valor | Todo valor indica si viene de una **fuente** (con su procedencia) o fue **declarado por el usuario** |
| Tipos | [contrato/esquemas/](contrato/esquemas/), generados con `python -m tarpu_api.esquemas` |
| CORS | Se permite `http://127.0.0.1:5173` y `http://localhost:5173` en desarrollo |
| Errores | `{ "error": { "codigo": "...", "mensaje": "texto para el usuario", "detalle": ... } }` |
| Procesos largos | «Preparando tus datos» consulta `…/procesamiento` hasta que `estado` sea `terminado` |
| Web publicada | Las rutas `POST` y `PUT` no existen ahí; la pantalla lo sabe por `meta.modo` y `meta.acciones_en_vivo` |

**Códigos de error:**

| HTTP | `codigo` | Cuándo |
|---|---|---|
| 400 | `contorno_invalido` | Cruces, menos de 3 puntos o sin cerrar |
| 404 | `parcela_no_existe` | El id no existe |
| 405 | `solo_en_vivo` | Una acción `POST` o `PUT` con `TARPU_MODO=publicado` |
| 409 | `parcela_desactualizada` | Se redibujó la parcela y el resultado era de la versión anterior |
| 409 | `datos_no_listos` | Se piden indicadores o rotaciones antes de preparar los datos |
| 422 | `datos_invalidos` | El JSON no cumple el contrato |

## 9. Almacenamiento

En la demo **no hay base de datos** (DT-13): JSON en disco, escritos de forma atómica.

```text
backend/almacen/                       (ignorado por git)
  parcelas/{id}/
    parcela.json        contorno GeoJSON, área, perímetro, píxeles de MODIS, centroide, versión
    contexto.json       lo que declara el usuario; «no sé» queda como null
    procesamiento.json  estado por fuente
    indicadores.json    calculados, con procedencia y la versión de la parcela
    rotaciones.json     resultado del motor
  cache/{fuente}/{clave}/   archivos de los conectores (clave = punto + período)
backend/catalogo/ecocrop_2026-11-14.json   catálogo citado (sí va a git)
```

## 10. Pruebas

`python -m pytest`: **15 pruebas, todas pasan** (14/11/2026). Usan la consulta real de POWER de Chivay guardada en `tests/fuentes/`, sin red.

| Archivo | Qué prueba |
|---|---|
| `test_nucleo.py` | Un contorno con cruces se rechaza con su motivo; uno sin cerrar o con pocos puntos también; el área coincide con el cálculo geodésico; una celda vacía es `None` y nunca `0`; los indicadores **reproducen** `contrato/ejemplos/indicadores_chivay.json`; un mes incompleto no entra en los totales; el catálogo rechaza una regla sin fuente y coincide con EcoCrop |
| `test_api.py` | Recorrido completo: registrar, declarar, preparar, indicadores, clima, rotaciones (papa → 4 estrategias, sin ninguna clave de puntaje o peso, orden según prioridades, altitud en conflicto sin excluir, haba sin regla de frío, suelo sin dato), agente (cita, «no pronostica»), datos detallados; meses sin declarar → `sin_dato`; redibujar → 409; exportar escribe un archivo por ruta y solo parcelas con datos |
| `test_capas.py` | Ninguna capa importa hacia arriba; `datos_detallados` no importa el motor; motor y agente no descargan |

## 11. Orden de construcción

Por dependencias, sin plazos.

| # | Construir | Hecho cuando… | Estado |
|---|---|---|---|
| 1 | Esqueleto: `config`, `esquemas`, `main` con `GET /api/meta`, CORS y `requirements.txt` | `uvicorn` responde y `/docs` se abre | ✅ |
| 2 | `geometria` + `almacen` + `parcelas` + `POST /api/parcelas` + `PUT …/contexto` | Se registra un contorno y su contexto declarado | ✅ |
| 3 | `conectores` + `procesamiento` + `ingesta` con POWER | Una parcela obtiene su serie real de POWER | ✅ probado en vivo |
| 4 | `indicadores` | Reproduce el ejemplo de Chivay con datos reales | ✅ |
| 5 | `catalogo` + `motor` | Compara con EcoCrop citado, sin puntaje | ✅ |
| 6 | `agente` | Responde con datos y cita | ✅ |
| 7 | `datos_detallados` | `GET …/datos` sin motor | ✅ |
| 8 | `exportar` | La web publicada lee los JSON de parcelas registradas con datos reales | ✅ (probado en una carpeta temporal; aún no se escribió en `Codigo/`) |
| 9 | MODIS y SoilGrids en el registro | Cuando Damaris tenga sus conectores: NDVI de la zona en indicadores y criterio de suelo con dato real | ⏳ depende del área de datos |
| 10 | Conectar las pantallas | El frontend lee la API o los JSON exportados | ⏳ con Shantall |

**Si algo no llega con datos reales, no se muestra.** No se sustituye por un ejemplo.

## 12. Cómo se ejecuta

Desde `backend/`:

```bash
py -3.13 -m venv .venv
```

```bash
.venv/Scripts/python -m pip install -r requirements.txt
```

```bash
.venv/Scripts/uvicorn tarpu_api.main:app --reload --port 8000
```

Con el servidor encendido, la documentación interactiva está en http://127.0.0.1:8000/docs.

```bash
.venv/Scripts/python -m pytest
```

```bash
.venv/Scripts/python -m tarpu_api.exportar
```

```bash
.venv/Scripts/python -m tarpu_api.esquemas
```

`exportar` escribe en `../Codigo/public/api/` (carpeta de Shantall): se ejecuta cuando el equipo lo acuerde. Con `--destino` se puede escribir en otra carpeta.

## 13. Pendientes que se resuelven con evidencia, no con supuestos

| Pendiente | Cómo se resuelve | Quién |
|---|---|---|
| Conectores de MODIS (ORNL) y SoilGrids | Escribirlos en `datos/` con el mismo formato que POWER; el backend ya los espera en el registro | Damaris |
| Definición oficial de helada para citarla (por ejemplo, SENAMHI) | Buscar la definición y su fuente; mientras tanto se dice «noches bajo 0 °C» o «noches bajo la temperatura letal de EcoCrop» | Derecho B |
| Reglas locales de rotación y beneficios de cada cultivo | Buscarlos en INIA u otra fuente; incorporarlos al catálogo con su cita | Derecho B y Erick |
| Contexto de la parcela que se muestre en la demo | Que lo declare un agricultor real (con su permiso) o el presentador en vivo, rotulado como «declarado por el usuario» | Equipo, en la reunión |
| Límite oficial de Arequipa, para avisar si un contorno cae fuera | Obtenerlo del IGN o del INEI; sin él, no se avisa | Damaris |

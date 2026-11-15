# Módulos del backend de TARPU

> Versión escrita del mapa [diagramas/tarpu-backend-mapa.pdf](diagramas/tarpu-backend-mapa.pdf) ([PNG](diagramas/tarpu-backend-mapa.png)). 14/11/2026: sin supuestos (DT-16), con las tres fuentes de la demo (DT-17) y **construido**. Decisiones: DT-13 (FastAPI con exportación a JSON), DT-14 (agente guiado), DT-15 (Vercel o Netlify), DT-16 (cero supuestos) y DT-17 (solo POWER, MODIS y SoilGrids).
>
> **Cómo se conectan** (recorrido por módulo, herramientas, interfaces, errores, pruebas y orden de construcción): [DISENO.md](DISENO.md).

**Regla de todos los módulos (DT-16):** cada valor viene de una fuente real con procedencia o lo declara el usuario. Ninguna regla, umbral, rango ni peso se usa sin cita. Nada sintético. Lo que no se sabe se dice.

## Estructura

Diagrama de carpetas y archivos: [diagramas/tarpu-backend-archivos.pdf](diagramas/tarpu-backend-archivos.pdf) ([PNG](diagramas/tarpu-backend-archivos.png)) · interactivo: [diagramas/tarpu-backend-interactivo.html](diagramas/tarpu-backend-interactivo.html).

```text
backend/
  README.md · AGENTS.md · CLAUDE.md · DISENO.md · MODULOS.md · PROPUESTA.md
  requirements.txt        versiones exactas probadas
  .env.example            variables de config.py, sin secretos
  pytest.ini              configuración de las pruebas
  diagramas/              mapa, archivos e interactivo, con sus generadores
  catalogo/
    ecocrop_2026-11-14.json   rangos de FAO EcoCrop, copiados tal cual y con su URL
  contrato/
    esquemas/             JSON Schema generados por esquemas.py
    ejemplos/             JSON calculados con datos reales (indicadores de Chivay)
  tarpu_api/
    __init__.py           versión
    config.py             apoyo · variables de entorno
    almacen.py            apoyo · único módulo que lee y escribe en disco
    catalogo.py           apoyo · carga el catálogo y rechaza reglas sin fuente
    conectores.py         apoyo · registro de las tres fuentes y llamada al conector de POWER
    errores.py            apoyo · errores con código estable
    parcelas.py           núcleo · parcela (contorno) y contexto declarado
    geometria.py          núcleo · valida el contorno, área geodésica, píxeles de MODIS, centroide
    ingesta.py            núcleo · lee lo que dejan los conectores (vía almacen)
    indicadores.py        núcleo · conteos, promedios y totales de datos reales
    datos_detallados.py   núcleo · registros por nivel (sin motor)
    motor/
      __init__.py         comparar(parcela, contexto, indicadores)
      estrategias.py      1 · cultivo actual + todos los de otra familia del catálogo
      evidencia.py        2 · qué datos hay y cuáles faltan
      comparacion.py      3 · cada criterio frente al rango citado (sin pesos)
      presentacion.py     4 · orden según las prioridades declaradas
      explicacion.py      5 · frases con los datos y la cita; vacíos y conflictos
    agente/
      __init__.py         banco() y preguntar()
      intenciones.py      qué preguntas reconoce
      plantillas.py       respuestas armadas con datos reales
      banco.py            banco por parcela (GET) y respuesta en vivo (POST)
    esquemas.py           API · contrato (Pydantic)
    meta.py               API · versión, modo, fuentes y período
    procesamiento.py      API · estado de cada fuente por parcela
    main.py               API · rutas FastAPI
    exportar.py           API · JSON para la web publicada
  tests/
    conftest.py · test_nucleo.py · test_api.py · test_capas.py
    fuentes/              consulta real a NASA POWER (Chivay, 2015–2025) para probar sin red
  almacen/                parcelas y caché (ignorado por git)
  .venv/                  entorno virtual (ignorado por git)
```

## 1. Fuentes (DT-17, área de datos)

No son módulos del backend: el backend solo **invoca y lee** lo que producen los conectores de Damaris. Las tres se consultan en el centroide de la parcela.

| Fuente | Acceso | Para qué | Escala | Conector |
|---|---|---|---|---|
| NASA POWER | Sin cuenta | Temperatura, lluvia, humedad, radiación diarias | Celda de 0,5° × 0,625° (≈ 55 × 67 km) | ✅ `datos/power/consulta_power.py` |
| NDVI de MODIS (`MOD13Q1` v061, ORNL) | Sin cuenta; respondió 502 en varias pruebas | Verdor de la zona | Píxel nominal de 250 m, cada 16 días | ❌ pendiente en `datos/` |
| SoilGrids (ISRIC) | Sin cuenta | pH del suelo | 250 m (predicción) | ❌ pendiente en `datos/` |

POWER y SoilGrids no son imágenes de satélite: POWER combina modelos y satélites, y SoilGrids es una predicción. El único satélite directo es MODIS.

## 2. Apoyo

### `config.py`
- **Hace:** lee las variables de entorno y `backend/.env`. Detalle en [DISENO.md §3](DISENO.md#3-herramientas-y-cómo-las-usamos).

### `almacen.py`
- **Hace:** es el único módulo que lee y escribe en disco: parcela, contexto, estados, resultados y la caché de los conectores.
- **Reglas:** escritura atómica; solo lee archivos dentro del almacén.
- **Por qué:** si después se pasa a PostGIS, solo cambia este módulo.

### `catalogo.py`
- **Hace:** carga el catálogo de FAO EcoCrop y lo valida: cada cultivo con fuente (nombre, URL y fecha de consulta), familia y rangos bien formados. Si falta algo, **rechaza** el catálogo.

### `conectores.py`
- **Hace:** registra las tres fuentes: qué función la obtiene, si pide un punto, si responde al momento, su resolución y, si no hay conector, el motivo.
- **POWER:** llama a `datos/power/consulta_power.py` por su línea de comandos, sin modificarlo, y reutiliza la caché.
- **Interfaz con el área de datos:** [DISENO.md §7](DISENO.md#7-cómo-nos-conectamos-con-el-área-de-datos-damaris).

### `errores.py`
- **Hace:** errores con código estable (`contorno_invalido`, `parcela_no_existe`, `parcela_desactualizada`, `datos_no_listos`, `datos_invalidos`, `solo_en_vivo`).

## 3. Núcleo de datos

### `parcelas.py`
- **Datos de la parcela:** contorno GeoJSON, nombre, versión y las medidas de `geometria`.
- **Contexto declarado por el usuario:** cultivo actual y anterior, agua (secano o riego), meses de campaña en el orden en que los declara y prioridades.
- **Reglas:**
  - lo declarado se guarda con origen «declarado» y se muestra como «declarado por ti»;
  - «No sé» queda como `null`, nunca como un valor por defecto;
  - si un cultivo no está en el catálogo, se guarda y se avisa que no se puede comparar;
  - **no hay parcelas ficticias.**

### `geometria.py`
- **Hace:**
  - valida el contorno: al menos 3 puntos distintos, cerrado y sin cruces (con `explain_validity` si falla);
  - calcula el **área y el perímetro geodésicos** (`pyproj.Geod`, WGS84);
  - calcula **cuántos píxeles nominales de MODIS (250 m, 6,25 ha) caben**;
  - obtiene el centroide (el punto que se consulta) y el recuadro.
- **Reglas:**
  - **no aplica límites de tamaño inventados**;
  - el aviso de «fuera de Arequipa» solo se activará con un límite oficial (IGN o INEI);
  - dibujar no acredita propiedad legal.

### `ingesta.py`
- **Hace:** lee el normalizado y la procedencia que dejan los conectores, a través de `almacen`.
- **Regla:** un faltante (celda vacía) pasa a `None`, nunca a `0`. Conserva la unidad de la cabecera.

### `indicadores.py`
- **Calcula solo descripciones de datos reales** (serie diaria de POWER):
  - temperatura media por mes y temperatura mínima registrada;
  - **noches con temperatura mínima bajo 0 °C** por mes (promedio por año);
  - noches con mínima **igual o menor que cada temperatura letal citada** en el catálogo (para el motor);
  - lluvia promedio por mes y total por año (solo años completos);
  - serie mensual año por año (para la pantalla de clima) y meses con días sin dato.
- **Reglas:**
  - un mes con algún día sin dato no entra en los totales ni en los conteos de esa variable;
  - aritmética decimal exacta y redondeo a 1 decimal, hacia arriba en el empate;
  - no usa la palabra «helada» como diagnóstico mientras no haya una definición citada;
  - cada valor lleva su procedencia y su escala (celda de POWER).
- **Comprobación:** reproduce [contrato/ejemplos/indicadores_chivay.json](contrato/ejemplos/indicadores_chivay.json).
- **Cuando lleguen MODIS y SoilGrids:** se añaden aquí el NDVI de la zona y el pH, con su procedencia.

### `datos_detallados.py`
- **Hace:** por cada fuente, el original del proveedor, el normalizado (columnas con unidad y filas) y la procedencia; además, lo derivado por TARPU con su método.
- **Regla:** **no importa el motor** (DEC-003).

## 4. Motor (`motor/`)

**Función pública:** `comparar(parcela, contexto, indicadores)`.

**Catálogo:** solo valores de FAO EcoCrop, con URL y fecha ([catalogo/ecocrop_2026-11-14.json](catalogo/ecocrop_2026-11-14.json)), para papa, haba, cebada y quinua. Si EcoCrop no trae un dato, queda `null`.

| # | Módulo | Hace |
|---|---|---|
| 1 | `estrategias.py` | E1 = repetir el cultivo actual declarado. E2 en adelante = **todos** los cultivos del catálogo de otra familia: con papa, haba, cebada y quinua (4 estrategias). Si no se declaró un cultivo actual del catálogo, lista todos y lo dice como vacío |
| 2 | `evidencia.py` | Qué datos reales hay y cuáles faltan: temperatura de la campaña, noches hasta cada temperatura letal, lluvia anual media, pH y elevación de la celda |
| 3 | `comparacion.py` | Cada criterio frente a su regla citada (tabla de abajo) |
| 4 | `presentacion.py` | Ordena los criterios según las **prioridades que declara el usuario**, sin convertirlas en pesos ni calcular un puntaje |
| 5 | `explicacion.py` | Frases armadas **solo** con datos y citas, más los vacíos (datos o reglas que faltan) y los conflictos entre fuentes |

**Criterios:**

| Criterio | Dato real | Regla citada (EcoCrop) | Estados posibles |
|---|---|---|---|
| Temperatura | Promedio de las medias mensuales de los meses de campaña **declarados** (POWER) | Rango óptimo y absoluto | `dentro_optimo` · `dentro_absoluto` · `fuera_absoluto` · `sin_dato` si no hay meses declarados |
| Frío | Noches con T2M_MIN ≤ temperatura letal, sumadas en esos meses (POWER) | Temperatura letal en reposo y en crecimiento temprano | `medido` (hecho, sin evaluar) · `sin_regla` para la haba (EcoCrop no trae el dato) · `sin_dato` |
| Lluvia | Promedio de los totales anuales (POWER) | Rango anual | `dentro_optimo` · `dentro_absoluto` · `fuera_absoluto`; si el usuario declaró riego, se añade que la lluvia no es su única agua |
| Suelo | pH de SoilGrids (250 m) | Rango de pH | Igual que temperatura. Hoy `sin_dato`: falta el conector. Es una predicción, no un análisis de suelo |
| Familia | Misma o distinta que el cultivo actual | Familia de EcoCrop | `informativo`: se muestra sin valorarlo hasta tener una regla citada (INIA u otra) |
| Altitud | Elevación de la celda de POWER | Altitud máxima absoluta | `informativo` · `conflicto_entre_fuentes`. **Nunca excluye.** Conflicto verificado: EcoCrop da 2800 m para la papa; la celda de POWER de Chivay está a 4352 m |

**Reglas que no se negocian:**
- **sin puntaje y sin pesos**, porque no hay una fuente que los respalde;
- **sin «apto» ni «no apto»**: solo la comparación de cada criterio con su cita;
- los beneficios (por ejemplo, «fija nitrógeno») se muestran **solo con cita**; sin ella, «sin beneficio citado»;
- un cultivo no se descarta por un NDVI bajo.

## 5. Agente (`agente/`)

| Módulo | Hace |
|---|---|
| `intenciones.py` | Reconoce ocho intenciones por palabras clave: frío, lluvia, por qué aparece un cultivo, qué falta, qué es el NDVI, fuentes, descargar y pronóstico. «Pronóstico» se revisa primero para no responder «¿va a llover mañana?» con un registro del pasado |
| `plantillas.py` | Arma cada respuesta solo con valores reales y su cita. Si no hay dato, lo dice. Ante una pregunta de pronóstico, responde que TARPU no pronostica. La definición de NDVI cita a NASA Earth Observatory |
| `banco.py` | `GET`: banco de respuestas por parcela (se exporta), con una pregunta por cultivo · `POST`: pregunta libre (solo en vivo) |

No usa un modelo de IA (DT-14), no inventa observaciones y no cambia las reglas.

## 6. API y salida

| Módulo | Hace |
|---|---|
| `esquemas.py` | Contrato Pydantic. Sobre común: `data`, `procedencia`, `avisos`, `modo` y `generado`. Cada valor indica si viene de una **fuente** o fue **declarado por el usuario**. `python -m tarpu_api.esquemas` escribe `contrato/esquemas/` |
| `main.py` | Rutas FastAPI, manejo de errores y documentación en `/docs` |
| `meta.py` | Versión, modo (`en_vivo` o `publicado`), fuentes con su estado y período de POWER |
| `procesamiento.py` | `POST …/procesar` y `GET …/procesamiento`: estado por fuente (listo, parcial, en proceso o no disponible) con el motivo real |
| `exportar.py` | Escribe cada ruta `GET /api/X` en `<destino>/X.json` para la web publicada. Solo exporta parcelas **con datos reales de su versión actual** |

**Rutas GET** (se exportan): `/api/meta` · `/api/catalogo` · `/api/parcelas` · `/api/parcelas/{id}` · `…/indicadores` · `…/clima` · `…/rotaciones` · `…/agente` · `…/datos`.

**Solo en vivo:**
- `POST /api/parcelas` (registrar el contorno) y `PUT …/contorno` (redibujarlo);
- `PUT …/contexto`;
- `POST …/procesar` y `GET …/procesamiento`;
- `POST /api/agente` con pregunta libre.

## 7. Quién consume la API

| Consumidor | Cómo | Etapa |
|---|---|---|
| Web TARPU (`Codigo/`) | En vivo contra la API, o leyendo los JSON exportados en la web publicada | Ahora |
| App Android | La misma API en vivo | Después |
| App iOS | La misma API; implementada, quizá sin lanzar | Después |

## 8. Ampliaciones por priorizar, después de la demo

- Agente con modelo de lenguaje (SUP-034).
- Base de datos PostGIS (SUP-015, SUP-023).
- Identidad y permisos (SUP-026).
- Trabajos y caché avanzados (SUP-024).
- Más fuentes, si el equipo lo decide con una decisión nueva que reemplace DT-17, y reglas locales citadas (INIA).

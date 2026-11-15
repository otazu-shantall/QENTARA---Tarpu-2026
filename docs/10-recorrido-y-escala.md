# Recorrido del usuario, cálculo por parcela y escala posible

> **15/11/2026: el enfoque de datos vigente es el esquema mixto (DT-22, [11](11-esquema-mixto.md)).** Las fuentes son las de DT-19; donde este documento hable solo de tres fuentes o de una web sin servidor, manda [11](11-esquema-mixto.md).
>
> Planificación del 14/11/2026. Ese mismo día se revisó para quitar todo supuesto (DT-16) y se ajustó a las tres fuentes de la demo (DT-17). El backend que la implementa ya está construido. Responde a tres preguntas:
>
> 1. ¿Qué ve y hace el usuario, paso a paso?
> 2. ¿Cómo se marca la parcela y qué se calcula de ella?
> 3. ¿En qué rango de tamaño, territorio y fechas es posible?
>
> Se apoya en [backend/DISENO.md](../backend/DISENO.md) y [backend/MODULOS.md](../backend/MODULOS.md). **Verificado** = comprobado con una consulta real. Lo que no está verificado aparece como **pendiente**, con cómo verificarlo. Las pantallas finales las define el área de frontend.

## 1. La idea en una línea

El usuario **ubica su campo en el mapa**, **dibuja su contorno** y **declara qué siembra y cuándo**. TARPU le muestra **datos reales de su zona**, en el punto central de su campo, y dice siempre la escala de cada dato y de dónde sale. Después **compara cultivos con rangos citados**.

**Fuentes (DT-19):** POWER, SoilGrids, GAEZ, MODIS, NASADEM, HLS, SMAP y el censo agropecuario 2012. Solo HLS y NASADEM (30 m) se acercan a la escala de una parcela; el resto describe la zona. Por eso TARPU habla de «tu zona» salvo donde la escala lo permita, y lo dice.

## 2. El recorrido, paso a paso

| # | Pantalla | Qué hace el usuario | Qué hace TARPU | Ruta de la API | Módulos |
|---|---|---|---|---|---|
| 0 | Inicio | Pulsa «Empezar» | Explica en una frase qué hace TARPU y qué no | `GET /api/meta` | `meta` |
| 1 | **Ubicar mi campo** | Busca su distrito, usa «Estoy en mi campo» (GPS) o mueve el mapa satelital | Centra el mapa | — (en el navegador) | — |
| 2 | **Dibujar mi parcela** | Toca las esquinas de su campo sobre la imagen; pulsa «Listo» | Valida el contorno; calcula el área real, cuántos píxeles de MODIS caben y el centroide | `POST /api/parcelas` | `geometria`, `parcelas` |
| 3 | **Contar mi campo** | Declara el cultivo actual y el anterior, secano o riego, **los meses en que el cultivo está en el campo** y qué le importa. Siempre puede responder «No sé» | Lo guarda como «declarado por ti». «No sé» queda como desconocido | `PUT /api/parcelas/{id}/contexto` | `parcelas`, `catalogo` |
| 4 | **Preparando tus datos** | Ve lo de la base de Arequipa al instante; puede salir y volver | Lee la capa 1 en el centroide y lanza el trabajo por coordenada de la capa 2 (DT-22); avisa cuando termina | `POST …/procesar` · `GET …/procesamiento` | `procesamiento`, `conectores`, `ingesta`, `indicadores` |
| 5 | **Cómo está mi campo** | Lee frases y tarjetas: temperatura, noches bajo 0 °C, lluvia y verdor | Cada dato lleva su escala («tu zona, celda de ≈ 55 × 67 km» o «tu zona, píxel de 250 m»), su fuente y su período | `GET …/indicadores` · `…/clima` | `indicadores` |
| 6 | **¿Qué siembro después?** | Ve su cultivo actual y los demás del catálogo, criterio por criterio | Compara cada criterio con el rango citado de FAO EcoCrop; dice qué falta y qué fuentes chocan | `GET …/rotaciones` | `motor` |
| 7 | **Pregunta a Tarpu** | Toca una pregunta sugerida o escribe la suya | Responde con los datos de su parcela y la cita | `GET …/agente` · `POST /api/agente` | `agente` |
| 8 | **Ver y descargar** | Abre los registros y los descarga | Muestra los datos sin pasar por el motor, con su nivel (original, normalizado o derivado) | `GET …/datos` | `datos_detallados` |

**Para personas mayores (área de frontend):**

- **Una pregunta por pantalla.**
- **Botones grandes:** «Deshacer último punto», «Empezar de nuevo» y «Listo».
- **Volver siempre visible**, sin perder lo ya dibujado.

## 3. Cómo se marca la parcela

### 3.1 Formas de ubicarla

| Forma | Cómo | Qué permite |
|---|---|---|
| **Dibujar el contorno** | Tocar las esquinas sobre la imagen satelital | Área real del campo, píxeles de MODIS que caben y el centroide que se consulta |
| **Estoy en mi campo** (GPS) | El navegador pide la ubicación del teléfono | Centrar el mapa. El navegador informa su propia **precisión en metros** (`coords.accuracy`) y se muestra tal cual |

**Después:** en Android, recorrer el borde del campo con el GPS.

### 3.2 Cómo se dibuja (frontend)

| Pieza | Propuesta | Pendiente |
|---|---|---|
| Mapa | Leaflet (ya está en el prototipo) | Imagen base: Esri World Imagery, como en el prototipo (ver [entrega/pendientes-legales.md](../entrega/pendientes-legales.md)) |
| Dibujo | Un complemento de dibujo de polígonos para Leaflet (por ejemplo, Leaflet-Geoman o Leaflet.draw) | Elegirlo y revisar su licencia |
| Área en vivo | Cálculo geodésico en el navegador, solo para mostrar mientras se dibuja | El área oficial la da el backend |
| Formato | GeoJSON en WGS84 (EPSG:4326), puntos en `[longitud, latitud]` | — |

### 3.3 Qué valida y calcula el backend (`geometria.py`)

1. **Forma válida:** al menos 3 puntos distintos, cerrada y sin cruces. Si falla, explica qué corregir (`400 contorno_invalido`).
2. **Área y perímetro geodésicos** con `pyproj.Geod`, sin depender de una proyección plana.
3. **Píxeles de MODIS que caben** (área ÷ 6,25 ha, el píxel nominal de 250 m). Es un dato geométrico que se muestra tal cual. **No se aplican límites de tamaño inventados**: si el equipo decide uno, se registra en `docs/06` con su motivo.
4. **Centroide:** es el punto que se consulta en las tres fuentes.
5. **Versión:** si se redibuja (`PUT …/contorno`), sube la versión y los resultados anteriores dejan de servirse (`409 parcela_desactualizada`) hasta preparar los datos otra vez.
6. **Fuera de Arequipa:** el aviso solo se activará con el límite oficial (IGN o INEI). Pendiente: obtenerlo.

**Dibujar una parcela no acredita propiedad legal.**

## 4. Qué se calcula de la parcela

Con las tres fuentes de DT-17 **no se calcula nada dentro del contorno**: sus píxeles son más grandes que una parcela pequeña. El procedimiento es el mismo para las tres:

1. Se consulta el **centroide** de la parcela.
2. El dato se rotula **«de tu zona»**, con la escala real de la fuente.
3. Del contorno se usan el área y el número de píxeles de MODIS que caben, para que el usuario vea por qué el dato es de la zona.

| Fuente | Qué da | Escala (documentación del producto) | Etiqueta en pantalla | Conector |
|---|---|---|---|---|
| NASA POWER | Temperatura, lluvia, humedad y radiación diarias | Celda de 0,5° × 0,625° (≈ 55 × 67 km en Arequipa) | «Clima de tu zona» | ✅ |
| NDVI de MODIS (`MOD13Q1` v061, servicio de ORNL) | Verdor cada 16 días | Píxel nominal de 250 m | «Verdor de tu zona (píxel de 250 m)» | ⏳ área de datos |
| SoilGrids (ISRIC) | pH y otras propiedades del suelo, predichas | 250 m | «Suelo estimado de tu zona (250 m)» | ⏳ área de datos |

**Ejemplo verificado (14/11/2026, servidor real):** un contorno de 4,75 ha cerca de Chivay ocupa **0,76 píxeles de MODIS**. Su verdor, cuando llegue el conector, describirá un píxel más grande que el campo.

**No se rotulan meses como «sin cultivo»** a partir del NDVI sin un umbral citado. Se muestra la serie real.

## 5. Cómo se muestran los datos

### 5.1 El procedimiento

```text
Contorno ─▶ geometria (valida, área, píxeles de MODIS, centroide)
   │
   └─▶ centroide ─▶ POWER · MODIS · SoilGrids (conectores del área de datos) ─▶ ingesta
                                                                                  ▼
                                         indicadores (datos reales + procedencia + escala)
                                              │                         │
                                              ▼                         ▼
                                  motor (rangos citados de EcoCrop)   agente
                                              │                         │
                                              ▼                         ▼
                              API (data + procedencia + avisos)  ─▶  pantallas
```

### 5.2 Qué lleva cada dato en pantalla

| Elemento | Ejemplo con datos reales (Chivay, POWER 2015–2025) |
|---|---|
| Frase | «En tu zona, en julio, la mínima estuvo bajo 0 °C en promedio 29 noches» |
| Valor y unidad | 29,2 noches/mes · temperatura del aire a 2 m |
| Escala | «Tu zona: celda de NASA POWER de ≈ 55 × 67 km» |
| Fuente y período | NASA POWER, API diaria · 2015–2025 |
| Origen | «Dato de la fuente» o «Declarado por ti» |
| Faltantes | «0 días sin dato» (o el número real) |
| Qué no significa | «Es un registro del pasado, no un pronóstico» |
| Enlace | «Ver los datos» (datos detallados, sin motor) |

### 5.3 Gráficos y mapa

- **Noches bajo 0 °C:** barras por mes.
- **Lluvia:** barras por mes; los meses sin dato aparecen como hueco.
- **Verdor (cuando llegue MODIS):** línea por fecha, cortada donde no hubo observación válida.
- **Sobre el mapa:**
  - el **contorno** del campo, siempre;
  - el **centroide** consultado, marcado;
  - nunca se colorea el campo con un dato: ninguna de las tres fuentes describe su interior.

### 5.4 Estados de cada fuente

| Estado | Qué ve el usuario |
|---|---|
| Listo | ✓ con la fecha del dato |
| Parcial | Cuántos valores faltan, con el número real que informa el proveedor |
| En proceso | «Estamos pidiendo los datos de tu zona» |
| No disponible | El motivo real (por ejemplo, «el servicio respondió error 502» o «el área de datos todavía no tiene un conector para esta fuente»). El resto de TARPU sigue funcionando |

## 6. ¿En qué rango es posible hacer todo esto?

### 6.1 Territorio

| Aspecto | Dato | Estado |
|---|---|---|
| Cobertura de las fuentes | POWER y MODIS respondieron para Majes (costa) y Chivay (sierra); SoilGrids, para Majes | **Verificado** (14/11/2026). SoilGrids en Chivay: **pendiente** de consultar |
| Alcance del producto | Todo Arequipa (DEC-001) | Decidido |
| Límite oficial de Arequipa | Necesario para avisar de contornos fuera del alcance | **Pendiente**: obtenerlo del IGN o del INEI |

### 6.2 Tamaño de la parcela

Datos geométricos a partir de la escala de cada fuente. **No son umbrales: muestran cuántos píxeles caben.**

| Fuente | Píxel | Área de un píxel | Píxeles en 1 ha | Píxeles en 10 ha |
|---|---|---|---|---|
| MODIS | 250 m (nominal) | 6,25 ha | 0,16 | 1,6 |
| SoilGrids | 250 m | 6,25 ha | 0,16 | 1,6 |
| NASA POWER | ≈ 55 × 67 km | ≈ 370 000 ha | — | — |

**Qué significa, sin suponer nada:**

- con MODIS y SoilGrids, un solo píxel es más grande que una parcela de menos de 6,25 ha, así que su dato describe la zona;
- con POWER, el dato siempre describe una región muy amplia;
- ninguna de las tres permite calcular estadísticas dentro de una parcela pequeña.

TARPU muestra el número de píxeles de MODIS de cada parcela para que el usuario lo vea.

### 6.3 Fechas

| Fuente | Desde | Último dato al 14/11/2026 | Frecuencia | Estado |
|---|---|---|---|---|
| NASA POWER (diario) | 01/01/1981 (la API rechaza fechas anteriores) | 11/11/2026 | Diario | ✅ Verificado |
| MODIS NDVI (`MOD13Q1`) | 18/02/2000 | 16/10/2026 | Compuesto de 16 días | ✅ |
| SoilGrids | — | — | Estático (predicción) | — |

**Qué período usa TARPU:** POWER de 2015-01-01 a 2025-12-31 (variable `TARPU_POWER_INICIO` y `TARPU_POWER_FIN`). Se muestra siempre el período pedido y obtenido. En el ejemplo de Chivay: 4018 días, 0 faltantes.

### 6.4 Lo que **no** es posible, a ninguna escala

- Saber la temperatura sobre una planta concreta: POWER describe una celda de ≈ 55 × 67 km.
- La lluvia exacta de la parcela: la lluvia de POWER es regional.
- El verdor del interior de una parcela pequeña: el píxel de MODIS mide 250 m.
- Ver a través de las nubes: sin observación válida, no hay dato de verdor ese día.
- Deducir la fertilidad a partir del NDVI.
- Sustituir un análisis de suelo con SoilGrids: es una predicción.
- Pronosticar la próxima campaña a partir de un histórico.
- Calcular una dosis de riego a partir de un dato aislado.

## 7. Qué se puede hacer en la web publicada

> **Reemplazado por DT-22.** La web llama a la API interna y permite dibujar parcelas nuevas; los lugares de ejemplo quedan además en JSON estático como respaldo. La tabla siguiente describe el plan anterior y se conserva como antecedente.

La web publicada es un sitio de **JSON estático** (DT-13): no tiene servidor.

| | Web publicada (Vercel o Netlify) | Modo en vivo (FastAPI) |
|---|---|---|
| Ver parcelas registradas y procesadas | ✅ con sus datos reales | ✅ |
| Dibujar y procesar una parcela nueva | ❌ no hay servidor | ✅ (POWER tardó 4,1 s en la prueba real) |
| Preguntar con texto libre al agente | ❌ (solo las preguntas sugeridas) | ✅ |

**A decidir en la reunión:**

- **Qué parcelas se publican:** campos reales dibujados sobre la imagen y procesados en vivo con datos reales. Su contexto lo declara un agricultor real (con su permiso) o el presentador, rotulado como «declarado por el usuario».
- **Si además se publica la API**, para que cualquiera pueda dibujar su parcela.

## 8. Módulos que salen de este plan

| Módulo | Bloque | Hace |
|---|---|---|
| `geometria.py` | Núcleo de datos | Valida el contorno; área y perímetro geodésicos; píxeles de MODIS; centroide y recuadro |
| `procesamiento.py` | API | Estado de cada fuente por parcela, con el motivo real |

Ya están construidos y descritos en [backend/MODULOS.md](../backend/MODULOS.md) y en los [diagramas del backend](../backend/diagramas/).

## 9. Qué necesita cada área de este plan

| Área | Qué hacer |
|---|---|
| **Frontend (Shantall)** | Diseñar los 9 pasos para personas mayores; elegir el complemento de dibujo y revisar su licencia; mostrar en cada dato su escala, su fuente y si fue «declarado por ti» |
| **Datos (Damaris)** | Conectores de NDVI de MODIS (ORNL) y de SoilGrids con el mismo formato que POWER; conseguir el límite oficial de Arequipa |
| **Backend (Erick)** | Construido. Falta incorporar MODIS y SoilGrids a `indicadores` cuando lleguen sus conectores |
| **Derecho** | Licencias del complemento de dibujo, de los datos de ORNL, SoilGrids y EcoCrop; definición oficial de helada (SENAMHI) para poder citarla |

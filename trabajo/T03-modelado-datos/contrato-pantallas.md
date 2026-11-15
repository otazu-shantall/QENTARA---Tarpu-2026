# T03 · 4. Contrato de datos por pantalla

> **Área:** datos (Damaris). **Tarea:** [README.md](README.md), §3.4 («Forma de la respuesta por pantalla»). **Estado:** borrador, reescrito el 15/11/2026 sobre el frontend nuevo (commit `d78a70b`). Para revisar con Erick.
> Escrito con asistencia de IA (Claude Code); declarado en [entrega/uso-de-ia.md](../../entrega/uso-de-ia.md).
>
> **Qué es:** para cada vista del frontend real, qué muestra, qué entidad del [modelo lógico](modelo-logico.md) o qué indicador de [agregaciones.md](agregaciones.md) alimenta cada elemento, qué campos del [diccionario](diccionario-variables.md) usa, de qué campo de la API sale y qué se muestra cuando falta. Es diseño: no cambia `backend/`, `supabase/` ni `Codigo/`.

## 1. Fuentes y cuál prevalece

| Fuente | Qué aporta | Prevalencia |
|---|---|---|
| **Frontend nuevo:** `Codigo/src/nuevo/` (commit `d78a70b`; `docs/informes/07-frontend-nuevo.md` y `08-frontend-conectado-api.md`; DT-24) | **Las vistas que existen:** portada, Mi campo, Cultivos, Mis datos y Agente TARPU | **Es la fuente de este contrato.** Su diseño sigue pendiente de aprobación (informe 07, «Resultado») |
| **Backend:** `backend/tarpu_api/` (`main.py`, `base.py`) y `backend/tarpu_datos/` (`base/leer.py`, `coordenada/trabajos.py`, `celdas.py`) | **La forma de las respuestas**, leída en el código | La forma sale del código. Los valores reales solo están en las pruebas (`backend/tests/test_tarpu_datos.py`) y en el informe 08. Sigo sin una salida real propia (V-03) |
| **`docs/10-recorrido-y-escala.md`, §2** | Los 9 pasos del recorrido planeado | Solo para marcar qué pasos **no tienen vista** (§8). Donde choca con docs/11 (DT-22), manda docs/11 |
| **Plan maestro:** `Documentación/TARPU_Documentacion_Maestra.md` v0.4 (prevalece el `.md`) | Requisitos RF y HU | Se citan solo donde una vista los cumple o no |

`backend/prueba_web/` deja de ser fuente: «lo que hacía ahora vive en el frontend» (informe 08, encabezado).

## 2. Reglas comunes

### 2.1 Marcas
- **[en el frontend]:** leído en el código de `Codigo/src/nuevo/`; se cita archivo y línea.
- **[por confirmar con Erick]:** propuesta de este documento o desajuste entre frontend y backend.
- **[V-03]:** forma leída en el código del backend, sin una respuesta real propia.

### 2.2 El sobre
Toda respuesta llega en `{data, procedencia, avisos, modo, generado}` (`backend/contrato/esquemas/Sobre.json`). El cliente lee la respuesta con `request()` (`Codigo/src/nuevo/api.ts`, línea 23), y la dirección de la API va en `VITE_TARPU_API` (informe 08, «Archivos»).

### 2.3 Qué se muestra cuando falta un dato
- **Hoy, en el frontend:**
  - un número `null` se muestra como **«Sin dato»** (`data.ts`, `number`, líneas 22-28);
  - un sector ausente, como «—» (`FieldEvidence.tsx:185`);
  - la lluvia incompleta, como «N días sin dato» (`FieldEvidence.tsx:278`);
  - el estado de cada fuente, con su texto (`STATES`, `FieldEvidence.tsx:24-35`) y su `motivo` cuando no está lista (`:357`).
- **Nunca se muestra 0.**
- **Lo que falta [por confirmar con Erick]:** el **motivo por fecha** (modelo lógico §4.1). El frontend no lee `vacios_del_proveedor` ni `fallos_de_descarga`, y la API no da un motivo por fecha (P-04 del modelo lógico).
- **Textos propuestos por motivo** [por confirmar con Erick]:

  | Motivo (§4.1) | Texto propuesto |
  |---|---|
  | `relleno_del_proveedor` | «La fuente no tiene dato para esta fecha.» |
  | `fuera_de_rango_valido` | «La fuente entregó un valor fuera de su rango válido; no se muestra.» |
  | `calidad_no_valida` | «La fuente marcó este dato como de calidad no recomendada.» |
  | `sin_verificar` | «Hay un valor, pero TARPU aún no ha verificado cómo leerlo.» (no es un vacío) |
  | `fecha_ausente` | «Esta fecha no está en la respuesta de la fuente; no sabemos por qué.» |
  | `nodata_del_raster` | «El mapa de la fuente no tiene dato en este lugar.» |
  | `fuera_de_cobertura` | «Tu campo queda fuera de la zona que cubre TARPU.» |
  | `fallo_de_descarga` | «No se pudo descargar; se puede reintentar.» |
  | `no_disponible` | «Esta fuente todavía no está conectada.» |

### 2.4 Dos orígenes de datos en la misma pantalla
- **Lugar de referencia** (Majes riego o Chivay): sale de `Codigo/src/nuevo/reference-data.json` (`data.ts:2-4`). Lo prepara `Codigo/scripts/prepare-reference-data.py` desde `datos/muestras/`: POWER 2025, NDVI, SoilGrids y cultivos (informe 07, «Procedencia»).
- **Campo dibujado:** sale de la API en vivo (`useFieldData`, `fieldData.ts:105`).
- **Consecuencias** [por confirmar con Erick]:
  - **S2 (Cabanaconde) no está entre los lugares de referencia:** `places` tiene solo `majes_riego` y `chivay`;
  - **los lugares de referencia no usan el esquema mixto:** no tienen capa 1 de toda la parcela, ni trabajos, ni reutilización.

## 3. Formas de las dos rutas del esquema mixto

### 3.1 `POST /api/base/parcela`
- **Entrada:** `{contorno: GeoJSON Polygon}` (`api.ts:132`).
- **Salida `data`:** `base.en_parcela`, que es `leer_parcela(contorno)` más `geometria` (`backend/tarpu_api/base.py`, líneas 41-43; `backend/tarpu_datos/base/leer.py`, `leer_parcela`). [V-03]

| Clave | Contenido (según el código) | Entidad | Regla E09 | Valor real (pruebas o informe 08) |
|---|---|---|---|---|
| `estado`, `motivo` | `listo` o `sin_dato`, con el motivo (ej. fuera de la caja de Arequipa) | — | — | `leer.leer(0, 0)` da `sin_dato` (prueba `test_base_de_arequipa_en_majes`) |
| `centroide` | `{lat, lon}` | E01, E03 | — | — |
| `geometria` | `area_ha`, `perimetro_m`, `pixeles_modis_250m`, `metodo` (`geometria.medir`) | E01 | — | — |
| `relieve` | `estado`, `pixeles`, `altitud_m{min, media, max}`, `pendiente_pct{min, mediana, max}`, `clases_pendiente_pixeles`, `procedencia` | I13 · E10 | `centro_dentro` | Parcela de Majes: 49 píxeles, pendiente mediana 2,4 % (`test_base_en_una_parcela_de_majes`) |
| `relieve_centroide` | Relieve en el centroide (`leer.nasadem`) | E10 | — | Majes: 1391 m (`test_base_de_arequipa_en_majes`) |
| `sector` | `estado`, `sector`, `nombre`, `pisos_inei`, `cultivos_principales`, `cultivos_ver_mas`, `procedencia` | E18 | altitud media | S1 en Majes (prueba) |
| `suelo` | `estado`, `pixeles`, `capas{<prop>_<prof>_mean: {propiedad, profundidad, unidad, valores_por_pixel, crudos, media}}`, `procedencia` | I12 · E10 | `toca` | 2 píxeles; `9.8` en `clay_0-5cm_mean.valores_por_pixel` (prueba) |
| `aptitud` | `estado`, `capas[]`, `procedencia` | I18 · E10 | `contiene_centroide` | — |
| `clima` | `estado`, `celda`, `centro`, `elevacion_celda_m`, `desde`, `hasta`, `dias_faltantes_por_variable`, `archivos{original, normalizado, procedencia}`, `procedencia` | E08 y E14 (POWER) | `contiene_centroide` | Majes: 1940,88 m (prueba) |
| `avisos` | Diferencia de altitud entre la celda de POWER y NASADEM; rango de altitud de la parcela | E14 | — | — |
| `cobertura` | La regla de cada fuente, en texto | E09 | las cuatro | — |

- **Ojo:** el sobre repite `avisos` más el `motivo` (`main.py`, `post_base_parcela`).
- **El tipo del frontend** (`BaseParcel`, `api.ts:74-131`) declara todas estas claves salvo `relieve_centroide`.

### 3.2 `GET /api/trabajos/{clave}`
- **Salida `data`:** el trabajo (`backend/tarpu_datos/coordenada/trabajos.py`, `crear`, `ejecutar`, `_power_de_la_base` y `_modis`). [V-03]

| Clave | Contenido (según el código) | Entidad |
|---|---|---|
| `clave`, `nombre`, `punto{lat, lon}`, `parcela{contorno, area_ha, perimetro_m}` | Punto con 4 decimales | E03, E15 |
| `estado` | `pendiente`, `en_proceso`, `listo`, `listo_con_vacios`, `parcial`, `sin_datos`, `error`, `cancelado`, `interrumpido` | E15 |
| `fuentes.power` | `estado`, `archivos`, `vacios_del_proveedor`, `fallos_de_descarga`, `motivo`, `hasta`, más **`reutilizado{de: 'base de Arequipa', celda, hasta, elevacion_celda_m}`** | E15, E08 |
| `fuentes.modis.productos.<MOD13Q1 \| MOD16A2GF \| MOD11A2 \| MCD12Q1>` | Lo mismo, y si el píxel ya tenía serie, **`reutilizado{de: 'otra parcela en el mismo píxel', celda, hasta, actualizado}`** | E15, E08 |
| `fuentes.hls`, `fuentes.smap` | `estado: no_disponible` y `motivo` (`PENDIENTES`) | E15 |
| `aviso` | `estado` (`pendiente` o `por_enviar`), `canal` (null), `nota`, `listo_desde` | E16 |
| `creado`, `iniciado`, `terminado`, `actualizado`, `cancelacion` | Fechas ISO | E15 |

- **Prueba:** POWER sale de la celda `POWER:-15.500,-71.875`, con `elevacion_celda_m` 4351.89 (`test_power_se_lee_de_la_celda_de_la_base`).
- **Desajuste** [por confirmar con Erick]: el frontend declara `reutilizado_de?: string` en `ProductResult` (`api.ts`), pero el backend escribe el objeto `reutilizado{…}`. El frontend rotula `reutilizado` como un estado («Reutilizado de un campo vecino», `FieldEvidence.tsx:33`), y en el backend no es un estado (modelo lógico §4).

## 4. Portada
**Código:** `Codigo/src/nuevo/Landing.tsx` (informe 07; DT-24).

| Elemento | Datos | Si falta |
|---|---|---|
| Fotografía de trigo y cielo, con atribución | `Codigo/public/images/README.md` (Arnaud Weyts, Unsplash; licencia verificada el 15/11/2026 según el informe 07) | — |
| Navegación a las cuatro vistas | `navigation` (`App.tsx:49-52`) | — |

No usa la API. Equivale al paso 0 de docs/10 («Inicio»), sin `GET /api/meta`.

## 5. Mi campo
**Código:** `FieldDashboard.tsx`, `FieldMap.tsx`, `FieldEvidence.tsx`, `fieldData.ts`. **Requisitos:** plan maestro RF-01, RF-03, RF-04, RF-10 y HU-01, HU-02, HU-03. Cubre los pasos 1, 2, 4 y parte del 5 de docs/10.

### 5.1 Mapa y dibujo

| Elemento | Datos | Entidad | Si falta |
|---|---|---|---|
| Imagen Esri Clarity (zoom 21) y OpenStreetMap | Teselas | — | Sin capa de zonas, el mapa sigue (informe 08, «Mapa») |
| Zonas S1, S2 y S3, con leyenda | `GET /api/base/sectores`: `limites_mapa`, `sectores.<S>.altitud_m`, `color_rgba`, `fuera`, `metodo`, `aviso` (`SectorMap`, `api.ts`) y `.png` | E18 | Ídem |
| Dibujo por esquinas, con deshacer, cancelar, comprobar cruces y guardar; o coordenadas por texto (`CoordinateDialog`, `App.tsx:1063`) | Contorno GeoJSON `[lon, lat]` (`polygon`, `api.ts:45`) | E01 | — |
| Campos guardados | `localStorage` `tarpu.fields.v2` (`App.tsx`) | E01 (solo en el navegador) | Si el navegador no guarda: aviso para descargar el contorno |
| Lugares de referencia | `reference-data.json` (§2.4) | E03 | — |

### 5.2 Tarjetas de la capa 1 (campo dibujado)
Todas desde `POST /api/base/parcela` (§3.1).

| Tarjeta | Campos que lee el frontend | Indicador | Diccionario | Si falta, hoy |
|---|---|---|---|---|
| Superficie | `geometria.area_ha` (`FieldEvidence.tsx:132`) | E01 | — | «Sin dato» |
| Altitud | `relieve.altitud_m`, `relieve.pixeles` (`:153-157`) | I13 | §5 `NASADEM_HGT` | «Sin dato» |
| Pendiente | `relieve.pendiente_pct` (`:166`) | I13 | §5, Pendiente | «Sin dato». I14 (LS) no se muestra |
| Sector y cultivos de la zona | `sector.sector`, `nombre`, `motivo`, `cultivos_principales` (`:185-211`), «como descripción de la zona, no como recomendación» (informe 08, §1) | E18, E19 | §9 | Sector «—» y su `motivo` |
| Suelo, 0–5 cm | `suelo.capas['<prop>_0-5cm_mean'].media` para `phh2o`, `sand`, `silt` y `clay` (`:87-88`, `:296-306`); `suelo.pixeles` (`:310`) | I12 | §6 | «Sin dato». No muestra otras profundidades ni Q0,05–Q0,95, que agregaciones I12 propone por píxel [por confirmar con Erick] |
| Clima del último año completo, por mes | Normalizado de POWER de `clima.archivos` → `climateYear` (`fieldData.ts:58-98`) | **I19 (candidato)** | §1 `T2M`, `PRECTOTCORR` | Mes con un día sin lluvia: sin total y «N días sin dato». Ver agregaciones §3.1 |
| Avisos | Sobre `avisos` | E14 | — | — |

### 5.3 Tarjeta de la capa 2 (trabajo)
Desde `POST /api/trabajos`, consultando `GET /api/trabajos/{clave}` cada 3 s, más `POST /api/trabajos/cancelar` y `GET /api/trabajos/punto` (`fieldData.ts`; informe 08, §2).

| Elemento | Campos | Entidad | Si falta, hoy |
|---|---|---|---|
| Estado general | `estado`, con `STATES` (`FieldEvidence.tsx:345`) | E15 | — |
| Estado por fuente | `fuentes.<f>.estado` y `motivo` (`:347-357`), con `SOURCES` (`:36-41`) | E15 | `no_disponible`: «No disponible todavía» (HLS y SMAP) |
| Reutilización | Texto «Si un campo vecino ya la tiene, se reutiliza» (`:327`) | E08, E09 | Desajuste de §3.2 [por confirmar con Erick] |
| Detener y volver a intentar | `POST /api/trabajos/cancelar` | E15 | — |

### 5.4 Tarjetas de la capa 2 (cuando MODIS termina)

| Tarjeta | Datos | Indicador | Diccionario | Si falta, hoy |
|---|---|---|---|---|
| Verdor (NDVI), últimas 23 composiciones | Normalizado de MOD13Q1 (`modisFile`, `fieldData.ts:99`; lectura en `:185-210`), con `reliability` | I07 | §2 `250m_16_days_NDVI`, `pixel_reliability` | **Fiabilidad 2 y 3 se dejan como vacío** (`FieldEvidence.tsx:91-94`). Choque con la propuesta de agregaciones I07 (marcar sin cortar); **lo decide Erick** (V-A03) |
| Última observación válida | La última fecha con valor no nulo (`:95-97`, `:393-395`) | I07 | Ídem | — |
| Cobertura | Última clase `LC_Type1` de MCD12Q1, con etiquetas IGBP en español (`:42-62`, «MODIS Land Cover Type User Guide, C6.1, cuadro 3») | I11 | §2 `LC_Type1` | Relleno 255 sin etiqueta: por verificar cómo se muestra [por confirmar con Erick] |
| ET y PET, temperatura de superficie | **No se muestran** | I09, I10 | §2 | — |
| HLS, SMAP | **No se muestran** (`no_disponible` en el trabajo) | I08, I16, I17 | §3, §4 | Los datos de AppEEARS (`trabajo/extraccion_pesada/salida/`) no llegan al frontend |

### 5.5 Lugar de referencia (Majes riego o Chivay)
Tarjetas `SourceCards` (`App.tsx:108`) desde `reference-data.json`: `relief` (`altitud_m`, `pendiente_pct`, `clase`), `climate` (filas diarias de 2025), `soil`, `vegetation` y `sources` (`request_url` de cada fuente). Los datos son los de `datos/muestras/`, no los de T01 ni de la base de Arequipa [por confirmar con Erick].

## 6. Cultivos
**Código:** `CropView` (`App.tsx:403`). **Datos:** `place.crops` de `reference-data.json`, del IV CENAGRO 2012 (DT-20), con búsqueda y comparación de hasta 3 fichas (informe 07).

| Elemento | Datos | Entidad | Si falta |
|---|---|---|---|
| Cultivos del sector | `place.crops[].clave` y su nombre (`cropName`, `data.ts:36`) | E18, E19 | — |
| Ficha conjunta | Información del censo y «el estado pendiente de la evaluación» (informe 07, «Integraciones pendientes») | E19 | Sin motor: no se muestra ninguna evaluación |

- **Lo que no hay:** comparación con EcoCrop. `GET /api/parcelas/{id}/rotaciones` (E22 y E23) no tiene vista (informe 08, «Lo que falta»). El paso 6 de docs/10 y el desafío (docs/08: al menos tres estrategias, incluida la actual) **no están cubiertos** [por confirmar con Erick].
- **Para un campo dibujado:** usa `place`, el lugar de referencia activo, no el sector del campo (`CropView({place, field})`). Hay que confirmar si toma los cultivos de `/api/base/parcela` [por confirmar con Erick].

## 7. Mis datos
**Código:** `DataView` (`App.tsx:162`); para un campo dibujado, `FieldFiles.tsx` (`App.tsx:239`). **Requisitos:** plan maestro RF-08, RF-12 y HU-09.

| Elemento | Datos | Entidad | Si falta |
|---|---|---|---|
| Registros del lugar de referencia: clima, vegetación y suelo, con filtros por texto y fecha, CSV, JSON e impresión | `place.climate`, `place.vegetation` (con `quality`), `place.soil` (con P5–P95) (`App.tsx:178-202`) | E11, E13 | «Sin dato» (`number`) |
| Archivos de un campo dibujado: original, normalizado, detalle y procedencia de POWER y de cada producto de MODIS, con Ver y Descargar | `GET /api/archivo?ruta=` → `RawFile` (`api.ts:217`; `FieldFiles.tsx:64-80`) | E13, E14 | Archivo grande: «Se descargó la primera parte del archivo (es muy grande para la API)» (`FieldFiles.tsx:79`) |
| Campos del servidor | `GET /api/trabajos` (`FieldFiles.tsx:8`) | E15 | — |
| Contorno y respuesta completa de la base | Descarga (informe 08, §4) | E01 | — |

- **Niveles:** el frontend muestra los archivos por tipo (`KINDS`), no los separa en original, normalizado y derivado como pide el plan maestro, «Acceso a datos detallados y exportación».
- **`GET /api/parcelas/{id}/datos`** no tiene vista [por confirmar con Erick].

## 8. Agente TARPU
**Código:** `Chat.tsx`, en vista completa y en un panel modal (`App.tsx`). **Datos:** respuestas guardadas de `answer()` (`data.ts:124-187`), **no** `POST /api/agente` (informe 08, «Lo que falta»).

| Pregunta reconocida | Fuente que cita la respuesta | Si falta |
|---|---|---|
| Pronóstico | — (comunica el límite) | — |
| NDVI o verdor | «MOD13Q1 v061 · ORNL DAAC · 250 m / 16 días» | — |
| Suelo o pH | «ISRIC SoilGrids 2.0 · 250 m · profundidad 0–5 cm» | — |
| Lluvia, clima o frío | `place.sources.climate.request_url` | — |
| Cultivo o rotación | «INEI · IV CENAGRO 2012 · DT-20» | — |
| Descargas | Remite a «Mis datos» | — |
| Campo dibujado | «Sus datos ambientales están pendientes de conectar» | Lo dice explícitamente |

- **Choque:** para un campo dibujado, el agente dice que sus datos «están pendientes de conectar», aunque la vista Mi campo ya los muestra desde la API [por confirmar con Erick].

## 9. Pasos de docs/10 sin vista

| Paso de docs/10 §2 | Vista del frontend nuevo | Qué falta |
|---|---|---|
| 0 · Inicio | Portada (§4) | No usa `GET /api/meta` |
| 1 · Ubicar mi campo | Mi campo (§5.1) | **Búsqueda de distrito y GPS no existen.** Los únicos buscadores son de registros (`App.tsx:297`) y de cultivos (`:443`); no hay `geolocation` en `Codigo/src/nuevo/`. Hay coordenadas por texto |
| 2 · Dibujar mi parcela | Mi campo (§5.1) | — |
| **3 · Contar mi campo** | **Sin vista con la API**; solo el formulario de guardado | `PUT /api/parcelas/{id}/contexto` (E02) no se usa. El formulario declara `name`, `crop` y `water` (`Field`, `data.ts:7-14`), y `water` se elige entre «Sin declarar», «Riego», «Lluvia» y «Riego y lluvia» (`App.tsx`, formulario de «Ahora, pongámosle nombre»). **No coincide con `ContextoEntrada.json`**: allí `agua` es `secano`, `riego` o `null`, y hay además `cultivo_anterior`, `meses_campana` y `prioridades`. Se guarda solo en el navegador [por confirmar con Erick] |
| 4 · Preparando tus datos | Mi campo (§5.2 y §5.3) | Aviso al terminar (E16): canal sin decidir |
| 5 · Cómo está mi campo | Mi campo, en parte (§5.2 y §5.4) | Indicadores de 2015–2025 (I01–I06, `GET /api/parcelas/{id}/indicadores`), I09, I10, I15, I16, I17 e I18 |
| **6 · ¿Qué siembro después?** | **Sin vista** | `GET /api/parcelas/{id}/rotaciones` (E22, E23) |
| 7 · Pregunta a TARPU | Agente (§8), con respuestas guardadas | `POST /api/agente` |
| 8 · Ver y descargar | Mis datos (§7), en parte | `GET /api/parcelas/{id}/datos`, con su nivel |

## 10. Propuestas (por confirmar con Erick)

| Id | Propuesta | Por qué |
|---|---|---|
| P-C01 | Que `pixeles_modis_250m` use el píxel real de cada producto (231,66 m en MOD13Q1) o diga que es el nominal | `geometria.py` divide por 6,25 ha; el diccionario §2 registra 231,66 m |
| P-C02 | Unir el camino antiguo (`/api/parcelas/{id}/…`: indicadores, rotaciones, agente, datos) con el del esquema mixto, para que los pasos 3, 5, 6, 7 y 8 tengan datos de la parcela dibujada | Hoy esas rutas no tienen vista en el frontend nuevo (§9) |
| P-C03 | No mostrar «0» de GAEZ en Chivay ni en S2 mientras V-04 siga abierta | Agregaciones I18 |
| P-C04 | Registrar en docs/06 que la vista de cultivos no usa pesos, aunque el plan maestro (RF-07, HU-05) los propone | DT-16 y `motor/__init__.py` (`NOTA`) |
| P-C05 | Alinear el tipo del frontend (`reutilizado_de: string`) con el objeto `reutilizado{de, celda, hasta…}` del backend, y no rotularlo como estado | §3.2 |
| P-C06 | Que el frontend lea `vacios_del_proveedor` y, cuando exista, el motivo por fecha (P-04 del modelo lógico) | §2.3 |
| P-C07 | Que el agente use los datos del campo dibujado, o que no diga que están «pendientes de conectar» | §8 |
| P-C08 | Añadir S2 (Cabanaconde) a los lugares de referencia, o decir por qué no está | §2.4 |
| P-C09 | Alinear lo que declara el formulario (`crop`, `water` con «Lluvia» y «Riego y lluvia») con `ContextoEntrada.json` (`cultivo_actual`, `cultivo_anterior`, `agua: secano \| riego \| null`, `meses_campana`, `prioridades`) y enviarlo con `PUT …/contexto` | §9, paso 3. Hoy el motor no recibe lo declarado |

## 11. Pendientes de verificar

| Id | Qué falta | Con quién o cómo |
|---|---|---|
| V-03 | Una salida real de `/api/base/parcela` y `/api/trabajos/{clave}` (las formas de §3 salen del código y de las pruebas) | Erick, o la base de Arequipa |
| V-C01 | Forma real de `/rotaciones`, `/agente`, `/datos` y `/meta` | Erick |
| V-C02 | Textos de «Sin dato» por motivo (§2.3) | Erick |
| V-C03 | ~~Si hay búsqueda de distrito o GPS, y qué declara el usuario~~ | **Resuelta:** no hay ni búsqueda de distrito ni GPS; se declaran `name`, `crop` y `water` (§9). Queda abierto alinear `water` con `ContextoEntrada.json` (P-C09) |
| V-C04 | Cómo muestra el frontend el relleno 255 de MCD12Q1 | `FieldEvidence.tsx` |
| V-A03 | Si el NDVI se corta (frontend) o solo se marca (agregaciones I07) | Erick |
| I19 | Si el clima del último año completo entra en el backend | Erick (agregaciones §3.1) |

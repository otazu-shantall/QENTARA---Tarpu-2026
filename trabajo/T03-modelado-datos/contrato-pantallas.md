# T03 · 4. Contrato de datos por pantalla

> **Área:** datos (Damaris). **Tarea:** [README.md](README.md), §3.4 («Forma de la respuesta por pantalla»). **Estado:** borrador para revisar con Shantall y Erick, 15/11/2026.
> Escrito con asistencia de IA (Claude Code); declarado en [entrega/uso-de-ia.md](../../entrega/uso-de-ia.md).
>
> **Qué es:** para cada pantalla, qué muestra, qué entidad del [modelo lógico](modelo-logico.md) o qué indicador de [agregaciones.md](agregaciones.md) alimenta cada elemento, qué campos del [diccionario](diccionario-variables.md) usa y qué se muestra cuando el dato falta. Es diseño: no cambia `backend/` ni `Codigo/`.

## 1. Fuentes y cuál prevalece

| Fuente | Qué aporta | Prevalencia |
|---|---|---|
| **Plan maestro:** `Documentación/TARPU_Documentacion_Maestra.md`, v0.4 | Requisitos RF-01 a RF-12 (§04, «PRD y alcance del MVP»), historias HU-01 a HU-09 (§04, «Historias y flujos de usuario»), rutas y estados de interfaz (§06, «Frontend, mapas y visualización») y datos detallados (§06, «Acceso a datos detallados y exportación») | Hay tres formatos (`.md`, `.tex`, `.pdf`). **Prevalece el `.md`**: su Guía de uso dice que «la fuente editable principal de esta edición es el Markdown». Manda sobre el producto (AGENTS.md raíz, §2), pero **no enumera pantallas**: sus rutas de interfaz son propuestas (SUP-013, SUP-021) |
| **`docs/10-recorrido-y-escala.md`** | **La única lista de pantallas:** el recorrido de 9 pasos (§2, del 0 al 8), lo que lleva cada dato (§5.2), gráficos y mapa (§5.3) y estados de fuente (§5.4) | Es la fuente de las pantallas de este contrato. Donde choca con `docs/11-esquema-mixto.md` (DT-22), **manda docs/11** (encabezado de docs/11). Afecta a la pantalla 4 |
| **`backend/prueba_web/index.html`** | **La única pantalla hecha** con datos del esquema mixto: mapa, dibujo por esquinas, datos base de la parcela, trabajos de la capa 2 y puntos extraídos | Es la pantalla de prueba del backend, **no el diseño final** (README de T03, §1.2). Sirve como evidencia de qué campos se leen hoy |

**No se usan como fuente de pantallas:**
- el prototipo de `Codigo/`: 7 vistas de panel (`DashboardPage` en `Codigo/src/types/index.ts`), con fixtures y como guía, no diseño final (DT-10);
- las rutas propuestas del plan maestro (`/parcelas`, `/parcelas/:id/evidencia`…).

Se citan solo donde coinciden con docs/10.

**No se inventan pantallas:** este contrato cubre las 9 de docs/10 §2 y ninguna más.

## 2. Reglas comunes

### 2.1 Marcas
- **[hecha]:** el elemento existe en `backend/prueba_web/index.html`; se cita la línea.
- **[por confirmar con Shantall]:** sale solo de una propuesta (docs/10 o plan maestro), no de una pantalla hecha.
- **[V-03]:** pendiente de verificar con una salida real de `/api/base/parcela` o `/api/trabajos/{clave}`. Los campos de esas rutas se leyeron en el código de la pantalla de prueba y en `leer.py`, no en una respuesta real, porque la base de Arequipa no está en esta computadora (modelo lógico V-03).

### 2.2 El sobre
Toda respuesta llega en `{data, procedencia, avisos, modo, generado}` ✔ (`backend/contrato/esquemas/Sobre.json`; `modo` = `en_vivo` o `publicado`). La pantalla de prueba lee `data` y `avisos` (`index.html:300`, `:323`).

### 2.3 Lo que lleva cada dato (docs/10 §5.2)
- frase;
- valor y unidad;
- escala;
- fuente y período;
- origen («dato de la fuente» o «declarado por ti»);
- faltantes;
- qué no significa;
- enlace a los datos.

En el modelo, la escala sale de E07 y E08, la fuente de E04 y E05, el período y los faltantes de E14 y E21, y el origen de E02.

### 2.4 Qué se muestra cuando falta un dato
**Nunca 0, nunca un color, nunca un valor de relleno** (docs/10 §5.3; plan maestro, HU-03: «Una escena vacía no se rellena con color verde ni se representa como NDVI cero»).

Se muestra **«Sin dato»** más el texto del motivo (modelo lógico §4.1). Los textos son propuestos [por confirmar con Shantall]:

| Motivo (§4.1) | Texto propuesto en pantalla |
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

En el motor, los estados de criterio `sin_dato` y `sin_regla` (E23) se muestran con su `nota` (`comparacion.py`).

## 3. Pantalla 0 · Inicio
**Plan:** docs/10 §2, fila 0. **Ruta:** `GET /api/meta`. Toda la pantalla [por confirmar con Shantall]: no existe en `prueba_web`.

| Elemento | Alimenta | Campos | Si falta |
|---|---|---|---|
| Qué hace TARPU y qué no | Texto fijo | — | — |
| Fuentes y período | E04 y E05 | `meta.py`: `fuentes`, `periodo_power.inicio` y `fin`, `catalogo` (según el código) | Fuente sin conector: `no_disponible` |
| Modo | Sobre | `modo` (`en_vivo` o `publicado`) | — |

## 4. Pantalla 1 · Ubicar mi campo
**Plan:** docs/10 §2, fila 1, y §3.1; plan maestro HU-01 y RF-01.

| Elemento | Alimenta | Campos | Si falta | Marca |
|---|---|---|---|---|
| Mapa satelital (Esri World Imagery, con «Clarity» como imagen principal) y capa de calles | — (teselas, sin datos de TARPU) | — | Sin imagen: lo resuelve el mapa, no el contrato | [hecha] `index.html:179-189` |
| Saltos a lugares de ejemplo (Majes, Chivay, Cabanaconde) | E03 (lugares de ejemplo) | Coordenadas de `trabajo/README.md`, «Los tres lugares» | — | [hecha] `index.html:133-135` |
| Mapa de sectores S1, S2 y S3 y caja de la base | E18 y E10 (capa derivada `sectores_0p01`) | `GET /api/base/sectores`: `limites_mapa`, `sectores.<S>.altitud_m`, `color_rgba`, `aviso` | Sobre 4800 m: «fuera de los sectores» (`index.html:207`) | [hecha] `index.html:194-210`; forma [V-03] |
| Buscar distrito | — | — | — | [por confirmar con Shantall] (docs/10 §2) |
| «Estoy en mi campo» (GPS), con la precisión del navegador tal cual | — (`coords.accuracy`, docs/10 §3.1) | — | GPS denegado: el usuario mueve el mapa | [por confirmar con Shantall] |

## 5. Pantalla 2 · Dibujar mi parcela
**Plan:** docs/10 §2, fila 2, y §3.2–3.3; plan maestro HU-01 y RF-01. **Ruta en docs/10:** `POST /api/parcelas`. **Ruta en `prueba_web`:** `POST /api/base/parcela` con `{contorno}` (`index.html:298`).

| Elemento | Alimenta | Campos | Si falta | Marca |
|---|---|---|---|---|
| Dibujo por esquinas: guardar punto, deshacer, cerrar y empezar de nuevo | E01 (contorno GeoJSON `[lon, lat]`) | `contornoGeoJSON()` (`index.html:275`) | Menos de 3 esquinas: no se puede cerrar (`index.html:255`) | [hecha] `index.html:236-275` |
| Área y perímetro | E01 | `data.geometria.area_ha`, `perimetro_m` | Contorno inválido: `400 contorno_invalido` con qué corregir (docs/10 §3.3) | [hecha] `index.html:319`; forma [V-03] |
| Centroide | E01 y E03 | `data.centroide.lat`, `lon` | — | [hecha] `index.html:317`; [V-03] |
| Píxeles de MODIS que caben | E01 y E09 | `data.geometria.pixeles_modis_250m` | — | [hecha] `index.html:329`; [V-03]. **Ojo:** el backend divide por 6,25 ha, el píxel nominal de 250 m (docs/10 §3.3; `geometria.py:60`), pero el píxel real de MOD13Q1 mide 231,66 m (diccionario §2). Pendiente P-C01 |
| Versión al redibujar | E01 | `PUT …/contorno` → `409 parcela_desactualizada` (docs/10 §3.3) | Resultados de una versión anterior: no se sirven | [por confirmar con Shantall]; no está en `prueba_web` |
| «Dibujar no acredita propiedad» | Texto fijo (docs/10 §3.3; plan maestro HU-01) | — | — | [por confirmar con Shantall] |

## 6. Pantalla 3 · Contar mi campo
**Plan:** docs/10 §2, fila 3; plan maestro RF-02 («admitir desconocido sin transformarlo en cero»). **Ruta:** `PUT /api/parcelas/{id}/contexto`, con el esquema `backend/contrato/esquemas/ContextoEntrada.json` ✔. Toda la pantalla [por confirmar con Shantall]: no está en `prueba_web`.

| Elemento | Alimenta | Campos (`ContextoEntrada.json`) | Si falta |
|---|---|---|---|
| Cultivo actual | E02 | `cultivo_actual` (texto o `null`) | `null` = «No sé». Nunca se rellena con un valor por defecto (`description` del esquema) |
| Cultivo anterior | E02 | `cultivo_anterior` | Ídem |
| Secano o riego | E02 | `agua`: `secano`, `riego` o `null` | Ídem |
| Meses en campo | E02 | `meses_campana`: lista de 1 a 12, o `null` | Ídem |
| Qué le importa | E02 | `prioridades`: orden de `temperatura`, `frio`, `lluvia`, `suelo`, `familia`, `altitud`. **«No son pesos»** (esquema) | Sin orden: se muestra el del motor |
| Origen | E02 | Siempre «declarado por ti» | — |

## 7. Pantalla 4 · Preparando tus datos
**Plan:** docs/10 §2, fila 4, **reemplazada por docs/11 §3** (DT-22): primero la capa 1 al instante, luego el trabajo de capa 2 y el aviso. Plan maestro RF-10 («identificador persistente, estado, progreso por etapa y recuperación tras recargar») y HU-07.

**Rutas:**
- docs/10: `POST …/procesar` y `GET …/procesamiento`;
- esquema mixto, en `prueba_web`: `POST /api/base/parcela` y `POST /api/trabajos`, `GET /api/trabajos/{clave}`, `GET /api/trabajos/punto` y `POST /api/trabajos/cancelar` (`index.html:298`, `:361`, `:388`, `:397`, `:405`).
- **Cuál de los dos caminos usa la pantalla final** lo decide Erick (README de T03, §1.3, «El hueco») (P-C02).

### 7.1 Lo de la base, al instante (capa 1)
Todo [hecha] en `index.html:314-350`; la forma, [V-03].

| Elemento | Alimenta | Campos de `data` | Diccionario | Si falta |
|---|---|---|---|---|
| Sector | E18 | `sector.sector`, `nombre`, `estado` | §9, Sector | `sin_dato` con `motivo` (ej. fuera de 0 a 4800 m) |
| Altitud media, mínima y máxima | I13 · E10 y E09 (`centro_dentro`) | `relieve.altitud_m.media`, `min`, `max` | §5, `NASADEM_HGT` | `relieve.estado` ≠ `listo`: «—» más `relieve.motivo` (`index.html:320`), ej. «la parcela es más pequeña que un píxel» |
| Pendiente mediana, rango y clases FAO | I13 | `relieve.pendiente_pct.mediana`, `min`, `max`; `clases_pendiente_pixeles` | §5, Pendiente | Ídem |
| «Qué datos cubren la parcela»: píxeles de NASADEM dentro, píxeles de SoilGrids que la tocan, celda de GAEZ, celda de POWER | E09 (reglas de cobertura) | `relieve.pixeles`, `suelo.pixeles`, `geometria.pixeles_modis_250m`; `cobertura` (`leer_parcela`) | §1, §5, §6 y §7 (escala) | — |
| Cultivos del sector | E18 y E19 | `sector.cultivos_principales`, `cultivos_ver_mas` | §9 | Lista vacía: no se muestra la tarjeta |
| Suelo por propiedad y profundidad | I12 · E10 y E09 (`toca`) | `suelo.capas.<prop>_<prof>_mean.media`, `valores_por_pixel`, `unidad` | §6 | Celda vacía: «—» (`index.html:309`) con `nodata_del_raster`. `uncertainty` no se muestra como valor convertido (`sin_verificar`) |
| Clima: celda, elevación, período y días sin dato | E08 y E14 (POWER) | `clima.celda`, `elevacion_celda_m`, `desde`, `hasta`, `dias_faltantes_por_variable`, `archivos` | §1 | `relleno_del_proveedor` por variable, con el número real (`index.html:345`) |
| Aptitud por cultivo y agua | I18 · E10 | `aptitud.capas[].cultivo`, `agua`, `indice` | §7 | Ver P-C03: `prueba_web` dice «Las 100 capas valen 0 aquí» (`index.html:349`), pero agregaciones I18 propone **no mostrar** Chivay ni S2 hasta resolver V-04 |
| Avisos (ej. la diferencia de altitud entre la celda de POWER y el punto) | E14 | sobre `avisos` | — | — |

### 7.2 Los datos pesados (capa 2)
Todo [hecha] en `index.html:352-430`; la forma, [V-03].

| Elemento | Alimenta | Campos del trabajo | Si falta |
|---|---|---|---|
| Estado general y clave | E15 | `clave`, `estado` (`pendiente`, `en_proceso`, `listo`, `listo_con_vacios`, `parcial`, `sin_datos`, `error`, `cancelado`) | — |
| Estado por fuente y producto | E15 | `fuentes.<f>.estado`, `motivo`, `productos.<p>.estado` | `no_disponible` con `motivo` (HLS y SMAP en `trabajos.py`) |
| Vacíos de la fuente y fallos de descarga | E11 y E15 | `vacios_del_proveedor[]`, `fallos_de_descarga[]` | «vacío en la fuente: …» y «N bloque(s) sin descargar» (`index.html:409-410`). Con P-04 del modelo lógico, cada uno llevaría su motivo del §4.1 |
| Leyenda de estados | — | Texto de `index.html:424`: «listo con vacíos», «parcial» y «no disponible» | — |
| Detener extracción | E15 | `POST /api/trabajos/cancelar` `{claves}` | Lo descargado queda guardado (`index.html:423`) |
| Aviso al terminar | E16 | `aviso.estado`, `aviso.nota` | Canal sin decidir (docs/11 §6): se muestra la nota tal cual |
| Archivos en crudo | E13 | `archivos` → `GET /api/archivo?ruta=` → `bytes`, `recortado`, `ruta`, `contenido` | — |

### 7.3 Puntos extraídos
[hecha] `index.html:433-459`; [V-03]. Es una lista de trabajos (E15) con `nombre`, `punto`, `parcela.area_ha`, `creado`, `terminado` y `estado`, más el contorno en el mapa. **No está en docs/10:** es una herramienta de la pantalla de prueba; si entra en el recorrido, lo decide Shantall.

## 8. Pantalla 5 · Cómo está mi campo
**Plan:** docs/10 §2, fila 5, §5.2 y §5.3; plan maestro RF-03, RF-04, RF-05, HU-02 y HU-03.

**Rutas:**
- `GET /api/parcelas/{id}/indicadores` y `…/clima`. Hoy solo leen POWER por el camino antiguo (README de T03, §1.3).
- **Forma real ✔** en `backend/contrato/ejemplos/indicadores_chivay.json`, calculada con POWER: `data.punto_consultado`, `periodo`, `clima_mensual[]`, `lluvia_anual_mm` y `resumen`.

Todo lo que no es POWER: [por confirmar con Shantall] y sin ruta todavía (P-C02). La pantalla no existe en `prueba_web`.

| Tarjeta | Indicador | Campos del diccionario | Campos de respuesta | Si falta | Gráfico (docs/10 §5.3) |
|---|---|---|---|---|---|
| Temperatura del aire | I01, I02 | §1 `T2M`, `T2M_MIN` | `clima_mensual[].temperatura_media_c`, `temperatura_minima_registrada_c` ✔ | Mes con días sin dato: fuera del cálculo y listado en `meses_con_dias_sin_dato` (I06) | — |
| Noches bajo 0 °C | I03 | §1 `T2M_MIN` | `clima_mensual[].noches_minima_bajo_0c_promedio` ✔ | Mes incompleto: hueco en la barra, no 0 | Barras por mes |
| Lluvia | I05 | §1 `PRECTOTCORR` | `clima_mensual[].lluvia_promedio_mm`, `lluvia_anual_mm` ✔ | Mes sin dato: **hueco**; año incompleto: sin total | Barras por mes |
| Aviso de escala del clima | I01–I06 | §1 (escala y celda) | Sobre `avisos` ✔ | — | — |
| Aviso de sesgo frío en S2 | I01–I06 (limitación) | §1 `cell_elevation_m`; §5 `NASADEM_HGT` | Por definir | — | — |
| Verdor de 250 m | I07 | §2 `250m_16_days_NDVI`, `pixel_reliability` | Por definir | `relleno_del_proveedor` y `fuera_de_rango_valido`: hueco. Códigos 2 y 3: punto con otro marcador y la etiqueta del proveedor; **lo decide Erick** (V-A03) | Línea por fecha |
| Verdor de 30 m | I08 | §3 `HLSL30_VI_020_NDVI`, `HLSS30_VI_020_NDVI` | Por definir | −19999: hueco (V-B01). Sin capa de calidad: aviso «no distingue nubes» (V-B02). Dos teselas: sin mezclar (V-B03) | Línea por fecha y tesela |
| Evapotranspiración | I09 | §2 `ET_500m`, `PET_500m` | Por definir | `relleno_del_proveedor` (32767); 32701–32766: `fuera_de_rango_valido` (V-A05) | Por compuesto de 8 días |
| Temperatura de superficie | I10 | §2 `LST_Day_1km`, `LST_Night_1km` | Por definir | Crudo 0: `relleno_del_proveedor`. 16/10/2022: `fecha_ausente` | Por compuesto de 8 días |
| Cobertura | I11 | §2 `LC_Type1` | Por definir | 255: `relleno_del_proveedor` | Clase por año |
| Suelo | I12 | §6 | Igual que la pantalla 4 (§7.1) | Igual | Tabla por profundidad |
| Pendiente | I13, I14 | §5 | Igual que la pantalla 4 | I14 fuera de 3–18 %: «fuera de validez»; sin λ: `sin_regla` | Mapa por píxel (el único dato que puede colorear el interior; docs/10 §5.3 y agregaciones §4.2) |
| Horas de luz | I15 | §8 `N` | Por definir | — | Mínimo y máximo por mes |
| Humedad del suelo | I16, I17 | §4 | Por definir | L3E sin calidad recomendada: `calidad_no_valida` (en S2, ninguna fecha con calidad recomendada). L4: unidad ❓ (V-B06) | Por día (L3E) o cada 3 h (L4) |
| Aptitud GAEZ | I18 | §7 | Igual que la pantalla 4 | Chivay y S2: no se muestra (V-04) | Tabla |

**Mapa de esta pantalla:** el contorno siempre y el centroide marcado. Nunca se colorea el campo con un dato de una fuente que no describe su interior; solo NASADEM de 30 m puede hacerlo (docs/10 §5.3).

## 9. Pantalla 6 · ¿Qué siembro después?
**Plan:** docs/10 §2, fila 6; plan maestro RF-06 y HU-04; desafío, docs/08: al menos tres estrategias, incluida la actual. **Ruta:** `GET /api/parcelas/{id}/rotaciones`. Su forma, según el código (`backend/tarpu_api/motor/__init__.py`, `comparar`), no está verificada con datos. Toda la pantalla [por confirmar con Shantall].

| Elemento | Alimenta | Campos (según el código) | Si falta |
|---|---|---|---|
| Lista de estrategias | E22 | `estrategias[].id`, `cultivo`, `tipo` (`repetir_actual`, `cambiar_de_familia`, `cultivo_del_catalogo`), `por_que_aparece`, `familia`, `nombre_cientifico`, `ciclo_dias` | Sin cultivo actual declarado: la lista del catálogo, con el vacío en `vacios_generales` (`estrategias.py`) |
| Criterio por criterio | E23 | `estrategias[].criterios[].criterio`, `titulo`, `estado`, `dato`, `regla`, `nota` | `sin_dato` (falta el dato real) y `sin_regla` (EcoCrop no trae el valor), con su `nota` |
| Frases | E23 | Las de `explicacion.frases` | — |
| Beneficios | E20 | `beneficios.estado` = `sin_beneficio_citado` | «Todavía no hay una fuente citada de beneficios» (`motor/__init__.py`) |
| Cita del cultivo | E20 | `cita` (FAO EcoCrop) | — |
| No incluidos y vacíos generales | E22 | `no_incluidos[]`, `vacios_generales[]`, `advertencias_catalogo` | — |
| Nota fija | — | `nota`: «Sin puntaje ni pesos…» | — |

**Choque con el plan maestro:** RF-07 y HU-05 proponen pesos que suman 100 (SUP-019). Pero las prioridades del contexto «no son pesos» (`ContextoEntrada.json`), y el motor no usa ni puntaje ni pesos (`motor/__init__.py`, `NOTA`; DT-16). **Manda lo más reciente: sin pesos.** La pantalla solo ordena los criterios (P-C04).

## 10. Pantalla 7 · Pregunta a TARPU
**Plan:** docs/10 §2, fila 7; plan maestro RF-11, HU-08 y §06 (agente); DT-14: agente guiado, sin modelo de IA. **Rutas:** `GET /api/parcelas/{id}/agente` y `POST /api/agente`. Su forma, según el código, no está verificada con datos. Toda la pantalla [por confirmar con Shantall].

| Elemento | Alimenta | Campos (según el código, `agente/plantillas.py`) | Si falta |
|---|---|---|---|
| Preguntas sugeridas | — | `EJEMPLOS` de `agente/intenciones.py`: frío, lluvia, por qué este cultivo, qué falta, NDVI, fuentes, descargar, pronóstico | — |
| Respuesta | E21, E22 y E23 (lo ya calculado) | `intencion`, `respuesta`, `datos_usados[]` | Pregunta no reconocida: `intencion` = `null` |
| Citas | E14 | `citas[]` (`fuente`, `url`) | — |
| Qué falta | E11 y E23 | `faltantes[]` | Siempre visible si no está vacío (HU-08) |
| Límite de pronóstico | — | Intención `pronostico` | El agente comunica la limitación (plan maestro §06) |

## 11. Pantalla 8 · Ver y descargar
**Plan:** docs/10 §2, fila 8; plan maestro RF-08, RF-12, HU-09 y §06, «Acceso a datos detallados y exportación». **No ejecuta el motor** (`datos_detallados.py`).

**Rutas:**
- **`GET /api/parcelas/{id}/datos`:** forma según el código, no verificada con datos.
- **`GET /api/archivo?ruta=`:** [hecha] en `index.html:374`, como visor de archivos en crudo; forma [V-03].

| Elemento | Alimenta | Campos | Si falta | Marca |
|---|---|---|---|---|
| Fuente y estado | E04 y E15 | `fuentes[].fuente`, `nombre`, `estado`, `motivo`, `resolucion` | `no_disponible` o `sin_datos` con `motivo` | [por confirmar con Shantall] |
| Original | E13 (`original`) | `fuentes[].original.contenido` («sin tocar») | — | Ídem |
| Normalizado | E13 (`normalizado`) y E11 | `fuentes[].normalizado.columnas[]` (`nombre`, `unidad`) y `filas[]` | «celda vacía (null) = sin dato, nunca 0» (`datos_detallados.py`), con el motivo del §4.1 | Ídem |
| Derivado | E21 | `derivado.metodo[]`, `serie_mensual`, `indicadores` | Sin indicadores: `derivado` = `null` | Ídem |
| Procedencia | E14 | `fuentes[].procedencia` | — | Ídem |
| Archivo en crudo | E13 | `bytes`, `recortado`, `ruta`, `contenido` | Archivo grande: `recortado` | [hecha] `index.html:374-375` |
| Descarga (CSV o JSON) y PDF | E13 y E14 | Por definir (plan maestro RF-08: «PDF como reporte, no sustituto de los registros») | La descarga conserva los faltantes y sus metadatos (HU-09) | [por confirmar con Shantall] |

**Cubre hoy solo POWER:** `datos_detallados.py` recorre las fuentes de `procesamiento`, el camino antiguo. Para los datos de MODIS, SoilGrids, GAEZ, NASADEM, HLS y SMAP no hay ruta (P-C02).

## 12. Propuestas para Erick (nada de esto está hecho)

| Id | Propuesta | Por qué |
|---|---|---|
| P-C01 | Que `pixeles_modis_250m` use el tamaño real del píxel de cada producto (231,66 m en MOD13Q1; `cellsize_m` de la procedencia) o diga en pantalla que es el píxel nominal | Hoy divide por 6,25 ha (`geometria.py:60`), y el diccionario §2 registra 231,66 m |
| P-C02 | Decidir qué camino alimenta las pantallas 4, 5 y 8: el antiguo (`/api/parcelas/{id}/…`) o el del esquema mixto (`/api/base/parcela` y `/api/trabajos`) | Las rutas de las pantallas 5 y 8 solo leen POWER (README de T03, §1.3) |
| P-C03 | Que la tarjeta de aptitud no diga «Las 100 capas valen 0 aquí» mientras V-04 esté abierta | Agregaciones I18: Chivay y S2 no se muestran hasta saber si 0 es aptitud nula o zona no evaluada |
| P-C04 | Registrar en docs/06 que la pantalla 6 no usa pesos, aunque RF-07 y HU-05 del plan maestro los proponen | Evitar que se reabra con el plan maestro |

## 13. Pendientes de verificar

| Id | Qué falta | Con quién o cómo |
|---|---|---|
| V-03 | Forma real de `/api/base/parcela` y `/api/trabajos/{clave}`: la pantalla 4 entera y el suelo, la pendiente y la aptitud de la pantalla 5 | Una salida real de Erick, o la base de Arequipa |
| V-C01 | Forma real de `/rotaciones`, `/agente`, `/datos` y `/meta`, solo leída en el código | Una salida real; hay ejemplo verificado solo de `/indicadores` |
| V-C02 | Las pantallas 0, 3, 5, 6, 7 y 8, y la búsqueda de distrito y el GPS de la 1 | Shantall: la tabla «Datos que necesita cada pantalla» de `docs/areas/propuesta-frontend.md` §6 sigue vacía |
| V-C03 | Los textos de «Sin dato» del §2.4 | Shantall |
| V-C04 | Si «Puntos extraídos» entra en el recorrido | Shantall |
| V-A03 | Si la línea del NDVI se corta o solo se marca | Erick |
| V-04, V-B01 a V-B06, V-A05 | Pendientes de los datos que usan las tarjetas de la pantalla 5 | Agregaciones §8 |

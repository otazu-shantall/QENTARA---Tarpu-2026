# Datos y fuentes

> Resumen del apartado 05 del [informe maestro](../plataforma/documentacion/informe-maestro/TARPU_Documentacion_Maestra.md#05-fundamento-científico-y-datos). **Fuentes de la demo, decididas (DT-17):** solo NASA POWER, el NDVI de MODIS y SoilGrids, consultadas en el centroide de la parcela. El conector de POWER funciona y el backend ya lo usa; los de MODIS y SoilGrids están pendientes en `datos/`. Para el producto, la selección sigue siendo una propuesta (SUP-016, SUP-038). Antes de implementar una fuente, se comprueba su documentación oficial: versión, acceso, unidad, resolución, latencia, calidad, condiciones y formato.

## Fuentes candidatas

> Actualizado el 14/11/2026 con el análisis verificado de [datos/analisis-recursos.md](../plataforma/datos/analisis-recursos.md). **La demo usa solo las filas 1, 2 y 3 (DT-17).** Las demás quedan como candidatas para después de la demo, si el equipo toma una decisión nueva.

| Prioridad | Fuente | Variable | Acceso | Límite que hay que respetar |
|---|---|---|---|---|
| 1 · clima · **demo** | **NASA POWER** (Daily Point, AG) ✅ conectado al backend | Temperatura media, mínima y máxima; lluvia; humedad; radiación | Sin cuenta | Celda regional; no confirma una helada en una planta |
| 2 · vegetación (zona) · **demo** | **MODIS `MOD13Q1` v061** (servicio de ORNL) | NDVI cada 16 días desde 2000 | Sin cuenta (inestable: 502 en varias pruebas) | Píxel nominal de 250 m: mezcla parcelas |
| 3 · suelo · **demo** | **ISRIC SoilGrids 2.0** | pH, textura y carbono por profundidad | Sin cuenta (API responde a 14/11/2026) | Predicción a 250 m; no sustituye un análisis de suelo |
| Fuera de la demo | **NASA GIBS** | Capas visuales de NDVI, SMAP, lluvia y relieve | Sin cuenta | Son imágenes; para calcular se usan los productos numéricos |
| Fuera de la demo | **HLS** (Landsat + Sentinel-2, 30 m) | Reflectancia para NDVI | Cuenta Earthdata | Nubes; píxeles mezclados en el borde |
| Fuera de la demo | **GPM IMERG V07** | Lluvia diaria | Cuenta Earthdata | 0,1°; la Final llega hasta el 30/09/2025, la Late hasta ayer |
| Fuera de la demo | **SMAP** L3 y L4 | Humedad del suelo | Cuenta Earthdata | 9 km; en la costa irrigada no describe una parcela |
| Fuera de la demo | **SRTM / NASADEM** | Elevación y pendiente | Cuenta Earthdata | Estático (2000) |
| Fuera de la demo | **ECOSTRESS** | Temperatura de superficie y evapotranspiración, 70 m | Cuenta Earthdata | Pasadas irregulares |
| Posterior | FAO GAEZ, ERA5, GLDAS, Sentinel-2 a 10 m, GRACE | Aptitud de cultivos, reanálisis, tendencias de agua | Varias | Ver el análisis |
| Propio | Formulario del productor | Historial de campañas, riego, cultivo anterior | — | «Desconocido» nunca se convierte en cero |
| Propio | Catálogo agronómico | Papa, quinua, haba y cebada como candidatos | — | Construcción manual versionada y revisada (SUP-002) |

Los recursos del desafío que solo cubren Estados Unidos (USDA, USGS, PRISM, OpenET…) no sirven para Arequipa. Ver la sección 5 del análisis.

POWER es un servicio de NASA; IMERG es un producto de NASA; Sentinel-2 es de Copernicus y SoilGrids de ISRIC. Integrarlos **no** convierte todas las variables en mediciones de NASA ni de campo.

## Niveles de un dato

En la consulta de datos detallados se distinguen siempre:

| Nivel | Qué es |
|---|---|
| **Original del proveedor** | Contenido sin alterar, cuando su disponibilidad y condiciones lo permiten |
| **Normalizado** | Registros con cambios identificados de estructura, unidades o fechas |
| **Derivado** | Índices, recortes y agregaciones, con su método documentado |

«Más en crudo» significa más detalle y sin la evaluación de TARPU. No garantiza que el proveedor no haya modelado la información. Un PDF resume una consulta; el CSV o el JSON conservan los registros reutilizables.

## Procedencia de cada valor

Cada valor debe poder responder:

- qué representa;
- cuándo se observó y cuándo se procesó;
- qué parte del territorio cubre;
- qué transformaciones sufrió.

**Campos propuestos (SUP-023):** `source_id`, `product_id`, `product_version`, `asset_id`, `observed_start`, `observed_end`, `processed_at`, `unit`, `spatial_support`, `quality_flags`, `coverage`, `method_version` e `input_hash`.

**Mínimos provisionales (SUP-017):**

- 90 % de intervalos válidos para un resumen temporal completo.
- 80 % de área válida y cinco píxeles equivalentes para una estadística de vegetación representativa.
- Al menos diez años comparables como referencia de trabajo para anomalías.

Son umbrales por probar, no garantías.

## Motor de reglas (propuesto)

1. Comprobar la evidencia.
2. Determinar la elegibilidad: apto para evaluar · requiere revisión · no elegible según una regla respaldada · no evaluable por falta de evidencia.
3. Calcular los criterios: agua, clima, suelo e historial y rotación.
4. Redactar una explicación estructurada.

> **La demo no usa nada de esta sección que no tenga cita (DT-16):** ni estos pesos, ni el puntaje, ni los mínimos de 90 % y 80 %. El motor de la demo compara cada criterio con rangos citados de FAO EcoCrop, sin puntaje ([backend/MODULOS.md](../plataforma/backend/MODULOS.md#4-motor-motor--inicio)). Lo que sigue resume la propuesta del informe maestro.

**Pesos experimentales del informe (SUP-019, sin fuente):** agua 0,30 · clima 0,25 · suelo 0,25 · historial 0,20.

- El puntaje es un orden relativo, **no una probabilidad**.
- Si falta un criterio con peso, el puntaje queda sin calcular (`null`); no se renormaliza en silencio.
- El ejemplo de 74,5 del informe es sintético y no corresponde a ningún cultivo.

## Datos del prototipo actual

| Qué | Origen |
|---|---|
| Mapa base e imágenes satelitales | **Real**: Esri World Imagery y OpenStreetMap, cargados en vivo con créditos |
| Parcelas La Joya, El Pedregal y Santa Isabel | **Sintéticas** (`Codigo/src/data/demo.ts`) |
| Indicadores, series y 90 días de registros | **Sintéticos**; los nombres POWER, IMERG y Sentinel-2 son solo referencias |
| Zonas La Joya, Majes y Camaná | Centros aproximados para navegar; **no** son coordenadas ni límites de parcelas |
| Respuestas del agente | Texto fijo local (`answerQuestion`) |

Las exportaciones CSV y JSON identifican los datos como `sintetico` / `synthetic-demo`.

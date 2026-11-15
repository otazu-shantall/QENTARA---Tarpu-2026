# Propuesta del área de datos

> Responsable: **Damaris**. Se llena en la fase 1 del [ROADMAP](../../ROADMAP.md) y se presenta en la reunión de unión. Base: [datos/analisis-recursos.md](../../datos/analisis-recursos.md).

## 1. Fuentes que propongo para la demo

| Fuente | Variable | Unidad | Resolución | Acceso (sin cuenta / Earthdata) | ¿Probada? | Para qué sirve en la rotación |
|---|---|---|---|---|---|---|
| NASA POWER | T2M, T2M_MIN, PRECTOTCORR… | °C, mm/día | Celda regional | Sin cuenta | ✅ | Heladas, estacionalidad |
| | | | | | | |
| | | | | | | |

## 2. Zona de la demo

- ¿Costa (Majes), sierra (Chivay) o las dos?
- ¿Por qué?

## 3. Lo que le entrego al backend

| Archivo o script | Qué contiene |
|---|---|
| `datos/power/consulta_power.py` | Clima diario de un punto: original, normalizado y procedencia |
| | |

## 4. Qué dicen y qué no dicen estos datos

| Dato | Permite decir | No permite decir |
|---|---|---|
| Temperatura mínima y heladas (POWER `T2M_MIN`) | Frecuencia y época de heladas de la **zona** en 2025 (Chivay: mínima de −5,8 °C, 157 días bajo 0 °C) | El clima de una parcela. En Chivay, la celda está a 4 352 m y el pueblo a unos 3 600 m: las heladas pueden estar exageradas en el valle. Hay que contrastarlo con SENAMHI o presentarlo como aproximación regional |
| Temperatura media y máxima (POWER `T2M`, `T2M_MAX`) | Estacionalidad térmica de la zona (media de 2025: Majes 18,4 °C · Chivay 6,2 °C) | Lo que pasará en la próxima campaña: un histórico no es un pronóstico |
| Lluvia (POWER `PRECTOTCORR`) | Lluvia acumulada regional de MERRA-2 corregida (2025: Majes 169,6 mm · Chivay 405,2 mm) | La lluvia en la parcela. No es IMERG. El valor de Majes, en una zona desértica, está **por contrastar** |
| Humedad relativa y radiación (POWER `RH2M`, `ALLSKY_SFC_SW_DWN`) | Contexto regional de humedad y de radiación solar | Valores locales: la radiación viene de una celda de 1° × 1°, distinta de la de temperatura |
| pH, arcilla, arena y carbono orgánico (SoilGrids) | Una predicción del tipo de suelo de la zona, con su rango de incertidumbre (Majes riego, 0–5 cm: pH 8,1 · arcilla 9,8 % · arena 69,7 %) | Un análisis de suelo ni la fertilidad. La incertidumbre es muy amplia (arcilla de Majes riego, 0–5 cm: de 0,3 % a 55,4 %) y el riego cambia el suelo de cada parcela |
| NDVI (MOD13Q1) | Curva de verdor de la zona cada 16 días desde 2015: ciclo estacional en Chivay (máximo en marzo, mínimo en agosto) y verdor todo el año en Majes riego | Fertilidad, rendimiento ni qué cultivo hay. Un píxel de 231 m mezcla varias parcelas. La media de 2026 en Majes riego (0,571) es mayor que la de otros años y no tiene explicación |
| Calidad del píxel (MOD13Q1 `pixel_reliability`) | Qué fechas marca el producto como buenas, marginales, con nieve o con nubes (códigos de la guía de usuario) | Que haya habido nubes de verdad: en el punto urbano de Majes, el 73 % de las fechas salieron como «nubes» sin que el NDVI cambiara. **No contrastado** |

## 5. Necesito de otras áreas

-

## 6. Riesgos y dudas

-

## 7. Variables para el backend

Verificadas el 14/11/2026 en las fichas ([POWER](../../datos/power/README.md), [SoilGrids](../../datos/soilgrids/README.md), [NDVI](../../datos/ndvi/README.md)) y en las procedencias de `datos/muestras/`. Cada CSV normalizado lleva la unidad en la cabecera; un faltante queda vacío y nunca es cero.

| Variable | Nombre en el CSV | Unidad | Fuente | Resolución | Advertencia |
|---|---|---|---|---|---|
| Temperatura media a 2 m | `T2M (C)` | °C | NASA POWER (MERRA-2) | Celda de ½° × ⅝°, diaria | Celda regional, no la parcela |
| Temperatura máxima a 2 m | `T2M_MAX (C)` | °C | NASA POWER (MERRA-2) | Celda de ½° × ⅝°, diaria | Ídem |
| Temperatura mínima a 2 m | `T2M_MIN (C)` | °C | NASA POWER (MERRA-2) | Celda de ½° × ⅝°, diaria | En Chivay, la celda está a 4 352 m: heladas posiblemente exageradas |
| Precipitación corregida | `PRECTOTCORR (mm/day)` | mm/día | NASA POWER (MERRA-2 corregida) | Celda de ½° × ⅝°, diaria | No es IMERG; Majes por contrastar |
| Humedad relativa a 2 m | `RH2M (%)` | % | NASA POWER (MERRA-2) | Celda de ½° × ⅝°, diaria | Celda regional |
| Radiación solar en superficie | `ALLSKY_SFC_SW_DWN (MJ/m^2/day)` | MJ/m²/día | NASA POWER (CERES SYN1deg) | Celda de 1° × 1°, diaria | Celda distinta de la de temperatura |
| pH en agua | `phh2o` (filas por profundidad) | pH (sin unidad) | ISRIC SoilGrids 2.0 | 250 m, estático; 0–5 y 5–15 cm | Predicción; usar siempre con q05–q95 |
| Arcilla | `clay` | % | ISRIC SoilGrids 2.0 | Ídem | Incertidumbre muy amplia |
| Arena | `sand` | % | ISRIC SoilGrids 2.0 | Ídem | Predicción, no análisis |
| Carbono orgánico del suelo | `soc` | g/kg | ISRIC SoilGrids 2.0 | Ídem | Incertidumbre muy alta; no indica fertilidad |
| NDVI | `NDVI (sin unidad)` | Índice (−0,2 a 1) | MOD13Q1 v061 (ORNL) | Píxel de 231,656 m, cada 16 días | Verdor de la zona; no es fertilidad |
| Confiabilidad del píxel | `pixel_reliability (rank 0-3)` y `calidad` | Código 0–3 | MOD13Q1 v061 (ORNL) | Ídem | La marca «nubes» no está contrastada en estos puntos |

SoilGrids no es un dato de NASA: va en «otras referencias».

**Muestras disponibles** (`datos/muestras/`):

| Punto | POWER (2025) | SoilGrids | NDVI (2015–2026) |
|---|---|---|---|
| Majes riego (−16,367023; −72,185771) | `power_majes_riego_20250101_20251231.*` (comprobado el 14/11/2026: misma celda de radiación que el punto urbano, celda distinta de meteorología) | `soilgrids_majes_riego.*` | `mod13q1-ndvi_majes_riego_*` |
| Chivay (−15,64; −71,60) | `power_chivay_*` | `soilgrids_chivay.*` | `mod13q1-ndvi_chivay_*` |
| Majes urbano (−16,351; −72,190), solo referencia | `power_majes_*` | `soilgrids_majes.*` | `mod13q1-ndvi_majes_2015*` |

El punto de Majes se cambió al de riego porque el anterior caía en el casco urbano (NDVI con mediana de 0,117). El punto de Chivay todavía no está comprobado en vista satélite.

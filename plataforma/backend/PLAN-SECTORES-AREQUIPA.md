# Plan: Arequipa por sectores (versión 3)

> Área de **Erick**, 15/11/2026. Los sectores ya están decididos (**DT-18**); lo demás es **propuesta**. La explicación completa se dio en el chat.
>
> Datos de respaldo:
> - [investigacion/cultivos_arequipa_2026-11-14.json](investigacion/cultivos_arequipa_2026-11-14.json): 30 cultivos con EcoCrop, evaluación por sector, GAEZ y fotoperiodo.
> - [investigacion/arequipa_estadistica_cultivos.json](investigacion/arequipa_estadistica_cultivos.json): MIDAGRI 2017 y Censo Agropecuario 1994.

## 1. Prueba de Earthdata (AppEEARS, por punto; ejecutada por Erick)

| Fuente | Majes riego | Chivay | Tiempo | Veredicto |
|---|---|---|---|---|
| NASADEM | 1390 m (S1) | 3643 m (S3; la celda de POWER decía 4352 m) | 85 s | **Usar**: decide el sector |
| HLS NDVI 30 m (ene–mar 2024) | L30: 16/20 válidas, 0,20–0,62; S30: 26/36, 0,22–0,59 | L30: 12/22, 0,15–0,25; S30: 20/36, 0,13–0,29 | Con la tarea de series: 19,4 min | **Usar** para ejemplos y zonas piloto; en vivo, demasiado lento |
| SMAP L3E 9 km | 34/91 días; mediana 0,074 m³/m³ | 34/91; mediana 0,349 | Ídem | **S2 y S3** |
| SMAP L4 9 km (cada 3 h) | Raíces: 0,024–0,047 (no ve el riego) | Raíces: 0,163–0,229 | Ídem | S2 y S3 (secano); no en S1 |
| ECOSTRESS ET/ESI 70 m | 2 pasadas en 3 meses | 1 pasada | Ídem | **Descartar**: demasiado esporádico |

Segunda prueba, por área (zonas piloto de 10 × 10 km y DEM de 90 m de Arequipa): [herramientas/prueba_earthdata_area.py](herramientas/prueba_earthdata_area.py). La ejecuta Erick.

## 2. Precálculo en el tiempo que queda

- **Qué se puede medir y qué no:** el tiempo de AppEEARS por área es **pendiente**; la prueba por área lo dirá. Una tarea por punto de 3 meses y 7 capas tardó 19,4 min; el relieve por punto, 85 s.
- **Créditos de nube del hackathon:** no aceleran la cola de AppEEARS. Sirven para **alojar la API** (que cualquiera analice su parcela) y para procesar descargas propias más adelante.

**Prioridad para la demo:**
1. **En vivo y rápido:** POWER (19 variables, 3,1 s), SoilGrids por WCS (≈ 1 s), GAEZ (< 1 s) y latitud (cálculo propio).
2. **Altitud y sector:** NASADEM por punto (85 s), o del DEM de 90 m de Arequipa si la prueba por área termina.
3. **Precalculado para los dos lugares de ejemplo y las zonas piloto:** NDVI de MODIS (ya está el de Damaris), HLS, SMAP, pendiente (NASADEM por área), cobertura, LST y ET.
4. **En vivo, en minutos:** MODIS por ORNL (en paralelo) para una parcela nueva.
5. **Después del hackathon:** precálculo de toda Arequipa (solo zonas agrícolas) y luego de todo el Perú.

## 3. Variables por fuente y por sector

● = principal (se muestra primero) · ○ = complementaria · — = no se usa (con su motivo)

| Fuente · variable | S1 | S2 | S3 | Para qué / motivo |
|---|---|---|---|---|
| **POWER** `T2M`, `T2M_MAX` | ● | ● | ○ | Calor; ciclo del cultivo |
| `T2M_MIN`, `FROST_DAYS`, `TS_MIN` | ○ | ● | ● | Heladas (definición citada de POWER); en S1, 0 días en la grilla |
| `T2M_RANGE` | ○ | ● | ● | Amplitud térmica |
| `PRECTOTCORR` | ○ | ● | ● | En S1 está por debajo del mínimo de EcoCrop en las 22 celdas: el agua viene del riego |
| `RH2M`, `T2MDEW`, `CLOUD_AMT` | ● | ○ | ● | Humedad; punto de escarcha; noches despejadas |
| `ALLSKY_SFC_SW_DWN`, `ALLSKY_SFC_PAR_TOT` | ● | ○ | ○ | Energía para el cultivo |
| `WS2M` | ● | ○ | ○ | Pérdida de agua |
| `GWETTOP`, `GWETROOT`, `GWETPROF` | ○ | ● | ● | Humedad del suelo (modelo, celda de 55 km) |
| `TSOIL1`, `TSOIL2` | ○ | ○ | ● | Temperatura del suelo |
| `EVLAND` | ○ | ○ | — | Evaporación del suelo |
| **SoilGrids** pH, arcilla, arena, limo (0–5, 5–15 y 15–30 cm) | ● | ● | ● | pH frente a EcoCrop; textura (EcoCrop); erodabilidad K |
| `soc`, `nitrogen`, `cec` | ○ | ● | ● | Fertilidad (descriptivo, sin regla); K |
| `bdod`, `cfvo`, `wv0033`, `wv1500` | ● | ○ | ○ | Compactación, piedras, agua disponible (riego) |
| **GAEZ** índice de aptitud | ● con riego | ● ambos | ● secano | Aptitud citada (14 de 30 cultivos) |
| **NASADEM** altitud | ● | ● | ● | Sector; altitud frente a EcoCrop |
| Pendiente (%) y clase FAO 2006 | ○ | ● | ● | Erosión, riego y drenaje (FAO 2006) |
| Orientación | — | ● | ○ | Ladera |
| Factor LS (RUSLE) | — | ● | ● | Erosión (fórmula **a verificar**) |
| **Latitud** → horas de luz (FAO-56) | ● | ● | ● | Fotoperiodo de EcoCrop; Arequipa: 10,95 a 13,05 h |
| **MODIS** NDVI MOD13Q1 | ● | ● | ● | Verdor de la zona (231 m) |
| Cobertura MCD12Q1 | ● | ● | ● | ¿Es zona de cultivo? |
| ET y PET MOD16A2GF | ● | ○ | — | Agua que sale del campo; en S3 (pastizal) no aporta |
| LST de día MOD11A2 | ● | ○ | ○ | Calor de la superficie (1 km) |
| LST de noche MOD11A2 | — | ● | ● | Frío de la superficie (1 km): suple la celda gruesa de POWER |
| **HLS** NDVI 30 m | ● | ● | ○ | Verdor de la parcela (campos chicos, andenes) |
| **SMAP** L3E y L4 | — | ● | ● | En S1 la celda de 9 km no ve el riego (medido) |
| ECOSTRESS | — | — | — | 1–2 pasadas en 3 meses |

**Erosión:** se muestran la clase de pendiente (FAO 2006), el factor LS, el factor K (Williams/EPIC) y la concentración de la lluvia (% en dic–mar). **No se calcula la pérdida de suelo** en t/ha: faltan el factor de manejo (C, P) y la intensidad de la lluvia (R). Se declara como vacío. Las fórmulas de LS y K se **verifican** en sus fuentes antes de programarlas.

## 4. Cultivos por sector

**Fuentes de la lista (30 cultivos):** INEI 2023/2024, ENIS 2026/27, MIDAGRI 2017 (cuadro 14, ≈ 80 cultivos) y Censo 1994 por provincia y región natural.

**Dónde está cada uno** (Censo 1994; distribución histórica):
- arroz: Camaná 83,8 %, Castilla 39,5 % e Islay 13,7 % de sus transitorios;
- maíz amiláceo: La Unión 62,2 %, Condesuyos 44,8 % y Caylloma 25,7 %;
- papa: Caylloma 27,3 %, Condesuyos 22,3 % e Islay 15,8 %;
- cebolla: la provincia de Arequipa 32,6 %;
- algodón: Caravelí 62,7 %; olivo: 84,1 % de los permanentes de Caravelí;
- costa: arroz, cebolla, algodón y olivo; sierra: maíz amiláceo, papa, vid y palto.

| Tipo de evidencia | Cultivos |
|---|---|
| **Ubicación oficial: costa** (Censo 1994, región natural) → S1 | arroz, maíz amarillo duro, cebolla, algodón, olivo, peral, manzano |
| **Ubicación oficial: sierra** (Censo 1994) → S2 o S3, sin poder separarlos | maíz amiláceo, papa, vid, palto |
| **Se siembran en Arequipa, sin ubicación oficial encontrada** (MIDAGRI 2017, INEI 2023/24, ENIS 2026/27) | alfalfa, ajo, alcachofa, frijol, trigo, haba, quinua, tomate, zapallo, páprika, tuna, orégano, caña, zanahoria, arveja, camote, cebada, kiwicha, olluco, oca, mashua, cañihua |

Para el tercer grupo, el sector se **propone solo por clima** (EcoCrop frente a POWER, sección 4 del JSON) y se rotula así:
- **S1, por clima:** todos dentro de su rango absoluto de temperatura los 12 meses (algodón 10–12; caña 10–12); ninguno con meses de mínima bajo su letal; todos con riego.
- **S2, por clima:** cañihua (9–12 meses en el óptimo), arveja (10–12), oca, olluco y mashua (1–12); meses de mínima bajo la letal 0–6 según la celda.
- **S3, por clima:** quinua (letal −8 °C; 0–3 meses bajo) y cañihua (letal −3 °C en crecimiento temprano). Las celdas de S3 son de puna (> 4000 m): no representan los valles donde se siembra.

**Pendiente:** CENAGRO 2012 por distrito (INEI) para dar ubicación oficial a todos y separar S2 de S3.

## 5. Pendientes

1. Resultado de la prueba por área.
2. Verificar las fórmulas de LS (Moore y Burch, 1986) y K (Williams, 1995).
3. CENAGRO 2012 por distrito (INEI) y SIEA por provincia.
4. Reglas de rotación andina con cita (INIA u otra).
5. Verificar los límites de Pulgar Vidal en la obra original.

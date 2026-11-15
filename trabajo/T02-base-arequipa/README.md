# T02 · Base de Arequipa (capa 1 del esquema mixto)

> Escrito con asistencia de IA (Claude Code), 15/11/2026. Declarado en [entrega/uso-de-ia.md](../../entrega/uso-de-ia.md). Enfoque: [DT-22](../../docs/06-decisiones-y-riesgos.md) y [docs/11](../../docs/11-esquema-mixto.md).

Baja **una vez** los datos generales de **toda la región**, para guardarlos y cargarlos después a la base de datos. Cuando un usuario marque su campo, TARPU leerá estos datos al instante en su centroide. Las series de satélite **no** van aquí: se extraen por coordenada (capa 2).

**Caja de extracción:** lon −75,5 a −70,5 y lat −17,5 a −14,5. Es un rectángulo que contiene Arequipa y también parte del mar y de las regiones vecinas. El recorte al límite oficial se hace al cargar a la base de datos; ese límite oficial todavía falta conseguirlo.

## Qué se baja ahora (capa 1, toda la región)

| Fuente | Variables | Escala | Período | Comando | Cuenta |
|---|---|---|---|---|---|
| **NASA POWER** | 19 diarias: `T2M`, `T2M_MAX`, `T2M_MIN`, `T2M_RANGE`, `PRECTOTCORR`, `RH2M`, `T2MDEW`, `FROST_DAYS`, `ALLSKY_SFC_SW_DWN`, `ALLSKY_SFC_PAR_TOT`, `CLOUD_AMT`, `WS2M`, `GWETTOP`, `GWETROOT`, `GWETPROF`, `TSOIL1`, `TSOIL2`, `TS_MIN`, `EVLAND` | Celda de 0,5° × 0,625° (radiación: 1° × 1°); 63 celdas | 2015–2025 | `power` | No |
| **SoilGrids** | pH (`phh2o`), arcilla, arena, limo, carbono orgánico (`soc`), nitrógeno, CIC (`cec`), densidad aparente (`bdod`), fragmentos gruesos (`cfvo`), agua retenida a 33 kPa (`wv0033`) y a 1500 kPa (`wv1500`); profundidades 0–5, 5–15 y 15–30 cm; media, Q0,05 y Q0,95 (99 mapas) | 250 m | Estático | `soilgrids` | No |
| **FAO GAEZ v4** | Índice de aptitud (0–10 000) de 15 cultivos, con todos los tipos de agua que da el servicio (secano, riego, gravedad, aspersión, goteo): 100 mapas | ≈ 9 km | 1981–2010 | `gaez` | No |
| **NASADEM** | Altitud (de ella se calcula después la pendiente por el método de Horn y su clase FAO 2006) | 30 m; 20 teselas, 227 MB | Estático | `nasadem` | **Earthdata** |
| **IV CENAGRO 2012** | Por unidad agropecuaria: ubicación, altitud, piso, cultivos, superficie, riego o secano y mes de siembra | Unidad agropecuaria | 2012 | `cenagro --zip` | No |

**Se calculan sin descargar nada** (al cargar a la base de datos o al consultar):

- horas de luz (FAO-56, según latitud y día);
- sector S1, S2 o S3 (según la altitud, DT-18);
- cultivos del sector (DT-20, `backend/catalogo/sectores.json`);
- pendiente y su clase (de NASADEM);
- factor K del suelo (de SoilGrids, EPIC).

## Qué se extrae por coordenada (capa 2, no aquí)

| Fuente | Variables | Escala | Vía principal | Respaldo ya escrito |
|---|---|---|---|---|
| MODIS `MOD13Q1` | NDVI y su confiabilidad | 250 m · cada 16 días | Google Cloud (Earth Engine) | ORNL, T01 |
| MODIS `MOD16A2GF` | Evapotranspiración real y potencial | 500 m · cada 8 días | Google Cloud | ORNL, T01 |
| MODIS `MOD11A2` | Temperatura de superficie de día y de noche | 1 km · cada 8 días | Google Cloud | ORNL, T01 |
| MODIS `MCD12Q1` | Cobertura del suelo (`LC_Type1`) | 500 m · anual | Google Cloud | ORNL, T01 |
| HLS L30 y S30 | NDVI | 30 m | Google Cloud | AppEEARS, `extraccion_pesada` |
| SMAP L3E y L4 | Humedad del suelo (L3 observada; L4 superficie y raíz, modelada) | 9 km | Google Cloud | AppEEARS, `extraccion_pesada` |

## Cómo se ejecuta

Desde la raíz del repositorio. Solo biblioteca estándar; reutiliza el cliente, POWER y GAEZ de T01.

```bash
python trabajo/T02-base-arequipa/base_arequipa.py soilgrids
```

```bash
python trabajo/T02-base-arequipa/base_arequipa.py gaez
```

```bash
python trabajo/T02-base-arequipa/base_arequipa.py power
```

```bash
python trabajo/T02-base-arequipa/base_arequipa.py nasadem
```

```bash
python trabajo/T02-base-arequipa/base_arequipa.py estado
```

- `nasadem` necesita `backend/.env` con la cuenta de Earthdata (ver [trabajo/README.md](../README.md)). Lo ejecuta quien tenga la cuenta, nunca un asistente de IA.
- **Si algo se corta, se vuelve a lanzar el mismo comando:** cada archivo se escribe de forma atómica y lo ya completo se salta. En NASADEM, cada zip se comprueba antes de darlo por bueno.
- **Salidas:** `salida/` y `cache/` no se suben a git porque pesan cientos de MB y van a la base de datos. Lo que sí se sube es **`manifiesto.json`**: fuente, URL, caja, resolución, nivel del dato, fallos y fecha de cada fuente.

## Medido el 15/11/2026

| Fuente | Resultado |
|---|---|
| SoilGrids, 99 mapas de toda la caja | 145 s · 124 MB. **El servidor remuestrea** a una malla de 0,00226° × 0,00239°: en un punto el valor puede ser el de un píxel vecino. Majes riego 0–5 cm: pH 82 (nativo 81) y arcilla 8,0 % (nativo 9,8 %). Para el valor exacto de un punto, la consulta por punto de T01 (1 s, igual a la API REST) |
| POWER, 63 celdas | 52 s · 135 MB · 52 completas y 11 «parcial»: son celdas de mar (elevación 0), donde POWER no da las 5 variables de suelo y evaporación. Elevación de las celdas: 0 a 4691 m |
| GAEZ, 100 capas de toda la caja | 56 s · 6 MB; los valores coinciden con los puntos de T01 (Majes riego 3333 y 5556; Chivay 0) |
| NASADEM, lista de CMR | 20 teselas · 227,4 MB |
| CENAGRO, Arequipa | 44 archivos · 127 MB |

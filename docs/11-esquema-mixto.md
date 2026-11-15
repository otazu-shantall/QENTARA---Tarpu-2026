# Esquema mixto de datos: base de Arequipa + extracción por coordenada

> Decisión **DT-22** (15/11/2026, Erick), que reemplaza DT-21. Es el enfoque vigente del motor de TARPU y manda sobre lo que digan [10](10-recorrido-y-escala.md), [02](02-arquitectura.md) y los planes de `backend/` donde se contradigan. Escrito con asistencia de IA (Claude Code).
>
> **Medido** = comprobado con peticiones reales. **Por verificar** = todavía sin comprobar; está en la lista del final.

## 1. La idea

TARPU trabaja **por coordenada**: el usuario marca su campo y TARPU le da los datos de ese lugar. Esa es la esencia del producto. Para que no tarde horas, los datos se separan en dos capas:

| Capa | Qué contiene | Cómo se obtiene | Cuándo está lista |
|---|---|---|---|
| **1 · Base de Arequipa** | Lo que no cambia en el tiempo o cubre la región con pocas celdas | Se baja **una vez para todo Arequipa** y se guarda | Al instante: se lee en el centroide de la parcela |
| **2 · Por coordenada** | Series de satélite, que no se pueden bajar para toda la región | Se extrae **solo para el punto del usuario**, en **Google Cloud**, como un trabajo en segundo plano | Cuando termina el trabajo; **se avisa al usuario** y vuelve a entrar |

Además hay una tercera pieza, que no es una capa sino una garantía para la evaluación:

| | Qué contiene | Para qué |
|---|---|---|
| **3 · Lugares de ejemplo** | Majes riego y Chivay (y el S2, Cabanaconde, si alcanza) con **todas** las fuentes ya extraídas y guardadas | Que el jurado pruebe TARPU completo aunque Google Cloud o un proveedor fallen |

## 2. Qué va en cada capa

### Capa 1 · Base de Arequipa (una vez, guardada)

| Fuente | Variables | Escala | Por qué cabe para toda la región |
|---|---|---|---|
| NASADEM | Altitud; pendiente (Horn) y su clase FAO 2006 | 30 m | Es estática |
| SoilGrids (WCS) | 11 propiedades × 3 profundidades; media, Q0,05 y Q0,95 | 250 m | Es estática; el WCS devuelve recortes de área |
| FAO GAEZ v4 | Índice de aptitud, período 1981–2010 | ≈ 9 km | Estática y de celda grande |
| NASA POWER | 19 variables diarias | Celda de 0,5° × 0,625° | Arequipa cubre pocas decenas de celdas (estimado, por medir) |
| IV CENAGRO 2012 | Cultivos por sector y piso | Unidad agropecuaria | Ya está en `backend/investigacion/` |
| Sectores (DT-18) y cultivos (DT-20) | S1, S2, S3 y sus listas | — | Ya en `backend/catalogo/sectores.json` |
| Horas de luz (FAO-56) | Duración del día | Por latitud | Se calcula con una fórmula, no se baja |

### Capa 2 · Por coordenada (Google Cloud, en segundo plano)

| Fuente | Variables | Escala | Medido hoy por otra vía |
|---|---|---|---|
| MODIS `MOD13Q1` | NDVI y confiabilidad | 250 m · 16 días | ORNL: 12,1 min (Chivay) y 37,8 min (Majes) para 2015–2026 (T01) |
| MODIS `MOD16A2GF` | ET y PET | 500 m · 8 días | ORNL, T01 |
| MODIS `MOD11A2` | Temperatura de superficie de día y de noche | 1 km · 8 días | ORNL, T01 |
| MODIS `MCD12Q1` | Cobertura `LC_Type1` | 500 m · anual | ORNL, T01 |
| HLS L30 y S30 | NDVI | 30 m | AppEEARS por punto: HLS + SMAP de tres meses, 19,4 min |
| SMAP L3E y L4 | Humedad del suelo | 9 km | AppEEARS, misma prueba |

**Vía principal:** Google Earth Engine, en Google Cloud. **Vías de respaldo, ya escritas:** ORNL (T01) y AppEEARS (`trabajo/extraccion_pesada/`). Si la vía principal no está disponible para un producto, se usa la de respaldo y se dice en la procedencia.

## 3. El recorrido con el esquema mixto

1. El usuario marca su campo y declara lo que siembra (pasos 1 a 3 de [10](10-recorrido-y-escala.md)).
2. La **API interna** valida el contorno y lee la **capa 1** en el centroide: altitud, pendiente, suelo, clima de POWER, sector y cultivos del sector. **El usuario ya ve un primer resultado.**
3. La API crea un **trabajo de capa 2** para ese punto en Google Cloud y responde con su estado («preparando tus datos de satélite»).
4. Si el punto ya se pidió antes, el trabajo usa lo **guardado** (caché por coordenada) y no repite la extracción.
5. Al terminar, el **motor** recalcula con todas las fuentes, guarda el resultado y **se avisa al usuario**.
6. El usuario vuelve a entrar y encuentra todo: indicadores, comparación de cultivos, agente y descarga.

Mientras un trabajo no termina, cada fuente muestra su estado real, con los que ya usa `procesamiento.py` (`en_proceso`, `listo`, `parcial`, `no_disponible`) y su motivo. Nada se rellena (DT-16).

## 4. La API

| | Estado |
|---|---|
| **API interna** (frontend ↔ motor, trabajos de capa 2) | **Sí se usa.** Es el corazón del motor |
| **API pública para terceros** | Valor agregado para después; no se ofrece en la hackathon |
| **Exportación a JSON estático** (DT-13) | Se mantiene para los lugares de ejemplo, como respaldo de la demo |

## 5. Lo que ya existe y lo que falta

| Pieza | Estado |
|---|---|
| Backend con motor, agente y rutas `procesar` / `procesamiento` | ✅ construido (`backend/tarpu_api/`), 15 pruebas que pasan |
| Extracción por punto de capa 2 por ORNL (T01) y AppEEARS (`pesados.py`) | ✅ escrita; T01 ya corrió en Majes riego y Chivay |
| Cultivos por sector, métodos citados | ✅ `backend/catalogo/`, `backend/investigacion/` |
| Lugares de ejemplo completos (capa 3) | 🟡 T01 hecho en dos lugares; falta subir sus salidas y la parte de AppEEARS |
| Base de Arequipa (capa 1) | 🟡 **T02 extraída el 15/11/2026** (`trabajo/T02-base-arequipa/`): SoilGrids 99 mapas, GAEZ 100 mapas, POWER 63 celdas y CENAGRO de Arequipa. Falta NASADEM (cuenta Earthdata) y cargarla a la base de datos |
| Trabajos en Google Cloud (capa 2) | ❌ falta el proyecto de Google Cloud con Earth Engine y el código del trabajo |
| Aviso al usuario | ❌ falta elegir el canal |
| Servidor para la API interna | ❌ falta elegir dónde corre (propuesta: Google Cloud) |

## 6. Por verificar (antes de construir cada pieza)

- **Earth Engine:** que cada producto de la capa 2 esté en su catálogo, con qué identificador y versión; que la cuenta no comercial cubra este uso y cuánto cómputo da al mes. Antes se leyó que el nivel no comercial pide una cuenta de facturación y da 150 EECU-hora al mes: confirmarlo en la página oficial al crear el proyecto.
- **Tiempo real por coordenada en Earth Engine:** no está medido. Se mide con los dos lugares de ejemplo y se compara con ORNL y AppEEARS.
- **Tamaño de la capa 1:** cuánto pesan NASADEM y SoilGrids para todo Arequipa; cuántas celdas de POWER caen dentro del límite oficial (falta el límite oficial de la región).
- **Aviso al usuario:** por qué canal (en la app, correo u otro) y cómo se identifica al usuario sin cuentas (no hay autenticación).
- **Servidor de la API interna:** dónde corre, con qué costo y con qué claves (las de Earthdata y Google van en variables de entorno, nunca en el repositorio ni en el frontend).

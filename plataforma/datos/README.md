# Datos satelitales

> Área de **Damaris**. Objetivo: saber **cómo extraer los datos** que TARPU necesita, con qué límites, y dejarlos listos para que el backend los use. Contexto: [docs/03-datos-y-fuentes.md](../../docs/03-datos-y-fuentes.md) y los recursos oficiales del desafío en [docs/08-desafio-oficial.md](../../docs/08-desafio-oficial.md).

## Lo que ya funciona

Una consulta real a **NASA POWER** para un punto de Majes (Arequipa), todo 2025:

```bash
python datos/power/consulta_power.py --lat -16.351 --lon -72.190 --inicio 20250101 --fin 20251231 --nombre majes
```

No necesita cuenta, clave ni instalar nada (solo Python 3). Deja tres archivos en `datos/muestras/`:

| Archivo | Qué es |
|---|---|
| `power_majes_….original.json` | La respuesta del proveedor, sin tocar |
| `power_majes_….normalizado.csv` | Una fila por día; los faltantes quedan vacíos |
| `power_majes_….procedencia.json` | URL exacta, fecha de consulta, unidades, faltantes y fuentes: lo necesario para repetirla y explicarla |

**Resultado comprobado el 14/11/2026:** 365 días, 0 faltantes, API v2.10.3.

| Variable | Significado | Unidad |
|---|---|---|
| `T2M`, `T2M_MAX`, `T2M_MIN` | Temperatura a 2 m: media, máxima y mínima | °C |
| `PRECTOTCORR` | Precipitación corregida | mm/día |
| `RH2M` | Humedad relativa a 2 m | % |
| `ALLSKY_SFC_SW_DWN` | Radiación solar en superficie | MJ/m²/día |

**Ojo con la escala:** es un valor de celda regional, no una medición dentro de la parcela. Sirve como contexto climático.

## Qué investigar

Para cada fuente hay que responder lo mismo y dejarlo en una ficha (`datos/<fuente>/README.md`).

| Pregunta | Por qué |
|---|---|
| ¿Qué producto y versión exactos? | Para citarlo en la entrega |
| ¿Cómo se accede? (URL, cuenta, clave) | Para que el backend lo automatice |
| ¿Qué formato devuelve? | JSON es fácil; HDF5, NetCDF o GeoTIFF necesitan bibliotecas |
| ¿Unidades y valor de relleno de los faltantes? | Para no confundir un faltante con un cero |
| ¿Resolución espacial y temporal? ¿Latencia? | Define qué se puede afirmar de una parcela |
| ¿Cubre Arequipa? | Varios recursos del desafío son solo de Estados Unidos |
| ¿Condiciones de uso y atribución? | Los términos del evento exigen materiales de libre acceso |

## Fuentes por orden sugerido

**Análisis completo, con lo verificado sobre Arequipa: [analisis-recursos.md](analisis-recursos.md).** La investigación previa de Erick está en [investigacion-erick.md](investigacion-erick.md).

| # | Fuente | Para qué en TARPU | Acceso |
|---|---|---|---|
| 1 | **NASA POWER** ✅ | Clima: temperatura, heladas, lluvia, radiación | Sin cuenta · hecha · [ficha](power/README.md) |
| 2 | **NDVI MODIS (MOD13Q1)** (servicio de ORNL) ✅ | Curva de verdor desde 2000; épocas sin cultivo | Sin cuenta · hecha (inestable; con caché) · [ficha](ndvi/README.md) |
| 3 | **SoilGrids** ✅ | pH, textura y carbono del suelo | Sin cuenta · hecha · [ficha](soilgrids/README.md) |
| 4 | **Capas de NASA GIBS** | Capas de NASA para el mapa (NDVI, SMAP, lluvia, relieve) | Sin cuenta · probado |
| 5 | **HLS** (Landsat + Sentinel-2, 30 m) | NDVI a escala de parcela | Cuenta Earthdata |
| 6 | **IMERG** | Lluvia, sobre todo en la sierra | Cuenta Earthdata |
| 7 | **SMAP** | Humedad del suelo regional (sierra) | Cuenta Earthdata |
| 8 | **SRTM / NASADEM** | Pendiente y riesgo de erosión | Cuenta Earthdata |
| 9 | **ECOSTRESS** | Calor y evapotranspiración (costa) | Cuenta Earthdata |
| 10 | **FAO GAEZ** | Aptitud de cada cultivo; verificar si tiene quinua y haba | Por investigar |

Vías para explorar sin programar: [NASA Worldview](https://worldview.earthdata.nasa.gov/) (ver capas) y [AppEEARS](https://appeears.earthdatacloud.nasa.gov/) (recortar productos por zona, con cuenta Earthdata).

## Qué entregar a las otras áreas

- **A backend (Erick):** por cada fuente, el script o la petición que funciona, un archivo de muestra y su ficha.
- **A entrega (Derecho):** la lista exacta de datos de NASA y de socios usados, con enlace, para el formulario.

## Reglas

- Guardar siempre el **original** sin tocar, aparte del normalizado.
- Un faltante **nunca** se convierte en cero.
- No subir archivos pesados al repositorio: muestras pequeñas y, para lo demás, el enlace y cómo obtenerlo.
- No poner claves ni contraseñas en el código. Si una fuente pide cuenta, la clave va en una variable de entorno.
- Declarar el uso de IA en el archivo y en [entrega/uso-de-ia.md](../../entrega/uso-de-ia.md).

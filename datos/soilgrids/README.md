# Ficha · ISRIC SoilGrids 2.0

> Fuente de suelo del núcleo sin cuenta. Verificado el 14/11/2026 con consultas reales a Majes y Chivay. Script: [consulta_soilgrids.py](consulta_soilgrids.py), escrito con asistencia de IA (Claude Code).
>
> Ficha redactada con asistencia de IA (Claude Code).

## Cómo se usa

```bash
python datos/soilgrids/consulta_soilgrids.py --lat -16.351 --lon -72.190 --nombre majes
python datos/soilgrids/consulta_soilgrids.py --lat -15.64 --lon -71.60 --nombre chivay
```

Solo Python 3 con la biblioteca estándar. Deja tres archivos en `datos/muestras/`:

| Archivo | Qué es |
|---|---|
| `soilgrids_<nombre>.original.json` | Respuesta del proveedor, sin tocar (GeoJSON) |
| `soilgrids_<nombre>.normalizado.csv` | Una fila por propiedad y profundidad; los valores, ya en unidades de destino; los faltantes, vacíos |
| `soilgrids_<nombre>.procedencia.json` | URL exacta, fecha de consulta, unidades y factores, faltantes, resolución, licencia y cita |

## Datos de la fuente

| Pregunta | Respuesta |
|---|---|
| Producto y versión | SoilGrids 2.0 (SoilGrids250m), API REST `v2.0`, endpoint `properties/query` |
| Acceso | `https://rest.isric.org/soilgrids/v2.0/properties/query`, sin cuenta ni clave |
| Formato | GeoJSON (JSON) |
| Variables pedidas | `phh2o` (pH en agua), `clay` (arcilla), `sand` (arena), `soc` (carbono orgánico del suelo) |
| Profundidades | `0-5cm` y `5-15cm` (el servicio tiene seis, hasta 200 cm) |
| Estadísticos | `mean`, `Q0.05`, `Q0.5`, `Q0.95` y `uncertainty` |
| Resolución | 250 m; es una predicción por aprendizaje automático, no una medición |
| Temporalidad | Producto estático, sin fecha de observación por punto |
| Cobertura de Arequipa | Sí: respuesta completa en Majes y Chivay |
| Licencia | CC BY 4.0 (página de acceso a SoilGrids de ISRIC) |
| Cita | Poggio, L., de Sousa, L. M., Batjes, N. H., Heuvelink, G. B. M., Kempen, B., Ribeiro, E., and Rossiter, D.: SoilGrids 2.0: producing soil information for the globe with quantified spatial uncertainty, *SOIL*, 7, 217–240, 2021. <https://doi.org/10.5194/soil-7-217-2021> |
| Política de datos | <https://isric.org/about/data-policy> |

### Unidades

El servicio entrega enteros. Se dividen por `d_factor` (10 en las cuatro propiedades):

| Propiedad | Valor del servicio | Unidad normalizada |
|---|---|---|
| `phh2o` | pH × 10 | pH (sin unidad, `-`) |
| `clay`, `sand` | g/kg | % |
| `soc` | dg/kg | g/kg |

`uncertainty`: sin verificar: ISRIC no publica su unidad; se guarda el entero sin convertir. **Indicio, no cita:** en las muestras REST, el entero se parece a (Q0.95 − Q0.05) / Q0.5 × 10. No está confirmado en la documentación de ISRIC, así que no se usa para convertir ni para interpretar el valor. Detalle en [trabajo/T01-paquete-extraccion/README.md](../../trabajo/T01-paquete-extraccion/README.md), §9.4, y tarea V-06 de [trabajo/T03-modelado-datos/modelo-logico.md](../../trabajo/T03-modelado-datos/modelo-logico.md).

### Faltantes

Donde no hay predicción (mar, agua, zonas urbanas o roca), el servicio devuelve `null`. El script lo deja vacío en el CSV y lo cuenta en `missing_values`: un valor por cada profundidad y estadístico, hasta 10 por propiedad. **Nunca lo convierte en cero.**

Se comprobó con un punto en el mar (−17,0; −73,0): las 8 filas quedaron vacías, con 10 faltantes por propiedad. Esa muestra no se guardó en el repositorio.

### Estado del servicio

- La documentación de ISRIC describe la API REST como **beta**, sin garantía de disponibilidad, y su página de acceso indicó una **pausa temporal** del servicio. El 14/11/2026 respondió con normalidad (unos 13–14 s por consulta).
- Uso justo: **5 llamadas por minuto**. El script hace una llamada por punto y reintenta con espera (15, 30 y 60 s) ante 429 o 5xx.
- Para un uso estable, ISRIC recomienda WebDAV o servicios WCS. Conviene que el backend use las muestras guardadas, sin pedir en vivo.

## Resultado del 14/11/2026 (medias)

| Punto | Profundidad | pH | Arcilla % | Arena % | COS g/kg |
|---|---|---|---|---|---|
| Majes (−16,351; −72,190) | 0–5 cm | 8,3 | 7,2 | 74,9 | 17,2 |
| Majes | 5–15 cm | 8,3 | 6,6 | 75,6 | 9,8 |
| Chivay (−15,64; −71,60) | 0–5 cm | 6,9 | 18,0 | 56,1 | 19,1 |
| Chivay | 5–15 cm | 6,9 | 20,3 | 55,2 | 13,8 |

0 faltantes en los dos puntos. La media y la mediana difieren mucho en algunas variables. Por ejemplo, la arcilla de Majes a 0–5 cm tiene una media de 7,2 %, una mediana de 3,5 % y un intervalo del 90 % de 0,3 % a 24,4 %. **El rango tiene que acompañar siempre al valor.**

## Límites (qué no dice)

- Es una **predicción a 250 m**: un píxel puede mezclar campo irrigado, desierto y ladera. No describe una parcela concreta.
- **No sustituye un análisis de suelo.** Sirve como contexto y para señalar qué conviene medir.
- En la costa irrigada (Majes), el riego y el manejo cambian el suelo de la parcela respecto de la predicción regional.
- El carbono orgánico tiene una incertidumbre muy alta en los dos puntos: no sirve para afirmar la fertilidad.
- No está en la lista oficial de recursos del desafío: va en «otras referencias» y no cuenta como dato de NASA.

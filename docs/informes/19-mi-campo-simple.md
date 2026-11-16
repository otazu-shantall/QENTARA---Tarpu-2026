# 19 · Mi campo más simple: mapa grande, «Extraer datos completos» y resultados explicados

> 15/11/2026 · Erick, con Claude Code. Pedido de Erick tras probar el frontend unido (DT-26).

## Qué cambió

- **Sin textos de relleno.** El encabezado de cada página es solo su nombre, el selector de parcela y «Nueva parcela». Se quitaron la banda de procedencia, los lemas («Cada campo, una historia», «De la observación al estudio completo»…), las tarjetas de «Lo que los datos pueden contar» y el pie con lema. Historial, Estudio técnico, Recomendaciones e Informes tienen títulos que dicen qué hay.
- **Mapa grande** (alto de la ventana menos el encabezado, mínimo 520 px) y **zonas S1–S3 con el recuadro de la base de Arequipa**, como en la pantalla de prueba, con leyenda y opción para ocultarlas en «Capas». Se quitó el texto que se sobreponía a los créditos de la imagen.
- **Un solo botón: «Extraer datos completos».** Pide la base de Arequipa y el trabajo satelital juntos (también para Majes, Cabanaconde y Chivay, por punto). Una lista muestra cada dato con ✔ al estar listo o «Cargando…» con el tiempo transcurrido: altitud y pendiente, suelo, zona y cultivos, clima diario, y los cuatro productos de MODIS. SMAP y HLS figuran como «Todavía no conectado». Hay «Detener» y «Continuar la extracción».
- **«Lo que encontramos»**, con el dato grande, una frase sencilla y la fuente abajo:
  - altitud y zona (con su rango de altitud);
  - inclinación del terreno con su clase FAO;
  - pH con lo que significa (ácido, neutro o alcalino, por definición de la escala) y **qué cultivos de la zona lo tienen en su pH ideal, cuáles lo toleran y cuáles no**, según FAO EcoCrop, con enlace a cada ficha;
  - de qué está hecho el suelo (qué predomina, con barras);
  - el clima del último año (temperatura media, lluvia total, noches bajo 0 °C);
  - verdor (NDVI, con qué significa y que no mide fertilidad) y qué cubre el terreno (MCD12Q1);
  - «Ten en cuenta» plegado con los avisos.
- **Backend:** `tarpu_api/lectura.py` arma esas explicaciones con cita y se añade como `lectura` a `/api/base` y `/api/base/parcela`. La imagen de Docker ahora copia `investigacion/cultivos_arequipa_2026-11-14.json` (fichas EcoCrop).

## Lo que no se muestra y por qué (DT-16)

- **Clase textural USDA y clases de pH del USDA:** se intentó copiar sus tablas del Soil Survey Manual, del Field Book del NRCS y del glosario de la SSSA. Las páginas del NRCS no respondieron y el PDF de la SSSA era otra tabla (estructura del suelo). Quedan `sin_regla` hasta copiarlas de la fuente.

## Comprobaciones

- Pruebas: backend 22 (nueva: la lectura del pH con EcoCrop y `sin_regla` sin ficha), frontend 11, y el recorrido en Chrome contra la API de Docker, incluido «Extraer datos completos» en una parcela nueva.
- Chivay: zona S3, terreno suave, pH 6,9 (alfalfa, cebada, maíz, haba y arveja en su pH ideal; papa y olluco lo toleran), 163 noches bajo 0 °C en el último año y cobertura «Pastizal».

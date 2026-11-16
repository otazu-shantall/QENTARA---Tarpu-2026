// Qué es cada tipo de dato (definición y fuente), para la ventana «¿Qué es este dato?» y el tutorial.
// Solo definiciones y procedencia; ningún umbral ni diagnóstico (DT-16).
// Escrito con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
export const ABOUT: Record<string, { what: string[]; source: string; anchor: string; ask: string }> = {
  altitud: {
    what: [
      'La altitud es la altura del terreno sobre el nivel del mar.',
      'TARPU la lee de NASADEM, un modelo de elevación de la NASA que divide el terreno en cuadros de unos 30 metros.',
      'Con la altitud, TARPU ubica tu campo en una de las tres zonas de Arequipa (S1, S2 o S3) para mostrarte qué se siembra más en lugares parecidos al tuyo, según el censo agropecuario de 2012.',
    ],
    source: 'NASADEM (NASA) · IV CENAGRO 2012 (INEI)',
    anchor: 'nasadem',
    ask: '¿Qué significa la altitud y la zona de mi campo?',
  },
  pendiente: {
    what: [
      'La pendiente dice cuánto sube o baja el terreno: 5 % significa 5 metros de desnivel por cada 100 metros.',
      'Se calcula con NASADEM. El nombre de la clase (plano, suave, inclinado, empinado…) viene de la guía de la FAO para describir suelos (2006).',
    ],
    source: 'NASADEM (NASA) · FAO (2006), Guidelines for soil description, cuadro 7',
    anchor: 'fao-suelos',
    ask: '¿Qué significa la pendiente de mi campo?',
  },
  ph: {
    what: [
      'El pH mide qué tan ácido o alcalino es el suelo, en una escala de 0 a 14. El 7 es neutro, menos de 7 es ácido y más de 7 es alcalino.',
      'Cada cultivo tiene un rango de pH en el que crece mejor. TARPU compara el pH de tu campo con los rangos que publica la FAO en EcoCrop.',
      'El valor viene de SoilGrids, que lo estima con un modelo en cuadros de 250 metros. No reemplaza un análisis de laboratorio.',
    ],
    source: 'SoilGrids (ISRIC) · FAO EcoCrop',
    anchor: 'soilgrids',
    ask: '¿Qué es el pH del suelo y por qué importa?',
  },
  textura: {
    what: [
      'El suelo está hecho de partículas de tres tamaños: arena (las más gruesas), limo y arcilla (las más finas).',
      'SoilGrids estima qué porcentaje hay de cada una en los primeros 5 centímetros. TARPU te muestra cuál predomina.',
      'Todavía no se nombra la clase de textura (por ejemplo «franco arenoso») porque falta verificar esa tabla en su fuente.',
    ],
    source: 'SoilGrids (ISRIC)',
    anchor: 'soilgrids',
    ask: '¿Qué significa la textura del suelo: arena, limo y arcilla?',
  },
  clima: {
    what: [
      'NASA POWER entrega el clima de cada día desde 2015: temperatura, lluvia, humedad del aire y radiación solar.',
      'Los valores son de una celda de unos 55 × 67 kilómetros que contiene tu campo: describen la región, no cada rincón de tu parcela.',
      'Es un registro del pasado. No es un pronóstico.',
    ],
    source: 'NASA POWER',
    anchor: 'power',
    ask: '¿Cómo fue el clima de mi campo y de dónde sale ese dato?',
  },
  verdor: {
    what: [
      'El verdor (NDVI) es un índice que el satélite calcula con la luz que reflejan las plantas. Va de −1 a 1: cuanto más alto, más vegetación verde.',
      'TARPU usa el satélite MODIS, que observa cuadros de 250 metros y publica un valor cada 16 días. Las fechas con nubes o nieve no se muestran.',
      'El verdor no mide la fertilidad del suelo.',
    ],
    source: 'MODIS MOD13Q1 (NASA, vía ORNL DAAC)',
    anchor: 'modis',
    ask: '¿Qué es el verdor o NDVI?',
  },
  cobertura: {
    what: [
      'Cada año, el satélite MODIS clasifica lo que cubre el terreno en cuadros de 500 metros: cultivos, pastizal, matorral, suelo desnudo, zona urbana y otras clases.',
      'Es la clase del cuadro que contiene tu campo, no una descripción exacta de tu parcela.',
    ],
    source: 'MODIS MCD12Q1 (NASA)',
    anchor: 'modis',
    ask: '¿Qué es la cobertura del terreno?',
  },
  humedad: {
    what: [
      'La humedad relativa dice cuánto vapor de agua tiene el aire, de 0 a 100 %.',
      'No es la humedad del suelo: esa todavía no está conectada en TARPU.',
    ],
    source: 'NASA POWER',
    anchor: 'power',
    ask: '¿Qué es la humedad del aire y en qué se diferencia de la del suelo?',
  },
  radiacion: {
    what: [
      'La radiación solar es la energía del sol que llega al suelo en un día.',
      'Viene de NASA POWER, para una celda regional.',
    ],
    source: 'NASA POWER',
    anchor: 'power',
    ask: '¿Qué es la radiación solar?',
  },
  superficie: {
    what: [
      'Es la temperatura del suelo y de las plantas vista desde el satélite MODIS, en cuadros de 1 kilómetro, cada 8 días.',
      'No es la temperatura del aire.',
    ],
    source: 'MODIS MOD11A2 (NASA, vía ORNL DAAC)',
    anchor: 'modis',
    ask: '¿Qué es la temperatura de la superficie?',
  },
  area: {
    what: [
      'Es la superficie del contorno que dibujaste, medida sobre el elipsoide WGS84.',
      'Es aproximada y no acredita propiedad ni un deslinde legal.',
    ],
    source: 'Tu dibujo · cálculo geodésico',
    anchor: 'como-se-calcula',
    ask: '¿Cómo se mide la superficie de mi parcela?',
  },
}

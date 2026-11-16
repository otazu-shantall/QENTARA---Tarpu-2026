// Qué es cada tipo de dato, para la ventana «¿Qué es este dato?»: definición, cómo leerlo, lo que no dice y su
// procedencia (fuente, escala y frecuencia). Solo definiciones y procedencia; ningún umbral ni diagnóstico (DT-16).
// Escrito con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
export interface About {
  what: string[]
  read: string[]
  limits: string[]
  source: string
  scale: string
  frequency: string
  anchor: string
  ask: string
}
export const ABOUT: Record<string, About> = {
  altitud: {
    what: [
      'La altitud es la altura del terreno sobre el nivel del mar.',
      'Con ella, TARPU ubica tu campo en una de las tres zonas de Arequipa para mostrarte qué se siembra más en lugares parecidos al tuyo.',
    ],
    read: [
      'S1: de 0 a 2300 m, costa y valles bajos.',
      'S2: de 2300 a 3500 m, valles interandinos.',
      'S3: de 3500 a 4800 m, zona altoandina.',
    ],
    limits: [
      'La zona agrupa lugares por altitud; no describe el clima exacto de tu parcela.',
      'En un contorno se muestra la altitud media de sus cuadros de 30 m.',
    ],
    source: 'NASADEM (NASA) · zonas con el IV CENAGRO 2012 (INEI)',
    scale: 'Cuadros de unos 30 m',
    frequency: 'Un solo levantamiento (año 2000)',
    anchor: 'nasadem',
    ask: '¿Qué significa la altitud y la zona de mi campo?',
  },
  pendiente: {
    what: ['La pendiente dice cuánto sube o baja el terreno.'],
    read: [
      'Se expresa en porcentaje: 5 % significa 5 metros de desnivel por cada 100 metros de recorrido.',
      'El nombre de la clase (plano, suave, inclinado, empinado…) viene de la guía de la FAO para describir suelos.',
      'En un contorno se muestra la mediana de sus cuadros de 30 m.',
    ],
    limits: ['Es la pendiente del modelo de elevación, no una medición hecha en el campo.'],
    source: 'NASADEM (NASA) · clases de FAO (2006), Guidelines for soil description, cuadro 7',
    scale: 'Cuadros de unos 30 m',
    frequency: 'Un solo levantamiento (año 2000)',
    anchor: 'fao-suelos',
    ask: '¿Qué significa la pendiente de mi campo?',
  },
  ph: {
    what: [
      'El pH mide qué tan ácido o alcalino es el suelo.',
      'Importa porque cada cultivo tiene un rango de pH en el que crece mejor.',
    ],
    read: [
      'La escala va de 0 a 14. El 7 es neutro.',
      'Menos de 7: suelo ácido. Más de 7: suelo alcalino.',
      '«En su pH ideal» significa que el valor cae en el rango óptimo que la FAO publica para ese cultivo. «Lo tolera» significa que cae en su rango absoluto, fuera del óptimo.',
    ],
    limits: [
      'Es una estimación de un modelo; no reemplaza un análisis de laboratorio.',
      'Los rangos de la FAO describen la especie en general, no las variedades locales.',
      'TARPU no indica cómo corregir el pH.',
    ],
    source: 'SoilGrids 2.0 (ISRIC) · rangos de FAO EcoCrop',
    scale: 'Cuadros de 250 m · profundidad de 0 a 5 cm',
    frequency: 'Mapa fijo (no cambia con el tiempo)',
    anchor: 'soilgrids',
    ask: '¿Qué es el pH del suelo y por qué importa?',
  },
  textura: {
    what: ['El suelo está hecho de partículas de tres tamaños: arena, limo y arcilla.'],
    read: [
      'Arena: las partículas más gruesas.',
      'Limo: tamaño intermedio.',
      'Arcilla: las más finas.',
      'Los tres porcentajes suman cerca de 100. TARPU te muestra cuál predomina.',
    ],
    limits: [
      'Todavía no se nombra la clase de textura (por ejemplo «franco arenoso»): falta verificar esa tabla en su fuente.',
      'Es una estimación de un modelo, no un análisis de laboratorio.',
    ],
    source: 'SoilGrids 2.0 (ISRIC)',
    scale: 'Cuadros de 250 m · profundidad de 0 a 5 cm',
    frequency: 'Mapa fijo (no cambia con el tiempo)',
    anchor: 'soilgrids',
    ask: '¿Qué significa la textura del suelo: arena, limo y arcilla?',
  },
  clima: {
    what: ['Es el registro del clima de cada día desde 2015: temperatura, lluvia, humedad del aire y radiación solar.'],
    read: [
      'Temperatura media: promedio de todos los días del último año.',
      'Lluvia total: suma de la lluvia de todos los días.',
      'Noches bajo 0 °C: días en que la temperatura mínima bajó de cero.',
      'En «Historial» puedes ver cada mes y compararlo con otros años.',
    ],
    limits: [
      'Los valores son de una celda de unos 55 × 67 km: describen la región, no cada rincón de tu parcela.',
      'Es un registro del pasado. No es un pronóstico.',
      'Una noche bajo 0 °C no confirma daño por helada en el cultivo.',
    ],
    source: 'NASA POWER',
    scale: 'Celda de 0,5° × 0,625° (unos 55 × 67 km)',
    frequency: 'Un valor por día, desde 2015',
    anchor: 'power',
    ask: '¿Cómo fue el clima de mi campo y de dónde sale ese dato?',
  },
  verdor: {
    what: ['El verdor (NDVI) es un índice que el satélite calcula con la luz que reflejan las plantas.'],
    read: [
      'Va de −1 a 1. Cuanto más alto, más vegetación verde hay en ese cuadro.',
      'Valores cercanos a 0 corresponden a suelo con poca o ninguna vegetación.',
      'En «Historial» puedes ver cómo cambió durante el año.',
    ],
    limits: [
      'No mide la fertilidad del suelo.',
      'El cuadro de 250 m puede mezclar tu campo con lo que tiene alrededor.',
      'Las fechas con nubes o nieve no se muestran.',
    ],
    source: 'MODIS MOD13Q1 (NASA, vía ORNL DAAC)',
    scale: 'Cuadros de 250 m',
    frequency: 'Un valor cada 16 días, desde 2015',
    anchor: 'modis',
    ask: '¿Qué es el verdor o NDVI?',
  },
  cobertura: {
    what: ['Es la clase que el satélite asigna a lo que cubre el terreno: cultivos, pastizal, matorral, suelo desnudo, zona urbana y otras.'],
    read: ['Se muestra la clase más reciente del cuadro que contiene tu campo, con la clasificación internacional IGBP.'],
    limits: [
      'El cuadro es de 500 m: describe el entorno, no exactamente tu parcela.',
      'Es una clasificación automática; puede no coincidir con lo que ves en el campo.',
    ],
    source: 'MODIS MCD12Q1 (NASA, vía ORNL DAAC)',
    scale: 'Cuadros de 500 m',
    frequency: 'Una clase por año',
    anchor: 'modis',
    ask: '¿Qué es la cobertura del terreno?',
  },
  humedad: {
    what: ['La humedad relativa dice cuánto vapor de agua tiene el aire.'],
    read: ['Va de 0 a 100 %. Se muestra el promedio del último año.'],
    limits: [
      'No es la humedad del suelo: esa todavía no está conectada en TARPU.',
      'No indica cuánto regar.',
    ],
    source: 'NASA POWER',
    scale: 'Celda de unos 55 × 67 km',
    frequency: 'Un valor por día, desde 2015',
    anchor: 'power',
    ask: '¿Qué es la humedad del aire y en qué se diferencia de la del suelo?',
  },
  radiacion: {
    what: ['La radiación solar es la energía del sol que llega al suelo en un día.'],
    read: ['Se mide en megajulios por metro cuadrado (MJ/m²). Se muestra el promedio diario del último año.'],
    limits: ['Es un valor regional. No es la temperatura del aire.'],
    source: 'NASA POWER',
    scale: 'Celda regional (1° × 1°)',
    frequency: 'Un valor por día, desde 2015',
    anchor: 'power',
    ask: '¿Qué es la radiación solar?',
  },
  superficie: {
    what: ['Es la temperatura del suelo y de las plantas vista desde el satélite, de día.'],
    read: ['Se muestra la observación más reciente, en grados Celsius.'],
    limits: [
      'No es la temperatura del aire.',
      'El cuadro es de 1 km: mezcla tu campo con su entorno.',
    ],
    source: 'MODIS MOD11A2 (NASA, vía ORNL DAAC)',
    scale: 'Cuadros de 1 km',
    frequency: 'Un valor cada 8 días, desde 2015',
    anchor: 'modis',
    ask: '¿Qué es la temperatura de la superficie?',
  },
  area: {
    what: ['Es la superficie del contorno que dibujaste en el mapa.'],
    read: ['Una hectárea (ha) son 10 000 metros cuadrados, un cuadrado de 100 m por lado.'],
    limits: ['Es aproximada: depende de dónde marcaste las esquinas.', 'No acredita propiedad ni un deslinde legal.'],
    source: 'Tu dibujo · cálculo geodésico (WGS84)',
    scale: 'Tu contorno',
    frequency: 'Se calcula al guardar la parcela',
    anchor: 'como-se-calcula',
    ask: '¿Cómo se mide la superficie de mi parcela?',
  },
}

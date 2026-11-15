// Escrito con asistencia de OpenAI Codex. Registro en entrega/uso-de-ia.md.
import referenceData from './reference-data.json'

export const places = referenceData.places
export type ReferencePlace = (typeof places)[number]
export type Coordinate = [number, number]
export interface Field {
  id: string
  name: string
  crop: string
  water: string
  coordinates: Coordinate[]
  createdAt: string
}
export interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  text: string
  source?: string
  url?: string
}
export const number = (value: number | null, digits = 1) =>
  value === null
    ? 'Sin dato'
    : new Intl.NumberFormat('es-PE', {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      }).format(value)
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date.slice(0, 10)}T12:00:00Z`))
export const cropName = (name: string) =>
  ({
    maiz: 'Maíz',
    cebolla: 'Cebolla',
    papa: 'Papa',
    alfalfa: 'Alfalfa',
    arroz: 'Arroz',
    tuna: 'Tuna',
    olivo: 'Olivo',
    ajo: 'Ajo',
    cebada: 'Cebada',
    haba: 'Haba',
    avena: 'Avena',
    olluco: 'Olluco',
    arveja: 'Arveja',
  })[name] ?? name.charAt(0).toUpperCase() + name.slice(1)
export const soilName = (name: string) =>
  ({
    phh2o: 'pH del suelo',
    clay: 'Arcilla',
    sand: 'Arena',
    soc: 'Carbono orgánico',
  })[name] ?? name

export function mean(values: (number | null)[]) {
  const available = values.filter((v): v is number => v !== null)
  return available.length
    ? available.reduce((a, b) => a + b, 0) / available.length
    : null
}

export function climateSummary(place: ReferencePlace) {
  const rain = place.climate.map((row) => row.rain)
  return {
    temperature: mean(place.climate.map((row) => row.temperature)),
    rain: rain.every((v) => v !== null)
      ? rain.reduce<number>((sum, v) => sum + (v ?? 0), 0)
      : null,
    coldNights: place.climate.every((row) => row.minimum !== null)
      ? place.climate.filter((row) => row.minimum !== null && row.minimum < 0)
          .length
      : null,
  }
}

export function readFields(): Field[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem('tarpu.fields.v2') ?? '[]',
    )
    if (!Array.isArray(value)) return []
    return value.filter(
      (field): field is Field =>
        field &&
        typeof field.id === 'string' &&
        typeof field.name === 'string' &&
        typeof field.crop === 'string' &&
        typeof field.water === 'string' &&
        typeof field.createdAt === 'string' &&
        Array.isArray(field.coordinates) &&
        field.coordinates.length >= 4 &&
        field.coordinates.every(
          (point: unknown) =>
            Array.isArray(point) &&
            point.length === 2 &&
            point.every((v) => typeof v === 'number' && Number.isFinite(v)) &&
            Math.abs(point[0]) <= 180 &&
            Math.abs(point[1]) <= 90,
        ),
    )
  } catch {
    return []
  }
}

export function download(
  name: string,
  data: string,
  type = 'application/json',
) {
  const url = URL.createObjectURL(new Blob([data], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function answer(
  question: string,
  place: ReferencePlace,
  field: Field | null,
): Omit<ChatMessage, 'id' | 'role'> {
  const text = question
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  if (/manana|pronostic|proxim|predec/.test(text))
    return {
      text: 'Aquí puedes consultar registros históricos. El pronóstico para una próxima campaña está pendiente de integrar.',
    }
  if (/ndvi|verdor|vegetacion/.test(text)) {
    const last = place.vegetation.at(-1)
    return {
      text: field
        ? `Tu campo todavía tiene pendiente la consulta de vegetación. El NDVI describe el verdor observado por un satélite. Para explicarlo en tu campo necesitamos su serie y sus marcas de calidad.`
        : `El NDVI describe el verdor de la superficie. En ${place.name}, la última observación guardada es ${number(last?.value ?? null, 3)}, del ${formatDate(last!.date)}, con calidad «${last!.quality}». MODIS observa un píxel de aproximadamente 250 m que puede incluir varios campos. La fertilidad requiere información adicional del suelo.`,
      source: 'MOD13Q1 v061 · ORNL DAAC · 250 m / 16 días',
      url: 'https://modis.ornl.gov/',
    }
  }
  if (/suelo|ph|fertil/.test(text)) {
    const ph = place.soil.find(
      (row) => row.property === 'phh2o' && row.depth === '0-5cm',
    )
    return {
      text: field
        ? 'La consulta de suelo de tu campo está pendiente. SoilGrids aporta propiedades estimadas por profundidad, con un intervalo de incertidumbre que debemos conservar.'
        : `En el punto de ${place.name}, SoilGrids estima un pH de ${number(ph?.mean ?? null)} a 0–5 cm. El intervalo entre los percentiles 5 y 95 va de ${number(ph?.low ?? null)} a ${number(ph?.high ?? null)}. Es una predicción del suelo a 250 m. Para conocer las condiciones de tu terreno, un análisis de suelo aporta evidencia local.`,
      source: 'ISRIC SoilGrids 2.0 · 250 m · profundidad 0–5 cm',
      url: 'https://soilgrids.org/',
    }
  }
  if (/lluv|clima|frio|temperatura|helad/.test(text)) {
    const summary = climateSummary(place)
    return {
      text: field
        ? 'El clima de tu campo está pendiente de consultar. El recorrido preparado permitirá mostrar temperatura, lluvia, período y cobertura a partir de NASA POWER.'
        : `La consulta guardada de ${place.name} contiene 365 registros diarios de 2025. La temperatura media del período es ${number(summary.temperature)} °C, la lluvia suma ${number(summary.rain)} mm y hay ${number(summary.coldNights, 0)} noches con mínima del aire bajo 0 °C. NASA POWER describe una celda regional de aproximadamente 55 × 67 km.`,
      source:
        'NASA POWER · enero a diciembre de 2025 · resumen de registros diarios',
      url: place.sources.climate.request_url,
    }
  }
  if (/sembr|cultivo|rotacion|compar/.test(text))
    return {
      text: `En «Cultivos» puedes explorar las especies registradas para ${place.sectorName.toLowerCase()} y seleccionar hasta tres. El orden sigue la superficie sembrada en el IV CENAGRO 2012. La comparación agronómica de tu campo necesita conectar el motor y tu historial declarado.`,
      source: 'INEI · IV CENAGRO 2012 · DT-20',
      url: 'http://censos1.inei.gob.pe/Cenagro/redatam/',
    }
  if (/descarg|export|dato|fuente/.test(text))
    return {
      text: 'En «Mis datos» puedes elegir clima, vegetación o suelo, revisar sus registros y descargarlos en CSV. La descarga JSON conserva la consulta guardada con su procedencia. En cada fuente puedes revisar la escala, el período y las unidades.',
      source:
        'Consultas guardadas del repositorio · NASA POWER, ORNL DAAC e ISRIC',
    }
  return {
    text: field
      ? `Tengo el contorno de «${field.name}» y la información que declaraste. Sus datos ambientales están pendientes de conectar. Puedo explicarte las fuentes, el verdor, el suelo y cómo consultar tus registros.`
      : `Estás consultando ${place.name}. Puedo explicarte su clima de 2025, el verdor observado por MODIS, las estimaciones del suelo y las fuentes de cada registro. Prueba «¿Qué dice el suelo?» o «¿Cómo fue el clima?».`,
  }
}

import type { Metric, Observation, Parcel, Period } from '../types'

/** Local synthetic fixtures. No records in this module were obtained from a provider. */
export const DEMO_METADATA = {
  kind: 'synthetic-demo',
  title: 'Datos ilustrativos de TARPU',
  observedAt: '2026-10-24',
  notice: 'Datos sintéticos. No representan mediciones, pronósticos ni recomendaciones agrícolas reales.',
  referenceOnly: 'Los proveedores nombrados indican fuentes candidatas; no existe una conexión activa.',
} as const

export const initialParcels: Parcel[] = [
  { id: 'la-joya', name: 'La Joya', location: 'La Joya, Arequipa', crop: 'Papa', area: 2.4, color: '#e4b453', ndvi: 0.62, temperature: 24, moisture: 0.32, precipitation: 12 },
  { id: 'majes', name: 'El Pedregal', location: 'Majes, Arequipa', crop: 'Quinua', area: 3.1, color: '#9fac80', ndvi: 0.71, temperature: 22, moisture: 0.28, precipitation: 8 },
  { id: 'camana', name: 'Santa Isabel', location: 'Camaná, Arequipa', crop: 'Haba', area: 1.8, color: '#b9c89b', ndvi: 0.57, temperature: 26, moisture: 0.36, precipitation: 16 },
]

export const navItems = [
  { id: 'overview', label: 'Vista general', short: 'Inicio', icon: 'overview' },
  { id: 'parcels', label: 'Mis parcelas', short: 'Parcelas', icon: 'parcels' },
  { id: 'monitor', label: 'Monitor satelital', short: 'Monitor', icon: 'monitor' },
  { id: 'climate', label: 'Clima e históricos', short: 'Clima', icon: 'climate' },
  { id: 'rotations', label: 'Rotaciones', short: 'Rotación', icon: 'rotations' },
  { id: 'data', label: 'Explorar datos', short: 'Datos', icon: 'data' },
  { id: 'reports', label: 'Mis informes', short: 'Informes', icon: 'reports' },
] as const

export const metricLabels: Record<Metric, string> = { ndvi: 'Vegetación', temperature: 'Temperatura', precipitation: 'Precipitación' }
export const metricUnits: Record<Metric, string> = { ndvi: 'NDVI', temperature: '°C', precipitation: 'mm' }

export function metricSeries(parcel: Parcel, period: Period, metric: Metric): number[] {
  const wave = [0, 0.03, -0.015, 0.04, 0.015, 0.065, 0.035, 0.08, 0.06, 0.1, 0.085, 0.12]
  const base = metric === 'ndvi' ? parcel.ndvi - 0.12 : metric === 'temperature' ? parcel.temperature - 2.5 : parcel.precipitation / 4
  return wave.map((v, i) => metric === 'ndvi' ? Math.min(0.99, Math.max(0, +(base + v + (period === 90 ? -0.025 : period === 30 ? -0.01 : 0)).toFixed(3))) : metric === 'temperature' ? +(base + v * 34 + Math.sin(i) * 1.3).toFixed(1) : Math.max(0, +(base + Math.sin(i * 1.6) * 2.6 + v * 10).toFixed(1)))
}

export const observations: Observation[] = initialParcels.flatMap(parcel =>
  Array.from({ length: 90 }, (_, i) => {
    const date = new Date(Date.UTC(2026, 9, 24 - i)).toISOString().slice(0, 10)
    return [
      { id: `${parcel.id}-${i}-t`, date, parcelId: parcel.id, variable: 'temperature' as const, value: +(parcel.temperature + Math.sin(i * 0.8) * 3).toFixed(1), unit: '°C', reference: 'POWER · referencia', level: 'Normalizado' as const },
      { id: `${parcel.id}-${i}-p`, date, parcelId: parcel.id, variable: 'precipitation' as const, value: i === 3 ? null : Math.max(0, +(Math.sin(i * 2.3) * 4 + 2).toFixed(1)), unit: 'mm', reference: 'IMERG · referencia', level: 'Normalizado' as const },
      { id: `${parcel.id}-${i}-v`, date, parcelId: parcel.id, variable: 'ndvi' as const, value: +(parcel.ndvi + Math.sin(i * 0.2) * 0.07).toFixed(2), unit: 'índice', reference: 'Sentinel-2 · referencia', level: 'Derivado' as const },
    ]
  }).flat(),
)

export const alternatives = [
  { id: 'quinua', name: 'Quinua', scientific: 'Chenopodium quinoa', family: 'Amaranthaceae', color: '#9c7990', note: 'Una alternativa para explorar', description: 'Revisa variedad, disponibilidad de agua y condiciones de campaña antes de considerar este cultivo.', symbol: 'grain' },
  { id: 'haba', name: 'Haba', scientific: 'Vicia faba', family: 'Fabaceae', color: '#85a366', note: 'Diversidad en la secuencia', description: 'El papel de una leguminosa depende del manejo y del historial. No implica una dosis de fertilización calculada.', symbol: 'sprout' },
  { id: 'cebada', name: 'Cebada', scientific: 'Hordeum vulgare', family: 'Poaceae', color: '#d5ad62', note: 'Otra familia, otra posibilidad', description: 'Define el destino del cultivo y contrasta su calendario y requerimientos con los recursos de tu parcela.', symbol: 'wheat' },
] as const

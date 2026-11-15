// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { z } from 'zod'

export const coordinateSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
])
export type Coordinate = z.infer<typeof coordinateSchema>
export const parcelSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  location: z.string(),
  kind: z.enum(['reference', 'declared', 'example']),
  boundary: z.array(coordinateSchema),
  crop: z.string(),
  irrigation: z.string(),
  /** Punto de consulta de un lugar de referencia (no es un límite de parcela). */
  point: z.object({ lat: z.number(), lon: z.number() }).optional(),
})
export type Parcel = z.infer<typeof parcelSchema>
export const observationSchema = z.object({
  date: z.string(),
  temperature: z.number().nullable(),
  maximum: z.number().nullable(),
  minimum: z.number().nullable(),
  rain: z.number().nullable(),
  humidity: z.number().nullable(),
  soilMoisture: z.number().nullable().optional(),
  vegetation: z.number().nullable().optional(),
  surfaceTemperature: z.number().nullable().optional(),
  solarRadiation: z.number().nullable().optional(),
})
export type Observation = z.infer<typeof observationSchema>
export const evidenceSchema = z.object({
  source: z.string(),
  product: z.string(),
  period: z.string(),
  requestedAt: z.string(),
  url: z.string(),
  support: z.string(),
  units: z.record(z.string(), z.string()),
  origin: z.enum(['provider', 'synthetic']).default('provider'),
  cadence: z.string().default('Registro diario; muestra local sin actualización automática'),
  points: z.array(observationSchema),
})
export type Evidence = z.infer<typeof evidenceSchema>
export type Metric =
  | 'temperature'
  | 'rain'
  | 'humidity'
  | 'minimum'
  | 'maximum'
  | 'soilMoisture'
  | 'vegetation'
  | 'surfaceTemperature'
  | 'solarRadiation'
export type TimeGrouping = 'day' | 'week' | 'month'
export type ViewPeriod = 30 | 90 | 365
export const metricLabels: Record<Metric, string> = {
  temperature: 'Temperatura del aire',
  rain: 'Lluvia',
  humidity: 'Humedad del aire',
  minimum: 'Frío nocturno',
  maximum: 'Calor diurno',
  soilMoisture: 'Agua en el suelo',
  vegetation: 'Verdor de la vegetación',
  surfaceTemperature: 'Temperatura de superficie',
  solarRadiation: 'Radiación solar',
}
export const metricUnits: Record<Metric, string> = {
  temperature: '°C',
  rain: 'mm/día',
  humidity: '%',
  minimum: '°C',
  maximum: '°C',
  soilMoisture: '% vol.',
  vegetation: 'NDVI',
  surfaceTemperature: '°C',
  solarRadiation: 'MJ/m²/día',
}

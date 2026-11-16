// Repositorio de evidencia contra la API de TARPU (esquema mixto, DT-22): reemplaza a los datos de ejemplo.
// Capa 1: la celda de NASA POWER de la base de Arequipa. Capa 2: NDVI y temperatura de superficie de MODIS
// cuando el campo ya tiene su trabajo. Sin reglas agronómicas: solo copia valores con su fecha y unidad.
// Escrito con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
import { evidenceSchema } from '../types/domain'
import { mergeSatellite } from '../lib/satellite'
import type { Evidence, Observation, Parcel } from '../types/domain'
import type { EvidenceRepository } from './contracts'
import { evidenceRepository as localRepository } from './local'
import { API_BASE, baseParcel, parseCsv, rawFile, request } from './api'
import type { BaseParcel, Job, SourceResult } from './api'

/** Lo que devuelve la base para un contorno (POST /api/base/parcela) o para un punto (GET /api/base). */
export function readBase(parcel: Parcel, signal?: AbortSignal): Promise<BaseParcel | null> {
  if (parcel.boundary.length > 2) return baseParcel(parcel.boundary)
  if (parcel.point)
    return request<BaseParcel>(`/api/base?lat=${parcel.point.lat}&lon=${parcel.point.lon}`, {
      signal,
    })
  return Promise.resolve(null)
}

/** Trabajo de capa 2 ya existente para el centroide (o el punto), si lo hay. */
export async function jobAt(lat: number, lon: number): Promise<Job | null> {
  try {
    const response = await fetch(`${API_BASE}/api/trabajos/punto?lat=${lat}&lon=${lon}`)
    const body = (await response.json()) as { data?: Job | null }
    return body?.data ?? null
  } catch {
    return null
  }
}

export function centerOf(parcel: Parcel, base: BaseParcel | null) {
  const c = base?.centroide ?? (base as { punto?: { lat: number; lon: number } } | null)?.punto
  return c ?? parcel.point ?? null
}

export function modisFile(job: Job | null | undefined, product: string) {
  const modis = job?.fuentes.modis
  if (!modis || typeof modis === 'string') return undefined
  return (modis as SourceResult).productos?.[product]?.archivos?.normalizado
}

const cell = (text: string | undefined) => (text === undefined || text === '' ? null : Number(text))

/** Columnas del normalizado de POWER → campos de Observation (mismas unidades del proveedor). */
const POWER_COLUMNS: Record<string, keyof Observation> = {
  T2M: 'temperature',
  T2M_MAX: 'maximum',
  T2M_MIN: 'minimum',
  PRECTOTCORR: 'rain',
  RH2M: 'humidity',
  ALLSKY_SFC_SW_DWN: 'solarRadiation',
}

export function powerObservations(csv: string): Observation[] {
  const { columns, rows } = parseCsv(csv)
  const index = Object.fromEntries(columns.map((c, i) => [c.split(' (')[0], i]))
  return rows
    .filter((row) => row[0])
    .map((row) => {
      const point: Observation = {
        date: row[0],
        temperature: null,
        maximum: null,
        minimum: null,
        rain: null,
        humidity: null,
      }
      for (const [column, key] of Object.entries(POWER_COLUMNS))
        if (index[column] !== undefined)
          (point as unknown as Record<string, number | null>)[key] = cell(row[index[column]])
      return point
    })
}

/** Añade una serie de MODIS a los días que coinciden con la fecha de cada composición. */
function attach(
  points: Observation[],
  csv: string,
  column: (name: string) => boolean,
  key: 'vegetation' | 'surfaceTemperature',
  keep: (value: number, row: string[]) => number | null,
) {
  const { columns, rows } = parseCsv(csv)
  const v = columns.findIndex(column)
  if (v < 0) return 0
  return mergeSatellite(points, rows, v, key, keep)
}

const cache = new Map<string, Promise<BaseParcel | null>>()
const expires = new Map<string, number>()
export function invalidateBase() {
  cache.clear()
  expires.clear()
}
export function cachedBase(parcel: Parcel) {
  const key = `${parcel.id}:${JSON.stringify(parcel.boundary)}:${JSON.stringify(parcel.point)}`
  if ((expires.get(key) ?? 0) <= Date.now()) cache.delete(key)
  if (!cache.has(key)) {
    expires.set(key, Date.now() + 60_000)
    cache.set(
      key,
      readBase(parcel).catch((error) => {
        cache.delete(key)
        throw error
      }),
    )
  }
  return cache.get(key)!
}

export const remoteEvidenceRepository: EvidenceRepository = {
  async read(parcel, signal) {
    signal?.throwIfAborted()
    if (parcel.kind === 'example') return localRepository.read(parcel, signal)
    let base: BaseParcel | null
    try {
      base = await cachedBase(parcel)
    } catch {
      // Sin servidor: solo la muestra empaquetada de Majes sigue disponible.
      return localRepository.read(parcel, signal)
    }
    const path = base?.clima?.archivos?.normalizado
    if (!base || !path) return null
    const file = await rawFile(path)
    const points = powerObservations(file.contenido)
    const products = ['NASA POWER · Daily Point API, community AG']
    const units: Record<string, string> = {
      temperature: '°C',
      maximum: '°C',
      minimum: '°C',
      rain: 'mm/día',
      humidity: '%',
      solarRadiation: 'MJ/m²/día',
    }
    const center = centerOf(parcel, base)
    const job = center ? await jobAt(center.lat, center.lon) : null
    // Si un archivo de MODIS falla, se conserva el clima: solo esa serie queda sin dato.
    const leer = async (ruta: string) => {
      try {
        return (await rawFile(ruta)).contenido
      } catch {
        return null
      }
    }
    const ndvi = modisFile(job, 'MOD13Q1')
    const ndviCsv = ndvi ? await leer(ndvi) : null
    if (ndviCsv) {
      // Fiabilidad 2 (nieve o hielo) y 3 (nubes) quedan sin valor (MOD13 User Guide, pixel reliability).
      const n = attach(
        points,
        ndviCsv,
        (c) => c.includes('NDVI'),
        'vegetation',
        (value, row) => {
          const reliability = cell(row[2])
          return reliability === 0 || reliability === 1 ? value : null
        },
      )
      if (n) {
        products.push('MODIS MOD13Q1 v061 · NDVI 250 m cada 16 días')
        units.vegetation = 'NDVI'
      }
    }
    const lst = modisFile(job, 'MOD11A2')
    const lstCsv = lst ? await leer(lst) : null
    if (lstCsv) {
      // Kelvin → °C (resta de 273,15, conversión de unidades).
      const n = attach(
        points,
        lstCsv,
        (c) => c.startsWith('LST_Day'),
        'surfaceTemperature',
        (value) => Math.round((value - 273.15) * 100) / 100,
      )
      if (n) {
        products.push('MODIS MOD11A2 v061 · temperatura de superficie diurna, 1 km cada 8 días')
        units.surfaceTemperature = '°C'
      }
    }
    const evidence: Evidence = evidenceSchema.parse({
      source: products.length > 1 ? 'NASA POWER y MODIS' : 'NASA POWER',
      product: products.join(' · '),
      period: `${points[0]?.date} / ${points.at(-1)?.date}`,
      requestedAt: new Date().toISOString(),
      url: `${API_BASE}/api/archivo?ruta=${encodeURIComponent(path)}`,
      support:
        'Clima: celda de NASA POWER de ≈ 55 × 67 km que contiene tu campo; no es una medición dentro de la parcela.' +
        (products.length > 1
          ? ' Vegetación y superficie: píxel de MODIS que contiene el centro del campo.'
          : ''),
      units,
      origin: 'provider',
      cadence: 'Registro diario de POWER; MODIS cada 8 o 16 días. El servidor actualiza la serie.',
      points,
    })
    return evidence
  },
}

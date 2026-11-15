// Cliente de la API interna de TARPU (backend/tarpu_api). Sin claves: el backend guarda las credenciales.
// Escrito con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
import type { Coordinate } from './data'

/** Dirección de la API. En desarrollo, el backend local; al desplegar se fija con VITE_TARPU_API. */
export const API_BASE = (
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
    ?.VITE_TARPU_API ?? 'http://127.0.0.1:8000'
).replace(/\/$/, '')

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { 'content-type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor de TARPU. Revisa que esté encendido.',
      'sin_conexion',
    )
  }
  const body = (await response.json().catch(() => null)) as {
    data?: T
    error?: { codigo: string; mensaje: string }
  } | null
  if (!response.ok || !body || body.error)
    throw new ApiError(
      body?.error?.mensaje ?? `El servidor respondió ${response.status}.`,
      body?.error?.codigo ?? 'error',
    )
  return body.data as T
}

export function polygon(coordinates: Coordinate[]) {
  return { type: 'Polygon', coordinates: [coordinates] }
}

// ------------------------------------------------------------------ capa 1: base de Arequipa
export interface Provenance {
  fuente?: string
  producto?: string
  escala?: string
  metodo?: string
  nota?: string
  aviso?: string
  [key: string]: unknown
}
export interface SoilLayer {
  propiedad: string
  profundidad: string
  unidad: string
  valores_por_pixel: (number | null)[]
  crudos: (number | null)[]
  media: number | null
}
export interface Suitability {
  cultivo: string
  agua: string
  capa: string
  indice: number | null
}
export interface BaseParcel {
  estado: string
  motivo?: string
  centroide: { lat: number; lon: number }
  geometria?: {
    area_ha: number
    perimetro_m: number
    pixeles_modis_250m: number
    metodo: string
  }
  relieve?: {
    estado: string
    motivo?: string
    pixeles?: number
    altitud_m?: { min: number; media: number; max: number }
    pendiente_pct?: { min: number; mediana: number; max: number }
    clases_pendiente_pixeles?: Record<string, number>
    procedencia?: Provenance
  }
  sector?: {
    estado: string
    motivo?: string
    sector?: string
    nombre?: string
    pisos_inei?: Record<string, string>
    cultivos_principales?: string[]
    cultivos_ver_mas?: string[]
    procedencia?: Record<string, string>
  }
  suelo?: {
    estado: string
    motivo?: string
    pixeles?: number
    capas?: Record<string, SoilLayer>
    procedencia?: Provenance
  }
  aptitud?: {
    estado: string
    motivo?: string
    capas?: Suitability[]
    procedencia?: Provenance
  }
  clima?: {
    estado: string
    motivo?: string
    celda?: string
    centro?: [number, number]
    elevacion_celda_m?: number
    desde?: string
    hasta?: string
    dias_faltantes_por_variable?: Record<string, number>
    archivos?: Record<string, string>
    procedencia?: Provenance
  }
  avisos?: string[]
  cobertura?: Record<string, string>
}

export const baseParcel = (coordinates: Coordinate[]) =>
  request<BaseParcel>('/api/base/parcela', {
    method: 'POST',
    body: JSON.stringify({ contorno: polygon(coordinates) }),
  })

export interface SectorMap {
  limites_mapa: [[number, number], [number, number]]
  sectores: Record<string, { altitud_m: [number, number]; color_rgba: number[] }>
  fuera: { descripcion: string; color_rgba: number[] }
  metodo: string
  aviso: string
}
export const sectorMap = () => request<SectorMap>('/api/base/sectores')
export const sectorImage = `${API_BASE}/api/base/sectores.png`

// ------------------------------------------------------------------ capa 2: trabajos por coordenada
export interface ProductResult {
  estado: string
  motivo?: string | null
  archivos?: Record<string, string>
  vacios_del_proveedor?: unknown[]
  fallos_de_descarga?: unknown[]
  reutilizado_de?: string
}
export interface SourceResult {
  estado: string
  motivo?: string | null
  hasta?: string
  productos?: Record<string, ProductResult>
  archivos?: Record<string, string>
  [key: string]: unknown
}
export interface Job {
  clave: string
  nombre?: string
  estado: string
  motivo?: string | null
  punto: { lat: number; lon: number }
  parcela?: {
    area_ha: number
    perimetro_m: number
    contorno: { type: string; coordinates: Coordinate[][] }
  }
  fuentes: Record<string, SourceResult | string>
  creado?: string
  iniciado?: string
  terminado?: string
  actualizado?: string
}

/** Estados en los que el trabajo ya no avanza (docs/12). */
export const FINISHED = [
  'listo',
  'listo_con_vacios',
  'parcial',
  'error',
  'cancelado',
  'interrumpido',
]

export const startJob = (coordinates: Coordinate[], name?: string) =>
  request<Job>('/api/trabajos', {
    method: 'POST',
    body: JSON.stringify({
      contorno: polygon(coordinates),
      ...(name ? { nombre: name } : {}),
    }),
  })
export const job = (key: string) =>
  request<Job>(`/api/trabajos/${encodeURIComponent(key)}`)
export const jobs = () => request<Job[]>('/api/trabajos')
export const cancelJobs = (keys: string[]) =>
  request<unknown>('/api/trabajos/cancelar', {
    method: 'POST',
    body: JSON.stringify({ claves: keys }),
  })

// ------------------------------------------------------------------ datos detallados
export interface RawFile {
  ruta: string
  bytes: number
  recortado: boolean
  contenido: string
}
export const rawFile = (path: string) =>
  request<RawFile>(`/api/archivo?ruta=${encodeURIComponent(path)}`)

/** CSV simple de los normalizados de tarpu_datos (sin comas dentro de los valores). */
export function parseCsv(text: string) {
  const [head, ...lines] = text.trim().split(/\r?\n/)
  const columns = head.split(',')
  return {
    columns,
    rows: lines.map((line) => line.split(',')),
  }
}

/** Nombre aceptado por el backend para la carpeta del trabajo (letras, números, - y _). */
export function jobName(name: string) {
  return (
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || undefined
  )
}

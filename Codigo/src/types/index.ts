export type DashboardPage = 'overview' | 'parcels' | 'monitor' | 'climate' | 'rotations' | 'data' | 'reports'
/** `home` is the public landing; every other page lives inside the dashboard shell. */
export type Page = 'home' | DashboardPage
export type Period = 7 | 30 | 90
export type Metric = 'ndvi' | 'temperature' | 'precipitation'
export type ProcessingLevel = 'Normalizado' | 'Derivado'

export interface Parcel {
  id: string
  name: string
  location: string
  crop: string
  area: number
  color: string
  ndvi: number
  temperature: number
  moisture: number
  precipitation: number
  createdLocally?: boolean
}

export interface Observation {
  id: string
  date: string
  parcelId: string
  variable: Metric | 'moisture'
  value: number | null
  unit: string
  reference: string
  level: ProcessingLevel
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export interface SavedReport {
  id: string
  name: string
  createdAt: string
  parcelId: string
  period: Period
  snapshot: Parcel
}

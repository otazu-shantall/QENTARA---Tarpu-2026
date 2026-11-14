import { createContext, useContext } from 'react'
import type { Page, Parcel, Period, SavedReport } from '../types'

export interface Workspace {
  page: Page
  navigate: (page: Page) => void
  parcels: Parcel[]
  selectedId: string
  selectParcel: (id: string) => void
  current: Parcel
  period: Period
  setPeriod: (period: Period) => void
  openAgent: (question?: string) => void
  notify: (message: string) => void
  addParcel: (parcel: Parcel) => void
  reports: SavedReport[]
  saveReport: () => void
  printReport: (report?: SavedReport) => void
  openHelp: () => void
}

export const WorkspaceContext = createContext<Workspace | null>(null)
export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('Workspace provider is missing')
  return context
}

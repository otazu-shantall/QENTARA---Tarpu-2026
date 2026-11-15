// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useState, useEffect } from 'react'
import { WorkspaceContext } from './WorkspaceContext'
import type { ReactNode } from 'react'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { parcelSchema } from '../types/domain'
import type { Parcel, ViewPeriod } from '../types/domain'
import { evidenceRepository } from '../services/local'
import { selectPeriod } from '../lib/evidence'
import { exampleParcels } from '../data/scenarios'
import { boundaryError } from '../lib/geometry'

const reference: Parcel = {
  id: 'reference-majes',
  name: 'Majes',
  location: 'Arequipa · zona de referencia',
  kind: 'reference',
  boundary: [],
  crop: 'Sin registrar',
  irrigation: 'Sin registrar',
}
function readParcels() {
  try {
    const parsed = z
      .array(parcelSchema)
      .safeParse(JSON.parse(localStorage.getItem('tarpu.prototype.parcels') ?? '[]'))
    return parsed.success
      ? parsed.data.filter((p) => p.kind === 'declared' && !boundaryError(p.boundary))
      : []
  } catch {
    return []
  }
}
function useWorkspaceState() {
  const [parcels, setParcels] = useState<Parcel[]>(() => [
    ...exampleParcels,
    reference,
    ...readParcels(),
  ])
  const [selected, setSelected] = useState(() => {
    try {
      const saved = localStorage.getItem('tarpu.prototype.selected')
      return parcels.some((p) => p.id === saved) ? saved! : exampleParcels[0].id
    } catch {
      return exampleParcels[0].id
    }
  })
  const [period, setPeriod] = useState<ViewPeriod>(365)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('tarpu.prototype.theme') === 'dark' ? 'dark' : 'light',
  )
  const parcel = parcels.find((p) => p.id === selected) ?? reference
  const query = useQuery({
    queryKey: ['evidence', parcel.id],
    queryFn: ({ signal }) => evidenceRepository.read(parcel, signal),
    staleTime: Infinity,
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('tarpu.prototype.theme', theme)
  }, [theme])
  useEffect(() => {
    try {
      localStorage.setItem('tarpu.prototype.selected', selected)
    } catch {}
  }, [selected])
  useEffect(() => {
    setFrom('')
    setTo('')
  }, [selected])
  function addParcel(value: Omit<Parcel, 'id' | 'kind'>) {
    const error = boundaryError(value.boundary)
    if (error) throw new Error(error)
    const created = parcelSchema.parse({ ...value, id: crypto.randomUUID(), kind: 'declared' })
    const next = [...parcels, created]
    localStorage.setItem(
      'tarpu.prototype.parcels',
      JSON.stringify(next.filter((p) => p.kind === 'declared')),
    )
    setParcels(next)
    setSelected(created.id)
  }
  return {
    parcels,
    parcel,
    selectParcel: setSelected,
    addParcel,
    period,
    setPeriod,
    evidence: query.data ?? null,
    points: selectPeriod(query.data?.points ?? [], period).filter(
      (p) => (!from || p.date >= from) && (!to || p.date <= to),
    ),
    from,
    to,
    setFrom,
    setTo,
    loading: query.isPending,
    error: query.isError,
    retry: query.refetch,
    theme,
    setTheme,
    assistantOpen,
    setAssistantOpen,
  }
}
export type Workspace = ReturnType<typeof useWorkspaceState>
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const value = useWorkspaceState()
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
// 15/11/2026 (Claude Code): lugares de referencia reales leídos de la API y sin parcelas de ejemplo (DT-16).
import { useState, useEffect } from 'react'
import { WorkspaceContext } from './WorkspaceContext'
import type { ReactNode } from 'react'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { parcelSchema } from '../types/domain'
import type { Parcel, ViewPeriod } from '../types/domain'
import { remoteEvidenceRepository as evidenceRepository } from '../services/remote'
import { selectPeriod } from '../lib/evidence'
import { boundaryError } from '../lib/geometry'

// Puntos de consulta de los lugares de ejemplo (DT-22). Son puntos, no límites de parcela.
// Majes riego y Chivay: datos/; Cabanaconde: censo 2012, sector censal de Caylloma (trabajo/extraccion_pesada/README.md).
const references: Parcel[] = [
  {
    id: 'reference-majes',
    name: 'Majes',
    location: 'Costa · punto de riego',
    kind: 'reference',
    boundary: [],
    crop: 'Sin registrar',
    irrigation: 'Sin registrar',
    point: { lat: -16.367023, lon: -72.185771 },
  },
  {
    id: 'reference-cabanaconde',
    name: 'Cabanaconde',
    location: 'Valle interandino · Caylloma',
    kind: 'reference',
    boundary: [],
    crop: 'Sin registrar',
    irrigation: 'Sin registrar',
    point: { lat: -15.612386, lon: -71.984857 },
  },
  {
    id: 'reference-chivay',
    name: 'Chivay',
    location: 'Altura · Caylloma',
    kind: 'reference',
    boundary: [],
    crop: 'Sin registrar',
    irrigation: 'Sin registrar',
    point: { lat: -15.64, lon: -71.6 },
  },
]
const reference = references[0]
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
    ...references,
    ...readParcels(),
  ])
  const [selected, setSelected] = useState(() => {
    try {
      const saved = localStorage.getItem('tarpu.prototype.selected')
      return parcels.some((p) => p.id === saved) ? saved! : reference.id
    } catch {
      return reference.id
    }
  })
  const [period, setPeriod] = useState<ViewPeriod>(365)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [assistantOpen, setAssistantOpen] = useState(false)
  // Pregunta con la que se abre el asistente (desde «Explorar con Yachaq» de una tarjeta).
  const [assistantQuestion, setAssistantQuestion] = useState('')
  // Recorrido guiado: se abre solo la primera vez (se recuerda en este navegador).
  const [tourOpen, setTourOpen] = useState(false)
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
    assistantQuestion,
    askAssistant: (question: string) => {
      setAssistantQuestion(question)
      setAssistantOpen(true)
    },
    clearAssistantQuestion: () => setAssistantQuestion(''),
    tourOpen,
    startTour: () => setTourOpen(true),
    closeTour: () => {
      setTourOpen(false)
      try {
        localStorage.setItem('tarpu.tour.visto', '1')
      } catch {}
    },
  }
}
export type Workspace = ReturnType<typeof useWorkspaceState>
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const value = useWorkspaceState()
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

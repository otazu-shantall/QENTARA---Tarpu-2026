// Datos de la parcela activa que no son series: capa 1 (relieve, suelo, zona y cultivos del censo) y el trabajo
// de capa 2 (extracción satelital por coordenada, con seguimiento y detención). Traído de Codigo/src/nuevo/fieldData.ts.
// Escrito con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ApiError, FINISHED, cancelJobs, job as getJob, jobName, parseCsv, rawFile, startJob, startJobAt } from './api'
import type { BaseParcel, Job } from './api'
import { cachedBase, centerOf, jobAt, modisFile } from './remote'
import type { Parcel } from '../types/domain'

export interface Loadable<T> {
  state: 'idle' | 'loading' | 'ok' | 'error'
  data?: T
  error?: string
}
export interface ParcelData {
  base: Loadable<BaseParcel>
  job: Loadable<Job>
  landCover: { date: string; code: number } | null
  running: boolean
  /** Ya se pidió la extracción completa (o el servidor ya tenía el trabajo de este lugar). */
  extracted: boolean
  extract: () => void
  cancel: () => void
  retry: () => void
}

const message = (error: unknown) =>
  error instanceof ApiError ? error.message : 'Error inesperado al leer el servidor.'

export function useParcelData(parcel: Parcel): ParcelData {
  const [base, setBase] = useState<Loadable<BaseParcel>>({ state: 'idle' })
  const [job, setJob] = useState<Loadable<Job>>({ state: 'idle' })
  const [landCover, setLandCover] = useState<{ date: string; code: number } | null>(null)
  const [attempt, setAttempt] = useState(0)
  const current = useRef(parcel.id)
  current.current = parcel.id
  const queryClient = useQueryClient()
  const remote = parcel.kind !== 'example'

  useEffect(() => {
    setBase({ state: 'idle' })
    setJob({ state: 'idle' })
    setLandCover(null)
    if (!remote) return
    const mine = parcel.id
    setBase({ state: 'loading' })
    cachedBase(parcel)
      .then(async (data) => {
        if (current.current !== mine || !data) return
        setBase({ state: 'ok', data })
        const center = centerOf(parcel, data)
        if (!center) return
        const found = await jobAt(center.lat, center.lon)
        if (current.current === mine && found) setJob({ state: 'ok', data: found })
      })
      .catch((error) => {
        if (current.current === mine) setBase({ state: 'error', error: message(error) })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parcel.id, attempt])

  const key = job.data?.clave
  const state = job.data?.estado
  const running = !!state && !FINISHED.includes(state)
  useEffect(() => {
    if (!key || !running) return
    const mine = parcel.id
    const timer = setInterval(() => {
      getJob(key)
        .then((data) => {
          if (current.current !== mine) return
          setJob({ state: 'ok', data })
          // Al terminar, la serie de la parcela incorpora MODIS.
          if (FINISHED.includes(data.estado))
            void queryClient.invalidateQueries({ queryKey: ['evidence', mine] })
        })
        .catch(() => undefined)
    }, 3000)
    return () => clearInterval(timer)
  }, [key, running, parcel.id, queryClient])

  const cover = modisFile(job.data, 'MCD12Q1')
  useEffect(() => {
    if (!cover) return
    const mine = parcel.id
    rawFile(cover)
      .then((file) => {
        const last = [...parseCsv(file.contenido).rows].reverse().find((row) => row[1] !== '')
        if (current.current === mine && last) setLandCover({ date: last[0], code: Number(last[1]) })
      })
      .catch(() => undefined)
  }, [cover, parcel.id])

  const extract = useCallback(() => {
    const mine = parcel.id
    setJob((previous) => ({ state: 'loading', data: previous.data }))
    const center = centerOf(parcel, base.data ?? null)
    const request =
      parcel.boundary.length > 2
        ? startJob(parcel.boundary, jobName(parcel.name))
        : center
          ? startJobAt(center.lat, center.lon, jobName(parcel.name))
          : null
    if (!request) {
      setJob({ state: 'error', error: 'Falta la ubicación de este lugar.' })
      return
    }
    request
      .then((data) => {
        if (current.current === mine) setJob({ state: 'ok', data })
      })
      .catch((error) => {
        if (current.current === mine) setJob({ state: 'error', error: message(error) })
      })
  }, [parcel, base.data])

  const cancel = useCallback(() => {
    if (!key) return
    cancelJobs([key])
      .then(() => getJob(key))
      .then((data) => setJob({ state: 'ok', data }))
      .catch((error) => setJob((previous) => ({ ...previous, error: message(error) })))
  }, [key])

  return {
    base,
    job,
    landCover,
    running,
    extracted: !!job.data || job.state === 'loading',
    extract,
    cancel,
    retry: () => setAttempt((n) => n + 1),
  }
}

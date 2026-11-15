// Datos reales de un campo dibujado: capa 1 (base de Arequipa) y capa 2 (trabajo por coordenada).
// Solo lee y agrega lo que devuelve la API; no aplica reglas agronómicas (Codigo/AGENTS.md).
// Escrito con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ApiError,
  FINISHED,
  baseParcel,
  cancelJobs,
  job as getJob,
  jobName,
  parseCsv,
  rawFile,
  startJob,
  API_BASE,
} from './api'
import type { BaseParcel, Job, SourceResult } from './api'
import type { Field } from './data'

export interface Loadable<T> {
  state: 'idle' | 'loading' | 'ok' | 'error'
  data?: T
  error?: string
}

export interface ClimateYear {
  year: number
  temperature: number | null
  rain: number | null
  monthlyTemperature: (number | null)[]
  monthlyRain: (number | null)[]
  days: number
  missingTemperature: number
  missingRain: number
}

export interface NdviPoint {
  date: string
  value: number | null
  reliability: number | null
}

export interface FieldData {
  base: Loadable<BaseParcel>
  climate: Loadable<ClimateYear>
  job: Loadable<Job>
  ndvi: Loadable<NdviPoint[]>
  landCover: Loadable<{ date: string; code: number }>
  running: boolean
  extract: () => void
  cancel: () => void
  retry: () => void
}

const value = (text: string | undefined) =>
  text === undefined || text === '' ? null : Number(text)

/** Último año calendario completo de la serie diaria de POWER (media de días y suma de lluvia). */
export function climateYear(csv: string): ClimateYear | null {
  const { columns, rows } = parseCsv(csv)
  const date = columns.indexOf('fecha')
  const t = columns.findIndex((c) => c.startsWith('T2M ('))
  const p = columns.findIndex((c) => c.startsWith('PRECTOTCORR ('))
  if (date < 0 || t < 0 || p < 0) return null
  const years = rows
    .filter((row) => row[date].endsWith('-12-31'))
    .map((row) => Number(row[date].slice(0, 4)))
  const year = Math.max(...years)
  if (!Number.isFinite(year)) return null
  const inYear = rows.filter((row) => row[date].startsWith(`${year}-`))
  const temps = inYear.map((row) => value(row[t]))
  const rains = inYear.map((row) => value(row[p]))
  const meanOf = (list: (number | null)[]) => {
    const ok = list.filter((v): v is number => v !== null)
    return ok.length ? ok.reduce((a, b) => a + b, 0) / ok.length : null
  }
  const sumOf = (list: (number | null)[]) =>
    list.length && list.every((v) => v !== null)
      ? (list as number[]).reduce((a, b) => a + b, 0)
      : null
  const month = (m: number) =>
    inYear.filter((row) => Number(row[date].slice(5, 7)) === m + 1)
  return {
    year,
    temperature: meanOf(temps),
    rain: sumOf(rains),
    monthlyTemperature: Array.from({ length: 12 }, (_, m) =>
      meanOf(month(m).map((row) => value(row[t]))),
    ),
    monthlyRain: Array.from({ length: 12 }, (_, m) =>
      sumOf(month(m).map((row) => value(row[p]))),
    ),
    days: inYear.length,
    missingTemperature: temps.filter((v) => v === null).length,
    missingRain: rains.filter((v) => v === null).length,
  }
}

export function modisFile(job: Job | undefined, product: string) {
  const modis = job?.fuentes.modis
  if (!modis || typeof modis === 'string') return undefined
  return (modis as SourceResult).productos?.[product]?.archivos?.normalizado
}

export function useFieldData(field: Field | null): FieldData {
  const [base, setBase] = useState<Loadable<BaseParcel>>({ state: 'idle' })
  const [climate, setClimate] = useState<Loadable<ClimateYear>>({ state: 'idle' })
  const [job, setJob] = useState<Loadable<Job>>({ state: 'idle' })
  const [ndvi, setNdvi] = useState<Loadable<NdviPoint[]>>({ state: 'idle' })
  const [landCover, setLandCover] = useState<
    Loadable<{ date: string; code: number }>
  >({ state: 'idle' })
  const [attempt, setAttempt] = useState(0)
  const current = useRef<string | null>(null)
  const id = field?.id ?? null
  current.current = id

  const message = (error: unknown) =>
    error instanceof ApiError ? error.message : 'Error inesperado al leer la API.'

  // Capa 1 al abrir el campo; también busca si ya hay un trabajo para su centroide.
  useEffect(() => {
    setBase({ state: 'idle' })
    setClimate({ state: 'idle' })
    setJob({ state: 'idle' })
    setNdvi({ state: 'idle' })
    setLandCover({ state: 'idle' })
    if (!field) return
    const mine = field.id
    setBase({ state: 'loading' })
    baseParcel(field.coordinates)
      .then(async (data) => {
        if (current.current !== mine) return
        setBase({ state: 'ok', data })
        const { lat, lon } = data.centroide
        fetch(`${API_BASE}/api/trabajos/punto?lat=${lat}&lon=${lon}`)
          .then((r) => r.json())
          .then((body: { data?: Job | null }) => {
            if (current.current === mine && body?.data)
              setJob({ state: 'ok', data: body.data })
          })
          .catch(() => undefined)
        const path = data.clima?.archivos?.normalizado
        if (!path) {
          setClimate({
            state: 'error',
            error: data.clima?.motivo ?? 'La celda de clima no está en la base.',
          })
          return
        }
        setClimate({ state: 'loading' })
        try {
          const file = await rawFile(path)
          const summary = climateYear(file.contenido)
          if (current.current !== mine) return
          setClimate(
            summary
              ? { state: 'ok', data: summary }
              : { state: 'error', error: 'La serie no trae un año completo.' },
          )
        } catch (error) {
          if (current.current === mine)
            setClimate({ state: 'error', error: message(error) })
        }
      })
      .catch((error) => {
        if (current.current === mine) setBase({ state: 'error', error: message(error) })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, attempt])

  // Seguimiento del trabajo mientras no termina.
  const jobKey = job.data?.clave
  const jobState = job.data?.estado
  const running = !!jobState && !FINISHED.includes(jobState)
  useEffect(() => {
    if (!jobKey || !running) return
    const mine = id
    const timer = setInterval(() => {
      getJob(jobKey)
        .then((data) => {
          if (current.current === mine) setJob({ state: 'ok', data })
        })
        .catch(() => undefined)
    }, 3000)
    return () => clearInterval(timer)
  }, [jobKey, running, id])

  // NDVI y cobertura en cuanto MODIS deja sus archivos normalizados.
  const ndviPath = modisFile(job.data, 'MOD13Q1')
  const coverPath = modisFile(job.data, 'MCD12Q1')
  useEffect(() => {
    if (!ndviPath) return
    const mine = id
    setNdvi({ state: 'loading' })
    rawFile(ndviPath)
      .then((file) => {
        const { columns, rows } = parseCsv(file.contenido)
        const v = columns.findIndex((c) => c.includes('NDVI'))
        const q = columns.findIndex((c) => c.includes('pixel_reliability'))
        const data = rows.map((row) => ({
          date: row[0],
          value: value(row[v]),
          reliability: q < 0 ? null : value(row[q]),
        }))
        if (current.current === mine) setNdvi({ state: 'ok', data })
      })
      .catch((error) => {
        if (current.current === mine) setNdvi({ state: 'error', error: message(error) })
      })
  }, [ndviPath, id])
  useEffect(() => {
    if (!coverPath) return
    const mine = id
    rawFile(coverPath)
      .then((file) => {
        const { rows } = parseCsv(file.contenido)
        const last = [...rows].reverse().find((row) => row[1] !== '')
        if (current.current === mine && last)
          setLandCover({ state: 'ok', data: { date: last[0], code: Number(last[1]) } })
      })
      .catch(() => undefined)
  }, [coverPath, id])

  const extract = useCallback(() => {
    if (!field) return
    const mine = field.id
    setJob({ state: 'loading', data: job.data })
    startJob(field.coordinates, jobName(field.name))
      .then((data) => {
        if (current.current === mine) setJob({ state: 'ok', data })
      })
      .catch((error) => {
        if (current.current === mine) setJob({ state: 'error', error: message(error) })
      })
  }, [field, job.data])

  const cancel = useCallback(() => {
    if (!jobKey) return
    cancelJobs([jobKey])
      .then(() => getJob(jobKey))
      .then((data) => setJob({ state: 'ok', data }))
      .catch((error) => setJob((prev) => ({ ...prev, error: message(error) })))
  }, [jobKey])

  return {
    base,
    climate,
    job,
    ndvi,
    landCover,
    running,
    extract,
    cancel,
    retry: () => setAttempt((n) => n + 1),
  }
}

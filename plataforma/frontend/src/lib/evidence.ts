// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import type { Observation, ViewPeriod } from '../types/domain.ts'
export const number = (value: number | null, decimals = 1) =>
  value === null
    ? 'Sin dato'
    : value.toLocaleString('es-PE', {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      })
export function selectPeriod(points: Observation[], period: ViewPeriod) {
  if (!points.length) return []
  const last = new Date(points.at(-1)!.date + 'T00:00:00Z')
  last.setUTCDate(last.getUTCDate() - period + 1)
  return points.filter((point) => point.date >= last.toISOString().slice(0, 10))
}
export function mean(values: (number | null)[]) {
  const valid = values.filter((v): v is number => v !== null)
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null
}
export function summarize(points: Observation[]) {
  const rainfall = points.map((p) => p.rain).filter((v): v is number => v !== null)
  return {
    temperature: mean(points.map((p) => p.temperature)),
    humidity: mean(points.map((p) => p.humidity)),
    rain: rainfall.length ? rainfall.reduce((a, b) => a + b, 0) : null,
    rainValid: rainfall.length,
    count: points.length,
  }
}
export function csv(points: Observation[]) {
  return (
    '\uFEFFfecha,temperatura_aire_C,lluvia_mm_dia,humedad_relativa_pct,fuente\r\n' +
    points
      .map((p) =>
        [p.date, p.temperature ?? '', p.rain ?? '', p.humidity ?? '', 'NASA POWER'].join(','),
      )
      .join('\r\n')
  )
}
export function download(content: string, filename: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

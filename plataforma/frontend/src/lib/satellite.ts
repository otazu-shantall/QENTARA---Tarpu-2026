// Series con calendarios independientes. Asistencia de IA (Codex), registro en entrega/uso-de-ia.md.
import type { Observation } from '../types/domain.ts'

export function mergeSatellite(
  points: Observation[],
  rows: string[][],
  valueIndex: number,
  key: 'vegetation' | 'surfaceTemperature',
  convert: (value: number, row: string[]) => number | null,
) {
  const dates = new Map(points.map((point) => [point.date, point]))
  let valid = 0
  for (const row of rows) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row[0] ?? '') || !row[valueIndex]?.trim()) continue
    const value = Number(row[valueIndex])
    if (!Number.isFinite(value)) continue
    const point = dates.get(row[0]) ?? {
      date: row[0],
      temperature: null,
      minimum: null,
      maximum: null,
      rain: null,
      humidity: null,
    }
    point[key] = convert(value, row)
    if (point[key] !== null) valid++
    dates.set(point.date, point)
  }
  points.splice(
    0,
    points.length,
    ...[...dates.values()].sort((a, b) => a.date.localeCompare(b.date)),
  )
  return valid
}

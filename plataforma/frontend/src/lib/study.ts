// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import type { Evidence, Metric, Observation, Parcel, TimeGrouping } from '../types/domain.ts'
import { metricLabels, metricUnits } from '../types/domain.ts'
import { mean } from './evidence.ts'
import { toGeoJSON } from './geometry.ts'

export const metrics = Object.keys(metricLabels) as Metric[]
export function aggregateSeries(points: Observation[], metric: Metric, grouping: TimeGrouping) {
  const groups = new Map<string, Observation[]>()
  for (const point of points) {
    let key = point.date
    if (grouping === 'month') key = point.date.slice(0, 7) + '-01'
    if (grouping === 'week') {
      const day = new Date(point.date + 'T00:00:00Z')
      day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7))
      key = day.toISOString().slice(0, 10)
    }
    groups.set(key, [...(groups.get(key) ?? []), point])
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, records]) => {
      const values = records.map((p) => p[metric] ?? null).filter((v): v is number => v !== null)
      return {
        date,
        value: !values.length
          ? null
          : metric === 'rain'
            ? values.reduce((a, b) => a + b, 0)
            : mean(values),
        valid: values.length,
        total: records.length,
      }
    })
}
export function studyExport(evidence: Evidence, parcel: Parcel, points: Observation[]) {
  return {
    metadata: {
      parcel: { id: parcel.id, name: parcel.name, geometryKind: parcel.kind },
      origin: evidence.origin,
      source: evidence.source,
      product: evidence.product,
      sourcePeriod: evidence.period,
      selection: {
        from: points[0]?.date ?? null,
        to: points.at(-1)?.date ?? null,
        count: points.length,
      },
      requestedAt: evidence.requestedAt,
      units: evidence.units,
      level: 'normalizado',
      cadence: evidence.cadence,
      warning: evidence.support,
      sourceUrl: evidence.url || null,
      missingValue: null,
      ai_assistance:
        'Código y empaquetado asistidos por IA. Los escenarios sintéticos se identifican en origin.',
    },
    records: points.map((point) => ({
      date: point.date,
      ...Object.fromEntries(metrics.map((metric) => [metric, point[metric] ?? null])),
    })),
  }
}
const cell = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`
export function studyCSV(evidence: Evidence, parcel: Parcel, points: Observation[]) {
  return (
    '\uFEFF' +
    [
      [
        'fecha',
        ...metrics.map((m) => `${m} [${metricUnits[m]}]`),
        'parcela',
        'origen',
        'fuente',
        'advertencia',
      ]
        .map(cell)
        .join(','),
      ...points.map((p) =>
        [
          p.date,
          ...metrics.map((m) => p[m]),
          parcel.id,
          evidence.origin,
          evidence.source,
          evidence.support,
        ]
          .map(cell)
          .join(','),
      ),
    ].join('\r\n')
  )
}
export function parcelGeoJSON(parcel: Parcel) {
  return {
    type: 'Feature' as const,
    geometry: toGeoJSON(parcel.boundary),
    properties: {
      id: parcel.id,
      name: parcel.name,
      origin: parcel.kind === 'example' ? 'synthetic' : 'declared',
      warning: 'Contorno de referencia; no acredita propiedad ni precisión catastral.',
    },
  }
}

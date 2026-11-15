// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useId, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Metric, Observation, TimeGrouping } from '../../types/domain'
import { metricLabels, metricUnits } from '../../types/domain'
import { aggregateSeries } from '../../lib/study'
import { number, mean } from '../../lib/evidence'
type ChartKind = 'auto' | 'area' | 'line' | 'bar'
const accents: Record<Metric, { color: string; name: string; auto: ChartKind }> = {
  temperature: { color: 'var(--chart-heat)', name: 'Temperatura', auto: 'area' },
  minimum: { color: 'var(--chart-cold)', name: 'Frío nocturno', auto: 'area' },
  maximum: { color: 'var(--chart-hot)', name: 'Calor diurno', auto: 'line' },
  rain: { color: 'var(--chart-rain)', name: 'Lluvia', auto: 'bar' },
  humidity: { color: 'var(--chart-water)', name: 'Humedad del aire', auto: 'area' },
  soilMoisture: { color: 'var(--chart-soil)', name: 'Agua en el suelo', auto: 'area' },
  vegetation: { color: 'var(--chart-vegetation)', name: 'Vegetación', auto: 'area' },
  surfaceTemperature: { color: 'var(--chart-hot)', name: 'Superficie', auto: 'area' },
  solarRadiation: { color: 'var(--chart-sun)', name: 'Radiación', auto: 'bar' },
}
export function TimelineChart({
  points,
  metric = 'temperature',
  grouping = 'month',
}: {
  points: Observation[]
  metric?: Metric
  grouping?: TimeGrouping
}) {
  const [kind, setKind] = useState<ChartKind>('auto')
  const unique = useId().replace(/[^a-zA-Z0-9]/g, ''),
    gradient = `chart-${unique}`
  const series = aggregateSeries(points, metric, grouping),
    valid = series.flatMap((p) => (p.value === null ? [] : [p.value]))
  const theme = accents[metric],
    actual = kind === 'auto' ? theme.auto : kind
  const span = valid.length ? Math.max(...valid) - Math.min(...valid) : 1,
    pad = Math.max(span * 0.12, metric === 'vegetation' ? 0.05 : 1)
  const low =
    metric === 'vegetation'
      ? 0
      : ['rain', 'humidity', 'soilMoisture', 'solarRadiation'].includes(metric)
        ? 0
        : Math.floor(Math.min(...valid) - pad)
  const high =
    metric === 'vegetation'
      ? 1
      : ['humidity', 'soilMoisture'].includes(metric)
        ? 100
        : Math.max(low + 1, Math.ceil(Math.max(...valid) + pad))
  const x = (i: number) => 52 + (i * 530) / Math.max(series.length - 1, 1),
    y = (v: number) => 166 - ((v - low) / (high - low)) * 132
  const unit = metric === 'rain' ? 'mm' : metricUnits[metric]
  const segments: { x: number; y: number }[][] = []
  let current: { x: number; y: number }[] = []
  series.forEach((p, i) => {
    if (p.value === null) {
      if (current.length) segments.push(current)
      current = []
    } else current.push({ x: x(i), y: y(p.value) })
  })
  if (current.length) segments.push(current)
  const path = (segment: { x: number; y: number }[]) =>
    segment.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ')
  return (
    <div className="timeline-visual" style={{ '--series-color': theme.color } as CSSProperties}>
      <div className="chart-toolbar">
        <span className="chart-series-label">
          <i />
          {theme.name}
        </span>
        <div className="chart-type-picker" role="group" aria-label="Tipo de gráfico">
          {(
            [
              ['auto', 'Auto'],
              ['area', 'Área'],
              ['line', 'Líneas'],
              ['bar', 'Barras'],
            ] as const
          ).map(([key, label]) => (
            <button key={key} aria-pressed={kind === key} onClick={() => setKind(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {!valid.length ? (
        <div className="empty-chart">Sin observaciones para esta variable y selección.</div>
      ) : (
        <>
          <div className="chart-wrap">
            <svg
              viewBox="0 0 630 215"
              role="img"
              aria-label={`${metricLabels[metric]}, agrupación por ${grouping === 'day' ? 'día' : grouping === 'week' ? 'semana' : 'mes'}. ${metric === 'rain' ? 'Lluvia acumulada' : 'Promedio de valores disponibles'}. Gráfico de ${actual === 'bar' ? 'barras' : actual === 'area' ? 'área' : 'líneas'}.`}
            >
              <defs>
                <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.color} stopOpacity=".35" />
                  <stop offset="100%" stopColor={theme.color} stopOpacity=".025" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((i) => (
                <g key={i}>
                  <line
                    x1="52"
                    x2="596"
                    y1={34 + i * 44}
                    y2={34 + i * 44}
                    stroke="var(--line)"
                    strokeDasharray="3 5"
                  />
                  <text x="0" y={39 + i * 44}>
                    {number(high - (i * (high - low)) / 3, metric === 'vegetation' ? 2 : 0)}
                  </text>
                </g>
              ))}
              {actual === 'area' &&
                segments.map((segment, i) => (
                  <path
                    key={i}
                    d={`${path(segment)}L${segment.at(-1)!.x},166 L${segment[0].x},166 Z`}
                    fill={`url(#${gradient})`}
                  />
                ))}
              {actual !== 'bar' &&
                segments.map((segment, i) => (
                  <path
                    key={i}
                    d={path(segment)}
                    fill="none"
                    stroke={theme.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              {series.map((p, i) => (
                <g key={p.date}>
                  {p.value !== null &&
                    (actual === 'bar' ? (
                      <rect
                        x={x(i) - Math.min(25, (530 / Math.max(series.length, 1)) * 0.56) / 2}
                        y={y(p.value)}
                        width={Math.max(1, Math.min(25, (530 / Math.max(series.length, 1)) * 0.56))}
                        height={Math.max(1, 166 - y(p.value))}
                        rx={series.length > 50 ? 0 : 3}
                        fill={theme.color}
                        opacity={0.55 + (0.4 * i) / Math.max(series.length - 1, 1)}
                      >
                        <title>
                          {p.date}: {number(p.value)} {unit} · {p.valid}/{p.total} válidos
                        </title>
                      </rect>
                    ) : (
                      <circle
                        cx={x(i)}
                        cy={y(p.value)}
                        r={series.length > 40 ? 2 : 4}
                        fill="var(--surface)"
                        stroke={theme.color}
                        strokeWidth="2"
                      >
                        <title>
                          {p.date}: {number(p.value, metric === 'vegetation' ? 2 : 1)} {unit} ·{' '}
                          {p.valid}/{p.total} válidos
                        </title>
                      </circle>
                    ))}
                  {(i % Math.ceil(series.length / 6) === 0 || i === series.length - 1) && (
                    <text x={x(i)} y="197" textAnchor="middle">
                      {new Date(p.date + 'T00:00:00Z').toLocaleDateString('es-PE', {
                        day: grouping === 'month' ? undefined : 'numeric',
                        month: 'short',
                        timeZone: 'UTC',
                      })}
                    </text>
                  )}
                </g>
              ))}
            </svg>
            <span className="chart-unit">
              {metric === 'rain' ? 'Acumulados' : 'Promedios'} por{' '}
              {grouping === 'day' ? 'día' : grouping === 'week' ? 'semana' : 'mes'} · {unit}
            </span>
          </div>
          <div className="chart-range-summary">
            <span>
              Menor intervalo{' '}
              <strong>
                {number(Math.min(...valid), metric === 'vegetation' ? 2 : 1)} <small>{unit}</small>
              </strong>
            </span>
            <span>
              {metric === 'rain' ? 'Media por intervalo' : 'Promedio de intervalos'}
              <strong>
                {number(mean(valid), metric === 'vegetation' ? 2 : 1)} <small>{unit}</small>
              </strong>
            </span>
            <span>
              Mayor intervalo
              <strong>
                {number(Math.max(...valid), metric === 'vegetation' ? 2 : 1)} <small>{unit}</small>
              </strong>
            </span>
          </div>
        </>
      )}
    </div>
  )
}

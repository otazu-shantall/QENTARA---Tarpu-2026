// Historial: cada mes del año elegido frente al promedio y al rango de todos los años disponibles.
// Solo medias y sumas de los registros (sin interpolar; un mes incompleto se marca y no se suma como si fuera completo).
// Rehecho el 15/11/2026 con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useWorkspace } from '../../app/WorkspaceContext'
import type { Metric, Observation } from '../../types/domain'
import { number } from '../../lib/evidence'
import { Icon } from '../../components/ui/Icon'
import type { IconName } from '../../components/ui/Icon'
import { AGENT } from '../../lib/agent'

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const LONG = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
interface Variable {
  key: Metric
  label: string
  unit: string
  icon: IconName
  color: string
  /** suma (lluvia) o media */
  sum?: boolean
  /** diaria: un mes solo está completo con todos sus días */
  daily: boolean
  about: string
  anchor: string
}
const VARIABLES: Variable[] = [
  { key: 'temperature', label: 'Temperatura del aire', unit: '°C', icon: 'temperature', color: '#d98a4e', daily: true, about: 'Media de la temperatura de cada día del mes.', anchor: 'power' },
  { key: 'minimum', label: 'Frío de la noche', unit: '°C', icon: 'snow', color: '#5b8fc4', daily: true, about: 'Media de la temperatura mínima de cada día.', anchor: 'power' },
  { key: 'maximum', label: 'Calor del día', unit: '°C', icon: 'sun', color: '#c9603f', daily: true, about: 'Media de la temperatura máxima de cada día.', anchor: 'power' },
  { key: 'rain', label: 'Lluvia', unit: 'mm', icon: 'rain', color: '#3f86b8', sum: true, daily: true, about: 'Suma de la lluvia de todos los días del mes.', anchor: 'power' },
  { key: 'humidity', label: 'Humedad del aire', unit: '%', icon: 'humidity', color: '#4aa3a0', daily: true, about: 'Media de la humedad relativa del aire.', anchor: 'power' },
  { key: 'solarRadiation', label: 'Energía del sol', unit: 'MJ/m²', icon: 'sun', color: '#d6a531', daily: true, about: 'Media de la radiación solar diaria.', anchor: 'power' },
  { key: 'vegetation', label: 'Verdor (NDVI)', unit: '', icon: 'leaf', color: '#4f8a4c', daily: false, about: 'Media de las observaciones del satélite en el mes (una cada 16 días).', anchor: 'modis' },
  { key: 'surfaceTemperature', label: 'Temperatura de la superficie', unit: '°C', icon: 'temperature', color: '#b0563b', daily: false, about: 'Media de las observaciones del satélite en el mes (una cada 8 días).', anchor: 'modis' },
]
interface Cell {
  value: number | null
  complete: boolean
  count: number
}
const daysIn = (year: number, month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

/** año → 12 celdas mensuales de la variable */
function monthly(points: Observation[], variable: Variable) {
  const table = new Map<number, { sum: number; n: number }[]>()
  for (const p of points) {
    const v = p[variable.key]
    if (v == null) continue
    const year = Number(p.date.slice(0, 4))
    const month = Number(p.date.slice(5, 7)) - 1
    if (!table.has(year)) table.set(year, Array.from({ length: 12 }, () => ({ sum: 0, n: 0 })))
    const cell = table.get(year)![month]
    cell.sum += v
    cell.n++
  }
  const result = new Map<number, Cell[]>()
  for (const [year, cells] of table)
    result.set(
      year,
      cells.map((c, month) => {
        const complete = variable.daily ? c.n === daysIn(year, month) : c.n > 0
        return {
          count: c.n,
          complete,
          // La lluvia de un mes incompleto no se muestra como total.
          value: c.n === 0 || (variable.sum && !complete) ? null : variable.sum ? c.sum : c.sum / c.n,
        }
      }),
    )
  return result
}

export function HistoryPage() {
  const { parcel, evidence, loading, askAssistant } = useWorkspace()
  const points = evidence?.points ?? []
  const available = useMemo(
    () => VARIABLES.filter((v) => points.some((p) => p[v.key] != null)),
    [points],
  )
  const [key, setKey] = useState<Metric>('temperature')
  const variable = available.find((v) => v.key === key) ?? available[0]
  const table = useMemo(() => (variable ? monthly(points, variable) : new Map<number, Cell[]>()), [points, variable])
  const years = [...table.keys()].sort((a, b) => a - b)
  const [chosen, setChosen] = useState<number | null>(null)
  const year = chosen && table.has(chosen) ? chosen : (years.at(-1) ?? null)

  if (loading) return <p className="api-waiting">Leyendo el historial…</p>
  if (!variable || year === null)
    return (
      <section className="card">
        <h2>Todavía no hay historial para {parcel.name}</h2>
        <p>
          Ve a <Link to="/app">Mi campo</Link> y pulsa «Extraer datos completos».
        </p>
      </section>
    )

  // Promedio y rango de cada mes con los años en que ese mes está completo.
  const stats = MONTHS.map((_, month) => {
    const values = years
      .map((y) => table.get(y)![month])
      .filter((c) => c.complete && c.value !== null)
      .map((c) => c.value as number)
    return values.length
      ? { mean: values.reduce((a, b) => a + b, 0) / values.length, min: Math.min(...values), max: Math.max(...values), n: values.length }
      : null
  })
  const row = table.get(year)!
  const all = [...stats.flatMap((s) => (s ? [s.min, s.max] : [])), ...row.flatMap((c) => (c.value !== null ? [c.value] : []))]
  const low = variable.sum ? 0 : Math.min(...all)
  const high = Math.max(...all)
  const pad = (high - low) * 0.1 || 1
  const y0 = variable.sum ? 0 : low - pad
  const y1 = high + pad
  const W = 760, H = 300, L = 46, B = 34, T = 14
  const x = (m: number) => L + ((W - L - 10) / 12) * (m + 0.5)
  const y = (v: number) => T + (H - T - B) * (1 - (v - y0) / (y1 - y0))
  const bar = ((W - L - 10) / 12) * 0.5
  const ticks = Array.from({ length: 5 }, (_, i) => y0 + ((y1 - y0) * i) / 4)

  const valid = row.map((c, m) => ({ m, c })).filter(({ c }) => c.value !== null)
  const top = valid.length ? valid.reduce((a, b) => (b.c.value! > a.c.value! ? b : a)) : null
  const bottom = valid.length ? valid.reduce((a, b) => (b.c.value! < a.c.value! ? b : a)) : null
  const completeMonths = row.filter((c) => c.complete && c.value !== null)
  const yearValue = completeMonths.length
    ? variable.sum
      ? completeMonths.reduce((a, c) => a + c.value!, 0)
      : completeMonths.reduce((a, c) => a + c.value!, 0) / completeMonths.length
    : null
  const digits = variable.key === 'vegetation' ? 2 : variable.sum ? 0 : 1
  const fmt = (v: number | null) => (v === null ? 'Sin dato' : `${number(v, digits)}${variable.unit ? ` ${variable.unit}` : ''}`)
  const incomplete = row.filter((c) => c.count > 0 && !c.complete).length

  return (
    <div className="history-page">
      <section className="card">
        <h2>¿Qué quieres ver de {parcel.name}?</h2>
        <div className="variable-chips" role="group" aria-label="Variable">
          {available.map((v) => (
            <button key={v.key} aria-pressed={v.key === variable.key} className={v.key === variable.key ? 'on' : ''} onClick={() => setKey(v.key)}>
              <Icon name={v.icon} size={17} /> {v.label}
            </button>
          ))}
        </div>
        <div className="year-chips" role="group" aria-label="Año">
          {years.map((yr) => (
            <button key={yr} aria-pressed={yr === year} className={yr === year ? 'on' : ''} onClick={() => setChosen(yr)}>
              {yr}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="history-title">
          <h2>
            {variable.label} en {year}
          </h2>
          <Link to={`/app/ayuda?tab=fuentes#${variable.anchor}`} className="info-link">
            <span className="info-dot small">i</span> {variable.about}
          </Link>
        </div>
        <svg className="history-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${variable.label} por mes en ${year}, frente al promedio y al rango de ${years[0]} a ${years.at(-1)}`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W - 10} y1={y(t)} y2={y(t)} className="grid" />
              <text x={L - 8} y={y(t) + 4} textAnchor="end">
                {number(t, digits)}
              </text>
            </g>
          ))}
          {stats.map((s, m) =>
            s ? <rect key={`r${m}`} x={x(m) - bar * 0.9} width={bar * 1.8} y={y(s.max)} height={Math.max(2, y(s.min) - y(s.max))} rx="6" className="range" /> : null,
          )}
          {row.map((c, m) =>
            c.value === null ? null : variable.sum ? (
              <rect key={`b${m}`} x={x(m) - bar / 2} width={bar} y={y(c.value)} height={Math.max(1, y(y0) - y(c.value))} rx="5" fill={variable.color} opacity={c.complete ? 1 : 0.45}>
                <title>{`${MONTHS[m]} ${year}: ${fmt(c.value)}`}</title>
              </rect>
            ) : (
              <circle key={`c${m}`} cx={x(m)} cy={y(c.value)} r="7" fill={variable.color} opacity={c.complete ? 1 : 0.45}>
                <title>{`${MONTHS[m]} ${year}: ${fmt(c.value)}${c.complete ? '' : ' (mes incompleto)'}`}</title>
              </circle>
            ),
          )}
          {!variable.sum && (
            <polyline points={row.flatMap((c, m) => (c.value === null ? [] : [`${x(m)},${y(c.value)}`])).join(' ')} fill="none" stroke={variable.color} strokeWidth="3" strokeLinejoin="round" />
          )}
          {stats.map((s, m) => (s ? <line key={`m${m}`} x1={x(m) - bar * 0.9} x2={x(m) + bar * 0.9} y1={y(s.mean)} y2={y(s.mean)} className="mean" /> : null))}
          {MONTHS.map((label, m) => (
            <text key={label} x={x(m)} y={H - 10} textAnchor="middle">
              {label}
            </text>
          ))}
        </svg>
        <div className="history-legend">
          <span>
            <i style={{ background: variable.color }} /> {year}
          </span>
          <span>
            <i className="legend-mean" /> Promedio de {years[0]} a {years.at(-1)}
          </span>
          <span>
            <i className="legend-range" /> Entre el año más bajo y el más alto
          </span>
          {incomplete > 0 && <span>Más claro: mes con días que faltan</span>}
        </div>
      </section>

      <section className="history-facts">
        <article className="card finding">
          <span className="finding-title">{variable.sum ? `Total de ${year}` : `Promedio de ${year}`}</span>
          <strong className="finding-value">{fmt(yearValue)}</strong>
          <p>
            Con {completeMonths.length} {completeMonths.length === 1 ? 'mes completo' : 'meses completos'}
            {completeMonths.length < 12 ? ' (el año no está completo)' : ''}.
          </p>
        </article>
        {top && (
          <article className="card finding">
            <span className="finding-title">Mes más alto</span>
            <strong className="finding-value">{capitalMonth(top.m)}</strong>
            <p>{fmt(top.c.value)}</p>
          </article>
        )}
        {bottom && (
          <article className="card finding">
            <span className="finding-title">Mes más bajo</span>
            <strong className="finding-value">{capitalMonth(bottom.m)}</strong>
            <p>{fmt(bottom.c.value)}</p>
          </article>
        )}
        <article className="card finding">
          <span className="finding-title">¿Dudas sobre este gráfico?</span>
          <p>Un histórico cuenta lo que pasó; no es un pronóstico.</p>
          <button className="finding-open" onClick={() => askAssistant(`¿Cómo leo el historial de ${variable.label.toLowerCase()}?`)}>
            <Icon name="send" size={15} /> Preguntar a {AGENT}
          </button>
        </article>
      </section>

      <details className="card history-table">
        <summary>Ver la tabla de {year}, mes por mes</summary>
        <div className="table-scroll" tabIndex={0}>
          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th>{year}</th>
                <th>Promedio de todos los años</th>
                <th>Año más bajo</th>
                <th>Año más alto</th>
                <th>Registros</th>
              </tr>
            </thead>
            <tbody>
              {row.map((c, m) => (
                <tr key={m}>
                  <td>{capitalMonth(m)}</td>
                  <td>
                    {fmt(c.value)}
                    {c.count > 0 && !c.complete ? ' (incompleto)' : ''}
                  </td>
                  <td>{fmt(stats[m]?.mean ?? null)}</td>
                  <td>{fmt(stats[m]?.min ?? null)}</td>
                  <td>{fmt(stats[m]?.max ?? null)}</td>
                  <td>{c.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small-note">
          {evidence?.source} · {evidence?.support} Los registros completos y sus descargas están en{' '}
          <Link to="/app/estudio-tecnico">Estudio técnico</Link>.
        </p>
      </details>
    </div>
  )
}
const capitalMonth = (m: number) => LONG[m].charAt(0).toUpperCase() + LONG[m].slice(1)

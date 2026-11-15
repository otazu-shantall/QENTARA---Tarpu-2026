// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useWorkspace } from '../../app/WorkspaceContext'
import type { ViewPeriod, TimeGrouping } from '../../types/domain'
export function ObservationControls({
  grouping,
  onGrouping,
}: {
  grouping: TimeGrouping
  onGrouping: (g: TimeGrouping) => void
}) {
  const { period, setPeriod, from, to, setFrom, setTo, evidence } = useWorkspace()
  return (
    <div className="observation-controls">
      <label>
        Período
        <select
          aria-label="Período histórico"
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value) as ViewPeriod)}
        >
          <option value={365}>Últimos 365 días disponibles</option>
          <option value={90}>Últimos 90 días disponibles</option>
          <option value={30}>Últimos 30 días disponibles</option>
        </select>
      </label>
      <label>
        Desde
        <input
          type="date"
          aria-label="Fecha inicial"
          value={from}
          min={evidence?.points[0]?.date}
          max={to || evidence?.points.at(-1)?.date}
          onChange={(e) => setFrom(e.target.value)}
        />
      </label>
      <label>
        Hasta
        <input
          type="date"
          aria-label="Fecha final"
          value={to}
          min={from || evidence?.points[0]?.date}
          max={evidence?.points.at(-1)?.date}
          onChange={(e) => setTo(e.target.value)}
        />
      </label>
      <div className="segmented" role="group" aria-label="Agrupar observaciones">
        {(['day', 'week', 'month'] as const).map((g) => (
          <button key={g} aria-pressed={g === grouping} onClick={() => onGrouping(g)}>
            {g === 'day' ? 'Días' : g === 'week' ? 'Semanas' : 'Meses'}
          </button>
        ))}
      </div>
      {(from || to) && (
        <button
          className="text-link"
          onClick={() => {
            setFrom('')
            setTo('')
          }}
        >
          Limpiar fechas
        </button>
      )}
    </div>
  )
}

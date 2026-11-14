import { useWorkspace } from '../../app/context'
import { Icon } from '../ui/Icon'
import type { Period } from '../../types'

export function WorkspaceFilters() {
  const { parcels, selectedId, selectParcel, period, setPeriod } = useWorkspace()
  return <div className="workspace-filters">
    <label className="select-pill"><Icon name="parcels" size={16} /><span className="sr-only">Parcela activa</span><select aria-label="Parcela activa" value={selectedId} onChange={e => selectParcel(e.target.value)}><option value="all">Todas mis parcelas</option>{parcels.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><Icon name="chevron" size={14} /></label>
    <label className="select-pill"><Icon name="calendar" size={16} /><span className="sr-only">Período de consulta</span><select aria-label="Período de consulta" value={period} onChange={e => setPeriod(Number(e.target.value) as Period)}><option value={7}>Últimos 7 días</option><option value={30}>Últimos 30 días</option><option value={90}>Últimos 90 días</option></select><Icon name="chevron" size={14} /></label>
    <span className="filter-note"><i /> Datos ilustrativos · corte 24 oct 2026</span>
  </div>
}

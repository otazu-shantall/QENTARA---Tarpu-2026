import { useWorkspace } from '../../app/context'
import { formatNumber } from '../../lib/domain'
import { Icon } from '../../components/ui/Icon'
import type { IconName } from '../../components/ui/Icon'

const sparklines = [
  'M2 30 L12 23 22 25 34 16 45 20 55 10 67 14 78 5 88 8',
  'M2 25 L14 26 26 13 37 19 47 9 58 12 70 4 80 14 88 8',
  'M2 7 L14 10 25 5 37 17 47 14 59 24 70 21 80 28 88 23',
  'M2 28 L14 28 14 17 22 17 22 28 35 28 35 10 43 10 43 28 58 28 58 16 66 16 66 28 79 28 79 5 87 5 87 28',
]

export function MetricCards({ compact = false }: { compact?: boolean }) {
  const { current, navigate } = useWorkspace()
  const metrics: { title: string; value: string; unit: string; icon: IconName; tone: string; note: string }[] = [
    { title: 'Vegetación', value: formatNumber(current.ndvi, 2), unit: 'NDVI', icon: 'leaf', tone: 'green', note: 'Vigor vegetal ilustrativo' },
    { title: 'Temperatura', value: String(current.temperature), unit: '°C', icon: 'temperature', tone: 'sun', note: 'Referencia de la zona' },
    { title: 'Humedad del suelo', value: formatNumber(current.moisture, 2), unit: 'm³/m³', icon: 'water', tone: 'sky', note: 'Estimación regional de ejemplo' },
    { title: 'Precipitación', value: String(current.precipitation), unit: 'mm', icon: 'climate', tone: 'olive', note: 'Acumulado ilustrativo, 7 días' },
  ]
  return <div className={`metrics-grid ${compact ? 'compact' : ''}`}>{metrics.map((metric, index) => <button className={`metric-card tone-${metric.tone}`} key={metric.title} onClick={() => navigate(index === 0 || index === 2 ? 'data' : 'climate')}>
    <span className="metric-top"><span>{metric.title}</span><span className="metric-icon"><Icon name={metric.icon} size={16}/></span></span>
    <span className="metric-value">{metric.value}<small>{metric.unit}</small></span>
    <span className="metric-bottom"><span>{metric.note}</span><svg viewBox="0 0 90 35" aria-hidden="true"><path d={sparklines[index]} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
  </button>)}</div>
}

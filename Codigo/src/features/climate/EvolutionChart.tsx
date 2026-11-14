import { useState } from 'react'
import { useWorkspace } from '../../app/context'
import { metricLabels, metricSeries, metricUnits } from '../../data/demo'
import { formatNumber } from '../../lib/domain'
import { Icon } from '../../components/ui/Icon'
import type { Metric } from '../../types'

export function EvolutionChart({ initialMetric = 'ndvi' }: { initialMetric?: Metric }) {
  const { current, period, navigate } = useWorkspace()
  const [metric, setMetric] = useState<Metric>(initialMetric)
  const [active, setActive] = useState(11)
  const values = metricSeries(current, period, metric)
  const min = metric === 'ndvi' ? .2 : metric === 'temperature' ? 12 : 0
  const max = metric === 'ndvi' ? .9 : metric === 'temperature' ? 34 : 10
  const points = values.map((value, i) => ({x: 42+i*59, y: 172-(value-min)/(max-min)*139}))
  const line = points.map((point, i) => i === 0 ? `M ${point.x},${point.y}` : `C ${points[i-1].x+29},${points[i-1].y} ${point.x-29},${point.y} ${point.x},${point.y}`).join(' ')
  return <section className="card chart-card"><div className="card-heading"><div><h2>La evolución de tu campo</h2><p>Observa el comportamiento a lo largo del tiempo.</p></div><button className="icon-button subtle-icon" aria-label="Ver los registros del gráfico" onClick={() => navigate('data')}><Icon name="arrowUp" size={18}/></button></div>
    <div className="chart-toolbar"><div className="segmented-control" aria-label="Variable del gráfico">{(Object.keys(metricLabels) as Metric[]).map(key => <button key={key} className={metric === key ? 'active' : ''} onClick={() => {setMetric(key);setActive(11)}}>{metricLabels[key]}</button>)}</div><span className="chart-current"><i/>{formatNumber(values[active],metric==='ndvi'?2:1)} <small>{metricUnits[metric]}</small></span></div>
    <div className="chart-plot"><svg viewBox="0 0 740 204" role="img" aria-label={`Serie sintética de ${metricLabels[metric]}, últimos ${period} días`}>
      <defs><linearGradient id={`area-${metric}`} x2="0" y2="1"><stop stopColor="#2e7d4f" stopOpacity=".22"/><stop offset="1" stopColor="#2e7d4f" stopOpacity="0"/></linearGradient></defs>
      {[0,1,2,3].map(i => <g key={i}><line x1="42" y1={33+i*46.3} x2="710" y2={33+i*46.3} stroke="#e6e6e0" strokeDasharray="3 5"/><text x="0" y={37+i*46.3} className="axis-label">{formatNumber(max-i*(max-min)/3,metric==='ndvi'?1:0)}</text></g>)}
      <path d={`${line} L691,180 L42,180 Z`} fill={`url(#area-${metric})`}/><path d={line} fill="none" stroke="#2e7d4f" strokeWidth="2.4" strokeLinecap="round"/>
      <line x1={points[active].x} y1="26" x2={points[active].x} y2="179" stroke="#b9bcb5" strokeDasharray="3 4"/>
      {points.map((point,i) => <circle key={i} cx={point.x} cy={point.y} r={active===i?5:12} fill={active===i?"#111311":"transparent"} stroke={active===i?'#fff':'none'} strokeWidth="3" tabIndex={0} role="button" aria-label={`Observación ${i+1}: ${values[i]} ${metricUnits[metric]}, sintético`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)} onKeyDown={e => {if(e.key==='Enter')setActive(i)}}/>)}
      {[0,3,6,9,11].map(i => <text key={i} x={points[i].x} y="202" textAnchor="middle" className="axis-label">{new Date(Date.UTC(2026,9,24-period+1+Math.round(i*(period-1)/11))).toLocaleDateString('es-PE',{day:'numeric',month:'short',timeZone:'UTC'}).replace('.','')}</text>)}
    </svg></div><div className="chart-footnote"><span><span className="tiny-circle"/> Serie de ejemplo · sin conexión a proveedores</span><button className="text-button" onClick={() => navigate('data')}>Ver registros <Icon name="arrow" size={14}/></button></div>
  </section>
}

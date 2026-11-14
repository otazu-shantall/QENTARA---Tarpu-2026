import { useWorkspace } from '../../app/context'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { Icon } from '../../components/ui/Icon'
import { WorkspaceFilters } from '../../components/layout/WorkspaceFilters'
import { FarmMap } from '../monitor/FarmMap'
import { EvolutionChart } from '../climate/EvolutionChart'
import { MetricCards } from './MetricCards'
import { formatNumber } from '../../lib/domain'

export function OverviewPage() {
  const { parcels, selectedId, selectParcel, current, navigate, openAgent, printReport } = useWorkspace()
  return <>
    <SectionHeader eyebrow="Cultivar empieza por comprender" title="Tu campo, en perspectiva." description="Una mirada a tus parcelas: más información para tus próximas decisiones." action={<button className="button secondary" onClick={() => printReport()}><Icon name="download" size={16}/> Exportar resumen</button>}/>
    <WorkspaceFilters/>
    <div className="overview-split">
      <div className="overview-panel">
        <section className="card parcel-summary">
          <div className="parcel-summary-top">
            <div><span className="kicker"><i/> {selectedId === 'all' ? `${parcels.length} parcelas en tu espacio` : current.crop}</span><h2>{current.name}</h2><p><Icon name="pin" size={13}/> {current.location}</p></div>
            <div className="area-figure"><strong>{formatNumber(current.area)}</strong><span>ha</span></div>
          </div>
          <div className="parcel-chips" role="group" aria-label="Elegir parcela">
            <button aria-pressed={selectedId === 'all'} onClick={() => selectParcel('all')}>Todas</button>
            {parcels.map(parcel => <button key={parcel.id} aria-pressed={selectedId === parcel.id} onClick={() => selectParcel(parcel.id)}><i style={{ background: parcel.color }}/>{parcel.name}</button>)}
          </div>
        </section>
        <MetricCards compact/>
        <section className="insight-card">
          <div className="insight-top"><span className="ai-chip"><Icon name="sparkles" size={13}/> Tarpu</span><span>Respuestas guiadas de demostración</span></div>
          <h2>Los datos cuentan. <em>Tú decides.</em></h2>
          <p>Explora qué significa un NDVI de {formatNumber(current.ndvi, 2)} y qué no permite concluir sobre {current.name.toLowerCase() === 'todas mis parcelas' ? 'tus parcelas' : current.name}.</p>
          <button className="button light" onClick={() => openAgent('¿Qué significa el NDVI de mi parcela?')}>Preguntar a Tarpu <Icon name="arrow" size={16}/></button>
        </section>
        <EvolutionChart/>
        <section className="card next-step-card">
          <div className="card-heading"><div><span className="eyebrow">Piensa en la siguiente campaña</span><h2>Cultiva nuevas posibilidades.</h2></div><span className="round-icon"><Icon name="rotations" size={18}/></span></div>
          <div className="rotation-preview"><div><span className="crop-dot gold"><Icon name="sprout" size={18}/></span><strong>Papa</strong><small>Cultivo de referencia</small></div><span className="rotation-line"><Icon name="arrow" size={16}/></span><div><span className="crop-dot"><Icon name="wheat" size={18}/></span><strong>¿Qué sigue?</strong><small>Revisa candidatos</small></div></div>
          <button className="button tertiary full-width" onClick={() => navigate('rotations')}>Explorar rotaciones <Icon name="arrow" size={16}/></button>
          <small className="subtle-note">Comparación ilustrativa, sin recomendación agronómica.</small>
        </section>
      </div>
      <section className="overview-map" aria-label="Mapa del territorio">
        <FarmMap large selectedId={selectedId} onSelect={selectParcel}>
          <div className="map-float-card">
            <div className="mfc-head"><div><strong>{current.name}</strong><small>{current.crop} · {formatNumber(current.area)} ha</small></div><span className="tag">Demo</span></div>
            <div className="mfc-scale">
              <div className="mfc-scale-top"><span>Índice de vegetación</span><b>{formatNumber(current.ndvi, 2)}</b></div>
              <div className="mfc-bar"><i style={{ left: `${Math.min(100, Math.max(0, current.ndvi * 100))}%` }}/></div>
              <div className="mfc-scale-legend"><span>0</span><span>Valor sintético · NDVI</span><span>1</span></div>
            </div>
            <dl className="mfc-readout">
              <div><dt><Icon name="temperature" size={14}/> Temperatura</dt><dd>{current.temperature} °C</dd></div>
              <div><dt><Icon name="water" size={14}/> Humedad regional</dt><dd>{formatNumber(current.moisture, 2)} m³/m³</dd></div>
              <div><dt><Icon name="climate" size={14}/> Lluvia, 7 días</dt><dd>{current.precipitation} mm</dd></div>
            </dl>
            <div className="mfc-insight"><span className="ai-chip"><Icon name="sparkles" size={12}/> Tarpu</span><p>Un valor regional da contexto; no es una medición dentro de tu parcela.</p><button onClick={() => openAgent('¿Qué significa el NDVI de mi parcela?')}>Preguntar <Icon name="arrow" size={13}/></button></div>
          </div>
        </FarmMap>
      </section>
    </div>
    <div className="source-ribbon"><span><Icon name="layers" size={15}/> Inspirado en datos abiertos</span><div><strong>NASA POWER</strong><i/><strong>Copernicus</strong><i/><strong>ISRIC</strong></div><small>Fuentes de referencia · sin conexión activa</small></div>
  </>
}

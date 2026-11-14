import { useState } from 'react'
import { useWorkspace } from '../../app/context'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { WorkspaceFilters } from '../../components/layout/WorkspaceFilters'
import { Icon } from '../../components/ui/Icon'
import { FarmMap } from './FarmMap'

export function MonitorPage() {
  const { selectedId, selectParcel, openAgent, navigate } = useWorkspace()
  const [tab, setTab] = useState<'sources' | 'limits'>('sources')
  return <>
    <SectionHeader eyebrow="Una perspectiva desde arriba" title="Mira más allá del terreno." description="Recorre Arequipa con imagen satelital y cartografía del territorio." action={<button className="button secondary" onClick={() => navigate('data')}><Icon name="data" size={16}/> Explorar datos</button>}/>
    <WorkspaceFilters/>
    <div className="monitor-layout">
      <section className="monitor-map" aria-label="Explorador del territorio"><FarmMap large selectedId={selectedId} onSelect={selectParcel}/></section>
      <aside className="card monitor-panel">
        <div className="panel-heading"><div><span className="eyebrow">Detrás del mapa</span><h2>El territorio, con contexto.</h2></div><span className="pill">Cartografía real</span></div>
        <div className="segmented" role="tablist" aria-label="Información del mapa">
          <button role="tab" aria-selected={tab === 'sources'} className={tab === 'sources' ? 'active' : ''} onClick={() => setTab('sources')}>Fuentes</button>
          <button role="tab" aria-selected={tab === 'limits'} className={tab === 'limits' ? 'active' : ''} onClick={() => setTab('limits')}>Límites</button>
        </div>
        {tab === 'sources' ? <ul className="tree-list">
          <li><span><Icon name="satellite" size={15}/> Imagen de fondo</span><b>Esri World Imagery</b></li>
          <li><span><Icon name="map" size={15}/> Vista de calles</span><b>OpenStreetMap</b></li>
          <li><span><Icon name="calendar" size={15}/> Fecha de adquisición</span><b>Variable según mosaico</b></li>
          <li><span><Icon name="pin" size={15}/> Ubicación de parcelas</span><b className="muted">Por delimitar</b></li>
          <li><span><Icon name="leaf" size={15}/> Análisis NDVI</span><b className="muted">No conectado</b></li>
        </ul> : <div className="limits-list">
          <p><Icon name="check" size={15}/> Muestra cómo luce el territorio: valles, canales, campos y caminos.</p>
          <p><Icon name="close" size={15}/> No es una captura en vivo ni una capa de vegetación.</p>
          <p><Icon name="close" size={15}/> Las zonas de La Joya, Majes y Camaná sirven para navegar; no son parcelas medidas.</p>
        </div>}
        <div className="callout"><Icon name="shield" size={19}/><p>Una imagen del territorio no es un análisis agronómico. Los indicadores de la demo siguen siendo sintéticos.</p></div>
        <button className="button primary full-width" onClick={() => openAgent('¿Cómo interpreto el NDVI?')}>Entender el NDVI <Icon name="arrow" size={16}/></button>
      </aside>
    </div>
  </>
}

import { navItems } from '../../data/demo'
import { useWorkspace } from '../../app/context'
import { Icon } from '../ui/Icon'

/** Narrow icon rail on desktop; becomes a bottom navigation bar on phones. */
export function Sidebar() {
  const { page, navigate, openHelp, parcels } = useWorkspace()
  return <aside className="rail" aria-label="Menú principal">
    <a href="#/" className="rail-logo" aria-label="Tarpu, página de inicio" onClick={event => { event.preventDefault(); navigate('home') }}><img src="brand/tarpu-mark-black.png" alt="" /></a>
    <nav className="rail-nav">{navItems.map(item => <a key={item.id} href={`#/${item.id}`} aria-label={item.label} title={item.label} className={page === item.id ? 'active' : ''} aria-current={page === item.id ? 'page' : undefined} onClick={event => { event.preventDefault(); navigate(item.id) }}>
      <span className="rail-icon"><Icon name={item.icon} size={19} />{item.id === 'parcels' && <small className="rail-count">{parcels.length}</small>}</span>
      <span className="rail-label" aria-hidden="true">{item.short}</span>
    </a>)}</nav>
    <div className="rail-bottom">
      <button className="rail-button" onClick={openHelp} aria-label="Guía de esta demostración" title="Guía de esta demostración"><Icon name="help" size={19} /></button>
      <button className="rail-avatar" onClick={openHelp} aria-label="Acerca del espacio de QENTARA" title="Espacio de QENTARA">Q</button>
    </div>
  </aside>
}

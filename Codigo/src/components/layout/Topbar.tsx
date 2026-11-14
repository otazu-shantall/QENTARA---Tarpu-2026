import { useState } from 'react'
import { useWorkspace } from '../../app/context'
import { navItems } from '../../data/demo'
import { Icon } from '../ui/Icon'

export function Topbar() {
  const { page, navigate, openHelp } = useWorkspace()
  const [notifications, setNotifications] = useState(false)
  return <div className="topbar">
    <a href="#/" className="topbar-logo" aria-label="Tarpu, página de inicio" onClick={event => { event.preventDefault(); navigate('home') }}><img src="brand/tarpu-logo-black.png" alt="Tarpu" /></a>
    <div className="breadcrumb"><span>Mi espacio</span><Icon name="right" size={13} /><strong>{navItems.find(item => item.id === page)?.label}</strong></div>
    <div className="topbar-actions">
      <button className="demo-badge" onClick={openHelp}><i /> Demostración</button>
      <span className="topbar-chip"><Icon name="pin" size={14} /> Arequipa, Perú</span>
      <div className="notification-wrap">
        <button className={`icon-button ${notifications ? 'pressed' : ''}`} aria-expanded={notifications} aria-label="Ver notificaciones" onClick={() => setNotifications(!notifications)}><Icon name="bell" size={18} /></button>
        {notifications && <div className="popover" role="dialog" aria-label="Notificaciones"><strong>Todo en calma</strong><p>Estás explorando un prototipo visual. No hay alertas agrícolas activas.</p><small>Los valores y las parcelas son ilustrativos.</small><button className="text-button" onClick={() => setNotifications(false)}>Entendido <Icon name="check" size={14} /></button></div>}
      </div>
    </div>
  </div>
}

// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
// 15/11/2026 (Claude Code): encabezado compacto (solo el nombre de la página), sin textos de relleno.
import { useEffect, useState } from 'react'
import { NavLink, Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import { useWorkspace } from '../../app/WorkspaceContext'
import { Icon } from '../ui/Icon'
import type { IconName } from '../ui/Icon'
import { AIAccountDialog } from '../../features/assistant/AIAccountDialog'
import { AssistantPanel } from '../../features/assistant/AssistantPanel'
import { Tour } from '../../features/help/Tour'
import { AGENT } from '../../lib/agent'
const navigation: { to: string; label: string; icon: IconName }[] = [
  { to: '/app', label: 'Mi campo', icon: 'home' },
  { to: '/app/historial', label: 'Historial', icon: 'history' },
  { to: '/app/rotacion', label: 'Rotación de cultivos', icon: 'sprout' },
  { to: '/app/informes', label: 'Mis informes', icon: 'report' },
]
export function WorkspaceLayout() {
  const {
    parcel,
    parcels,
    selectParcel,
    theme,
    setTheme,
    assistantOpen,
    setAssistantOpen,
    startTourOnce,
  } = useWorkspace()
  const [account, setAccount] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const name = sessionStorage.getItem('tarpu.prototype.session')
  // La primera vez que se entra a cada sección se abre su recorrido guiado; igual con el asistente.
  const section = location.pathname.includes('nueva')
    ? 'dibujo'
    : location.pathname.includes('historial')
      ? 'historial'
      : location.pathname.includes('rotacion')
        ? 'rotacion'
        : location.pathname.includes('informes')
          ? 'informes'
          : location.pathname.includes('estudio')
            ? 'estudio'
            : location.pathname.includes('ayuda')
              ? 'ayuda'
              : 'campo'
  useEffect(() => {
    if (!name) return
    const timer = setTimeout(() => startTourOnce(assistantOpen ? 'asistente' : section), 900)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, assistantOpen])
  if (!name) return <Navigate to="/acceso" replace />
  const current = location.pathname.includes('nueva')
    ? 'Delimitar parcela'
    : location.pathname.includes('datos') || location.pathname.includes('estudio-tecnico')
      ? 'Estudio técnico'
      : location.pathname.includes('ayuda')
        ? 'Ayuda y fuentes'
        : (navigation.find((item) => item.to === location.pathname)?.label ?? 'Mi campo')
  return (
    <div className="workspace-shell">
      <a
        className="skip-link"
        href="#workspace-main"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('workspace-main')?.focus()
        }}
      >
        Saltar al contenido
      </a>
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand" aria-label="TARPU, inicio">
          <img src="brand/tarpu-logo-white.png" alt="TARPU" />
        </Link>
        <div className="workspace-label">MENÚ</div>
        <nav aria-label="Menú principal">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.to === '/app' && (
                <span className="nav-count">
                  {parcels.filter((p) => p.kind !== 'reference').length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-assistant">
          <div className="little-bubbles" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <strong>¿Tienes una pregunta sobre tus datos?</strong>
          <button onClick={() => setAssistantOpen(true)}>
            Pregunta a {AGENT} <Icon name="upRight" size={16} />
          </button>
        </div>
        <div className="sidebar-bottom">
          <span className="workspace-label">MÁS DETALLE</span>
          <NavLink className="nav-item" to="/app/estudio-tecnico">
            <Icon name="data" />
            <span>Estudio técnico</span>
            <Icon name="upRight" size={16} />
          </NavLink>
          <button className="nav-item" onClick={() => setAccount(true)}>
            <Icon name="settings" />
            <span>Mi proveedor de IA</span>
          </button>
          <NavLink className="nav-item" to="/app/ayuda">
            <Icon name="help" />
            <span>Ayuda y fuentes</span>
          </NavLink>
          <div className="sidebar-profile">
            <span className="profile-avatar">{name[0].toUpperCase()}</span>
            <div>
              <strong>{name}</strong>
              <small>Espacio de demostración</small>
            </div>
            <button
              title="Salir"
              className="icon-button"
              aria-label="Salir del prototipo"
              onClick={() => {
                sessionStorage.removeItem('tarpu.prototype.session')
                setAssistantOpen(false)
                navigate('/acceso')
              }}
            >
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-topbar">
          <div className="breadcrumbs">
            Mi espacio <span>/</span>
            <strong>{current}</strong>
          </div>
          <div className="topbar-actions">
            <span className="prototype-label">
              <span />
              Prototipo
            </span>
            <button
              className="theme-switch"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
            >
              <Icon name={theme === 'light' ? 'moon' : 'sun'} size={17} />
              <span>{theme === 'light' ? 'Tema oscuro' : 'Tema claro'}</span>
            </button>
            <span className="topbar-divider" />
            <Icon name="pin" size={16} />
            <span>Arequipa, Perú</span>
          </div>
        </header>
        <main id="workspace-main" tabIndex={-1} className="workspace-main">
          <div className="page-heading">
            <h1 className="page-title">{current}</h1>
            <div className="page-actions">
              <label className="parcel-select">
                <Icon name="pin" size={18} />
                <select
                  aria-label="Parcela activa"
                  value={parcel.id}
                  onChange={(e) => selectParcel(e.target.value)}
                >
                  {parcels.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.kind === 'reference' ? ' · referencia' : ''}
                    </option>
                  ))}
                </select>
              </label>
              {current !== 'Delimitar parcela' && (
                <Link className="button button-green" to="/app/parcela/nueva">
                  <Icon name="plus" size={17} /> Nueva parcela
                </Link>
              )}
            </div>
          </div>
          <Outlet />
        </main>
        <footer className="workspace-footer">
          <span>
            TARPU <i>·</i> QENTARA
          </span>
          <span>Arequipa, Perú</span>
        </footer>
      </div>
      {assistantOpen && <AssistantPanel key={parcel.id} />}
      {account && <AIAccountDialog onClose={() => setAccount(false)} />}{' '}
      <Tour />
    </div>
  )
}

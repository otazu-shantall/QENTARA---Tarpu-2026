import { useEffect, useState } from 'react'
import { WorkspaceContext } from './context'
import type { Page, Parcel, Period, SavedReport } from '../types'
import { initialParcels, navItems } from '../data/demo'
import { aggregateParcels } from '../lib/domain'
import { readLocal, writeLocal } from '../lib/storage'
import { Sidebar } from '../components/layout/Sidebar'
import { Topbar } from '../components/layout/Topbar'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { LandingPage } from '../features/landing/LandingPage'
import { OverviewPage } from '../features/dashboard/OverviewPage'
import { ParcelsPage } from '../features/parcels/ParcelsPage'
import { MonitorPage } from '../features/monitor/MonitorPage'
import { ClimatePage } from '../features/climate/ClimatePage'
import { RotationsPage } from '../features/rotations/RotationsPage'
import { DataPage } from '../features/data/DataPage'
import { ReportsPage } from '../features/reports/ReportsPage'
import { PrintReport } from '../features/reports/PrintReport'
import { AssistantDrawer } from '../features/assistant/AssistantDrawer'

function pageFromHash(): Page {
  const value = window.location.hash.replace(/^#\/?/, '')
  return navItems.some(item => item.id === value) ? value as Page : 'home'
}

function isValidParcel(p: Parcel) {
  return p && typeof p.id === 'string' && typeof p.name === 'string' && typeof p.location === 'string' && typeof p.crop === 'string' && typeof p.color === 'string' && (['area', 'ndvi', 'temperature', 'moisture', 'precipitation'] as const).every(key => Number.isFinite(p[key]))
}

export function App() {
  const [page, setPage] = useState<Page>(pageFromHash)
  const [parcels, setParcels] = useState<Parcel[]>(() => {
    const saved = readLocal<Parcel[]>('tarpu.demo.parcels', [])
    return Array.isArray(saved) && saved.length >= 3 && saved.every(isValidParcel) ? saved : initialParcels
  })
  const [selectedId, setSelectedId] = useState('all')
  const [period, setPeriod] = useState<Period>(7)
  const [reports, setReports] = useState<SavedReport[]>(() => {
    const saved = readLocal<SavedReport[]>('tarpu.demo.reports', [])
    return Array.isArray(saved) ? saved.filter(r => r && typeof r.id === 'string' && typeof r.name === 'string' && typeof r.createdAt === 'string' && [7, 30, 90].includes(r.period) && r.snapshot && typeof r.snapshot.name === 'string') : []
  })
  const [agent, setAgent] = useState<{ question?: string } | null>(null)
  const [help, setHelp] = useState(false)
  const [toast, setToast] = useState('')
  const [printSelection, setPrintSelection] = useState<{ parcel: Parcel; period: Period } | null>(null)
  const current = aggregateParcels(parcels, selectedId)

  useEffect(() => {
    const onHash = () => { setPage(pageFromHash()); window.scrollTo({ top: 0 }) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => { writeLocal('tarpu.demo.parcels', parcels) }, [parcels])
  useEffect(() => { writeLocal('tarpu.demo.reports', reports) }, [reports])
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 4500); return () => clearTimeout(timer) }, [toast])
  useEffect(() => { document.body.classList.toggle('is-landing', page === 'home') }, [page])

  function navigate(value: Page) {
    window.location.hash = value === 'home' ? '/' : `/${value}`
    setPage(value)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  function saveReport() {
    const report: SavedReport = { id: crypto.randomUUID(), name: `Resumen de ${current.name.toLowerCase()}`, createdAt: new Date().toISOString(), parcelId: selectedId, period, snapshot: { ...current } }
    setReports(previous => [report, ...previous]); setToast('Informe guardado en este navegador.'); navigate('reports')
  }
  function printReport(report?: SavedReport) {
    setPrintSelection({ parcel: report?.snapshot ?? current, period: report?.period ?? period })
    setTimeout(() => window.print(), 120)
  }

  const content = page === 'overview' ? <OverviewPage /> : page === 'parcels' ? <ParcelsPage /> : page === 'monitor' ? <MonitorPage /> : page === 'climate' ? <ClimatePage /> : page === 'rotations' ? <RotationsPage /> : page === 'data' ? <DataPage /> : <ReportsPage />

  return <WorkspaceContext.Provider value={{ page, navigate, parcels, selectedId, selectParcel: setSelectedId, current, period, setPeriod, openAgent: question => setAgent({ question }), notify: setToast, addParcel: parcel => setParcels(previous => [...previous, parcel]), reports, saveReport, printReport, openHelp: () => setHelp(true) }}>
    {page === 'home' ? <LandingPage /> : <div className="app-shell">
      <a className="skip-link" href="#main-content">Saltar al contenido</a>
      <Sidebar />
      <div className="workspace">
        <Topbar />
        <main id="main-content" className={`main-content page-${page}`} key={page}>
          {content}
          <footer className="workspace-footer"><span><img src="brand/tarpu-mark-black.png" alt="" /> Tarpu · Datos para cosechar un mejor mañana.</span><span>Prototipo de QENTARA · parcelas e indicadores de demostración</span></footer>
        </main>
      </div>
      <button className="floating-agent" aria-label="Abrir agente Tarpu" onClick={() => setAgent({})}><span className="floating-agent-icon"><Icon name="sparkles" size={16} /></span><span>Pregunta a Tarpu</span></button>
    </div>}
    {agent && <AssistantDrawer key={`${selectedId}-${agent.question ?? 'empty'}`} question={agent.question} onClose={() => setAgent(null)} />}
    {help && <Modal title="Conoce esta demostración" onClose={() => setHelp(false)} className="help-modal">
      <p className="modal-description">Una primera mirada a cómo se sentirá Tarpu: comprender tu campo, conversar sobre la evidencia y explorar los datos a tu manera.</p>
      <ul className="help-list">
        <li><Icon name="check" size={16} /> Cambia de parcela o período y recorre las siete vistas.</li>
        <li><Icon name="check" size={16} /> Añade fichas e informes, guardados solo en este navegador.</li>
        <li><Icon name="check" size={16} /> Descarga CSV o JSON y prepara un resumen para PDF.</li>
        <li><Icon name="check" size={16} /> Prueba el agente con respuestas guiadas locales.</li>
      </ul>
      <div className="callout"><Icon name="shield" size={20} /><p>El mapa base muestra cartografía real de Esri u OpenStreetMap y requiere internet. Las parcelas, los indicadores y las respuestas del agente son de demostración. No hay análisis satelital ni recomendaciones agronómicas reales.</p></div>
      <button className="text-button" onClick={() => { setHelp(false); navigate('home') }}>Volver a la página de inicio <Icon name="arrow" size={14} /></button>
    </Modal>}
    {toast && <div className="toast" role="status"><Icon name="check" size={16} />{toast}<button onClick={() => setToast('')} aria-label="Cerrar aviso"><Icon name="close" size={14} /></button></div>}
    <PrintReport parcel={printSelection?.parcel ?? current} period={printSelection?.period ?? period} parcels={parcels} />
  </WorkspaceContext.Provider>
}

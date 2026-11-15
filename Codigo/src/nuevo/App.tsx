// Frontend nuevo escrito con asistencia de OpenAI Codex. Registro en entrega/uso-de-ia.md.
import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ArrowDownToLine, ArrowRight, ArrowUpRight, Check, ChevronDown, CircleHelp,
  CloudSun, Database, Droplets, ExternalLink, Flower2, Leaf, MapPin, MapPinned, Menu,
  MessageCircle, Plus, ScanLine, Search, ShieldCheck, SlidersHorizontal, Sparkles,
  Sprout, Thermometer, Trash2, Type, X } from 'lucide-react'
import { Chat } from './Chat'
import { FieldMap, validContour } from './FieldMap'
import { climateSummary, cropName, download, formatDate, mean, number, places, readFields, soilName } from './data'
import type { ChatMessage, Coordinate, Field, ReferencePlace } from './data'

type Page = 'inicio' | 'campo' | 'cultivos' | 'datos' | 'agente'
const navigation = [
  { id: 'campo', label: 'Mi campo', icon: MapPinned },
  { id: 'cultivos', label: 'Cultivos', icon: Sprout },
  { id: 'datos', label: 'Mis datos', icon: Database },
  { id: 'agente', label: 'Agente TARPU', icon: Sparkles },
] as const
const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
function currentPage(): Page {
  const hash = location.hash.replace('#/', '')
  return navigation.some(item => item.id === hash) ? hash as Page : 'inicio'
}

function Modal({ children, label, onClose, className = '' }: { children: ReactNode; label: string; onClose: () => void; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return <dialog ref={dialog} aria-label={label} className={`modal ${className}`} onCancel={onClose}
    onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="modal-top"><span className="eyebrow">TARPU · {label}</span><button className="button-quiet" onClick={onClose}><X size={20} />Cerrar</button></div>
    {children}
  </dialog>
}

function Logo({ white = false }: { white?: boolean }) {
  return <img className="logo" src={`brand/tarpu-logo-${white ? 'white' : 'black'}.png`} alt="TARPU" />
}

function Landing() {
  const [photoError, setPhotoError] = useState(false)
  // Tesela de Esri del punto real de Majes riego. Solo se solicita esta imagen para la portada.
  const zoom = 15
  const longitude = -72.185771, latitude = -16.367023
  const tileX = Math.floor((longitude + 180) / 360 * 2 ** zoom)
  const latRadians = latitude * Math.PI / 180
  const tileY = Math.floor((1 - Math.asinh(Math.tan(latRadians)) / Math.PI) / 2 * 2 ** zoom)
  return <div className="landing">
    <header className="landing-nav"><a href="#/" aria-label="TARPU, inicio"><Logo /></a>
      <nav aria-label="Navegación principal"><a href="#como-funciona">Cómo funciona</a><a href="#evidencia">Nuestros datos</a></nav>
      <a className="button button-primary" href="#/campo">Entrar a mi campo<ArrowUpRight size={20} /></a></header>
    <main>
      <section className="landing-hero">
        <div className="hero-copy"><span className="eyebrow"><span className="live-dot" />DESDE AREQUIPA, PARA TU CAMPO</span>
          <h1>Tu tierra.<br />Una mirada<br /><em>más clara.</em></h1>
          <p>Entiende el clima, conoce tu suelo y explora qué sembrar. Con datos del espacio y los pies en tu tierra.</p>
          <a className="button button-primary hero-action" href="#/campo">Conocer mi campo<ArrowUpRight size={22} /></a>
          <div className="hero-footnote"><ShieldCheck size={23} /><span>Tú conoces tu tierra.<br /><strong>TARPU te ayuda a entender sus datos.</strong></span></div>
        </div>
        <div className={`hero-image ${photoError ? 'photo-unavailable' : ''}`}>
          <img src={`https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${tileY}/${tileX}`} alt="Vista satelital de los campos de Majes, Arequipa" onError={() => setPhotoError(true)} />
          <div className="image-location"><MapPin size={20} />Majes, Arequipa</div>
          <div className="hero-image-copy"><span>Otra perspectiva.</span><span>La misma tierra.</span></div>
          <div className="image-attribution">{photoError ? 'Imagen disponible con conexión · ' : ''}Imagen satelital © Esri y sus proveedores</div>
        </div>
      </section>
      <div className="source-strip" id="evidencia"><span>Datos con origen.<br /><strong>Decisiones con contexto.</strong></span><div>NASA POWER</div><div>MODIS <small>ORNL DAAC</small></div><div>SoilGrids <small>ISRIC</small></div><div>CENAGRO <small>INEI · 2012</small></div></div>
      <section className="landing-how" id="como-funciona"><div><span className="eyebrow">A TU RITMO</span><h2>Menos dudas.<br /><em>Más contexto.</em></h2><p>Empieza por ubicar tu campo. Cada dato viene con una explicación y su fuente.</p></div>
        <div className="how-cards"><article><MapPinned size={30} /><h3>Ubica tu tierra</h3><p>Encuentra tu zona y dibuja el contorno de tu campo sobre el mapa.</p></article><article><Leaf size={30} /><h3>Conoce sus datos</h3><p>Explora registros de clima, suelo y verdor, con sus fechas y su escala.</p></article><article><Sparkles size={30} /><h3>Conversa con TARPU</h3><p>Pregunta con tus propias palabras y abre la evidencia que acompaña la respuesta.</p></article></div>
      </section>
      <section className="landing-cta"><div><Flower2 size={42} /><h2>Tu siguiente paso<br />empieza por conocer.</h2></div><a className="button button-light" href="#/campo">Explorar TARPU<ArrowUpRight size={22} /></a></section>
    </main>
    <footer className="landing-footer"><Logo /><p>Una iniciativa de QENTARA · Arequipa, Perú</p><a href="#/campo">Abrir el mapa<ArrowUpRight size={18} /></a></footer>
  </div>
}

function ClimateChart({ place, metric = 'temperature' }: { place: ReferencePlace; metric?: 'temperature' | 'rain' }) {
  const values = months.map((_, i) => {
    const rows = place.climate.filter(row => Number(row.date.slice(5, 7)) === i + 1)
    return metric === 'temperature' ? mean(rows.map(row => row.temperature)) :
      rows.every(row => row.rain !== null) ? rows.reduce((sum, row) => sum + (row.rain ?? 0), 0) : null
  })
  const available = values.filter((value): value is number => value !== null)
  const min = metric === 'rain' ? 0 : Math.floor(Math.min(...available)) - 1
  const max = Math.ceil(Math.max(...available)) + 1
  const position = (value: number) => 128 - (value - min) / (max - min) * 100
  const path = values.map((value, i) => value === null ? '' : `${i === 0 || values[i - 1] === null ? 'M' : 'L'} ${34 + i * 40} ${position(value)}`).join(' ')
  return <div className="climate-chart"><svg viewBox="0 0 510 172" role="img" aria-label={`${metric === 'temperature' ? 'Temperatura media mensual' : 'Lluvia mensual'} de ${place.name} en 2025. Tabla disponible en Mis datos.`}>
    {[0, 1, 2].map(i => <g key={i}><line x1="30" y1={28 + i * 50} x2="485" y2={28 + i * 50} stroke="#e4e8dd" strokeDasharray="3 5" /><text x="493" y={33 + i * 50}>{number(max - (max - min) * i / 2, 0)}</text></g>)}
    {metric === 'rain' ? values.map((value, i) => value !== null && <rect key={i} x={22 + i * 40} y={position(value)} width="23" height={128 - position(value)} rx="5" fill="#789a74"><title>{months[i]} {number(value)} mm</title></rect>) :
      <><path d={path} fill="none" stroke="#567b49" strokeWidth="3" strokeLinejoin="round" />{values.map((value, i) => value !== null && <circle key={i} cx={34 + i * 40} cy={position(value)} r="4" fill="#567b49"><title>{months[i]} {number(value)} °C</title></circle>)}</>}
    {months.map((month, i) => <text key={month} x={34 + i * 40} y="161" textAnchor="middle">{month}</text>)}
  </svg><p>{metric === 'temperature' ? 'Promedio de T2M por mes · °C' : 'Suma de lluvia por mes · mm'} · NASA POWER · 2025</p></div>
}

function SourceCards({ place }: { place: ReferencePlace }) {
  const sources = [
    { icon: CloudSun, name: 'Clima', provider: 'NASA POWER', scale: 'Celda de ≈ 55 × 67 km · datos diarios', period: '1 ene – 31 dic 2025', url: place.sources.climate.request_url, description: 'Temperatura a 2 m y lluvia de la zona.' },
    { icon: Leaf, name: 'Verdor', provider: 'MODIS · ORNL DAAC', scale: 'Píxel de ≈ 250 m · cada 16 días', period: `${formatDate(place.vegetation[0].date)} – ${formatDate(place.vegetation.at(-1)!.date)}`, url: 'https://modis.ornl.gov/', description: 'NDVI acompañado por la calidad del píxel.' },
    { icon: Sprout, name: 'Suelo', provider: 'ISRIC SoilGrids 2.0', scale: 'Predicción a 250 m · 0–5 y 5–15 cm', period: 'Estimación estática, con percentiles 5 y 95', url: 'https://soilgrids.org/', description: 'pH, arena, arcilla y carbono orgánico estimados.' },
  ]
  return <div className="source-cards">{sources.map(source => <article key={source.name}><source.icon size={24} /><div><h3>{source.name}<span>{source.provider}</span></h3><p>{source.description}</p><p>{source.scale}</p><p>{source.period}</p><a href={source.url} target="_blank" rel="noreferrer">Consultar fuente<ExternalLink size={17} /></a></div></article>)}</div>
}

function DataView({ place, field, notify }: { place: ReferencePlace; field: Field | null; notify: (text: string) => void }) {
  const [category, setCategory] = useState('climate')
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)
  const rows = category === 'climate' ? place.climate.map(row => ({ date: row.date, variable: 'Temperatura media', value: number(row.temperature, 2), unit: '°C', detail: `Lluvia ${number(row.rain, 2)} mm · mínima ${number(row.minimum, 2)} °C` })) :
    category === 'vegetation' ? place.vegetation.map(row => ({ date: row.date, variable: 'Verdor · NDVI', value: number(row.value, 4), unit: 'Sin unidad', detail: `Calidad ${row.quality}` })) :
      place.soil.map(row => ({ date: '', variable: soilName(row.property), value: number(row.mean), unit: row.unit === '-' ? 'pH' : row.unit,
        detail: `${row.depth} · P5–P95 ${number(row.low)} – ${number(row.high)}` }))
  const filtered = rows.filter(row => `${row.variable} ${row.detail} ${row.date}`.toLowerCase().includes(query.toLowerCase()) &&
    (category === 'soil' || ((!from || row.date >= from) && (!to || row.date <= to))))
  useEffect(() => setPage(0), [query, category, from, to, place])
  const source = category === 'climate' ? 'NASA POWER · Daily Point API · 2025 · celda ≈ 55 × 67 km' :
    category === 'vegetation' ? 'MOD13Q1 v061 · ORNL DAAC · píxel ≈ 250 m / 16 días' : 'ISRIC SoilGrids 2.0 · predicción a 250 m'
  function exportCsv() {
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`
    const lines = [['fecha', 'variable', 'valor', 'unidad', 'detalle', 'lugar', 'fuente'], ...filtered.map(row => [row.date, row.variable, row.value, row.unit, row.detail, place.name, source])]
    download(`tarpu-${place.id}-${category}.csv`, '\uFEFF' + lines.map(line => line.map(escape).join(',')).join('\r\n'), 'text/csv;charset=utf-8')
    notify('La selección se descargó con su fuente y sus unidades.')
  }
  if (field) return <div className="empty-panel"><Database size={38} /><h2>Tu campo ya tiene un lugar.</h2><p>Sus consultas ambientales están pendientes de conectar. Puedes descargar el contorno y la información que declaraste.</p><button className="button-primary" onClick={() => download(`tarpu-${field.id}.geojson`, JSON.stringify({ type: 'Feature', properties: { name: field.name, crop: field.crop, water: field.water, origin: 'declarado por el usuario' }, geometry: { type: 'Polygon', coordinates: [field.coordinates] } }, null, 2))}><ArrowDownToLine size={21} />Descargar mi campo</button></div>
  return <div className="data-view"><div className="section-intro"><span className="eyebrow">CADA DATO, CON SU ORIGEN</span><h1>La información, a tu alcance.</h1><p>Consulta guardada de {place.name}. Explora los registros y lleva contigo la evidencia.</p></div>
    <div className="data-actions"><div className="segmented" aria-label="Tipo de registros">{[['climate', 'Clima'], ['vegetation', 'Verdor'], ['soil', 'Suelo']].map(([id, label]) => <button key={id} aria-pressed={category === id} className={category === id ? 'selected' : ''} onClick={() => setCategory(id)}>{label}</button>)}</div>
      <div><button className="button-secondary" onClick={() => { download(`tarpu-${place.id}.json`, JSON.stringify({ origin: 'consulta real guardada del repositorio', place }, null, 2)); notify('Consulta completa descargada con su procedencia.') }}><ArrowDownToLine size={19} />Consulta JSON</button><button className="button-primary" onClick={exportCsv} disabled={!filtered.length}><ArrowDownToLine size={19} />Descargar CSV</button></div></div>
    <div className="records-card"><div className="records-filters"><label className="search-field"><Search size={20} /><input aria-label="Buscar registros" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar en los registros…" /></label>{category !== 'soil' && <div className="date-filters"><label>Desde<input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label><label>Hasta<input type="date" value={to} min={from} onChange={event => setTo(event.target.value)} /></label></div>}</div>
      <p className="records-source"><ShieldCheck size={19} />{source}</p><div className="table-scroll"><table><caption className="sr-only">Registros de {place.name} con unidades y cobertura</caption><thead><tr><th>Fecha</th><th>Variable</th><th>Valor</th><th>Unidad</th><th>Detalle</th></tr></thead><tbody>{filtered.slice(page * 10, page * 10 + 10).map((row, i) => <tr key={`${category}-${i}`}><td>{row.date ? formatDate(row.date) : 'Estático'}</td><td>{row.variable}</td><td className="numeric">{row.value}</td><td>{row.unit}</td><td>{row.detail}</td></tr>)}</tbody></table></div>
      {!filtered.length && <p className="no-records">No hay registros para esos filtros. Prueba otro período o búsqueda.</p>}
      <footer className="table-footer"><span>{filtered.length} registros · {place.name}</span><div><button disabled={page === 0} onClick={() => setPage(value => value - 1)}>Anterior</button><span>{page + 1} / {Math.max(1, Math.ceil(filtered.length / 10))}</span><button disabled={(page + 1) * 10 >= filtered.length} onClick={() => setPage(value => value + 1)}>Siguiente</button></div></footer></div>
    <div className="data-bottom"><p><ShieldCheck size={24} />Cada registro conserva los faltantes de la fuente. Los valores describen el punto de consulta y la escala de su producto.</p><button className="button-secondary" onClick={() => window.print()}>Imprimir consulta<ArrowUpRight size={19} /></button></div><SourceCards place={place} />
  </div>
}

function CropView({ place, field }: { place: ReferencePlace; field: Field | null }) {
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [compare, setCompare] = useState(false)
  useEffect(() => { setSelected([]); setCompare(false) }, [place, field])
  const crops = place.crops.filter(crop => cropName(crop.clave).toLowerCase().includes(search.toLowerCase()))
  return <div className="crop-view"><div className="section-intro"><span className="eyebrow">EXPLORA LAS POSIBILIDADES</span><h1>¿Qué se siembra en tu zona?</h1><p>{place.sectorName} · Cultivos ordenados por superficie sembrada en el censo de 2012.</p></div>
    <div className="crop-context"><MapPin size={23} /><p><strong>{place.name}</strong><span>{field ? `Referencia regional para explorar. La evaluación de «${field.name}» está pendiente.` : 'Estás explorando los cultivos de este lugar de referencia.'}</span></p><span className="tag">INEI · CENAGRO 2012</span></div>
    <div className="crop-toolbar"><label className="search-field"><Search size={21} /><input aria-label="Buscar cultivo" value={search} onChange={event => setSearch(event.target.value)} placeholder="Busca un cultivo…" /></label><span>Selecciona hasta 3 para ver sus fichas</span></div>
    <div className="crop-grid">{crops.map(crop => {
      const active = selected.includes(crop.clave)
      return <button key={crop.clave} className={`crop-card ${active ? 'is-selected' : ''}`} aria-pressed={active} disabled={!active && selected.length === 3} onClick={() => setSelected(previous => active ? previous.filter(key => key !== crop.clave) : [...previous, crop.clave])}>
        <div className="crop-card-top"><span className="crop-symbol"><Sprout size={30} /></span><span className="selection-circle">{active && <Check size={19} />}</span></div><h2>{cropName(crop.clave)}</h2><p className="scientific-name">{crop.cientifico}</p><div className="crop-acreage"><strong>{number(crop.ha_2012, 1)} <span>ha</span></strong><span>Sembradas en este sector · 2012</span></div></button>
    })}</div>{!crops.length && <p>No encontramos ese cultivo en las ocho fichas de este sector.</p>}
    <div className="compare-bar"><div><strong>{selected.length} de 3 seleccionados</strong><span>Las fichas ayudan a explorar la información disponible.</span></div><button className="button-primary" disabled={selected.length < 2} onClick={() => setCompare(true)}>Ver fichas juntas<ArrowRight size={20} /></button></div>
    <p className="evidence-note"><ShieldCheck size={22} />El censo describe lo que se sembraba en 2012. La comparación agronómica con clima, suelo e historial está pendiente de conectar al motor.</p>
    {compare && <Modal label="Fichas de cultivos" onClose={() => setCompare(false)}><h2>Una mirada a tu selección</h2><div className="comparison-grid">{place.crops.filter(crop => selected.includes(crop.clave)).map(crop => <article key={crop.clave}><Sprout size={29} /><h3>{cropName(crop.clave)}</h3><p>{crop.cientifico}</p><strong>{number(crop.ha_2012)} ha</strong><p>Superficie sembrada en {place.sectorName.toLowerCase()} en 2012.</p><span className="pending">Evaluación de tu campo pendiente</span></article>)}</div><p className="muted">Para comparar alternativas de campaña se necesita tu cultivo actual, agua disponible, meses de campaña y evidencia procesada por el motor.</p><a className="text-button" href="http://censos1.inei.gob.pe/Cenagro/redatam/" target="_blank" rel="noreferrer">Fuente del censo<ExternalLink size={18} /></a></Modal>}
  </div>
}

export function App() {
  const [page, setPage] = useState<Page>(currentPage)
  const [placeId, setPlaceId] = useState(places[0].id)
  const [fields, setFields] = useState<Field[]>(readFields)
  const [fieldId, setFieldId] = useState<string | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [draft, setDraft] = useState<Coordinate[] | null>(null)
  const [modal, setModal] = useState<'fields' | 'help' | 'sources' | 'coordinates' | null>(null)
  const [drawer, setDrawer] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [menu, setMenu] = useState(false)
  const [toast, setToast] = useState('')
  const [panelTab, setPanelTab] = useState('summary')
  const [chartMetric, setChartMetric] = useState<'temperature' | 'rain'>('temperature')
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({})
  const place = places.find(item => item.id === placeId) ?? places[0]
  const field = fields.find(item => item.id === fieldId) ?? null
  const contextKey = field ? `field:${field.id}` : `reference:${place.id}`
  const messages = conversations[contextKey] ?? []
  const summary = climateSummary(place)
  const ndvi = place.vegetation.at(-1)!
  const ph = place.soil.find(row => row.property === 'phh2o' && row.depth === '0-5cm')

  useEffect(() => { const listener = () => { setPage(currentPage()); setMenu(false); setDrawing(false); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', listener)
    return () => window.removeEventListener('hashchange', listener)
  }, [])
  useEffect(() => {
    try { localStorage.setItem('tarpu.fields.v2', JSON.stringify(fields)) }
    catch { setToast('El navegador no pudo guardar tus campos. Descarga su contorno desde Mis datos.') }
  }, [fields])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 6500)
    return () => clearTimeout(timer)
  }, [toast])
  useEffect(() => { document.title = page === 'inicio' ? 'TARPU · Una mirada más clara a tu tierra' : `${navigation.find(item => item.id === page)?.label} · TARPU` }, [page])

  function onMessagesChange(value: ChatMessage[]) { setConversations(previous => ({ ...previous, [contextKey]: value })) }
  function startDrawing() { setModal(null); setPage('campo'); location.hash = '/campo'; setTimeout(() => setDrawing(true), 0) }
  function saveField(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft) return
    const values = new FormData(event.currentTarget)
    const newField: Field = { id: crypto.randomUUID(), name: String(values.get('name')).trim(),
      crop: String(values.get('crop')).trim(), water: String(values.get('water')), coordinates: draft, createdAt: new Date().toISOString() }
    if (!newField.name) return
    setFields(previous => [...previous, newField]); setFieldId(newField.id); setDraft(null)
    setToast('Tu campo se guardó en este navegador. Su información está rotulada como declarada por ti.')
  }
  if (page === 'inicio') return <Landing />

  return <div className={`application ${largeText ? 'larger-text' : ''}`}>
    <a className="skip-link" href="#main">Saltar al contenido</a>
    <aside className={`sidebar ${menu ? 'mobile-open' : ''}`}><a className="sidebar-brand" href="#/" aria-label="TARPU, inicio"><Logo /></a>
      <span className="sidebar-caption">TU TIERRA, MÁS CERCA</span><nav aria-label="Navegación del campo">{navigation.map(item => <a key={item.id} href={`#/${item.id}`} className={page === item.id ? 'active' : ''} aria-current={page === item.id ? 'page' : undefined}><item.icon size={23} /><span>{item.label}</span>{page === item.id && <span className="nav-indicator" />}</a>)}</nav>
      <div className="sidebar-note"><Flower2 size={30} /><p>Tu conocimiento.<br /><strong>Otra perspectiva.</strong></p><button onClick={() => setDrawer(true)}>Pregunta a TARPU<ArrowUpRight size={17} /></button></div>
      <div className="sidebar-bottom"><button onClick={() => setLargeText(value => !value)} aria-pressed={largeText}><Type size={22} />{largeText ? 'Letra estándar' : 'Letra más grande'}</button><button onClick={() => setModal('help')}><CircleHelp size={22} />Necesito ayuda</button><div className="team-signature"><span>Q</span><p>Hecho por QENTARA<small>Arequipa, Perú</small></p></div></div>
    </aside>
    <div className="workspace"><header className="workspace-header"><button className="mobile-menu button-quiet" onClick={() => setMenu(value => !value)} aria-expanded={menu}><Menu size={22} />Menú</button><div className="breadcrumb">Mi espacio<span>/</span><strong>{navigation.find(item => item.id === page)?.label}</strong></div>
      <div className="header-actions"><span className="region"><MapPin size={18} />Arequipa, Perú</span><button className="button-secondary" onClick={() => setModal('fields')}><MapPinned size={20} />Mis campos<span className="field-count">{fields.length}</span></button></div></header>
      <main id="main" tabIndex={-1}>
        <div className="context-bar"><label><MapPin size={19} /><span className="sr-only">Lugar de consulta</span><select aria-label="Lugar de consulta" value={field ? `field:${field.id}` : placeId} onChange={event => {
          setDrawing(false)
          if (event.target.value.startsWith('field:')) setFieldId(event.target.value.slice(6))
          else { setPlaceId(event.target.value); setFieldId(null) }
        }}><optgroup label="Consultas reales guardadas">{places.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</optgroup>{fields.length > 0 && <optgroup label="Campos declarados por ti">{fields.map(item => <option key={item.id} value={`field:${item.id}`}>{item.name}</option>)}</optgroup>}</select><ChevronDown size={17} /></label><span>{field ? 'Declarado por ti · guardado en este navegador' : 'Consulta guardada · punto de referencia'}</span></div>
        {page === 'campo' && <>
          <div className="field-heading"><div><span className="eyebrow">UNA MIRADA A TU TIERRA</span><h1>Conoce mejor tu campo<span>.</span></h1><p>Lo que sabemos, de dónde viene y qué falta por conocer.</p></div><button className="button-primary" onClick={startDrawing}><Plus size={21} />Dibujar mi campo</button></div>
          <section className={`map-workspace ${drawing ? 'drawing-active' : ''}`} aria-label="Consulta del campo">
            <FieldMap place={place} field={field} drawing={drawing} onDrawingChange={setDrawing} onComplete={setDraft} />
            {!drawing && <div className="field-panel"><div className="field-panel-heading"><div className="place-avatar"><Sprout size={24} /></div><div><h2>{field?.name ?? place.name}</h2><p>{field ? 'Tu campo · Arequipa' : place.sectorName}</p></div><MapPin size={23} /></div>
              <div className="panel-tabs" aria-label="Información del campo"><button aria-pressed={panelTab === 'summary'} className={panelTab === 'summary' ? 'active' : ''} onClick={() => setPanelTab('summary')}>Resumen</button><button aria-pressed={panelTab === 'sources'} className={panelTab === 'sources' ? 'active' : ''} onClick={() => setPanelTab('sources')}>Fuentes y alcance</button></div>
              {panelTab === 'sources' ? <div className="panel-source-list"><p>Esta consulta conserva registros reales del repositorio.</p><SourceCards place={place} /><button className="text-button" onClick={() => setModal('sources')}>Ver procedencia completa<ArrowUpRight size={18} /></button></div> : field ? <div className="field-pending"><span className="tag">Declarado por ti</span><h3>Este es tu punto de partida.</h3><dl><div><dt>Cultivo actual</dt><dd>{field.crop || 'Sin declarar'}</dd></div><div><dt>Agua disponible</dt><dd>{field.water}</dd></div><div><dt>Contorno</dt><dd>{field.coordinates.length - 1} esquinas</dd></div></dl><p>La consulta ambiental y la comparación de cultivos están pendientes de conectar.</p><a className="button button-secondary" href="#/datos">Ver mi información<ArrowRight size={18} /></a></div> : <>
                <div className="panel-notice"><ShieldCheck size={18} /><span>Datos históricos y estimaciones de la zona</span></div>
                <div className="metric-grid"><article><span><Thermometer size={18} />Temperatura media</span><strong>{number(summary.temperature)}<small>°C</small></strong><p>NASA POWER · año 2025</p></article><article><span><Droplets size={18} />Lluvia acumulada</span><strong>{number(summary.rain, 0)}<small>mm</small></strong><p>NASA POWER · año 2025</p></article><article><span><Leaf size={18} />Verdor observado</span><strong>{number(ndvi.value, 3)}</strong><p>MODIS · {formatDate(ndvi.date)}</p></article><article><span><Sprout size={18} />pH estimado</span><strong>{number(ph?.mean ?? null)}</strong><p>SoilGrids · 0–5 cm</p></article></div>
                <div className="panel-relief"><span><MapPin size={18} />Altitud del punto</span><strong>{number(place.relief.altitud_m, 0)} m</strong><small>NASADEM · 30 m</small></div>
                <button className="panel-detail-link" onClick={() => setModal('sources')}>Conocer las fuentes y sus límites<ArrowUpRight size={19} /></button>
              </>}
              <button className="panel-agent" onClick={() => setDrawer(true)}><span className="mini-spark"><Sparkles size={22} /></span><span><strong>Entendámoslo juntos</strong><small>Pregúntale a TARPU sobre estos datos</small></span><ArrowUpRight size={22} /></button>
            </div>}
            {!drawing && <div className="map-place-note"><span className="live-dot" /><p>{field ? 'Contorno declarado por ti' : 'Punto de consulta'}<strong>{field?.name ?? place.name}</strong></p><ScanLine size={27} /></div>}
            {!drawing && <button className="coordinate-button" onClick={() => setModal('coordinates')}><MapPin size={18} />Ingresar coordenadas</button>}
          </section>
          <div className="below-map"><article className="season-card"><div className="card-heading"><div><span className="eyebrow">EL CLIMA TIENE HISTORIA</span><h2>Un año en {place.name}</h2></div><label className="metric-select"><SlidersHorizontal size={18} /><select aria-label="Variable del gráfico" value={chartMetric} onChange={event => setChartMetric(event.target.value as 'temperature' | 'rain')}><option value="temperature">Temperatura</option><option value="rain">Lluvia</option></select></label></div>{field ? <p className="pending-chart">Los históricos de tu campo están pendientes. Puedes explorar una consulta guardada desde el selector de lugar.</p> : <ClimateChart place={place} metric={chartMetric} />}<a className="text-button" href="#/datos">Explorar los registros<ArrowRight size={18} /></a></article>
            <article className="next-step-card"><div className="next-step-icon"><Sprout size={29} /></div><span className="eyebrow">TU PRÓXIMA CAMPAÑA</span><h2>¿Y después,<br />qué sembramos?</h2><p>Conoce los cultivos registrados en tu zona y explora su información.</p><a className="button button-secondary" href="#/cultivos">Explorar cultivos<ArrowUpRight size={21} /></a></article></div>
        </>}
        {page === 'datos' && <DataView key={contextKey} place={place} field={field} notify={setToast} />}
        {page === 'cultivos' && <CropView place={place} field={field} />}
        {page === 'agente' && <div className="agent-page"><div className="agent-page-intro"><span className="eyebrow">AQUÍ, PARA ACOMPAÑARTE</span><h1>Hablemos de tu campo.</h1><p>Una conversación sencilla, con los datos sobre la mesa.</p></div><Chat key={contextKey} place={place} field={field} messages={messages} onMessagesChange={onMessagesChange} /></div>}
      </main><footer className="workspace-footer"><span>TARPU · QENTARA</span><span>Tu tierra. Tus decisiones.</span><button onClick={() => setModal('sources')}>Fuentes y transparencia<ArrowUpRight size={16} /></button></footer>
    </div>
    {page !== 'agente' && !drawer && <button className="floating-chat" onClick={() => setDrawer(true)}><Sparkles size={22} /><span>Hablar con TARPU</span><MessageCircle size={20} /></button>}
    {drawer && <Modal label="Agente TARPU" className="chat-drawer" onClose={() => setDrawer(false)}><Chat key={contextKey} compact place={place} field={field} messages={messages} onMessagesChange={onMessagesChange} /></Modal>}
    {modal === 'sources' && <Modal label="Fuentes y transparencia" onClose={() => setModal(null)}><h2>La evidencia, siempre a la vista.</h2><p>Consulta guardada de {place.name}. Los datos se prepararon a partir de los archivos originales, normalizados y de procedencia del repositorio.</p><SourceCards place={place} /><p className="muted">Los campos que dibujes se guardan como declaraciones del usuario. La extracción en vivo, el motor y la IA generativa tienen su integración pendiente.</p><button className="button-primary" onClick={() => download(`tarpu-procedencia-${place.id}.json`, JSON.stringify(place.sources, null, 2))}><ArrowDownToLine size={20} />Descargar procedencia</button></Modal>}
    {modal === 'help' && <Modal label="Ayuda" onClose={() => setModal(null)}><h2>Vamos paso a paso.</h2><div className="help-steps"><article><MapPinned size={27} /><div><h3>Empieza por el mapa</h3><p>Elige Majes o Chivay para explorar una consulta guardada. «Dibujar mi campo» permite marcar las esquinas de tu terreno.</p></div></article><article><Database size={27} /><div><h3>Abre tus datos</h3><p>En «Mis datos» puedes leer los registros, buscar fechas y descargar la selección.</p></div></article><article><Sparkles size={27} /><div><h3>Pregunta con confianza</h3><p>TARPU explica las fuentes y los datos de la consulta abierta. Puedes escuchar la última respuesta.</p></div></article></div><button className="button-primary" onClick={() => { setModal(null); setDrawer(true) }}>Abrir conversación<ArrowRight size={20} /></button></Modal>}
    {modal === 'fields' && <Modal label="Mis campos" onClose={() => setModal(null)}><h2>Un lugar para cada campo.</h2><p>Los contornos y tus declaraciones se guardan en este navegador.</p><div className="field-list">{fields.map(item => <article key={item.id}><MapPinned size={25} /><button onClick={() => { setFieldId(item.id); setModal(null); location.hash = '/campo' }}><strong>{item.name}</strong><span>{item.crop || 'Cultivo sin declarar'} · {item.coordinates.length - 1} esquinas</span></button><button aria-label={`Eliminar ${item.name}`} onClick={() => { setFields(previous => previous.filter(value => value.id !== item.id)); if (fieldId === item.id) setFieldId(null); setToast('Campo retirado de este navegador.') }}><Trash2 size={20} /></button></article>)}</div>{!fields.length && <div className="empty-fields"><MapPinned size={38} /><h3>Tu primer campo empieza aquí.</h3><p>Ubica tu terreno y marca sus esquinas en el mapa.</p></div>}<button className="button-primary" onClick={startDrawing}><Plus size={21} />Dibujar un campo</button></Modal>}
    {modal === 'coordinates' && <CoordinateDialog onClose={() => setModal(null)} onComplete={coordinates => { setDraft(coordinates); setModal(null) }} />}
    {draft && <Modal label="Guardar mi campo" onClose={() => setDraft(null)}><h2>Ahora, pongámosle nombre.</h2><p>Contorno de {draft.length - 1} esquinas. Esta información queda declarada por ti.</p><form className="field-form" onSubmit={saveField}><label>Nombre del campo<input name="name" required maxLength={80} placeholder="Como tú lo conoces" autoFocus /></label><label>¿Qué cultivas actualmente?<input name="crop" maxLength={80} placeholder="Puedes dejarlo sin declarar" /></label><label>¿Con qué agua cuentas?<select name="water"><option>Sin declarar</option><option>Riego</option><option>Lluvia</option><option>Riego y lluvia</option></select></label><p className="form-note"><ShieldCheck size={20} />Su consulta ambiental quedará pendiente de conectar.</p><button type="submit" className="button-primary">Guardar mi campo<Check size={20} /></button></form></Modal>}
    {toast && <div className="toast" role="status"><Check size={22} /><p>{toast}</p><button onClick={() => setToast('')} aria-label="Cerrar aviso"><X size={20} /></button></div>}
  </div>
}

function CoordinateDialog({ onClose, onComplete }: { onClose: () => void; onComplete: (coordinates: Coordinate[]) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    const coordinates = value.trim().split('\n').map(line => line.trim().split(/[\s,]+/).map(Number))
    if (coordinates.some(point => point.length !== 2 || !point.every(Number.isFinite) || Math.abs(point[0]) > 180 || Math.abs(point[1]) > 90)) {
      setError('Escribe una longitud y una latitud por línea, separadas por coma, con punto decimal.'); return
    }
    const points = coordinates as Coordinate[]
    if (points.length > 1 && points[0].join() === points.at(-1)!.join()) points.pop()
    if (!validContour(points)) { setError('Se necesitan tres esquinas distintas o más, sin lados que se crucen.'); return }
    onComplete([...points, points[0]])
  }
  return <Modal label="Coordenadas del campo" onClose={onClose}><h2>Ubica tu campo con coordenadas.</h2><p>Escribe una esquina por línea en el orden del contorno. Usa longitud, latitud y punto decimal.</p><form className="field-form" onSubmit={submit}><label>Esquinas de tu campo<textarea rows={6} value={value} onChange={event => setValue(event.target.value)} required aria-describedby="coordinate-error" placeholder="Longitud, latitud" /></label><p id="coordinate-error" role="status">{error}</p><button className="button-primary" type="submit">Continuar<ArrowRight size={20} /></button></form></Modal>
}

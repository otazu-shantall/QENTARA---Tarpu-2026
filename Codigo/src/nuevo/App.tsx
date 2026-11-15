// Frontend nuevo escrito con asistencia de OpenAI Codex. Registro en entrega/uso-de-ia.md.
import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  CloudSun,
  Database,
  ExternalLink,
  Flower2,
  Leaf,
  MapPin,
  MapPinned,
  Menu,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Sprout,
  Trash2,
  Type,
  X,
} from 'lucide-react'
import { Chat } from './Chat'
import { Landing } from './Landing'
import { validContour } from './FieldMap'
import { FieldDashboard } from './FieldDashboard'
import { FieldFiles, ServerJobs } from './FieldFiles'
import { useFieldData } from './fieldData'
import type { FieldData } from './fieldData'
import {
  cropName,
  download,
  formatDate,
  number,
  places,
  readFields,
  soilName,
} from './data'
import type { ChatMessage, Coordinate, Field, ReferencePlace } from './data'

type Page = 'inicio' | 'campo' | 'cultivos' | 'datos' | 'agente'
const navigation = [
  { id: 'campo', label: 'Mi campo', icon: MapPinned },
  { id: 'cultivos', label: 'Cultivos', icon: Sprout },
  { id: 'datos', label: 'Mis datos', icon: Database },
  { id: 'agente', label: 'Agente TARPU', icon: Sparkles },
] as const
function currentPage(): Page {
  const hash = location.hash.replace('#/', '')
  return navigation.some((item) => item.id === hash) ? (hash as Page) : 'inicio'
}

function Modal({
  children,
  label,
  onClose,
  className = '',
}: {
  children: ReactNode
  label: string
  onClose: () => void
  className?: string
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return (
    <dialog
      ref={dialog}
      aria-label={label}
      className={`modal ${className}`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal-top">
        <span className="eyebrow">TARPU · {label}</span>
        <button className="button-quiet" onClick={onClose}>
          <X size={20} />
          Cerrar
        </button>
      </div>
      {children}
    </dialog>
  )
}

function Logo({ white = false }: { white?: boolean }) {
  return (
    <img
      className="logo"
      src={`brand/tarpu-logo-${white ? 'white' : 'black'}.png`}
      alt="TARPU"
    />
  )
}

function SourceCards({ place }: { place: ReferencePlace }) {
  const sources = [
    {
      icon: CloudSun,
      name: 'Clima',
      provider: 'NASA POWER',
      scale: 'Celda de ≈ 55 × 67 km · datos diarios',
      period: '1 ene – 31 dic 2025',
      url: place.sources.climate.request_url,
      description: 'Temperatura a 2 m y lluvia de la zona.',
    },
    {
      icon: Leaf,
      name: 'Verdor',
      provider: 'MODIS · ORNL DAAC',
      scale: 'Píxel de ≈ 250 m · cada 16 días',
      period: `${formatDate(place.vegetation[0].date)} – ${formatDate(place.vegetation.at(-1)!.date)}`,
      url: 'https://modis.ornl.gov/',
      description: 'NDVI acompañado por la calidad del píxel.',
    },
    {
      icon: Sprout,
      name: 'Suelo',
      provider: 'ISRIC SoilGrids 2.0',
      scale: 'Predicción a 250 m · 0–5 y 5–15 cm',
      period: 'Estimación estática, con percentiles 5 y 95',
      url: 'https://soilgrids.org/',
      description: 'pH, arena, arcilla y carbono orgánico estimados.',
    },
  ]
  return (
    <div className="source-cards">
      {sources.map((source) => (
        <article key={source.name}>
          <source.icon size={24} />
          <div>
            <h3>
              {source.name}
              <span>{source.provider}</span>
            </h3>
            <p>{source.description}</p>
            <p>{source.scale}</p>
            <p>{source.period}</p>
            <a href={source.url} target="_blank" rel="noreferrer">
              Consultar fuente
              <ExternalLink size={17} />
            </a>
          </div>
        </article>
      ))}
    </div>
  )
}

function DataView({
  place,
  field,
  fieldData,
  notify,
}: {
  place: ReferencePlace
  field: Field | null
  fieldData: FieldData
  notify: (text: string) => void
}) {
  const [category, setCategory] = useState('climate')
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)
  const rows =
    category === 'climate'
      ? place.climate.map((row) => ({
          date: row.date,
          variable: 'Temperatura media',
          value: number(row.temperature, 2),
          unit: '°C',
          detail: `Lluvia ${number(row.rain, 2)} mm · mínima ${number(row.minimum, 2)} °C`,
        }))
      : category === 'vegetation'
        ? place.vegetation.map((row) => ({
            date: row.date,
            variable: 'Verdor · NDVI',
            value: number(row.value, 4),
            unit: 'Sin unidad',
            detail: `Calidad ${row.quality}`,
          }))
        : place.soil.map((row) => ({
            date: '',
            variable: soilName(row.property),
            value: number(row.mean),
            unit: row.unit === '-' ? 'pH' : row.unit,
            detail: `${row.depth} · P5–P95 ${number(row.low)} – ${number(row.high)}`,
          }))
  const filtered = rows.filter(
    (row) =>
      `${row.variable} ${row.detail} ${row.date}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (category === 'soil' ||
        ((!from || row.date >= from) && (!to || row.date <= to))),
  )
  useEffect(() => setPage(0), [query, category, from, to, place])
  const source =
    category === 'climate'
      ? 'NASA POWER · Daily Point API · 2025 · celda ≈ 55 × 67 km'
      : category === 'vegetation'
        ? 'MOD13Q1 v061 · ORNL DAAC · píxel ≈ 250 m / 16 días'
        : 'ISRIC SoilGrids 2.0 · predicción a 250 m'
  function exportCsv() {
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`
    const lines = [
      ['fecha', 'variable', 'valor', 'unidad', 'detalle', 'lugar', 'fuente'],
      ...filtered.map((row) => [
        row.date,
        row.variable,
        row.value,
        row.unit,
        row.detail,
        place.name,
        source,
      ]),
    ]
    download(
      `tarpu-${place.id}-${category}.csv`,
      '\uFEFF' + lines.map((line) => line.map(escape).join(',')).join('\r\n'),
      'text/csv;charset=utf-8',
    )
    notify('La selección se descargó con su fuente y sus unidades.')
  }
  if (field)
    return <FieldFiles field={field} data={fieldData} notify={notify} />
  return (
    <div className="data-view">
      <div className="section-intro">
        <span className="eyebrow">CADA DATO, CON SU ORIGEN</span>
        <h1>La información, a tu alcance.</h1>
        <p>
          Consulta guardada de {place.name}. Explora los registros y lleva
          contigo la evidencia.
        </p>
      </div>
      <div className="data-actions">
        <div className="segmented" aria-label="Tipo de registros">
          {[
            ['climate', 'Clima'],
            ['vegetation', 'Verdor'],
            ['soil', 'Suelo'],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={category === id}
              className={category === id ? 'selected' : ''}
              onClick={() => setCategory(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div>
          <button
            className="button-secondary"
            onClick={() => {
              download(
                `tarpu-${place.id}.json`,
                JSON.stringify(
                  { origin: 'consulta real guardada del repositorio', place },
                  null,
                  2,
                ),
              )
              notify('Consulta completa descargada con su procedencia.')
            }}
          >
            <ArrowDownToLine size={19} />
            Consulta JSON
          </button>
          <button
            className="button-primary"
            onClick={exportCsv}
            disabled={!filtered.length}
          >
            <ArrowDownToLine size={19} />
            Descargar CSV
          </button>
        </div>
      </div>
      <div className="records-card">
        <div className="records-filters">
          <label className="search-field">
            <Search size={20} />
            <input
              aria-label="Buscar registros"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar en los registros…"
            />
          </label>
          {category !== 'soil' && (
            <div className="date-filters">
              <label>
                Desde
                <input
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                />
              </label>
              <label>
                Hasta
                <input
                  type="date"
                  value={to}
                  min={from}
                  onChange={(event) => setTo(event.target.value)}
                />
              </label>
            </div>
          )}
        </div>
        <p className="records-source">
          <ShieldCheck size={19} />
          {source}
        </p>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">
              Registros de {place.name} con unidades y cobertura
            </caption>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Variable</th>
                <th>Valor</th>
                <th>Unidad</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(page * 10, page * 10 + 10).map((row, i) => (
                <tr key={`${category}-${i}`}>
                  <td>{row.date ? formatDate(row.date) : 'Estático'}</td>
                  <td>{row.variable}</td>
                  <td className="numeric">{row.value}</td>
                  <td>{row.unit}</td>
                  <td>{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <p className="no-records">
            No hay registros para esos filtros. Prueba otro período o búsqueda.
          </p>
        )}
        <footer className="table-footer">
          <span>
            {filtered.length} registros · {place.name}
          </span>
          <div>
            <button
              disabled={page === 0}
              onClick={() => setPage((value) => value - 1)}
            >
              Anterior
            </button>
            <span>
              {page + 1} / {Math.max(1, Math.ceil(filtered.length / 10))}
            </span>
            <button
              disabled={(page + 1) * 10 >= filtered.length}
              onClick={() => setPage((value) => value + 1)}
            >
              Siguiente
            </button>
          </div>
        </footer>
      </div>
      <div className="data-bottom">
        <p>
          <ShieldCheck size={24} />
          Cada registro conserva los faltantes de la fuente. Los valores
          describen el punto de consulta y la escala de su producto.
        </p>
        <button className="button-secondary" onClick={() => window.print()}>
          Imprimir consulta
          <ArrowUpRight size={19} />
        </button>
      </div>
      <SourceCards place={place} />
    </div>
  )
}

function CropView({
  place,
  field,
}: {
  place: ReferencePlace
  field: Field | null
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [compare, setCompare] = useState(false)
  useEffect(() => {
    setSelected([])
    setCompare(false)
  }, [place, field])
  const crops = place.crops.filter((crop) =>
    cropName(crop.clave).toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <div className="crop-view">
      <div className="section-intro">
        <span className="eyebrow">EXPLORA LAS POSIBILIDADES</span>
        <h1>¿Qué se siembra en tu zona?</h1>
        <p>
          {place.sectorName} · Cultivos ordenados por superficie sembrada en el
          censo de 2012.
        </p>
      </div>
      <div className="crop-context">
        <MapPin size={23} />
        <p>
          <strong>{place.name}</strong>
          <span>
            {field
              ? `Referencia regional para explorar. La evaluación de «${field.name}» está pendiente.`
              : 'Estás explorando los cultivos de este lugar de referencia.'}
          </span>
        </p>
        <span className="tag">INEI · CENAGRO 2012</span>
      </div>
      <div className="crop-toolbar">
        <label className="search-field">
          <Search size={21} />
          <input
            aria-label="Buscar cultivo"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busca un cultivo…"
          />
        </label>
        <span>Selecciona hasta 3 para ver sus fichas</span>
      </div>
      <div className="crop-grid">
        {crops.map((crop) => {
          const active = selected.includes(crop.clave)
          return (
            <button
              key={crop.clave}
              className={`crop-card ${active ? 'is-selected' : ''}`}
              aria-pressed={active}
              disabled={!active && selected.length === 3}
              onClick={() =>
                setSelected((previous) =>
                  active
                    ? previous.filter((key) => key !== crop.clave)
                    : [...previous, crop.clave],
                )
              }
            >
              <div className="crop-card-top">
                <span className="crop-symbol">
                  <Sprout size={30} />
                </span>
                <span className="selection-circle">
                  {active && <Check size={19} />}
                </span>
              </div>
              <h2>{cropName(crop.clave)}</h2>
              <p className="scientific-name">{crop.cientifico}</p>
              <div className="crop-acreage">
                <strong>
                  {number(crop.ha_2012, 1)} <span>ha</span>
                </strong>
                <span>Sembradas en este sector · 2012</span>
              </div>
            </button>
          )
        })}
      </div>
      {!crops.length && (
        <p>No encontramos ese cultivo en las ocho fichas de este sector.</p>
      )}
      <div className="compare-bar">
        <div>
          <strong>{selected.length} de 3 seleccionados</strong>
          <span>Las fichas ayudan a explorar la información disponible.</span>
        </div>
        <button
          className="button-primary"
          disabled={selected.length < 2}
          onClick={() => setCompare(true)}
        >
          Ver fichas juntas
          <ArrowRight size={20} />
        </button>
      </div>
      <p className="evidence-note">
        <ShieldCheck size={22} />
        El censo describe lo que se sembraba en 2012. La comparación agronómica
        con clima, suelo e historial está pendiente de conectar al motor.
      </p>
      {compare && (
        <Modal label="Fichas de cultivos" onClose={() => setCompare(false)}>
          <h2>Una mirada a tu selección</h2>
          <div className="comparison-grid">
            {place.crops
              .filter((crop) => selected.includes(crop.clave))
              .map((crop) => (
                <article key={crop.clave}>
                  <Sprout size={29} />
                  <h3>{cropName(crop.clave)}</h3>
                  <p>{crop.cientifico}</p>
                  <strong>{number(crop.ha_2012)} ha</strong>
                  <p>
                    Superficie sembrada en {place.sectorName.toLowerCase()} en
                    2012.
                  </p>
                  <span className="pending">
                    Evaluación de tu campo pendiente
                  </span>
                </article>
              ))}
          </div>
          <p className="muted">
            Para comparar alternativas de campaña se necesita tu cultivo actual,
            agua disponible, meses de campaña y evidencia procesada por el
            motor.
          </p>
          <a
            className="text-button"
            href="http://censos1.inei.gob.pe/Cenagro/redatam/"
            target="_blank"
            rel="noreferrer"
          >
            Fuente del censo
            <ExternalLink size={18} />
          </a>
        </Modal>
      )}
    </div>
  )
}

export function App() {
  const [page, setPage] = useState<Page>(currentPage)
  const [placeId, setPlaceId] = useState(places[0].id)
  const [fields, setFields] = useState<Field[]>(readFields)
  const [fieldId, setFieldId] = useState<string | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [draft, setDraft] = useState<Coordinate[] | null>(null)
  const [modal, setModal] = useState<
    'fields' | 'help' | 'sources' | 'coordinates' | null
  >(null)
  const [drawer, setDrawer] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [menu, setMenu] = useState(false)
  const [toast, setToast] = useState('')
  const [conversations, setConversations] = useState<
    Record<string, ChatMessage[]>
  >({})
  const place = places.find((item) => item.id === placeId) ?? places[0]
  const field = fields.find((item) => item.id === fieldId) ?? null
  const contextKey = field ? `field:${field.id}` : `reference:${place.id}`
  const messages = conversations[contextKey] ?? []
  const fieldData = useFieldData(field)

  useEffect(() => {
    const listener = () => {
      setPage(currentPage())
      setMenu(false)
      setDrawing(false)
      if (location.hash.startsWith('#/')) window.scrollTo(0, 0)
      else
        requestAnimationFrame(() =>
          document.getElementById(location.hash.slice(1))?.scrollIntoView(),
        )
    }
    window.addEventListener('hashchange', listener)
    return () => window.removeEventListener('hashchange', listener)
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem('tarpu.fields.v2', JSON.stringify(fields))
    } catch {
      setToast(
        'El navegador no pudo guardar tus campos. Descarga su contorno desde Mis datos.',
      )
    }
  }, [fields])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 6500)
    return () => clearTimeout(timer)
  }, [toast])
  useEffect(() => {
    document.title =
      page === 'inicio'
        ? 'TARPU · Una mirada más clara a tu tierra'
        : `${navigation.find((item) => item.id === page)?.label} · TARPU`
  }, [page])

  function onMessagesChange(value: ChatMessage[]) {
    setConversations((previous) => ({ ...previous, [contextKey]: value }))
  }
  function startDrawing() {
    setModal(null)
    setMenu(false)
    setPage('campo')
    location.hash = '/campo'
    setTimeout(() => setDrawing(true), 0)
  }
  function saveField(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft) return
    const values = new FormData(event.currentTarget)
    const newField: Field = {
      id: crypto.randomUUID(),
      name: String(values.get('name')).trim(),
      crop: String(values.get('crop')).trim(),
      water: String(values.get('water')),
      coordinates: draft,
      createdAt: new Date().toISOString(),
    }
    if (!newField.name) return
    setFields((previous) => [...previous, newField])
    setFieldId(newField.id)
    setDraft(null)
    setToast(
      'Tu campo se guardó en este navegador. Ahora leemos sus datos reales en el servidor.',
    )
  }
  if (page === 'inicio') return <Landing />

  return (
    <div
      className={`application ${page === 'campo' ? 'map-page' : ''} ${largeText ? 'larger-text' : ''}`}
    >
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        Saltar al contenido
      </a>
      <aside className={`sidebar ${menu ? 'mobile-open' : ''}`}>
        <a className="sidebar-brand" href="#/" aria-label="TARPU, inicio">
          <Logo />
        </a>
        <span className="sidebar-caption">TU TIERRA, MÁS CERCA</span>
        <nav aria-label="Navegación del campo">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={`#/${item.id}`}
              className={page === item.id ? 'active' : ''}
              aria-current={page === item.id ? 'page' : undefined}
              onClick={() => setMenu(false)}
            >
              <item.icon size={23} />
              <span>{item.label}</span>
              {page === item.id && <span className="nav-indicator" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-note">
          <Flower2 size={30} />
          <p>
            Tu conocimiento.
            <br />
            <strong>Otra perspectiva.</strong>
          </p>
          <button onClick={() => setDrawer(true)}>
            Pregunta a TARPU
            <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="sidebar-bottom">
          <button
            onClick={() => setLargeText((value) => !value)}
            aria-pressed={largeText}
          >
            <Type size={22} />
            {largeText ? 'Letra estándar' : 'Letra más grande'}
          </button>
          <button onClick={() => setModal('help')}>
            <CircleHelp size={22} />
            Necesito ayuda
          </button>
          <div className="team-signature">
            <span>Q</span>
            <p>
              Hecho por QENTARA<small>Arequipa, Perú</small>
            </p>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-header">
          <button
            className="mobile-menu button-quiet"
            onClick={() => setMenu((value) => !value)}
            aria-expanded={menu}
          >
            <Menu size={22} />
            Menú
          </button>
          <div className="breadcrumb">
            Mi espacio<span>/</span>
            <strong>
              {navigation.find((item) => item.id === page)?.label}
            </strong>
          </div>
          <div className="header-actions">
            <span className="region">
              <MapPin size={18} />
              Arequipa, Perú
            </span>
            <button
              className="button-secondary"
              onClick={() => setModal('fields')}
            >
              <MapPinned size={20} />
              Mis campos<span className="field-count">{fields.length}</span>
            </button>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <div className="context-bar">
            <label>
              <MapPin size={19} />
              <span className="sr-only">Lugar de consulta</span>
              <select
                aria-label="Lugar de consulta"
                value={field ? `field:${field.id}` : placeId}
                onChange={(event) => {
                  setDrawing(false)
                  if (event.target.value.startsWith('field:'))
                    setFieldId(event.target.value.slice(6))
                  else {
                    setPlaceId(event.target.value)
                    setFieldId(null)
                  }
                }}
              >
                <optgroup label="Consultas reales guardadas">
                  {places.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name}
                    </option>
                  ))}
                </optgroup>
                {fields.length > 0 && (
                  <optgroup label="Campos declarados por ti">
                    {fields.map((item) => (
                      <option key={item.id} value={`field:${item.id}`}>
                        {item.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown size={17} />
            </label>
            <span>
              {field
                ? 'Declarado por ti · guardado en este navegador'
                : 'Consulta guardada · punto de referencia'}
            </span>
          </div>
          {page === 'campo' && (
            <FieldDashboard
              place={place}
              field={field}
              drawing={drawing}
              onDrawingChange={setDrawing}
              onComplete={setDraft}
              onDraw={startDrawing}
              onCoordinates={() => setModal('coordinates')}
              onSources={() => setModal('sources')}
              onChat={() => setDrawer(true)}
              fieldData={fieldData}
            />
          )}
          {page === 'datos' && (
            <DataView
              key={contextKey}
              place={place}
              field={field}
              fieldData={fieldData}
              notify={setToast}
            />
          )}
          {page === 'cultivos' && <CropView place={place} field={field} />}
          {page === 'agente' && (
            <div className="agent-page">
              <div className="agent-page-intro">
                <span className="eyebrow">AQUÍ, PARA ACOMPAÑARTE</span>
                <h1>Hablemos de tu campo.</h1>
                <p>Una conversación sencilla, con los datos sobre la mesa.</p>
              </div>
              <Chat
                key={contextKey}
                place={place}
                field={field}
                messages={messages}
                onMessagesChange={onMessagesChange}
              />
            </div>
          )}
        </main>
        <footer className="workspace-footer">
          <span>TARPU · QENTARA</span>
          <span>Tu tierra. Tus decisiones.</span>
          <button onClick={() => setModal('sources')}>
            Fuentes y transparencia
            <ArrowUpRight size={16} />
          </button>
        </footer>
      </div>
      {page !== 'agente' && !drawer && (
        <button className="floating-chat" onClick={() => setDrawer(true)}>
          <Sparkles size={22} />
          <span>Hablar con TARPU</span>
          <MessageCircle size={20} />
        </button>
      )}
      {drawer && (
        <Modal
          label="Agente TARPU"
          className="chat-drawer"
          onClose={() => setDrawer(false)}
        >
          <Chat
            key={contextKey}
            compact
            place={place}
            field={field}
            messages={messages}
            onMessagesChange={onMessagesChange}
          />
        </Modal>
      )}
      {modal === 'sources' && (
        <Modal label="Fuentes y transparencia" onClose={() => setModal(null)}>
          <h2>La evidencia, siempre a la vista.</h2>
          <p>
            Consulta guardada de {place.name}. Los datos se prepararon a partir
            de los archivos originales, normalizados y de procedencia del
            repositorio.
          </p>
          <SourceCards place={place} />
          <p className="muted">
            Los campos que dibujes se guardan como declaraciones del usuario. La
            extracción en vivo, el motor y la IA generativa tienen su
            integración pendiente.
          </p>
          <button
            className="button-primary"
            onClick={() =>
              download(
                `tarpu-procedencia-${place.id}.json`,
                JSON.stringify(place.sources, null, 2),
              )
            }
          >
            <ArrowDownToLine size={20} />
            Descargar procedencia
          </button>
        </Modal>
      )}
      {modal === 'help' && (
        <Modal label="Ayuda" onClose={() => setModal(null)}>
          <h2>Vamos paso a paso.</h2>
          <div className="help-steps">
            <article>
              <MapPinned size={27} />
              <div>
                <h3>Empieza por el mapa</h3>
                <p>
                  Elige Majes o Chivay para explorar una consulta guardada.
                  «Dibujar mi campo» permite marcar las esquinas de tu terreno.
                </p>
              </div>
            </article>
            <article>
              <Database size={27} />
              <div>
                <h3>Abre tus datos</h3>
                <p>
                  En «Mis datos» puedes leer los registros, buscar fechas y
                  descargar la selección.
                </p>
              </div>
            </article>
            <article>
              <Sparkles size={27} />
              <div>
                <h3>Pregunta con confianza</h3>
                <p>
                  TARPU explica las fuentes y los datos de la consulta abierta.
                  Puedes escuchar la última respuesta.
                </p>
              </div>
            </article>
          </div>
          <button
            className="button-primary"
            onClick={() => {
              setModal(null)
              setDrawer(true)
            }}
          >
            Abrir conversación
            <ArrowRight size={20} />
          </button>
        </Modal>
      )}
      {modal === 'fields' && (
        <Modal label="Mis campos" onClose={() => setModal(null)}>
          <h2>Un lugar para cada campo.</h2>
          <p>Los contornos y tus declaraciones se guardan en este navegador.</p>
          <div className="field-list">
            {fields.map((item) => (
              <article key={item.id}>
                <MapPinned size={25} />
                <button
                  onClick={() => {
                    setFieldId(item.id)
                    setModal(null)
                    location.hash = '/campo'
                  }}
                >
                  <strong>{item.name}</strong>
                  <span>
                    {item.crop || 'Cultivo sin declarar'} ·{' '}
                    {item.coordinates.length - 1} esquinas
                  </span>
                </button>
                <button
                  aria-label={`Eliminar ${item.name}`}
                  onClick={() => {
                    setFields((previous) =>
                      previous.filter((value) => value.id !== item.id),
                    )
                    if (fieldId === item.id) setFieldId(null)
                    setToast('Campo retirado de este navegador.')
                  }}
                >
                  <Trash2 size={20} />
                </button>
              </article>
            ))}
          </div>
          <ServerJobs
            fields={fields}
            onOpen={(imported) => {
              setFields((previous) =>
                previous.some((item) => item.id === imported.id)
                  ? previous
                  : [...previous, imported],
              )
              setFieldId(imported.id)
              setModal(null)
              location.hash = '/campo'
            }}
          />
          {!fields.length && (
            <div className="empty-fields">
              <MapPinned size={38} />
              <h3>Tu primer campo empieza aquí.</h3>
              <p>Ubica tu terreno y marca sus esquinas en el mapa.</p>
            </div>
          )}
          <button className="button-primary" onClick={startDrawing}>
            <Plus size={21} />
            Dibujar un campo
          </button>
        </Modal>
      )}
      {modal === 'coordinates' && (
        <CoordinateDialog
          onClose={() => setModal(null)}
          onComplete={(coordinates) => {
            setDraft(coordinates)
            setModal(null)
          }}
        />
      )}
      {draft && (
        <Modal label="Guardar mi campo" onClose={() => setDraft(null)}>
          <h2>Ahora, pongámosle nombre.</h2>
          <p>
            Contorno de {draft.length - 1} esquinas. Esta información queda
            declarada por ti.
          </p>
          <form className="field-form" onSubmit={saveField}>
            <label>
              Nombre del campo
              <input
                name="name"
                required
                maxLength={80}
                placeholder="Como tú lo conoces"
                autoFocus
              />
            </label>
            <label>
              ¿Qué cultivas actualmente?
              <input
                name="crop"
                maxLength={80}
                placeholder="Puedes dejarlo sin declarar"
              />
            </label>
            <label>
              ¿Con qué agua cuentas?
              <select name="water">
                <option>Sin declarar</option>
                <option>Riego</option>
                <option>Lluvia</option>
                <option>Riego y lluvia</option>
              </select>
            </label>
            <p className="form-note">
              <ShieldCheck size={20} />
              Al guardarlo, TARPU lee la base de Arequipa para tu contorno. Los
              datos satelitales se piden aparte, desde el panel del campo.
            </p>
            <button type="submit" className="button-primary">
              Guardar mi campo
              <Check size={20} />
            </button>
          </form>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={22} />
          <p>{toast}</p>
          <button onClick={() => setToast('')} aria-label="Cerrar aviso">
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

function CoordinateDialog({
  onClose,
  onComplete,
}: {
  onClose: () => void
  onComplete: (coordinates: Coordinate[]) => void
}) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    const coordinates = value
      .trim()
      .split('\n')
      .map((line) =>
        line
          .trim()
          .split(/[\s,]+/)
          .map(Number),
      )
    if (
      coordinates.some(
        (point) =>
          point.length !== 2 ||
          !point.every(Number.isFinite) ||
          Math.abs(point[0]) > 180 ||
          Math.abs(point[1]) > 90,
      )
    ) {
      setError(
        'Escribe una longitud y una latitud por línea, separadas por coma, con punto decimal.',
      )
      return
    }
    const points = coordinates as Coordinate[]
    if (points.length > 1 && points[0].join() === points.at(-1)!.join())
      points.pop()
    if (!validContour(points)) {
      setError(
        'Se necesitan tres esquinas distintas o más, sin lados que se crucen.',
      )
      return
    }
    onComplete([...points, points[0]])
  }
  return (
    <Modal label="Coordenadas del campo" onClose={onClose}>
      <h2>Ubica tu campo con coordenadas.</h2>
      <p>
        Escribe una esquina por línea en el orden del contorno. Usa longitud,
        latitud y punto decimal.
      </p>
      <form className="field-form" onSubmit={submit}>
        <label>
          Esquinas de tu campo
          <textarea
            rows={6}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            required
            aria-describedby="coordinate-error"
            placeholder="Longitud, latitud"
          />
        </label>
        <p id="coordinate-error" role="status">
          {error}
        </p>
        <button className="button-primary" type="submit">
          Continuar
          <ArrowRight size={20} />
        </button>
      </form>
    </Modal>
  )
}

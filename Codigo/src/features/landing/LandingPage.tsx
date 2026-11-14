import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useWorkspace } from '../../app/context'
import { Icon } from '../../components/ui/Icon'
import type { IconName } from '../../components/ui/Icon'
import { TileMosaic } from '../monitor/TileMosaic'
import { referenceZones } from '../monitor/mapConfig'
import type { DashboardPage } from '../../types'

/** Candidate open sources named in the master documentation. None is connected in this prototype. */
const sources = ['NASA POWER', 'GPM IMERG', 'Copernicus Sentinel-2', 'ISRIC SoilGrids', 'NASA SMAP', 'Landsat 8/9', 'MODIS']

const layers = [
  { id: 'satellite', name: 'Imagen satelital', kind: 'Mapa base real', says: 'Cómo luce el territorio: valles, canales, campos y caminos.', not: 'No es una captura en vivo ni mide el estado de un cultivo.' },
  { id: 'vegetation', name: 'Índice de vegetación', kind: 'Ilustración', says: 'El contraste de luz que suele asociarse a la cobertura verde.', not: 'No demuestra fertilidad, salud ni rendimiento.' },
  { id: 'climate', name: 'Clima histórico', kind: 'Ilustración', says: 'Temperatura y lluvia de tu zona a lo largo del tiempo.', not: 'Un histórico no es un pronóstico de tu próxima campaña.' },
  { id: 'soil', name: 'Suelo estimado', kind: 'Ilustración', says: 'Propiedades modeladas a escala regional, por profundidad.', not: 'No reemplaza un análisis de suelo de tu parcela.' },
] as const

const steps: { icon: IconName; title: string; text: string }[] = [
  { icon: 'pin', title: 'Ubica tu parcela', text: 'Señálala en el mapa y cuéntanos qué sembraste y con qué agua cuentas.' },
  { icon: 'layers', title: 'Reúne la evidencia', text: 'Clima, vegetación y suelo de fuentes abiertas, siempre con su fecha y su escala.' },
  { icon: 'chat', title: 'Pregunta a Tarpu', text: 'Qué significa un dato, por qué aparece una alternativa y qué información falta.' },
  { icon: 'download', title: 'Profundiza y descarga', text: 'Abre los registros, revisa su procedencia y llévatelos en CSV, JSON o PDF.' },
]

const shortcuts: { page: DashboardPage; title: string; text: string }[] = [
  { page: 'climate', title: 'Clima e históricos', text: 'El ritmo de tu zona, en contexto' },
  { page: 'data', title: 'Explorar datos', text: 'Registros, unidades y procedencia' },
  { page: 'rotations', title: 'Rotaciones', text: 'Qué revisar antes de comparar' },
  { page: 'reports', title: 'Mis informes', text: 'Resúmenes para guardar en PDF' },
]

const principles = [
  { title: 'NDVI no es fertilidad.', text: 'Un índice de vegetación describe un contraste de luz. Lo mostramos con su fecha, su cobertura y sus límites.' },
  { title: 'Un histórico no es un pronóstico.', text: 'El pasado da contexto a tu zona; no anticipa por sí solo una helada ni tu próxima campaña.' },
  { title: 'Sin evidencia, no hay puntaje.', text: 'Si faltan datos para comparar un cultivo, TARPU te dice qué falta en lugar de inventar un resultado.' },
]

/** Reveals `[data-reveal]` elements once they reach the viewport (or have been scrolled past). */
function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    let pending = [...(root.current?.querySelectorAll<HTMLElement>('[data-reveal]') ?? [])]
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pending.forEach(element => element.classList.add('is-visible'))
      return
    }
    let frame = 0
    const check = () => {
      frame = 0
      const limit = window.innerHeight * 0.92
      pending = pending.filter(element => {
        if (element.getBoundingClientRect().top >= limit) return true
        element.classList.add('is-visible')
        return false
      })
      if (!pending.length) stop()
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check) }
    const stop = () => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule) }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    check()
    return () => { cancelAnimationFrame(frame); stop() }
  }, [root])
}

export function LandingPage() {
  const { navigate, openAgent } = useWorkspace()
  const root = useRef<HTMLDivElement>(null)
  const [layer, setLayer] = useState(0)
  const [paused, setPaused] = useState(false)
  useReveal(root)

  // The layer explainer advances by itself until the visitor interacts with it.
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setLayer(value => (value + 1) % layers.length), 4200)
    return () => clearInterval(timer)
  }, [paused])

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return <div className="landing" ref={root}>
    <a className="skip-link" href="#landing-main">Saltar al contenido</a>
    <header className="landing-nav">
      <button className="landing-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Tarpu, volver al inicio"><img src="brand/tarpu-logo-black.png" alt="Tarpu" /></button>
      <nav aria-label="Secciones">
        <button onClick={() => scrollTo('como-funciona')}>Cómo funciona</button>
        <button onClick={() => scrollTo('capas')}>Datos</button>
        <button onClick={() => scrollTo('principios')}>Principios</button>
        <button onClick={() => scrollTo('territorio')}>Territorio</button>
      </nav>
      <div className="landing-nav-actions">
        <button className="pill-button ghost" onClick={() => openAgent()}>Pregunta a Tarpu</button>
        <button className="pill-button dark" onClick={() => navigate('overview')}>Abrir la demo <Icon name="arrowUp" size={15} /></button>
      </div>
    </header>

    <main id="landing-main">
      <section className="hero">
        <TileMosaic className="hero-imagery" lat={-16.351} lon={-72.19} zoom={13} cols={8} rows={5} eager credit={false} />
        <div className="hero-shade" />
        <div className="hero-scan" aria-hidden="true" />
        <div className="hero-reticle" aria-hidden="true"><span /><i /><small>Majes, Arequipa · 16,35° S 72,19° O</small></div>
        <div className="hero-content">
          <span className="hero-eyebrow"><i /> Prototipo de QENTARA · Arequipa, Perú</span>
          <h1>Tu campo, visto <em>desde el espacio.</em></h1>
          <p>TARPU reúne clima, observación satelital y el historial de tu parcela en explicaciones claras. Tú entiendes los datos; tú decides la siguiente campaña.</p>
          <div className="hero-actions">
            <button className="pill-button light large" onClick={() => navigate('overview')}>Explorar la demo <Icon name="arrow" size={17} /></button>
            <button className="pill-button glass large" onClick={() => scrollTo('como-funciona')}><span className="play-dot"><Icon name="right" size={13} /></span> Cómo funciona</button>
          </div>
        </div>
        <div className="hero-foot">
          <div className="hero-stats">
            <div><strong>Arequipa</strong><span>Alcance inicial del producto</span></div>
            <div><strong>4 fuentes</strong><span>Abiertas, candidatas a integrar</span></div>
            <div><strong>1 agente</strong><span>Para preguntar por tus datos</span></div>
          </div>
          <div className="hero-aside">
            <p>Del espacio a tu parcela: datos abiertos convertidos en lenguaje sencillo, con sus fuentes y sus límites a la vista.</p>
            <small>Imagen: Majes, Arequipa · Esri World Imagery (Esri, Vantor, Earthstar Geographics)</small>
          </div>
        </div>
      </section>

      <section className="sources-band" aria-label="Fuentes de datos candidatas">
        <span className="section-dot">Datos abiertos que TARPU busca integrar</span>
        <div className="marquee"><div className="marquee-track">{[...sources, ...sources].map((name, index) => <span key={index} aria-hidden={index >= sources.length}>{name}</span>)}</div></div>
        <small>Fuentes candidatas: todavía sin conexión activa en este prototipo.</small>
      </section>

      <section className="landing-section">
        <div className="section-head" data-reveal>
          <div><span className="section-dot">Lo que puedes hacer</span><h2>Una plataforma, de la parcela <em>a la decisión.</em></h2></div>
          <button className="pill-button outline" onClick={() => navigate('overview')}>Ver todo el espacio <Icon name="arrowUp" size={15} /></button>
        </div>
        <div className="feature-cards">
          <button className="feature-card" data-reveal onClick={() => navigate('monitor')}>
            <TileMosaic lat={-16.335} lon={-72.215} zoom={15} cols={4} rows={3} credit />
            <span className="feature-tag"><b>01</b> Monitor del territorio</span>
            <span className="feature-copy">Recorre Arequipa con imagen satelital real y sitúa tus parcelas en su contexto.</span>
            <span className="feature-arrow"><Icon name="arrowUp" size={18} /></span>
          </button>
          <button className="feature-card" data-reveal onClick={() => openAgent('¿Qué significa el NDVI de mi parcela?')}>
            <TileMosaic lat={-16.623} lon={-72.711} zoom={14} cols={4} rows={3} credit />
            <span className="feature-chat" aria-hidden="true">
              <span className="bubble user">¿Qué significa un NDVI de 0,62?</span>
              <span className="bubble agent"><Icon name="leaf" size={13} /> Describe el contraste de luz de la vegetación. Por sí solo no indica fertilidad…</span>
            </span>
            <span className="feature-tag"><b>02</b> Agente integrado</span>
            <span className="feature-copy">Pregunta qué significa cada dato y qué información falta para decidir.</span>
            <span className="feature-arrow"><Icon name="arrowUp" size={18} /></span>
          </button>
        </div>
        <div className="shortcut-row">{shortcuts.map(item => <button key={item.page} data-reveal onClick={() => navigate(item.page)}><span><strong>{item.title}</strong><small>{item.text}</small></span><Icon name="arrow" size={18} /></button>)}</div>
      </section>

      <section className="landing-section layers-section" id="capas">
        <div className="layers-copy" data-reveal>
          <span className="section-dot">Capas de evidencia</span>
          <h2>Cada dato, con lo que dice <em>y lo que no.</em></h2>
          <p>Mostrar más capas no basta. TARPU acompaña cada una de una explicación sencilla de lo que permite concluir y de sus límites.</p>
          <div className="layer-list" onMouseEnter={() => setPaused(true)} onFocus={() => setPaused(true)}>
            {layers.map((item, index) => <button key={item.id} className={layer === index ? 'active' : ''} aria-pressed={layer === index} onClick={() => { setLayer(index); setPaused(true) }}>
              <span className="layer-index">0{index + 1}</span>
              <span className="layer-text"><strong>{item.name} <small>{item.kind}</small></strong>
                <span className="layer-detail"><span><Icon name="check" size={14} /> {item.says}</span><span><Icon name="close" size={14} /> {item.not}</span></span>
              </span>
            </button>)}
          </div>
        </div>
        <div className="layer-stack" data-reveal aria-hidden="true" data-active={layers[layer].id}>
          {[...layers].reverse().map(item => <div key={item.id} className={`plate plate-${item.id} ${layers[layer].id === item.id ? 'active' : ''}`}>
            <div className="plate-surface">{item.id === 'satellite' ? <TileMosaic lat={-16.335} lon={-72.215} zoom={14} cols={3} rows={3} credit={false} /> : <span className="plate-texture" />}</div>
            <span className="plate-label">{item.name}</span>
          </div>)}
          <small className="stack-note">Capas de vegetación, clima y suelo: ilustración. La imagen satelital es real (Esri World Imagery).</small>
        </div>
      </section>

      <section className="landing-section" id="como-funciona">
        <div className="section-head" data-reveal>
          <div><span className="section-dot">Cómo funciona</span><h2>Cuatro pasos para <em>comprender tu campo.</em></h2></div>
          <p className="section-note">Así se plantea el recorrido de TARPU. En este prototipo, las parcelas y los indicadores son de demostración.</p>
        </div>
        <ol className="steps">{steps.map((step, index) => <li key={step.title} data-reveal style={{ transitionDelay: `${index * 90}ms` }}>
          <span className="step-top"><span className="step-icon"><Icon name={step.icon} size={20} /></span><b>0{index + 1}</b></span>
          <h3>{step.title}</h3><p>{step.text}</p>
        </li>)}</ol>
      </section>

      <section className="principles" id="principios">
        <div className="principles-inner">
          <div data-reveal><span className="section-dot light">Principios</span><h2>Los datos cuentan. <em>Tú decides.</em></h2></div>
          <div className="principle-grid">{principles.map((item, index) => <article key={item.title} data-reveal style={{ transitionDelay: `${index * 110}ms` }}>
            <span>0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p>
          </article>)}</div>
        </div>
      </section>

      <section className="landing-section territory" id="territorio">
        <div className="section-head" data-reveal>
          <div><span className="section-dot">Territorio</span><h2>Empezamos por <em>todo Arequipa.</em></h2></div>
          <p className="section-note">Con atención especial a la calidad del análisis en el Perú, y abiertos a otros territorios cuando sus datos y reglas lo permitan.</p>
        </div>
        <div className="zone-cards">{referenceZones.map((zone, index) => <button key={zone.id} className="zone-card" data-reveal style={{ transitionDelay: `${index * 90}ms` }} onClick={() => navigate('monitor')}>
          <TileMosaic lat={zone.center[0]} lon={zone.center[1]} zoom={14} cols={3} rows={3} />
          <span className="zone-info"><strong>{zone.name}</strong><small>{Math.abs(zone.center[0]).toFixed(2).replace('.', ',')}° S · {Math.abs(zone.center[1]).toFixed(2).replace('.', ',')}° O</small></span>
          <span className="feature-arrow"><Icon name="arrowUp" size={16} /></span>
        </button>)}</div>
        <p className="zone-note"><Icon name="pin" size={14} /> Zonas de referencia para navegar el mapa; no son parcelas delimitadas.</p>
      </section>

      <section className="landing-cta" data-reveal>
        <TileMosaic lat={-16.39} lon={-72.16} zoom={13} cols={5} rows={3} credit={false} />
        <div className="cta-shade" />
        <div className="cta-content">
          <img src="brand/tarpu-mark-white.png" alt="" />
          <h2>Explora el prototipo <em>de TARPU.</em></h2>
          <p>Siete vistas para recorrer: parcelas, monitor, clima, rotaciones, datos abiertos, informes y el agente.</p>
          <div className="hero-actions"><button className="pill-button light large" onClick={() => navigate('overview')}>Abrir la demo <Icon name="arrow" size={17} /></button><button className="pill-button glass large" onClick={() => navigate('data')}>Ver los datos</button></div>
        </div>
      </section>
    </main>

    <footer className="landing-footer">
      <div className="footer-brand"><img src="brand/tarpu-logo-black.png" alt="Tarpu" /><p>Datos para cosechar un mejor mañana.</p></div>
      <div className="footer-links">
        <div><strong>Producto</strong>{(['overview', 'monitor', 'data'] as DashboardPage[]).map(page => <button key={page} onClick={() => navigate(page)}>{page === 'overview' ? 'Vista general' : page === 'monitor' ? 'Monitor satelital' : 'Explorar datos'}</button>)}</div>
        <div><strong>Proyecto</strong><button onClick={() => scrollTo('principios')}>Principios</button><button onClick={() => scrollTo('territorio')}>Territorio</button><button onClick={() => openAgent()}>Agente</button></div>
      </div>
      <div className="footer-bottom"><span>Hecho con propósito por <b>QENTARA</b> · NASA Space Apps Challenge 2026</span><span>Prototipo: parcelas, indicadores y respuestas del agente son de demostración. Mapa base: Esri World Imagery y OpenStreetMap.</span></div>
    </footer>
  </div>
}

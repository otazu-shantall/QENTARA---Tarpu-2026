// Ayuda y fuentes: cómo usar TARPU, preguntas frecuentes y todas las fuentes con su enlace y para qué se usan.
// Los círculos «i» del resto de la aplicación enlazan aquí (por ejemplo /app/ayuda?tab=fuentes#ecocrop).
// Escrito con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
import { useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router'
import { useWorkspace } from '../../app/WorkspaceContext'
import { Icon } from '../../components/ui/Icon'
import { AGENT } from '../../lib/agent'

export const SOURCES: { id: string; name: string; who: string; use: string; scale: string; url: string }[] = [
  { id: 'power', name: 'NASA POWER', who: 'NASA Langley Research Center', use: 'Clima de cada día desde 2015: temperatura (media, mínima y máxima), lluvia, humedad del aire y radiación solar. Alimenta «Mi campo», el Historial y la comparación de cultivos.', scale: 'Celda de 0,5° × 0,625° (unos 55 × 67 km)', url: 'https://power.larc.nasa.gov/' },
  { id: 'nasadem', name: 'NASADEM', who: 'NASA JPL, distribuido por LP DAAC', use: 'Altitud y pendiente del terreno, y las zonas S1, S2 y S3 del mapa.', scale: 'Cuadros de unos 30 m', url: 'https://lpdaac.usgs.gov/products/nasadem_hgtv001/' },
  { id: 'modis', name: 'MODIS (MOD13Q1, MOD11A2, MOD16A2GF y MCD12Q1)', who: 'NASA, consultado en el servicio de ORNL DAAC', use: 'Verdor (NDVI) cada 16 días, temperatura de la superficie y agua que usan las plantas cada 8 días, y cobertura del terreno cada año.', scale: 'Cuadros de 250 m, 1 km y 500 m según el producto', url: 'https://modis.ornl.gov/' },
  { id: 'soilgrids', name: 'SoilGrids 2.0', who: 'ISRIC – World Soil Information', use: 'pH, arena, limo y arcilla del suelo. Son estimaciones de un modelo, no análisis de laboratorio.', scale: 'Cuadros de 250 m', url: 'https://soilgrids.org/' },
  { id: 'ecocrop', name: 'FAO EcoCrop', who: 'Organización de las Naciones Unidas para la Alimentación y la Agricultura (FAO)', use: 'Los rangos de temperatura, lluvia y pH en los que crece cada cultivo, su familia y su ciclo. Con ellos se compara cada cultivo en «Rotación de cultivos» y el pH en «Mi campo». Describe la especie en general, no las variedades locales.', scale: 'Por especie', url: 'https://ecocrop.apps.fao.org/' },
  { id: 'cenagro', name: 'IV Censo Nacional Agropecuario 2012 (CENAGRO)', who: 'Instituto Nacional de Estadística e Informática (INEI), Perú', use: 'Qué cultivos ocupan más superficie sembrada en cada zona de Arequipa.', scale: 'Por zona de altitud', url: 'https://www.inei.gob.pe/' },
  { id: 'fao-suelos', name: 'Guidelines for soil description (2006)', who: 'FAO', use: 'Los nombres de las clases de pendiente (plano, suave, inclinado, empinado…).', scale: 'Cuadro 7', url: 'https://www.fao.org/' },
  { id: 'gaez', name: 'FAO GAEZ v4', who: 'FAO e IIASA', use: 'Aptitud agroclimática por cultivo. Está en la base de datos, pero todavía no se muestra: falta verificar cómo leer sus valores.', scale: 'Celdas de unos 9 km', url: 'https://gaez.fao.org/' },
  { id: 'mapa', name: 'Imagen del mapa', who: 'Esri World Imagery (Clarity) y OpenStreetMap', use: 'La imagen satelital y el mapa de calles sobre los que dibujas tu parcela. No son datos de análisis.', scale: 'Imagen real hasta el zoom 17 en zonas rurales', url: 'https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9' },
]

const FAQ: { q: string; a: string }[] = [
  { q: '¿TARPU me dice qué sembrar?', a: 'No. TARPU compara cada cultivo con el clima y el suelo de tu campo, punto por punto y con su fuente. No pone puntajes ni elige un ganador: la decisión es tuya, y puedes contrastarla con un especialista.' },
  { q: '¿De dónde salen los datos?', a: 'De fuentes abiertas: NASA (clima, relieve y satélite), ISRIC (suelo), FAO (cultivos) y el censo agropecuario del INEI. En la pestaña «Fuentes» está cada una con su enlace.' },
  { q: '¿Los datos son de mi parcela exacta?', a: 'Depende del dato. El relieve se lee en cuadros de 30 metros dentro de tu contorno; el suelo y el verdor, en cuadros de 250 metros; el clima, en una celda de unos 55 × 67 km. Por eso el clima describe tu región, no cada rincón de tu campo.' },
  { q: '¿Qué son Majes, Cabanaconde y Chivay?', a: 'Son tres lugares de referencia reales, uno por cada zona de Arequipa (costa, valle interandino y altura). Son puntos de consulta para explorar TARPU sin dibujar una parcela; no son los límites de ningún terreno.' },
  { q: '¿Qué significan S1, S2 y S3 en el mapa?', a: 'Son las tres zonas de Arequipa según la altitud: S1 de 0 a 2300 m (costa y valles bajos), S2 de 2300 a 3500 m (valles interandinos) y S3 de 3500 a 4800 m (altoandino). El recuadro punteado marca el área que cubre la base de datos.' },
  { q: '¿Por qué algunos datos dicen «Cargando» o «Todavía no conectado»?', a: 'Los datos de satélite se piden a los servidores de la NASA y pueden tardar varios minutos la primera vez. «Todavía no conectado» significa que esa fuente (humedad del suelo de SMAP y verdor de 30 m de HLS) aún no llega a TARPU.' },
  { q: '¿Qué pasa si falta un dato?', a: 'TARPU lo dice y explica por qué. Nunca rellena un vacío con un cero ni con un valor inventado.' },
  { q: '¿TARPU pronostica el clima?', a: 'No. Todo lo que ves es un registro de lo que ya pasó. Un histórico no es un pronóstico.' },
  { q: `¿Quién es ${AGENT}?`, a: `${AGENT} es el asistente de TARPU. Hoy responde con explicaciones preparadas a partir de tus datos y sus fuentes; todavía no usa un modelo de inteligencia artificial.` },
  { q: '¿Mis parcelas se guardan?', a: 'Tus contornos se guardan solo en este navegador. Los datos extraídos quedan en el servidor de TARPU para no volver a pedirlos.' },
]

const HOW: { icon: 'pin' | 'download' | 'history' | 'sprout' | 'send'; title: string; text: string }[] = [
  { icon: 'pin', title: '1. Elige un lugar', text: 'Usa un lugar de referencia (Majes, Cabanaconde o Chivay) o pulsa «Nueva parcela» y marca las esquinas de tu campo en el mapa.' },
  { icon: 'download', title: '2. Extrae los datos', text: 'Pulsa «Extraer datos completos». Verás cada dato marcarse con un check cuando esté listo.' },
  { icon: 'history', title: '3. Mira su historia', text: 'En «Historial» compara cada mes de un año con el promedio de todos los años.' },
  { icon: 'sprout', title: '4. Compara cultivos para rotar', text: 'En «Rotación de cultivos» declara tu cultivo, tu agua y tus meses de campaña, y compara las alternativas.' },
  { icon: 'send', title: `5. Pregunta a ${AGENT}`, text: 'En cada tarjeta, «¿Qué es este dato?» te lo explica y te deja seguir la conversación.' },
]

export function HelpPage() {
  const [params, setParams] = useSearchParams()
  const { hash } = useLocation()
  const navigate = useNavigate()
  const { startTour } = useWorkspace()
  const tab = params.get('tab') ?? 'uso'
  useEffect(() => {
    if (!hash) return
    requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'center' }))
  }, [hash, tab])
  const tabs = [
    { id: 'uso', label: 'Cómo usar TARPU' },
    { id: 'preguntas', label: 'Preguntas frecuentes' },
    { id: 'fuentes', label: 'Fuentes' },
  ]
  return (
    <div className="help-page">
      <div className="help-tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setParams({ tab: t.id })}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'uso' && (
        <section className="help-how">
          <div className="card help-tour">
            <div>
              <h2>Recorrido guiado</h2>
              <p>Te mostramos, paso a paso y sobre la pantalla, para qué sirve cada parte.</p>
            </div>
            <button
              className="button button-green extract-button"
              onClick={() => {
                navigate('/app')
                startTour()
              }}
            >
              <Icon name="compass" size={19} /> Empezar el recorrido
            </button>
          </div>
          <div className="how-grid">
            {HOW.map((step) => (
              <article className="card" key={step.title}>
                <span className="how-icon">
                  <Icon name={step.icon} size={22} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'preguntas' && (
        <section className="faq">
          {FAQ.map((item) => (
            <details className="card" key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </section>
      )}

      {tab === 'fuentes' && (
        <section className="sources">
          <p className="sources-intro">
            Cada dato de TARPU viene de una de estas fuentes. Ningún valor es inventado: si un dato falta, se dice.
          </p>
          {SOURCES.map((source) => (
            <article className="card source" key={source.id} id={source.id}>
              <header>
                <h3>{source.name}</h3>
                <a href={source.url} target="_blank" rel="noreferrer" className="text-link">
                  Abrir la fuente <Icon name="external" size={15} />
                </a>
              </header>
              <p className="source-who">{source.who}</p>
              <p>{source.use}</p>
              <span className="source-scale">Escala: {source.scale}</span>
            </article>
          ))}
          <article className="card source" id="como-se-calcula">
            <h3>Cómo se calcula lo que ves</h3>
            <ul>
              <li>Promedios y sumas de los registros, sin rellenar los días que faltan.</li>
              <li>La comparación de cultivos mira si cada dato cae dentro del rango ideal o del rango tolerable de FAO EcoCrop. No usa puntajes ni pesos.</li>
              <li>La superficie de tu parcela se mide sobre el elipsoide WGS84.</li>
              <li>Parte de este sistema se desarrolló con asistencia de inteligencia artificial; está declarado en la entrega del proyecto.</li>
            </ul>
          </article>
        </section>
      )}
    </div>
  )
}

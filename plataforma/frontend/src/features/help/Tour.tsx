// Recorrido guiado: resalta cada parte de la pantalla y explica para qué sirve. Se abre la primera vez que se
// entra al espacio de trabajo y se puede repetir desde «Ayuda y fuentes».
// Escrito con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
import { useEffect, useLayoutEffect, useState } from 'react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { Icon } from '../../components/ui/Icon'
import { AGENT } from '../../lib/agent'

interface Step {
  /** selector del elemento a resaltar; sin selector, el paso va al centro */
  target?: string
  title: string
  text: string[]
}
const STEPS: Step[] = [
  {
    title: 'Bienvenido a TARPU',
    text: [
      'TARPU reúne datos reales de la NASA, de la FAO y del censo agropecuario para que entiendas tu campo y compares qué cultivos rotar.',
      'En un minuto te mostramos cada parte. Puedes salir cuando quieras.',
    ],
  },
  {
    target: '.parcel-select',
    title: 'Elige el lugar',
    text: [
      'Aquí cambias de lugar. Majes, Cabanaconde y Chivay son lugares de referencia reales: uno en la costa, uno en un valle interandino y uno en la altura.',
      'Son puntos de consulta para explorar TARPU; no son los límites de ningún terreno. Tus parcelas dibujadas también aparecen aquí.',
    ],
  },
  {
    target: '.page-actions .button-green',
    title: 'Dibuja tu parcela',
    text: ['Con «Nueva parcela» buscas tu terreno en el mapa de Arequipa y marcas sus esquinas una por una.'],
  },
  {
    target: '.big-map',
    title: 'El mapa',
    text: [
      'Muestra tu campo sobre una imagen satelital. Los colores son las tres zonas de Arequipa por altitud (S1, S2 y S3) y el recuadro punteado es el área que cubre la base de datos.',
      'Con los botones de la derecha te acercas, cambias de capa o vuelves a tu campo.',
    ],
  },
  {
    target: '.extract-call, .extraction',
    title: 'Extrae los datos',
    text: [
      'Con «Extraer datos completos» TARPU trae todo de una vez: relieve, suelo, zona, clima desde 2015 y satélite.',
      'Cada dato se marca con un check al estar listo. Los del satélite pueden tardar unos minutos y dicen «Cargando».',
    ],
  },
  {
    target: '.findings',
    title: 'Lo que encontramos',
    text: [
      'Cada tarjeta muestra un dato, una explicación sencilla y su fuente.',
      `Pulsa «¿Qué es este dato?» para entenderlo mejor y seguir la conversación con ${AGENT}.`,
    ],
  },
  {
    target: '.sidebar nav a[href="#/app/historial"]',
    title: 'Historial',
    text: ['Compara cada mes de un año con el promedio de todos los años: temperatura, lluvia, verdor y más.'],
  },
  {
    target: '.sidebar nav a[href="#/app/rotacion"]',
    title: 'Rotación de cultivos',
    text: [
      'Declaras tu cultivo, tu agua y tus meses de campaña, y TARPU compara cada alternativa con el clima y el suelo de tu campo.',
      'Sin puntajes: cada punto muestra si está en el rango ideal del cultivo, según la FAO.',
    ],
  },
  {
    target: '.sidebar-assistant',
    title: `${AGENT}, tu asistente`,
    text: [`Pregúntale a ${AGENT} lo que no entiendas. Responde con tus datos y sus fuentes.`],
  },
  {
    target: '.sidebar a[href="#/app/ayuda"]',
    title: 'Ayuda y fuentes',
    text: ['Aquí están las preguntas frecuentes, todas las fuentes con su enlace y este recorrido, por si quieres repetirlo.'],
  },
]

export function Tour() {
  const { tourOpen, closeTour } = useWorkspace()
  const [index, setIndex] = useState(0)
  const [box, setBox] = useState<DOMRect | null>(null)
  const step = STEPS[index]

  useEffect(() => {
    if (tourOpen) setIndex(0)
  }, [tourOpen])
  useLayoutEffect(() => {
    if (!tourOpen) return
    const element = step.target ? document.querySelector(step.target) : null
    if (!element) {
      setBox(null)
      return
    }
    element.scrollIntoView({ block: 'center', behavior: 'instant' })
    const measure = () => setBox(element.getBoundingClientRect())
    measure()
    const timer = setTimeout(measure, 250)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [tourOpen, index, step.target])
  useEffect(() => {
    if (!tourOpen) return
    const keys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTour()
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, STEPS.length - 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', keys)
    return () => window.removeEventListener('keydown', keys)
  }, [tourOpen, closeTour])
  if (!tourOpen) return null

  const margin = 8
  const spot = box
    ? { left: box.left - margin, top: box.top - margin, width: box.width + margin * 2, height: Math.min(box.height + margin * 2, window.innerHeight * 0.6) }
    : null
  // La tarjeta va debajo del elemento si hay espacio; si no, arriba; sin elemento, al centro.
  const below = spot ? spot.top + spot.height + 16 : 0
  const cardStyle: React.CSSProperties = spot
    ? {
        left: Math.max(16, Math.min(spot.left, window.innerWidth - 436)),
        ...(below + 260 < window.innerHeight ? { top: below } : { bottom: Math.max(16, window.innerHeight - spot.top + 16) }),
      }
    : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
  const last = index === STEPS.length - 1
  return (
    <div className="tour" role="dialog" aria-modal="true" aria-label="Recorrido guiado de TARPU">
      {spot ? <div className="tour-spot" style={spot} /> : <div className="tour-shade" />}
      <div className="tour-card" style={cardStyle}>
        <span className="tour-count">
          Paso {index + 1} de {STEPS.length}
        </span>
        <h2>{step.title}</h2>
        {step.text.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <div className="tour-actions">
          <button className="text-link" onClick={closeTour}>
            Salir del recorrido
          </button>
          <span>
            {index > 0 && (
              <button className="button button-outline" onClick={() => setIndex(index - 1)}>
                <Icon name="back" size={16} /> Atrás
              </button>
            )}
            <button className="button button-green" onClick={() => (last ? closeTour() : setIndex(index + 1))}>
              {last ? 'Terminar' : 'Siguiente'} <Icon name={last ? 'check' : 'arrow'} size={16} />
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}

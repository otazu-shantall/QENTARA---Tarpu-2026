// Recorridos guiados: uno por sección. Resaltan cada parte de la pantalla y explican para qué sirve.
// El de cada sección se abre la primera vez que se entra a ella (y el del asistente, la primera vez que se abre);
// todos se pueden repetir desde «Ayuda y fuentes».
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
export const TOURS: Record<string, { name: string; path: string; steps: Step[] }> = {
  campo: {
    name: 'Mi campo',
    path: '/app',
    steps: [
      {
        title: 'Bienvenido a TARPU',
        text: [
          'TARPU reúne datos reales de la NASA, de la FAO y del censo agropecuario para que entiendas tu campo y compares qué cultivos rotar.',
          'Te mostramos esta pantalla. Cada sección tiene su propio recorrido la primera vez que entras.',
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
          `Pulsa «¿Qué es este dato?» para ver cómo leerlo, qué no dice y de dónde sale, y para seguir con ${AGENT}.`,
        ],
      },
      {
        target: '.sidebar nav',
        title: 'Las demás secciones',
        text: ['Historial, Rotación de cultivos e Informes están aquí. Cada una te mostrará su recorrido al entrar.'],
      },
      {
        target: '.sidebar-assistant',
        title: `${AGENT}, tu asistente`,
        text: [`Pregúntale a ${AGENT} lo que no entiendas. Responde con tus datos y sus fuentes.`],
      },
    ],
  },
  dibujo: {
    name: 'Dibujar una parcela',
    path: '/app/parcela/nueva',
    steps: [
      {
        target: '.editor-map',
        title: 'Busca tu terreno',
        text: [
          'El mapa abre sobre toda Arequipa. Acércate con los botones o con la rueda del ratón hasta ver tu campo.',
          'Luego haz clic en cada esquina del terreno, una por una.',
        ],
      },
      {
        target: '.editor-form',
        title: 'Cierra y guarda',
        text: [
          'Aquí ves cuántos puntos llevas. Con «Cerrar contorno» puedes arrastrar las esquinas para corregirlas.',
          'Después le pones nombre y la guardas. También puedes abrir un campo que ya fue analizado.',
        ],
      },
    ],
  },
  historial: {
    name: 'Historial',
    path: '/app/historial',
    steps: [
      {
        target: '.variable-chips',
        title: 'Elige qué ver',
        text: ['Temperatura, frío de la noche, lluvia, verdor y más. Solo aparecen las variables que ya tienen datos.'],
      },
      {
        target: '.year-chips',
        title: 'Elige el año',
        text: ['Hay datos de cada año desde 2015. El último año puede estar incompleto.'],
      },
      {
        target: '.history-chart',
        title: 'Cómo leer el gráfico',
        text: [
          'El color es el año que elegiste. La raya punteada es el promedio de todos los años, y la franja gris va del año más bajo al más alto.',
          'Así ves si un mes fue más o menos de lo habitual.',
        ],
      },
      {
        target: '.history-facts',
        title: 'El resumen del año',
        text: ['El total o el promedio del año, y sus meses más alto y más bajo. Debajo está la tabla mes por mes.'],
      },
    ],
  },
  rotacion: {
    name: 'Rotación de cultivos',
    path: '/app/rotacion',
    steps: [
      {
        target: '.rotation-form',
        title: 'Cuéntanos de tu campo',
        text: [
          'Elige tu cultivo actual, con qué agua cuentas y en qué meses está el cultivo en el campo.',
          'Con los meses se calcula la temperatura y el frío de tu campaña. Luego pulsa «Comparar cultivos para rotar».',
        ],
      },
      {
        title: 'Cómo leer la comparación',
        text: [
          'Aparece una tarjeta por cultivo: tu cultivo actual y los de otra familia, que son las alternativas para rotar.',
          'Cada punto (temperatura, lluvia, pH…) dice si tu campo está en el rango ideal del cultivo, si lo tolera o si queda fuera, según la FAO.',
          'No hay puntaje ni un ganador. La decisión es tuya.',
        ],
      },
      {
        target: '.zone-crops',
        title: 'Lo que se siembra en tu zona',
        text: ['La lista del censo agropecuario de 2012 para tu zona. Describe lo que hay; no es una recomendación.'],
      },
    ],
  },
  informes: {
    name: 'Mis informes',
    path: '/app/informes',
    steps: [
      {
        target: '.report-actions',
        title: 'Tu informe',
        text: ['Una hoja con lo que TARPU encontró en este lugar. Puedes imprimirla, guardarla como PDF o descargar sus datos.'],
      },
      {
        target: '.report-sheet',
        title: 'Qué contiene',
        text: ['El lugar, el suelo, el clima del último año y los cultivos de la zona frente al pH, cada dato con su fuente.'],
      },
    ],
  },
  estudio: {
    name: 'Estudio técnico',
    path: '/app/estudio-tecnico',
    steps: [
      {
        title: 'Para quien quiere todo el detalle',
        text: [
          'Aquí están todos los registros día por día, el diccionario de variables, las fuentes y las descargas en CSV, JSON y GeoJSON.',
          'Es la misma información de «Mi campo» e «Historial», sin resumir.',
        ],
      },
    ],
  },
  ayuda: {
    name: 'Ayuda y fuentes',
    path: '/app/ayuda',
    steps: [
      {
        target: '.help-tabs',
        title: 'Tres pestañas',
        text: [
          'Cómo usar TARPU, las preguntas frecuentes y todas las fuentes con su enlace.',
          'Desde aquí puedes repetir el recorrido de cualquier sección.',
        ],
      },
    ],
  },
  asistente: {
    name: AGENT,
    path: '/app',
    steps: [
      {
        target: '.yq-messages',
        title: `Conversa con ${AGENT}`,
        text: [
          `${AGENT} responde con los datos de tu campo y dice de qué fuente sale cada respuesta.`,
          'Las respuestas las prepara TARPU; no inventa datos ni hace pronósticos.',
        ],
      },
      {
        target: '.yq-input',
        title: 'Escribe o habla',
        text: ['Escribe tu pregunta y envíala, o pulsa el micrófono para conversar con voz.', 'En cada respuesta, «Escuchar» la lee en voz alta.'],
      },
    ],
  },
}

export function Tour() {
  const { tourOpen, tourKey, closeTour } = useWorkspace()
  const [index, setIndex] = useState(0)
  const [box, setBox] = useState<DOMRect | null>(null)
  const steps = (TOURS[tourKey] ?? TOURS.campo).steps
  const step = steps[Math.min(index, steps.length - 1)]

  useEffect(() => {
    if (tourOpen) setIndex(0)
  }, [tourOpen, tourKey])
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
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, steps.length - 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', keys)
    return () => window.removeEventListener('keydown', keys)
  }, [tourOpen, closeTour, steps.length])
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
  const last = index >= steps.length - 1
  return (
    <div className="tour" role="dialog" aria-modal="true" aria-label="Recorrido guiado de TARPU">
      {spot ? <div className="tour-spot" style={spot} /> : <div className="tour-shade" />}
      <div className="tour-card" style={cardStyle}>
        <span className="tour-count">
          {(TOURS[tourKey] ?? TOURS.campo).name} · paso {index + 1} de {steps.length}
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

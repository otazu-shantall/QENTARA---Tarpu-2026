// Rotación de cultivos: el agricultor declara su cultivo, su agua y sus meses de campaña, y el motor del backend
// compara cada cultivo del catálogo con el clima y el suelo del lugar, criterio por criterio y con cita.
// Sin puntaje, sin pesos y sin «apto / no apto» (DT-16): la interfaz solo muestra lo que devuelve el motor.
// Escrito con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog, rotations } from '../../services/api'
import type { CriterionState, RotationContext, Rotations, Strategy } from '../../services/api'
import { cachedBase } from '../../services/remote'
import { Icon } from '../../components/ui/Icon'
import type { IconName } from '../../components/ui/Icon'
import { AGENT } from '../../lib/agent'

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const STATE: Record<CriterionState, { label: string; tone: string; icon: IconName }> = {
  dentro_optimo: { label: 'En su rango ideal', tone: 'good', icon: 'check' },
  dentro_absoluto: { label: 'Lo tolera, fuera del ideal', tone: 'mid', icon: 'check' },
  fuera_absoluto: { label: 'Fuera de lo que tolera', tone: 'bad', icon: 'close' },
  medido: { label: 'Dato medido, sin regla para valorarlo', tone: 'info', icon: 'eye' },
  informativo: { label: 'Dato informativo', tone: 'info', icon: 'eye' },
  conflicto_entre_fuentes: { label: 'Las fuentes no coinciden', tone: 'warn', icon: 'help' },
  sin_dato: { label: 'Falta un dato', tone: 'none', icon: 'help' },
  sin_regla: { label: 'Sin regla citada', tone: 'none', icon: 'help' },
}
const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

function StrategyCard({ strategy }: { strategy: Strategy }) {
  const { askAssistant } = useWorkspace()
  const current = strategy.tipo === 'repetir_actual'
  return (
    <article className={`card strategy ${current ? 'strategy-current' : ''}`}>
      <header>
        <div>
          <span className={`strategy-tag ${current ? 'tag-current' : ''}`}>
            {current
              ? 'Tu cultivo actual'
              : strategy.tipo === 'cambiar_de_familia'
                ? 'Cambia de familia'
                : 'Cultivo del catálogo'}
          </span>
          <h3>{capital(strategy.cultivo)}</h3>
          <p className="strategy-sub">
            <em>{strategy.nombre_cientifico}</em> · familia {strategy.familia}
            {strategy.ciclo_dias
              ? ` · ciclo de ${strategy.ciclo_dias[0]} a ${strategy.ciclo_dias[1]} días`
              : ''}
          </p>
        </div>
        <a
          className="info-dot"
          href={strategy.cita.url}
          target="_blank"
          rel="noreferrer"
          title={`Ficha de ${strategy.cita.fuente} (consultada el ${strategy.cita.consultado})`}
          aria-label={`Abrir la ficha de ${strategy.cultivo} en ${strategy.cita.fuente}`}
        >
          i
        </a>
      </header>
      <p className="strategy-why">{strategy.por_que_aparece}</p>
      <ul className="criteria">
        {strategy.criterios.map((c) => (
          <li key={c.criterio} className={`criterion tone-${STATE[c.estado].tone}`}>
            <span className="criterion-icon">
              <Icon name={STATE[c.estado].icon} size={14} />
            </span>
            <span className="criterion-name">{c.titulo}</span>
            <span className="criterion-state">{STATE[c.estado].label}</span>
          </li>
        ))}
      </ul>
      <details className="strategy-detail">
        <summary>Ver la explicación de cada punto</summary>
        <ul>
          {strategy.frases.map((phrase) => (
            <li key={phrase}>{phrase}</li>
          ))}
          {strategy.vacios.map((gap) => (
            <li key={gap} className="gap">
              Falta: {gap}
            </li>
          ))}
          {strategy.conflictos.map((conflict) => (
            <li key={conflict} className="gap">
              {conflict}
            </li>
          ))}
        </ul>
        <p className="small-note">
          Beneficios de la rotación: {strategy.beneficios.nota ?? 'sin fuente citada todavía.'}
        </p>
      </details>
      <button
        className="finding-open"
        onClick={() =>
          askAssistant(`¿Qué debo saber antes de sembrar ${strategy.cultivo} en rotación?`)
        }
      >
        <Icon name="send" size={15} /> Preguntar a {AGENT}
      </button>
    </article>
  )
}

export function RotationPage() {
  const { parcel } = useWorkspace()
  return <RotationForm key={parcel.id} />
}

function RotationForm() {
  const { parcel } = useWorkspace()
  const request = useRef<AbortController | null>(null)
  const key = `tarpu.rotacion.${parcel.id}`
  const saved = (() => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? 'null') as RotationContext | null
    } catch {
      return null
    }
  })()
  const [crops, setCrops] = useState<string[]>([])
  const [zoneCrops, setZoneCrops] = useState<{ zone?: string; name?: string; crops: string[] }>({
    crops: [],
  })
  const [crop, setCrop] = useState<string>(saved?.cultivo_actual ?? '')
  const [water, setWater] = useState<string>(saved?.agua ?? '')
  const [months, setMonths] = useState<number[]>(saved?.meses_campana ?? [])
  const [result, setResult] = useState<Rotations | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    catalog()
      .then((list) => setCrops(list.map((c) => c.cultivo)))
      .catch(() => undefined)
  }, [])
  useEffect(() => {
    setResult(null)
    setZoneCrops({ crops: [] })
    let live = true
    cachedBase(parcel)
      .then((base) => {
        if (live)
          setZoneCrops({
            zone: base?.sector?.sector,
            name: base?.sector?.nombre,
            crops: base?.sector?.cultivos_principales ?? [],
          })
      })
      .catch(() => undefined)
    return () => {
      live = false
      request.current?.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parcel.id])

  function compare() {
    request.current?.abort()
    const current = new AbortController()
    request.current = current
    const contexto: RotationContext = {
      cultivo_actual: crop || null,
      agua: (water || null) as RotationContext['agua'],
      meses_campana: months.length ? [...months].sort((a, b) => a - b) : null,
    }
    try {
      localStorage.setItem(key, JSON.stringify(contexto))
    } catch {}
    setState('loading')
    setError('')
    rotations(parcel, contexto, current.signal)
      .then((data) => {
        if (current.signal.aborted) return
        setResult(data)
        setState('idle')
        requestAnimationFrame(() =>
          document
            .querySelector('.rotation-results')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        )
      })
      .catch((e: Error) => {
        if (current.signal.aborted) return
        setError(e.message)
        setState('error')
      })
  }

  return (
    <div className="rotation-page">
      <section className="card rotation-form">
        <div className="rotation-step">
          <span className="step-number">1</span>
          <div>
            <h2>Cuéntanos de tu campo</h2>
            <p>
              Lo que declares aquí lo dices tú; TARPU lo usa tal cual para comparar los cultivos en{' '}
              <strong>{parcel.name}</strong>.
            </p>
          </div>
        </div>
        <div className="rotation-fields">
          <label>
            ¿Qué cultivas ahora?
            <select value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option value="">No lo sé / otro cultivo</option>
              {crops.map((c) => (
                <option key={c} value={c}>
                  {capital(c)}
                </option>
              ))}
            </select>
          </label>
          <label>
            ¿Con qué agua cuentas?
            <select value={water} onChange={(e) => setWater(e.target.value)}>
              <option value="">No lo sé</option>
              <option value="riego">Riego</option>
              <option value="secano">Solo lluvia (secano)</option>
            </select>
          </label>
        </div>
        <fieldset className="month-picker">
          <legend>¿En qué meses está tu cultivo en el campo?</legend>
          <div>
            {MONTHS.map((label, index) => {
              const month = index + 1
              const on = months.includes(month)
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  className={on ? 'on' : ''}
                  onClick={() =>
                    setMonths((previous) =>
                      previous.includes(month)
                        ? previous.filter((m) => m !== month)
                        : [...previous, month],
                    )
                  }
                >
                  {label}
                </button>
              )
            })}
          </div>
          <small>Con los meses se calcula la temperatura y las noches de frío de tu campaña.</small>
        </fieldset>
        <button
          className="button button-green extract-button"
          onClick={compare}
          disabled={state === 'loading'}
        >
          <Icon name={state === 'loading' ? 'loader' : 'sprout'} size={19} />
          {state === 'loading' ? 'Comparando…' : 'Comparar cultivos para rotar'}
        </button>
        {state === 'error' && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </section>

      {result && (
        <section className="rotation-results">
          <div className="rotation-step">
            <span className="step-number">2</span>
            <div>
              <h2>Así se compara cada cultivo con tu campo</h2>
              <p>
                {result.cultivo_actual
                  ? `Tu cultivo actual es ${result.cultivo_actual}. Rotar significa alternarlo con un cultivo de otra familia.`
                  : 'No declaraste un cultivo actual del catálogo: se muestran todos los cultivos del catálogo.'}{' '}
                No hay puntaje ni un «ganador»: tú decides con cada dato a la vista.
              </p>
            </div>
          </div>
          <div className="state-legend" aria-label="Qué significa cada marca">
            {(['dentro_optimo', 'dentro_absoluto', 'fuera_absoluto', 'sin_dato'] as const).map(
              (s) => (
                <span key={s} className={`criterion tone-${STATE[s].tone}`}>
                  <span className="criterion-icon">
                    <Icon name={STATE[s].icon} size={13} />
                  </span>
                  {STATE[s].label}
                </span>
              ),
            )}
            <Link to="/app/ayuda?tab=fuentes#ecocrop" className="info-link">
              <span className="info-dot small">i</span> De dónde salen los rangos
            </Link>
          </div>
          <div className="strategy-grid">
            {result.estrategias.map((strategy) => (
              <StrategyCard key={strategy.id} strategy={strategy} />
            ))}
          </div>
          {result.no_incluidos.length > 0 && (
            <p className="small-note">
              No se incluyen:{' '}
              {result.no_incluidos.map((n) => `${n.cultivo} (${n.motivo})`).join('; ')}
            </p>
          )}
          {(result.vacios_generales.length > 0 || result.advertencias_catalogo.length > 0) && (
            <details className="card notices">
              <summary>
                <Icon name="shield" size={16} /> Ten en cuenta (
                {result.vacios_generales.length + result.advertencias_catalogo.length})
              </summary>
              <ul>
                {[...result.vacios_generales, ...result.advertencias_catalogo].map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </details>
          )}
          <p className="small-note">{result.nota}</p>
        </section>
      )}

      {zoneCrops.crops.length > 0 && (
        <section className="card zone-crops">
          <h2>
            Lo que más se siembra en tu zona
            <Link
              to="/app/ayuda?tab=fuentes#cenagro"
              className="info-dot small"
              aria-label="Fuente: censo 2012"
            >
              i
            </Link>
          </h2>
          <p>
            Zona {zoneCrops.zone}, {zoneCrops.name?.toLowerCase()}. Ordenado por superficie sembrada
            en el censo agropecuario de 2012. Describe la zona; no es una recomendación.
          </p>
          <ol className="crop-ranking">
            {zoneCrops.crops.map((c) => (
              <li key={c}>{capital(c.replaceAll('_', ' '))}</li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}

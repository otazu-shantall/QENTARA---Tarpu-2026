// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useState } from 'react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { Icon } from '../../components/ui/Icon'
import type { IconName } from '../../components/ui/Icon'
import { Dialog } from '../../components/ui/Dialog'
import { exampleCropPriorities } from '../../data/cropPriority'
import { crops } from '../../data/crops'
import type { CropCategory } from '../../data/crops'
export function OptionsPage() {
  const { parcel, setAssistantOpen } = useWorkspace()
  const [category, setCategory] = useState<CropCategory | 'Todas'>('Todas'),
    [selected, setSelected] = useState<string[]>([]),
    [detail, setDetail] = useState<string | null>(null),
    [comparing, setComparing] = useState(false)
  const priorities = exampleCropPriorities(parcel)
  const orderedCrops = [...crops].sort(
    (a, b) => (priorities?.[a.id] ?? 99) - (priorities?.[b.id] ?? 99),
  )
  const item = crops.find((c) => c.id === detail)
  const icons: Record<CropCategory, IconName> = {
    Hortalizas: 'leaf',
    Legumbres: 'sprout',
    Frutas: 'sun',
    Flores: 'flower',
  }
  return (
    <>
      <section className="crop-intro">
        <div>
          <h2>Fichas de cultivos</h2>
          <p>Qué revisar antes de elegir un cultivo.</p>
        </div>
        <div className="current-crop">
          <Icon name="sprout" size={28} />
          <span>Tu punto de partida</span>
          <strong>{parcel.crop}</strong>
          <small>
            {parcel.name} · {parcel.irrigation}
          </small>
        </div>
      </section>
      <div className="notice crop-disclaimer">
        <Icon name="shield" />
        <p>
          <strong>
            {priorities
              ? 'Prioridad ilustrativa · sin evaluación de aptitud.'
              : 'Prioridad pendiente de evaluación.'}
          </strong>
          {priorities
            ? ' El orden permite explorar cómo se presentarían las recomendaciones de esta parcela. Es ficticio y no es una indicación de siembra. '
            : ''}{' '}
          Estas fichas no se han seleccionado por las condiciones de tu parcela. Algunas tienen
          referencias regionales; otras son ejemplos pendientes de documentar. No hay clasificación
          por coordenadas ni motor de recomendaciones conectado.
        </p>
      </div>
      <p className="priority-explainer">
        {priorities
          ? 'Mayor prioridad primero · orden de ejemplo, sin puntajes de éxito.'
          : 'No hay una recomendación ordenada para esta parcela real o declarada. Puedes explorar un ejemplo desde el selector.'}
      </p>
      <div className="catalog-toolbar">
        <div className="category-tabs" role="group" aria-label="Categoría de cultivo">
          {(['Todas', 'Hortalizas', 'Legumbres', 'Frutas', 'Flores'] as const).map((c) => (
            <button key={c} aria-pressed={c === category} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <button
          className="button button-green"
          disabled={selected.length < 2}
          onClick={() => setComparing(true)}
        >
          Comparar ({selected.length}/3)
          <Icon name="upRight" size={16} />
        </button>
      </div>
      <div className="crop-grid">
        {orderedCrops
          .filter((c) => category === 'Todas' || c.category === category)
          .map((c) => (
            <article
              className={`crop-card card crop-${c.category} ${priorities?.[c.id] === 1 ? 'top-priority' : ''}`}
              key={c.id}
            >
              <div className="crop-card-top">
                <span className="crop-symbol">
                  <Icon name={icons[c.category]} size={35} />
                </span>
                <span className="priority-badge">
                  {priorities ? `Prioridad ${priorities[c.id]}` : 'Sin prioridad'}
                </span>
              </div>
              <span className="eyebrow">
                {c.category}
                {priorities?.[c.id] === 1 ? ' · PRIMERA OPCIÓN DE EJEMPLO' : ''}
              </span>
              <h3>{c.name}</h3>
              <small className="botanical">{c.scientific}</small>
              <p>{c.intro}</p>
              <div className="crop-conditions">
                <span>
                  <Icon name="temperature" size={15} />
                  Clima y variedad
                </span>
                <span>
                  <Icon name="humidity" size={15} />
                  Agua y suelo
                </span>
              </div>
              <div className="crop-card-actions">
                <button className="text-link" onClick={() => setDetail(c.id)}>
                  Ver ficha
                  <Icon name="arrow" size={16} />
                </button>
                <label className="compare-check">
                  <input
                    type="checkbox"
                    checked={selected.includes(c.id)}
                    disabled={!selected.includes(c.id) && selected.length >= 3}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, c.id]
                          : selected.filter((id) => id !== c.id),
                      )
                    }
                  />
                  Comparar
                </label>
              </div>
            </article>
          ))}
      </div>
      <section className="preparation-section">
        <div>
          <span className="eyebrow">PREPARA EL TERRENO, PASO A PASO</span>
          <h2>
            Antes de plantar,
            <br />
            <em>conoce lo que hace falta.</em>
          </h2>
          <p>
            Aspectos de revisión general. Las intervenciones y dosis necesitan un análisis de tu
            terreno.
          </p>
        </div>
        <div className="preparation-steps">
          {[
            {
              title: 'Conocer el suelo',
              text: 'Solicitar un análisis para conocer textura, pH, salinidad y nutrientes; los satélites no reemplazan esa muestra.',
              icon: 'layers' as const,
            },
            {
              title: 'Revisar el agua',
              text: 'Comprobar calidad, disponibilidad y distribución del riego antes de planificar un cultivo.',
              icon: 'humidity' as const,
            },
            {
              title: 'Reconstruir su historia',
              text: 'Anotar cultivos anteriores, enfermedades, manejo y resultados para estudiar una rotación.',
              icon: 'history' as const,
            },
            {
              title: 'Contrastar las opciones',
              text: 'Revisar variedad, calendario, mercado y riesgos con información local antes de invertir.',
              icon: 'study' as const,
            },
          ].map((s, i) => (
            <article key={s.title}>
              <span>0{i + 1}</span>
              <Icon name={s.icon} />
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="evidence-strip">
        <Icon name="shield" />
        <p>
          Una ficha no es una prescripción. Sin evidencia suficiente no hay puntaje de éxito, dosis
          ni fecha de siembra recomendada.
        </p>
        <button className="text-link" onClick={() => setAssistantOpen(true)}>
          Conversar sobre estas opciones
          <Icon name="arrow" size={16} />
        </button>
      </div>
      {item && (
        <Dialog title={`${item.name} · ficha de exploración`} onClose={() => setDetail(null)}>
          <span className="status-pill neutral">Aptitud sin evaluar</span>
          <p>{item.intro}</p>
          <dl className="crop-detail">
            {[
              ['Clima', item.climate],
              ['Suelo', item.soil],
              ['Agua', item.water],
              ['Evidencia y faltantes', item.evidence],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {item.source && (
            <a className="text-link" href={item.source} target="_blank" rel="noreferrer">
              Consultar fuente oficial
              <Icon name="external" size={16} />
            </a>
          )}
          <button className="button button-green" onClick={() => setDetail(null)}>
            Volver al catálogo
          </button>
        </Dialog>
      )}
      {comparing && (
        <Dialog title="Comparar posibilidades" onClose={() => setComparing(false)}>
          <p>
            La continuidad del cultivo actual ({parcel.crop}) es el punto de comparación. Las
            alternativas conservan sus faltantes y no se ordenan por un puntaje.
          </p>
          <div className="table-container" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>Continuidad: {parcel.crop}</th>
                  {selected.map((id) => (
                    <th key={id}>{crops.find((c) => c.id === id)?.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(['climate', 'soil', 'water', 'evidence'] as const).map((key, i) => (
                  <tr key={key}>
                    <th>{['Clima', 'Suelo', 'Agua', 'Evidencia'][i]}</th>
                    <td>Historial y evaluación pendientes</td>
                    {selected.map((id) => (
                      <td key={id}>{crops.find((c) => c.id === id)?.[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Dialog>
      )}
    </>
  )
}

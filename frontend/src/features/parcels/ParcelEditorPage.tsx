// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { lazy, Suspense, useState } from 'react'
import { useNavigate } from 'react-router'
import { useWorkspace } from '../../app/WorkspaceContext'
import type { Coordinate } from '../../types/domain'
import { areaHectares, boundaryError } from '../../lib/geometry'
import { number } from '../../lib/evidence'
import { Icon } from '../../components/ui/Icon'
const FieldMap = lazy(() =>
  import('../monitor/FieldMap').then((module) => ({ default: module.FieldMap })),
)
export function ParcelEditorPage() {
  const [points, setPoints] = useState<Coordinate[]>([])
  const [closed, setClosed] = useState(false)
  const [name, setName] = useState('')
  const [crop, setCrop] = useState('No lo sé')
  const [irrigation, setIrrigation] = useState('No lo sé')
  const [error, setError] = useState('')
  const { addParcel } = useWorkspace()
  const navigate = useNavigate()
  function closeBoundary() {
    const issue = boundaryError(points)
    if (issue) {
      setError(issue)
      return
    }
    setClosed(true)
    setError('')
  }
  function save() {
    const issue = boundaryError(points)
    if (issue || !name.trim()) {
      setError(issue ?? 'Escribe un nombre para tu parcela.')
      return
    }
    try {
      addParcel({
        name: name.trim(),
        location: 'Ubicación declarada en el mapa',
        boundary: points,
        crop,
        irrigation,
      })
      navigate('/app')
    } catch (issue) {
      setError(
        issue instanceof Error
          ? issue.message
          : 'No se pudo guardar. Revisa el espacio del navegador.',
      )
    }
  }
  return (
    <div className="editor-layout">
      <section className="editor-map">
        <Suspense fallback={<div className="map-placeholder">Preparando editor…</div>}>
          <FieldMap
            points={points}
            drawing
            closed={closed}
            onChange={(next) => {
              setPoints(next)
              setError('')
            }}
          />
        </Suspense>
      </section>
      <aside className="card editor-form">
        <span className="step-counter">01 / UBICAR Y DELIMITAR</span>
        <h2>Marca cada esquina.</h2>
        <p>
          Acércate a tu terreno y añade sus puntos sobre el mapa. Cierra el contorno para corregir
          sus esquinas. Con teclado, enfoca el mapa, desplázate con las flechas y usa «Añadir
          esquina en el centro del mapa».
        </p>
        <div className="boundary-stat">
          <span>Puntos marcados</span>
          <strong>
            {points.length}
            <small>
              {closed ? `${number(areaHectares(points), 2)} ha aprox.` : 'Contorno abierto'}
            </small>
          </strong>
        </div>
        <div className="editor-buttons">
          <button
            className="button button-outline"
            disabled={!points.length || closed}
            onClick={() => setPoints(points.slice(0, -1))}
          >
            <Icon name="undo" size={16} /> Deshacer punto
          </button>
          <button
            className="button button-outline"
            disabled={!points.length}
            onClick={() => {
              setPoints([])
              setClosed(false)
              setError('')
            }}
          >
            Reiniciar
          </button>
        </div>
        {!closed && (
          <button className="button button-green full" onClick={closeBoundary}>
            <Icon name="scan" size={18} /> Cerrar contorno
          </button>
        )}
        {closed && (
          <div className="parcel-context-form">
            <span className="step-counter">02 / CONOCER EL CAMPO</span>
            <label>
              Nombre de la parcela
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Mi campo del valle"
                maxLength={60}
              />
            </label>
            <label>
              Cultivo actual
              <select value={crop} onChange={(e) => setCrop(e.target.value)}>
                {['No lo sé', 'Papa', 'Quinua', 'Haba', 'Cebada', 'Otro'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Disponibilidad de riego
              <select value={irrigation} onChange={(e) => setIrrigation(e.target.value)}>
                {['No lo sé', 'Con riego', 'Sin riego', 'Por confirmar'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <button className="button button-green full" onClick={save}>
              Guardar parcela <Icon name="check" size={18} />
            </button>
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <p className="small-note">
          Contorno declarado y superficie aproximada. No acredita propiedad ni un deslinde legal. Se
          guarda solo en este navegador; la cobertura de Arequipa debe verificarse al integrar el
          servicio.
        </p>
        <button className="text-link" onClick={() => navigate('/app')}>
          <Icon name="back" size={16} /> Cancelar y volver
        </button>
      </aside>
    </div>
  )
}

// Campos que ya tienen datos satelitales en el servidor (los «puntos extraídos» de la pantalla de prueba).
// Abrir uno lo guarda como parcela en este navegador con el contorno con que se extrajo.
// Escrito con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useWorkspace } from '../../app/WorkspaceContext'
import { jobs as listJobs } from '../../services/api'
import type { Job } from '../../services/api'
import { Icon } from '../../components/ui/Icon'
import { number } from '../../lib/evidence'

export function ServerFields() {
  const { parcels, addParcel, selectParcel } = useWorkspace()
  const navigate = useNavigate()
  const [list, setList] = useState<Job[] | null>(null)
  useEffect(() => {
    listJobs()
      .then(setList)
      .catch(() => setList([]))
  }, [])
  const withContour = (list ?? []).filter((j) => (j.parcela?.contorno?.coordinates?.[0]?.length ?? 0) > 3)
  if (!withContour.length) return null
  return (
    <div className="server-fields">
      <span className="step-counter">O ABRE UN CAMPO YA ANALIZADO</span>
      <ul>
        {withContour.map((j) => {
          const name = (j.nombre ?? j.clave).replaceAll('_', ' ')
          const boundary = j.parcela!.contorno.coordinates[0].slice(0, -1)
          const known = parcels.find(
            (p) => p.kind === 'declared' && JSON.stringify(p.boundary) === JSON.stringify(boundary),
          )
          return (
            <li key={j.clave}>
              <button
                onClick={() => {
                  if (known) selectParcel(known.id)
                  else
                    addParcel({
                      name,
                      location: 'Campo analizado en el servidor',
                      boundary,
                      crop: 'No lo sé',
                      irrigation: 'No lo sé',
                    })
                  navigate('/app')
                }}
              >
                <Icon name="pin" size={17} />
                <span>
                  <strong>{name}</strong>
                  <small>
                    {number(j.parcela!.area_ha, 2)} ha · {j.estado.replaceAll('_', ' ')}
                  </small>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

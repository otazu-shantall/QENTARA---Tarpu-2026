// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
// 15/11/2026 (Claude Code): pantalla simplificada: mapa grande, «Extraer datos completos» y resultados explicados.
import { lazy, Suspense } from 'react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { ParcelDataPanel } from './ParcelDataPanel'
const FieldMap = lazy(() =>
  import('../monitor/FieldMap').then((module) => ({ default: module.FieldMap })),
)
export function OverviewPage() {
  const { parcel } = useWorkspace()
  return (
    <div className="field-page">
      <div className="field-head">
        <h2>
          {parcel.name}
          <span>
            {parcel.kind === 'reference' ? 'Lugar de referencia · punto de consulta' : 'Tu parcela'}
          </span>
        </h2>
      </div>
      <div className="overview-map big-map">
        <Suspense fallback={<div className="map-placeholder">Preparando el mapa…</div>}>
          <FieldMap
            key={parcel.id}
            points={parcel.boundary}
            closed={parcel.boundary.length > 2}
            center={parcel.point ? { ...parcel.point, label: parcel.name } : undefined}
          />
        </Suspense>
      </div>
      <ParcelDataPanel />
    </div>
  )
}

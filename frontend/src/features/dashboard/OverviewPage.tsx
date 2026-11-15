// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { lazy, Suspense, useState } from 'react'
import { parcelLayers } from '../../lib/parcelOverlay'
import type { ParcelLayer } from '../../lib/parcelOverlay'
import { Link } from 'react-router'
import { useWorkspace } from '../../app/WorkspaceContext'
import { summarize, number } from '../../lib/evidence'
import { Icon } from '../../components/ui/Icon'
import { EnvironmentalSignals } from './EnvironmentalSignals'
import { EvidenceChart } from '../climate/EvidenceChart'
const FieldMap = lazy(() =>
  import('../monitor/FieldMap').then((module) => ({ default: module.FieldMap })),
)
export function OverviewPage() {
  const { parcel, points, evidence, loading, error, retry, setAssistantOpen } = useWorkspace()
  const [mapLayer, setMapLayer] = useState<ParcelLayer>('temperature')
  const summary = summarize(points)
  return (
    <>
      <div className="overview-layout">
        <section className="overview-primary">
          <div className="section-title">
            <div>
              <span className="status-pill">
                <span />
                {parcel.kind === 'example'
                  ? 'Parcela de ejemplo'
                  : parcel.kind === 'reference'
                    ? 'Zona de referencia'
                    : 'Contorno declarado'}
              </span>
              <h2>
                {parcel.name}
                <span> / Arequipa</span>
              </h2>
            </div>
            <Link to="/app/parcela/nueva" className="text-link">
              Delimitar mi parcela <Icon name="upRight" size={16} />
            </Link>
          </div>
          <div className="parcel-layer-picker" role="group" aria-label="Capa visual de la parcela">
            {(Object.keys(parcelLayers) as ParcelLayer[]).map((layer) => (
              <button
                key={layer}
                disabled={parcel.kind !== 'example' && layer !== 'none'}
                aria-pressed={(parcel.kind === 'example' ? mapLayer : 'none') === layer}
                onClick={() => setMapLayer(layer)}
              >
                <span className={`layer-dot layer-${layer}`} />
                {parcelLayers[layer].label}
              </button>
            ))}
            <span>
              {parcel.kind === 'example'
                ? 'Visualización de ejemplo'
                : 'Capas científicas sin conectar'}
            </span>
          </div>
          <div className="overview-map">
            <Suspense fallback={<div className="map-placeholder">Preparando el mapa…</div>}>
              <FieldMap
                key={parcel.id}
                illustrative={parcel.kind === 'example'}
                analysisLayer={mapLayer}
                points={parcel.boundary}
                closed={parcel.boundary.length > 2}
              />
            </Suspense>
            <div className="map-field-label">
              <Icon name="pin" size={21} />
              <div>
                <strong>{parcel.kind === 'reference' ? 'Una mirada a Majes' : parcel.name}</strong>
                <span>
                  {parcel.kind === 'reference'
                    ? 'El mapa muestra la zona, no límites de una parcela.'
                    : parcel.kind === 'example'
                      ? 'Contorno ficticio para explorar el diseño.'
                      : 'Delimitación local · sin datos ambientales asociados.'}
                </span>
              </div>
            </div>
          </div>
          <div className="section-title metrics-heading">
            <h2>El contexto ambiental</h2>
            <span className="muted">
              {evidence
                ? evidence.origin === 'synthetic'
                  ? 'Escenario de ejemplo · 2026'
                  : 'Muestra guardada · 2025'
                : 'Sin observaciones asociadas'}
            </span>
          </div>
          {error ? (
            <div className="notice" role="alert">
              No se pudo cargar la muestra. <button onClick={() => void retry()}>Reintentar</button>
            </div>
          ) : (
            <div className="metrics-grid">
              {[
                {
                  icon: 'temperature' as const,
                  label: 'Temperatura media',
                  value: summary.temperature,
                  unit: '°C',
                  note: 'Temperatura del aire',
                },
                {
                  icon: 'rain' as const,
                  label: 'Lluvia acumulada',
                  value: summary.rain,
                  unit: 'mm',
                  note: `${summary.rainValid} días válidos`,
                },
                {
                  icon: 'humidity' as const,
                  label: 'Humedad media',
                  value: summary.humidity,
                  unit: '%',
                  note: 'Humedad relativa del aire',
                },
              ].map((metric) => (
                <article className="metric-card" key={metric.icon}>
                  <span className={`metric-icon ${metric.icon}`}>
                    <Icon name={metric.icon} size={19} />
                  </span>
                  <span className="metric-label">{metric.label}</span>
                  <strong>
                    {loading ? '…' : number(metric.value)}
                    {metric.value !== null && <small>{metric.unit}</small>}
                  </strong>
                  <p>{metric.note}</p>
                </article>
              ))}
            </div>
          )}
          <EnvironmentalSignals />
          <div className="card overview-history">
            <div className="section-title">
              <div>
                <span className="eyebrow">UNA PERSPECTIVA EN EL TIEMPO</span>
                <h2>Así fue la temperatura</h2>
              </div>
              <Link to="/app/historial" className="text-link">
                Ver historial <Icon name="upRight" size={16} />
              </Link>
            </div>
            <EvidenceChart points={points} />
            <div className="chart-footer">
              <span>
                <span className="line-key" /> Temperatura del aire
              </span>
              <span>{evidence ? evidence.source : 'Sin serie disponible'}</span>
            </div>
          </div>
        </section>
        <aside className="overview-insights">
          <section className="insight-intro">
            <span className="eyebrow">PRIMERO, EL CONTEXTO</span>
            <h2>
              Lo que los datos
              <br />
              <em>pueden contar.</em>
            </h2>
            <p>
              {evidence
                ? evidence.origin === 'synthetic'
                  ? 'Explora cómo se verían los cambios del campo: frío, calor, agua y vegetación. Los valores son ficticios y no describen un terreno real.'
                  : 'Hay una muestra climática de Majes disponible para explorar. Su escala es regional: úsala como contexto, no como diagnóstico del campo.'
                : 'El contorno está guardado. Para conocer el ambiente necesitamos asociar observaciones con fecha, fuente y cobertura.'}
            </p>
            <div className="evidence-mini">
              <Icon name="shield" size={20} />
              <div>
                <strong>
                  {evidence
                    ? evidence.origin === 'synthetic'
                      ? 'Datos sintéticos · demostración'
                      : 'Datos reales · muestra histórica'
                    : 'Datos aún no disponibles'}
                </strong>
                <small>
                  {evidence
                    ? evidence.origin === 'synthetic'
                      ? 'TARPU · escenario ilustrativo de 2026'
                      : 'NASA POWER · enero–diciembre 2025'
                    : 'La geometría no genera indicadores'}
                </small>
              </div>
            </div>
            <Link to="/app/estudio-tecnico" className="text-link">
              Revisar la evidencia <Icon name="upRight" size={16} />
            </Link>
          </section>
          <section className="assistant-invite">
            <div className="little-bubbles" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <span className="eyebrow">PREGUNTA A TARPU</span>
            <h3>
              Entender empieza
              <br />
              con una pregunta.
            </h3>
            <p>Exploremos lo que significa cada dato y lo que hace falta saber.</p>
            <button className="button button-lime full" onClick={() => setAssistantOpen(true)}>
              Conversemos <Icon name="arrow" size={18} />
            </button>
            <small>Chat y voz · respuestas guiadas</small>
          </section>
          <section className="context-note">
            <Icon name="leaf" size={21} />
            <h3>
              Tu experiencia completa
              <br />
              la mirada.
            </h3>
            <p>
              El cultivo anterior, el riego y la variedad son parte de la historia que el satélite
              no puede contar por sí solo.
            </p>
            <Link to="/app/opciones" className="text-link">
              Explorar opciones <Icon name="arrow" size={16} />
            </Link>
          </section>
        </aside>
      </div>
      <div className="evidence-strip">
        <Icon name="shield" size={18} />
        <p>
          Un histórico no es un pronóstico. La humedad del aire no es humedad del suelo. Cada dato
          conserva su contexto.
        </p>
        <span>TRANSPARENCIA DESDE EL ORIGEN</span>
      </div>
    </>
  )
}

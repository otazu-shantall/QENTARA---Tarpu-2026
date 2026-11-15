// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useState, lazy, Suspense } from 'react'
import { Link } from 'react-router'
import { useWorkspace } from '../../app/WorkspaceContext'
import type { Metric, TimeGrouping } from '../../types/domain'
import { metricLabels, metricUnits } from '../../types/domain'
import { metrics, aggregateSeries } from '../../lib/study'
import { number } from '../../lib/evidence'
import { Icon } from '../../components/ui/Icon'
import { TimelineChart } from './TimelineChart'
import { ObservationControls } from './ObservationControls'
import { demoEvents } from '../../data/scenarios'
const FieldMap = lazy(() => import('../monitor/FieldMap').then((m) => ({ default: m.FieldMap })))
export function HistoryPage() {
  const { points, evidence, parcel } = useWorkspace()
  const [metric, setMetric] = useState<Metric>('temperature'),
    [grouping, setGrouping] = useState<TimeGrouping>('month')
  const mapLayer =
    metric === 'soilMoisture'
      ? 'moisture'
      : metric === 'vegetation'
        ? 'vegetation'
        : ['temperature', 'minimum', 'maximum', 'surfaceTemperature'].includes(metric)
          ? 'temperature'
          : 'none'
  const series = aggregateSeries(points, metric, grouping)
  const events =
    evidence?.origin === 'synthetic'
      ? demoEvents.filter((e) => points[0]?.date <= e.date && points.at(-1)!.date >= e.date)
      : []
  return (
    <>
      <section className="card history-card">
        <div className="section-title">
          <div>
            <span className="eyebrow">LA HISTORIA DE {parcel.name}</span>
            <h2>Acércate a cada momento.</h2>
            <p className="muted">
              Días para mirar el detalle. Semanas y meses para reconocer cambios.
            </p>
          </div>
          <span className="status-pill">
            {evidence?.origin === 'synthetic'
              ? 'Ejemplo visual'
              : evidence
                ? 'Muestra histórica'
                : 'Sin datos'}
          </span>
        </div>
        <ObservationControls grouping={grouping} onGrouping={setGrouping} />
        <div className="history-variables" role="group" aria-label="Variable histórica">
          {metrics.map((m) => (
            <button key={m} aria-pressed={metric === m} onClick={() => setMetric(m)}>
              {metricLabels[m]}
              <small>{points.some((p) => p[m] != null) ? metricUnits[m] : 'Sin conectar'}</small>
            </button>
          ))}
        </div>
        <div className={parcel.kind === 'example' ? 'history-analysis-grid' : ''}>
          {parcel.kind === 'example' && (
            <section className="history-map-card">
              <div className="history-map-heading">
                <strong>La parcela, de un vistazo</strong>
                <span>Patrón visual fijo · ejemplo</span>
              </div>
              <div className="history-parcel-map">
                <Suspense fallback={<div className="map-placeholder">Preparando parcela…</div>}>
                  <FieldMap
                    key={parcel.id}
                    points={parcel.boundary}
                    closed
                    illustrative
                    analysisLayer={mapLayer}
                  />
                </Suspense>
              </div>
            </section>
          )}
          <TimelineChart points={points} metric={metric} grouping={grouping} />
        </div>
        <p className="small-note">
          {evidence
            ? `${points.length} registros · ${evidence.period} · ${evidence.source}. ${evidence.cadence}.`
            : 'Sin observaciones asociadas.'}{' '}
          Agrupar registros no aumenta la frecuencia ni la precisión de la fuente.
        </p>
      </section>
      <div className="history-bottom">
        <section className="card">
          <span className="eyebrow">SUCESOS DEL CAMPO</span>
          <h2>
            {evidence?.origin === 'synthetic'
              ? 'Así se leería la historia.'
              : 'Eventos y evidencia.'}
          </h2>
          {events.length ? (
            events.map((event) => (
              <article key={event.date} className={`timeline-event ${event.tone}`}>
                <Icon name={event.icon} />
                <div>
                  <small>{event.date} · EVENTO FICTICIO</small>
                  <h3>{event.title}</h3>
                  <p>{event.text}</p>
                </div>
              </article>
            ))
          ) : (
            <p>
              {evidence?.origin === 'synthetic'
                ? 'No hay eventos de ejemplo en esta selección.'
                : 'No hay eventos diagnosticados. El frío, la falta de lluvia o un índice aislado no confirman daños, sequía o problemas de suelo.'}
            </p>
          )}
          <Link to="/app/estudio-tecnico" className="text-link">
            Consultar el respaldo técnico
            <Icon name="upRight" size={16} />
          </Link>
        </section>
        <section className="card">
          <span className="eyebrow">DETALLE DE LOS INTERVALOS</span>
          <h2>{metricLabels[metric]}</h2>
          <p className="small-note">
            {metric === 'rain' ? 'Lluvia acumulada' : 'Promedio'} por intervalo ·{' '}
            {metric === 'rain' ? 'mm' : metricUnits[metric]}. Las semanas comienzan el lunes.
          </p>
          <div className="interval-table table-container" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>Inicio del intervalo</th>
                  <th>Valor</th>
                  <th>Válidos</th>
                </tr>
              </thead>
              <tbody>
                {series.slice(-12).map((s) => (
                  <tr key={s.date}>
                    <td>{s.date}</td>
                    <td>{number(s.value, metric === 'vegetation' ? 2 : 1)}</td>
                    <td>
                      {s.valid}/{s.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small-note">
            Se muestran hasta 12 intervalos recientes. Los registros completos están en Estudio
            técnico.
          </p>
        </section>
      </div>
    </>
  )
}

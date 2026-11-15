// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useState } from 'react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { summarize, download, number } from '../../lib/evidence'
import { Icon } from '../../components/ui/Icon'
import { z } from 'zod'
const reportSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  source: z.string(),
  period: z.string(),
  count: z.number(),
  temperature: z.number().nullable(),
  rain: z.number().nullable(),
  humidity: z.number().nullable(),
  warning: z.string(),
})
type Report = z.infer<typeof reportSchema>
export function ReportsPage() {
  const { evidence, parcel, points, period } = useWorkspace()
  const [error, setError] = useState('')
  const [reports, setReports] = useState<Report[]>(() => {
    try {
      const value = z
        .array(reportSchema)
        .safeParse(JSON.parse(localStorage.getItem('tarpu.prototype.reports') ?? '[]'))
      return value.success ? value.data : []
    } catch {
      return []
    }
  })
  function save() {
    if (!evidence) return
    const summary = summarize(points)
    const report: Report = {
      ...summary,
      id: crypto.randomUUID(),
      name: `Contexto de ${parcel.name}`,
      source: evidence.source,
      createdAt: new Date().toISOString(),
      period: `Selección de ${points[0]?.date ?? 'sin fecha'} a ${points.at(-1)?.date ?? 'sin fecha'} (${period} días como máximo)`,
      warning: evidence.support,
    }
    try {
      localStorage.setItem('tarpu.prototype.reports', JSON.stringify([report, ...reports]))
      setReports([report, ...reports])
    } catch {
      setError('No se pudo guardar. Revisa el espacio de almacenamiento del navegador.')
    }
  }
  return (
    <>
      <div className="card report-create">
        <span className="report-symbol">
          <Icon name="report" size={28} />
        </span>
        <div>
          <span className="eyebrow">CONSERVA LA CONSULTA</span>
          <h2>Un resumen que puedes volver a mirar.</h2>
          <p>Guarda una copia de la evidencia disponible y sus límites en este navegador.</p>
        </div>
        <button className="button button-green" disabled={!evidence} onClick={save}>
          <Icon name="plus" size={17} /> Guardar resumen actual
        </button>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {!reports.length ? (
        <div className="empty-state report-empty">
          <Icon name="report" size={42} />
          <h2>Todavía no hay informes guardados.</h2>
          <p>
            Empieza con la parcela de ejemplo o la muestra de Majes y guarda un resumen para
            conservar su contexto.
          </p>
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map((report) => (
            <article className="card" key={report.id}>
              <span className="eyebrow">{report.source} · MUESTRA HISTÓRICA</span>
              <h2>{report.name}</h2>
              <p>{report.period}</p>
              <dl>
                <div>
                  <dt>Temperatura media</dt>
                  <dd>{number(report.temperature)} °C</dd>
                </div>
                <div>
                  <dt>Lluvia acumulada</dt>
                  <dd>{number(report.rain)} mm</dd>
                </div>
                <div>
                  <dt>Humedad del aire</dt>
                  <dd>{number(report.humidity)} %</dd>
                </div>
              </dl>
              <p className="small-note">{report.warning}</p>
              <button
                className="text-link"
                onClick={() => download(JSON.stringify(report, null, 2), 'tarpu-resumen.json')}
              >
                Descargar resumen <Icon name="download" size={17} />
              </button>
            </article>
          ))}
        </div>
      )}
      <div className="evidence-strip">
        <Icon name="shield" />
        <p>
          El resumen conserva valores y advertencias al guardarse. No equivale a un diagnóstico
          agronómico. La exportación PDF queda pendiente en este prototipo.
        </p>
      </div>
    </>
  )
}

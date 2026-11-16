// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useWorkspace } from '../../app/WorkspaceContext'
import { Icon } from '../../components/ui/Icon'
import { download, number } from '../../lib/evidence'
import { aggregateSeries, metrics, parcelGeoJSON, studyCSV, studyExport } from '../../lib/study'
import { metricLabels, metricUnits } from '../../types/domain'
import type { Metric, TimeGrouping } from '../../types/domain'
import { TimelineChart } from '../climate/TimelineChart'
import { ObservationControls } from '../climate/ObservationControls'
const definitions: Record<Metric, { code: string; description: string; method: string }> = {
  temperature: {
    code: 'T2M',
    description: 'Temperatura media del aire a 2 m.',
    method: 'Promedio de registros válidos',
  },
  minimum: {
    code: 'T2M_MIN',
    description: 'Temperatura mínima del aire; no confirma daño por helada.',
    method: 'Promedio de mínimas diarias; no mínimo absoluto',
  },
  maximum: {
    code: 'T2M_MAX',
    description: 'Temperatura máxima del aire; no temperatura de la planta.',
    method: 'Promedio de máximas diarias',
  },
  rain: {
    code: 'PRECTOTCORR',
    description: 'Precipitación diaria corregida; no disponibilidad total de riego.',
    method: 'Suma de láminas diarias disponibles',
  },
  humidity: {
    code: 'RH2M',
    description: 'Humedad relativa del aire a 2 m; distinta del suelo.',
    method: 'Promedio de registros válidos',
  },
  soilMoisture: {
    code: 'SMAP (sin conectar)',
    description: 'Humedad del suelo de SMAP, celda de 9 km. Todavía no llega al servidor.',
    method: 'Sin datos hasta conectar SMAP; un faltante no es 0',
  },
  vegetation: {
    code: 'MOD13Q1 250m_16_days_NDVI',
    description: 'Verdor de MODIS, píxel de 250 m cada 16 días. No demuestra fertilidad.',
    method: 'Valor del proveedor en la fecha de cada composición; fiabilidad 2 (nieve) y 3 (nubes) quedan sin valor (MOD13 User Guide)',
  },
  solarRadiation: {
    code: 'ALLSKY_SFC_SW_DWN',
    description: 'Energía solar diaria incidente en superficie. No es temperatura del aire.',
    method: 'Promedio de la energía diaria disponible',
  },
  surfaceTemperature: {
    code: 'MOD11A2 LST_Day_1km',
    description: 'Temperatura de la superficie de día, píxel de 1 km cada 8 días; distinta del aire.',
    method: 'Valor del proveedor en Kelvin menos 273,15 (°C) en la fecha de cada composición',
  },
}
export function StudyPage() {
  const { parcel, points, evidence } = useWorkspace()
  const [tab, setTab] = useState<'series' | 'records' | 'dictionary' | 'sources'>('series')
  const [metric, setMetric] = useState<Metric>('temperature'),
    [grouping, setGrouping] = useState<TimeGrouping>('month')
  const [page, setPage] = useState(0),
    [search, setSearch] = useState('')
  const filtered = points.filter((p) => p.date.includes(search)),
    pages = Math.max(1, Math.ceil(filtered.length / 15)),
    active = Math.min(page, pages - 1)
  useEffect(() => {
    setSearch('')
    setPage(0)
  }, [parcel.id])
  const series = aggregateSeries(points, metric, grouping)
  const valid = points.filter((p) => p[metric] != null).length
  return (
    <>
      <section className="study-hero">
        <div>
          <h2>Todos los registros y sus fuentes</h2>
          <p>Series, unidades, procedencia y descargas en CSV, JSON o GeoJSON.</p>
        </div>
        <div className="study-stamp">
          <Icon name="study" size={42} />
          <strong>{points.length}</strong>
          <span>registros en la selección</span>
          <small>
            {evidence?.origin === 'synthetic'
              ? 'ESCENARIO SINTÉTICO'
              : evidence
                ? 'HISTÓRICO REAL CON FUENTE'
                : 'SIN OBSERVACIONES'}
          </small>
        </div>
      </section>
      <div className="advanced-banner">
        <Icon name="study" />
        <div>
          <strong>{parcel.name}</strong>
          <p>
            {evidence?.support ??
              'Esta parcela aún no tiene observaciones asociadas. Selecciona una parcela de ejemplo para recorrer el estudio.'}
          </p>
        </div>
        <Link to="/app" className="button button-outline">
          <Icon name="back" size={16} />
          Volver a Mi campo
        </Link>
      </div>
      <section className="card study-card">
        <ObservationControls grouping={grouping} onGrouping={setGrouping} />
        <div className="study-tabs" role="group" aria-label="Secciones de estudio técnico">
          {(
            [
              ['series', 'Series y variables'],
              ['records', 'Registros completos'],
              ['dictionary', 'Diccionario de datos'],
              ['sources', 'Fuentes y calidad'],
            ] as const
          ).map(([key, label]) => (
            <button key={key} aria-pressed={tab === key} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>
        {tab === 'series' && (
          <>
            <div className="study-variable-grid">
              {metrics.map((m) => (
                <button key={m} aria-pressed={m === metric} onClick={() => setMetric(m)}>
                  <small>{definitions[m].code}</small>
                  <strong>{metricLabels[m]}</strong>
                  <span>
                    {metricUnits[m]} ·{' '}
                    {points.some((p) => p[m] != null)
                      ? evidence?.origin === 'synthetic'
                        ? 'Ejemplo'
                        : 'Disponible'
                      : 'Sin dato'}
                  </span>
                </button>
              ))}
            </div>
            <TimelineChart points={points} metric={metric} grouping={grouping} />
            <div className="study-summary">
              <span>
                <strong>{valid}</strong> registros válidos
              </span>
              <span>
                <strong>{points.length - valid}</strong> faltantes
              </span>
              <span>
                <strong>{series.length}</strong> intervalos
              </span>
              <span>{definitions[metric].method}</span>
            </div>
          </>
        )}
        {tab === 'records' && (
          <>
            <div className="data-toolbar">
              <label className="search-input">
                <Icon name="search" />
                <input
                  aria-label="Buscar fecha"
                  placeholder="Buscar fecha · 2026-10"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(0)
                  }}
                />
              </label>
              <span>{filtered.length} registros · todos los campos disponibles</span>
            </div>
            <div className="table-container" tabIndex={0}>
              <table>
                <caption className="sr-only">Registros completos de la parcela activa</caption>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    {metrics.map((m) => (
                      <th key={m}>
                        {definitions[m].code}
                        <small>{metricUnits[m]}</small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(active * 15, active * 15 + 15).map((p) => (
                    <tr key={p.date}>
                      <td>{p.date}</td>
                      {metrics.map((m) => (
                        <td key={m}>{number(p[m] ?? null, m === 'vegetation' ? 2 : 1)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!filtered.length && (
              <p className="empty-chart">No hay registros para esta selección.</p>
            )}
            <div className="pagination">
              <span>
                Página {active + 1} de {pages}
              </span>
              <button
                className="button button-outline"
                disabled={!active}
                onClick={() => setPage(active - 1)}
              >
                Anterior
              </button>
              <button
                className="button button-outline"
                disabled={active + 1 >= pages}
                onClick={() => setPage(active + 1)}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
        {tab === 'dictionary' && (
          <div className="table-container" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>Variable / código</th>
                  <th>Unidad</th>
                  <th>Interpretación y límites</th>
                  <th>Agregación</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m}>
                    <td>
                      <strong>{metricLabels[m]}</strong>
                      <small>{definitions[m].code}</small>
                    </td>
                    <td>{metricUnits[m]}</td>
                    <td>{definitions[m].description}</td>
                    <td>{definitions[m].method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="small-note">
              Un faltante se exporta como null en JSON y celda vacía en CSV. No se interpola ni se
              transforma en cero.
            </p>
          </div>
        )}
        {tab === 'sources' && (
          <div className="study-provenance">
            <div>
              <span className="eyebrow">PROCEDENCIA DE LA SELECCIÓN</span>
              <h3>{evidence?.source ?? 'Sin fuente asociada'}</h3>
              <p>{evidence?.support}</p>
              {evidence?.url && (
                <a className="text-link" href={evidence.url} target="_blank" rel="noreferrer">
                  Solicitud original <Icon name="external" size={16} />
                </a>
              )}
            </div>
            <dl>
              <div>
                <dt>Producto</dt>
                <dd>{evidence?.product ?? 'Sin dato'}</dd>
              </div>
              <div>
                <dt>Período de origen</dt>
                <dd>{evidence?.period ?? 'Sin dato'}</dd>
              </div>
              <div>
                <dt>Frecuencia disponible</dt>
                <dd>{evidence?.cadence ?? 'Sin calendario activo'}</dd>
              </div>
              <div>
                <dt>Escala / resolución</dt>
                <dd>
                  {evidence?.origin === 'synthetic'
                    ? 'No aplica: escenario ficticio'
                    : 'Contexto regional de un punto de consulta. No es una medición en cada píxel de la parcela.'}
                </dd>
              </div>
              <div>
                <dt>Nivel y tratamiento</dt>
                <dd>
                  Normalizado, sin interpolación. Promedios o sumas según variable; los intervalos
                  incompletos no son totales completos.
                </dd>
              </div>
              <div>
                <dt>Última consulta guardada</dt>
                <dd>
                  {evidence?.requestedAt.slice(0, 10) ?? 'Sin dato'} · sin actualización automática
                </dd>
              </div>
              <div>
                <dt>Productos satelitales adicionales</dt>
                <dd>
                  Vegetación, humedad del suelo y superficie térmica: sin conectar. Los ejemplos no
                  provienen de un satélite.
                </dd>
              </div>
            </dl>
          </div>
        )}
      </section>
      <section className="card export-studio">
        <div>
          <span className="eyebrow">CONTINÚA TU ESTUDIO</span>
          <h2>Tus datos, en tus herramientas.</h2>
          <p>
            Las descargas respetan la parcela, el período y la búsqueda por fecha. No ejecutan una
            recomendación.
          </p>
        </div>
        <p className="export-selection" role="status">
          {filtered.length} registros de {filtered[0]?.date ?? '—'} a {filtered.at(-1)?.date ?? '—'}
          {search ? ` · búsqueda activa: ${search}` : ''}
        </p>
        <div className="export-options">
          <button
            disabled={!evidence || !filtered.length}
            onClick={() => {
              if (evidence)
                download(
                  studyCSV(evidence, parcel, filtered),
                  'tarpu-estudio.csv',
                  'text/csv;charset=utf-8',
                )
            }}
          >
            <Icon name="download" />
            <strong>CSV</strong>
            <span>Excel, R y Python · tabla completa</span>
          </button>
          <button
            disabled={!evidence || !filtered.length}
            onClick={() => {
              if (evidence)
                download(
                  JSON.stringify(studyExport(evidence, parcel, filtered), null, 2),
                  'tarpu-estudio.json',
                )
            }}
          >
            <Icon name="data" />
            <strong>JSON</strong>
            <span>Registros, unidades y procedencia</span>
          </button>
          <button
            disabled={parcel.boundary.length < 3}
            onClick={() =>
              download(
                JSON.stringify(parcelGeoJSON(parcel), null, 2),
                'tarpu-parcela.geojson',
                'application/geo+json',
              )
            }
          >
            <Icon name="map" />
            <strong>GeoJSON</strong>
            <span>Solo contorno · QGIS y sistemas SIG</span>
          </button>
        </div>
        <p className="small-note">
          CSV y JSON no incluyen imágenes ni teselas. GeoJSON contiene la geometría declarada o de
          ejemplo, sin capas ráster. La disponibilidad de una variable depende de su fuente y
          resolución.
        </p>
      </section>
    </>
  )
}

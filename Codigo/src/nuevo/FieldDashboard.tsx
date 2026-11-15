// Escrito con asistencia de OpenAI Codex. Registro en entrega/uso-de-ia.md.
import { useState } from 'react'
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronDown,
  CloudSun,
  Database,
  Droplets,
  ExternalLink,
  Leaf,
  MapPin,
  Plus,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Sprout,
  Thermometer,
  X,
} from 'lucide-react'
import { FieldMap } from './FieldMap'
import { MiniChart, months } from './MiniChart'
import { FieldEvidence } from './FieldEvidence'
import type { FieldData } from './fieldData'
import { climateSummary, formatDate, mean, number } from './data'
import type { Coordinate, Field, ReferencePlace } from './data'

interface Props {
  place: ReferencePlace
  field: Field | null
  drawing: boolean
  onDrawingChange: (drawing: boolean) => void
  onComplete: (coordinates: Coordinate[]) => void
  onDraw: () => void
  onCoordinates: () => void
  onSources: () => void
  onChat: () => void
  fieldData: FieldData
}

export function FieldDashboard({
  place,
  field,
  drawing,
  onDrawingChange,
  onComplete,
  onDraw,
  onCoordinates,
  onSources,
  onChat,
  fieldData,
}: Props) {
  const [showDetail, setShowDetail] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [climateVariable, setClimateVariable] = useState<
    'temperature' | 'rain'
  >('temperature')
  const summary = climateSummary(place)
  const lastNdvi = place.vegetation.at(-1)!
  const ph = place.soil.find(
    (row) => row.property === 'phh2o' && row.depth === '0-5cm',
  )
  const texture = place.soil.filter(
    (row) => ['sand', 'clay'].includes(row.property) && row.depth === '0-5cm',
  )
  const monthly = months.map((_, index) => {
    const rows = place.climate.filter(
      (row) => Number(row.date.slice(5, 7)) === index + 1,
    )
    return climateVariable === 'temperature'
      ? mean(rows.map((row) => row.temperature))
      : rows.every((row) => row.rain !== null)
        ? rows.reduce((sum, row) => sum + (row.rain ?? 0), 0)
        : null
  })
  const recentVegetation = place.vegetation.filter((row) =>
    row.date.startsWith('2026'),
  )

  return (
    <section
      className={`dashboard-scene ${drawing ? 'scene-drawing' : ''}`}
      aria-label="Consulta del campo"
    >
      <div className="scene-map">
        <FieldMap
          place={place}
          field={field}
          drawing={drawing}
          onDrawingChange={onDrawingChange}
          onComplete={onComplete}
        />
      </div>
      {!drawing && (
        <aside className="evidence-rail" aria-label="Datos del lugar">
          <div className="evidence-heading">
            <div>
              <span>
                <MapPin size={16} />
                AREQUIPA, PERÚ
              </span>
              <h1>{field?.name ?? place.name}</h1>
              <p>{field ? 'Campo declarado por ti' : place.sectorName}</p>
            </div>
            <span className="place-illustration">
              <Sprout size={34} />
            </span>
          </div>
          <div className="reference-status">
            <span className="live-dot" />
            {field
              ? fieldData.base.state === 'ok'
                ? 'Datos reales de tu campo'
                : fieldData.base.state === 'error'
                  ? 'Sin conexión con el servidor'
                  : 'Conectando con el servidor…'
              : 'Consulta real guardada'}
            <button
              onClick={onSources}
              aria-label="Ver fuentes de esta consulta"
            >
              <ShieldCheck size={19} />
            </button>
          </div>
          {field ? (
            <FieldEvidence
              field={field}
              data={fieldData}
              onSources={onSources}
            />
          ) : (
            <>
              <article className="evidence-card readings-card">
                <div className="reading-grid">
                  <div>
                    <span>
                      <Thermometer size={18} />
                      Temperatura
                    </span>
                    <strong>
                      {number(summary.temperature)}
                      <small>°C</small>
                    </strong>
                    <p>Media anual · 2025</p>
                  </div>
                  <div>
                    <span>
                      <Droplets size={18} />
                      Lluvia
                    </span>
                    <strong>
                      {number(summary.rain, 0)}
                      <small>mm</small>
                    </strong>
                    <p>Total anual · 2025</p>
                  </div>
                  <div>
                    <span>
                      <Leaf size={18} />
                      Verdor
                    </span>
                    <strong>{number(lastNdvi.value, 3)}</strong>
                    <p>NDVI · {formatDate(lastNdvi.date)}</p>
                  </div>
                  <div>
                    <span>
                      <Sprout size={18} />
                      pH del suelo
                    </span>
                    <strong>{number(ph?.mean ?? null)}</strong>
                    <p>Estimado · 0–5 cm</p>
                  </div>
                </div>
                <button className="card-source-footer" onClick={onSources}>
                  POWER · MODIS · SoilGrids
                  <ArrowUpRight size={17} />
                </button>
              </article>
              <article className="evidence-card vegetation-card">
                <div className="evidence-card-title">
                  <h2>
                    <Leaf size={19} />
                    Verdor de la zona
                  </h2>
                  <span className="chart-year">2026</span>
                </div>
                <div className="chart-current">
                  <strong>{number(lastNdvi.value, 3)}</strong>
                  <span>
                    Última observación<small>{formatDate(lastNdvi.date)}</small>
                  </span>
                </div>
                <MiniChart
                  values={recentVegetation.map((row) => row.value)}
                  color="#578b58"
                  id="vegetation-fill"
                  label={`Serie NDVI de ${place.name} en 2026, de enero al ${formatDate(lastNdvi.date)}. Registros en Mis datos.`}
                />
                <div className="chart-endpoints">
                  <span>Enero</span>
                  <span>Octubre</span>
                </div>
                <p className="card-footnote">MODIS · 250 m · cada 16 días</p>
              </article>
              <article className="evidence-card weather-card">
                <div className="evidence-card-title">
                  <h2>
                    <CloudSun size={22} />
                    La historia del clima
                  </h2>
                  <label>
                    <span className="sr-only">Variable del gráfico</span>
                    <select
                      aria-label="Variable del gráfico"
                      value={climateVariable}
                      onChange={(event) =>
                        setClimateVariable(
                          event.target.value as 'temperature' | 'rain',
                        )
                      }
                    >
                      <option value="temperature">°C</option>
                      <option value="rain">mm</option>
                    </select>
                  </label>
                </div>
                <div className="weather-feature">
                  <CloudSun size={40} strokeWidth={1.3} />
                  <div>
                    <strong>
                      {number(
                        climateVariable === 'temperature'
                          ? summary.temperature
                          : summary.rain,
                      )}
                      <small>
                        {climateVariable === 'temperature' ? '°C' : 'mm'}
                      </small>
                    </strong>
                    <span>
                      {climateVariable === 'temperature'
                        ? 'Temperatura media'
                        : 'Lluvia total'}{' '}
                      · 2025
                    </span>
                  </div>
                </div>
                <MiniChart
                  values={monthly}
                  color="#d89a50"
                  id="weather-fill"
                  label={`${climateVariable === 'temperature' ? 'Temperatura media mensual' : 'Lluvia mensual'} de ${place.name} en 2025. Registros en Mis datos.`}
                />
                <p className="card-footnote">
                  NASA POWER · celda de ≈ 55 × 67 km
                </p>
              </article>
              <article className="evidence-card soil-card">
                <div className="evidence-card-title">
                  <h2>
                    <Sprout size={20} />
                    Una mirada al suelo
                  </h2>
                  <span className="chart-year">0–5 cm</span>
                </div>
                <div className="soil-reading">
                  <span>pH estimado</span>
                  <strong>{number(ph?.mean ?? null)}</strong>
                </div>
                <p className="soil-range">
                  Percentiles 5–95{' '}
                  <strong>
                    {number(ph?.low ?? null)} – {number(ph?.high ?? null)}
                  </strong>
                </p>
                {texture.map((row) => (
                  <div className="texture-row" key={row.property}>
                    <span>{row.property === 'sand' ? 'Arena' : 'Arcilla'}</span>
                    <div>
                      <span style={{ width: `${row.mean ?? 0}%` }} />
                    </div>
                    <strong>{number(row.mean)} %</strong>
                  </div>
                ))}
                <p className="card-footnote">SoilGrids · predicción a 250 m</p>
              </article>
            </>
          )}
          <a className="rail-explore" href="#/datos">
        <Database size={23} />
            <span>
              Explora todos los registros
              <small>Fuentes, fechas y descargas</small>
            </span>
            <ArrowUpRight size={20} />
          </a>
        </aside>
      )}
      <div className="scene-actions">
        <button className="draw-action" onClick={onDraw}>
          <Plus size={21} />
          Dibujar mi campo
        </button>
        <a className="button scene-export" href="#/datos">
          <ArrowDownToLine size={20} />
          Mis datos
        </a>
      </div>
      {!drawing && (
        <>
          <div className="scene-location">
            <span className="crosshair-corners">
              <ScanLine size={26} />
            </span>
            <span>
              {field ? 'CONTORNO DECLARADO' : 'PUNTO DE CONSULTA'}
              <strong>{field?.name ?? place.name}</strong>
            </span>
          </div>
          {!showDetail && (
            <button
              className="show-detail-button"
              onClick={() => setShowDetail(true)}
            >
              Ver ficha del lugar
              <ArrowUpRight size={18} />
            </button>
          )}
          {showDetail && (
            <article className="floating-evidence">
              <header>
                <div>
                  <span className="card-kicker">
                    {field ? 'MI CAMPO' : 'LUGAR DE REFERENCIA'}
                  </span>
                  <h2>
                    {field?.name ?? place.name}
                    <Leaf size={18} />
                  </h2>
                </div>
                <button
                  aria-label="Cerrar ficha del lugar"
                  onClick={() => setShowDetail(false)}
                >
                  <X size={18} />
                </button>
              </header>
              <p className="floating-subtitle">
                {field ? 'Contorno declarado por ti · datos con fuente' : 'Arequipa · Perú'}
              </p>
              <div className="floating-period">
                <span>
                  Consulta de clima
                  <strong>
                    {field
                      ? fieldData.climate.data
                        ? `Ene – dic ${fieldData.climate.data.year}`
                        : 'Cargando'
                      : 'Ene – dic 2025'}
                  </strong>
                </span>
                <span>
                  Origen
                  <strong>NASA POWER</strong>
                </span>
              </div>
              {!field && (
                <>
                  <div className="coverage-row">
                    <span>
                      <Check size={16} />
                      Registros de clima
                    </span>
                    <strong>{place.climate.length} días</strong>
                  </div>
                  <div className="coverage-bar">
                    <span />
                  </div>
                  <p className="coverage-caption">
                    Año 2025 completo en la consulta guardada
                  </p>
                </>
              )}
              <div className="floating-records">
                <button
                  className="floating-accordion"
                  onClick={() => setExpanded((value) => !value)}
                  aria-expanded={expanded}
                >
                  Detalles del lugar
                  <ChevronDown
                    size={18}
                    className={expanded ? 'rotated' : ''}
                  />
                </button>
                <dl>
                  <div>
                    <dt>{field ? 'Altitud media' : 'Altitud del punto'}</dt>
                    <dd>
                      {field
                        ? `${number(fieldData.base.data?.relieve?.altitud_m?.media ?? null, 0)} m`
                        : `${number(place.relief.altitud_m, 0)} m`}
                    </dd>
                  </div>
                  <div>
                    <dt>{field ? 'Pendiente mediana' : 'Pendiente del punto'}</dt>
                    <dd>
                      {field
                        ? `${number(fieldData.base.data?.relieve?.pendiente_pct?.mediana ?? null)} %`
                        : `${number(place.relief.pendiente_pct)} %`}
                    </dd>
                  </div>
                  {expanded && (
                    <>
                      <div>
                        <dt>{field ? 'Latitud del centro' : 'Latitud'}</dt>
                        <dd>
                          {field
                            ? (fieldData.base.data?.centroide.lat ?? '—')
                            : place.point.latitude}
                        </dd>
                      </div>
                      <div>
                        <dt>{field ? 'Longitud del centro' : 'Longitud'}</dt>
                        <dd>
                          {field
                            ? (fieldData.base.data?.centroide.lon ?? '—')
                            : place.point.longitude}
                        </dd>
                      </div>
                      <div>
                        <dt>Relieve</dt>
                        <dd>
                          NASADEM · 30 m
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>
              <button className="floating-source-button" onClick={onSources}>
                Ver fuentes y alcance
                <ExternalLink size={16} />
              </button>
              <button className="floating-agent-card" onClick={onChat}>
                <span>
                  <Sparkles size={18} />
                  TARPU te acompaña
                  <ArrowUpRight size={18} />
                </span>
                <strong>
                  ¿Qué dicen estos datos
                  <br />
                  sobre mi campo?
                </strong>
                <small>Conversemos sobre la evidencia</small>
              </button>
            </article>
          )}
          <button className="scene-coordinates" onClick={onCoordinates}>
            <MapPin size={19} />
            Ingresar coordenadas
          </button>
          <div className="scene-bottom-label">
            <ShieldCheck size={19} />
            <span>
              {field
                ? 'Contorno declarado por ti'
                : 'Históricos y estimaciones con fuente'}
              <small>
                {field
                  ? 'Cada dato indica su fuente y su escala'
                  : 'La escala de cada fuente acompaña a sus datos'}
              </small>
            </span>
          </div>
        </>
      )}
    </section>
  )
}


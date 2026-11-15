// Tarjetas de un campo dibujado con los datos reales de la API (capa 1 y capa 2 del esquema mixto, DT-22).
// Escrito con asistencia de IA (Claude Code), sobre el diseño de OpenAI Codex. Registro en entrega/uso-de-ia.md.
import { useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  CloudSun,
  Droplets,
  Leaf,
  Loader2,
  Mountain,
  RefreshCw,
  Satellite,
  Sprout,
  Square,
  Thermometer,
} from 'lucide-react'
import { MiniChart } from './MiniChart'
import { formatDate, number } from './data'
import type { Field } from './data'
import type { FieldData } from './fieldData'
import type { SourceResult } from './api'

const STATES: Record<string, string> = {
  pendiente: 'En cola',
  en_proceso: 'Descargando',
  listo: 'Listo',
  listo_con_vacios: 'Listo, con fechas sin dato del proveedor',
  parcial: 'Parcial',
  error: 'Con error',
  cancelado: 'Detenido',
  interrumpido: 'Interrumpido',
  reutilizado: 'Reutilizado de un campo vecino',
  no_disponible: 'No disponible todavía',
}
const SOURCES: Record<string, string> = {
  power: 'Clima diario · NASA POWER',
  modis: 'Satélite MODIS · verdor, temperatura, agua y cobertura',
  hls: 'Satélite HLS · verdor a 30 m',
  smap: 'Satélite SMAP · humedad del suelo',
}
// Clases IGBP de MCD12Q1 LC_Type1 (MODIS Land Cover Type User Guide, C6.1, cuadro 3).
const IGBP: Record<number, string> = {
  1: 'Bosque siempreverde de coníferas',
  2: 'Bosque siempreverde de hoja ancha',
  3: 'Bosque caducifolio de coníferas',
  4: 'Bosque caducifolio de hoja ancha',
  5: 'Bosque mixto',
  6: 'Matorral cerrado',
  7: 'Matorral abierto',
  8: 'Sabana arbolada',
  9: 'Sabana',
  10: 'Pastizal',
  11: 'Humedal permanente',
  12: 'Cultivos',
  13: 'Zona urbana',
  14: 'Mosaico de cultivos y vegetación natural',
  15: 'Nieve y hielo permanentes',
  16: 'Suelo desnudo o con poca vegetación',
  17: 'Agua',
}

const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

function Waiting({ text }: { text: string }) {
  return (
    <p className="api-waiting" role="status">
      <Loader2 size={18} className="spin" />
      {text}
    </p>
  )
}

export function FieldEvidence({
  field,
  data,
  onSources,
}: {
  field: Field
  data: FieldData
  onSources: () => void
}) {
  const [climateVariable, setClimateVariable] = useState<'temperature' | 'rain'>(
    'temperature',
  )
  const { base, climate, job, ndvi, landCover, running } = data
  const parcel = base.data
  const layers = parcel?.suelo?.capas ?? {}
  const soil = (property: string) => layers[`${property}_0-5cm_mean`]?.media ?? null
  const year = climate.data
  // NDVI: se muestran solo las observaciones con fiabilidad 0 (buena) o 1 (marginal) de MOD13Q1;
  // 2 (nieve o hielo) y 3 (nubes) se dejan como vacío (MOD13 User Guide, pixel reliability).
  const usable = (ndvi.data ?? []).map((row) =>
    row.reliability === 0 || row.reliability === 1 ? row.value : null,
  )
  let lastIndex = usable.length - 1
  while (lastIndex >= 0 && usable[lastIndex] === null) lastIndex--
  const lastNdvi = lastIndex >= 0 ? ndvi.data![lastIndex] : null
  const recent = usable.slice(-23)
  const sources = Object.entries(job.data?.fuentes ?? {})

  if (base.state === 'error')
    return (
      <article className="evidence-card api-error-card">
        <span className="card-kicker">SIN CONEXIÓN</span>
        <h2>No pudimos leer los datos de tu campo.</h2>
        <p>{base.error}</p>
        <button className="button-secondary" onClick={data.retry}>
          <RefreshCw size={19} />
          Volver a intentar
        </button>
      </article>
    )

  return (
    <>
      <article className="evidence-card declared-card">
        <span className="card-kicker">TU INFORMACIÓN</span>
        <dl>
          <div>
            <dt>Cultivo actual</dt>
            <dd>{field.crop || 'Sin declarar'}</dd>
          </div>
          <div>
            <dt>Agua</dt>
            <dd>{field.water}</dd>
          </div>
          <div>
            <dt>Superficie</dt>
            <dd>
              {parcel?.geometria
                ? `${number(parcel.geometria.area_ha, 2)} ha`
                : `${field.coordinates.length - 1} esquinas`}
            </dd>
          </div>
        </dl>
        <p className="card-footnote">
          Cultivo y agua: declarados por ti · superficie medida sobre tu contorno (WGS84)
        </p>
      </article>

      {base.state === 'loading' && <Waiting text="Leyendo la base de Arequipa…" />}

      {parcel && (
        <article className="evidence-card readings-card">
          <div className="reading-grid">
            <div>
              <span>
                <Mountain size={18} />
                Altitud
              </span>
              <strong>
                {number(parcel.relieve?.altitud_m?.media ?? null, 0)}
                <small>m</small>
              </strong>
              <p>
                Media · {parcel.relieve?.pixeles ?? 0} píxeles de 30 m
              </p>
            </div>
            <div>
              <span>
                <Mountain size={18} />
                Pendiente
              </span>
              <strong>
                {number(parcel.relieve?.pendiente_pct?.mediana ?? null)}
                <small>%</small>
              </strong>
              <p>Mediana en tu campo</p>
            </div>
            <div>
              <span>
                <Sprout size={18} />
                pH del suelo
              </span>
              <strong>{number(soil('phh2o'))}</strong>
              <p>Estimado · 0–5 cm</p>
            </div>
            <div>
              <span>
                <Leaf size={18} />
                Zona
              </span>
              <strong className="reading-text">
                {parcel.sector?.sector ?? '—'}
              </strong>
              <p>{parcel.sector?.nombre ?? parcel.sector?.motivo ?? 'Sin sector'}</p>
            </div>
          </div>
          <button className="card-source-footer" onClick={onSources}>
            NASADEM · SoilGrids · IV CENAGRO 2012
            <ArrowUpRight size={17} />
          </button>
        </article>
      )}

      {parcel?.sector?.cultivos_principales?.length ? (
        <article className="evidence-card">
          <div className="evidence-card-title">
            <h2>
              <Sprout size={20} />
              Lo que más se siembra en tu zona
            </h2>
          </div>
          <ol className="crop-ranking">
            {parcel.sector.cultivos_principales.map((crop) => (
              <li key={crop}>{capital(crop)}</li>
            ))}
          </ol>
          <p className="card-footnote">
            Por superficie sembrada en el sector {parcel.sector.sector} · IV CENAGRO 2012
            (INEI). Describe la zona, no recomienda.
          </p>
        </article>
      ) : null}

      <article className="evidence-card weather-card">
        <div className="evidence-card-title">
          <h2>
            <CloudSun size={22} />
            La historia del clima
          </h2>
          {year && (
            <label>
              <span className="sr-only">Variable del gráfico</span>
              <select
                aria-label="Variable del gráfico"
                value={climateVariable}
                onChange={(event) =>
                  setClimateVariable(event.target.value as 'temperature' | 'rain')
                }
              >
                <option value="temperature">°C</option>
                <option value="rain">mm</option>
              </select>
            </label>
          )}
        </div>
        {climate.state === 'loading' && <Waiting text="Leyendo la serie diaria…" />}
        {climate.state === 'error' && <p>{climate.error}</p>}
        {year && (
          <>
            <div className="weather-feature">
              {climateVariable === 'temperature' ? (
                <Thermometer size={40} strokeWidth={1.3} />
              ) : (
                <Droplets size={40} strokeWidth={1.3} />
              )}
              <div>
                <strong>
                  {number(
                    climateVariable === 'temperature' ? year.temperature : year.rain,
                    climateVariable === 'temperature' ? 1 : 0,
                  )}
                  <small>{climateVariable === 'temperature' ? '°C' : 'mm'}</small>
                </strong>
                <span>
                  {climateVariable === 'temperature'
                    ? 'Temperatura media'
                    : 'Lluvia total'}{' '}
                  · {year.year}
                </span>
              </div>
            </div>
            <MiniChart
              values={
                climateVariable === 'temperature'
                  ? year.monthlyTemperature
                  : year.monthlyRain
              }
              color="#d89a50"
              id="field-weather-fill"
              label={`${climateVariable === 'temperature' ? 'Temperatura media mensual' : 'Lluvia mensual'} de ${year.year} en la celda de NASA POWER de tu campo.`}
            />
            <p className="card-footnote">
              NASA POWER · celda de ≈ 55 × 67 km · {year.days} días
              {climateVariable === 'rain' && year.missingRain
                ? ` · ${year.missingRain} días sin dato`
                : ''}
            </p>
          </>
        )}
      </article>

      {parcel?.suelo?.capas && (
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
            <strong>{number(soil('phh2o'))}</strong>
          </div>
          {(['sand', 'silt', 'clay'] as const).map((property) => (
            <div className="texture-row" key={property}>
              <span>
                {property === 'sand' ? 'Arena' : property === 'silt' ? 'Limo' : 'Arcilla'}
              </span>
              <div>
                <span style={{ width: `${soil(property) ?? 0}%` }} />
              </div>
              <strong>{number(soil(property))} %</strong>
            </div>
          ))}
          <p className="card-footnote">
            SoilGrids 2.0 · {parcel.suelo.pixeles} píxel(es) de 250 m que tocan tu campo ·
            estimación, no análisis de laboratorio
          </p>
        </article>
      )}

      <article className="evidence-card extraction-card">
        <div className="evidence-card-title">
          <h2>
            <Satellite size={20} />
            Datos satelitales de tu campo
          </h2>
        </div>
        {!job.data && job.state !== 'loading' && (
          <>
            <p>
              Traemos la historia satelital desde 2015 para las coordenadas de tu campo.
              Si un campo vecino ya la tiene, se reutiliza.
            </p>
            {job.error && <p className="api-error-text">{job.error}</p>}
            <button
              className="button-primary"
              onClick={data.extract}
              disabled={base.state !== 'ok'}
            >
              <Satellite size={20} />
              Traer datos satelitales
            </button>
          </>
        )}
        {job.state === 'loading' && !job.data && <Waiting text="Pidiendo el trabajo…" />}
        {job.data && (
          <>
            <p className="job-state">
              {running && <Loader2 size={18} className="spin" />}
              <strong>{STATES[job.data.estado] ?? job.data.estado}</strong>
            </p>
            <ul className="source-states">
              {sources.map(([key, source]) => {
                const state =
                  typeof source === 'string' ? source : (source as SourceResult).estado
                const reason =
                  typeof source === 'string' ? null : (source as SourceResult).motivo
                return (
                  <li key={key} className={`source-${state}`}>
                    <span>{SOURCES[key] ?? key}</span>
                    <strong>{STATES[state] ?? state}</strong>
                    {reason && state !== 'listo' && <small>{reason}</small>}
                  </li>
                )
              })}
            </ul>
            {job.data.motivo && <p className="api-error-text">{job.data.motivo}</p>}
            {running ? (
              <button className="button-secondary" onClick={data.cancel}>
                <Square size={18} />
                Detener
              </button>
            ) : (
              ['cancelado', 'interrumpido', 'error', 'parcial'].includes(
                job.data.estado,
              ) && (
                <button className="button-secondary" onClick={data.extract}>
                  <RefreshCw size={18} />
                  Volver a intentar
                </button>
              )
            )}
          </>
        )}
      </article>

      {ndvi.state === 'loading' && <Waiting text="Leyendo el verdor…" />}
      {lastNdvi && (
        <article className="evidence-card vegetation-card">
          <div className="evidence-card-title">
            <h2>
              <Leaf size={19} />
              Verdor de tu campo
            </h2>
            <span className="chart-year">NDVI</span>
          </div>
          <div className="chart-current">
            <strong>{number(lastNdvi.value, 3)}</strong>
            <span>
              Última observación<small>{formatDate(lastNdvi.date)}</small>
            </span>
          </div>
          <MiniChart
            values={recent}
            color="#578b58"
            id="field-vegetation-fill"
            label="NDVI de las últimas 23 composiciones de 16 días de MODIS. Registros en Mis datos."
          />
          <div className="chart-endpoints">
            <span>{formatDate(ndvi.data!.at(-23)?.date ?? ndvi.data![0].date)}</span>
            <span>{formatDate(ndvi.data!.at(-1)!.date)}</span>
          </div>
          <p className="card-footnote">
            MOD13Q1 · píxel de 250 m · cada 16 días · se omiten fechas con nubes o nieve.
            El verdor no mide la fertilidad.
          </p>
          {landCover.data && (
            <p className="card-footnote">
              Cobertura MCD12Q1 ({landCover.data.date.slice(0, 4)}, píxel de 500 m):{' '}
              {IGBP[landCover.data.code] ?? `clase ${landCover.data.code}`}
            </p>
          )}
        </article>
      )}

      {parcel?.avisos?.length ? (
        <article className="evidence-card notice-card">
          <span className="card-kicker">
            <AlertTriangle size={15} /> TEN EN CUENTA
          </span>
          <ul>
            {parcel.avisos.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
        </article>
      ) : null}
    </>
  )
}

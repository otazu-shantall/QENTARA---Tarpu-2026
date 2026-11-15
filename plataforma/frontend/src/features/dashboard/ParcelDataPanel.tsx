// Panel de datos reales de la parcela: capa 1 (relieve, suelo, zona y cultivos del censo) y extracción satelital
// (capa 2) con seguimiento y «Detener». Sigue el contrato de T03 (trabajo/T03-modelado-datos/contrato-pantallas.md §5):
// cada dato con su fuente y escala; si falta, «Sin dato» y su motivo; nunca 0.
// Escrito con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
import { useWorkspace } from '../../app/WorkspaceContext'
import { useParcelData } from '../../services/parcelData'
import type { BaseParcel, SourceResult } from '../../services/api'
import { number } from '../../lib/evidence'
import { Icon } from '../../components/ui/Icon'

const STATES: Record<string, string> = {
  pendiente: 'En cola',
  en_proceso: 'Descargando',
  listo: 'Listo',
  listo_con_vacios: 'Listo, con fechas sin dato del proveedor',
  parcial: 'Parcial',
  sin_datos: 'La fuente no devolvió datos',
  error: 'Con error',
  cancelado: 'Detenido',
  interrumpido: 'Interrumpido',
  no_disponible: 'Todavía no conectado',
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

/** El punto (GET /api/base) y el contorno (POST /api/base/parcela) traen el relieve y el suelo con formas distintas. */
function readings(base: BaseParcel) {
  const relief = base.relieve as Record<string, unknown> | undefined
  const altitude =
    typeof relief?.altitud_m === 'number'
      ? (relief.altitud_m as number)
      : ((relief?.altitud_m as { media?: number } | undefined)?.media ?? null)
  const slope =
    typeof relief?.pendiente_pct === 'number'
      ? (relief.pendiente_pct as number)
      : ((relief?.pendiente_pct as { mediana?: number } | undefined)?.mediana ?? null)
  const layers = (base.suelo?.capas ?? {}) as Record<string, { media?: number | null; valor?: number | null }>
  const soil = (property: string) => {
    const layer = layers[`${property}_0-5cm_mean`]
    return layer?.media ?? layer?.valor ?? null
  }
  // Sin dato en el contorno: se dice por qué, y se muestra el valor del centroide si lo hay.
  const center = base.relieve_centroide as { altitud_m?: number; pendiente_pct?: number } | undefined
  const reason = relief?.estado !== 'listo' ? ((relief?.motivo as string | undefined) ?? null) : null
  return {
    altitude: altitude ?? (reason ? (center?.altitud_m ?? null) : null),
    slope: slope ?? (reason ? (center?.pendiente_pct ?? null) : null),
    soil,
    pixels: relief?.pixeles as number | undefined,
    reason,
    soilReason: base.suelo?.estado !== 'listo' ? (base.suelo?.motivo ?? null) : null,
  }
}

export function ParcelDataPanel() {
  const { parcel } = useWorkspace()
  const data = useParcelData(parcel)
  const { base, job, running, landCover } = data
  if (parcel.kind === 'example') return null
  const values = base.data ? readings(base.data) : null
  const sector = base.data?.sector
  const sources = Object.entries(job.data?.fuentes ?? {})
  const drawn = parcel.boundary.length > 2

  return (
    <section className="parcel-data" aria-label="Datos reales de la parcela">
      {base.state === 'loading' && (
        <p className="api-waiting" role="status">
          <Icon name="loader" size={18} /> Leyendo la base de Arequipa…
        </p>
      )}
      {base.state === 'error' && (
        <div className="notice" role="alert">
          {base.error} <button onClick={data.retry}>Reintentar</button>
        </div>
      )}
      {values && base.data && (
        <>
          <div className="metrics-grid parcel-readings">
            <article className="metric-card">
              <span className="metric-icon">
                <Icon name="compass" size={19} />
              </span>
              <span className="metric-label">Altitud</span>
              <strong>
                {number(values.altitude, 0)}
                {values.altitude !== null && <small>m</small>}
              </strong>
              <p>
                NASADEM ·{' '}
                {values.reason
                  ? `en el centro del campo (${values.reason})`
                  : drawn
                    ? `media de ${values.pixels ?? 0} píxeles de 30 m`
                    : 'píxel de 30 m'}
              </p>
            </article>
            <article className="metric-card">
              <span className="metric-icon">
                <Icon name="layers" size={19} />
              </span>
              <span className="metric-label">Pendiente</span>
              <strong>
                {number(values.slope)}
                {values.slope !== null && <small>%</small>}
              </strong>
              <p>
                NASADEM · {values.reason ? 'en el centro del campo' : drawn ? 'mediana en tu campo' : 'en el punto'}
              </p>
            </article>
            <article className="metric-card">
              <span className="metric-icon">
                <Icon name="sprout" size={19} />
              </span>
              <span className="metric-label">pH del suelo</span>
              <strong>{number(values.soil('phh2o'))}</strong>
              <p>SoilGrids · {values.soilReason ?? 'estimado, 0–5 cm'}</p>
            </article>
            <article className="metric-card">
              <span className="metric-icon">
                <Icon name="map" size={19} />
              </span>
              <span className="metric-label">Zona</span>
              <strong>{sector?.sector ?? '—'}</strong>
              <p>{sector?.nombre ?? sector?.motivo ?? 'Sin zona asignada'}</p>
            </article>
          </div>

          <div className="parcel-data-grid">
            <article className="card">
              <span className="eyebrow">EL SUELO, ESTIMADO</span>
              <h3>Textura de 0 a 5 cm</h3>
              {(['sand', 'silt', 'clay'] as const).map((property) => {
                const value = values.soil(property)
                return (
                  <div className="texture-row" key={property}>
                    <span>
                      {property === 'sand' ? 'Arena' : property === 'silt' ? 'Limo' : 'Arcilla'}
                    </span>
                    <div>
                      <span style={{ width: `${value ?? 0}%` }} />
                    </div>
                    <strong>{value === null ? 'Sin dato' : `${number(value)} %`}</strong>
                  </div>
                )
              })}
              <p className="small-note">
                ISRIC SoilGrids 2.0 ·{' '}
                {drawn ? 'píxeles de 250 m que tocan tu campo' : 'píxel de 250 m del punto'}. Es una
                estimación, no un análisis de laboratorio.
              </p>
            </article>
            {sector?.cultivos_principales?.length ? (
              <article className="card">
                <span className="eyebrow">LO QUE MÁS SE SIEMBRA EN TU ZONA</span>
                <h3>{sector.nombre}</h3>
                <ol className="crop-ranking">
                  {sector.cultivos_principales.map((crop) => (
                    <li key={crop}>{capital(crop)}</li>
                  ))}
                </ol>
                <p className="small-note">
                  Por superficie sembrada en la zona {sector.sector} · IV CENAGRO 2012 (INEI).
                  Describe la zona; no es una recomendación.
                </p>
              </article>
            ) : null}
          </div>
          {base.data.avisos?.length ? (
            <div className="parcel-notices">
              <Icon name="shield" size={18} />
              <ul>
                {base.data.avisos.map((notice) => (
                  <li key={notice}>{notice}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}

      {base.state === 'ok' && (
        <article className="card extraction-card">
          <div className="extraction-head">
            <div>
              <span className="eyebrow">DATOS SATELITALES</span>
              <h3>La historia de tu campo desde el espacio</h3>
            </div>
            {job.data && (
              <span className={`status-pill ${running ? '' : 'neutral'}`}>
                <span />
                {STATES[job.data.estado] ?? job.data.estado}
              </span>
            )}
          </div>
          {!job.data && (
            <>
              <p>
                {drawn
                  ? 'Traemos el verdor, la temperatura de superficie, el agua y la cobertura desde 2015 para tu campo. Si un campo vecino ya los tiene, se reutilizan.'
                  : 'Dibuja el contorno de tu campo para traer sus datos satelitales.'}
              </p>
              {job.error && <p className="form-error">{job.error}</p>}
              <button
                className="button button-green"
                onClick={data.extract}
                disabled={!drawn || job.state === 'loading'}
              >
                <Icon name={job.state === 'loading' ? 'loader' : 'download'} size={18} />
                Traer datos satelitales
              </button>
            </>
          )}
          {job.data && (
            <>
              <ul className="source-states">
                {sources.map(([key, source]) => {
                  const state = typeof source === 'string' ? source : (source as SourceResult).estado
                  const reason = typeof source === 'string' ? null : (source as SourceResult).motivo
                  const reused =
                    typeof source !== 'string' &&
                    ((source as SourceResult).reutilizado as { de?: string } | undefined)?.de
                  return (
                    <li key={key} className={`source-${state}`}>
                      <span>{SOURCES[key] ?? key}</span>
                      <strong>{STATES[state] ?? state}</strong>
                      {reused && <small>Reutilizado: {reused}</small>}
                      {reason && state !== 'listo' && <small>{reason}</small>}
                    </li>
                  )
                })}
              </ul>
              {landCover && (
                <p className="small-note">
                  Cobertura del suelo MCD12Q1 ({landCover.date.slice(0, 4)}, píxel de 500 m):{' '}
                  <strong>{IGBP[landCover.code] ?? `clase ${landCover.code}`}</strong>
                </p>
              )}
              {job.data.motivo && <p className="form-error">{job.data.motivo}</p>}
              <div className="extraction-actions">
                {running ? (
                  <button className="button button-outline" onClick={data.cancel}>
                    <Icon name="stop" size={17} /> Detener
                  </button>
                ) : (
                  ['cancelado', 'interrumpido', 'error', 'parcial'].includes(job.data.estado) && (
                    <button className="button button-outline" onClick={data.extract}>
                      <Icon name="undo" size={17} /> Volver a intentar
                    </button>
                  )
                )}
              </div>
            </>
          )}
        </article>
      )}
    </section>
  )
}

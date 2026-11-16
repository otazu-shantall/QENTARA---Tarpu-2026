// «Extraer datos completos» y lo que se encontró, explicado en palabras sencillas.
// Cada explicación viene del backend con su cita (tarpu_api/lectura.py) o es la definición del dato; nunca se
// inventa un umbral (DT-16). Sigue el contrato de T03 (documentacion/modelo-de-datos/contrato-pantallas.md §5).
// Escrito con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useWorkspace } from '../../app/WorkspaceContext'
import { useParcelData } from '../../services/parcelData'
import type { ParcelData } from '../../services/parcelData'
import { sectorMap } from '../../services/api'
import type { BaseParcel, CropPh, SectorMap, SourceResult } from '../../services/api'
import { number } from '../../lib/evidence'
import { Icon } from '../../components/ui/Icon'
import type { IconName } from '../../components/ui/Icon'
import { Dialog } from '../../components/ui/Dialog'
import { AGENT } from '../../lib/agent'
import { ABOUT } from './about'

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
const NAMES: Record<string, string> = {
  maiz: 'maíz',
  cana_de_azucar: 'caña de azúcar',
  oregano: 'orégano',
  canihua: 'cañihua',
  algodon: 'algodón',
}
const cropName = (key: string) => NAMES[key] ?? key.replaceAll('_', ' ')
const list = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items.at(-1)}`

type Step = 'done' | 'loading' | 'waiting' | 'failed' | 'off'

function useSeconds(active: boolean, since?: string) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [active])
  return since ? Math.max(0, Math.round((now - Date.parse(since)) / 1000)) : 0
}
const clock = (s: number) => `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`

function product(data: ParcelData, key: string): Step {
  const job = data.job.data
  if (!job) return data.job.state === 'loading' ? 'loading' : 'waiting'
  const modis = job.fuentes.modis
  const result = typeof modis === 'string' ? undefined : (modis as SourceResult).productos?.[key]
  if (result?.estado === 'listo' || result?.estado === 'listo_con_vacios') return 'done'
  if (result?.estado === 'error' || result?.estado === 'sin_datos') return 'failed'
  return data.running ? 'loading' : 'failed'
}

function Checklist({ data }: { data: ParcelData }) {
  const { evidence, loading } = useWorkspace()
  const base = data.base
  const seconds = useSeconds(data.running, data.job.data?.iniciado ?? data.job.data?.creado)
  const layer = (part: { estado: string } | undefined): Step =>
    base.state === 'loading' ? 'loading' : part?.estado === 'listo' ? 'done' : base.state === 'ok' ? 'failed' : 'waiting'
  const relief = base.data?.relieve?.estado === 'listo' ? base.data.relieve : base.data?.relieve_centroide
  const steps: { label: string; source: string; state: Step }[] = [
    { label: 'Altitud y pendiente', source: 'NASADEM', state: layer(relief) },
    { label: 'Suelo', source: 'SoilGrids', state: layer(base.data?.suelo) },
    { label: 'Zona y cultivos de la zona', source: 'Censo agropecuario 2012', state: layer(base.data?.sector) },
    {
      label: 'Clima diario desde 2015',
      source: 'NASA POWER',
      state: loading ? 'loading' : evidence ? 'done' : 'failed',
    },
    { label: 'Verdor de la vegetación', source: 'MODIS', state: product(data, 'MOD13Q1') },
    { label: 'Temperatura de la superficie', source: 'MODIS', state: product(data, 'MOD11A2') },
    { label: 'Agua que usan las plantas', source: 'MODIS', state: product(data, 'MOD16A2GF') },
    { label: 'Tipo de cobertura', source: 'MODIS', state: product(data, 'MCD12Q1') },
    { label: 'Humedad del suelo y verdor a 30 m', source: 'SMAP y HLS', state: 'off' },
  ]
  const icon: Record<Step, IconName> = {
    done: 'check',
    loading: 'loader',
    waiting: 'loader',
    failed: 'close',
    off: 'close',
  }
  const word: Record<Step, string> = {
    done: 'Listo',
    loading: 'Cargando…',
    waiting: 'En espera',
    failed: 'No se pudo',
    off: 'Todavía no conectado',
  }
  return (
    <section className="card extraction" aria-label="Avance de la extracción">
      <div className="extraction-top">
        <h3>{data.running ? 'Extrayendo los datos de tu campo' : 'Datos de tu campo'}</h3>
        {data.running && (
          <button className="button button-outline" onClick={data.cancel}>
            <Icon name="stop" size={16} /> Detener
          </button>
        )}
        {!data.running &&
          data.job.data &&
          ['cancelado', 'interrumpido', 'error', 'parcial'].includes(data.job.data.estado) && (
            <button className="button button-outline" onClick={data.extract}>
              <Icon name="undo" size={16} /> Continuar la extracción
            </button>
          )}
      </div>
      <ul className="steps">
        {steps.map((step) => (
          <li key={step.label} className={`step step-${step.state}`}>
            <span className="step-icon">
              <Icon name={icon[step.state]} size={15} />
            </span>
            <span className="step-label">
              {step.label}
              <small>{step.source}</small>
            </span>
            <span className="step-state">{word[step.state]}</span>
          </li>
        ))}
      </ul>
      {data.running && (
        <p className="small-note">
          Lleva {clock(seconds)}. Los datos de satélite pueden tardar varios minutos la primera vez;
          si un campo vecino ya los pidió, se reutilizan y salen casi al instante. Puedes seguir
          mirando lo que ya está listo.
        </p>
      )}
      {data.job.error && <p className="form-error">{data.job.error}</p>}
    </section>
  )
}

function Finding({
  icon,
  title,
  value,
  unit,
  children,
  source,
  about,
}: {
  icon: IconName
  title: string
  value: string
  unit?: string
  children: React.ReactNode
  source: string
  about: keyof typeof ABOUT
}) {
  const [open, setOpen] = useState(false)
  const { askAssistant } = useWorkspace()
  const info = ABOUT[about]
  return (
    <>
      <article className="card finding">
        <span className="finding-title">
          <Icon name={icon} size={18} /> {title}
        </span>
        <strong className="finding-value">
          {value}
          {unit && <small>{unit}</small>}
        </strong>
        <div className="finding-text">{children}</div>
        <span className="finding-source">{source}</span>
        <button className="finding-open" onClick={() => setOpen(true)}>
          <Icon name="help" size={16} /> ¿Qué es este dato?
        </button>
      </article>
      {open && (
        <Dialog title={title} onClose={() => setOpen(false)} className="about-dialog wide-dialog">
          <div className="about-grid">
            <section className="about-value">
              <span className="about-label">Tu dato</span>
              <strong className="finding-value">
                {value}
                {unit && <small>{unit}</small>}
              </strong>
              <div className="finding-text">{children}</div>
            </section>
            <section className="about-facts">
              <span className="about-label">De dónde sale</span>
              <dl>
                <div>
                  <dt>Fuente</dt>
                  <dd>{info.source}</dd>
                </div>
                <div>
                  <dt>Escala</dt>
                  <dd>{info.scale}</dd>
                </div>
                <div>
                  <dt>Cada cuánto</dt>
                  <dd>{info.frequency}</dd>
                </div>
              </dl>
              <Link to={`/app/ayuda?tab=fuentes#${info.anchor}`} onClick={() => setOpen(false)} className="text-link">
                Ver la fuente completa <Icon name="upRight" size={15} />
              </Link>
            </section>
          </div>
          <div className="about-columns">
            <section>
              <h3>
                <Icon name="help" size={18} /> Qué es
              </h3>
              {info.what.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
            <section>
              <h3>
                <Icon name="eye" size={18} /> Cómo leerlo
              </h3>
              <ul>
                {info.read.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
            <section className="about-limits">
              <h3>
                <Icon name="shield" size={18} /> Lo que no dice
              </h3>
              <ul>
                {info.limits.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          </div>
          <div className="about-actions">
            <button
              className="button button-green"
              onClick={() => {
                setOpen(false)
                askAssistant(info.ask)
              }}
            >
              <Icon name="send" size={17} /> Explorar más con {AGENT}
            </button>
            <button className="button button-outline" onClick={() => setOpen(false)}>
              Cerrar
            </button>
          </div>
        </Dialog>
      )}
    </>
  )
}

function PhCrops({ crops }: { crops: CropPh[] }) {
  const group = (state: CropPh['estado']) =>
    crops.filter((c) => c.estado === state).map((c) => cropName(c.cultivo))
  const ideal = group('dentro_optimo'),
    tolerated = group('dentro_absoluto'),
    outside = group('fuera_absoluto'),
    unknown = group('sin_regla')
  if (!crops.length) return null
  return (
    <>
      <p>De los cultivos que más se siembran en tu zona:</p>
      <ul className="ph-groups">
        {ideal.length > 0 && (
          <li className="ph-ideal">
            <strong>En su pH ideal:</strong> {list(ideal)}.
          </li>
        )}
        {tolerated.length > 0 && (
          <li className="ph-tolerated">
            <strong>Lo toleran, pero fuera de su pH ideal:</strong> {list(tolerated)}.
          </li>
        )}
        {outside.length > 0 && (
          <li className="ph-outside">
            <strong>Fuera del pH que toleran:</strong> {list(outside)}.
          </li>
        )}
        {unknown.length > 0 && <li className="ph-unknown">Sin ficha: {list(unknown)}.</li>}
      </ul>
      <details className="finding-more">
        <summary>Ver los rangos de cada cultivo</summary>
        <ul>
          {crops
            .filter((c) => c.ph_optimo)
            .map((c) => (
              <li key={c.cultivo}>
                {cropName(c.cultivo)}: ideal {c.ph_optimo![0]}–{c.ph_optimo![1]}, tolera{' '}
                {c.ph_absoluto![0]}–{c.ph_absoluto![1]}{' '}
                <a href={c.fuente} target="_blank" rel="noreferrer">
                  ficha FAO
                </a>
              </li>
            ))}
        </ul>
      </details>
    </>
  )
}

function Findings({ base, data }: { base: BaseParcel; data: ParcelData }) {
  const { evidence } = useWorkspace()
  const [zones, setZones] = useState<SectorMap | null>(null)
  useEffect(() => {
    sectorMap()
      .then(setZones)
      .catch(() => undefined)
  }, [])
  const reading = base.lectura
  const relief = base.relieve as Record<string, unknown> | undefined
  const altitude =
    typeof relief?.altitud_m === 'number'
      ? (relief.altitud_m as number)
      : ((relief?.altitud_m as { media?: number } | undefined)?.media ??
        base.relieve_centroide?.altitud_m ??
        null)
  const sector = base.sector
  const range = sector?.sector ? zones?.sectores[sector.sector]?.altitud_m : undefined
  const year = (evidence?.points ?? []).slice(-365)
  const temps = year.map((p) => p.temperature).filter((v): v is number => v !== null)
  const rains = year.map((p) => p.rain).filter((v): v is number => v !== null)
  const minima = year.map((p) => p.minimum).filter((v): v is number => v !== null)
  const frost = minima.filter((v) => v < 0).length
  const ndvi = [...(evidence?.points ?? [])].reverse().find((p) => p.vegetation != null)
  const humid = year.map((p) => p.humidity).filter((v): v is number => v !== null)
  const sun = year.map((p) => p.solarRadiation).filter((v): v is number => v != null)
  const lst = [...(evidence?.points ?? [])].reverse().find((p) => p.surfaceTemperature != null)
  const ph = reading?.ph.valor ?? null
  const texture = reading?.textura

  return (
    <section className="findings" aria-label="Lo que encontramos">
      <h2 className="findings-heading">Lo que encontramos</h2>
      <div className="findings-grid">
        <Finding
          icon="compass"
          about="altitud"
          title="Altitud y zona"
          value={number(altitude, 0)}
          unit={altitude !== null ? 'm' : undefined}
          source="NASADEM · zonas por altitud de Arequipa"
        >
          {sector?.sector ? (
            <p>
              Tu campo está en la zona <strong>{sector.sector}</strong>, {sector.nombre?.toLowerCase()}
              {range ? ` (de ${range[0]} a ${range[1]} m)` : ''}.
            </p>
          ) : (
            <p>{sector?.motivo ?? 'Sin zona asignada.'}</p>
          )}
        </Finding>

        <Finding
          icon="layers"
          about="pendiente"
          title="Inclinación del terreno"
          value={number(reading?.pendiente.valor_pct ?? null)}
          unit={reading?.pendiente.valor_pct != null ? '%' : undefined}
          source={`NASADEM · ${reading?.pendiente.cita ?? 'FAO (2006)'}`}
        >
          {reading?.pendiente.clase ? (
            <p>
              Terreno <strong>{reading.pendiente.clase}</strong>, según la clasificación de la FAO.
            </p>
          ) : (
            <p>Sin dato de pendiente.</p>
          )}
        </Finding>

        <Finding
          icon="sprout"
          about="ph"
          title="Acidez del suelo (pH)"
          value={number(ph)}
          source="SoilGrids (estimado, 0–5 cm) · rangos de FAO EcoCrop"
        >
          {ph !== null && (
            <p>
              {ph < 7 ? 'Menor que 7: suelo ácido.' : ph > 7 ? 'Mayor que 7: suelo alcalino.' : 'Igual a 7: suelo neutro.'}
            </p>
          )}
          <PhCrops crops={reading?.ph.cultivos_de_la_zona ?? []} />
        </Finding>

        <Finding
          icon="leaf"
          about="textura"
          title="De qué está hecho el suelo"
          value={texture?.predomina ? `Más ${texture.predomina}` : 'Sin dato'}
          source="SoilGrids · estimación, no análisis de laboratorio"
        >
          {(['arena', 'limo', 'arcilla'] as const).map((key) => {
            const value = texture?.fracciones_pct[key] ?? null
            return (
              <div className="texture-row" key={key}>
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                <div>
                  <span style={{ width: `${value ?? 0}%` }} />
                </div>
                <strong>{value === null ? 'Sin dato' : `${number(value)} %`}</strong>
              </div>
            )
          })}
        </Finding>

        <Finding
          icon="temperature"
          about="clima"
          title="El clima del último año"
          value={number(temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null)}
          unit={temps.length ? '°C' : undefined}
          source={`NASA POWER · celda de ≈ 55 × 67 km${year.length ? ` · ${year[0].date} a ${year.at(-1)!.date}` : ''}`}
        >
          {year.length ? (
            <ul className="plain-list">
              <li>Temperatura media del aire: {number(temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null)} °C.</li>
              <li>
                Lluvia total: {number(rains.reduce((a, b) => a + b, 0), 0)} mm
                {rains.length < year.length ? ` (${year.length - rains.length} días sin dato)` : ''}.
              </li>
              <li>Noches con la mínima bajo 0 °C: {frost}.</li>
            </ul>
          ) : (
            <p>La serie de clima todavía no está disponible.</p>
          )}
          <Link to="/app/historial" className="text-link">
            Ver mes a mes <Icon name="upRight" size={15} />
          </Link>
        </Finding>

        {ndvi ? (
          <Finding
            icon="leaf"
            about="verdor" title="Verdor de la vegetación"
            value={number(ndvi.vegetation ?? null, 2)}
            source={`MODIS · píxel de 250 m · ${ndvi.date}`}
          >
            <p>
              El NDVI va de −1 a 1: cuanto más alto, más vegetación verde. No mide la fertilidad del
              suelo.
            </p>
          </Finding>
        ) : data.extracted ? (
          <Finding icon="leaf" about="verdor" title="Verdor de la vegetación" value="…" source="MODIS">
            <p>Aparece cuando termine la extracción del satélite.</p>
          </Finding>
        ) : null}

        {lst && (
          <Finding
            icon="sun"
            about="superficie"
            title="Temperatura de la superficie"
            value={number(lst.surfaceTemperature ?? null)}
            unit="°C"
            source={`MODIS · píxel de 1 km · de día · ${lst.date}`}
          >
            <p>La del suelo y las plantas vista por el satélite. No es la del aire.</p>
          </Finding>
        )}

        {humid.length > 0 && (
          <Finding
            icon="humidity"
            about="humedad"
            title="Humedad del aire"
            value={number(humid.reduce((a, b) => a + b, 0) / humid.length, 0)}
            unit="%"
            source="NASA POWER · promedio del último año"
          >
            <p>Cuánto vapor de agua tiene el aire. No es la humedad del suelo.</p>
          </Finding>
        )}

        {sun.length > 0 && (
          <Finding
            icon="sun"
            about="radiacion"
            title="Energía del sol"
            value={number(sun.reduce((a, b) => a + b, 0) / sun.length)}
            unit="MJ/m² por día"
            source="NASA POWER · promedio del último año"
          >
            <p>La energía solar que llega al suelo cada día, en promedio.</p>
          </Finding>
        )}

        {base.geometria && (
          <Finding
            icon="scan"
            about="area"
            title="Tamaño de tu parcela"
            value={number(base.geometria.area_ha, 2)}
            unit="ha"
            source="Medido sobre tu dibujo"
          >
            <p>Perímetro: {number(base.geometria.perimetro_m, 0)} m. Una hectárea son 10 000 m².</p>
          </Finding>
        )}

        {data.landCover && (
          <Finding
            icon="map"
            about="cobertura"
          title="Qué cubre el terreno"
            value={IGBP[data.landCover.code] ?? `Clase ${data.landCover.code}`}
            source={`MODIS MCD12Q1 · píxel de 500 m · ${data.landCover.date.slice(0, 4)}`}
          >
            <p>Clasificación del satélite para el píxel que contiene tu campo.</p>
          </Finding>
        )}
      </div>
      {base.avisos?.length ? (
        <details className="card notices">
          <summary>
            <Icon name="shield" size={16} /> Ten en cuenta ({base.avisos.length})
          </summary>
          <ul>
            {base.avisos.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  )
}

export function ParcelDataPanel() {
  const { parcel } = useWorkspace()
  const data = useParcelData(parcel)
  if (parcel.kind === 'example') return null
  if (data.base.state === 'error')
    return (
      <div className="notice" role="alert">
        {data.base.error} <button onClick={data.retry}>Reintentar</button>
      </div>
    )
  if (!data.extracted)
    return (
      <section className="card extract-call">
        <div>
          <h3>Extraer los datos de {parcel.kind === 'reference' ? parcel.name : 'tu campo'}</h3>
          <p>Relieve, suelo, zona, clima desde 2015 y datos del satélite, todo de una vez.</p>
        </div>
        <button
          className="button button-green extract-button"
          onClick={data.extract}
          disabled={data.base.state !== 'ok'}
        >
          <Icon name={data.base.state === 'ok' ? 'download' : 'loader'} size={19} />
          Extraer datos completos
        </button>
      </section>
    )
  return (
    <>
      <Checklist data={data} />
      {data.base.data && <Findings base={data.base.data} data={data} />}
    </>
  )
}

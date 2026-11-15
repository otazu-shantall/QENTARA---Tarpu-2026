// «Mis datos» de un campo dibujado (archivos en crudo de la API) y lista de puntos extraídos en el servidor.
// Escrito con asistencia de IA (Claude Code), sobre el diseño de OpenAI Codex. Registro en entrega/uso-de-ia.md.
import { useEffect, useState } from 'react'
import { ArrowDownToLine, Database, Eye, Loader2, MapPinned, Satellite } from 'lucide-react'
import { download } from './data'
import type { Field } from './data'
import type { FieldData } from './fieldData'
import { jobs as listJobs, parseCsv, rawFile } from './api'
import type { Job, RawFile, SourceResult } from './api'

const KINDS: Record<string, string> = {
  original: 'Original del proveedor',
  normalizado: 'Normalizado (columnas, unidades y fechas)',
  detalle: 'Detalle por píxel y calidad',
  procedencia: 'Procedencia (cómo y cuándo se obtuvo)',
}

interface Entry {
  group: string
  kind: string
  path: string
}

function filesOf(data: FieldData): Entry[] {
  const list: Entry[] = []
  const add = (group: string, files?: Record<string, string>) => {
    for (const [kind, path] of Object.entries(files ?? {}))
      if (path && /\.(csv|json)$/.test(path)) list.push({ group, kind, path })
  }
  add('Clima diario · NASA POWER (celda de la base)', data.base.data?.clima?.archivos)
  for (const [key, source] of Object.entries(data.job.data?.fuentes ?? {})) {
    if (typeof source === 'string') continue
    const s = source as SourceResult
    if (key !== 'power') add(key.toUpperCase(), s.archivos)
    for (const [product, result] of Object.entries(s.productos ?? {}))
      add(`${key.toUpperCase()} · ${product}`, result.archivos)
  }
  return list
}

const fileName = (path: string) => path.split(/[\\/]/).at(-1) ?? path

export function FieldFiles({
  field,
  data,
  notify,
}: {
  field: Field
  data: FieldData
  notify: (text: string) => void
}) {
  const [open, setOpen] = useState<{ entry: Entry; file?: RawFile; error?: string } | null>(
    null,
  )
  const files = filesOf(data)
  const groups = [...new Set(files.map((f) => f.group))]

  async function show(entry: Entry) {
    setOpen({ entry })
    requestAnimationFrame(() =>
      document.querySelector('.file-preview')?.scrollIntoView({ block: 'start' }),
    )
    try {
      setOpen({ entry, file: await rawFile(entry.path) })
    } catch (error) {
      setOpen({ entry, error: (error as Error).message })
    }
  }
  async function save(entry: Entry) {
    try {
      const file = await rawFile(entry.path)
      download(
        fileName(entry.path),
        file.contenido,
        entry.path.endsWith('.csv') ? 'text/csv;charset=utf-8' : 'application/json',
      )
      notify(
        file.recortado
          ? 'Se descargó la primera parte del archivo (es muy grande para la API).'
          : 'Archivo descargado tal como lo guarda el servidor.',
      )
    } catch (error) {
      notify((error as Error).message)
    }
  }
  const preview = open?.file
    ? open.entry.path.endsWith('.csv')
      ? parseCsv(open.file.contenido)
      : null
    : null

  return (
    <div className="data-view">
      <div className="section-intro">
        <span className="eyebrow">CADA DATO, CON SU ORIGEN</span>
        <h1>Los registros de {field.name}.</h1>
        <p>
          Lo que el servidor guardó para tu campo, sin la evaluación de TARPU: el archivo
          original del proveedor, su versión normalizada y su procedencia.
        </p>
      </div>
      <div className="files-actions">
        <button
          className="button-secondary"
          onClick={() =>
            download(
              `tarpu-${field.id}.geojson`,
              JSON.stringify(
                {
                  type: 'Feature',
                  properties: {
                    name: field.name,
                    crop: field.crop,
                    water: field.water,
                    origin: 'declarado por el usuario',
                  },
                  geometry: { type: 'Polygon', coordinates: [field.coordinates] },
                },
                null,
                2,
              ),
            )
          }
        >
          <ArrowDownToLine size={20} />
          Mi contorno (GeoJSON)
        </button>
        {data.base.data && (
          <button
            className="button-secondary"
            onClick={() =>
              download(
                `tarpu-${field.id}-base.json`,
                JSON.stringify(data.base.data, null, 2),
                'application/json',
              )
            }
          >
            <ArrowDownToLine size={20} />
            Base de Arequipa en mi campo (JSON)
          </button>
        )}
      </div>
      {data.base.state === 'loading' && (
        <p className="api-waiting">
          <Loader2 size={18} className="spin" /> Leyendo la base…
        </p>
      )}
      {data.base.state === 'error' && <p className="api-error-text">{data.base.error}</p>}
      {!data.job.data && data.base.state === 'ok' && (
        <p className="files-hint">
          <Satellite size={19} /> Los archivos satelitales aparecen aquí cuando pides
          «Traer datos satelitales» en el panel del campo.
        </p>
      )}
      {groups.map((group) => (
        <section className="file-group" key={group}>
          <h2>
            <Database size={19} /> {group}
          </h2>
          <ul>
            {files
              .filter((f) => f.group === group)
              .map((entry) => (
                <li key={entry.path}>
                  <span>
                    <strong>{KINDS[entry.kind] ?? entry.kind}</strong>
                    <small>{fileName(entry.path)}</small>
                  </span>
                  <button onClick={() => show(entry)}>
                    <Eye size={18} /> Ver
                  </button>
                  <button onClick={() => save(entry)}>
                    <ArrowDownToLine size={18} /> Descargar
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}
      {open && (
        <section className="file-preview" aria-live="polite">
          <header>
            <strong>{fileName(open.entry.path)}</strong>
            <button onClick={() => setOpen(null)}>Cerrar</button>
          </header>
          {!open.file && !open.error && (
            <p className="api-waiting">
              <Loader2 size={18} className="spin" /> Abriendo…
            </p>
          )}
          {open.error && <p className="api-error-text">{open.error}</p>}
          {open.file && preview && (
            <>
              <p className="files-hint">
                {preview.rows.length} filas · se muestran las 40 más recientes
              </p>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {preview.columns.map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(-40).map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j}>{cell === '' ? '—' : cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {open.file && !preview && (
            <pre className="json-preview">{open.file.contenido.slice(0, 6000)}</pre>
          )}
        </section>
      )}
    </div>
  )
}

/** Trabajos guardados en el servidor; cada uno se puede abrir como campo en este navegador. */
export function ServerJobs({
  fields,
  onOpen,
}: {
  fields: Field[]
  onOpen: (field: Field) => void
}) {
  const [list, setList] = useState<Job[] | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    listJobs()
      .then(setList)
      .catch((e: Error) => setError(e.message))
  }, [])
  const withContour = (list ?? []).filter((j) => j.parcela?.contorno?.coordinates?.[0])
  if (error) return <p className="files-hint">Puntos extraídos: {error}</p>
  if (!list) return null
  if (!withContour.length) return null
  return (
    <div className="server-jobs">
      <h3>
        <Satellite size={19} /> Campos con datos satelitales en el servidor
      </h3>
      <div className="field-list">
        {withContour.map((j) => {
          const id = `servidor-${j.clave}`
          const known = fields.some((f) => f.id === id)
          return (
            <article key={j.clave}>
              <MapPinned size={25} />
              <button
                onClick={() =>
                  onOpen({
                    id,
                    name: (j.nombre ?? j.clave).replaceAll('_', ' '),
                    crop: '',
                    water: 'Sin declarar',
                    coordinates: j.parcela!.contorno.coordinates[0],
                    createdAt: j.creado ?? new Date().toISOString(),
                  })
                }
              >
                <strong>{(j.nombre ?? j.clave).replaceAll('_', ' ')}</strong>
                <span>
                  {j.parcela!.area_ha.toLocaleString('es-PE', { maximumFractionDigits: 2 })}{' '}
                  ha · {j.estado.replaceAll('_', ' ')}
                  {known ? ' · ya en este navegador' : ''}
                </span>
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}

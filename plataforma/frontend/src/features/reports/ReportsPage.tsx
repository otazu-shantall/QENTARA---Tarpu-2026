// Informe del campo: una hoja legible con lo que TARPU encontró, lista para imprimir o guardar como PDF
// (con la impresión del navegador) y para descargar sus datos. Sin diagnósticos: solo datos con su fuente.
// Rehecho el 15/11/2026 con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useWorkspace } from '../../app/WorkspaceContext'
import { cachedBase } from '../../services/remote'
import type { BaseParcel } from '../../services/api'
import { download, number } from '../../lib/evidence'
import { Icon } from '../../components/ui/Icon'

const STATE: Record<string, string> = {
  dentro_optimo: 'en su pH ideal',
  dentro_absoluto: 'lo tolera, fuera de su ideal',
  fuera_absoluto: 'fuera del pH que tolera',
  sin_regla: 'sin ficha',
}

export function ReportsPage() {
  const { parcel, evidence } = useWorkspace()
  const [base, setBase] = useState<BaseParcel | null>(null)
  useEffect(() => {
    setBase(null)
    cachedBase(parcel)
      .then(setBase)
      .catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parcel.id])
  const reading = base?.lectura
  const year = (evidence?.points ?? []).slice(-365)
  const values = (key: 'temperature' | 'rain' | 'minimum') =>
    year.map((p) => p[key]).filter((v): v is number => v !== null)
  const mean = (list: number[]) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : null)
  const relief = base?.relieve as Record<string, unknown> | undefined
  const altitude =
    typeof relief?.altitud_m === 'number'
      ? (relief.altitud_m as number)
      : ((relief?.altitud_m as { media?: number } | undefined)?.media ?? base?.relieve_centroide?.altitud_m ?? null)
  const ndvi = [...(evidence?.points ?? [])].reverse().find((p) => p.vegetation != null)
  const today = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })

  if (!base)
    return (
      <section className="card">
        <h2>Informe de {parcel.name}</h2>
        <p className="api-waiting">Preparando el informe…</p>
      </section>
    )
  return (
    <div className="report-page">
      <section className="card report-actions no-print">
        <div>
          <h2>Informe de {parcel.name}</h2>
          <p>Una hoja con lo que TARPU encontró en este lugar. Puedes imprimirla o guardarla como PDF.</p>
        </div>
        <div className="about-actions">
          <button className="button button-green" onClick={() => window.print()}>
            <Icon name="report" size={18} /> Imprimir o guardar PDF
          </button>
          <button
            className="button button-outline"
            onClick={() =>
              download(
                JSON.stringify({ lugar: parcel, base, clima: { fuente: evidence?.source, periodo: evidence?.period } }, null, 2),
                `tarpu-informe-${parcel.name.toLowerCase().replaceAll(' ', '-')}.json`,
              )
            }
          >
            <Icon name="download" size={18} /> Descargar los datos
          </button>
        </div>
      </section>

      <article className="card report-sheet">
        <header>
          <img src="brand/tarpu-logo-black.png" alt="TARPU" className="report-logo" />
          <div>
            <h1>{parcel.name}</h1>
            <p>
              {parcel.kind === 'reference' ? 'Lugar de referencia (punto de consulta)' : 'Parcela dibujada por el usuario'} ·
              Arequipa, Perú · {today}
            </p>
          </div>
        </header>

        <h3>El lugar</h3>
        <table>
          <tbody>
            <tr>
              <th>Altitud</th>
              <td>{number(altitude, 0)} m</td>
              <td>NASADEM</td>
            </tr>
            <tr>
              <th>Zona</th>
              <td>
                {base.sector?.sector ?? 'Sin dato'} · {base.sector?.nombre ?? ''}
              </td>
              <td>Zonas por altitud</td>
            </tr>
            <tr>
              <th>Inclinación del terreno</th>
              <td>
                {number(reading?.pendiente.valor_pct ?? null)} % · {reading?.pendiente.clase ?? 'sin clase'}
              </td>
              <td>NASADEM · FAO (2006)</td>
            </tr>
            {base.geometria && (
              <tr>
                <th>Superficie</th>
                <td>{number(base.geometria.area_ha, 2)} ha</td>
                <td>Medida sobre el dibujo</td>
              </tr>
            )}
          </tbody>
        </table>

        <h3>El suelo (estimado, 0 a 5 cm)</h3>
        <table>
          <tbody>
            <tr>
              <th>pH</th>
              <td>{number(reading?.ph.valor ?? null)}</td>
              <td>SoilGrids</td>
            </tr>
            {(['arena', 'limo', 'arcilla'] as const).map((key) => (
              <tr key={key}>
                <th>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                <td>{number(reading?.textura.fracciones_pct[key] ?? null)} %</td>
                <td>SoilGrids</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>El clima del último año</h3>
        {year.length ? (
          <table>
            <tbody>
              <tr>
                <th>Temperatura media del aire</th>
                <td>{number(mean(values('temperature')))} °C</td>
                <td>NASA POWER</td>
              </tr>
              <tr>
                <th>Lluvia total</th>
                <td>{number(values('rain').reduce((a, b) => a + b, 0), 0)} mm</td>
                <td>NASA POWER</td>
              </tr>
              <tr>
                <th>Noches con mínima bajo 0 °C</th>
                <td>{values('minimum').filter((v) => v < 0).length}</td>
                <td>NASA POWER</td>
              </tr>
              {ndvi && (
                <tr>
                  <th>Verdor (NDVI) más reciente</th>
                  <td>
                    {number(ndvi.vegetation ?? null, 2)} · {ndvi.date}
                  </td>
                  <td>MODIS</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <p>Sin serie de clima disponible.</p>
        )}
        <p className="small-note">
          Período: {year[0]?.date} a {year.at(-1)?.date}. Celda regional de unos 55 × 67 km.
        </p>

        {reading?.ph.cultivos_de_la_zona.length ? (
          <>
            <h3>Cultivos de la zona frente al pH del suelo</h3>
            <table>
              <tbody>
                {reading.ph.cultivos_de_la_zona.map((c) => (
                  <tr key={c.cultivo}>
                    <th>{c.cultivo.charAt(0).toUpperCase() + c.cultivo.slice(1).replaceAll('_', ' ')}</th>
                    <td>{STATE[c.estado]}</td>
                    <td>{c.ph_optimo ? `ideal ${c.ph_optimo[0]}–${c.ph_optimo[1]} · FAO EcoCrop` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="small-note">
              Cultivos con más superficie sembrada en la zona (IV CENAGRO 2012). No es una recomendación.
            </p>
          </>
        ) : null}

        {base.avisos?.length ? (
          <>
            <h3>Ten en cuenta</h3>
            <ul>
              {base.avisos.map((notice) => (
                <li key={notice}>{notice}</li>
              ))}
            </ul>
          </>
        ) : null}
        <footer>
          Datos de NASA (POWER, NASADEM, MODIS), ISRIC SoilGrids, FAO EcoCrop e INEI. Registros del pasado: no son un
          pronóstico ni un diagnóstico agronómico. TARPU · QENTARA.
        </footer>
      </article>
      <p className="small-note no-print">
        Para comparar cultivos, ve a <Link to="/app/rotacion">Rotación de cultivos</Link>. Todas las fuentes están en{' '}
        <Link to="/app/ayuda?tab=fuentes">Ayuda y fuentes</Link>.
      </p>
    </div>
  )
}

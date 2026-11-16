// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
// 15/11/2026 (Claude Code): muestra el estado REAL del conector de IA del servidor (GET /api/ia/estado) y el
// reparto del trabajo: TARPU calcula y redacta; la IA solo da voz natural. Las claves viven en el servidor.
import { useEffect, useState } from 'react'
import { Dialog } from '../../components/ui/Dialog'
import { Icon } from '../../components/ui/Icon'
import { aiStatus } from '../../services/api'
import type { AiStatus } from '../../services/api'
import { AGENT } from '../../lib/agent'

export const providers = [
  { id: 'claude', name: 'Anthropic · Claude', short: 'A' },
  { id: 'openai', name: 'OpenAI · ChatGPT', short: 'O' },
  { id: 'gemini', name: 'Google · Gemini', short: 'G' },
]
const STATE: Record<string, { label: string; tone: string }> = {
  conectado: { label: 'Conectado', tone: 'on' },
  sin_clave: { label: 'Falta su clave en el servidor', tone: 'off' },
  sin_sdk: { label: 'Falta instalar su paquete', tone: 'off' },
  previsto: { label: 'Previsto, aún sin programar', tone: 'later' },
}

export function AIAccountDialog({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<AiStatus | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    aiStatus()
      .then(setStatus)
      .catch((e: Error) => setError(e.message))
  }, [])
  return (
    <Dialog title="Mi proveedor de IA" onClose={onClose} className="ai-dialog wide-dialog">
      <div className={`ai-now ${status?.activo ? 'on' : ''}`}>
        <span className="how-icon">
          <Icon name={status?.activo ? 'volume' : 'shield'} size={22} />
        </span>
        <div>
          <strong>
            {status === null && !error
              ? 'Comprobando el servidor…'
              : status?.activo
                ? `${AGENT} tiene voz natural con IA`
                : `${AGENT} funciona sin proveedor de IA`}
          </strong>
          <p>
            {status?.activo
              ? `El servidor tiene conectado un proveedor (${status.modelo}). Solo se usa para decir las respuestas con naturalidad.`
              : 'Las respuestas las prepara TARPU con tus datos y sus fuentes, y se leen con la voz del navegador.'}
          </p>
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}

      <h3>Quién hace qué</h3>
      <div className="ai-split">
        <section>
          <span className="ai-split-title">
            <Icon name="shield" size={17} /> Lo hace TARPU
          </span>
          <ul>
            {(status?.reparto.tarpu ?? ['Leer los datos', 'Comparar cultivos', 'Redactar cada respuesta con su fuente']).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
        <section>
          <span className="ai-split-title">
            <Icon name="volume" size={17} /> Solo lo hace la IA
          </span>
          <ul>
            {(status?.reparto.ia ?? ['Decir la respuesta con naturalidad']).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      </div>
      <p className="small-note">
        La IA recibe la respuesta ya hecha por TARPU y solo la reescribe para escucharla. No puede añadir datos,
        cifras ni recomendaciones.
      </p>

      <h3>Proveedores</h3>
      <ul className="ai-providers">
        {providers.map((p) => {
          const real = status?.proveedores.find((x) => x.id === p.id)
          const state = STATE[real?.estado ?? 'previsto']
          return (
            <li key={p.id} className={`ai-provider tone-${state.tone}`}>
              <span className={`provider-mark ${p.id}`}>{p.short}</span>
              <span>
                <strong>{p.name}</strong>
                <small>{real?.motivo ?? 'Listo para dar voz a las respuestas.'}</small>
              </span>
              <span className="ai-provider-state">{state.label}</span>
            </li>
          )
        })}
      </ul>

      <h3>Cómo se conecta</h3>
      <ol className="ai-steps">
        <li>
          La clave del proveedor se guarda <strong>solo en el servidor</strong> de TARPU, como variable de entorno
          (por ejemplo <code>ANTHROPIC_API_KEY</code> en <code>infra/.env</code>).
        </li>
        <li>Se reinicia el servidor con <code>npm start</code>.</li>
        <li>Esta ventana mostrará «Conectado» y el botón «Escuchar» usará la voz natural.</li>
      </ol>
      <p className="small-note">
        Nunca se escribe una clave en esta página ni viaja al navegador. Una suscripción al chat de un proveedor no
        equivale a su API: tienen condiciones y costos propios.
      </p>
      <button className="button button-green" onClick={onClose}>
        Entendido <Icon name="check" size={17} />
      </button>
    </Dialog>
  )
}

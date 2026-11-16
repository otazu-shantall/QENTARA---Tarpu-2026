// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useState } from 'react'
import { Dialog } from '../../components/ui/Dialog'
import { Icon } from '../../components/ui/Icon'
import { AGENT } from '../../lib/agent'
export const providers = [
  {
    id: 'openai',
    name: 'OpenAI / ChatGPT',
    short: 'O',
    description: 'Voz en tiempo real mediante su API; acceso y créditos deben verificarse.',
    url: 'https://help.openai.com/en/articles/9039756-managing-billing-for-chatgpt-and-the-api-platform',
  },
  {
    id: 'gemini',
    name: 'Google / Gemini',
    short: 'G',
    description:
      'Conversación mediante Live API; requiere acceso autorizado y sus límites propios.',
    url: 'https://ai.google.dev/gemini-api/docs/billing',
  },
  {
    id: 'claude',
    name: 'Anthropic / Claude',
    short: 'A',
    description:
      'Asistente de texto mediante API; la capa de audio necesita una integración adicional.',
    url: 'https://support.claude.com/en/articles/9876003-why-is-claude-api-usage-billed-separately-from-my-paid-claude-plan',
  },
]
export function AIAccountDialog({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState(
      () => localStorage.getItem('tarpu.prototype.ai-provider') ?? 'openai',
    ),
    [saved, setSaved] = useState(false)
  return (
    <Dialog title="Mi proveedor de IA" onClose={onClose} className="ai-dialog">
      <div className="ai-now">
        <span className="how-icon">
          <Icon name="send" size={22} />
        </span>
        <div>
          <strong>Hoy, {AGENT} funciona sin proveedor</strong>
          <p>
            Responde con explicaciones preparadas a partir de tus datos y sus fuentes. No usa un
            modelo de IA ni consume ninguna cuenta.
          </p>
        </div>
      </div>
      <h3>Más adelante: conecta el modelo que prefieras</h3>
      <p>
        Cuando TARPU conecte un modelo de IA, podrás elegir con cuál conversar. Deja aquí tu
        preferencia; tu cuenta de TARPU y la del proveedor son independientes.
      </p>
      <div className="provider-options" role="group" aria-label="Proveedor de IA">
        {providers.map((p) => (
          <button
            key={p.id}
            aria-pressed={selected === p.id}
            onClick={() => {
              setSelected(p.id)
              setSaved(false)
            }}
          >
            <span className={`provider-mark ${p.id}`}>{p.short}</span>
            <span>
              <strong>{p.name}</strong>
              <small>{p.description}</small>
            </span>
            <Icon name={selected === p.id ? 'check' : 'plus'} size={18} />
          </button>
        ))}
      </div>
      <div className="account-state">
        <span className="status-pill neutral">Cuenta sin vincular</span>
        <ul>
          <li>Todavía no se vincula ninguna cuenta ni se cobra nada.</li>
          <li>Aquí no se guardan claves ni contraseñas, solo tu preferencia.</li>
          <li>Una suscripción al chat de un proveedor no equivale a su API: tienen condiciones propias.</li>
        </ul>
      </div>
      <a
        className="text-link"
        href={providers.find((p) => p.id === selected)?.url}
        target="_blank"
        rel="noreferrer"
      >
        Consultar condiciones del proveedor
        <Icon name="external" size={16} />
      </a>
      <button
        className="button button-green"
        onClick={() => {
          localStorage.setItem('tarpu.prototype.ai-provider', selected)
          setSaved(true)
        }}
      >
        Guardar preferencia
        <Icon name="check" size={17} />
      </button>
      {saved && (
        <p role="status">
          Preferencia guardada. La cuenta continúa sin vincular; no se realizó ningún cobro.
        </p>
      )}
    </Dialog>
  )
}

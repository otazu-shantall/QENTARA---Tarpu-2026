// Conexiones reales y límites de las suscripciones. Asistencia de IA (Codex); entrega/uso-de-ia.md.
import { useEffect, useRef, useState } from 'react'
import { Dialog } from '../../components/ui/Dialog'
import { Icon } from '../../components/ui/Icon'
import { aiStatus, request } from '../../services/api'
import type { AiStatus } from '../../services/api'
import { AGENT } from '../../lib/agent'

export function AIAccountDialog({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<AiStatus | null>(null),
    [error, setError] = useState(''),
    [waiting, setWaiting] = useState(false)
  const popup = useRef<Window | null>(null)
  const mounted = useRef(true)
  async function refresh() {
    try {
      const value = await aiStatus()
      if (mounted.current) {
        setStatus(value)
        setError('')
      }
    } catch {
      if (mounted.current)
        setError('No pudimos comprobar la conexión. Revisa que TARPU esté encendido.')
    }
  }
  useEffect(() => {
    mounted.current = true
    void refresh()
    const focus = () => void refresh()
    window.addEventListener('focus', focus)
    return () => {
      mounted.current = false
      window.removeEventListener('focus', focus)
    }
  }, [])
  useEffect(() => {
    if (!waiting) return
    const timer = setInterval(() => {
      void refresh()
      if (popup.current?.closed) setWaiting(false)
    }, 1500)
    return () => clearInterval(timer)
  }, [waiting])
  async function connect() {
    const tab = window.open('about:blank', 'tarpu-chatgpt', 'popup,width=620,height=780')
    if (!tab) {
      setError('Permite la ventana de inicio de sesión de OpenAI y vuelve a intentar.')
      return
    }
    popup.current = tab
    setWaiting(true)
    setError('')
    try {
      const result = await request<{ url: string }>('/api/ia/chatgpt/iniciar', {
        method: 'POST',
        credentials: 'include',
      })
      if (!mounted.current) {
        tab.close()
        return
      }
      const url = new URL(result.url)
      if (url.origin !== 'https://auth.openai.com') throw new Error('Origen no válido')
      tab.location.href = result.url
    } catch {
      tab.close()
      setWaiting(false)
      if (mounted.current)
        setError(
          'No se pudo abrir la conexión local de ChatGPT. Esta opción necesita una instalación personal habilitada de TARPU.',
        )
    }
  }
  async function disconnect() {
    try {
      await request('/api/ia/chatgpt/salir', { method: 'POST', credentials: 'include' })
      await refresh()
    } catch {
      setError('No se pudo cerrar la conexión. Vuelve a intentar.')
    }
  }
  const linked = status?.chatgpt?.vinculado
  return (
    <Dialog
      title="Conexión de inteligencia artificial"
      onClose={onClose}
      className="ai-dialog wide-dialog"
    >
      <div className={`ai-now ${status?.activo ? 'on' : ''}`}>
        <span className="how-icon">
          <Icon name="shield" size={24} />
        </span>
        <div>
          <strong>
            {!status && !error
              ? 'Comprobando la conexión…'
              : status?.activo
                ? `${AGENT} puede usar IA`
                : 'Puedes continuar con el modo guiado'}
          </strong>
          <p>
            La IA explica los datos y sus límites. El texto aparece en el chat y se lee con la voz
            del navegador. TARPU conserva el cálculo y las reglas con sus fuentes.
          </p>
        </div>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <section className="ai-provider-info">
        <h3>ChatGPT / Codex</h3>
        <p>
          {linked
            ? `Cuenta vinculada${status?.chatgpt?.email ? `: ${status.chatgpt.email}` : ''}. ${status?.chatgpt?.permiso_plan ? 'Autorizaste usar tu plan para las preguntas que hagas aquí.' : 'La identidad está vinculada, pero falta autorizar el uso de tu plan.'}`
            : 'OpenAI permite conectar un plan elegible de ChatGPT en aplicaciones abiertas y locales. Esta conexión personal no sirve como una cuenta compartida para toda la web.'}
        </p>
        <div className="ai-provider-actions">
          {linked && !status?.chatgpt?.permiso_plan && (
            <button
              className="button button-green"
              disabled={waiting}
              onClick={() => void connect()}
            >
              Autorizar el uso de mi plan
            </button>
          )}
          {linked ? (
            <button className="button button-outline" onClick={() => void disconnect()}>
              Desconectar mi cuenta
            </button>
          ) : (
            <button
              className="button button-green"
              data-oai-siwc-button
              disabled={!status?.chatgpt?.disponible || waiting}
              onClick={() => void connect()}
            >
              {waiting ? 'Esperando autorización…' : 'Continue with ChatGPT'}
            </button>
          )}
          <a
            className="text-link"
            href="https://developers.openai.com/siwc/token-sharing-open-source"
            target="_blank"
            rel="noreferrer"
          >
            Cómo funciona <Icon name="upRight" size={16} />
          </a>
        </div>
        {!status?.chatgpt?.disponible && (
          <p className="small-note">
            Disponible en la instalación local personal. Para esta web alojada, el equipo debe
            habilitar el flujo de OpenAI para aplicaciones remotas. Mientras tanto, puede usarse una
            API configurada por TARPU.
          </p>
        )}
        {linked && (
          <a
            className="text-link"
            href="https://chatgpt.com/#settings"
            target="_blank"
            rel="noreferrer"
          >
            Gestionar acceso y uso de mi plan
          </a>
        )}
      </section>
      {(['claude', 'openai', 'gemini'] as const).map((id) => {
        const provider = status?.proveedores.find((p) => p.id === id)
        return (
          <section key={id} className="ai-provider-info">
            <h3>{id === 'claude' ? 'Claude' : id === 'gemini' ? 'Gemini' : 'OpenAI API'}</h3>
            <span className="status-pill neutral">
              {provider?.estado === 'configurado'
                ? 'API configurada · se verifica al responder'
                : 'Sin API configurada'}
            </span>
            <p>
              {id === 'claude'
                ? 'Claude no permite ofrecer el inicio de sesión de sus planes personales dentro de TARPU sin una autorización específica. La integración disponible aquí es su API.'
                : id === 'gemini'
                  ? 'No hay un inicio de sesión de suscripción de Gemini verificado para TARPU. Iniciar sesión con Google no habilita por sí solo el procesamiento de la API.'
                  : 'La API de OpenAI se configura de forma independiente del inicio de sesión personal de ChatGPT.'}
            </p>
            <a
              className="text-link"
              href={
                id === 'claude'
                  ? 'https://code.claude.com/docs/en/legal-and-compliance'
                  : id === 'gemini'
                    ? 'https://ai.google.dev/gemini-api/docs/billing'
                    : 'https://developers.openai.com/api/docs/quickstart'
              }
              target="_blank"
              rel="noreferrer"
            >
              Información oficial <Icon name="upRight" size={16} />
            </a>
          </section>
        )
      })}
      <p className="small-note">
        No se piden contraseñas aquí. Al consultar una IA se envía la evidencia del campo y el
        contexto reciente del chat al proveedor configurado. Las credenciales permanecen en el
        servidor o en tu instalación personal.
      </p>
      <button className="button button-green" onClick={onClose}>
        Volver al chat <Icon name="arrow" size={17} />
      </button>
    </Dialog>
  )
}

// Chat y conversación de voz en el mismo panel. Asistencia de IA (Codex); entrega/uso-de-ia.md.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useWorkspace } from '../../app/WorkspaceContext'
import { answer } from '../../services/assistant'
import { aiStatus } from '../../services/api'
import { useVoiceConversation } from './useVoiceConversation'
import { AIAccountDialog } from './AIAccountDialog'
import { Icon } from '../../components/ui/Icon'
import { AGENT } from '../../lib/agent'

type Message = {
  id: string
  role: 'user' | 'assistant'
  text: string
  evidence?: string | null
  mode?: string
  notice?: string
}
const SUGGESTIONS = [
  '¿Qué es el pH del suelo?',
  '¿Cuánta lluvia hay registrada?',
  '¿Cómo comparo cultivos para rotar?',
]

export function AssistantPanel() {
  const { parcel, evidence, setAssistantOpen, assistantQuestion, clearAssistantQuestion } =
    useWorkspace()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hola, soy ${AGENT}. Revisemos tu campo con sus datos y fuentes. Puedes escribir o hablar conmigo aquí mismo.`,
    },
  ])
  const [input, setInput] = useState(''),
    [pending, setPending] = useState(false),
    [error, setError] = useState('')
  const [accounts, setAccounts] = useState(false),
    [ai, setAi] = useState(false)
  const [spoken, setSpoken] = useState<string | null>(null)
  const controller = useRef<AbortController | null>(null),
    messagesRef = useRef(messages)
  const busy = useRef(false)
  messagesRef.current = messages
  const inputRef = useRef<HTMLInputElement>(null),
    end = useRef<HTMLDivElement>(null)

  async function respond(text: string, signal: AbortSignal) {
    busy.current = true
    setError('')
    setPending(true)
    const history = messagesRef.current.filter((m) => m.id !== 'welcome')
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text }])
    try {
      const reply = await answer(text, parcel, evidence, signal, history)
      signal.throwIfAborted()
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', ...reply }])
      return reply
    } finally {
      busy.current = false
      setPending(false)
    }
  }
  const voice = useVoiceConversation(parcel, evidence, respond)
  const active = ['connecting', 'listening', 'thinking', 'speaking'].includes(voice.state)
  function stop() {
    controller.current?.abort()
    voice.end()
    setSpoken(null)
  }
  async function send(text: string) {
    if (!text.trim() || busy.current) return
    stop()
    setInput('')
    const current = new AbortController()
    controller.current = current
    try {
      await respond(text.trim(), current.signal)
    } catch {
      if (!current.signal.aborted) setError('No pudimos preparar la respuesta. Vuelve a intentar.')
    }
  }
  useEffect(() => {
    inputRef.current?.focus()
    aiStatus()
      .then((s) => setAi(Boolean(s.activo)))
      .catch(() => setAi(false))
    return () => controller.current?.abort()
  }, [accounts])
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }, [messages, pending])
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !accounts) {
        stop()
        setAssistantOpen(false)
      }
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [accounts, setAssistantOpen])
  useEffect(() => {
    if (!assistantQuestion) return
    const question = assistantQuestion
    const timer = setTimeout(() => {
      clearAssistantQuestion()
      void send(question)
    }, 60)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assistantQuestion])
  const labels = {
    idle: 'Conversemos sobre tu campo',
    connecting: 'Preparando el micrófono…',
    listening: 'Te escucho…',
    thinking: 'Revisando tus datos…',
    speaking: `${AGENT} está hablando`,
    paused: 'Conversación en pausa',
    error: 'Puedes volver a intentar',
  }

  return (
    <>
      <aside
        className="yq-panel"
        role="dialog"
        aria-modal="false"
        aria-label={`Asistente ${AGENT}`}
      >
        <header className="yq-header">
          <span className="yq-avatar" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <div>
            <h2>{AGENT}</h2>
            <small>Tu asistente · {parcel.name}</small>
          </div>
          <button
            className="icon-button"
            aria-label="Conexión de IA"
            onClick={() => {
              stop()
              setAccounts(true)
            }}
          >
            <Icon name="settings" />
          </button>
          <button
            className="icon-button"
            aria-label="Cerrar asistente"
            onClick={() => {
              stop()
              setAssistantOpen(false)
            }}
          >
            <Icon name="close" />
          </button>
        </header>
        <div className={`yq-mode ${ai ? 'on' : ''}`}>
          <Icon name="shield" size={16} />
          {ai
            ? 'IA configurada · respuestas con evidencia de TARPU'
            : 'Modo guiado con fuentes · conecta una IA para conversar'}
        </div>
        <div className="yq-messages" role="log" aria-label="Conversación">
          {messages.map((message) => (
            <article key={message.id} className={`yq-bubble ${message.role}`}>
              <p>{message.text}</p>
              {message.role === 'assistant' && message.id !== 'welcome' && (
                <footer>
                  {message.evidence && (
                    <Link
                      to="/app/ayuda?tab=fuentes"
                      onClick={() => setAssistantOpen(false)}
                      className="yq-source"
                    >
                      <Icon name="shield" size={14} />
                      {message.evidence}
                    </Link>
                  )}
                  <span className="yq-answer-mode">
                    {message.mode === 'ia' ? 'Con IA' : 'Respuesta guiada'}
                  </span>
                  <button
                    onClick={() => {
                      if (spoken === message.id && voice.state === 'speaking') stop()
                      else {
                        stop()
                        setSpoken(message.id)
                        voice.speak(message.text)
                      }
                    }}
                  >
                    <Icon
                      name={spoken === message.id && voice.state === 'speaking' ? 'stop' : 'volume'}
                      size={16}
                    />
                    {spoken === message.id && voice.state === 'speaking' ? 'Detener' : 'Escuchar'}
                  </button>
                </footer>
              )}
              {message.notice && <small className="yq-answer-notice">{message.notice}</small>}
            </article>
          ))}
          {pending && (
            <div
              className="yq-bubble assistant yq-typing"
              role="status"
              aria-label="Preparando la respuesta"
            >
              <i />
              <i />
              <i />
            </div>
          )}
          <div ref={end} />
        </div>
        <div className="yq-bottom">
          <div className={`yq-voice-inline voice-${voice.state}`}>
            <button
              className="yq-orb"
              type="button"
              disabled={!voice.supported && !active}
              onClick={() => {
                if (active) stop()
                else if (!busy.current) {
                  stop()
                  voice.start()
                }
              }}
              aria-label={active ? 'Detener conversación de voz' : 'Iniciar conversación de voz'}
              aria-pressed={active}
            >
              <span className="yq-orb-halo" />
              <span className="yq-orb-core">
                <i />
                <i />
                <i />
              </span>
            </button>
            <div>
              <strong role="status">
                {pending ? 'Revisando tus datos…' : labels[voice.state]}
              </strong>
              <small>
                {voice.supported
                  ? 'Toca el orbe para hablar o detener. Las respuestas quedan en el chat.'
                  : 'Este navegador no admite micrófono. Puedes escribir y escuchar las respuestas.'}
              </small>
            </div>
            {active && (
              <button
                className="icon-button"
                aria-label="Pausar conversación"
                onClick={() => {
                  controller.current?.abort()
                  voice.pause()
                }}
              >
                <Icon name="micOff" />
              </button>
            )}
          </div>
          {messages.length < 3 && !active && (
            <div className="yq-suggestions">
              {SUGGESTIONS.map((q) => (
                <button key={q} disabled={pending} onClick={() => void send(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}
          {(error || voice.error) && (
            <p className="form-error" role="alert">
              {error || voice.error}
            </p>
          )}
          <form
            className="yq-input"
            onSubmit={(e) => {
              e.preventDefault()
              void send(input)
            }}
          >
            <button
              type="button"
              className="yq-mic"
              aria-label={active ? 'Detener conversación de voz' : 'Hablar con el asistente'}
              onClick={() => {
                if (active) stop()
                else if (!busy.current) {
                  stop()
                  voice.start()
                }
              }}
            >
              <Icon name={active ? 'stop' : 'mic'} size={20} />
            </button>
            <input
              ref={inputRef}
              aria-label={`Tu pregunta a ${AGENT}`}
              placeholder="Escribe tu pregunta…"
              value={input}
              maxLength={700}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              className="yq-send"
              disabled={!input.trim() || pending}
              aria-label="Enviar pregunta"
            >
              <Icon name="send" size={19} />
            </button>
          </form>
          <p className="yq-note">
            La voz usa los servicios del navegador. {AGENT} explica; tú decides.
          </p>
        </div>
      </aside>
      {accounts && <AIAccountDialog onClose={() => setAccounts(false)} />}
    </>
  )
}

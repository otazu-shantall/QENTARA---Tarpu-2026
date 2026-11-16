// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useWorkspace } from '../../app/WorkspaceContext'
import { assistantService } from '../../services/local'
import { VoiceRoom } from './VoiceRoom'
import { useBrowserVoice } from './useBrowserVoice'
import { Icon } from '../../components/ui/Icon'
import { AGENT } from '../../lib/agent'
type Message = { id: string; role: 'user' | 'assistant'; text: string; evidence?: string | null }
export function AssistantPanel() {
  const { parcel, evidence, setAssistantOpen, assistantQuestion, clearAssistantQuestion } =
    useWorkspace()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hola, soy ${AGENT}, el asistente de TARPU. Te explico los datos de tu campo con sus fuentes. ¿Qué te gustaría entender?`,
    },
  ])
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const controller = useRef<AbortController | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const end = useRef<HTMLDivElement>(null)
  const voice = useBrowserVoice(() => {})
  const current = pending ? 'thinking' : voice.state
  const labels = {
    idle: 'Listo para conversar',
    listening: 'Escuchando…',
    thinking: 'Preparando respuesta…',
    speaking: 'Hablando…',
  }
  useEffect(() => {
    inputRef.current?.focus()
    return () => controller.current?.abort()
  }, [])
  useEffect(() => {
    end.current?.scrollIntoView({
      block: 'nearest',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
  }, [messages, pending])
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !voiceOpen) setAssistantOpen(false)
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [setAssistantOpen, voiceOpen])
  async function send(text: string, spoken = false) {
    if (!text.trim() || pending) return
    voice.stop()
    setInput('')
    setError('')
    setPending(true)
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text: text.trim() }])
    const request = new AbortController()
    controller.current = request
    try {
      const reply = await assistantService.answer(text, parcel, evidence, request.signal)
      if (request.signal.aborted) return
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', ...reply }])
      if (spoken) voice.speak(reply.text)
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError'))
        setError('No pudimos preparar la respuesta. Inténtalo otra vez.')
    } finally {
      if (!request.signal.aborted) setPending(false)
    }
  }
  // Si se abrió desde una tarjeta, la pregunta se envía sola.
  useEffect(() => {
    if (!assistantQuestion) return
    const question = assistantQuestion
    // Con un temporizador, el modo estricto de React (que monta dos veces) la envía una sola vez.
    const timer = setTimeout(() => {
      clearAssistantQuestion()
      void send(question)
    }, 60)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assistantQuestion])
  return (
    <>
      {' '}
      <aside
        className="assistant-panel"
        role="dialog"
        aria-modal="false"
        aria-label={`Asistente ${AGENT}`}
      >
        <header className="assistant-header">
          <span className="assistant-logo">
            <img src="brand/tarpu-mark-white.png" alt="" />
          </span>
          <div>
            <h2>Conversa con {AGENT}</h2>
            <small>
              <span className="live-dot" /> {parcel.name}
            </small>
          </div>
          <button
            className="icon-button"
            aria-label="Cerrar asistente"
            onClick={() => setAssistantOpen(false)}
          >
            <Icon name="close" />
          </button>
        </header>
        <div className={`voice-stage state-${current}`}>
          <div className="voice-bubbles" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span role="status">{labels[current]}</span>
          <small>Asistente de demostración · respuestas guiadas</small>
        </div>
        <div className="assistant-messages" role="log" aria-label="Conversación">
          {messages.map((message) => (
            <article key={message.id} className={`message ${message.role}`}>
              <span>{message.role === 'user' ? 'Tú' : AGENT}</span>
              <p>{message.text}</p>
              {message.role === 'assistant' && message.id !== 'welcome' && (
                <div className="message-actions">
                  <button onClick={() => voice.speak(message.text)}>
                    <Icon name="volume" size={16} /> Escuchar
                  </button>
                  {message.evidence && (
                    <Link to="/app/estudio-tecnico" onClick={() => setAssistantOpen(false)}>
                      Ver evidencia <Icon name="upRight" size={14} />
                    </Link>
                  )}
                </div>
              )}
            </article>
          ))}
          {pending && (
            <p className="muted" role="status">
              Consultando la evidencia disponible…
            </p>
          )}
          <div ref={end} />
        </div>
        <div className="assistant-bottom">
          <div className="suggestions">
            {['¿Qué significa la humedad?', '¿Qué puedo sembrar después?'].map((q) => (
              <button key={q} disabled={pending} onClick={() => void send(q)}>
                {q}
                <Icon name="plus" size={14} />
              </button>
            ))}
          </div>
          {(error || voice.error) && (
            <p className="form-error" role="alert">
              {error || voice.error}
            </p>
          )}
          <form
            className="assistant-input"
            onSubmit={(e) => {
              e.preventDefault()
              void send(input)
            }}
          >
            <input
              ref={inputRef}
              aria-label={`Tu pregunta a ${AGENT}`}
              placeholder="Escribe tu pregunta…"
              value={input}
              maxLength={700}
              onChange={(e) => setInput(e.target.value)}
            />
            <button disabled={!input.trim() || pending} aria-label="Enviar pregunta">
              <Icon name="send" size={19} />
            </button>
          </form>
          <div className="voice-controls">
            <button
              className="button button-outline"
              onClick={() => {
                voice.stop()
                setVoiceOpen(true)
              }}
              disabled={pending}
            >
              <Icon name="mic" size={17} /> Abrir conversación de voz
            </button>
            <button
              className="icon-button"
              aria-label="Detener voz"
              onClick={() => {
                voice.stop()
                controller.current?.abort()
                setPending(false)
              }}
            >
              <Icon name="stop" size={17} />
            </button>
          </div>
          <p className="voice-note">
            La voz usa servicios del navegador y puede necesitar conexión. Puedes escribir en
            cualquier momento.
          </p>
        </div>
      </aside>
      {voiceOpen && <VoiceRoom onClose={() => setVoiceOpen(false)} />}
    </>
  )
}

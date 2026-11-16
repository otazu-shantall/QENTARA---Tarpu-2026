// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
// 15/11/2026 (Claude Code): interfaz rehecha (burbujas, indicador de «escribiendo», sugerencias) y voz natural:
// TARPU redacta la respuesta; si el servidor tiene un proveedor de IA conectado, la IA solo la reescribe para decirla.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useWorkspace } from '../../app/WorkspaceContext'
import { assistantService } from '../../services/local'
import { aiStatus, naturalize } from '../../services/api'
import { VoiceRoom } from './VoiceRoom'
import { useBrowserVoice } from './useBrowserVoice'
import { Icon } from '../../components/ui/Icon'
import { AGENT } from '../../lib/agent'

type Message = { id: string; role: 'user' | 'assistant'; text: string; evidence?: string | null; question?: string }
const SUGGESTIONS = [
  '¿Qué es el pH del suelo?',
  '¿Qué significa el verdor?',
  '¿Cómo comparo cultivos para rotar?',
  '¿Esto es un pronóstico?',
]

export function AssistantPanel() {
  const { parcel, evidence, setAssistantOpen, assistantQuestion, clearAssistantQuestion } = useWorkspace()
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
  const [ai, setAi] = useState<boolean | null>(null)
  const [speaking, setSpeaking] = useState<string | null>(null)
  const controller = useRef<AbortController | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const end = useRef<HTMLDivElement>(null)
  const voice = useBrowserVoice(() => {})

  useEffect(() => {
    inputRef.current?.focus()
    aiStatus()
      .then((status) => setAi(status.activo !== null))
      .catch(() => setAi(false))
    return () => controller.current?.abort()
  }, [])
  useEffect(() => {
    end.current?.scrollIntoView({
      block: 'nearest',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }, [messages, pending])
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !voiceOpen) setAssistantOpen(false)
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [setAssistantOpen, voiceOpen])

  async function send(text: string) {
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
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', question: text.trim(), ...reply }])
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError'))
        setError('No pudimos preparar la respuesta. Inténtalo otra vez.')
    } finally {
      if (!request.signal.aborted) setPending(false)
    }
  }
  /** Lee la respuesta en voz alta. Con IA conectada, primero se pide su versión natural; si falla, se lee tal cual. */
  async function speak(message: Message) {
    if (speaking === message.id) {
      voice.stop()
      setSpeaking(null)
      return
    }
    setSpeaking(message.id)
    let text = message.text
    if (ai && message.question)
      try {
        text = (await naturalize(message.question, message.text)).texto
      } catch {}
    voice.speak(text)
    setTimeout(() => setSpeaking((current) => (current === message.id ? null : current)), 1200)
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
      <aside className="yq-panel" role="dialog" aria-modal="false" aria-label={`Asistente ${AGENT}`}>
        <header className="yq-header">
          <span className="yq-avatar" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <div>
            <h2>{AGENT}</h2>
            <small>Asistente de TARPU · {parcel.name}</small>
          </div>
          <button className="icon-button" aria-label="Cerrar asistente" onClick={() => setAssistantOpen(false)}>
            <Icon name="close" />
          </button>
        </header>
        <div className={`yq-mode ${ai ? 'on' : ''}`}>
          <Icon name={ai ? 'volume' : 'shield'} size={15} />
          {ai === null
            ? 'Comprobando la voz…'
            : ai
              ? 'Respuestas de TARPU · voz natural con IA conectada'
              : 'Respuestas de TARPU con sus fuentes · voz del navegador'}
        </div>
        <div className="yq-messages" role="log" aria-label="Conversación">
          {messages.map((message) => (
            <article key={message.id} className={`yq-bubble ${message.role}`}>
              <p>{message.text}</p>
              {message.role === 'assistant' && message.id !== 'welcome' && (
                <footer>
                  {message.evidence && (
                    <Link to="/app/ayuda?tab=fuentes" onClick={() => setAssistantOpen(false)} className="yq-source">
                      <Icon name="shield" size={13} /> {message.evidence}
                    </Link>
                  )}
                  <button onClick={() => void speak(message)}>
                    <Icon name={speaking === message.id ? 'stop' : 'volume'} size={15} />
                    {speaking === message.id ? 'Detener' : 'Escuchar'}
                  </button>
                </footer>
              )}
            </article>
          ))}
          {pending && (
            <div className="yq-bubble assistant yq-typing" role="status" aria-label={`${AGENT} está preparando la respuesta`}>
              <i />
              <i />
              <i />
            </div>
          )}
          <div ref={end} />
        </div>
        <div className="yq-bottom">
          {messages.length < 3 && (
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
              aria-label="Abrir conversación de voz"
              title="Hablar con voz"
              disabled={pending}
              onClick={() => {
                voice.stop()
                setVoiceOpen(true)
              }}
            >
              <Icon name="mic" size={19} />
            </button>
            <input
              ref={inputRef}
              aria-label={`Tu pregunta a ${AGENT}`}
              placeholder="Escribe tu pregunta…"
              value={input}
              maxLength={700}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="yq-send" disabled={!input.trim() || pending} aria-label="Enviar pregunta">
              <Icon name="send" size={18} />
            </button>
          </form>
          <p className="yq-note">
            {AGENT} explica; no pronostica ni decide por ti.
          </p>
        </div>
      </aside>
      {voiceOpen && <VoiceRoom onClose={() => setVoiceOpen(false)} />}
    </>
  )
}

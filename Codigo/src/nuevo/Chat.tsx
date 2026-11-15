// Escrito con asistencia de OpenAI Codex. Registro en entrega/uso-de-ia.md.
import { useEffect, useRef, useState } from 'react'
import {
  ArrowUp,
  ArrowUpRight,
  MessageCircle,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { answer } from './data'
import type { ChatMessage, Field, ReferencePlace } from './data'

interface Props {
  place: ReferencePlace
  field: Field | null
  compact?: boolean
  messages: ChatMessage[]
  onMessagesChange: (messages: ChatMessage[]) => void
  onClose?: () => void
}

export function Chat({
  place,
  field,
  compact = false,
  messages,
  onMessagesChange,
  onClose,
}: Props) {
  const [question, setQuestion] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' })
  }, [messages])
  useEffect(
    () => () => {
      window.speechSynthesis?.cancel()
    },
    [],
  )

  function send(text = question) {
    if (!text.trim()) return
    const response = answer(text, place, field)
    onMessagesChange([
      ...messages,
      { id: crypto.randomUUID(), role: 'user', text: text.trim() },
      { id: crypto.randomUUID(), role: 'assistant', ...response },
    ])
    setQuestion('')
    input.current?.focus()
  }

  function readAloud() {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const text =
      messages.filter((message) => message.role === 'assistant').at(-1)?.text ??
      'Hola, soy TARPU. Puedo ayudarte a entender el clima, el suelo y el verdor de la consulta que tienes abierta.'
    const speech = new SpeechSynthesisUtterance(text)
    speech.lang = 'es-PE'
    speech.rate = 0.9
    speech.onend = () => setSpeaking(false)
    speech.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(speech)
    setSpeaking(true)
  }

  return (
    <section
      className={`chat ${compact ? 'chat-compact' : ''}`}
      aria-label="Chat con TARPU"
    >
      <header className="chat-header">
        <div className="agent-avatar">
          <Sparkles size={26} />
        </div>
        <div>
          <h2>
            {compact
              ? 'Conversa con TARPU'
              : 'Un poco de claridad, cuando la necesitas.'}
          </h2>
          <p>Sobre {field?.name ?? place.name}</p>
        </div>
        {onClose && (
          <button className="button-quiet chat-close" onClick={onClose}>
            <X size={20} />
            Cerrar
          </button>
        )}
      </header>
      <div className="chat-mode">
        <span className="live-dot" />
        Respuestas guiadas con fuentes{' '}
        <span>IA generativa pendiente de conectar</span>
      </div>
      <div
        className="chat-messages"
        role="log"
        aria-label="Conversación"
        aria-live="polite"
      >
        <div className="message assistant welcome">
          <span className="eyebrow">TARPU</span>
          <h3>
            Tu campo tiene una historia.
            <br />
            Vamos a entenderla.
          </h3>
          <p>
            Pregúntame por el clima, el suelo o los datos que estás viendo. Te
            acompaño con explicaciones sencillas y sus fuentes.
          </p>
        </div>
        {!messages.length && (
          <div className="suggestions">
            {[
              '¿Cómo fue el clima?',
              '¿Qué dice el suelo?',
              '¿Qué significa el verdor?',
              '¿Qué puedo sembrar después?',
            ].map((text) => (
              <button key={text} onClick={() => send(text)}>
                {text}
                <ArrowUpRight size={20} />
              </button>
            ))}
          </div>
        )}
        {messages.map((message) => (
          <article key={message.id} className={`message ${message.role}`}>
            <span className="eyebrow">
              {message.role === 'assistant' ? 'TARPU' : 'Tú'}
            </span>
            <p>{message.text}</p>
            {message.source && (
              <div className="message-source">
                {message.url ? (
                  <a href={message.url} target="_blank" rel="noreferrer">
                    {message.source}
                    <ArrowUpRight size={17} />
                  </a>
                ) : (
                  message.source
                )}
              </div>
            )}
          </article>
        ))}
        <div ref={end} />
      </div>
      <form
        className="chat-compose"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        <label htmlFor={compact ? 'drawer-question' : 'agent-question'}>
          ¿Qué te gustaría saber?
        </label>
        <div>
          <textarea
            id={compact ? 'drawer-question' : 'agent-question'}
            ref={input}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={2000}
            placeholder="Escribe tu pregunta aquí…"
            rows={2}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                send()
              }
            }}
          />
          <button
            className="button-primary"
            type="submit"
            disabled={!question.trim()}
            aria-label="Enviar pregunta"
          >
            <ArrowUp size={23} />
            <span>Enviar</span>
          </button>
        </div>
        <footer>
          <span>
            <MessageCircle size={17} />
            Las respuestas conservan su fuente.
          </span>
          {'speechSynthesis' in window && (
            <button type="button" className="text-button" onClick={readAloud}>
              {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
              {speaking ? 'Detener lectura' : 'Escuchar'}
            </button>
          )}
        </footer>
      </form>
    </section>
  )
}

// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useState } from 'react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { Dialog } from '../../components/ui/Dialog'
import { Icon } from '../../components/ui/Icon'
import { useVoiceConversation } from './useVoiceConversation'
import { AIAccountDialog } from './AIAccountDialog'
export function VoiceRoom({ onClose }: { onClose: () => void }) {
  const { parcel, evidence } = useWorkspace()
  const voice = useVoiceConversation(parcel, evidence)
  const [accounts, setAccounts] = useState(false),
    [captions, setCaptions] = useState(false)
  const labels = {
    idle: 'Una conversación, sin prisa.',
    connecting: 'Preparando el audio…',
    listening: 'Te escucho.',
    thinking: 'Un momento, estoy revisando.',
    speaking: 'Tarpu está hablando.',
    paused: 'Tomamos una pausa.',
    error: 'Podemos volver a intentarlo.',
  }
  const active = ['connecting', 'listening', 'thinking', 'speaking'].includes(voice.state)
  return (
    <>
      <Dialog
        title="Conversación con Tarpu"
        className="voice-dialog"
        onClose={() => {
          voice.end()
          onClose()
        }}
      >
        <div className="voice-room">
          <div className="voice-room-meta">
            <span>
              <Icon name="pin" size={16} />
              {parcel.name}
            </span>
            <button
              className="text-link"
              onClick={() => {
                voice.pause()
                setAccounts(true)
              }}
            >
              Mi proveedor de IA
              <Icon name="upRight" size={16} />
            </button>
          </div>
          <div className={`voice-aura voice-${voice.state}`} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <div>
              <i />
              <i />
              <i />
            </div>
          </div>
          <span className="eyebrow">CONVERSA, PREGUNTA, EXPLORA</span>
          <h2 role="status">{labels[voice.state]}</h2>
          <p className="voice-room-copy">
            Habla con naturalidad. En la prueba, Tarpu responde y vuelve a escucharte sin pulsar un
            botón en cada turno.
          </p>
          {voice.error && (
            <p role="alert" className="form-error">
              {voice.error}
            </p>
          )}
          <div className="conversation-controls">
            {active ? (
              <>
                <button className="button button-outline" onClick={voice.pause}>
                  <Icon name="micOff" />
                  Pausar conversación
                </button>
                <button className="button button-end" onClick={voice.end}>
                  <Icon name="hangup" />
                  Finalizar
                </button>
              </>
            ) : (
              <button className="button button-green large" onClick={voice.start}>
                <Icon name="mic" />
                {voice.state === 'paused'
                  ? 'Reanudar conversación'
                  : 'Iniciar conversación de prueba'}
              </button>
            )}
          </div>
          {!active && (
            <button className="text-link voice-preview" onClick={voice.preview}>
              <Icon name="volume" size={18} />
              Escuchar un ejemplo sin micrófono
            </button>
          )}
          <button
            className="caption-toggle"
            aria-pressed={captions}
            onClick={() => setCaptions(!captions)}
          >
            {captions ? 'Ocultar subtítulos de respuesta' : 'Mostrar subtítulos de respuesta'}
          </button>
          {captions && (
            <p className="voice-caption">
              {voice.caption || 'La respuesta aparecerá aquí cuando Tarpu hable.'}
            </p>
          )}
          <div className="voice-demo-note">
            <span className="status-pill neutral">
              Demostración por turnos · sin cuenta vinculada
            </span>
            <p>
              La prueba usa audio del navegador y respuestas guiadas. Puede procesar tu voz con sus
              servicios. La conversación de IA en tiempo real y el consumo de tu cuenta aún no están
              conectados.
            </p>
          </div>
        </div>
      </Dialog>
      {accounts && <AIAccountDialog onClose={() => setAccounts(false)} />}
    </>
  )
}

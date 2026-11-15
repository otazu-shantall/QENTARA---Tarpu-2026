// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useEffect, useRef, useState } from 'react'
interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult:
    | ((event: {
        results: { [index: number]: { [index: number]: { transcript: string } } }
      }) => void)
    | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  abort: () => void
}
type VoiceWindow = Window & {
  SpeechRecognition?: new () => Recognition
  webkitSpeechRecognition?: new () => Recognition
}
export function useBrowserVoice(onTranscript: (text: string) => void) {
  const [state, setState] = useState<'idle' | 'listening' | 'speaking'>('idle')
  const [error, setError] = useState('')
  const recognition = useRef<Recognition | null>(null)
  const transcript = useRef(onTranscript)
  transcript.current = onTranscript
  const supported = Boolean(
    (window as VoiceWindow).SpeechRecognition ?? (window as VoiceWindow).webkitSpeechRecognition,
  )
  const synthesisSupported = 'speechSynthesis' in window
  const mounted = useRef(true)
  function stop() {
    recognition.current?.abort()
    recognition.current = null
    if (synthesisSupported) window.speechSynthesis.cancel()
    setState('idle')
  }
  function listen() {
    stop()
    setError('')
    const Constructor =
      (window as VoiceWindow).SpeechRecognition ?? (window as VoiceWindow).webkitSpeechRecognition
    if (!Constructor) {
      setError('Este navegador no admite dictado. Puedes escribir o probar Chrome.')
      return
    }
    const instance = new Constructor()
    recognition.current = instance
    instance.lang = 'es-PE'
    instance.continuous = false
    instance.interimResults = false
    instance.onresult = (event) => {
      if (mounted.current) transcript.current(event.results[0][0].transcript)
    }
    instance.onerror = (event) => {
      if (mounted.current) {
        setError(
          event.error === 'not-allowed'
            ? 'No se permitió el micrófono. Puedes escribir tu pregunta.'
            : `No se pudo reconocer la voz (${event.error}). Puedes volver a intentarlo.`,
        )
        setState('idle')
      }
    }
    instance.onend = () => {
      if (mounted.current) setState((value) => (value === 'listening' ? 'idle' : value))
    }
    try {
      instance.start()
      setState('listening')
    } catch {
      setError('No se pudo iniciar el micrófono. Prueba de nuevo.')
      setState('idle')
    }
  }
  function speak(text: string) {
    stop()
    setError('')
    if (!synthesisSupported) {
      setError('La voz de salida no está disponible. La respuesta queda en texto.')
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-PE'
    utterance.rate = 0.94
    const spanish = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('es'))
    if (spanish) utterance.voice = spanish
    utterance.onstart = () => {
      if (mounted.current) setState('speaking')
    }
    utterance.onend = () => {
      if (mounted.current) setState('idle')
    }
    utterance.onerror = (event) => {
      if (mounted.current) {
        setState('idle')
        if (event.error !== 'interrupted' && event.error !== 'canceled')
          setError('No se pudo reproducir la voz. La respuesta queda en texto.')
      }
    }
    window.speechSynthesis.speak(utterance)
  }
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      if (recognition.current) {
        recognition.current.onresult = null
        recognition.current.onend = null
        recognition.current.onerror = null
        recognition.current.abort()
      }
      if (synthesisSupported) window.speechSynthesis.cancel()
    }
  }, [synthesisSupported])
  return { state, error, supported, synthesisSupported, listen, speak, stop }
}

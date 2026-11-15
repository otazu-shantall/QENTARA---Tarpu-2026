// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { useEffect, useRef, useState } from 'react'
import type { Evidence, Parcel } from '../../types/domain'
import { assistantService } from '../../services/local'
type VoiceState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'paused' | 'error'
interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
  onresult:
    | ((event: {
        results: { [index: number]: { [index: number]: { transcript: string } } }
      }) => void)
    | null
  start: () => void
  abort: () => void
}
type VoiceWindow = Window & {
  SpeechRecognition?: new () => Recognition
  webkitSpeechRecognition?: new () => Recognition
}
export function useVoiceConversation(parcel: Parcel, evidence: Evidence | null) {
  const [state, setState] = useState<VoiceState>('idle'),
    [error, setError] = useState(''),
    [caption, setCaption] = useState('')
  const live = useRef(false),
    mounted = useRef(true),
    recognition = useRef<Recognition | null>(null),
    request = useRef<AbortController | null>(null),
    utterance = useRef<SpeechSynthesisUtterance | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const source = useRef({ parcel, evidence })
  source.current = { parcel, evidence }
  const supported =
    Boolean(
      (window as VoiceWindow).SpeechRecognition ?? (window as VoiceWindow).webkitSpeechRecognition,
    ) && 'speechSynthesis' in window
  function clearIO() {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    request.current?.abort()
    request.current = null
    if (recognition.current) {
      const current = recognition.current
      current.onstart = null
      current.onend = null
      current.onerror = null
      current.onresult = null
      recognition.current = null
      current.abort()
    }
    if (utterance.current) {
      utterance.current.onstart = null
      utterance.current.onend = null
      utterance.current.onerror = null
      utterance.current = null
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }
  function fail(message: string) {
    live.current = false
    clearIO()
    if (mounted.current) {
      setError(message)
      setState('error')
    }
  }
  function end() {
    live.current = false
    clearIO()
    setState('idle')
    setError('')
  }
  function pause() {
    clearIO()
    live.current = false
    setState('paused')
  }
  function play(text: string, continueSession: boolean) {
    if (!('speechSynthesis' in window)) {
      fail('No hay salida de voz disponible. Puedes continuar en el chat escrito.')
      return
    }
    const audio = new SpeechSynthesisUtterance(text)
    utterance.current = audio
    audio.lang = 'es-PE'
    audio.rate = 0.98
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('es'))
    if (voice) audio.voice = voice
    audio.onstart = () => {
      if (mounted.current) setState('speaking')
    }
    audio.onend = () => {
      utterance.current = null
      if (!mounted.current) return
      if (continueSession && live.current) listen()
      else setState('idle')
    }
    audio.onerror = () =>
      fail('No se pudo reproducir el audio. Puedes volver a intentar o abrir el chat escrito.')
    setState('connecting')
    window.speechSynthesis.speak(audio)
  }
  async function answer(text: string) {
    clearIO()
    if (!live.current) return
    setState('thinking')
    const current = new AbortController()
    request.current = current
    try {
      const response = await assistantService.answer(
        text,
        source.current.parcel,
        source.current.evidence,
        current.signal,
      )
      if (current.signal.aborted || !live.current || !mounted.current) return
      setCaption(response.text)
      request.current = null
      play(response.text, true)
    } catch {
      if (!current.signal.aborted) fail('La respuesta no está disponible. Puedes probar otra vez.')
    }
  }
  function listen() {
    if (!live.current || !mounted.current) return
    const Constructor =
      (window as VoiceWindow).SpeechRecognition ?? (window as VoiceWindow).webkitSpeechRecognition
    if (!Constructor) {
      fail(
        'Este navegador no permite la conversación de prueba. Puedes escuchar un ejemplo o usar el chat.',
      )
      return
    }
    const current = new Constructor()
    recognition.current = current
    current.lang = 'es-PE'
    current.continuous = false
    current.interimResults = false
    let received = false
    current.onstart = () => {
      if (live.current && mounted.current) setState('listening')
    }
    current.onresult = (event) => {
      if (received || !live.current) return
      received = true
      void answer(event.results[0][0].transcript)
    }
    current.onerror = (event) => {
      if (event.error === 'aborted') return
      if (event.error === 'no-speech') {
        return
      }
      fail(
        event.error === 'not-allowed'
          ? 'No se permitió el micrófono. Puedes escuchar un ejemplo o continuar por escrito.'
          : 'Se interrumpió la entrada de audio. Prueba otra vez o continúa por escrito.',
      )
    }
    current.onend = () => {
      if (!received && live.current && mounted.current) {
        recognition.current = null
        timer.current = setTimeout(listen, 350)
      }
    }
    setState('connecting')
    try {
      current.start()
    } catch {
      fail('No se pudo abrir el audio. Revisa el permiso del navegador.')
    }
  }
  function start() {
    clearIO()
    setError('')
    if (!supported) {
      fail(
        'La conversación de prueba necesita entrada y salida de voz compatibles. Puedes escuchar el ejemplo o usar el chat.',
      )
      return
    }
    live.current = true
    listen()
  }
  function preview() {
    live.current = false
    clearIO()
    setError('')
    const text =
      'Hola, soy Tarpu. Podemos conversar sobre tu campo, revisar su historia y explorar opciones juntos. Esta es una demostración de la voz. Los datos de ejemplo no son un diagnóstico de tu parcela.'
    setCaption(text)
    play(text, false)
  }
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      live.current = false
      clearIO()
    }
  }, [])
  return { state, error, caption, start, pause, end, preview, supported }
}

// Chat y voz comparten respuesta y evidencia. Asistencia de IA (Codex); entrega/uso-de-ia.md.
import { assistantService as guided } from './local'
import { polygon, request } from './api'
import type { Evidence, Parcel } from '../types/domain'
import type { AssistantReply } from './contracts'

export async function answer(
  question: string,
  parcel: Parcel,
  evidence: Evidence | null,
  signal: AbortSignal,
  history: { role: 'user' | 'assistant'; text: string }[] = [],
): Promise<AssistantReply & { mode: string; notice?: string }> {
  const fallback = await guided.answer(question, parcel, evidence, signal)
  if (parcel.kind === 'example') return { ...fallback, mode: 'guiado' }
  try {
    const result = await request<{
      texto: string
      con_ia: boolean
      fuente: string
      motivo?: string
    }>('/api/ia/responder', {
      method: 'POST',
      signal,
      credentials: 'include',
      body: JSON.stringify({
        pregunta: question.slice(0, 700),
        ...(parcel.boundary.length > 2
          ? { contorno: polygon(parcel.boundary) }
          : { lat: parcel.point?.lat, lon: parcel.point?.lon }),
        historial: history.slice(-6).map((m) => ({ role: m.role, text: m.text.slice(0, 2000) })),
      }),
    })
    return result.con_ia
      ? { text: result.texto, evidence: result.fuente, mode: 'ia' }
      : { ...fallback, mode: 'guiado', notice: result.motivo }
  } catch {
    signal.throwIfAborted()
    return {
      ...fallback,
      mode: 'guiado',
      notice:
        'La IA no está disponible; esta respuesta usa la evidencia y las explicaciones de TARPU.',
    }
  }
}

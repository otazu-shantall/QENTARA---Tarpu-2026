// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import type { Evidence, Parcel } from '../types/domain'
export interface EvidenceRepository {
  read(parcel: Parcel, signal?: AbortSignal): Promise<Evidence | null>
}
export interface AssistantReply {
  text: string
  evidence: string | null
}
export interface AssistantService {
  answer(
    question: string,
    parcel: Parcel,
    evidence: Evidence | null,
    signal?: AbortSignal,
  ): Promise<AssistantReply>
}

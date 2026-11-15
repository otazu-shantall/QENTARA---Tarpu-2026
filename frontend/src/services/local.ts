// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { evidenceSchema } from '../types/domain.ts'
import type { EvidenceRepository, AssistantService } from './contracts'
import { syntheticEvidence } from '../data/scenarios.ts'
import data from '../data/power-majes.json' with { type: 'json' }
import { summarize, number } from '../lib/evidence.ts'

export const evidenceRepository: EvidenceRepository = {
  async read(parcel, signal) {
    signal?.throwIfAborted()
    return parcel.kind === 'example'
      ? syntheticEvidence(parcel)
      : parcel.id === 'reference-majes'
        ? evidenceSchema.parse(data)
        : null
  },
}
export const assistantService: AssistantService = {
  async answer(question, parcel, evidence, signal) {
    signal?.throwIfAborted()
    if (!evidence)
      return {
        text: `${parcel.name} todavía no tiene observaciones asociadas. Delimitar el campo guarda su contorno, pero no obtiene datos ambientales. Puedes explorar la muestra de Majes o completar el contexto para una futura consulta.`,
        evidence: null,
      }
    if (evidence.origin === 'synthetic')
      return {
        text: /cultivo|sembrar|mejorar|suelo/.test(question.toLowerCase())
          ? 'En este ejemplo puedes explorar hortalizas, legumbres, frutas y flores y consultar qué condiciones revisar. Antes de sembrar hay que confirmar variedad, suelo, riego e historial. Los valores de esta parcela son ficticios; no permiten recomendar un cultivo real.'
          : 'Estamos viendo una parcela de ejemplo. Puedes revisar su frío nocturno, calor, agua en el suelo y verdor, y cambiar entre días, semanas o meses. Son datos ficticios para explorar cómo se entendería la información; no son mediciones del terreno.',
        evidence: 'Escenario sintético · sin observación real',
      }
    const summary = summarize(evidence.points)
    const q = question
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    let text =
      'La muestra disponible contiene 365 registros diarios de NASA POWER para un punto de Majes en 2025. Sirve para explorar el contexto regional, no para describir cada parte de una parcela. Puedes revisar los mismos registros en Datos avanzados.'
    if (/temperatura|calor|clima/.test(q))
      text = `En esta muestra, la temperatura media del aire en 2025 es ${number(summary.temperature)} °C. Es un promedio de registros diarios de la zona de Majes; no una medición dentro de tu campo ni un pronóstico.`
    else if (/humedad|agua|riego|lluvia/.test(q))
      text = `La humedad relativa media del aire es ${number(summary.humidity)} %. Esta variable describe el aire, no la humedad del suelo. La lluvia histórica por sí sola no permite calcular cuánto regar; faltan manejo, suelo y reglas revisadas.`
    else if (/cultivo|rotacion|sembrar|quinua/.test(q))
      text =
        'Todavía no hay una comparación agronómica evaluable. Se necesitan cultivo anterior, variedad, riego, contexto local y reglas revisadas. Las tres estrategias del prototipo ilustran la comparación; no indican qué sembrar.'
    else if (/futuro|pronost|sequia|helada/.test(q))
      text =
        'Los registros de 2025 describen el pasado. No permiten asegurar una sequía, helada o cosecha futura. Un pronóstico necesita una fuente y metodología adicionales; una comparación de escenarios debe mostrar sus condiciones.'
    return { text, evidence: 'NASA POWER · Majes · 2025 · muestra guardada' }
  },
}

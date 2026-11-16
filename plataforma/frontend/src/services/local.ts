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
    let text = `Tengo registros de ${evidence.source} para ${parcel.name} (${evidence.period.replace(' / ', ' a ')}). El clima describe una celda regional, no cada parte de tu parcela. Puedes preguntarme por el pH, la pendiente, el verdor, la lluvia o la rotación de cultivos.`
    // Explicaciones de cada tipo de dato (definiciones y fuentes; sin diagnósticos).
    const topics: [RegExp, string, string][] = [
      [
        /\bph\b|acidez|alcalin/,
        'El pH mide qué tan ácido o alcalino es el suelo, en una escala de 0 a 14: 7 es neutro, menos de 7 es ácido y más de 7 es alcalino. Cada cultivo tiene un rango de pH en el que crece mejor; TARPU compara el pH de tu campo con los rangos que publica FAO EcoCrop. El valor viene de SoilGrids, que lo estima con un modelo a 250 m: no reemplaza un análisis de laboratorio.',
        'SoilGrids (ISRIC) · FAO EcoCrop',
      ],
      [
        /pendiente|inclinaci/,
        'La pendiente dice cuánto sube o baja el terreno: 5 % significa 5 metros de desnivel por cada 100 metros. TARPU la calcula con el modelo de elevación NASADEM (píxeles de unos 30 m) y le pone el nombre de su clase según la guía de la FAO para describir suelos (2006).',
        'NASADEM · FAO (2006), cuadro 7',
      ],
      [
        /altitud|altura|zona|sector/,
        'La altitud es la altura del terreno sobre el nivel del mar, leída de NASADEM. TARPU divide Arequipa en tres zonas por altitud (S1 costa y valles bajos, S2 valles interandinos y S3 altoandino) para mostrar qué se siembra más en lugares parecidos al tuyo, según el censo agropecuario de 2012.',
        'NASADEM · IV CENAGRO 2012 (INEI)',
      ],
      [
        /textura|arena|arcilla|limo/,
        'El suelo se compone de partículas de tres tamaños: arena (las más gruesas), limo y arcilla (las más finas). SoilGrids estima qué porcentaje hay de cada una en los primeros 5 cm. TARPU muestra cuál predomina; todavía no nombra la clase de textura porque falta verificar esa tabla en su fuente.',
        'SoilGrids (ISRIC)',
      ],
      [
        /ndvi|verdor|vegetaci/,
        'El NDVI es un índice que el satélite calcula con la luz que reflejan las plantas. Va de −1 a 1: cuanto más alto, más vegetación verde hay. TARPU usa MODIS, que observa píxeles de 250 m y publica un valor cada 16 días. El verdor no mide la fertilidad del suelo.',
        'MODIS MOD13Q1 (NASA, vía ORNL DAAC)',
      ],
      [
        /cobertura|cubre/,
        'La cobertura es la clase que el satélite MODIS asigna cada año al píxel de 500 m donde está tu campo (por ejemplo cultivos, pastizal o suelo desnudo), con la clasificación IGBP.',
        'MODIS MCD12Q1 (NASA)',
      ],
      [
        /radiaci|sol\b/,
        'La radiación solar es la energía del sol que llega al suelo en un día. Viene de NASA POWER, para una celda regional.',
        'NASA POWER',
      ],
      [
        /superficie.*temperatura|temperatura.*superficie|lst/,
        'La temperatura de superficie es la del suelo y las plantas vista desde el satélite MODIS (píxel de 1 km, cada 8 días). No es la temperatura del aire.',
        'MODIS MOD11A2 (NASA)',
      ],
    ]
    const topic = topics.find(([pattern]) => pattern.test(q))
    if (topic) return { text: topic[1], evidence: topic[2] }
    if (/futuro|pronost|sequia|helada|manana/.test(q))
      text =
        'Los registros describen el pasado. No permiten asegurar una sequía, helada o cosecha futura. Un pronóstico necesita una fuente y metodología adicionales; una comparación de escenarios debe mostrar sus condiciones.'
    else if (/lluvia|precipitacion/.test(q) && !/riego|regar/.test(q))
      text =
        summary.rain === null
          ? 'No hay valores de lluvia disponibles en este período. No se pueden tratar los faltantes como cero.'
          : `La suma de lluvia de los ${summary.rainValid} días con dato es ${number(summary.rain)} mm, durante ${evidence.period.replace(' / ', ' a ')}. Es la suma de los registros disponibles de NASA POWER, no una medición dentro de tu parcela. Los días sin dato no se cuentan como cero; este acumulado no garantiza cobertura completa del período ni es un pronóstico.`
    else if (/temperatura|calor|clima/.test(q))
      text = `La temperatura media del aire en todo el período es ${number(summary.temperature)} °C. Es un promedio de los registros diarios de la celda regional de NASA POWER; no una medición dentro de tu campo ni un pronóstico.`
    else if (/humedad|agua|riego|lluvia/.test(q))
      text = `La humedad relativa media del aire es ${number(summary.humidity)} %. Esta variable describe el aire, no la humedad del suelo. La lluvia histórica por sí sola no permite calcular cuánto regar; faltan manejo, suelo y reglas revisadas.`
    else if (/cultivo|rotacion|sembrar|quinua/.test(q))
      text =
        'En «Rotación de cultivos» puedes declarar tu cultivo actual, tu agua y tus meses de campaña. TARPU compara cada cultivo del catálogo con el clima y el suelo de tu campo usando los rangos de FAO EcoCrop, criterio por criterio y sin puntaje. La decisión es tuya.'
    else if (/futuro|pronost|sequia|helada/.test(q))
      text =
        'Los registros describen el pasado. No permiten asegurar una sequía, helada o cosecha futura. Un pronóstico necesita una fuente y metodología adicionales; una comparación de escenarios debe mostrar sus condiciones.'
    return {
      text,
      evidence: `${evidence.source} · ${parcel.name} · ${evidence.period.replace(' / ', ' a ')}`,
    }
  },
}

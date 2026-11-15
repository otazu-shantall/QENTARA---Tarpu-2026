// Desarrollo asistido por IA. Catálogo ilustrativo; no evalúa aptitud. Registro: entrega/uso-de-ia.md.
export type CropCategory = 'Hortalizas' | 'Legumbres' | 'Frutas' | 'Flores'
export const cropSources = {
  regional:
    'https://www.gob.pe/institucion/agroideas/noticias/1387514-midagri-impulsa-reconversion-productiva-en-beneficio-de-pequenos-agricultores-de-uva-en-arequipa',
  garlic:
    'https://www.gob.pe/institucion/senamhi/noticias/1003142-arequipa-temperaturas-calidas-durante-verano-2024-afectaron-el-rendimiento-del-ajo',
  bean: 'https://www.gob.pe/institucion/senasa/informes-publicaciones/939548-guia-de-buenas-practicas-agricolas-para-cultivo-de-habas',
}
export const crops: {
  id: string
  name: string
  scientific: string
  category: CropCategory
  intro: string
  climate: string
  soil: string
  water: string
  evidence: string
  source?: string
}[] = [
  {
    id: 'onion',
    name: 'Cebolla',
    scientific: 'Allium cepa',
    category: 'Hortalizas',
    intro: 'Una opción para explorar dentro del contexto agrícola regional.',
    climate:
      'Revisar temperatura, época de cultivo y variedad; la respuesta depende de la etapa de crecimiento.',
    soil: 'Medir textura, drenaje y salinidad antes de decidir el manejo.',
    water: 'Confirmar disponibilidad, calidad del agua y sistema de riego.',
    evidence: 'Cultivo citado en Majes por MIDAGRI; aptitud de la parcela sin evaluar.',
    source: cropSources.regional,
  },
  {
    id: 'garlic',
    name: 'Ajo',
    scientific: 'Allium sativum',
    category: 'Hortalizas',
    intro: 'La temperatura y el calendario merecen especial atención.',
    climate:
      'SENAMHI documenta efectos de temperaturas cálidas en el ajo de Arequipa; no extrapolar sin variedad y campaña.',
    soil: 'Solicitar análisis y revisar drenaje e historial de cultivos.',
    water: 'Revisar uniformidad del riego con apoyo local.',
    evidence: 'Referencia climática regional de SENAMHI; no recomendación individual.',
    source: cropSources.garlic,
  },
  {
    id: 'bean',
    name: 'Haba',
    scientific: 'Vicia faba',
    category: 'Legumbres',
    intro: 'Una leguminosa para estudiar como alternativa de rotación.',
    climate: 'Contrastar clima y calendario con los requisitos de la variedad.',
    soil: 'Revisar suelo, historial de rotación y condiciones sanitarias.',
    water: 'Evaluar la disponibilidad de agua durante el ciclo.',
    evidence: 'Guía de buenas prácticas de SENASA; condiciones locales pendientes.',
    source: cropSources.bean,
  },
  {
    id: 'pea',
    name: 'Arveja',
    scientific: 'Pisum sativum',
    category: 'Legumbres',
    intro: 'Candidata ilustrativa para ampliar la comparación.',
    climate: 'Requisitos de variedad y tolerancia al frío pendientes de documentar.',
    soil: 'Solicitar análisis de suelo y antecedentes sanitarios.',
    water: 'Requerimientos por etapa y disponibilidad pendientes.',
    evidence: 'Ficha de ejemplo. Falta documentación local y validación agronómica.',
  },
  {
    id: 'avocado',
    name: 'Palta',
    scientific: 'Persea americana',
    category: 'Frutas',
    intro: 'Alternativa de cultivo permanente para un estudio más amplio.',
    climate: 'Evaluar episodios extremos y necesidades de la variedad; el promedio anual no basta.',
    soil: 'Verificar profundidad efectiva, drenaje y condiciones radiculares.',
    water: 'Estudiar suministro sostenido y calidad del agua.',
    evidence: 'Mencionada por MIDAGRI en procesos de reconversión regional; sin aptitud evaluada.',
    source: cropSources.regional,
  },
  {
    id: 'grape',
    name: 'Uva',
    scientific: 'Vitis vinifera',
    category: 'Frutas',
    intro: 'Un cultivo permanente presente en iniciativas productivas de Majes.',
    climate: 'Contrastar variedad, fenología y calendario local.',
    soil: 'Revisar análisis de suelo e infraestructura de conducción.',
    water: 'Validar abastecimiento y manejo por etapa.',
    evidence: 'Referencia de MIDAGRI para Majes; no acredita rendimiento ni rentabilidad.',
    source: cropSources.regional,
  },
  {
    id: 'rose',
    name: 'Rosa',
    scientific: 'Rosa spp.',
    category: 'Flores',
    intro: 'Ejemplo de una ficha de floricultura para explorar.',
    climate: 'Definir primero la variedad y si el cultivo será protegido o a campo abierto.',
    soil: 'Sustrato, drenaje y sanidad requieren evaluación.',
    water: 'Calidad y estrategia de riego por definir.',
    evidence:
      'Propuesta de catálogo. Sin evidencia de aptitud para esta parcela ni validación regional.',
  },
  {
    id: 'carnation',
    name: 'Clavel',
    scientific: 'Dianthus caryophyllus',
    category: 'Flores',
    intro: 'Ejemplo de alternativa ornamental, pendiente de documentar.',
    climate: 'Documentar temperatura, luminosidad y necesidades del sistema elegido.',
    soil: 'Evaluar sustrato, drenaje y material de propagación.',
    water: 'Determinar manejo con asesoría y análisis locales.',
    evidence: 'Ficha ilustrativa. Sin condiciones de cultivo validadas en Arequipa.',
  },
]

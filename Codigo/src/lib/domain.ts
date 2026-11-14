import type { Observation, Parcel, Period } from '../types/index.ts'

export function aggregateParcels(parcels: Parcel[], selectedId: string): Parcel {
  const selected = parcels.find(p => p.id === selectedId)
  if (selected) return selected
  const n = parcels.length || 1
  const mean = (key: 'ndvi' | 'temperature' | 'moisture' | 'precipitation') => parcels.reduce((sum, p) => sum + p[key], 0) / n
  return { id: 'all', name: 'Todas mis parcelas', location: 'Arequipa, Perú', crop: 'Varios cultivos', area: parcels.reduce((sum, p) => sum + p.area, 0), color: '#a4c183', ndvi: +mean('ndvi').toFixed(2), temperature: +mean('temperature').toFixed(0), moisture: +mean('moisture').toFixed(2), precipitation: +mean('precipitation').toFixed(0) }
}

export function filterObservations(records: Observation[], options: { parcelId: string; period: Period; variable?: string; level?: string; search?: string }): Observation[] {
  const cutoff = new Date(Date.UTC(2026, 9, 25 - options.period)).toISOString().slice(0, 10)
  return records.filter(record =>
    (options.parcelId === 'all' || record.parcelId === options.parcelId) && record.date >= cutoff &&
    (!options.variable || options.variable === 'all' || record.variable === options.variable) &&
    (!options.level || options.level === 'all' || record.level === options.level) &&
    (!options.search || `${record.date} ${record.reference} ${record.variable}`.toLowerCase().includes(options.search.toLowerCase())),
  )
}

export function toCsv(records: Observation[]): string {
  const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const header = ['fecha', 'parcela_id', 'variable', 'valor', 'unidad', 'referencia', 'nivel', 'origen']
  return '\uFEFF' + [header, ...records.map(r => [r.date, r.parcelId, r.variable, r.value, r.unit, r.reference, r.level, 'sintetico'])].map(row => row.map(quote).join(',')).join('\r\n')
}

export const formatNumber = (value: number, decimals = 1) => value.toLocaleString('es-PE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

export function answerQuestion(question: string, parcel: Parcel): string {
  const q = question.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (/ndvi|vegetacion|verde|vigor/.test(q)) return `En esta demostración, ${parcel.name} muestra un NDVI de ${formatNumber(parcel.ndvi, 2)}. El índice describe el contraste entre bandas de vegetación; por sí solo no determina fertilidad, salud ni rendimiento. Revisa fecha, cobertura válida y contexto del cultivo en Explorar datos. Todos estos valores son sintéticos.`
  if (/agua|riego|lluvia|precipitacion|humedad/.test(q)) return `La ficha ilustrativa muestra ${parcel.precipitation} mm de precipitación y ${formatNumber(parcel.moisture, 2)} m³/m³ de humedad regional estimada. Ninguno permite calcular una dosis de riego de tu parcela. Harían falta datos de manejo, suelo y una metodología validada. Aquí se presentan únicamente valores de ejemplo.`
  if (/export|descarg|dato|fuente|origen|registro/.test(q)) return 'Abre Explorar datos para filtrar los registros y descargar la selección en CSV o JSON. Cada archivo conserva unidades, referencias, faltantes y la etiqueta de datos sintéticos. Los nombres POWER, IMERG y Sentinel-2 son referencias de fuentes candidatas; este prototipo no está conectado a ellas.'
  if (/rot|quinua|haba|cebada|siembr|cultiv/.test(q)) return `Puedes explorar quinua, haba y cebada como candidatos ilustrativos. No hay un ranking agronómico validado para ${parcel.name}. Antes de comparar necesitamos historial, variedad, agua disponible y reglas locales revisadas. La sección Rotaciones muestra cómo se explicaría esa comparación, sin recomendar qué sembrar.`
  return `Estoy mostrando respuestas guiadas para el prototipo visual, no un modelo de IA conectado. Puedo explicar el NDVI, los límites de los datos de agua, las fuentes de referencia o cómo exportar registros de ${parcel.name}. No dispongo de mediciones reales ni de un pronóstico.`
}

// Desarrollo asistido por IA. Orden ficticio, sin evaluación agronómica. Registro: entrega/uso-de-ia.md.
import type { Parcel } from '../types/domain.ts'
const exampleOrders: Record<string, string[]> = {
  'example-olivos': ['onion', 'garlic', 'grape', 'avocado', 'bean', 'pea', 'rose', 'carnation'],
  'example-molino': ['bean', 'pea', 'onion', 'garlic', 'carnation', 'rose', 'grape', 'avocado'],
}
export function exampleCropPriorities(parcel: Pick<Parcel, 'id' | 'kind'>) {
  if (parcel.kind !== 'example') return null
  const order = exampleOrders[parcel.id]
  return order ? Object.fromEntries(order.map((id, index) => [id, index + 1])) : null
}

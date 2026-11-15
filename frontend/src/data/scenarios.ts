// Desarrollo asistido por IA. Ejemplos sintéticos. Registro: entrega/uso-de-ia.md.
import type { Parcel, Evidence, Observation } from '../types/domain.ts'

// Contornos ficticios de demostración, sin relación con predios catastrales.
export const exampleParcels: Parcel[] = [
  {
    id: 'example-olivos',
    name: 'Los Olivos · ejemplo',
    location: 'Arequipa · ubicación ilustrativa',
    kind: 'example',
    crop: 'Cebolla',
    irrigation: 'Con riego',
    boundary: [
      [-72.192, -16.351],
      [-72.19, -16.351],
      [-72.19, -16.3495],
      [-72.192, -16.3495],
    ],
  },
  {
    id: 'example-molino',
    name: 'El Molino · ejemplo',
    location: 'Arequipa · ubicación ilustrativa',
    kind: 'example',
    crop: 'Haba',
    irrigation: 'Por confirmar',
    boundary: [
      [-72.183, -16.355],
      [-72.1815, -16.355],
      [-72.181, -16.3535],
      [-72.183, -16.3535],
    ],
  },
]
export const demoEvents = [
  {
    date: '2026-10-18',
    type: 'Agua disponible',
    title: 'Menos agua en el suelo',
    text: 'Así se vería un aviso para revisar el riego y observar el terreno.',
    tone: 'amber',
    icon: 'humidity' as const,
  },
  {
    date: '2026-09-22',
    type: 'Calor',
    title: 'Días de mayor temperatura',
    text: 'Ejemplo de un episodio cálido. Se mostrarían duración, intensidad y fuente.',
    tone: 'coral',
    icon: 'temperature' as const,
  },
  {
    date: '2026-08-09',
    type: 'Frío / heladas',
    title: 'Una noche de frío intenso',
    text: 'Ejemplo visual de un aviso de helada; no corresponde a un evento observado.',
    tone: 'blue',
    icon: 'snow' as const,
  },
]
export function syntheticEvidence(parcel: Parcel): Evidence {
  const cooler = parcel.id === 'example-molino'
  const round = (n: number) => Math.round(n * 100) / 100
  const points: Observation[] = Array.from({ length: 304 }, (_, i) => {
    const date = new Date(Date.UTC(2026, 0, i + 1)).toISOString().slice(0, 10)
    const temperature = round((cooler ? 13 : 20) + 3 * Math.cos(i / 47) + 1.2 * Math.sin(i / 9))
    return {
      date,
      temperature,
      minimum: round(temperature - (cooler ? 10 : 7)),
      maximum: round(temperature + 8),
      rain: round(i % 7 === 0 ? 2.2 + 2 * Math.abs(Math.sin(i)) : 0),
      humidity: round(57 + 15 * Math.sin(i / 32)),
      soilMoisture: round(26 + 8 * Math.sin(i / 23)),
      vegetation: round(0.58 + 0.12 * Math.sin(i / 39)),
      solarRadiation: round(22 + 4 * Math.cos(i / 50)),
      surfaceTemperature: round(temperature + 5 + 2 * Math.sin(i / 14)),
    }
  })
  return {
    source: 'TARPU · datos sintéticos',
    product: 'Escenario visual de demostración',
    period: '2026-01-01 / 2026-10-31',
    requestedAt: '2026-11-14T00:00:00Z',
    url: '',
    support:
      'Valores y contorno ficticios para probar la interfaz. No son mediciones satelitales, diagnósticos ni recomendaciones para un predio real.',
    origin: 'synthetic',
    cadence: 'Ejemplo con registros diarios; no representa la frecuencia de ningún satélite',
    units: {
      temperature: '°C',
      minimum: '°C',
      maximum: '°C',
      rain: 'mm/day',
      humidity: '%',
      soilMoisture: '% vol.',
      vegetation: '1',
      surfaceTemperature: '°C',
      solarRadiation: 'MJ/m²/day',
    },
    points,
  }
}

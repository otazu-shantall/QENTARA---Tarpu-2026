// Desarrollo asistido por IA. Patrones sintéticos de interfaz. Registro: entrega/uso-de-ia.md.
import type { Coordinate } from '../types/domain.ts'
export type ParcelLayer = 'none' | 'temperature' | 'moisture' | 'vegetation'
export const parcelLayers = {
  none: { label: 'Mapa base', colors: [], low: '', high: '' },
  temperature: {
    label: 'Calor',
    colors: ['#355eae', '#29adb9', '#b6d88e', '#f6cb57', '#ed863e', '#c83f44'],
    low: 'Más fresco',
    high: 'Más cálido',
  },
  moisture: {
    label: 'Humedad del suelo',
    colors: ['#eee2ad', '#bad5a1', '#64bdaa', '#379dbb', '#4c69a9'],
    low: 'Menor humedad',
    high: 'Mayor humedad',
  },
  vegetation: {
    label: 'Vegetación',
    colors: ['#e9b75b', '#ddd578', '#a8d67f', '#5aa47a', '#257660', '#155543'],
    low: 'Menor verdor',
    high: 'Mayor verdor',
  },
}
export function buildParcelOverlay(
  points: Coordinate[],
  layer: ParcelLayer,
  origin: 'synthetic' | 'provider' | 'declared',
) {
  if (origin !== 'synthetic' || layer === 'none' || points.length < 3) return null
  const west = Math.min(...points.map((p) => p[0])),
    east = Math.max(...points.map((p) => p[0])),
    south = Math.min(...points.map((p) => p[1])),
    north = Math.max(...points.map((p) => p[1]))
  if (east - west < 1e-10 || north - south < 1e-10) return null
  const polygon = points
    .map(
      ([lng, lat]) =>
        `${((lng - west) / (east - west)) * 600},${((north - lat) / (north - south)) * 600}`,
    )
    .join(' ')
  const palette = parcelLayers[layer].colors
  // Distribución visual determinista. No deriva valores por píxel de la serie regional.
  const cells = Array.from({ length: 900 }, (_, index) => {
    const x = index % 30,
      y = Math.floor(index / 30),
      u = x / 29,
      v = y / 29
    const wave = Math.sin(u * 5.3 + v * 3.1) * 0.16 + Math.cos(v * 8.4 - u * 2) * 0.1
    const hotspot = Math.exp(-((u - 0.75) ** 2 + (v - 0.23) ** 2) / 0.065) * 0.5
    const coolspot = Math.exp(-((u - 0.25) ** 2 + (v - 0.7) ** 2) / 0.1) * 0.35
    let value = Math.max(0, Math.min(1, 0.43 + wave + hotspot - coolspot))
    if (layer === 'moisture') value = 1 - value
    if (layer === 'vegetation') value = Math.max(0, Math.min(1, 0.85 - value * 0.85))
    const color = palette[Math.min(palette.length - 1, Math.floor(value * palette.length))]
    return `<rect x="${x * 20 - 3}" y="${y * 20 - 3}" width="26" height="26" fill="${color}"/>`
  }).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><defs><clipPath id="parcel"><polygon points="${polygon}"/></clipPath><filter id="smooth"><feGaussianBlur stdDeviation="7"/></filter></defs><g clip-path="url(#parcel)"><g filter="url(#smooth)">${cells}</g></g><polygon points="${polygon}" fill="none" stroke="white" stroke-opacity=".95" stroke-width="5"/></svg>`
  return {
    url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg),
    bounds: [
      [south, west],
      [north, east],
    ] as [[number, number], [number, number]],
  }
}

// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import type { Coordinate } from '../types/domain.ts'

const turn = (a: Coordinate, b: Coordinate, c: Coordinate) =>
  (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
function intersects(a: Coordinate, b: Coordinate, c: Coordinate, d: Coordinate) {
  const between = (p: Coordinate, x: Coordinate, y: Coordinate) =>
    p[0] >= Math.min(x[0], y[0]) &&
    p[0] <= Math.max(x[0], y[0]) &&
    p[1] >= Math.min(x[1], y[1]) &&
    p[1] <= Math.max(x[1], y[1])
  const values = [turn(a, b, c), turn(a, b, d), turn(c, d, a), turn(c, d, b)]
  return (
    (values[0] * values[1] < 0 && values[2] * values[3] < 0) ||
    (Math.abs(values[0]) < 1e-12 && between(c, a, b)) ||
    (Math.abs(values[1]) < 1e-12 && between(d, a, b)) ||
    (Math.abs(values[2]) < 1e-12 && between(a, c, d)) ||
    (Math.abs(values[3]) < 1e-12 && between(b, c, d))
  )
}
export function areaHectares(points: Coordinate[]): number {
  if (points.length < 3) return 0
  const rad = Math.PI / 180
  const sum = points.reduce((total, current, index) => {
    const next = points[(index + 1) % points.length]
    return (
      total +
      (next[0] - current[0]) * rad * (2 + Math.sin(current[1] * rad) + Math.sin(next[1] * rad))
    )
  }, 0)
  return (Math.abs(sum) * 6371008.8 ** 2) / 2 / 10000
}
export function boundaryError(points: Coordinate[]): string | null {
  if (points.length < 3) return 'Marca al menos tres esquinas para cerrar la parcela.'
  if (
    points.some(
      (p) =>
        !Number.isFinite(p[0]) ||
        !Number.isFinite(p[1]) ||
        Math.abs(p[0]) > 180 ||
        Math.abs(p[1]) > 90,
    )
  )
    return 'Revisa las coordenadas del contorno.'
  if (new Set(points.map((p) => p.join(','))).size !== points.length)
    return 'Hay esquinas repetidas. Corrige el contorno.'
  if (points.every((point) => Math.abs(turn(points[0], points[1], point)) < 1e-12))
    return 'Las esquinas están en una línea. Marca un contorno con superficie.'
  for (let i = 0; i < points.length; i++)
    for (let j = i + 1; j < points.length; j++) {
      if (j === i + 1 || (i === 0 && j === points.length - 1)) continue
      if (
        intersects(
          points[i],
          points[(i + 1) % points.length],
          points[j],
          points[(j + 1) % points.length],
        )
      )
        return 'Las líneas se cruzan. Mueve una esquina o deshaz el último punto.'
    }
  if (areaHectares(points) < 0.0001) return 'El contorno necesita una superficie mayor que cero.'
  return null
}
export function toGeoJSON(points: Coordinate[]) {
  const error = boundaryError(points)
  if (error) throw new Error(error)
  return { type: 'Polygon' as const, coordinates: [[...points, points[0]]] }
}

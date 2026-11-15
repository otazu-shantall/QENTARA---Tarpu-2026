// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import test from 'node:test'
import assert from 'node:assert/strict'
import { areaHectares, boundaryError, toGeoJSON } from '../src/lib/geometry.ts'
import { selectPeriod, summarize, csv } from '../src/lib/evidence.ts'
import { evidenceRepository, assistantService } from '../src/services/local.ts'
import type { Coordinate, Observation, Parcel } from '../src/types/domain.ts'
const square: Coordinate[] = [
  [-72.19, -16.35],
  [-72.189, -16.35],
  [-72.189, -16.349],
  [-72.19, -16.349],
]
const parcel: Parcel = {
  id: 'reference-majes',
  name: 'Majes',
  location: 'Referencia',
  kind: 'reference',
  boundary: [],
  crop: 'No lo sé',
  irrigation: 'No lo sé',
}
test('el contorno rechaza menos de tres puntos, cruces y esquinas repetidas', () => {
  assert.ok(boundaryError(square.slice(0, 2)))
  assert.ok(boundaryError([square[0], square[2], square[1], square[3]]))
  assert.ok(boundaryError([...square, square[0]]))
  assert.ok(
    boundaryError([
      [0, 0],
      [1, 1],
      [2, 2],
    ]),
  )
  assert.equal(boundaryError(square), null)
})
test('el área usa coordenadas geográficas y el GeoJSON cierra el anillo en longitud/latitud', () => {
  assert.ok(areaHectares(square) > 1 && areaHectares(square) < 1.3)
  assert.ok(Math.abs(areaHectares(square) - areaHectares([...square].reverse())) < 1e-6)
  assert.deepEqual(toGeoJSON(square).coordinates[0].at(-1), square[0])
  assert.throws(() => toGeoJSON(square.slice(0, 2)))
})
test('faltantes se conservan en resumen y CSV, sin convertirse en ceros', () => {
  const records: Observation[] = [
    {
      date: '2025-01-01',
      temperature: null,
      minimum: null,
      maximum: null,
      rain: null,
      humidity: null,
    },
    { date: '2025-01-02', temperature: 20, minimum: 10, maximum: 25, rain: 0, humidity: 70 },
  ]
  assert.equal(summarize(records).temperature, 20)
  assert.equal(summarize(records).rainValid, 1)
  assert.equal(summarize(records.slice(0, 1)).rain, null)
  assert.match(csv(records), /2025-01-01,,,,NASA POWER/)
})
test('la ventana temporal se ancla a la última observación, no al reloj del dispositivo', async () => {
  const evidence = await evidenceRepository.read(parcel)
  assert.ok(evidence)
  assert.equal(evidence.points.length, 365)
  assert.equal(selectPeriod(evidence.points, 30).length, 30)
  assert.equal(selectPeriod(evidence.points, 30)[0].date, '2025-12-02')
  assert.equal(selectPeriod(evidence.points, 90).length, 90)
})
test('una parcela nueva no hereda la muestra de Majes ni una recomendación', async () => {
  const created = { ...parcel, id: 'new-parcel', kind: 'declared' as const, boundary: square }
  assert.equal(await evidenceRepository.read(created), null)
  const answer = await assistantService.answer('¿Cuánto regar?', created, null)
  assert.equal(answer.evidence, null)
  assert.match(answer.text, /no tiene observaciones/)
})
test('las respuestas diferencian humedad del aire, riego y pronóstico', async () => {
  const evidence = await evidenceRepository.read(parcel)
  const water = await assistantService.answer('humedad y riego', parcel, evidence)
  assert.match(water.text, /no la humedad del suelo/)
  const future = await assistantService.answer('pronóstico futuro', parcel, evidence)
  assert.match(future.text, /No permiten asegurar/)
})

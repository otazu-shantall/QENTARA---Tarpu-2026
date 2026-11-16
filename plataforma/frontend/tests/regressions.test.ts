// Regresiones de series y ventanas. Asistencia de IA (Codex); entrega/uso-de-ia.md.
import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeSatellite } from '../src/lib/satellite.ts'
import { tourLayout } from '../src/lib/tourLayout.ts'
import { assistantService, evidenceRepository } from '../src/services/local.ts'
import type { Observation, Parcel } from '../src/types/domain.ts'

test('MODIS conserva fechas fuera del calendario de POWER sin inventar clima', () => {
  const points: Observation[] = [
    { date: '2025-12-31', temperature: 15, minimum: 4, maximum: 25, rain: 0, humidity: 40 },
  ]
  const valid = mergeSatellite(
    points,
    [
      ['2026-01-17', '0.51', '0'],
      ['2025-12-31', '0.45', '1'],
      ['2026-01-01', '0.61', '3'],
    ],
    1,
    'vegetation',
    (value, row) => (Number(row[2]) < 2 ? value : null),
  )
  assert.equal(valid, 2)
  assert.deepEqual(
    points.map((p) => p.date),
    ['2025-12-31', '2026-01-01', '2026-01-17'],
  )
  assert.equal(points[2].vegetation, 0.51)
  assert.equal(points[2].temperature, null)
  assert.equal(points[2].rain, null)
  assert.equal(points[1].vegetation, null)
  assert.equal(points[0].rain, 0)
})

test('el tutorial permanece en la ventana con objetivos grandes y pantallas pequeñas', () => {
  for (const [width, height] of [
    [1906, 927],
    [1366, 768],
    [1024, 600],
    [640, 480],
    [375, 667],
  ]) {
    const card = { width: Math.min(420, width - 32), height: Math.min(380, height - 32) }
    for (const target of [
      null,
      { left: width - 460, top: 0, width: 450, height: height },
      { left: 20, top: -200, width: width - 40, height: height * 2 },
    ]) {
      const value = tourLayout(target, card, width, height)
      assert.ok(value.left >= 16 && value.left + card.width <= width - 16)
      assert.ok(value.top >= 16 && value.top + card.height <= height - 16)
    }
  }
})

test('una pregunta por lluvia contesta precipitación y conserva la advertencia de faltantes', async () => {
  const parcel: Parcel = {
    id: 'reference-majes',
    name: 'Majes',
    location: 'Referencia',
    kind: 'reference',
    boundary: [],
    crop: 'No lo sé',
    irrigation: 'No lo sé',
  }
  const evidence = await evidenceRepository.read(parcel)
  const response = await assistantService.answer('¿Cuánta lluvia hay registrada?', parcel, evidence)
  assert.match(response.text, /suma de lluvia/)
  assert.match(response.text, /mm/)
  assert.match(response.text, /no garantiza cobertura completa/)
  assert.doesNotMatch(response.text, /relativa media del aire/)
  const future = await assistantService.answer('¿Qué temperatura habrá mañana?', parcel, evidence)
  assert.match(future.text, /No permiten asegurar/)
})

// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildParcelOverlay } from '../src/lib/parcelOverlay.ts'
import { exampleCropPriorities } from '../src/data/cropPriority.ts'
import { exampleParcels } from '../src/data/scenarios.ts'

test('las capas ilustrativas no aparecen como mediciones de proveedor o parcelas declaradas', () => {
  const boundary = exampleParcels[0].boundary
  assert.equal(buildParcelOverlay(boundary, 'temperature', 'provider'), null)
  assert.equal(buildParcelOverlay(boundary, 'moisture', 'declared'), null)
  assert.equal(buildParcelOverlay(boundary, 'none', 'synthetic'), null)
  const result = buildParcelOverlay(boundary, 'temperature', 'synthetic')
  assert.ok(result)
  const svg = decodeURIComponent(result.url.split(',').slice(1).join(','))
  assert.ok(svg.includes('clip-path="url(#parcel)"'))
  assert.equal(result.bounds[0][0], Math.min(...boundary.map((p) => p[1])))
  assert.equal(result.bounds[1][1], Math.max(...boundary.map((p) => p[0])))
  assert.notEqual(result.url, buildParcelOverlay(boundary, 'moisture', 'synthetic')?.url)
  assert.equal(
    buildParcelOverlay(
      [
        [1, 1],
        [1, 1],
        [1, 1],
      ],
      'temperature',
      'synthetic',
    ),
    null,
  )
})
test('la prioridad cambia entre ejemplos y nunca evalúa una parcela real o declarada', () => {
  const first = exampleCropPriorities(exampleParcels[0]),
    second = exampleCropPriorities(exampleParcels[1])
  assert.equal(first?.onion, 1)
  assert.equal(second?.bean, 1)
  assert.deepEqual(
    Object.values(first!).sort((a, b) => a - b),
    [1, 2, 3, 4, 5, 6, 7, 8],
  )
  assert.equal(exampleCropPriorities({ id: 'example-olivos', kind: 'declared' }), null)
  assert.equal(exampleCropPriorities({ id: 'reference-majes', kind: 'reference' }), null)
})

// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import test from 'node:test'
import assert from 'node:assert/strict'
import { aggregateSeries, studyExport, studyCSV, parcelGeoJSON } from '../src/lib/study.ts'
import { exampleParcels, syntheticEvidence } from '../src/data/scenarios.ts'
import { evidenceRepository } from '../src/services/local.ts'
import type { Observation } from '../src/types/domain.ts'
const records: Observation[] = [
  { date: '2026-01-04', temperature: 10, minimum: 2, maximum: 18, rain: null, humidity: null },
  { date: '2026-01-05', temperature: 20, minimum: 3, maximum: 24, rain: 0, humidity: 50 },
  { date: '2026-01-06', temperature: null, minimum: null, maximum: null, rain: 4, humidity: null },
  { date: '2026-02-01', temperature: 30, minimum: 12, maximum: 40, rain: null, humidity: 60 },
]
test('las semanas comienzan el lunes; promedios y lluvia conservan faltantes', () => {
  const weeks = aggregateSeries(records, 'temperature', 'week')
  assert.deepEqual(
    weeks.map((p) => [p.date, p.value, p.valid]),
    [
      ['2025-12-29', 10, 1],
      ['2026-01-05', 20, 1],
      ['2026-01-26', 30, 1],
    ],
  )
  assert.deepEqual(
    aggregateSeries(records, 'rain', 'month').map((p) => [p.value, p.valid]),
    [
      [4, 2],
      [null, 0],
    ],
  )
  assert.equal(aggregateSeries(records, 'soilMoisture', 'month')[0].value, null)
  assert.equal(aggregateSeries(records, 'temperature', 'day').length, 4)
})
test('cada escenario se identifica como sintético y tiene una serie propia', async () => {
  const first = await evidenceRepository.read(exampleParcels[0]),
    second = await evidenceRepository.read(exampleParcels[1])
  assert.equal(first?.origin, 'synthetic')
  assert.equal(first?.points.length, 304)
  assert.notEqual(first?.points[0].temperature, second?.points[0].temperature)
  assert.equal(first?.url, '')
})
test('exportar conserva selección, unidades, origen y faltantes sin falsos datos reales', () => {
  const evidence = syntheticEvidence(exampleParcels[0])
  const json = studyExport(evidence, exampleParcels[0], records.slice(0, 2))
  assert.equal(json.metadata.origin, 'synthetic')
  assert.equal(json.metadata.selection.count, 2)
  assert.equal(json.metadata.parcel.id, exampleParcels[0].id)
  assert.equal(json.records[0].soilMoisture, null)
  assert.equal(json.metadata.units.rain, 'mm/day')
  const csv = studyCSV(evidence, exampleParcels[0], records.slice(0, 1))
  assert.ok(csv.includes('synthetic'))
  assert.ok(csv.includes('"",""'))
  assert.ok(csv.includes('soilMoisture [% vol.]'))
  const feature = parcelGeoJSON(exampleParcels[0])
  assert.equal(feature.properties.origin, 'synthetic')
  assert.deepEqual(feature.geometry.coordinates[0][0], feature.geometry.coordinates[0].at(-1))
  assert.throws(() => parcelGeoJSON({ ...exampleParcels[0], boundary: [] }))
})

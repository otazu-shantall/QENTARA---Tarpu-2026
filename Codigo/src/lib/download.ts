import { DEMO_METADATA } from '../data/demo'
import { toCsv } from './domain'
import type { Observation } from '../types'

function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportObservations(records: Observation[], format: 'csv' | 'json') {
  if (format === 'csv') download(toCsv(records), 'tarpu-datos-demostracion.csv', 'text/csv;charset=utf-8;')
  else download(JSON.stringify({ metadata: DEMO_METADATA, records }, null, 2), 'tarpu-datos-demostracion.json', 'application/json')
}

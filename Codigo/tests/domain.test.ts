import test from 'node:test'
import assert from 'node:assert/strict'
import { aggregateParcels, answerQuestion, filterObservations, toCsv } from '../src/lib/domain.ts'
import { initialParcels, observations } from '../src/data/demo.ts'

test('seleccionar una parcela conserva sus valores y la vista agregada no suma índices',()=>{
  assert.equal(aggregateParcels(initialParcels,'majes').name,'El Pedregal')
  const summary=aggregateParcels(initialParcels,'all')
  assert.equal(summary.area,7.3)
  assert.equal(summary.ndvi,0.63)
  assert.equal(summary.moisture,0.32)
})

test('los filtros combinan parcela, período y variable sin perder valores ausentes',()=>{
  const rows=filterObservations(observations,{parcelId:'la-joya',period:7,variable:'precipitation'})
  assert.equal(rows.length,7)
  assert.ok(rows.every(row=>row.parcelId==='la-joya'&&row.date>='2026-10-18'))
  assert.equal(rows.filter(row=>row.value===null).length,1)
})

test('el nivel y la búsqueda se aplican sobre toda la selección',()=>{
  const rows=filterObservations(observations,{parcelId:'all',period:90,level:'Derivado',search:'2026-10-24'})
  assert.equal(rows.length,3)
  assert.ok(rows.every(row=>row.variable==='ndvi'))
})

test('una parcela nueva no recibe registros de otra ubicación',()=>{
  assert.deepEqual(filterObservations(observations,{parcelId:'parcela-nueva',period:30}),[])
})

test('CSV conserva faltantes, Unicode, comillas y origen sintético',()=>{
  const csv=toCsv([{...observations[0],value:null,reference:'Prueba, "referencia"'}])
  assert.ok(csv.startsWith('\uFEFF'))
  assert.ok(csv.includes('"Prueba, ""referencia"""'))
  assert.ok(csv.includes('"temperature","","°C"'))
  assert.ok(csv.includes('"sintetico"'))
  assert.equal(csv.split('\r\n').length,2)
})

test('el agente distingue vegetación de fertilidad y reconoce datos sintéticos',()=>{
  const answer=answerQuestion('¿QUÉ significa el NDVI?',initialParcels[0])
  assert.match(answer,/no determina fertilidad/)
  assert.match(answer,/sintéticos/)
})

test('preguntas de riego y rotación no generan una prescripción',()=>{
  assert.match(answerQuestion('¿Cuánta agua debo aplicar de riego?',initialParcels[0]),/no permite|Ninguno permite/)
  assert.match(answerQuestion('¿Qué cultivo debería sembrar?',initialParcels[0]),/No hay un ranking agronómico validado/)
})

test('preguntas desconocidas declaran que no hay IA conectada',()=>{
  assert.match(answerQuestion('Hola',initialParcels[0]),/no un modelo de IA conectado/)
})

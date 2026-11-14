/** Functional and responsive checks for a local developer environment.
 * Start `npm run dev` first. Requires an existing Chrome installation.
 * This suite was prepared but could not be run in the restricted task browser.
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const baseURL=process.env.TARPU_BASE_URL??'http://127.0.0.1:5173'
const browser=await chromium.launch({channel:process.env.TARPU_BROWSER_CHANNEL??'chrome',headless:true})
const context=await browser.newContext({viewport:{width:1440,height:1100},locale:'es-PE',reducedMotion:'reduce'})
const page=await context.newPage()
const errors=[]
page.on('pageerror',error=>errors.push(error.message))
await mkdir('test-results',{recursive:true})

try {
  // The root route is the public landing; the demo opens from its main call to action.
  await page.goto(baseURL)
  await page.getByRole('heading',{name:'Tu campo, visto desde el espacio.'}).waitFor()
  await page.screenshot({path:'test-results/landing-desktop.png'})
  await page.getByRole('button',{name:'Abrir la demo'}).first().click()
  await page.getByRole('heading',{name:'Tu campo, en perspectiva.'}).waitFor()
  // A real Leaflet viewport replaces the synthetic SVG. This checks controls
  // without asserting that a third-party network service must be available.
  await page.locator('.geographic-map.leaflet-container').waitFor()
  await page.getByRole('button',{name:'Elegir capa del mapa'}).click()
  await page.getByRole('button',{name:'Mapa de calles',exact:true}).click()
  await page.getByRole('link',{name:'OpenStreetMap',exact:true}).waitFor()
  const tileZoom=async()=>Number((await page.locator('.leaflet-tile').first().getAttribute('src')).match(/\/(\d+)\/\d+\/\d+\.png/)[1])
  await page.waitForFunction(()=>document.querySelector('.leaflet-tile')?.getAttribute('src')?.includes('openstreetmap.org'))
  const initialZoom=await tileZoom()
  await page.getByRole('button',{name:'Acercar mapa'}).click()
  await page.waitForFunction(previous=>[...document.querySelectorAll('.leaflet-tile')].some(tile=>Number(tile.getAttribute('src')?.match(/\/(\d+)\/\d+\/\d+\.png/)?.[1])>previous),initialZoom)
  await page.getByRole('button',{name:'Majes',exact:true}).click()
  assert.equal(await page.getByLabel('Parcela activa').inputValue(),'majes')
  await page.getByRole('button',{name:'Elegir capa del mapa'}).click()
  await page.getByRole('button',{name:'Imagen satelital',exact:true}).click()
  await page.screenshot({path:'test-results/dashboard-desktop.png',fullPage:true})
  await page.getByLabel('Parcela activa').selectOption('majes')
  await page.getByLabel('Período de consulta').selectOption('30')
  await page.getByRole('button',{name:'Abrir agente Tarpu'}).click()
  await page.getByLabel('Pregunta al agente').fill('¿Qué significa el NDVI?')
  await page.getByRole('button',{name:'Enviar pregunta'}).click()
  await page.getByRole('log').getByText(/no determina fertilidad/).waitFor()
  await page.screenshot({path:'test-results/agente.png',fullPage:true})
  await page.getByRole('button',{name:'Cerrar diálogo'}).click()
  await page.getByRole('link',{name:'Explorar datos'}).click()
  await page.getByLabel('Filtrar variable').selectOption('ndvi')
  await page.getByRole('button',{name:'Descargar selección'}).click()
  const downloadPromise=page.waitForEvent('download')
  await page.getByRole('button',{name:'JSON Registros y metadatos'}).click()
  const download=await downloadPromise
  const stream=await download.createReadStream()
  const chunks=[]
  for await(const chunk of stream)chunks.push(chunk)
  const data=JSON.parse(Buffer.concat(chunks).toString())
  assert.equal(data.metadata.kind,'synthetic-demo')
  assert.equal(data.records.length,30)
  assert.ok(data.records.every(row=>row.parcelId==='majes'&&row.variable==='ndvi'))
  await page.screenshot({path:'test-results/datos-desktop.png',fullPage:true})
  await page.getByRole('link',{name:'Mis parcelas'}).click()
  await page.getByRole('button',{name:'Añadir parcela'}).click()
  await page.getByLabel('Nombre de la parcela').fill('Parcela de prueba UI')
  await page.getByLabel('Localidad').fill('Arequipa, Perú')
  await page.getByRole('button',{name:'Guardar parcela de ejemplo'}).click()
  await page.getByRole('heading',{name:'Parcela de prueba UI'}).waitFor()
  await page.reload()
  await page.getByRole('heading',{name:'Parcela de prueba UI'}).waitFor()
  await page.getByRole('link',{name:'Mis informes'}).click()
  await page.getByRole('button',{name:'Crear informe',exact:true}).click()
  assert.ok(await page.locator('.report-row').count()>0)
  // An unavailable tile provider must produce a useful empty/error state.
  await context.route('**/World_Imagery/MapServer/tile/**',route=>route.abort())
  await page.goto(`${baseURL}/#/monitor`)
  await page.getByText('No se pudo cargar el mapa.',{exact:true}).waitFor()
  await page.getByRole('button',{name:'Cambiar vista',exact:true}).click()
  await page.getByRole('link',{name:'OpenStreetMap',exact:true}).waitFor()
  await context.unroute('**/World_Imagery/MapServer/tile/**')
  for(const route of ['','overview','parcels','monitor','climate','rotations','data','reports']) {
    await page.goto(`${baseURL}/#/${route}`)
    await page.locator('main h1').first().waitFor()
    await page.setViewportSize({width:390,height:844})
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),true,`Overflow móvil: ${route}`)
    await page.screenshot({path:`test-results/movil-${route||'inicio'}.png`,fullPage:true})
    await page.setViewportSize({width:1440,height:1100})
  }
  assert.deepEqual(errors,[])
  await writeFile('test-results/resultados.json',JSON.stringify({functional:true,responsive:true,errors},null,2))
  console.log('Landing, navegación, agente, descarga, persistencia y ocho vistas móviles: OK')
} finally {await browser.close()}

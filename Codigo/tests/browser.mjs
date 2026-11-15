/** Nuevo recorrido de interfaz. Escrito con asistencia de OpenAI Codex.
 * Registro en entrega/uso-de-ia.md. Requiere el servidor de desarrollo encendido.
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import assert from 'node:assert/strict'

const baseURL = process.env.TARPU_BASE_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch({
  channel: process.env.TARPU_BROWSER_CHANNEL ?? 'chrome',
  headless: true,
})
const context = await browser.newContext({
  viewport: { width: 1512, height: 1100 },
  locale: 'es-PE',
  reducedMotion: 'reduce',
})
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
await mkdir('test-results', { recursive: true })

async function navigate(label) {
  if (
    await page.getByRole('button', { name: 'Menú', exact: true }).isVisible()
  ) {
    await page.getByRole('button', { name: 'Menú', exact: true }).click()
  }
  await page
    .getByRole('navigation', { name: 'Navegación del campo' })
    .getByRole('link', { name: label, exact: true })
    .click()
  await page.waitForFunction(
    (label) =>
      [...document.querySelectorAll('a[aria-current="page"]')].some((link) =>
        link.textContent.includes(label),
      ),
    label,
  )
}

async function checkOverflow() {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
    `Desborde horizontal en ${page.url()}`,
  )
}

try {
  await page.goto(baseURL)
  await page
    .getByRole('heading', { name: 'Tu tierra. Una mirada más clara.' })
    .waitFor()
  await page.getByRole('link', { name: 'Cómo funciona', exact: true }).click()
  assert.ok(
    await page
      .locator('#como-funciona')
      .evaluate((element) => element.getBoundingClientRect().top < innerHeight),
  )
  await page.screenshot({
    path: 'test-results/nuevo-landing.png',
    fullPage: true,
  })
  await page
    .getByRole('link', { name: 'Conocer mi campo', exact: true })
    .click()
  await page
    .locator('.evidence-heading h1')
    .filter({ hasText: 'Majes riego' })
    .waitFor()
  await page.locator('.leaflet-container').waitFor()
  await page.waitForTimeout(1500)
  await page.screenshot({
    path: 'test-results/nuevo-campo.png',
    fullPage: true,
  })
  await checkOverflow()
  await page.getByRole('button', { name: 'Ver calles', exact: true }).click()
  await page.getByRole('link', { name: 'OpenStreetMap', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Ver satélite', exact: true }).click()
  await page.getByLabel('Lugar de consulta').selectOption('chivay')
  await page
    .locator('.evidence-heading h1')
    .filter({ hasText: 'Chivay' })
    .waitFor()
  await page.getByLabel('Variable del gráfico').selectOption('rain')
  await page.getByRole('img', { name: /Lluvia mensual de Chivay/ }).waitFor()
  await page
    .getByRole('button', { name: 'Hablar con TARPU', exact: true })
    .click()
  await page
    .getByRole('dialog', { name: 'Agente TARPU', exact: true })
    .waitFor()
  await page
    .getByRole('button', { name: '¿Cómo fue el clima?', exact: true })
    .click()
  await page
    .getByRole('log')
    .getByText(/La consulta guardada de Chivay/)
    .waitFor()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Cerrar', exact: true })
    .click()
  await navigate('Agente TARPU')
  await page
    .getByRole('log')
    .getByText(/La consulta guardada de Chivay/)
    .waitFor()
  await page
    .getByLabel('¿Qué te gustaría saber?')
    .fill('¿Qué significa el NDVI?')
  await page.getByRole('button', { name: 'Enviar pregunta' }).click()
  await page
    .getByRole('log')
    .getByText(/El NDVI describe el verdor/)
    .waitFor()
  await page.screenshot({
    path: 'test-results/nuevo-agente.png',
    fullPage: true,
  })
  await navigate('Mis datos')
  await page.getByRole('button', { name: 'Verdor', exact: true }).click()
  await page.getByLabel('Buscar registros').fill('bueno')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descargar CSV', exact: true }).click()
  const csv = await downloadPromise
  const stream = await csv.createReadStream()
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  const content = Buffer.concat(chunks).toString()
  assert.ok(content.includes('ORNL DAAC'))
  assert.ok(content.includes('Chivay'))
  assert.ok(content.includes('Calidad bueno'))
  await page.getByRole('button', { name: 'Clima', exact: true }).click()
  await page.getByLabel('Buscar registros').fill('')
  await page.getByLabel('Desde', { exact: true }).fill('2025-01-01')
  await page.getByLabel('Hasta', { exact: true }).fill('2025-01-02')
  assert.equal(await page.locator('tbody tr').count(), 2)
  await page.screenshot({
    path: 'test-results/nuevo-datos.png',
    fullPage: true,
  })
  await navigate('Cultivos')
  const cards = page.locator('.crop-card')
  assert.equal(await cards.count(), 8)
  for (let i = 0; i < 3; i++) await cards.nth(i).click()
  assert.equal(await cards.nth(3).isDisabled(), true)
  await page
    .getByRole('button', { name: 'Ver fichas juntas', exact: true })
    .click()
  await page
    .getByRole('dialog', { name: 'Fichas de cultivos', exact: true })
    .waitFor()
  assert.equal(await page.locator('.comparison-grid article').count(), 3)
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Cerrar', exact: true })
    .click()
  await page.screenshot({
    path: 'test-results/nuevo-cultivos.png',
    fullPage: true,
  })
  await navigate('Mi campo')
  await page
    .getByRole('button', { name: 'Dibujar mi campo', exact: true })
    .click()
  const map = page.locator('.field-map')
  for (const position of [
    { x: 500, y: 200 },
    { x: 700, y: 200 },
    { x: 700, y: 400 },
    { x: 500, y: 400 },
  ]) {
    await map.click({ position })
  }
  await page.getByRole('button', { name: 'Terminar', exact: true }).click()
  await page
    .getByRole('dialog', { name: 'Guardar mi campo', exact: true })
    .waitFor()
  await page
    .getByLabel('Nombre del campo', { exact: true })
    .fill('Campo de prueba UI')
  await page
    .getByLabel('¿Qué cultivas actualmente?', { exact: true })
    .fill('Papa')
  await page
    .getByRole('button', { name: 'Guardar mi campo', exact: true })
    .click()
  await page
    .locator('.evidence-heading h1')
    .filter({ hasText: 'Campo de prueba UI' })
    .waitFor()
  // Con la API encendida, el campo muestra su tarjeta declarada y luego los datos reales de la base.
  await page.locator('.declared-card').waitFor()
  await page.reload()
  await page
    .getByLabel('Lugar de consulta')
    .selectOption({ label: 'Campo de prueba UI' })
  await page
    .locator('.evidence-heading h1')
    .filter({ hasText: 'Campo de prueba UI' })
    .waitFor()
  await navigate('Mis datos')
  const geometryPromise = page.waitForEvent('download')
  await page
    .getByRole('button', { name: 'Mi contorno (GeoJSON)', exact: true })
    .click()
  const geometryDownload = await geometryPromise
  const geometryStream = await geometryDownload.createReadStream()
  const geometryChunks = []
  for await (const chunk of geometryStream) geometryChunks.push(chunk)
  const geometry = JSON.parse(Buffer.concat(geometryChunks).toString())
  assert.equal(geometry.geometry.type, 'Polygon')
  assert.equal(geometry.geometry.coordinates[0].length, 5)
  assert.equal(geometry.properties.origin, 'declarado por el usuario')
  await page.getByLabel('Lugar de consulta').selectOption('majes_riego')

  for (const width of [1440, 1024, 768, 390, 375]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(`${baseURL}/#/campo`)
    for (const label of ['Mi campo', 'Cultivos', 'Mis datos', 'Agente TARPU']) {
      await navigate(label)
      await checkOverflow()
    }
    await navigate('Mi campo')
    if (width === 390) {
      await page.screenshot({
        path: 'test-results/nuevo-movil.png',
        fullPage: true,
      })
      await page
        .getByRole('button', { name: 'Hablar con TARPU', exact: true })
        .click()
      await page
        .getByLabel('¿Qué te gustaría saber?')
        .fill('¿Qué dice el suelo?')
      await page.getByRole('button', { name: 'Enviar pregunta' }).click()
      await page
        .getByRole('log')
        .getByText(/SoilGrids estima un pH/)
        .waitFor()
      await page.screenshot({
        path: 'test-results/nuevo-chat-movil.png',
        fullPage: true,
      })
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Cerrar', exact: true })
        .click()
    }
    await page.goto(`${baseURL}/#/`)
    await checkOverflow()
    if (width === 390)
      await page.screenshot({
        path: 'test-results/nuevo-landing-movil.png',
        fullPage: true,
      })
  }
  await page.goto(`${baseURL}/#/campo`)
  await page.getByRole('button', { name: 'Menú', exact: true }).click()
  await page
    .getByRole('button', { name: 'Letra más grande', exact: true })
    .click()
  await page.getByRole('button', { name: 'Menú', exact: true }).click()
  await checkOverflow()
  assert.equal(await page.locator('.larger-text').count(), 1)
  // Las fuentes de mapa pueden fallar sin bloquear los datos guardados.
  await page.route('**/MapServer/tile/**', (route) => route.abort())
  await page.route('**/tile.openstreetmap.org/**', (route) => route.abort())
  await page.reload()
  await page
    .getByText('La imagen necesita conexión.', { exact: true })
    .waitFor()
  await page.locator('.evidence-heading h1').filter({ hasText: 'Majes riego' }).waitFor()
  assert.deepEqual(errors, [])
  console.log(
    'Recorrido nuevo aprobado: referencias reales, chat con contexto, filtros, CSV/GeoJSON, cultivos, dibujo, persistencia, cinco anchos y cartografía sin conexión.',
  )
} finally {
  await browser.close()
}

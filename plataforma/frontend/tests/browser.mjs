// Recorrido en Chrome del frontend unido (15/11/2026): portada de Codex, panel de Shantall y datos reales de la API.
// Requiere `npm run dev` (puerto 5174) y la API de TARPU en el puerto 8000. La suite anterior, construida sobre la
// portada y las parcelas de ejemplo retiradas, sigue en el historial de git (commit 75a6e63).
// Escrito con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'

const base = process.env.TARPU_BASE_URL ?? 'http://127.0.0.1:5174/'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'es-PE',
  reducedMotion: 'reduce',
})
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
await mkdir('test-results', { recursive: true })
const metric = (label) =>
  page.locator('.parcel-readings .metric-card').filter({ hasText: label }).locator('strong')

try {
  // 1. Portada de Codex
  await page.goto(base)
  await page.getByRole('heading', { name: /Tu tierra\.\s*Una mirada más clara\./ }).waitFor()
  await page.screenshot({ path: 'test-results/portada.png' })
  await page.getByRole('link', { name: 'Entrar a mi campo' }).click()

  // 2. Acceso de prueba (sin guardar secretos)
  await page.getByRole('heading', { name: 'Tu campo te espera.' }).waitFor()
  await page.getByRole('button', { name: 'Entrar al prototipo sin completar datos' }).click()
  await page.getByRole('heading', { name: 'Cada campo, una historia.' }).waitFor()

  // 3. Lugar de referencia con datos reales del servidor (sin parcelas de ejemplo)
  const options = await page.getByLabel('Parcela activa').locator('option').allTextContents()
  assert.ok(!options.some((o) => /ejemplo/i.test(o)), 'no debe haber parcelas de ejemplo')
  assert.ok(options.some((o) => o.startsWith('Cabanaconde')))
  await page.getByRole('heading', { name: 'Majes / Arequipa' }).waitFor()
  await page.locator('.parcel-readings').waitFor({ timeout: 60000 })
  assert.match(await metric('Altitud').innerText(), /\d/)
  assert.match(await metric('Zona').innerText(), /S1/)
  assert.equal(await page.locator('.leaflet-image-layer').count(), 0, 'sin capa de sectores ni patrones')
  assert.match(
    await page.locator('.workspace-main .metric-card').first().evaluate((el) => getComputedStyle(el).backdropFilter),
    /blur/,
  )
  await page.screenshot({ path: 'test-results/mi-campo.png', fullPage: true })

  await page.getByLabel('Parcela activa').selectOption('reference-cabanaconde')
  await page.getByRole('heading', { name: 'Cabanaconde / Arequipa' }).waitFor()
  await page.waitForFunction(() =>
    /S2/.test(document.querySelector('.parcel-readings')?.textContent ?? ''),
  )

  // 4. Historial y Estudio técnico con la serie de POWER
  await page.getByRole('link', { name: 'Historial', exact: false }).first().click()
  await page.getByText('Histórico real').waitFor({ timeout: 60000 })
  await page.goto(base + '#/app/estudio-tecnico')
  await page.getByText('HISTÓRICO REAL CON FUENTE').waitFor({ timeout: 60000 })

  // 5. Dibujar una parcela: el mapa abre sobre Arequipa, se acerca y se marcan cuatro esquinas
  await page.goto(base + '#/app/parcela/nueva')
  await page.locator('.leaflet-container').waitFor()
  for (let i = 0; i < 8; i++) await page.getByRole('button', { name: 'Acercar mapa' }).click()
  const map = page.locator('.leaflet-container')
  for (const position of [
    { x: 420, y: 300 },
    { x: 560, y: 300 },
    { x: 560, y: 440 },
    { x: 420, y: 440 },
  ])
    await map.click({ position })
  await page.getByRole('button', { name: 'Cerrar contorno', exact: true }).click()
  await page.getByLabel('Nombre de la parcela').fill('Parcela de prueba')
  await page.getByRole('button', { name: 'Guardar parcela', exact: true }).click()
  await page.getByRole('heading', { name: 'Parcela de prueba / Arequipa' }).waitFor()
  await page.locator('.parcel-readings').waitFor({ timeout: 60000 })
  assert.match(await metric('Altitud').innerText(), /\d/)
  await page.getByRole('button', { name: 'Traer datos satelitales' }).waitFor()
  await page.screenshot({ path: 'test-results/parcela-dibujada.png', fullPage: true })

  // 6. Tema oscuro en el espacio de trabajo
  await page.getByRole('button', { name: 'Cambiar a tema oscuro', exact: true }).click()
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark')
  await page.getByRole('button', { name: 'Cambiar a tema claro', exact: true }).click()

  assert.deepEqual(errors, [])
  console.log(
    'OK: portada de Codex, acceso de prueba, lugares de referencia con datos reales, historial y estudio con POWER, dibujo de parcela con datos de la base y tema oscuro.',
  )
} finally {
  await browser.close()
}

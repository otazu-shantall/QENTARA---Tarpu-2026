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
const finding = (title) =>
  page.locator('.finding').filter({ hasText: title }).locator('.finding-value')

try {
  // 1. Portada de Codex
  await page.goto(base)
  await page.getByRole('heading', { name: /Tu tierra\.\s*Una mirada más clara\./ }).waitFor()
  await page.screenshot({ path: 'test-results/portada.png' })
  await page.getByRole('link', { name: 'Entrar a mi campo' }).click()

  // 2. Acceso de prueba (sin guardar secretos)
  await page.getByRole('heading', { name: 'Tu campo te espera.' }).waitFor()
  await page.getByRole('button', { name: 'Entrar al prototipo sin completar datos' }).click()
  await page.getByRole('heading', { name: 'Mi campo', exact: true }).waitFor()

  // 2b. Recorrido guiado: se abre la primera vez, resalta cada parte y no vuelve a salir
  const tour = page.getByRole('dialog', { name: 'Recorrido guiado de TARPU' })
  await tour.waitFor()
  await tour.getByRole('heading', { name: 'Bienvenido a TARPU' }).waitFor()
  await tour.getByRole('button', { name: 'Siguiente' }).click()
  await tour.getByRole('heading', { name: 'Elige el lugar' }).waitFor()
  await page.locator('.tour-spot').waitFor()
  await tour.getByRole('button', { name: 'Salir del recorrido' }).click()
  await tour.waitFor({ state: 'hidden' })
  assert.equal(await page.evaluate(() => localStorage.getItem('tarpu.tour.campo')), '1')
  // Cada sección abre su propio recorrido la primera vez: se comprueba el de Historial y se marcan los demás como vistos.
  await page.getByRole('link', { name: 'Historial', exact: false }).first().click()
  await tour.getByText('Historial · paso 1 de', { exact: false }).waitFor({ timeout: 60000 })
  await tour.getByRole('button', { name: 'Salir del recorrido' }).click()
  await page.evaluate(() => {
    for (const key of ['rotacion', 'informes', 'estudio', 'ayuda', 'asistente', 'dibujo'])
      localStorage.setItem(`tarpu.tour.${key}`, '1')
  })
  await page.goto(base + '#/app')

  // 3. Lugar de referencia con datos reales del servidor (sin parcelas de ejemplo)
  const options = await page.getByLabel('Parcela activa').locator('option').allTextContents()
  assert.ok(!options.some((o) => /ejemplo/i.test(o)), 'no debe haber parcelas de ejemplo')
  assert.ok(options.some((o) => o.startsWith('Cabanaconde')))
  await page.getByRole('heading', { name: /^Majes/ }).waitFor()
  // Majes ya tiene su extracción en el servidor: se ven los resultados explicados.
  await page.getByRole('heading', { name: 'Lo que encontramos' }).waitFor({ timeout: 60000 })
  assert.match(await finding('Altitud y zona').innerText(), /\d/)
  assert.match(await page.locator('.finding').filter({ hasText: 'Altitud y zona' }).innerText(), /zona S1/)
  await page.locator('.zone-legend').waitFor()
  assert.equal(await page.locator('.leaflet-image-layer').count(), 1, 'capa de zonas de Arequipa')
  assert.match(
    await page.locator('.workspace-main .finding').first().evaluate((el) => getComputedStyle(el).backdropFilter),
    /blur/,
  )
  await page.screenshot({ path: 'test-results/mi-campo.png', fullPage: true })
  // Cada tarjeta explica su tipo de dato y permite seguir con el asistente
  await page.locator('.finding').filter({ hasText: 'Acidez del suelo' }).getByRole('button', { name: '¿Qué es este dato?' }).click()
  const about = page.getByRole('dialog', { name: 'Acidez del suelo (pH)' })
  await about.getByText('El pH mide qué tan ácido o alcalino es el suelo').waitFor()
  await about.getByRole('button', { name: /Explorar más con/ }).click()
  await page.getByRole('log').getByText('Cada cultivo tiene un rango de pH', { exact: false }).waitFor()
  await page.getByRole('button', { name: 'Cerrar asistente', exact: true }).click()

  await page.getByLabel('Parcela activa').selectOption('reference-cabanaconde')
  await page.getByRole('heading', { name: /^Cabanaconde/ }).waitFor()
  // Con extracción previa se ven los resultados; si no, el botón para pedirla.
  await page.waitForFunction(
    () =>
      /zona S2/.test(document.querySelector('.findings')?.textContent ?? '') ||
      [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Extraer datos completos')),
  )

  // 4. Historial y Estudio técnico con la serie de POWER
  await page.getByRole('link', { name: 'Historial', exact: false }).first().click()
  await page.getByRole('heading', { name: /^¿Qué quieres ver de/ }).waitFor({ timeout: 60000 })
  await page.getByRole('button', { name: 'Lluvia', exact: true }).click()
  await page.getByRole('heading', { name: /^Lluvia en \d{4}$/ }).waitFor()
  await page.locator('.history-chart').waitFor()
  await page.screenshot({ path: 'test-results/historial.png', fullPage: true })

  // 4b. Rotación de cultivos con el motor del backend (sin puntaje)
  await page.goto(base + '#/app/rotacion')
  await page.getByLabel('¿Qué cultivas ahora?').selectOption('papa')
  await page.getByLabel('¿Con qué agua cuentas?').selectOption('riego')
  for (const month of ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'])
    await page.locator('.month-picker').getByRole('button', { name: month, exact: true }).click()
  await page.getByRole('button', { name: 'Comparar cultivos para rotar' }).click()
  await page.locator('.strategy').first().waitFor({ timeout: 60000 })
  assert.ok((await page.locator('.strategy').count()) >= 3, 'al menos tres estrategias, incluida la actual')
  await page.screenshot({ path: 'test-results/rotacion.png', fullPage: true })
  await page.locator('.strategy-current .strategy-tag').waitFor()
  assert.equal(await page.getByText(/puntaje de|\bapto\b/i).count(), 0)
  await page.screenshot({ path: 'test-results/rotacion.png', fullPage: true })

  // 4c. Ayuda y fuentes: pestañas y enlace desde un círculo de información
  await page.getByRole('link', { name: 'De dónde salen los rangos' }).click()
  await page.getByRole('heading', { name: 'FAO EcoCrop' }).waitFor()
  await page.getByRole('tab', { name: 'Preguntas frecuentes' }).click()
  await page.getByText('¿TARPU me dice qué sembrar?').waitFor()
  await page.goto(base + '#/app/informes')
  await page.getByRole('button', { name: 'Imprimir o guardar PDF' }).waitFor({ timeout: 60000 })
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
  await page.getByRole('heading', { name: /^Parcela de prueba/ }).waitFor()
  // Una parcela nueva no muestra datos hasta pedir la extracción completa.
  // (Si una corrida anterior ya la extrajo en el servidor, la lista aparece sola.)
  await page.waitForFunction(
    () =>
      document.querySelector('.extraction') ||
      [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Extraer datos completos') && !b.disabled),
  )
  if (!(await page.locator('.extraction').count()))
    await page
      .getByRole('button', { name: 'Extraer datos completos' })
      .click({ timeout: 5000 })
      .catch(() => undefined) // el servidor ya tenía la extracción y la lista apareció sola
  await page.locator('.step-done').filter({ hasText: 'Altitud y pendiente' }).waitFor({ timeout: 60000 })
  await page.getByRole('heading', { name: 'Lo que encontramos' }).waitFor()
  assert.match(await finding('Altitud y zona').innerText(), /\d/)
  await page.screenshot({ path: 'test-results/parcela-dibujada.png', fullPage: true })
  // Se detiene la extracción satelital para no dejar descargas en curso.
  const stop = page.getByRole('button', { name: 'Detener' })
  if (await stop.isVisible()) await stop.click()

  // 6. Tema oscuro en el espacio de trabajo
  await page.getByRole('button', { name: 'Cambiar a tema oscuro', exact: true }).click()
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark')
  await page.getByRole('button', { name: 'Cambiar a tema claro', exact: true }).click()

  assert.deepEqual(errors, [])
  console.log(
    'OK: portada, acceso, recorrido guiado, datos reales con su explicación, historial por año, rotación con el motor, ayuda y fuentes, informe, dibujo de parcela con extracción y tema oscuro.',
  )
} finally {
  await browser.close()
}

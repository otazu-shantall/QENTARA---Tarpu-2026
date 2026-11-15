// Desarrollo asistido por IA. Registro: entrega/uso-de-ia.md.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir, readFile } from 'node:fs/promises'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'es-PE',
  reducedMotion: 'reduce',
})
const page = await context.newPage(),
  errors = []
page.on('pageerror', (error) =>
  errors.push({ message: error.message, stack: error.stack, url: page.url() }),
)
await mkdir('test-results', { recursive: true })
const capture = async (options) => {
  if (options.fullPage) {
    await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }))
    await page.waitForFunction(() => scrollY === 0)
  }
  await page.screenshot(options)
}
const downloadJSON = async (name) => {
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name, exact: false }).click()
  return JSON.parse(await readFile(await (await pending).path(), 'utf8'))
}
try {
  await page.goto(process.env.TARPU_BASE_URL ?? 'http://127.0.0.1:5174/')
  await page.getByRole('heading', { name: 'Tu campo. Una nueva perspectiva.' }).waitFor()
  for (const [width, height] of [
    [1280, 768],
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height })
    const hero = await page.locator('.landing-hero').boundingBox(),
      cta = await page.getByRole('link', { name: 'Descubre TARPU' }).boundingBox()
    const header = await page.locator('.public-nav').boundingBox()
    assert.equal(Math.round(header.x), 0)
    assert.equal(Math.round(header.y), 0)
    assert.equal(Math.round(header.width), width)
    assert.equal(Math.round(hero.x), 0)
    assert.equal(Math.round(hero.width), width)
    assert.ok(cta.y + cta.height < height, `CTA fuera de la primera vista en ${width}x${height}`)
  }
  await page.setViewportSize({ width: 1440, height: 900 })
  await page
    .locator('.hero-aerial')
    .evaluate(
      (image) =>
        image.complete ||
        new Promise((resolve) => image.addEventListener('load', resolve, { once: true })),
    )
  await page.getByRole('button', { name: 'Cambiar a tema oscuro', exact: true }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Cambiar a tema claro', exact: true }).waitFor()
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark')
  await page.getByRole('link', { name: 'Iniciar sesión', exact: false }).click()
  await page.getByRole('heading', { name: 'Tu campo te espera.' }).waitFor()
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark')
  await page.getByRole('link', { name: 'Volver al inicio', exact: false }).click()
  await page.getByRole('button', { name: 'Cambiar a tema claro', exact: true }).click()
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light')
  await page.locator('.public-footer').scrollIntoViewIfNeeded()
  await page.locator('.public-footer').screenshot({ path: 'test-results/landing-footer.png' })
  await capture({ path: 'test-results/landing.png', fullPage: true })
  await capture({ path: 'test-results/landing-first-view.png' })
  assert.equal(
    await page.locator('.public-nav').evaluate((el) => getComputedStyle(el).position),
    'fixed',
  )
  const navTop = (await page.locator('.public-nav').boundingBox()).y
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }))
  await page.waitForFunction(() => scrollY > 0)
  assert.equal(Math.round((await page.locator('.public-nav').boundingBox()).y), Math.round(navTop))
  assert.equal(
    await page.locator('html').evaluate((el) => getComputedStyle(el).scrollbarWidth),
    'none',
  )
  await page.getByRole('link', { name: 'Equipo QENTARA', exact: true }).click()
  await page.getByRole('heading', { name: 'Somos QENTARA. Miramos la tierra juntos.' }).waitFor()
  await page.waitForFunction(
    () => Math.abs(document.getElementById('equipo').getBoundingClientRect().top) < 2,
  )
  await page.waitForFunction(() => {
    const logo = document.querySelector('.team-logo')
    return logo.complete && logo.naturalWidth > 0
  })
  await capture({ path: 'test-results/team-anchor.png' })
  await page.getByRole('link', { name: 'Descubre TARPU' }).click()
  await capture({ path: 'test-results/login.png', fullPage: true })
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click()
  await page.getByLabel('Nombres', { exact: true }).fill('Ana')
  await page.getByLabel('Apellidos', { exact: true }).fill('Prueba')
  await page.getByLabel('DNI', { exact: false }).fill('00000000')
  await page.getByLabel('Correo electrónico', { exact: true }).fill('ana@example.com')
  await page.getByLabel('Usuario', { exact: true }).fill('ana.prueba')
  await page.getByLabel('Contraseña', { exact: true }).fill('Ejemplo-12345')
  await page.getByLabel('Confirmar contraseña', { exact: true }).fill('Distinta-12345')
  assert.equal(
    await page.getByLabel('Contraseña', { exact: true }).getAttribute('type'),
    'password',
  )
  assert.equal(
    await page.getByLabel('Contraseña', { exact: true }).getAttribute('autocomplete'),
    'new-password',
  )
  await capture({ path: 'test-results/register.png', fullPage: true })
  await page.getByRole('button', { name: 'Crear cuenta de prueba', exact: true }).click()
  await page.getByRole('alert').getByText('Las contraseñas no coinciden.').waitFor()
  await page.getByLabel('Confirmar contraseña', { exact: true }).fill('Ejemplo-12345')
  await page.getByRole('button', { name: 'Crear cuenta de prueba', exact: true }).click()
  await page.getByRole('heading', { name: 'Cada campo, una historia.' }).waitFor()
  assert.ok(!(await page.evaluate(() => JSON.stringify(localStorage))).includes('Ejemplo-12345'))
  assert.ok(!(await page.evaluate(() => JSON.stringify(localStorage))).includes('00000000'))
  await page.getByRole('heading', { name: 'Los Olivos · ejemplo / Arequipa' }).waitFor()
  await page.locator('.leaflet-container').waitFor()
  await page.locator('.map-loading').waitFor({ state: 'hidden' })
  await page.waitForFunction(() =>
    [...document.querySelectorAll('.leaflet-tile')].every(
      (tile) => getComputedStyle(tile).opacity === '1',
    ),
  )
  await page.locator('.leaflet-image-layer').waitFor()
  assert.match(
    await page.locator('.sidebar').evaluate((el) => getComputedStyle(el).backdropFilter),
    /blur/,
  )
  assert.ok(
    await page
      .locator('.nav-item')
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize) >= 16),
  )
  assert.ok(
    await page
      .locator('.page-heading h1')
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize) <= 35),
  )
  const thermal = await page.locator('.leaflet-image-layer').getAttribute('src')
  await page.getByRole('button', { name: 'Humedad del suelo', exact: true }).click()
  await page
    .locator('.parcel-color-legend')
    .getByText('Humedad del suelo', { exact: true })
    .waitFor()
  assert.notEqual(await page.locator('.leaflet-image-layer').getAttribute('src'), thermal)
  await page.getByRole('button', { name: 'Calor', exact: true }).click()
  await page.locator('.parcel-color-legend').getByText('Calor', { exact: true }).waitFor()
  assert.equal(await page.locator('.leaflet-image-layer').count(), 1)
  await capture({ path: 'test-results/workspace-light.png', fullPage: true })
  const first = await page.locator('.metric-card').first().innerText()
  await page.getByLabel('Parcela activa').selectOption('example-molino')
  await page.getByRole('heading', { name: 'El Molino · ejemplo / Arequipa' }).waitFor()
  assert.notEqual(await page.locator('.metric-card').first().innerText(), first)
  await page.getByRole('button', { name: 'Cambiar a tema oscuro' }).click()
  await capture({ path: 'test-results/workspace-dark.png', fullPage: true })
  await page.getByRole('button', { name: 'Cambiar a tema claro' }).click()
  await page.getByRole('link', { name: 'Saltar al contenido' }).focus()
  await page.getByRole('link', { name: 'Saltar al contenido' }).press('Enter')
  assert.equal(await page.evaluate(() => document.activeElement.id), 'workspace-main')
  await page.getByRole('link', { name: 'Historial', exact: true }).click()
  await page
    .locator('.history-variables')
    .getByRole('button', { name: /^Lluvia/ })
    .click()
  await page.getByRole('img', { name: /Gráfico de barras/ }).waitFor()
  await page
    .getByRole('group', { name: 'Tipo de gráfico' })
    .getByRole('button', { name: 'Líneas', exact: true })
    .click()
  await page.getByRole('img', { name: /Gráfico de líneas/ }).waitFor()
  await page
    .getByRole('group', { name: 'Tipo de gráfico' })
    .getByRole('button', { name: 'Auto', exact: true })
    .click()
  await page
    .locator('.history-variables')
    .getByRole('button', { name: /^Temperatura del aire/ })
    .click()
  await page.getByRole('img', { name: /Gráfico de área/ }).waitFor()
  const historyMap = page.locator('.history-parcel-map')
  await historyMap.locator('.parcel-color-legend').waitFor()
  const legend = await historyMap.locator('.parcel-color-legend').boundingBox()
  for (const name of ['Acercar mapa', 'Alejar mapa', 'Capas del mapa']) {
    const control = await historyMap.getByRole('button', { name, exact: true }).boundingBox()
    assert.ok(
      control.x + control.width <= legend.x ||
        legend.x + legend.width <= control.x ||
        control.y + control.height <= legend.y ||
        legend.y + legend.height <= control.y,
      `La leyenda tapa ${name}`,
    )
  }
  const previousScale = await historyMap.locator('.leaflet-control-scale-line').innerText()
  await historyMap.getByRole('button', { name: 'Acercar mapa', exact: true }).click()
  await page.waitForFunction(
    (previous) =>
      document.querySelector('.history-parcel-map .leaflet-control-scale-line').textContent !==
      previous,
    previousScale,
  )
  await historyMap.getByRole('button', { name: 'Alejar mapa', exact: true }).click()
  await historyMap.locator('.map-loading').waitFor({ state: 'hidden' })
  await historyMap.screenshot({ path: 'test-results/history-map.png' })
  await page.getByRole('button', { name: 'Semanas', exact: true }).click()
  await page.getByRole('img', { name: /agrupación por semana/ }).waitFor()
  await page.getByRole('button', { name: 'Días', exact: true }).click()
  await page.getByRole('img', { name: /agrupación por día/ }).waitFor()
  await page.getByLabel('Período histórico').selectOption('30')
  await page.getByRole('button', { name: 'Meses', exact: true }).click()
  await capture({ path: 'test-results/history.png', fullPage: true })
  await page.getByLabel('Período histórico').selectOption('365')
  await page.getByRole('link', { name: 'Estudio técnico', exact: true }).click()
  await page.getByRole('heading', { name: 'Estudio técnico de tu parcela.' }).waitFor()
  await page.waitForFunction(() => scrollY === 0)
  await page.getByRole('button', { name: 'Agua en el suelo', exact: false }).click()

  await page
    .locator('.study-variable-grid button[aria-pressed=true]')
    .getByText('Agua en el suelo', { exact: true })
    .waitFor()
  await capture({ path: 'test-results/study.png', fullPage: true })
  await page.getByRole('button', { name: 'Registros completos', exact: true }).click()
  await page.getByRole('textbox', { name: 'Buscar fecha' }).fill('2026-10')
  const synthetic = await downloadJSON('JSON Registros')
  assert.equal(synthetic.metadata.origin, 'synthetic')
  assert.equal(synthetic.records.length, 31)
  assert.equal(synthetic.metadata.parcel.id, 'example-molino')
  assert.equal(synthetic.metadata.units.soilMoisture, '% vol.')
  const geometry = await downloadJSON('GeoJSON Solo')
  assert.equal(geometry.properties.origin, 'synthetic')
  assert.deepEqual(geometry.geometry.coordinates[0][0], geometry.geometry.coordinates[0].at(-1))
  await page.getByLabel('Parcela activa').selectOption('reference-majes')
  const real = await downloadJSON('JSON Registros')
  assert.equal(real.metadata.origin, 'provider')
  assert.equal(real.records.length, 365)
  assert.equal(real.records[0].soilMoisture, null)
  await page.getByRole('link', { name: 'Recomendaciones', exact: true }).click()
  await page.getByLabel('Parcela activa').selectOption('example-olivos')
  await page
    .locator('.crop-card')
    .first()
    .getByRole('heading', { name: 'Cebolla', exact: true })
    .waitFor()
  await page.getByLabel('Parcela activa').selectOption('example-molino')
  await page
    .locator('.crop-card')
    .first()
    .getByRole('heading', { name: 'Haba', exact: true })
    .waitFor()
  await page.getByRole('button', { name: 'Flores', exact: true }).click()
  assert.equal(await page.locator('.crop-card').count(), 2)
  await page.getByRole('button', { name: 'Todas', exact: true }).click()
  await page
    .locator('.crop-card')
    .filter({ has: page.getByRole('heading', { name: 'Cebolla', exact: true }) })
    .getByRole('checkbox', { name: 'Comparar' })
    .check()
  await page
    .locator('.crop-card')
    .filter({ has: page.getByRole('heading', { name: 'Haba', exact: true }) })
    .getByRole('checkbox', { name: 'Comparar' })
    .check()
  await page.getByRole('button', { name: 'Comparar (2/3)' }).click()
  await page.getByRole('dialog', { name: 'Comparar posibilidades' }).waitFor()
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click()
  await capture({ path: 'test-results/recommendations.png', fullPage: true })
  await page.getByRole('button', { name: 'Mi proveedor de IA', exact: true }).click()
  await page.getByRole('button', { name: /Google \/ Gemini/ }).click()
  await page.getByRole('button', { name: 'Guardar preferencia', exact: true }).click()
  await page
    .getByRole('status')
    .getByText(/La cuenta continúa sin vincular/)
    .waitFor()
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click()
  // Dobles de audio: no se activa ni graba un micrófono real.
  await context.addInitScript(() => {
    window.prototypeStarts = 0
    window.prototypeAborts = 0
    window.prototypeCancels = 0
    window.SpeechRecognition = class {
      start() {
        window.prototypeRecognition = this
        window.prototypeStarts++
        this.onstart?.()
      }
      abort() {
        window.prototypeAborts++
        this.onend?.()
      }
    }
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        cancel() {
          window.prototypeCancels++
        },
        getVoices() {
          return []
        },
        speak(audio) {
          window.prototypeUtterance = audio
          audio.onstart?.()
        },
      },
    })
  })
  await page.reload()
  await page.getByLabel('Parcela activa').selectOption('reference-majes')
  await page.getByRole('button', { name: 'Pregunta a Tarpu', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Tu pregunta a Tarpu' })
    .fill('¿Qué significa la humedad?')
  await page.getByRole('button', { name: 'Enviar pregunta' }).click()
  await page
    .getByRole('log')
    .getByText(/no la humedad del suelo/)
    .waitFor()
  await page.getByRole('button', { name: 'Abrir conversación de voz', exact: true }).click()
  await page.getByRole('button', { name: 'Iniciar conversación de prueba', exact: true }).click()
  await page.getByRole('status').getByText('Te escucho.', { exact: true }).waitFor()
  await page.evaluate(() =>
    window.prototypeRecognition.onresult({
      results: [[{ transcript: '¿Qué significa la humedad?' }]],
    }),
  )
  await page.getByRole('status').getByText('Tarpu está hablando.', { exact: true }).waitFor()
  await capture({ path: 'test-results/voice-conversation.png' })
  await page.evaluate(() => window.prototypeUtterance.onend())
  await page.getByRole('status').getByText('Te escucho.', { exact: true }).waitFor()
  assert.equal(await page.evaluate(() => window.prototypeStarts), 2)
  await page.getByRole('button', { name: 'Pausar conversación', exact: true }).click()
  await page.getByRole('status').getByText('Tomamos una pausa.', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Reanudar conversación', exact: true }).click()
  await page.evaluate(() => window.prototypeRecognition.onerror({ error: 'not-allowed' }))
  await page
    .getByRole('alert')
    .getByText(/No se permitió el micrófono/)
    .waitFor()
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click()
  assert.equal(await page.evaluate(() => window.prototypeRecognition.onresult), null)
  await page.getByRole('button', { name: 'Cerrar asistente', exact: true }).click()
  await page.getByRole('link', { name: 'Nueva parcela', exact: true }).click()
  const surface = page.locator('.leaflet-container')
  await surface.waitFor()
  for (const position of [
    { x: 180, y: 210 },
    { x: 330, y: 210 },
    { x: 330, y: 360 },
    { x: 180, y: 360 },
  ])
    await surface.click({ position })
  await page.getByRole('button', { name: 'Cerrar contorno', exact: true }).click()
  await page.getByLabel('Nombre de la parcela').fill('Parcela de prueba')
  await page.getByRole('button', { name: 'Guardar parcela', exact: true }).click()
  await page.getByRole('heading', { name: 'Parcela de prueba / Arequipa' }).waitFor()
  assert.ok((await page.locator('.metric-card').first().innerText()).includes('Sin dato'))
  await page.reload()
  await page.getByLabel('Parcela activa').selectOption({ label: 'Parcela de prueba' })
  await page.getByRole('heading', { name: 'Parcela de prueba / Arequipa' }).waitFor()
  for (const path of ['/app', '/app/historial', '/app/estudio-tecnico', '/app/opciones']) {
    await page.goto(`http://127.0.0.1:5174/#${path}`)
    await page.getByLabel('Parcela activa').selectOption('example-olivos')
    for (const width of [1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${path}: overflow en ${width}`,
      )
    }
  }
  await page.getByRole('button', { name: 'Cambiar a tema oscuro', exact: true }).click()
  await page.goto('http://127.0.0.1:5174/#/acceso')
  await page.getByRole('heading', { name: 'Tu campo te espera.' }).waitFor()
  await capture({ path: 'test-results/login-dark.png', fullPage: true })
  await page.goto('http://127.0.0.1:5174/#/')
  await page.getByRole('heading', { name: 'Tu campo. Una nueva perspectiva.' }).waitFor()
  await page.locator('.team-logo').scrollIntoViewIfNeeded()
  await page.waitForFunction(() =>
    [...document.querySelectorAll('.landing img')].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  )
  await capture({ path: 'test-results/landing-dark.png', fullPage: true })
  assert.deepEqual(errors, [])
  console.log(
    'OK: hero panorámico y CTA visible, registro sin guardar secretos, parcelas aisladas, historial diario/semanal/mensual, estudio y exportaciones, catálogo y comparación, proveedor sin conexión simulada, voz por turnos con reescucha/pausa/errores, persistencia y cuatro vistas en tres anchos. Vidrio fijo, capas de ejemplo aisladas, prioridad por parcela y gráficos de área/líneas/barras verificados. Sin errores JS.',
  )
} finally {
  await context.close()
  await browser.close()
}

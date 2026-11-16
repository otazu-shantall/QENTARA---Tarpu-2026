// Chrome: regresiones de parcela, tutorial, voz y cancelación. Solo proveedores simulados en la prueba.
// Asistencia de IA (Codex); entrega/uso-de-ia.md.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'

const base = process.env.TARPU_BASE_URL ?? 'http://127.0.0.1:5174/'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({
  viewport: { width: 1366, height: 768 },
  reducedMotion: 'reduce',
  locale: 'es-PE',
})
await context.addInitScript(() => {
  sessionStorage.setItem('tarpu.prototype.session', 'Prueba de regresión')
  localStorage.setItem('tarpu.prototype.selected', 'reference-majes')
  for (const key of [
    'campo',
    'historial',
    'rotacion',
    'informes',
    'estudio',
    'ayuda',
    'asistente',
    'dibujo',
  ])
    localStorage.setItem(`tarpu.tour.${key}`, '1')
  class Recognition {
    start() {
      window.__recognition = this
      this.onstart?.()
    }
    abort() {
      this.onend?.()
    }
  }
  class Utterance {
    constructor(text) {
      this.text = text
    }
  }
  Object.defineProperty(window, 'webkitSpeechRecognition', { value: Recognition })
  Object.defineProperty(window, 'SpeechRecognition', { value: Recognition })
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: Utterance })
  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      getVoices: () => [],
      speak: (audio) => {
        window.__utterance = audio
        window.__spokenCount = (window.__spokenCount ?? 0) + 1
        queueMicrotask(() => audio.onstart?.())
      },
      cancel: () => {
        window.__utterance = null
      },
    },
  })
})
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
let answers = 0,
  release,
  started
let replyGate = null
await page.route('**/api/ia/responder', async (route) => {
  answers++
  if (replyGate) {
    started?.()
    await replyGate
  }
  await route
    .fulfill({
      json: {
        data: {
          texto: `Respuesta del proveedor de prueba ${answers}.`,
          con_ia: true,
          fuente: 'Proveedor simulado en pruebas',
        },
      },
    })
    .catch(() => {})
})
await mkdir('test-results', { recursive: true })

async function bounds() {
  const rect = await page.locator('.tour-card').boundingBox()
  assert.ok(rect)
  const viewport = page.viewportSize()
  assert.ok(
    rect.x >= 0 &&
      rect.y >= 0 &&
      rect.x + rect.width <= viewport.width + 1 &&
      rect.y + rect.height <= viewport.height + 1,
    JSON.stringify({ rect, viewport }),
  )
  const actions = await page.locator('.tour-actions').boundingBox()
  assert.ok(
    actions.y >= 0 && actions.y + actions.height <= viewport.height + 1,
    'controles del tutorial visibles',
  )
}

try {
  await page.goto(base + '#/app/rotacion')
  await page.getByLabel('¿Qué cultivas ahora?').selectOption('papa')
  await page.getByLabel('¿Con qué agua cuentas?').selectOption('riego')
  await page.locator('.month-picker').getByRole('button', { name: 'Ene', exact: true }).click()
  let finishRotation, rotationStarted
  const waitRotation = new Promise((r) => {
    finishRotation = r
  })
  const began = new Promise((r) => {
    rotationStarted = r
  })
  await page.route('**/api/rotaciones', async (route) => {
    rotationStarted()
    await waitRotation
    await route
      .fulfill({
        json: {
          data: {
            cultivo_actual: 'papa',
            estrategias: [],
            no_incluidos: [],
            vacios_generales: [],
            advertencias_catalogo: [],
          },
        },
      })
      .catch(() => {})
  })
  await page.getByRole('button', { name: 'Comparar cultivos para rotar', exact: true }).click()
  await began
  await page.getByLabel('Parcela activa').selectOption('reference-cabanaconde')
  assert.equal(await page.getByLabel('¿Qué cultivas ahora?').inputValue(), '')
  assert.equal(await page.getByLabel('¿Con qué agua cuentas?').inputValue(), '')
  assert.equal(await page.locator('.month-picker [aria-pressed=true]').count(), 0)
  finishRotation()
  await page.getByRole('button', { name: 'Comparar cultivos para rotar', exact: true }).waitFor()
  assert.equal(await page.locator('.rotation-results').count(), 0)
  await page.getByLabel('Parcela activa').selectOption('reference-majes')
  await page.waitForFunction(
    () => document.querySelector('select option[value="papa"]')?.parentElement.value === 'papa',
  )
  assert.equal(await page.getByLabel('¿Qué cultivas ahora?').inputValue(), 'papa')
  assert.equal(await page.getByLabel('¿Con qué agua cuentas?').inputValue(), 'riego')
  assert.equal(await page.locator('.month-picker [aria-pressed=true]').count(), 1)

  // Misma petición para texto y voz, sin ventana de conversación adicional.
  await page.getByRole('button', { name: /Pregunta a Yachaq/ }).click()
  await page.getByLabel('Tu pregunta a Yachaq').fill('Explícame mi campo')
  await page.getByRole('button', { name: 'Enviar pregunta' }).click()
  await page
    .getByRole('log')
    .getByText('Respuesta del proveedor de prueba 1.', { exact: true })
    .waitFor()
  await page.getByRole('button', { name: 'Iniciar conversación de voz', exact: true }).click()
  await page.getByText('Te escucho…', { exact: true }).waitFor()
  assert.equal(await page.getByRole('dialog', { name: 'Conversación con Yachaq' }).count(), 0)
  await page.evaluate(() =>
    window.__recognition.onresult({ results: [[{ transcript: 'Quiero entender mi suelo' }]] }),
  )
  await page.getByRole('log').getByText('Quiero entender mi suelo', { exact: true }).waitFor()
  await page.getByText('Yachaq está hablando', { exact: true }).waitFor()
  assert.equal(
    await page.evaluate(() => window.__utterance.text),
    'Respuesta del proveedor de prueba 2.',
  )
  await page.screenshot({ path: 'test-results/chat-orbe.png' })
  await page.evaluate(() => window.__utterance.onend())
  await page.getByText('Te escucho…', { exact: true }).waitFor()
  await page
    .getByRole('button', { name: 'Detener conversación de voz', exact: true })
    .first()
    .click()

  // Detener mientras se prepara una respuesta impide que vuelva a reproducirse.
  const answerStarted = new Promise((r) => {
    started = r
  })
  replyGate = new Promise((r) => {
    release = r
  })
  await page.getByRole('button', { name: 'Iniciar conversación de voz', exact: true }).click()
  await page.evaluate(() =>
    window.__recognition.onresult({ results: [[{ transcript: 'Consulta que se cancela' }]] }),
  )
  await answerStarted
  const spokenBefore = await page.evaluate(() => window.__spokenCount)
  await page
    .getByRole('button', { name: 'Detener conversación de voz', exact: true })
    .first()
    .click()
  release()
  replyGate = null
  await page.getByText('Conversemos sobre tu campo', { exact: true }).waitFor()
  assert.equal(await page.evaluate(() => window.__spokenCount), spokenBefore)
  assert.equal(
    await page
      .getByRole('log')
      .getByText('Respuesta del proveedor de prueba 3.', { exact: true })
      .count(),
    0,
  )
  await page.getByRole('button', { name: 'Cerrar asistente', exact: true }).click()

  await page.getByRole('button', { name: 'Mi proveedor de IA', exact: true }).click()
  await page.getByRole('dialog', { name: 'Conexión de inteligencia artificial' }).waitFor()
  await page.getByRole('button', { name: 'Continue with ChatGPT' }).waitFor()
  await page.getByRole('button', { name: 'Volver al chat', exact: true }).click()

  // El problema de la captura: tutorial con el panel abierto, incluso en una ventana baja.
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1024, height: 600 },
    { width: 800, height: 500 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto(base + '#/app/informes')
    await page.evaluate(() => localStorage.removeItem('tarpu.tour.asistente'))
    await page.getByRole('button', { name: /Pregunta a Yachaq/ }).click()
    await page.getByRole('dialog', { name: 'Recorrido guiado de TARPU' }).waitFor()
    await bounds()
    await page.getByRole('button', { name: 'Siguiente', exact: true }).click()
    await bounds()
    await page.screenshot({ path: `test-results/tutorial-${viewport.width}.png` })
    await page.getByRole('button', { name: 'Terminar', exact: true }).click()
    await page.getByRole('button', { name: 'Cerrar asistente', exact: true }).click()
  }
  assert.deepEqual(errors, [])
  console.log(
    'OK: estado y respuestas aislados por parcela; tutorial visible; texto y voz unificados; orbe dentro del chat; cancelación sin audio tardío.',
  )
} catch (error) {
  await page.screenshot({ path: 'test-results/regression-error.png', fullPage: true })
  console.error(
    await page
      .locator('.yq-voice-inline')
      .innerText()
      .catch(() => ''),
  )
  console.error(errors)
  throw error
} finally {
  await browser.close()
}

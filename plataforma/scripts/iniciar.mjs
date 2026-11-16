// Arranque de TARPU con un solo comando (npm start), como en Pulse/OS:
//   1. Docker Desktop  2. Supabase local (base de datos y Storage)  3. API y trabajador en Docker
//   4. la página web (Vite) apuntando a esa API, y abre el navegador.
// Con --sin-docker: la API corre directo con Python (modo archivos) y la web apunta a ella.
// Escrito con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const SIN_DOCKER = process.argv.includes('--sin-docker')
const WEB = 'http://127.0.0.1:5174/'
const API = SIN_DOCKER ? 'http://127.0.0.1:8000' : 'http://127.0.0.1:8010'
const windows = process.platform === 'win32'
const procesos = []

const paso = (n, texto) => console.log(`\n\x1b[32m[${n}]\x1b[0m ${texto}`)
const aviso = (texto) => console.log(`    ${texto}`)
const espera = (ms) => new Promise((r) => setTimeout(r, ms))

function correr(comando, opciones = {}) {
  const r = spawnSync(comando, { cwd: RAIZ, shell: true, stdio: 'inherit', ...opciones })
  if (r.status !== 0) throw new Error(`Falló: ${comando}`)
}
function silencioso(comando) {
  return spawnSync(comando, { cwd: RAIZ, shell: true, encoding: 'utf8' })
}
async function esperarUrl(url, segundos, nombre) {
  for (let i = 0; i < segundos; i++) {
    try {
      const r = await fetch(url)
      if (r.ok) return
    } catch {}
    if (i && i % 15 === 0) aviso(`… sigo esperando ${nombre} (${i} s)`)
    await espera(1000)
  }
  throw new Error(`${nombre} no respondió en ${segundos} s (${url}).`)
}

async function docker() {
  paso(1, 'Docker Desktop')
  if (silencioso('docker info').status === 0) return aviso('ya está encendido')
  const exe = [
    join(process.env.LOCALAPPDATA ?? '', 'Programs', 'DockerDesktop', 'Docker Desktop.exe'),
    join(process.env.ProgramFiles ?? 'C:\\Program Files', 'Docker', 'Docker', 'Docker Desktop.exe'),
  ].find((ruta) => existsSync(ruta))
  if (!windows || !exe)
    throw new Error('Docker no está encendido. Ábrelo y vuelve a correr npm start.')
  aviso('encendiendo Docker Desktop…')
  spawn(exe, [], { detached: true, stdio: 'ignore' }).unref()
  for (let i = 0; i < 180; i++) {
    if (silencioso('docker info').status === 0) return aviso('listo')
    if (i && i % 15 === 0) aviso(`… Docker sigue arrancando (${i} s)`)
    await espera(1000)
  }
  throw new Error('Docker no arrancó en 3 minutos.')
}

async function supabase() {
  paso(2, 'Supabase local (Postgres + PostGIS + Storage)')
  // Recién encendido Docker, los contenedores de Supabase pueden estar «starting»: se reintenta.
  for (let intento = 1; ; intento++) {
    const r = spawnSync('npx --no-install supabase start', { cwd: RAIZ, shell: true, stdio: 'inherit' })
    if (r.status === 0) break
    if (intento === 6) throw new Error('Supabase no arrancó después de 6 intentos.')
    aviso(`Supabase todavía no está listo; reintento ${intento + 1} de 6 en 15 s…`)
    await espera(15000)
  }
  // infra/.env: la clave de servicio LOCAL de Supabase (la de demostración, no una de producción).
  const env = join(RAIZ, 'infra', '.env')
  if (!existsSync(env)) {
    const estado = silencioso('npx --no-install supabase status -o env').stdout
    const clave = /SERVICE_ROLE_KEY="?([^"\r\n]+)/.exec(estado)?.[1]
    if (!clave) throw new Error('No se pudo leer la clave local de Supabase (supabase status).')
    writeFileSync(
      env,
      `# Generado por npm start con la clave LOCAL de Supabase. Git lo ignora.\nTARPU_SUPABASE_SERVICE_KEY=${clave}\nTARPU_ACTUALIZAR_CADA_HORAS=6\n`,
    )
    aviso('se creó infra/.env con la clave local')
  }
}

async function backendDocker() {
  paso(3, 'API y trabajador en Docker (construye la imagen si cambió el código)')
  correr('docker compose -f infra/docker-compose.yml --env-file infra/.env up -d --build api trabajador')
  await esperarUrl(`${API}/api/meta`, 120, 'la API')
  aviso(`API lista en ${API} (documentación en ${API}/docs)`)
}

async function backendLocal() {
  paso(1, 'API con Python, sin Docker (modo archivos)')
  const python = join(RAIZ, 'backend', '.venv', windows ? 'Scripts/python.exe' : 'bin/python')
  if (!existsSync(python))
    throw new Error('Falta backend/.venv. Créalo: python -m venv backend/.venv y pip install -r backend/requirements.txt')
  const api = spawn(python, ['-m', 'uvicorn', 'tarpu_api.main:app', '--port', '8000'], {
    cwd: join(RAIZ, 'backend'),
    stdio: 'inherit',
  })
  procesos.push(api)
  await esperarUrl(`${API}/api/meta`, 60, 'la API')
  aviso(`API lista en ${API}`)
}

async function web() {
  paso(SIN_DOCKER ? 2 : 4, 'Página web')
  if (!existsSync(join(RAIZ, 'frontend', 'node_modules'))) {
    aviso('instalando dependencias del frontend…')
    correr('npm --prefix frontend ci')
  }
  const yaEncendida = await fetch(WEB).then((r) => r.ok).catch(() => false)
  if (yaEncendida) aviso('la web ya estaba encendida en el puerto 5174: se reutiliza')
  const vite = yaEncendida ? null : spawn('npm --prefix frontend run dev', {
    cwd: RAIZ,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, VITE_TARPU_API: API },
  })
  if (vite) procesos.push(vite)
  await esperarUrl(WEB, 60, 'la página web')
  console.log(`\n\x1b[32mTARPU está listo:\x1b[0m ${WEB}`)
  console.log(`  API: ${API}   ·   Supabase Studio: ${SIN_DOCKER ? '(sin Docker)' : 'http://127.0.0.1:55323'}`)
  console.log('  Ctrl+C cierra la web. Para apagar Docker y Supabase: npm run detener\n')
  if (!process.argv.includes('--sin-navegador'))
    spawn(windows ? `start "" "${WEB}"` : `open "${WEB}"`, { shell: true, stdio: 'ignore' })
}

process.on('SIGINT', () => {
  for (const p of procesos) p.kill()
  process.exit(0)
})

try {
  console.log(`TARPU · arranque ${SIN_DOCKER ? 'sin Docker' : 'completo (Docker + Supabase)'}`)
  if (SIN_DOCKER) await backendLocal()
  else {
    await docker()
    await supabase()
    await backendDocker()
  }
  await web()
} catch (error) {
  console.error(`\n\x1b[31mNo se pudo arrancar:\x1b[0m ${error.message}`)
  for (const p of procesos) p.kill()
  process.exit(1)
}

// Apaga lo que levanta npm start: los contenedores del backend y Supabase local (los datos se conservan).
// Escrito con asistencia de IA (Claude Code). Registro en entrega/uso-de-ia.md.
import { spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const correr = (comando) => spawnSync(comando, { cwd: RAIZ, shell: true, stdio: 'inherit' })

console.log('[1] Contenedores del backend (api, trabajador, actualizador)')
correr('docker compose -f infra/docker-compose.yml --env-file infra/.env --profile actualizador down')
console.log('[2] Supabase local (los datos quedan guardados en sus volúmenes)')
correr('npx --no-install supabase stop')
console.log('Listo. Para volver a encender todo: npm start')

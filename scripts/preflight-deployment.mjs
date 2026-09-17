import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const requiredFirebaseKeys = [
  'VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_APP_ID',
]

export function parseEnvironment(text = '') {
  const values = {}
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const index = line.indexOf('=')
    values[line.slice(0, index).trim()] = line.slice(index + 1).trim()
  }
  return values
}

export function inspectCloudEnvironment(text, exists) {
  if (!exists) return [{ level: 'BLOCK', message: '.env.local aún no existe; se creará solo al registrar la aplicación web.' }]
  const values = parseEnvironment(text)
  const results = []
  const missing = requiredFirebaseKeys.filter((key) => !values[key])
  results.push(missing.length
    ? { level: 'BLOCK', message: `Configuración web incompleta: faltan ${missing.length} variables Firebase.` }
    : { level: 'PASS', message: 'Las seis variables públicas del SDK web están presentes.' })
  results.push(values.VITE_USE_FIREBASE_EMULATORS === 'false'
    ? { level: 'PASS', message: 'El build cloud tiene emuladores desactivados.' }
    : { level: 'BLOCK', message: 'VITE_USE_FIREBASE_EMULATORS debe ser false para publicar.' })
  results.push(values.VITE_DEMO_MODE === 'false'
    ? { level: 'PASS', message: 'El modo demostración está desactivado para cloud.' }
    : { level: 'BLOCK', message: 'VITE_DEMO_MODE debe ser false para publicar.' })
  return results
}

export function inspectBuildChunks(assetDirectory, limitBytes = 500 * 1024) {
  if (!existsSync(assetDirectory)) return { level: 'BLOCK', message: 'No existe la carpeta de recursos del build web.' }
  const chunks = readdirSync(assetDirectory)
    .filter((name) => name.endsWith('.js'))
    .map((name) => ({ name, size: statSync(join(assetDirectory, name)).size }))
  if (!chunks.length) return { level: 'BLOCK', message: 'El build web no contiene paquetes JavaScript.' }
  const largest = chunks.reduce((current, chunk) => chunk.size > current.size ? chunk : current)
  const sizeKb = Math.ceil(largest.size / 1024)
  return largest.size <= limitBytes
    ? { level: 'PASS', message: `El paquete JavaScript mayor pesa ${sizeKb} kB y respeta el límite de 500 kB.` }
    : { level: 'BLOCK', message: `El paquete JavaScript ${largest.name} pesa ${sizeKb} kB y supera el límite de 500 kB.` }
}

export function inspectBuildHtml(html = '') {
  const forbiddenDevelopmentResources = [
    { pattern: /mcp\.figma\.com|html-to-design\/capture\.js/i, label: 'captura de Figma' },
    { pattern: /localhost|127\.0\.0\.1/i, label: 'referencia local' },
  ]
  const detected = forbiddenDevelopmentResources.find(({ pattern }) => pattern.test(html))
  return detected
    ? { level: 'BLOCK', message: `El build incluye una ${detected.label} que no corresponde a producción.` }
    : { level: 'PASS', message: 'El HTML de producción no incluye herramientas de captura ni referencias locales.' }
}

function checkFile(results, path, label) {
  results.push(existsSync(join(root, path))
    ? { level: 'PASS', message: `${label}: ${path}` }
    : { level: 'BLOCK', message: `Falta ${label}: ${path}` })
}

export function runPreflight() {
  const results = []
  for (const [path, label] of [
    ['firebase.json', 'configuración Firebase'], ['firestore.rules', 'reglas Firestore'],
    ['firestore.indexes.json', 'índices Firestore'], ['functions/src/index.js', 'entrada Functions'],
    ['package-lock.json', 'lockfile web'], ['functions/package-lock.json', 'lockfile Functions'],
    ['dist/index.html', 'build web'], ['.env.example', 'plantilla de ambiente'],
  ]) checkFile(results, path, label)

  results.push(inspectBuildChunks(join(root, 'dist', 'assets')))
  const buildHtmlPath = join(root, 'dist', 'index.html')
  results.push(inspectBuildHtml(existsSync(buildHtmlPath) ? readFileSync(buildHtmlPath, 'utf8') : ''))

  const nodeMajor = Number(process.versions.node.split('.')[0])
  results.push(nodeMajor >= 22
    ? { level: 'PASS', message: `Node ${process.versions.node} es compatible con Functions Node 22.` }
    : { level: 'BLOCK', message: `Node ${process.versions.node} no cumple la versión 22 requerida.` })

  try {
    const firebase = JSON.parse(readFileSync(join(root, 'firebase.json'), 'utf8'))
    const hasSpaRewrite = firebase.hosting?.rewrites?.some((item) => item.source === '**' && item.destination === '/index.html')
    results.push(hasSpaRewrite
      ? { level: 'PASS', message: 'Hosting conserva la navegación SPA mediante rewrite.' }
      : { level: 'BLOCK', message: 'Hosting no contiene el rewrite SPA requerido.' })
    results.push(firebase.firestore?.rules && firebase.firestore?.indexes && firebase.functions?.source
      ? { level: 'PASS', message: 'Rules, índices y Functions están declarados en firebase.json.' }
      : { level: 'BLOCK', message: 'firebase.json no declara todos los recursos requeridos.' })
    const globalHeaders = firebase.hosting?.headers?.find((entry) => entry.source === '**')?.headers ?? []
    const headerValues = new Map(globalHeaders.map((header) => [header.key?.toLowerCase(), header.value]))
    const expectedHeaders = new Map([
      ['x-content-type-options', 'nosniff'],
      ['referrer-policy', 'strict-origin-when-cross-origin'],
      ['x-frame-options', 'SAMEORIGIN'],
      ['permissions-policy', 'camera=(), microphone=(), geolocation=()'],
    ])
    results.push([...expectedHeaders].every(([header, value]) => headerValues.get(header) === value)
      ? { level: 'PASS', message: 'Hosting declara los cuatro encabezados de seguridad base con valores aprobados.' }
      : { level: 'BLOCK', message: 'Hosting no declara todos los encabezados de seguridad base con valores aprobados.' })
  } catch {
    results.push({ level: 'BLOCK', message: 'firebase.json no es JSON válido.' })
  }

  try {
    const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split(/\r?\n/).filter(Boolean)
    const risky = tracked.filter((path) => {
      const isEnvironmentTemplate = /(^|\/)\.env(?:\.[^/]+)*\.example$/i.test(path) || path === '.env.example'
      return !isEnvironmentTemplate && /(^|\/)(\.local|emulator-data)(\/|$)|(^|\/)\.env(\.|$)|service-account|\.(pem|key)$/i.test(path)
    })
    results.push(risky.length
      ? { level: 'BLOCK', message: `Git rastrea ${risky.length} ruta(s) sensible(s) o locales.` }
      : { level: 'PASS', message: 'Git no rastrea ambientes, emuladores, claves ni cuentas de servicio.' })
  } catch {
    results.push({ level: 'BLOCK', message: 'No fue posible inspeccionar los archivos rastreados por Git.' })
  }

  const envPath = join(root, '.env.local')
  results.push(...inspectCloudEnvironment(existsSync(envPath) ? readFileSync(envPath, 'utf8') : '', existsSync(envPath)))
  results.push(existsSync(join(root, '.firebaserc'))
    ? { level: 'PASS', message: 'Existe un alias Firebase; confirmar que corresponde al proyecto autorizado.' }
    : { level: 'BLOCK', message: 'No existe .firebaserc: ningún proyecto cloud está vinculado.' })
  results.push({ level: 'WARN', message: 'Este diagnóstico no despliega, no inicia sesión y no valida costos, región ni responsables.' })
  return results
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === resolve(process.argv[1]).toLowerCase()
if (isMain) {
  const results = runPreflight()
  console.log('CeroFallas — preflight de publicación (solo lectura)\n')
  for (const item of results) console.log(`[${item.level}] ${item.message}`)
  const counts = Object.fromEntries(['PASS', 'WARN', 'BLOCK'].map((level) => [level, results.filter((item) => item.level === level).length]))
  console.log(`\nResumen: ${counts.PASS} listos · ${counts.WARN} advertencias · ${counts.BLOCK} bloqueos`)
  if (process.argv.includes('--require-cloud') && counts.BLOCK) process.exitCode = 1
}

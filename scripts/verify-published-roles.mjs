import { readFile } from 'node:fs/promises'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, getFirestore, limit, query } from 'firebase/firestore'
import { roleDefinitions } from '../src/config/roles.js'

const expectedProjectId = 'cerofallas-pg2-german-2026'
const requestedProjectId = process.argv.find((value) => value.startsWith('--project='))?.split('=')[1]
if (requestedProjectId !== expectedProjectId) throw new Error(`Verificación bloqueada. Indica --project=${expectedProjectId}.`)

const parseEnvironment = (text) => Object.fromEntries(text.split(/\r?\n/)
  .map((line) => line.trim()).filter((line) => line && !line.startsWith('#') && line.includes('='))
  .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]))
const environment = parseEnvironment(await readFile('.env.local', 'utf8'))
if (environment.VITE_FIREBASE_PROJECT_ID !== expectedProjectId) throw new Error('El ambiente local no coincide con el proyecto autorizado.')

const accounts = JSON.parse(await readFile('.local/project-users.json', 'utf8'))
const checks = [
  ['users', 'users.read'], ['audit', 'audit.read'], ['equipment', 'equipment.read'],
  ['correctives', 'corrective.read'], ['preventivePlans', 'preventive.read'],
  ['preventiveExecutions', 'preventive.read'], ['forkliftInspections', 'forklift.read'],
  ['incidents', 'incident.read'], ['stock', 'stock.read'],
  ['riskPredictions', 'prediction.read'],
]
const routes = ['/', '/login', '/correctivos', '/preventivos', '/montacargas', '/incidentes', '/equipos', '/equipos/AIRLAY-01', '/repuestos', '/riesgo', '/analitica', '/admin/usuarios', '/admin/auditoria', '/perfil', '/ayuda']
const baseUrl = 'https://cerofallas-pg2-german-2026.web.app'

const app = initializeApp({
  apiKey: environment.VITE_FIREBASE_API_KEY,
  authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: environment.VITE_FIREBASE_PROJECT_ID,
  storageBucket: environment.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: environment.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: environment.VITE_FIREBASE_APP_ID,
}, `published-role-verification-${Date.now()}`)

let assertions = 0
try {
  const auth = getAuth(app)
  const database = getFirestore(app)
  for (const account of accounts) {
    const credential = await signInWithEmailAndPassword(auth, account.email, account.password)
    const expectedRole = roleDefinitions[account.roleId]
    if (!expectedRole) throw new Error(`Rol desconocido en catálogo local: ${account.roleId}.`)

    const profileSnapshot = await getDoc(doc(database, 'users', credential.user.uid))
    if (!profileSnapshot.exists()) throw new Error(`${account.roleId}: no puede leer su perfil cloud.`)
    const profile = profileSnapshot.data()
    if (profile.roleId !== account.roleId || profile.status !== 'active') throw new Error(`${account.roleId}: rol o estado cloud inesperado.`)
    if (JSON.stringify([...profile.permissions].sort()) !== JSON.stringify([...expectedRole.permissions].sort())) throw new Error(`${account.roleId}: permisos cloud distintos del catálogo.`)
    assertions += 3

    for (const [collectionName, permission] of checks) {
      const shouldRead = expectedRole.permissions.includes(permission)
      let didRead = false
      try {
        await getDocs(query(collection(database, collectionName), limit(1)))
        didRead = true
      } catch (error) {
        if (error?.code !== 'permission-denied') throw error
      }
      if (didRead !== shouldRead) throw new Error(`${account.roleId}: lectura ${collectionName}=${didRead}, esperado=${shouldRead}.`)
      assertions += 1
    }
    await signOut(auth)
  }

  for (const route of routes) {
    const response = await fetch(`${baseUrl}${route}`, { redirect: 'error' })
    if (response.status !== 200) throw new Error(`${route}: Hosting respondió ${response.status}.`)
    assertions += 1
  }
  const home = await fetch(baseUrl)
  const expectedHeaders = {
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'x-frame-options': 'SAMEORIGIN',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  }
  for (const [header, expected] of Object.entries(expectedHeaders)) {
    if (home.headers.get(header) !== expected) throw new Error(`Encabezado HTTPS inesperado: ${header}.`)
    assertions += 1
  }
} finally {
  await signOut(getAuth(app)).catch(() => {})
  await deleteApp(app)
}

console.log(`Aceptación publicada: ${accounts.length} cuentas, ${routes.length} rutas y ${assertions} verificaciones aprobadas.`)
console.log('Se validaron autenticación, perfiles, permisos de lectura y Hosting. No se realizaron escrituras ni se mostraron contraseñas.')

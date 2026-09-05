import { randomBytes } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { initializeApp, deleteApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'

const adminAccessPath = '.local/demo-login.txt'
const roleAccessPath = '.local/demo-role-users.json'

const users = [
  { roleId: 'support', displayName: 'Soporte de demostración', email: 'soporte.demo@cerofallas.local' },
  { roleId: 'forklift_operator', displayName: 'Montacarguista de demostración', email: 'montacarguista.demo@cerofallas.local' },
  { roleId: 'maintenance_manager', displayName: 'Jefe de mantenimiento de demostración', email: 'jefe.mantenimiento.demo@cerofallas.local' },
  { roleId: 'airlay_operator', displayName: 'Operador Airlay de demostración', email: 'airlay.demo@cerofallas.local' },
  { roleId: 'digitizer', displayName: 'Digitador de demostración', email: 'digitador.demo@cerofallas.local' },
  { roleId: 'supervisor', displayName: 'Supervisor de demostración', email: 'supervisor.demo@cerofallas.local' },
  { roleId: 'line_manager', displayName: 'Encargado de línea de demostración', email: 'encargado.linea.demo@cerofallas.local' },
  { roleId: 'production_manager', displayName: 'Jefe de producción de demostración', email: 'jefe.produccion.demo@cerofallas.local' },
  { roleId: 'management', displayName: 'Gerencia de demostración', email: 'gerencia.demo@cerofallas.local' },
]

const adminAccess = await readFile(adminAccessPath, 'utf8').catch(() => '')
const adminEmail = adminAccess.match(/^Correo:\s*(.+)$/m)?.[1]?.trim()
const adminPassword = adminAccess.match(/^Contraseña:\s*(.+)$/m)?.[1]?.trim()
if (!adminEmail || !adminPassword) throw new Error(`No se encontró un acceso administrativo válido en ${adminAccessPath}.`)

await mkdir('.local', { recursive: true })
let credentials
try {
  credentials = JSON.parse(await readFile(roleAccessPath, 'utf8'))
} catch {
  credentials = Object.fromEntries(users.map((user) => [user.roleId, {
    ...user,
    password: `${randomBytes(18).toString('base64url')}Aa1!`,
  }]))
  await writeFile(roleAccessPath, `${JSON.stringify(credentials, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
}

for (const user of users) {
  const saved = credentials[user.roleId]
  if (!saved || saved.email !== user.email || !saved.password) throw new Error(`El archivo ${roleAccessPath} no contiene credenciales válidas para ${user.roleId}.`)
}

const app = initializeApp({
  apiKey: 'demo-api-key',
  authDomain: 'demo-cerofallas.firebaseapp.com',
  projectId: 'demo-cerofallas',
  appId: 'demo-cerofallas-role-seed',
}, 'demo-role-seed')
const auth = getAuth(app)
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
const functions = getFunctions(app, 'us-central1')
connectFunctionsEmulator(functions, '127.0.0.1', 5001)

await signInWithEmailAndPassword(auth, adminEmail, adminPassword)
const createAppUser = httpsCallable(functions, 'createAppUser')
let created = 0
let existing = 0

try {
  for (const user of users) {
    try {
      await createAppUser(credentials[user.roleId])
      created += 1
    } catch (error) {
      if (error?.code === 'functions/already-exists') {
        existing += 1
        continue
      }
      throw new Error(`No se pudo preparar ${user.roleId}: ${error?.message || 'error desconocido'}`)
    }
  }
} finally {
  await signOut(auth).catch(() => {})
  await deleteApp(app)
}

console.log(`Matriz local preparada: ${created} cuentas creadas, ${existing} ya existentes.`)
console.log(`Accesos disponibles únicamente en ${roleAccessPath} (ignorado por Git).`)

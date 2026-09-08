import { readFile } from 'node:fs/promises'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, getDocs, getFirestore } from 'firebase/firestore'

const expectedProjectId = 'cerofallas-pg2-german-2026'
const requestedProjectId = process.argv.find((value) => value.startsWith('--project='))?.split('=')[1]
if (requestedProjectId !== expectedProjectId) throw new Error(`Verificación bloqueada. Indica --project=${expectedProjectId}.`)

const parseEnvironment = (text) => Object.fromEntries(text.split(/\r?\n/)
  .map((line) => line.trim()).filter((line) => line && !line.startsWith('#') && line.includes('='))
  .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]))
const environment = parseEnvironment(await readFile('.env.local', 'utf8'))
if (environment.VITE_FIREBASE_PROJECT_ID !== expectedProjectId) throw new Error('El ambiente local no coincide con el proyecto autorizado.')

const accounts = JSON.parse(await readFile('.local/project-users.json', 'utf8'))
const administrator = accounts.find(({ roleId }) => roleId === 'administrator')
if (!administrator) throw new Error('El catálogo local no contiene un administrador.')

const expectedCounts = {
  users: 11, equipment: 14, preventivePlans: 18, preventiveExecutions: 36,
  correctives: 48, incidents: 24, forkliftInspections: 30, stock: 20, audit: 84,
}
const app = initializeApp({
  apiKey: environment.VITE_FIREBASE_API_KEY,
  authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: environment.VITE_FIREBASE_PROJECT_ID,
  storageBucket: environment.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: environment.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: environment.VITE_FIREBASE_APP_ID,
}, `cloud-verification-${Date.now()}`)

try {
  const auth = getAuth(app)
  await signInWithEmailAndPassword(auth, administrator.email, administrator.password)
  const database = getFirestore(app)
  for (const [name, expected] of Object.entries(expectedCounts)) {
    const snapshot = await getDocs(collection(database, name))
    if (snapshot.size !== expected) throw new Error(`${name}: existen ${snapshot.size} registros y se esperaban ${expected}.`)
  }
  console.log(`Firebase Cloud verificado: ${Object.values(expectedCounts).reduce((sum, value) => sum + value, 0)} documentos legibles con reglas activas.`)
  console.log('Inicio de sesión administrativo correcto; no se realizaron escrituras durante esta verificación.')
  await signOut(auth)
} finally {
  await deleteApp(app)
}

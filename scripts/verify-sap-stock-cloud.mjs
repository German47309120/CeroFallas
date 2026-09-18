import { readFile } from 'node:fs/promises'
import { deleteApp, initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore'

const projectId = 'cerofallas-pg2-german-2026'
const requestedProjectId = process.argv.find((value) => value.startsWith('--project='))?.split('=')[1]
if (requestedProjectId !== projectId) throw new Error(`Verificación bloqueada. Indica --project=${projectId}.`)

const parseEnvironment = (text) => Object.fromEntries(text.split(/\r?\n/)
  .map((line) => line.trim()).filter((line) => line && !line.startsWith('#') && line.includes('='))
  .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]))
const environment = parseEnvironment(await readFile('.env.local', 'utf8'))
if (environment.VITE_FIREBASE_PROJECT_ID !== projectId) throw new Error('El ambiente local no coincide con el proyecto autorizado.')
const accounts = JSON.parse(await readFile('.local/project-users.json', 'utf8'))
const reader = accounts.find(({ roleId }) => roleId === 'administrator')
if (!reader) throw new Error('El catálogo local no contiene un lector administrativo.')

const app = initializeApp({
  apiKey: environment.VITE_FIREBASE_API_KEY,
  authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: environment.VITE_FIREBASE_PROJECT_ID,
  storageBucket: environment.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: environment.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: environment.VITE_FIREBASE_APP_ID,
}, `sap-stock-verification-${Date.now()}`)

try {
  const auth = getAuth(app)
  await signInWithEmailAndPassword(auth, reader.email, reader.password)
  const database = getFirestore(app)
  const [stockSnapshot, statusSnapshot] = await Promise.all([
    getDocs(query(collection(database, 'stock'), where('source', '==', 'sap-sqlserver'))),
    getDoc(doc(database, 'integrationStatus', 'sap-stock')),
  ])
  if (!statusSnapshot.exists()) throw new Error('No existe estado de sincronización SAP.')
  const status = statusSnapshot.data()
  if (status.status !== 'success' || status.rows !== stockSnapshot.size) throw new Error('El estado SAP no coincide con los registros publicados.')
  const warehouses = new Set(stockSnapshot.docs.map((item) => item.data().warehouse))
  if (warehouses.size !== status.warehouses) throw new Error('La cantidad de almacenes no coincide con el estado publicado.')
  if (stockSnapshot.docs.some((item) => item.data().active !== true || !item.data().code || !item.data().description)) throw new Error('Existen registros SAP incompletos o inactivos en el conjunto vigente.')
  console.log(`Stock SAP cloud verificado: ${stockSnapshot.size} registros activos en ${warehouses.size} almacenes.`)
  console.log('La lectura usó las reglas de la aplicación; no se realizaron escrituras ni se mostraron artículos o credenciales.')
  await signOut(auth)
} finally {
  await deleteApp(app)
}

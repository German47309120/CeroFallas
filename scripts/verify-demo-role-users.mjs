import { readFile } from 'node:fs/promises'
import { initializeApp, deleteApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, connectFirestoreEmulator, doc, getDoc, getDocs, getFirestore, limit, query } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'
import { roleDefinitions } from '../src/config/roles.js'

const accounts = JSON.parse(await readFile('.local/project-users.json', 'utf8'))

const checks = [
  ['users', 'users.read'],
  ['audit', 'audit.read'],
  ['equipment', 'equipment.read'],
  ['correctives', 'corrective.read'],
  ['preventivePlans', 'preventive.read'],
  ['preventiveExecutions', 'preventive.read'],
  ['forkliftInspections', 'forklift.read'],
  ['incidents', 'incident.read'],
  ['stock', 'stock.read'],
]

const app = initializeApp({
  apiKey: 'demo-api-key',
  authDomain: 'demo-cerofallas.firebaseapp.com',
  projectId: 'demo-cerofallas',
  appId: 'demo-cerofallas-role-verification',
}, 'demo-role-verification')
const auth = getAuth(app)
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
const database = getFirestore(app)
connectFirestoreEmulator(database, '127.0.0.1', 8080)
const functions = getFunctions(app, 'us-central1')
connectFunctionsEmulator(functions, '127.0.0.1', 5001)
const updateAppUser = httpsCallable(functions, 'updateAppUser')

let assertions = 0
try {
  for (const account of accounts) {
    const credential = await signInWithEmailAndPassword(auth, account.email, account.password)
    const expectedRole = roleDefinitions[account.roleId]
    if (!expectedRole) throw new Error(`Rol desconocido: ${account.roleId}`)

    const ownProfile = await getDoc(doc(database, 'users', credential.user.uid))
    if (!ownProfile.exists()) throw new Error(`${account.roleId}: no puede leer su propio perfil.`)
    const profile = ownProfile.data()
    if (profile.roleId !== account.roleId || profile.status !== 'active') throw new Error(`${account.roleId}: perfil o estado inesperado.`)
    if (JSON.stringify([...profile.permissions].sort()) !== JSON.stringify([...expectedRole.permissions].sort())) {
      throw new Error(`${account.roleId}: permisos almacenados distintos del catálogo.`)
    }
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
      if (didRead !== shouldRead) throw new Error(`${account.roleId}: acceso ${collectionName}=${didRead}, esperado=${shouldRead}.`)
      assertions += 1
    }

    if (account.roleId !== 'administrator') {
      let denied = false
      try {
        await updateAppUser({
          uid: credential.user.uid,
          displayName: profile.displayName,
          roleId: profile.roleId,
          status: profile.status,
        })
      } catch (error) {
        if (error?.code !== 'functions/permission-denied') throw error
        denied = true
      }
      if (!denied) throw new Error(`${account.roleId}: el backend permitió administración sin rol administrator.`)
      assertions += 1
    }
    await signOut(auth)
  }
} finally {
  await signOut(auth).catch(() => {})
  await deleteApp(app)
}

console.log(`Matriz verificada: ${accounts.length} cuentas, ${assertions} comprobaciones de perfil, lectura y backend.`)
console.log('Las contraseñas permanecieron en archivos locales ignorados por Git.')

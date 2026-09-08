import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { roleDefinitions } from '../src/config/roles.js'
import { records } from './seed-demo-data.mjs'
import { projectUserCatalogPath, validateProjectUsers } from './configure-project-users.mjs'

const expectedProjectId = 'cerofallas-pg2-german-2026'
const requestedProjectId = process.argv.find((value) => value.startsWith('--project='))?.split('=')[1]
const confirmation = process.argv.find((value) => value.startsWith('--confirm-project='))?.split('=')[1]

if (requestedProjectId !== expectedProjectId || confirmation !== expectedProjectId) {
  throw new Error(`Publicación bloqueada. Debes indicar --project=${expectedProjectId} y --confirm-project=${expectedProjectId}.`)
}
if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  throw new Error('Publicación cloud bloqueada porque existen variables de emulador activas.')
}

const firebaseConfig = JSON.parse(await readFile('.firebaserc', 'utf8'))
if (firebaseConfig?.projects?.default !== expectedProjectId) {
  throw new Error('El alias local no coincide con el proyecto cloud autorizado.')
}

const accounts = JSON.parse(await readFile(projectUserCatalogPath, 'utf8'))
const issues = validateProjectUsers(accounts)
if (issues.length) throw new Error(`Catálogo de usuarios inválido:\n- ${issues.join('\n- ')}`)
const environment = Object.fromEntries((await readFile('.env.local', 'utf8')).split(/\r?\n/)
  .map((line) => line.trim()).filter((line) => line && !line.startsWith('#') && line.includes('='))
  .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]))
if (environment.VITE_FIREBASE_PROJECT_ID !== expectedProjectId || !environment.VITE_FIREBASE_API_KEY) {
  throw new Error('La configuración web local no coincide con el proyecto autorizado.')
}

const requireFirebaseTools = createRequire(resolve('node_modules/firebase-tools/package.json'))
const { getAccessToken, getGlobalDefaultAccount } = requireFirebaseTools('./lib/auth.js')
const activeAccount = getGlobalDefaultAccount()
if (!activeAccount?.user?.email || !activeAccount?.tokens?.refresh_token) {
  throw new Error('Firebase CLI no tiene una cuenta activa. Ejecuta firebase login.')
}

const token = await getAccessToken(activeAccount.tokens.refresh_token, [])
if (!token?.access_token) throw new Error('Firebase CLI no entregó un token de acceso válido.')
const authorization = `Bearer ${token.access_token}`

async function requestJson(url, body, useAuthorization = true) {
  const response = await fetch(url, {
    method: 'POST', headers: {
      ...(useAuthorization ? { Authorization: authorization } : {}),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`Solicitud cloud rechazada (${response.status}): ${result?.error?.message || 'sin detalle'}`)
  return result
}

function normalizeValue(value, actorId) {
  if (value === 'demo-seed-system') return actorId
  if (Array.isArray(value)) return value.map((item) => normalizeValue(item, actorId))
  if (value?.toDate instanceof Function) return value.toDate()
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeValue(item, actorId)]))
  }
  return value
}

function firestoreValue(value) {
  if (value === null) return { nullValue: null }
  if (value instanceof Date) return { timestampValue: value.toISOString() }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue) } }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  if (typeof value === 'string') return { stringValue: value }
  if (value && typeof value === 'object') return { mapValue: { fields: firestoreFields(value) } }
  throw new Error(`Tipo de dato no compatible con Firestore: ${typeof value}`)
}

function firestoreFields(object) {
  return Object.fromEntries(Object.entries(object)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => [key, firestoreValue(value)]))
}

const identityBase = 'https://identitytoolkit.googleapis.com/v1/accounts'
const apiKey = encodeURIComponent(environment.VITE_FIREBASE_API_KEY)
const userResults = []

for (const account of accounts) {
  let user
  try {
    user = await requestJson(`${identityBase}:signUp?key=${apiKey}`, {
      email: account.email.trim().toLowerCase(), password: account.password,
      displayName: account.displayName.trim(), returnSecureToken: true,
    }, false)
  } catch (error) {
    if (!error.message.includes('EMAIL_EXISTS')) throw error
    user = await requestJson(`${identityBase}:signInWithPassword?key=${apiKey}`, {
      email: account.email.trim().toLowerCase(), password: account.password, returnSecureToken: true,
    }, false)
  }
  userResults.push({ uid: user.localId, roleId: account.roleId, account })
}

const administratorId = userResults.find(({ roleId }) => roleId === 'administrator')?.uid
if (!administratorId) throw new Error('No se pudo identificar el administrador inicial.')

const documents = userResults.map(({ uid, roleId, account }) => {
  const role = roleDefinitions[roleId]
  return {
    collectionName: 'users', id: uid,
    data: {
      displayName: account.displayName.trim(), email: account.email.trim().toLowerCase(),
      roleId, roleName: role.name, permissions: role.permissions,
      status: 'active', updatedAt: new Date(),
    },
  }
})
documents.push(...records.map((record) => ({ ...record, data: normalizeValue(record.data, administratorId) })))

const firestoreResource = `projects/${expectedProjectId}/databases/(default)/documents`
const firestoreBase = `https://firestore.googleapis.com/v1/${firestoreResource}`
for (let offset = 0; offset < documents.length; offset += 400) {
  const selected = documents.slice(offset, offset + 400)
  const result = await requestJson(`${firestoreBase}:batchWrite`, {
    labels: { source: 'cerofallas_demo_seed' },
    writes: selected.map((record) => ({
      update: {
        name: `${firestoreResource}/${encodeURIComponent(record.collectionName)}/${encodeURIComponent(record.id)}`,
        fields: firestoreFields(record.data),
      },
    })),
  })
  const failures = (result.status || []).filter((status) => status.code)
  if (failures.length) {
    throw new Error(`Firestore rechazó ${failures.length} escritura(s): ${failures[0].message || failures[0].code}`)
  }
}

console.log(`Publicación demostrativa completada en ${expectedProjectId}.`)
console.log(`${userResults.length} perfiles autenticados y ${records.length} registros demo preparados.`)
console.log('Las contraseñas permanecieron en el catálogo local ignorado por Git.')

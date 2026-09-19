import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { roleDefinitions } from '../src/config/roles.js'

const expectedProjectId = 'cerofallas-pg2-german-2026'
const requestedProjectId = process.argv.find((value) => value.startsWith('--project='))?.split('=')[1]
const confirmation = process.argv.find((value) => value.startsWith('--confirm-project='))?.split('=')[1]

if (requestedProjectId !== expectedProjectId || confirmation !== expectedProjectId) {
  throw new Error(`Sincronización bloqueada. Indica --project=${expectedProjectId} y --confirm-project=${expectedProjectId}.`)
}
if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  throw new Error('Sincronización cloud bloqueada porque existen variables de emulador activas.')
}

const firebaseConfig = JSON.parse(await readFile('.firebaserc', 'utf8'))
if (firebaseConfig?.projects?.default !== expectedProjectId) throw new Error('El alias local no coincide con el proyecto autorizado.')

const requireFirebaseTools = createRequire(resolve('node_modules/firebase-tools/package.json'))
const { getAccessToken, getGlobalDefaultAccount } = requireFirebaseTools('./lib/auth.js')
const activeAccount = getGlobalDefaultAccount()
if (!activeAccount?.user?.email || !activeAccount?.tokens?.refresh_token) throw new Error('Firebase CLI no tiene una cuenta activa.')
const token = await getAccessToken(activeAccount.tokens.refresh_token, [])
if (!token?.access_token) throw new Error('Firebase CLI no entregó un token de acceso válido.')

const headers = { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' }
const base = `https://firestore.googleapis.com/v1/projects/${expectedProjectId}/databases/(default)/documents`
const response = await fetch(`${base}/users?pageSize=1000`, { headers })
const listing = await response.json()
if (!response.ok) throw new Error(`No se pudieron consultar perfiles (${response.status}).`)

let updated = 0
for (const document of listing.documents ?? []) {
  const roleId = document.fields?.roleId?.stringValue
  const role = roleDefinitions[roleId]
  if (!role) continue
  const url = new URL(document.name.replace(/^projects\//, 'https://firestore.googleapis.com/v1/projects/'))
  for (const field of ['roleName', 'permissions', 'updatedAt']) url.searchParams.append('updateMask.fieldPaths', field)
  const patchResponse = await fetch(url, {
    method: 'PATCH', headers,
    body: JSON.stringify({ fields: {
      roleName: { stringValue: role.name },
      permissions: { arrayValue: { values: role.permissions.map((permission) => ({ stringValue: permission })) } },
      updatedAt: { timestampValue: new Date().toISOString() },
    } }),
  })
  if (!patchResponse.ok) throw new Error(`No se pudo actualizar el perfil ${roleId} (${patchResponse.status}).`)
  updated += 1
}

console.log(`Permisos sincronizados en ${updated} perfiles de ${expectedProjectId}.`)

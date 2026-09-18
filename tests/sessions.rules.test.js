import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, doc, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc, writeBatch } from 'firebase/firestore'

let environment
const projectId = 'demo-cerofallas-session-rules-test'
const future = () => Timestamp.fromMillis(Date.now() + 10 * 60 * 1000)
const session = (userId, deviceId) => ({ userId, deviceId, acquiredAt: serverTimestamp(), lastSeenAt: serverTimestamp(), expiresAt: future() })

beforeAll(async () => {
  environment = await initializeTestEnvironment({ projectId, firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') } })
})

beforeEach(async () => {
  await environment.clearFirestore()
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users', 'operator'), { status: 'active', permissions: [] })
    await setDoc(doc(context.firestore(), 'users', 'other'), { status: 'active', permissions: [] })
    await setDoc(doc(context.firestore(), 'users', 'administrator'), { status: 'active', permissions: ['audit.write'], roleId: 'administrator' })
  })
})

afterAll(async () => { await environment?.cleanup() })

it('permite crear y renovar solamente la sesión del dispositivo propietario', async () => {
  const database = environment.authenticatedContext('operator').firestore()
  const reference = doc(database, 'activeSessions', 'operator')
  await assertSucceeds(setDoc(reference, session('operator', 'device-1111111111111111')))
  await assertSucceeds(updateDoc(reference, { lastSeenAt: serverTimestamp(), expiresAt: future() }))
  await assertFails(updateDoc(reference, { deviceId: 'device-2222222222222222', acquiredAt: serverTimestamp(), lastSeenAt: serverTimestamp(), expiresAt: future() }))
})

it('impide consultar la sesión de otro usuario', async () => {
  await environment.withSecurityRulesDisabled(async (context) => setDoc(doc(context.firestore(), 'activeSessions', 'operator'), { userId: 'operator', deviceId: 'device-1111111111111111', acquiredAt: Timestamp.now(), lastSeenAt: Timestamp.now(), expiresAt: future() }))
  await assertFails(getDoc(doc(environment.authenticatedContext('other').firestore(), 'activeSessions', 'operator')))
})

it('permite al administrador liberar una sesión y registrar auditoría', async () => {
  await environment.withSecurityRulesDisabled(async (context) => setDoc(doc(context.firestore(), 'activeSessions', 'operator'), { userId: 'operator', deviceId: 'device-1111111111111111', acquiredAt: Timestamp.now(), lastSeenAt: Timestamp.now(), expiresAt: future() }))
  const database = environment.authenticatedContext('administrator').firestore()
  const batch = writeBatch(database)
  batch.delete(doc(database, 'activeSessions', 'operator'))
  batch.set(doc(collection(database, 'audit')), { occurredAt: serverTimestamp(), actorId: 'administrator', action: 'release_session', entityType: 'activeSession', entityId: 'operator' })
  await assertSucceeds(batch.commit())
})

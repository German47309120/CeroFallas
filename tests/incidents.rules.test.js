import { readFileSync } from 'node:fs'
import { beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing'
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, writeBatch, getCountFromServer, query, where } from 'firebase/firestore'

let env
beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-cerofallas-incidents-test', firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') } })
})
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    for (const [id, roleId, permissions, status] of [
      ['admin', 'administrator', ['incident.read', 'incident.create', 'incident.manage', 'audit.read', 'audit.write', 'users.read', 'stock.read'], 'active'],
      ['reporter', 'digitizer', ['incident.read', 'incident.create', 'audit.write'], 'active'],
      ['reader', 'management', ['incident.read', 'stock.read'], 'active'],
      ['disabled', 'administrator', ['incident.read', 'incident.create', 'audit.write'], 'disabled'],
    ]) await setDoc(doc(ctx.firestore(), 'users', id), { roleId, permissions, status, displayName: id })
  })
})
afterAll(async () => { await env?.cleanup() })
function data(uid, overrides = {}) {
  return { areaId: 'linea-1', areaName: 'Línea 1', equipmentId: null, equipmentSnapshot: null, description: 'Incidente de prueba controlada', priority: 'high', status: 'reported', reporterId: uid, createdBy: uid, updatedBy: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), linkedCorrectiveId: null, followUp: '', auditId: 'audit-1', ...overrides }
}
function create(uid, overrides = {}, audited = true) {
  const db = env.authenticatedContext(uid).firestore()
  const batch = writeBatch(db)
  batch.set(doc(db, 'incidents', 'report-1'), data(uid, overrides))
  if (audited) batch.set(doc(db, 'audit', 'audit-1'), { actorId: uid, occurredAt: serverTimestamp(), entityType: 'incident', entityId: 'report-1', action: 'create' })
  return batch.commit()
}
it('reportante crea un incidente auditado', () => assertSucceeds(create('reporter')))
it('rechaza creación sin auditoría atómica', () => assertFails(create('reporter', {}, false)))
it('rechaza lector, usuario desactivado y descripción inválida', async () => {
  await assertFails(create('reader'))
  await assertFails(create('disabled'))
  await assertFails(create('reporter', { description: '' }))
})
it('rechaza equipo inexistente y campos no autorizados', async () => {
  await assertFails(create('reporter', { equipmentId: 'missing' }))
  await assertFails(create('reporter', { injected: 'bad' }))
})
it('reportante no puede editar ni borrar el histórico', async () => {
  await create('reporter')
  const ref = doc(env.authenticatedContext('reporter').firestore(), 'incidents', 'report-1')
  await assertFails(updateDoc(ref, { status: 'resolved' }))
  await assertFails(deleteDoc(ref))
})
it('administrador actualiza estado con motivo y auditoría', async () => {
  await create('reporter')
  const db = env.authenticatedContext('admin').firestore()
  const batch = writeBatch(db)
  batch.update(doc(db, 'incidents', 'report-1'), { status: 'resolved', followUp: 'Atención completada', auditId: 'audit-2', updatedBy: 'admin', updatedAt: serverTimestamp() })
  batch.set(doc(db, 'audit', 'audit-2'), { actorId: 'admin', occurredAt: serverTimestamp(), entityType: 'incident', entityId: 'report-1', action: 'update' })
  await assertSucceeds(batch.commit())
})
it('conteo de incidentes abiertos usa todos los registros permitidos', async () => {
  await create('reporter')
  const db = env.authenticatedContext('reader').firestore()
  const count = await getCountFromServer(query(collection(db, 'incidents'), where('status', 'in', ['reported', 'acknowledged', 'in_progress'])))
  expect(count.data().count).toBe(1)
})
it('administrador no puede alterar autor ni actualizar sin nueva auditoría', async () => {
  await create('reporter')
  const db = env.authenticatedContext('admin').firestore()
  const ref = doc(db, 'incidents', 'report-1')
  await assertFails(updateDoc(ref, { reporterId: 'admin' }))
  await assertFails(updateDoc(ref, { status: 'resolved', followUp: 'Atendido', updatedAt: serverTimestamp(), updatedBy: 'admin' }))
  await assertFails(deleteDoc(ref))
})
it('stock es solo lectura y usuarios no permiten escalar privilegios', async () => {
  const db = env.authenticatedContext('admin').firestore()
  await assertSucceeds(getDocs(collection(db, 'users')))
  await assertSucceeds(getDocs(collection(db, 'stock')))
  await assertFails(setDoc(doc(db, 'stock', 'part'), { quantity: 10 }))
  await assertFails(updateDoc(doc(db, 'users', 'admin'), { permissions: ['everything'] }))
  await assertFails(getDocs(collection(env.authenticatedContext('reader').firestore(), 'users')))
  await assertFails(getDocs(collection(env.unauthenticatedContext().firestore(), 'incidents')))
})

import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'

const projectId = 'demo-cerofallas-rules-test'
let testEnvironment

const equipmentData = (userId) => ({
  code: 'TEST-EQ-001',
  name: 'Equipo de prueba',
  type: 'Demostración',
  areaId: 'linea-1',
  status: 'active',
  criticality: null,
  brand: null,
  model: null,
  serialNumber: null,
  notes: null,
  createdAt: serverTimestamp(),
  createdBy: userId,
  updatedAt: serverTimestamp(),
  updatedBy: userId,
})

async function createProfile(userId, permissions, status = 'active') {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users', userId), {
      displayName: `Usuario ${userId}`,
      roleId: userId,
      roleName: userId,
      status,
      permissions,
    })
  })
}

beforeAll(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})

beforeEach(async () => {
  await testEnvironment.clearFirestore()
})

afterAll(async () => {
  await testEnvironment.cleanup()
})

describe('reglas de equipos', () => {
  it('rechaza lecturas sin autenticación', async () => {
    const database = testEnvironment.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(database, 'equipment', 'test-equipment')))
  })

  it('permite consultar a un perfil activo con equipment.read', async () => {
    await createProfile('viewer', ['equipment.read'])
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'equipment', 'test-equipment'), { code: 'TEST-EQ-001' })
    })
    const database = testEnvironment.authenticatedContext('viewer').firestore()
    const result = await assertSucceeds(getDoc(doc(database, 'equipment', 'test-equipment')))
    expect(result.data().code).toBe('TEST-EQ-001')
  })

  it('rechaza a un perfil desactivado aunque conserve permisos', async () => {
    await createProfile('disabled-viewer', ['equipment.read'], 'disabled')
    const database = testEnvironment.authenticatedContext('disabled-viewer').firestore()
    await assertFails(getDoc(doc(database, 'equipment', 'TEST-EQ-001')))
  })

  it('rechaza crear equipos con un perfil de solo lectura', async () => {
    await createProfile('viewer', ['equipment.read'])
    const database = testEnvironment.authenticatedContext('viewer').firestore()
    await assertFails(setDoc(doc(database, 'equipment', 'test-equipment'), equipmentData('viewer')))
  })

  it('permite al administrador crear equipo y auditoría en una operación atómica', async () => {
    await createProfile('manager', ['equipment.read', 'equipment.manage', 'audit.write'])
    const database = testEnvironment.authenticatedContext('manager').firestore()
    const equipmentRef = doc(database, 'equipment', 'TEST-EQ-001')
    const auditRef = doc(collection(database, 'audit'))
    const batch = writeBatch(database)
    batch.set(equipmentRef, equipmentData('manager'))
    batch.set(auditRef, {
      occurredAt: serverTimestamp(),
      actorId: 'manager',
      action: 'create',
      entityType: 'equipment',
      entityId: equipmentRef.id,
    })
    await assertSucceeds(batch.commit())
  })

  it('impide eliminar físicamente un equipo incluso al administrador', async () => {
    await createProfile('manager', ['equipment.read', 'equipment.manage', 'audit.write'])
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'equipment', 'test-equipment'), { code: 'TEST-EQ-001' })
    })
    const database = testEnvironment.authenticatedContext('manager').firestore()
    await assertFails(deleteDoc(doc(database, 'equipment', 'test-equipment')))
  })
})

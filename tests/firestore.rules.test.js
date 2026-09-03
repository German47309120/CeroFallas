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
  Timestamp,
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

const correctiveData = (userId, overrides = {}) => ({
  workOrder: null,
  eventDate: '2026-09-03',
  startedAt: Timestamp.fromDate(new Date('2026-09-03T08:00:00')),
  endedAt: Timestamp.fromDate(new Date('2026-09-03T09:30:00')),
  durationMinutes: 90,
  areaId: 'linea-1',
  areaSnapshot: { id: 'linea-1', name: 'Línea 1' },
  equipmentId: 'TEST-EQ-001',
  equipmentSnapshot: { code: 'TEST-EQ-001', name: 'Equipo de prueba' },
  technicianIds: [userId],
  reportedSymptom: 'Falla de prueba',
  failureType: null,
  affectedComponent: null,
  identifiedCause: null,
  workPerformed: 'Trabajo de prueba',
  observations: null,
  status: 'completed',
  voidReason: null,
  createdAt: serverTimestamp(),
  createdBy: userId,
  updatedAt: serverTimestamp(),
  updatedBy: userId,
  ...overrides,
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

describe('reglas de correctivos', () => {
  it('permite registrar un correctivo y su auditoría al técnico autorizado', async () => {
    await createProfile('technician', ['corrective.read', 'corrective.create', 'audit.write'])
    const database = testEnvironment.authenticatedContext('technician').firestore()
    const correctiveRef = doc(collection(database, 'correctives'))
    const auditRef = doc(collection(database, 'audit'))
    const batch = writeBatch(database)
    batch.set(correctiveRef, correctiveData('technician'))
    batch.set(auditRef, { occurredAt: serverTimestamp(), actorId: 'technician', action: 'create', entityType: 'corrective', entityId: correctiveRef.id })
    await assertSucceeds(batch.commit())
  })

  it('rechaza crear correctivos a un perfil de solo lectura', async () => {
    await createProfile('corrective-viewer', ['corrective.read'])
    const database = testEnvironment.authenticatedContext('corrective-viewer').firestore()
    await assertFails(setDoc(doc(database, 'correctives', 'test-corrective'), correctiveData('corrective-viewer')))
  })

  it('rechaza duraciones inválidas', async () => {
    await createProfile('technician', ['corrective.create'])
    const database = testEnvironment.authenticatedContext('technician').firestore()
    await assertFails(setDoc(doc(database, 'correctives', 'invalid-duration'), correctiveData('technician', { durationMinutes: -10 })))
  })

  it('impide eliminar físicamente un correctivo', async () => {
    await createProfile('manager', ['corrective.read', 'corrective.create', 'corrective.manage'])
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'correctives', 'test-corrective'), correctiveData('manager'))
    })
    const database = testEnvironment.authenticatedContext('manager').firestore()
    await assertFails(deleteDoc(doc(database, 'correctives', 'test-corrective')))
  })
})

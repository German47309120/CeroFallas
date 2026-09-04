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

const preventivePlanData = (userId, overrides = {}) => ({
  equipmentId: 'TEST-EQ-001', equipmentSnapshot: { code: 'TEST-EQ-001', name: 'Equipo de prueba' },
  activityName: 'Inspección preventiva', activityDescription: null, frequencyType: 'calendar', frequencyValue: 30,
  frequencyUnit: 'day', estimatedFrequency: true, nextDueAt: Timestamp.fromDate(new Date('2026-10-03T12:00:00')),
  assignedUserIds: [], status: 'active', voidReason: null,
  createdAt: serverTimestamp(), createdBy: userId, updatedAt: serverTimestamp(), updatedBy: userId, ...overrides,
})

const preventiveExecutionData = (userId, overrides = {}) => ({
  planId: null, equipmentId: 'TEST-EQ-001', equipmentSnapshot: { code: 'TEST-EQ-001', name: 'Equipo de prueba' }, scheduledAt: null,
  startedAt: Timestamp.fromDate(new Date('2026-09-03T08:00:00')), endedAt: Timestamp.fromDate(new Date('2026-09-03T09:00:00')),
  durationMinutes: 60, technicianIds: [userId], activityPerformed: 'Inspección preventiva de prueba', spareParts: [], observations: null,
  complianceStatus: 'unscheduled', status: 'completed', createdAt: serverTimestamp(), createdBy: userId, updatedAt: serverTimestamp(), updatedBy: userId, ...overrides,
})

const forkliftInspectionData = (userId, overrides = {}) => ({
  equipmentId: 'FORKLIFT-001', equipmentSnapshot: { code: 'FORKLIFT-001', name: 'Montacargas de prueba' },
  templateId: 'forklift-daily-v1', templateVersion: 1, inspectedAt: Timestamp.fromDate(new Date('2026-09-03T06:15:00')),
  shiftId: 'shift-1', operatorId: userId, hourMeter: 1250.5,
  answers: Array.from({ length: 25 }, (_, index) => ({ itemId: `item-${index}`, label: `Punto ${index}`, critical: false, status: 'good', observation: null })),
  criticalFailures: 0, overallResult: 'fit', generalObservations: null, evidenceUrls: [], status: 'completed',
  createdAt: serverTimestamp(), createdBy: userId, ...overrides,
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
    firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') },
  })
})

beforeEach(async () => {
  await testEnvironment.clearFirestore()
})

afterAll(async () => {
  await testEnvironment?.cleanup()
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

describe('reglas de preventivos', () => {
  it('permite crear un plan estimado al planificador', async () => {
    await createProfile('planner', ['preventive.read', 'preventive.plan', 'audit.write'])
    const database = testEnvironment.authenticatedContext('planner').firestore()
    const planRef = doc(collection(database, 'preventivePlans'))
    const auditRef = doc(collection(database, 'audit'))
    const batch = writeBatch(database)
    batch.set(planRef, preventivePlanData('planner'))
    batch.set(auditRef, { occurredAt: serverTimestamp(), actorId: 'planner', action: 'create', entityType: 'preventivePlan', entityId: planRef.id })
    await assertSucceeds(batch.commit())
  })

  it('rechaza frecuencias no positivas', async () => {
    await createProfile('planner', ['preventive.plan'])
    const database = testEnvironment.authenticatedContext('planner').firestore()
    await assertFails(setDoc(doc(database, 'preventivePlans', 'invalid-plan'), preventivePlanData('planner', { frequencyValue: 0 })))
  })

  it('permite registrar una ejecución al técnico autorizado', async () => {
    await createProfile('executor', ['preventive.read', 'preventive.execute', 'audit.write'])
    const database = testEnvironment.authenticatedContext('executor').firestore()
    const executionRef = doc(collection(database, 'preventiveExecutions'))
    const auditRef = doc(collection(database, 'audit'))
    const batch = writeBatch(database)
    batch.set(executionRef, preventiveExecutionData('executor'))
    batch.set(auditRef, { occurredAt: serverTimestamp(), actorId: 'executor', action: 'create', entityType: 'preventiveExecution', entityId: executionRef.id })
    await assertSucceeds(batch.commit())
  })

  it('rechaza ejecuciones a perfiles de solo lectura', async () => {
    await createProfile('preventive-viewer', ['preventive.read'])
    const database = testEnvironment.authenticatedContext('preventive-viewer').firestore()
    await assertFails(setDoc(doc(database, 'preventiveExecutions', 'blocked'), preventiveExecutionData('preventive-viewer')))
  })

  it('impide borrar planes y ejecuciones', async () => {
    await createProfile('preventive-manager', ['preventive.read', 'preventive.manage'])
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'preventivePlans', 'plan'), preventivePlanData('preventive-manager'))
      await setDoc(doc(context.firestore(), 'preventiveExecutions', 'execution'), preventiveExecutionData('preventive-manager'))
    })
    const database = testEnvironment.authenticatedContext('preventive-manager').firestore()
    await assertFails(deleteDoc(doc(database, 'preventivePlans', 'plan')))
    await assertFails(deleteDoc(doc(database, 'preventiveExecutions', 'execution')))
  })
})

describe('reglas de checklist de montacargas', () => {
  it('permite registrar una inspección completa al montacarguista', async () => {
    await createProfile('forklift-operator', ['forklift.read', 'forklift.inspect', 'audit.write'])
    const database = testEnvironment.authenticatedContext('forklift-operator').firestore()
    const inspectionRef = doc(collection(database, 'forkliftInspections'))
    const auditRef = doc(collection(database, 'audit'))
    const batch = writeBatch(database)
    batch.set(inspectionRef, forkliftInspectionData('forklift-operator'))
    batch.set(auditRef, { occurredAt: serverTimestamp(), actorId: 'forklift-operator', action: 'create', entityType: 'forkliftInspection', entityId: inspectionRef.id })
    await assertSucceeds(batch.commit())
  })

  it('rechaza checklist incompleto o resultado crítico inconsistente', async () => {
    await createProfile('forklift-operator', ['forklift.inspect'])
    const database = testEnvironment.authenticatedContext('forklift-operator').firestore()
    await assertFails(setDoc(doc(database, 'forkliftInspections', 'incomplete'), forkliftInspectionData('forklift-operator', { answers: [] })))
    await assertFails(setDoc(doc(database, 'forkliftInspections', 'unsafe-result'), forkliftInspectionData('forklift-operator', { criticalFailures: 1, overallResult: 'fit' })))
  })

  it('impide eliminar físicamente una inspección', async () => {
    await createProfile('forklift-manager', ['forklift.read', 'forklift.manage'])
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'forkliftInspections', 'inspection'), forkliftInspectionData('forklift-manager'))
    })
    const database = testEnvironment.authenticatedContext('forklift-manager').firestore()
    await assertFails(deleteDoc(doc(database, 'forkliftInspections', 'inspection')))
  })
})

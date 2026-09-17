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
  updateDoc,
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
  eventDate: null, startedAt: serverTimestamp(), endedAt: null, durationMinutes: null, timeSource: 'server',
  areaId: 'linea-1',
  areaSnapshot: { id: 'linea-1', name: 'Línea 1' },
  equipmentId: 'TEST-EQ-001',
  equipmentSnapshot: { code: 'TEST-EQ-001', name: 'Equipo de prueba' },
  technicianIds: [userId],
  reportedSymptom: 'Falla de prueba',
  failureType: null,
  affectedComponent: null,
  identifiedCause: null,
  workPerformed: '',
  observations: null,
  status: 'in_progress',
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
  startedAt: serverTimestamp(), endedAt: null, durationMinutes: null, technicianIds: [userId], activityPerformed: '', spareParts: [], observations: null,
  complianceStatus: 'pending', status: 'in_progress', timeSource: 'server', meterReading: null, conditionResult: null,
  createdAt: serverTimestamp(), createdBy: userId, updatedAt: serverTimestamp(), updatedBy: userId, ...overrides,
  rescheduleStatus: overrides.rescheduleStatus ?? 'pending', nextDueAtAfterExecution: overrides.nextDueAtAfterExecution ?? null,
})

const forkliftInspectionData = (userId, overrides = {}) => ({
  equipmentId: 'FORKLIFT-001', equipmentSnapshot: { code: 'FORKLIFT-001', name: 'Montacargas de prueba' },
  templateId: 'forklift-daily-v1', templateVersion: 1, inspectedAt: serverTimestamp(),
  shiftId: new Date().getUTCHours() >= 12 ? 'shift-1' : 'shift-2', operatorId: userId, hourMeter: 1250.5,
  answers: Array.from({ length: 25 }, (_, index) => ({ itemId: `item-${index}`, label: `Punto ${index}`, critical: false, status: 'good', observation: null })),
  criticalFailures: 0, overallResult: 'fit', generalObservations: null, evidenceUrls: [], status: 'completed',
  createdAt: serverTimestamp(), createdBy: userId, ...overrides,
})

async function createProfile(userId, permissions, status = 'active', roleId = userId) {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users', userId), {
      displayName: `Usuario ${userId}`,
      roleId,
      roleName: roleId,
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
    await createProfile('manager', ['equipment.read', 'equipment.manage', 'audit.write'], 'active', 'administrator')
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
    await createProfile('manager', ['equipment.read', 'equipment.manage', 'audit.write'], 'active', 'administrator')
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
    const started = (await getDoc(correctiveRef)).data()
    const completionAudit = doc(collection(database, 'audit'))
    const completion = writeBatch(database)
    completion.update(correctiveRef, { eventDate: '2026-09-09', startedAt: started.startedAt, endedAt: serverTimestamp(), durationMinutes: null, timeSource: 'server', workPerformed: 'Trabajo terminado', status: 'completed', updatedAt: serverTimestamp(), updatedBy: 'technician', auditId: completionAudit.id })
    completion.set(completionAudit, { occurredAt: serverTimestamp(), actorId: 'technician', action: 'complete', entityType: 'corrective', entityId: correctiveRef.id })
    await assertSucceeds(completion.commit())
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
    await createProfile('manager', ['corrective.read', 'corrective.create', 'corrective.manage'], 'active', 'administrator')
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
    const started = (await getDoc(executionRef)).data()
    const completionAudit = doc(collection(database, 'audit'))
    const completion = writeBatch(database)
    completion.update(executionRef, { startedAt: started.startedAt, endedAt: serverTimestamp(), durationMinutes: null, timeSource: 'server', activityPerformed: 'Inspección terminada', complianceStatus: 'unscheduled', rescheduleStatus: 'not_applicable', nextDueAtAfterExecution: null, status: 'completed', updatedAt: serverTimestamp(), updatedBy: 'executor', auditId: completionAudit.id })
    completion.set(completionAudit, { occurredAt: serverTimestamp(), actorId: 'executor', action: 'complete', entityType: 'preventiveExecution', entityId: executionRef.id })
    await assertSucceeds(completion.commit())
  })

  it('exige horómetro al completar un plan por horas', async () => {
    await createProfile('hour-executor', ['preventive.read', 'preventive.execute', 'audit.write'])
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'preventivePlans', 'hours-plan'), preventivePlanData('planner', {
        frequencyType: 'hours', frequencyValue: 250, frequencyUnit: 'hour',
      }))
    })
    const database = testEnvironment.authenticatedContext('hour-executor').firestore()
    const executionRef = doc(database, 'preventiveExecutions', 'hours-execution')
    await assertSucceeds(setDoc(executionRef, preventiveExecutionData('hour-executor', { planId: 'hours-plan' })))
    const started = (await getDoc(executionRef)).data()
    const completionData = (auditId, meterReading) => ({
      startedAt: started.startedAt, endedAt: serverTimestamp(), durationMinutes: null, timeSource: 'server',
      activityPerformed: 'Lubricación por horómetro', complianceStatus: 'unscheduled',
      rescheduleStatus: 'manual_required', nextDueAtAfterExecution: null, meterReading,
      conditionResult: null, status: 'completed', updatedAt: serverTimestamp(), updatedBy: 'hour-executor', auditId,
    })
    const invalidAudit = doc(collection(database, 'audit'))
    const invalid = writeBatch(database)
    invalid.update(executionRef, completionData(invalidAudit.id, null))
    invalid.set(invalidAudit, { occurredAt: serverTimestamp(), actorId: 'hour-executor', action: 'complete', entityType: 'preventiveExecution', entityId: executionRef.id })
    await assertFails(invalid.commit())

    const validAudit = doc(collection(database, 'audit'))
    const valid = writeBatch(database)
    valid.update(executionRef, completionData(validAudit.id, 1250.5))
    valid.set(validAudit, { occurredAt: serverTimestamp(), actorId: 'hour-executor', action: 'complete', entityType: 'preventiveExecution', entityId: executionRef.id })
    await assertSucceeds(valid.commit())
  })

  it('rechaza crear como completada una ejecución con horas digitadas', async () => {
    await createProfile('executor', ['preventive.read', 'preventive.execute', 'audit.write'])
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'preventivePlans', 'calendar-plan'), preventivePlanData('planner'))
    })
    const database = testEnvironment.authenticatedContext('executor').firestore()
    const executionRef = doc(database, 'preventiveExecutions', 'calendar-execution')
    const planRef = doc(database, 'preventivePlans', 'calendar-plan')
    const nextDueAt = Timestamp.fromDate(new Date('2026-11-03T12:00:00'))
    const startedAt = Timestamp.fromDate(new Date('2026-10-03T08:00:00'))
    const batch = writeBatch(database)
    batch.set(executionRef, preventiveExecutionData('executor', {
      planId: planRef.id, scheduledAt: Timestamp.fromDate(new Date('2026-10-03T12:00:00')),
      startedAt, endedAt: Timestamp.fromDate(new Date('2026-10-03T09:00:00')),
      complianceStatus: 'on_time', rescheduleStatus: 'automatic', nextDueAtAfterExecution: nextDueAt,
    }))
    batch.update(planRef, { nextDueAt, lastExecutedAt: startedAt, lastExecutionId: executionRef.id, updatedAt: serverTimestamp(), updatedBy: 'executor' })
    for (const entityType of ['preventiveExecution', 'preventivePlan']) {
      const auditRef = doc(collection(database, 'audit'))
      batch.set(auditRef, { occurredAt: serverTimestamp(), actorId: 'executor', action: entityType === 'preventivePlan' ? 'reschedule' : 'create', entityType, entityId: entityType === 'preventivePlan' ? planRef.id : executionRef.id })
    }
    await assertFails(batch.commit())
  })

  it('rechaza que un ejecutor cambie la fecha del plan sin ejecución vinculada', async () => {
    await createProfile('executor', ['preventive.read', 'preventive.execute'])
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'preventivePlans', 'calendar-plan'), preventivePlanData('planner'))
    })
    const database = testEnvironment.authenticatedContext('executor').firestore()
    await assertFails(updateDoc(doc(database, 'preventivePlans', 'calendar-plan'), {
      nextDueAt: Timestamp.fromDate(new Date('2026-11-03T12:00:00')),
      lastExecutedAt: Timestamp.fromDate(new Date('2026-10-03T08:00:00')),
      lastExecutionId: 'missing-execution', updatedAt: serverTimestamp(), updatedBy: 'executor',
    }))
  })

  it('rechaza ejecuciones a perfiles de solo lectura', async () => {
    await createProfile('preventive-viewer', ['preventive.read'])
    const database = testEnvironment.authenticatedContext('preventive-viewer').firestore()
    await assertFails(setDoc(doc(database, 'preventiveExecutions', 'blocked'), preventiveExecutionData('preventive-viewer')))
  })

  it('impide borrar planes y ejecuciones', async () => {
    await createProfile('preventive-manager', ['preventive.read', 'preventive.manage'], 'active', 'administrator')
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'preventivePlans', 'plan'), preventivePlanData('preventive-manager'))
      await setDoc(doc(context.firestore(), 'preventiveExecutions', 'execution'), preventiveExecutionData('preventive-manager'))
    })
    const database = testEnvironment.authenticatedContext('preventive-manager').firestore()
    await assertFails(deleteDoc(doc(database, 'preventivePlans', 'plan')))
    await assertFails(deleteDoc(doc(database, 'preventiveExecutions', 'execution')))
  })
})

describe('restricción institucional de modificaciones', () => {
  it('rechaza permisos manage asignados a un rol que no sea administrador o soporte', async () => {
    const permissions = ['equipment.manage', 'corrective.manage', 'preventive.manage', 'forklift.manage']
    await createProfile('rogue-manager', permissions, 'active', 'supervisor')
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      const store = context.firestore()
      await setDoc(doc(store, 'equipment', 'TEST-EQ-001'), equipmentData('owner'))
      await setDoc(doc(store, 'correctives', 'corrective'), correctiveData('owner'))
      await setDoc(doc(store, 'preventivePlans', 'plan'), preventivePlanData('owner'))
      await setDoc(doc(store, 'preventiveExecutions', 'execution'), preventiveExecutionData('owner'))
      await setDoc(doc(store, 'forkliftInspections', 'inspection'), forkliftInspectionData('owner'))
    })
    const database = testEnvironment.authenticatedContext('rogue-manager').firestore()
    await assertFails(updateDoc(doc(database, 'equipment', 'TEST-EQ-001'), { name: 'Cambio prohibido', updatedBy: 'rogue-manager', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(doc(database, 'correctives', 'corrective'), { status: 'voided', voidReason: 'Cambio prohibido', updatedBy: 'rogue-manager', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(doc(database, 'preventivePlans', 'plan'), { status: 'paused', updatedBy: 'rogue-manager', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(doc(database, 'preventiveExecutions', 'execution'), { status: 'voided', updatedBy: 'rogue-manager', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(doc(database, 'forkliftInspections', 'inspection'), { status: 'voided' }))
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
    await createProfile('forklift-manager', ['forklift.read', 'forklift.manage'], 'active', 'support')
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'forkliftInspections', 'inspection'), forkliftInspectionData('forklift-manager'))
    })
    const database = testEnvironment.authenticatedContext('forklift-manager').firestore()
    await assertFails(deleteDoc(doc(database, 'forkliftInspections', 'inspection')))
  })
})

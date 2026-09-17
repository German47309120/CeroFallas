import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, serverTimestamp, setDoc, Timestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { roleDefinitions } from '../src/config/roles.js'

let environment
const roleEntries = Object.entries(roleDefinitions)
const startedAt = Timestamp.fromDate(new Date('2026-09-05T12:00:00Z'))
const endedAt = Timestamp.fromDate(new Date('2026-09-05T12:30:00Z'))

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'demo-cerofallas-role-write-matrix',
    firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') },
  })
})

beforeEach(async () => {
  await environment.clearFirestore()
  await environment.withSecurityRulesDisabled(async (context) => {
    const database = context.firestore()
    await Promise.all(roleEntries.map(([roleId, role]) => setDoc(doc(database, 'users', roleId), {
      displayName: role.name,
      roleId,
      roleName: role.name,
      status: 'active',
      permissions: role.permissions,
    })))
    await Promise.all([
      setDoc(doc(database, 'equipment', 'MANAGE-01'), {
        code: 'MANAGE-01', name: 'Equipo administrable', type: 'Máquina', areaId: 'linea-1', status: 'active',
        createdAt: startedAt, createdBy: 'seed', updatedAt: startedAt, updatedBy: 'seed',
      }),
      setDoc(doc(database, 'correctives', 'MANAGE-01'), {
        eventDate: startedAt, startedAt, endedAt, durationMinutes: 30,
        areaId: 'linea-1', areaSnapshot: { id: 'linea-1', name: 'Línea 1' }, equipmentId: 'MANAGE-01',
        equipmentSnapshot: { code: 'MANAGE-01', name: 'Equipo administrable' }, technicianIds: ['seed'],
        reportedSymptom: 'Registro base controlado', workPerformed: 'Trabajo controlado', status: 'completed',
        createdAt: startedAt, createdBy: 'seed', updatedAt: startedAt, updatedBy: 'seed',
      }),
      setDoc(doc(database, 'preventivePlans', 'MANAGE-01'), {
        activityName: 'Plan administrable', frequencyType: 'calendar', frequencyValue: 30,
        estimatedFrequency: true, status: 'active', equipmentId: 'MANAGE-01', areaId: 'linea-1',
        createdAt: startedAt, createdBy: 'seed', updatedAt: startedAt, updatedBy: 'seed',
      }),
      setDoc(doc(database, 'preventiveExecutions', 'MANAGE-01'), {
        planId: null, equipmentId: 'MANAGE-01', areaId: 'linea-1', startedAt, endedAt, durationMinutes: 30,
        technicianIds: ['seed'], status: 'completed', complianceStatus: 'unscheduled',
        rescheduleStatus: 'not_applicable', nextDueAtAfterExecution: null,
        createdAt: startedAt, createdBy: 'seed', updatedAt: startedAt, updatedBy: 'seed',
      }),
      ...roleEntries.map(([roleId]) => setDoc(doc(database, 'preventiveExecutions', `MANAGE-${roleId}`), {
        planId: null, equipmentId: 'MANAGE-01', areaId: 'linea-1', startedAt, endedAt, durationMinutes: 30,
        technicianIds: ['seed'], status: 'completed', complianceStatus: 'unscheduled',
        rescheduleStatus: 'not_applicable', nextDueAtAfterExecution: null,
        createdAt: startedAt, createdBy: 'seed', updatedAt: startedAt, updatedBy: 'seed',
      })),
      setDoc(doc(database, 'forkliftInspections', 'MANAGE-01'), {
        templateId: 'forklift-daily-v1', templateVersion: 1, shiftId: 'shift-1', hourMeter: 100,
        answers: Array.from({ length: 25 }, (_, index) => ({ itemId: `item-${index + 1}`, status: 'ok', note: '' })),
        criticalFailures: 0, overallResult: 'fit', status: 'completed', operatorId: 'seed',
        equipmentId: 'MANAGE-01', areaId: 'abastecimiento', createdAt: startedAt, createdBy: 'seed',
      }),
      ...roleEntries.map(([roleId]) => setDoc(doc(database, 'forkliftInspections', `MANAGE-${roleId}`), {
        templateId: 'forklift-daily-v1', templateVersion: 1, shiftId: 'shift-1', hourMeter: 100,
        answers: Array.from({ length: 25 }, (_, index) => ({ itemId: `item-${index + 1}`, status: 'ok', note: '' })),
        criticalFailures: 0, overallResult: 'fit', status: 'completed', operatorId: 'seed',
        equipmentId: 'MANAGE-01', areaId: 'abastecimiento', createdAt: startedAt, createdBy: 'seed',
      })),
      setDoc(doc(database, 'incidents', 'MANAGE-01'), {
        areaId: 'linea-1', areaName: 'Línea 1', equipmentId: null, equipmentSnapshot: null,
        description: 'Incidente base para administrar de forma controlada', priority: 'medium', status: 'reported',
        reporterId: 'seed', createdBy: 'seed', createdAt: startedAt, updatedBy: 'seed', updatedAt: startedAt,
        linkedCorrectiveId: null, followUp: '', auditId: 'audit-seed',
      }),
    ])
  })
})

afterAll(async () => { await environment?.cleanup() })

async function expectByPermission(roleId, permission, operation) {
  const result = operation(environment.authenticatedContext(roleId).firestore(), roleId)
  if (roleDefinitions[roleId].permissions.includes(permission)) await assertSucceeds(result)
  else await assertFails(result)
}

const operations = {
  equipment: {
    permission: 'equipment.manage',
    write: (database, roleId) => {
      const code = `EQ-${roleEntries.findIndex(([id]) => id === roleId) + 1}`
      return setDoc(doc(database, 'equipment', code), {
        code, name: `Equipo ${roleId}`, type: 'Máquina industrial', areaId: 'linea-1', status: 'active',
        createdAt: serverTimestamp(), createdBy: roleId, updatedAt: serverTimestamp(), updatedBy: roleId,
      })
    },
  },
  corrective: {
    permission: 'corrective.create',
    write: (database, roleId) => setDoc(doc(database, 'correctives', `corrective-${roleId}`), {
      eventDate: null, startedAt: serverTimestamp(), endedAt: null, durationMinutes: null, timeSource: 'server',
      areaId: 'linea-1', areaSnapshot: { id: 'linea-1', name: 'Línea 1' },
      equipmentId: 'TEST-01', equipmentSnapshot: { code: 'TEST-01', name: 'Equipo de prueba' },
      technicianIds: [roleId], reportedSymptom: 'Prueba controlada de autorización',
      workPerformed: '', status: 'in_progress',
      createdAt: serverTimestamp(), createdBy: roleId, updatedAt: serverTimestamp(), updatedBy: roleId,
    }),
  },
  preventivePlan: {
    permission: 'preventive.plan',
    write: (database, roleId) => setDoc(doc(database, 'preventivePlans', `plan-${roleId}`), {
      activityName: 'Plan controlado de autorización', frequencyType: 'condition', frequencyValue: null,
      estimatedFrequency: true, status: 'active', equipmentId: 'TEST-01', areaId: 'linea-1',
      createdAt: serverTimestamp(), createdBy: roleId, updatedAt: serverTimestamp(), updatedBy: roleId,
    }),
  },
  preventiveExecution: {
    permission: 'preventive.execute',
    write: (database, roleId) => setDoc(doc(database, 'preventiveExecutions', `execution-${roleId}`), {
      planId: null, equipmentId: 'TEST-01', areaId: 'linea-1', startedAt: serverTimestamp(), endedAt: null, durationMinutes: null,
      technicianIds: [roleId], status: 'in_progress', complianceStatus: 'pending', timeSource: 'server',
      rescheduleStatus: 'pending', nextDueAtAfterExecution: null, meterReading: null, conditionResult: null,
      createdAt: serverTimestamp(), createdBy: roleId, updatedAt: serverTimestamp(), updatedBy: roleId,
    }),
  },
  forkliftInspection: {
    permission: 'forklift.inspect',
    write: (database, roleId) => setDoc(doc(database, 'forkliftInspections', `inspection-${roleId}`), {
      templateId: 'forklift-daily-v1', templateVersion: 1, inspectedAt: serverTimestamp(), shiftId: new Date().getUTCHours() >= 12 ? 'shift-1' : 'shift-2', hourMeter: 100,
      answers: Array.from({ length: 25 }, (_, index) => ({ itemId: `item-${index + 1}`, status: 'ok', note: '' })),
      criticalFailures: 0, overallResult: 'fit', status: 'completed', operatorId: roleId,
      equipmentId: 'TEST-01', areaId: 'abastecimiento', createdAt: serverTimestamp(), createdBy: roleId,
    }),
  },
  incident: {
    permission: 'incident.create',
    write: (database, roleId) => {
      const incidentId = `incident-${roleId}`
      const auditId = `audit-${roleId}`
      const batch = writeBatch(database)
      batch.set(doc(database, 'audit', auditId), {
        actorId: roleId, action: 'incident.created', entityType: 'incident', entityId: incidentId,
        occurredAt: serverTimestamp(),
      })
      batch.set(doc(database, 'incidents', incidentId), {
        areaId: 'linea-1', areaName: 'Línea 1', equipmentId: null, equipmentSnapshot: null,
        description: 'Incidente de prueba controlada para validar autorización', priority: 'medium', status: 'reported',
        reporterId: roleId, createdBy: roleId, createdAt: serverTimestamp(), updatedBy: roleId,
        updatedAt: serverTimestamp(), linkedCorrectiveId: null, followUp: '', auditId,
      })
      return batch.commit()
    },
  },
  equipmentManagement: {
    permission: 'equipment.manage',
    write: (database, roleId) => updateDoc(doc(database, 'equipment', 'MANAGE-01'), {
      name: `Equipo revisado por ${roleId}`, updatedAt: serverTimestamp(), updatedBy: roleId,
    }),
  },
  correctiveManagement: {
    permission: 'corrective.manage',
    write: (database, roleId) => updateDoc(doc(database, 'correctives', 'MANAGE-01'), {
      workPerformed: `Revisión controlada por ${roleId}`, updatedAt: serverTimestamp(), updatedBy: roleId,
    }),
  },
  preventivePlanManagement: {
    permission: 'preventive.manage',
    write: (database, roleId) => updateDoc(doc(database, 'preventivePlans', 'MANAGE-01'), {
      status: 'paused', updatedAt: serverTimestamp(), updatedBy: roleId,
    }),
  },
  preventiveExecutionManagement: {
    permission: 'preventive.manage',
    write: (database, roleId) => {
      const executionId = `MANAGE-${roleId}`
      const auditId = `audit-execution-${roleId}`
      const batch = writeBatch(database)
      batch.set(doc(database, 'audit', auditId), {
        actorId: roleId, action: 'void', entityType: 'preventiveExecution', entityId: executionId,
        occurredAt: serverTimestamp(),
      })
      batch.update(doc(database, 'preventiveExecutions', executionId), {
        status: 'voided', voidReason: `Anulación controlada por ${roleId}`,
        updatedAt: serverTimestamp(), updatedBy: roleId, auditId,
      })
      return batch.commit()
    },
  },
  forkliftManagement: {
    permission: 'forklift.manage',
    write: (database, roleId) => {
      const inspectionId = `MANAGE-${roleId}`
      const auditId = `audit-inspection-${roleId}`
      const batch = writeBatch(database)
      batch.set(doc(database, 'audit', auditId), {
        actorId: roleId, action: 'void', entityType: 'forkliftInspection', entityId: inspectionId,
        occurredAt: serverTimestamp(),
      })
      batch.update(doc(database, 'forkliftInspections', inspectionId), {
        status: 'voided', voidReason: `Anulación controlada por ${roleId}`,
        updatedAt: serverTimestamp(), updatedBy: roleId, auditId,
      })
      return batch.commit()
    },
  },
  incidentManagement: {
    permission: 'incident.manage',
    write: (database, roleId) => {
      const auditId = `audit-manage-${roleId}`
      const batch = writeBatch(database)
      batch.set(doc(database, 'audit', auditId), {
        actorId: roleId, action: 'incident.updated', entityType: 'incident', entityId: 'MANAGE-01',
        occurredAt: serverTimestamp(),
      })
      batch.update(doc(database, 'incidents', 'MANAGE-01'), {
        status: 'acknowledged', followUp: `Seguimiento controlado por ${roleId}`, linkedCorrectiveId: null,
        updatedAt: serverTimestamp(), updatedBy: roleId, auditId,
      })
      return batch.commit()
    },
  },
}

describe('matriz institucional de escritura por rol', () => {
  for (const [operationName, operation] of Object.entries(operations)) {
    it(`${operationName}: permite y bloquea exactamente según el catálogo`, async () => {
      for (const [roleId] of roleEntries) {
        await expectByPermission(roleId, operation.permission, operation.write)
      }
      expect(roleEntries).toHaveLength(11)
    }, 20_000)
  }
})

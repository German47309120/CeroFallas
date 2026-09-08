import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, doc, getDoc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore'

let database
vi.mock('../src/services/firebase/firestore.js', () => ({ getFirebaseFirestore: () => database }))
import { voidPreventiveExecution } from '../src/services/firebase/preventives.js'

let environment
const scheduledAt = Timestamp.fromDate(new Date('2026-09-05T18:00:00Z'))
const startedAt = Timestamp.fromDate(new Date('2026-09-06T12:00:00Z'))
const endedAt = Timestamp.fromDate(new Date('2026-09-06T12:45:00Z'))
const nextDueAt = Timestamp.fromDate(new Date('2026-10-06T18:00:00Z'))

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'demo-cerofallas-preventive-void',
    firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') },
  })
})

beforeEach(async () => {
  await environment.clearFirestore()
  await environment.withSecurityRulesDisabled(async (context) => {
    const store = context.firestore()
    await setDoc(doc(store, 'users', 'support'), {
      status: 'active', roleId: 'support', permissions: ['preventive.read', 'preventive.manage', 'audit.read', 'audit.write'],
    })
    await setDoc(doc(store, 'preventivePlans', 'plan-1'), {
      equipmentId: 'AIRLAY-01', activityName: 'Inspección Airlay', frequencyType: 'calendar', frequencyValue: 30,
      frequencyUnit: 'day', estimatedFrequency: true, status: 'active', nextDueAt,
      lastExecutionId: 'execution-1', lastExecutedAt: startedAt,
      createdAt: scheduledAt, createdBy: 'planner', updatedAt: startedAt, updatedBy: 'technician',
    })
    await setDoc(doc(store, 'preventiveExecutions', 'execution-1'), {
      planId: 'plan-1', equipmentId: 'AIRLAY-01', equipmentSnapshot: { code: 'AIRLAY-01', name: 'Airlay 1' },
      scheduledAt, startedAt, endedAt, durationMinutes: 45, technicianIds: ['technician'],
      activityPerformed: 'Inspección preventiva', spareParts: [], observations: null,
      complianceStatus: 'late', rescheduleStatus: 'automatic', nextDueAtAfterExecution: nextDueAt,
      status: 'completed', createdAt: startedAt, createdBy: 'technician', updatedAt: startedAt, updatedBy: 'technician',
    })
  })
  database = environment.authenticatedContext('support').firestore()
})

afterAll(async () => { await environment?.cleanup() })

describe('anulación auditada de ejecución preventiva', () => {
  it('anula la última ejecución y restaura la fecha programada del plan', async () => {
    await voidPreventiveExecution('execution-1', 'Ejecución duplicada durante la digitación', 'support')

    const execution = (await getDoc(doc(database, 'preventiveExecutions', 'execution-1'))).data()
    expect(execution.status).toBe('voided')
    expect(execution.voidReason).toBe('Ejecución duplicada durante la digitación')
    expect(execution.createdBy).toBe('technician')

    const plan = (await getDoc(doc(database, 'preventivePlans', 'plan-1'))).data()
    expect(plan.nextDueAt.toMillis()).toBe(scheduledAt.toMillis())
    expect(plan.lastExecutionId).toBeNull()
    expect(plan.lastExecutedAt).toBeNull()

    const audit = await getDocs(query(collection(database, 'audit'), where('entityId', 'in', ['execution-1', 'plan-1'])))
    expect(audit.size).toBe(2)
    expect(audit.docs.map((item) => item.data().action).sort()).toEqual(['reschedule_reverted', 'void'])
  })

  it('no modifica el plan cuando ya existe una ejecución posterior', async () => {
    await environment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'preventivePlans', 'plan-1'), { lastExecutionId: 'execution-posterior' }, { merge: true })
    })
    await voidPreventiveExecution('execution-1', 'Corrección de ejecución histórica duplicada', 'support')
    const plan = (await getDoc(doc(database, 'preventivePlans', 'plan-1'))).data()
    expect(plan.nextDueAt.toMillis()).toBe(nextDueAt.toMillis())
    expect(plan.lastExecutionId).toBe('execution-posterior')
  })
})

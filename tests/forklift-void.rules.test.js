import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, doc, getDoc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore'

let database
vi.mock('../src/services/firebase/firestore.js', () => ({ getFirebaseFirestore: () => database }))
import { voidForkliftInspection } from '../src/services/firebase/forkliftInspections.js'

let environment
const createdAt = Timestamp.fromDate(new Date('2026-09-06T12:00:00Z'))

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'demo-cerofallas-forklift-void',
    firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') },
  })
})

beforeEach(async () => {
  await environment.clearFirestore()
  await environment.withSecurityRulesDisabled(async (context) => {
    const store = context.firestore()
    await setDoc(doc(store, 'users', 'support'), {
      status: 'active', roleId: 'support', permissions: ['forklift.read', 'forklift.manage', 'audit.read', 'audit.write'],
    })
    await setDoc(doc(store, 'users', 'rogue'), {
      status: 'active', roleId: 'supervisor', permissions: ['forklift.read', 'forklift.manage', 'audit.read', 'audit.write'],
    })
    await setDoc(doc(store, 'forkliftInspections', 'inspection-1'), {
      templateId: 'forklift-daily-v1', templateVersion: 1, shiftId: 'shift-1', hourMeter: 125,
      answers: Array.from({ length: 25 }, (_, index) => ({ itemId: `item-${index + 1}`, status: 'ok' })),
      criticalFailures: 0, overallResult: 'fit', status: 'completed', operatorId: 'operator',
      equipmentId: 'MONT-01', equipmentSnapshot: { code: 'MONT-01', name: 'Montacargas 1' },
      inspectedAt: createdAt, createdAt, createdBy: 'operator',
    })
  })
})

afterAll(async () => { await environment?.cleanup() })

describe('anulación auditada de checklist', () => {
  it('el servicio conserva la inspección y crea auditoría atómica', async () => {
    database = environment.authenticatedContext('support').firestore()
    await voidForkliftInspection('inspection-1', 'Registro duplicado durante la demostración', 'support')

    const inspection = (await getDoc(doc(database, 'forkliftInspections', 'inspection-1'))).data()
    expect(inspection.status).toBe('voided')
    expect(inspection.voidReason).toBe('Registro duplicado durante la demostración')
    expect(inspection.createdBy).toBe('operator')
    const audit = await getDocs(query(collection(database, 'audit'), where('entityId', '==', 'inspection-1')))
    expect(audit.size).toBe(1)
    expect(audit.docs[0].data()).toMatchObject({ actorId: 'support', action: 'void', entityType: 'forkliftInspection' })
  })

  it('rechaza el mismo permiso si el rol no es administrador o soporte', async () => {
    database = environment.authenticatedContext('rogue').firestore()
    await expect(voidForkliftInspection('inspection-1', 'Intento de modificación sin rol institucional', 'rogue'))
      .rejects.toMatchObject({ code: 'permission-denied' })
  })
})

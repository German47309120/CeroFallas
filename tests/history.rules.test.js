import { readFileSync } from 'node:fs'
import { beforeAll, beforeEach, afterAll, expect, it, vi } from 'vitest'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
let db
vi.mock('../src/services/firebase/firestore.js', () => ({ getFirebaseFirestore: () => db }))
import { readHistory } from '../src/services/firebase/history.js'
import { listEquipment } from '../src/services/firebase/equipment.js'
import { listPreventivePlans } from '../src/services/firebase/preventives.js'
const sources = { incidents: 'createdAt', audit: 'occurredAt', stock: 'syncedAt', users: 'displayName', forkliftInspections: 'inspectedAt', preventivePlans: 'nextDueAt', preventiveExecutions: 'startedAt', equipment: 'code' }
let env
beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-cerofallas-multi-history-test', firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') } })
})
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    const store = ctx.firestore()
    await setDoc(doc(store, 'users', 'reader'), { status: 'active', permissions: ['incident.read', 'audit.read', 'stock.read', 'users.read', 'forklift.read', 'preventive.read', 'equipment.read'] })
    await setDoc(doc(store, 'users', 'blocked'), { status: 'active', permissions: [] })
    await Promise.all(Object.entries(sources).flatMap(([name, field]) => Array.from({ length: 7 }, (_, n) => setDoc(doc(store, name, `row-${n}`), { [field]: ['displayName', 'code'].includes(field) ? 'Igual' : Timestamp.fromMillis(1000000), equipmentId: n % 2 ? 'EQ-B' : 'EQ-A', areaId: n % 2 ? 'linea-2' : 'linea-1', status: name === 'equipment' ? (n < 4 ? 'active' : 'inactive') : (n < 4 ? 'reported' : 'resolved') }))))
  })
  db = env.authenticatedContext('reader').firestore()
})
afterAll(async () => { await env?.cleanup() })
it.each(Object.keys(sources))('recorre %s con fechas/nombres iguales sin duplicados', async (resource) => {
  const ids = []
  let cursor = null
  let page
  do {
    page = await readHistory(resource, { cursor, pageSize: 3 })
    ids.push(...page.records.map((r) => r.id))
    cursor = page.cursor
  } while (page.hasMore)
  expect(ids).toHaveLength(7)
  expect(new Set(ids).size).toBe(7)
  expect(ids).toEqual(['preventivePlans', 'equipment'].includes(resource) ? ['row-0', 'row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6'] : ['row-6', 'row-5', 'row-4', 'row-3', 'row-2', 'row-1', 'row-0'])
})
it('filtra estado de equipos antes de paginar', async () => {
  const result = await readHistory('equipment', { status: 'active', pageSize: 2 })
  expect(result.records.map((row) => row.id)).toEqual(['row-0', 'row-1'])
  expect(result.hasMore).toBe(true)
})
it('el selector recorre automáticamente más de 100 equipos', async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await Promise.all(Array.from({ length: 105 }, (_, n) => setDoc(doc(ctx.firestore(), 'equipment', `extra-${String(n).padStart(3, '0')}`), { code: `EXTRA-${String(n).padStart(3, '0')}`, status: 'active' })))
  })
  const records = await listEquipment()
  expect(records).toHaveLength(112)
  expect(new Set(records.map((row) => row.id)).size).toBe(112)
})
it('el selector de ejecución recorre automáticamente más de 100 planes', async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await Promise.all(Array.from({ length: 105 }, (_, n) => setDoc(doc(ctx.firestore(), 'preventivePlans', `extra-${String(n).padStart(3, '0')}`), { nextDueAt: Timestamp.fromMillis(2000000 + n), status: 'active' })))
  })
  const records = await listPreventivePlans()
  expect(records).toHaveLength(112)
  expect(new Set(records.map((row) => row.id)).size).toBe(112)
})
it('filtra estado antes de paginar incidentes', async () => {
  const first = await readHistory('incidents', { status: 'reported', pageSize: 2 })
  const last = await readHistory('incidents', { status: 'reported', pageSize: 2, cursor: first.cursor })
  expect(first.records.map((r) => r.id)).toEqual(['row-3', 'row-2'])
  expect(first.hasMore).toBe(true)
  expect(last.records.map((r) => r.id)).toEqual(['row-1', 'row-0'])
  expect(last.hasMore).toBe(false)
})
it('filtra el día completo de Guatemala antes de paginar', async () => {
  const included = await readHistory('incidents', { fromDate: '1969-12-31', toDate: '1969-12-31', pageSize: 3 })
  const excluded = await readHistory('incidents', { fromDate: '1970-01-01', toDate: '1970-01-01' })
  expect(included.records).toHaveLength(3)
  expect(included.hasMore).toBe(true)
  expect(excluded.records).toHaveLength(0)
})
it('combina área, estado y fecha en incidentes antes de paginar', async () => {
  const page = await readHistory('incidents', { status: 'reported', areaId: 'linea-1', fromDate: '1969-12-31', toDate: '1969-12-31', pageSize: 1 })
  expect(page.records.map((row) => row.id)).toEqual(['row-2'])
  expect(page.hasMore).toBe(true)
})
it('combina equipo, estado y fecha en incidentes antes de paginar', async () => {
  const page = await readHistory('incidents', { status: 'reported', equipmentId: 'EQ-A', fromDate: '1969-12-31', toDate: '1969-12-31', pageSize: 1 })
  expect(page.records.map((row) => row.id)).toEqual(['row-2'])
  expect(page.hasMore).toBe(true)
})
it('devuelve vacío para un estado sin registros', async () => {
  expect(await readHistory('incidents', { status: 'voided' })).toEqual({ records: [], cursor: null, hasMore: false })
})
it('rechaza cada fuente sin permiso de lectura', async () => {
  db = env.authenticatedContext('blocked').firestore()
  for (const resource of Object.keys(sources)) await expect(readHistory(resource)).rejects.toMatchObject({ code: 'permission-denied' })
})
it('rechaza fuentes y filtros no admitidos', async () => {
  await expect(readHistory('secret')).rejects.toThrow('Histórico no permitido')
  await expect(readHistory('audit', { status: 'reported' })).rejects.toThrow('Estado inválido')
  await expect(readHistory('incidents', { pageSize: 0 })).rejects.toThrow('Tamaño de página inválido')
})

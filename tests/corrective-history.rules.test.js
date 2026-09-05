import { readFileSync } from 'node:fs'
import { beforeAll, beforeEach, afterAll, expect, it, vi } from 'vitest'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
let db
vi.mock('../src/services/firebase/firestore.js', () => ({ getFirebaseFirestore: () => db }))
import { readCorrectiveHistory } from '../src/services/firebase/correctiveHistory.js'
let env
beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-cerofallas-history-test', firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') } })
})
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    const store = ctx.firestore()
    await setDoc(doc(store, 'users', 'reader'), { status: 'active', permissions: ['corrective.read'] })
    await setDoc(doc(store, 'users', 'blocked'), { status: 'active', permissions: [] })
    for (let n = 0; n < 61; n++) await setDoc(doc(store, 'correctives', `record-${String(n).padStart(3, '0')}`), {
      // Fechas iguales intencionalmente para comprobar desempate por ID.
      startedAt: Timestamp.fromMillis(1000000), equipmentId: n % 2 ? 'EQ-B' : 'EQ-A', areaId: n % 2 ? 'linea-2' : 'linea-1', status: n < 58 ? 'completed' : 'voided',
    })
  })
  db = env.authenticatedContext('reader').firestore()
})
afterAll(async () => { await env?.cleanup() })
it('recorre más de 50 registros, sin duplicados ni omisiones con fechas iguales', async () => {
  const ids = []
  let cursor = null
  let page
  do {
    page = await readCorrectiveHistory({ cursor })
    ids.push(...page.records.map((r) => r.id))
    cursor = page.cursor
  } while (page.hasMore)
  expect(ids).toHaveLength(61)
  expect(new Set(ids).size).toBe(61)
  expect(ids[0]).toBe('record-060')
  expect(ids.at(-1)).toBe('record-000')
})
it('aplica estado en servidor antes de limitar la página', async () => {
  const page = await readCorrectiveHistory({ status: 'completed', pageSize: 2 })
  expect(page.records.map((r) => r.id)).toEqual(['record-057', 'record-056'])
  expect(page.hasMore).toBe(true)
})
it('aplica rango diario de Guatemala en servidor', async () => {
  const included = await readCorrectiveHistory({ fromDate: '1969-12-31', toDate: '1969-12-31', pageSize: 2 })
  const excluded = await readCorrectiveHistory({ fromDate: '1970-01-01', toDate: '1970-01-01' })
  expect(included.records).toHaveLength(2)
  expect(included.hasMore).toBe(true)
  expect(excluded.records).toHaveLength(0)
})
it('combina estado, área y fecha en correctivos antes de paginar', async () => {
  const page = await readCorrectiveHistory({ status: 'completed', areaId: 'linea-1', fromDate: '1969-12-31', toDate: '1969-12-31', pageSize: 2 })
  expect(page.records.map((row) => row.id)).toEqual(['record-056', 'record-054'])
  expect(page.hasMore).toBe(true)
})
it('combina estado, equipo y fecha en correctivos antes de paginar', async () => {
  const page = await readCorrectiveHistory({ status: 'completed', equipmentId: 'EQ-A', fromDate: '1969-12-31', toDate: '1969-12-31', pageSize: 2 })
  expect(page.records.map((row) => row.id)).toEqual(['record-056', 'record-054'])
  expect(page.hasMore).toBe(true)
})
it('no anuncia otra página cuando el total es múltiplo del tamaño', async () => {
  const page = await readCorrectiveHistory({ status: 'voided', pageSize: 3 })
  expect(page.records).toHaveLength(3)
  expect(page.hasMore).toBe(false)
})
it('devuelve una página vacía sin cursor para un estado sin registros', async () => {
  expect(await readCorrectiveHistory({ status: 'draft' })).toEqual({ records: [], cursor: null, hasMore: false })
})
it('respeta el rechazo de lectura de Firestore', async () => {
  db = env.authenticatedContext('blocked').firestore()
  await expect(readCorrectiveHistory()).rejects.toMatchObject({ code: 'permission-denied' })
})
it('rechaza estados y tamaños inválidos', async () => {
  await expect(readCorrectiveHistory({ status: 'inventado' })).rejects.toThrow('Estado inválido')
  for (const pageSize of [0, 101, 1.5]) await expect(readCorrectiveHistory({ pageSize })).rejects.toThrow('Tamaño de página inválido')
})

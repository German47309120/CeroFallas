import { readFileSync } from 'node:fs'
import { beforeAll, beforeEach, afterAll, expect, it, vi } from 'vitest'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, setDoc, Timestamp } from 'firebase/firestore'

let db
vi.mock('../src/services/firebase/firestore.js', () => ({ getFirebaseFirestore: () => db }))
import { loadDashboardSource } from '../src/services/firebase/dashboard.js'

let env
const cutoff = new Date('2026-09-03T18:00:00Z')
const stamp = (offset) => Timestamp.fromMillis(cutoff.getTime() + offset)
beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-cerofallas-dashboard-test', firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') } })
})
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    const store = ctx.firestore()
    await setDoc(doc(store, 'users', 'reader'), { status: 'active', permissions: ['dashboard.read', 'preventive.read', 'incident.read', 'corrective.read'] })
    await setDoc(doc(store, 'users', 'manager'), { status: 'active', permissions: ['dashboard.read'] })
    for (let n = 1; n <= 7; n++) {
      await setDoc(doc(store, 'preventivePlans', `past-${n}`), { status: 'active', nextDueAt: stamp(-n * 1000) })
      await setDoc(doc(store, 'incidents', `critical-${n}`), { status: 'reported', priority: 'critical', createdAt: stamp(-n * 1000) })
    }
    for (const [id, status, offset] of [['at-cutoff', 'active', 0], ['before-end', 'active', 604799999], ['at-end', 'active', 604800000], ['voided', 'voided', -1000], ['paused', 'paused', -2000]]) {
      await setDoc(doc(store, 'preventivePlans', id), { status, nextDueAt: stamp(offset) })
    }
    for (const [id, status, priority] of [['high', 'in_progress', 'high'], ['medium', 'acknowledged', 'medium'], ['resolved', 'resolved', 'critical'], ['voided', 'voided', 'high']]) {
      await setDoc(doc(store, 'incidents', id), { status, priority, createdAt: stamp(0) })
    }
    for (const collection of ['correctives', 'preventiveExecutions']) {
      await setDoc(doc(store, collection, 'completed'), { status: 'completed', startedAt: stamp(-2 * 24 * 60 * 60 * 1000) })
      await setDoc(doc(store, collection, 'old'), { status: 'completed', startedAt: stamp(-40 * 24 * 60 * 60 * 1000) })
      await setDoc(doc(store, collection, 'voided'), { status: 'voided' })
    }
    await setDoc(doc(store, 'correctives', 'completed'), { durationMinutes: 30 }, { merge: true })
    await setDoc(doc(store, 'correctives', 'old'), { durationMinutes: 90 }, { merge: true })
    await setDoc(doc(store, 'preventiveExecutions', 'completed'), { complianceStatus: 'on_time' }, { merge: true })
    await setDoc(doc(store, 'preventiveExecutions', 'old'), { complianceStatus: 'late' }, { merge: true })
  })
  db = env.authenticatedContext('reader').firestore()
})
afterAll(async () => { await env?.cleanup() })

it('cuenta todos los vencidos pero limita la agenda a los cinco más antiguos', async () => {
  const result = await loadDashboardSource('plans', cutoff)
  expect(result.overdueCount).toBe(7)
  expect(result.overdueRows.map((r) => r.id)).toEqual(['past-7', 'past-6', 'past-5', 'past-4', 'past-3'])
  expect(result.upcomingCount).toBe(2)
  expect(result.upcomingRows.map((r) => r.id)).toEqual(['at-cutoff', 'before-end'])
})
it('cuenta abiertos de todas las prioridades y limita críticos sin incluir resueltos', async () => {
  const result = await loadDashboardSource('incidents', cutoff)
  expect(result.total).toBe(9)
  expect(result.statusCounts).toEqual({ reported: 7, acknowledged: 1, in_progress: 1 })
  expect(result.priorityRows.map((r) => r.id)).toEqual(['critical-7', 'critical-6', 'critical-5', 'critical-4', 'critical-3', 'high'])
})
it('calcula resumen del período desde las fuentes autorizadas', async () => {
  const result = await loadDashboardSource('trend', cutoff, { periodDays: 30, activitySources: ['correctives', 'executions'] })
  expect(result.summary).toEqual({ averageCorrectiveMinutes: 30, evaluatedPreventives: 1, onTimePreventives: 1, onTimePercent: 100 })
  expect(result.areas.rows).toEqual([{ areaId: 'sin-area', name: 'Sin área registrada', total: 1 }])
})
it('excluye anulados en los conteos de ejecuciones y correctivos', async () => {
  expect(await loadDashboardSource('correctives', cutoff)).toEqual({ total: 2 })
  expect(await loadDashboardSource('executions', cutoff)).toEqual({ total: 2 })
})
it('limita actividad completada al período sin alterar el estado actual', async () => {
  expect(await loadDashboardSource('correctives', cutoff, { periodDays: 30 })).toEqual({ total: 1 })
  expect(await loadDashboardSource('executions', cutoff, { periodDays: 7 })).toEqual({ total: 1 })
  await expect(loadDashboardSource('correctives', cutoff, { periodDays: 0 })).rejects.toThrow('Período inválido')
})
it('no permite leer fuentes usando solamente dashboard.read', async () => {
  db = env.authenticatedContext('manager').firestore()
  await expect(loadDashboardSource('plans', cutoff)).rejects.toMatchObject({ code: 'permission-denied' })
  await expect(loadDashboardSource('incidents', cutoff)).rejects.toMatchObject({ code: 'permission-denied' })
})
it('rechaza fuentes desconocidas', async () => {
  await expect(loadDashboardSource('users', cutoff)).rejects.toThrow('Fuente de dashboard inválida')
})

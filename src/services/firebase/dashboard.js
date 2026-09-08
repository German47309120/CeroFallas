import { collection, getCountFromServer, getDocsFromServer, limit, orderBy, query, Timestamp, where } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'
import { buildActivityTrend, buildAreaBreakdown, buildOperationalSummary, dashboardWindow, OPEN_INCIDENT_STATES } from '../../utils/dashboard.js'
import { areas } from '../../config/catalogs.js'

const count = async (q) => (await getCountFromServer(q)).data().count
const rows = async (q) => (await getDocsFromServer(q)).docs.map((d) => ({ ...d.data(), id: d.id }))

export async function loadDashboardSource(source, cutoff, { periodDays = null, activitySources = [], areaId = '' } = {}) {
  const db = getFirebaseFirestore()
  if (periodDays !== null && (!Number.isInteger(periodDays) || periodDays < 1 || periodDays > 366)) throw new Error('Período inválido')
  if (areaId && !areas.some((area) => area.id === areaId)) throw new Error('Área inválida')
  const areaClause = areaId ? [where('areaId', '==', areaId)] : []
  if (source === 'plans') {
    const { start, end } = dashboardWindow(cutoff)
    const ref = collection(db, 'preventivePlans')
    const active = where('status', '==', 'active')
    const overdue = query(ref, active, ...areaClause, where('nextDueAt', '<', Timestamp.fromDate(start)))
    const upcoming = query(ref, active, ...areaClause, where('nextDueAt', '>=', Timestamp.fromDate(start)), where('nextDueAt', '<', Timestamp.fromDate(end)))
    const [overdueCount, upcomingCount, overdueRows, upcomingRows] = await Promise.all([
      count(overdue), count(upcoming),
      rows(query(overdue, orderBy('nextDueAt'), limit(5))),
      rows(query(upcoming, orderBy('nextDueAt'), limit(5))),
    ])
    return { overdueCount, upcomingCount, overdueRows, upcomingRows }
  }
  if (source === 'incidents') {
    const ref = collection(db, 'incidents')
    const open = where('status', 'in', OPEN_INCIDENT_STATES)
    const [total, critical, high, ...stateTotals] = await Promise.all([
      count(query(ref, open, ...areaClause)),
      rows(query(ref, open, ...areaClause, where('priority', '==', 'critical'), orderBy('createdAt'), limit(5))),
      rows(query(ref, open, ...areaClause, where('priority', '==', 'high'), orderBy('createdAt'), limit(5))),
      ...OPEN_INCIDENT_STATES.map((status) => count(query(ref, where('status', '==', status), ...areaClause))),
    ])
    return {
      total,
      priorityRows: [...critical, ...high],
      statusCounts: Object.fromEntries(OPEN_INCIDENT_STATES.map((status, index) => [status, stateTotals[index]])),
    }
  }
  if (source === 'correctives' || source === 'executions') {
    const clauses = [where('status', '==', 'completed'), ...areaClause]
    if (periodDays !== null) clauses.push(where('startedAt', '>=', new Date(cutoff.getTime() - periodDays * 24 * 60 * 60 * 1000)), where('startedAt', '<', cutoff))
    return { total: await count(query(collection(db, source === 'correctives' ? 'correctives' : 'preventiveExecutions'), ...clauses)) }
  }
  if (source === 'trend') {
    const allowed = activitySources.filter((key) => ['correctives', 'executions'].includes(key))
    const start = new Date(cutoff.getTime() - periodDays * 24 * 60 * 60 * 1000)
    const entries = await Promise.all(allowed.map(async (key) => {
      const name = key === 'correctives' ? 'correctives' : 'preventiveExecutions'
      const result = await rows(query(collection(db, name), where('status', '==', 'completed'), ...areaClause, where('startedAt', '>=', start), where('startedAt', '<', cutoff), orderBy('startedAt')))
      return [key, result]
    }))
    const records = Object.fromEntries(entries)
    return {
      ...buildActivityTrend(records, cutoff, periodDays),
      areas: buildAreaBreakdown(records.correctives),
      summary: buildOperationalSummary(records),
    }
  }
  throw new Error('Fuente de dashboard inválida')
}

import { collection, getCountFromServer, getDocsFromServer, limit, orderBy, query, Timestamp, where } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'
import { buildActivityTrend, buildAreaBreakdown, dashboardWindow, OPEN_INCIDENT_STATES } from '../../utils/dashboard.js'

const count = async (q) => (await getCountFromServer(q)).data().count
const rows = async (q) => (await getDocsFromServer(q)).docs.map((d) => ({ ...d.data(), id: d.id }))

export async function loadDashboardSource(source, cutoff, { periodDays = null, activitySources = [] } = {}) {
  const db = getFirebaseFirestore()
  if (periodDays !== null && (!Number.isInteger(periodDays) || periodDays < 1 || periodDays > 366)) throw new Error('Período inválido')
  if (source === 'plans') {
    const { start, end } = dashboardWindow(cutoff)
    const ref = collection(db, 'preventivePlans')
    const active = where('status', '==', 'active')
    const overdue = query(ref, active, where('nextDueAt', '<', Timestamp.fromDate(start)))
    const upcoming = query(ref, active, where('nextDueAt', '>=', Timestamp.fromDate(start)), where('nextDueAt', '<', Timestamp.fromDate(end)))
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
    const [total, critical, high] = await Promise.all([
      count(query(ref, open)),
      rows(query(ref, open, where('priority', '==', 'critical'), orderBy('createdAt'), limit(5))),
      rows(query(ref, open, where('priority', '==', 'high'), orderBy('createdAt'), limit(5))),
    ])
    return { total, priorityRows: [...critical, ...high] }
  }
  if (source === 'correctives' || source === 'executions') {
    const clauses = [where('status', '==', 'completed')]
    if (periodDays !== null) clauses.push(where('startedAt', '>=', new Date(cutoff.getTime() - periodDays * 24 * 60 * 60 * 1000)), where('startedAt', '<', cutoff))
    return { total: await count(query(collection(db, source === 'correctives' ? 'correctives' : 'preventiveExecutions'), ...clauses)) }
  }
  if (source === 'trend') {
    const allowed = activitySources.filter((key) => ['correctives', 'executions'].includes(key))
    const start = new Date(cutoff.getTime() - periodDays * 24 * 60 * 60 * 1000)
    const entries = await Promise.all(allowed.map(async (key) => {
      const name = key === 'correctives' ? 'correctives' : 'preventiveExecutions'
      const result = await rows(query(collection(db, name), where('status', '==', 'completed'), where('startedAt', '>=', start), where('startedAt', '<', cutoff), orderBy('startedAt', 'desc')))
      return [key, result]
    }))
    const records = Object.fromEntries(entries)
    return { ...buildActivityTrend(records, cutoff, periodDays), areas: buildAreaBreakdown(records.correctives) }
  }
  throw new Error('Fuente de dashboard inválida')
}

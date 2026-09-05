import { getAreaName } from '../config/catalogs.js'

export const OPEN_INCIDENT_STATES = ['reported', 'acknowledged', 'in_progress']

// Siete días exactos a partir del corte, independiente del huso del navegador.
export function dashboardWindow(cutoff = new Date()) {
  const start = new Date(cutoff)
  if (!Number.isFinite(start.getTime())) throw new Error('Corte inválido')
  return { start, end: new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000) }
}

export function dashboardDate(value) {
  const date = value?.toDate ? value.toDate() : new Date(value)
  return value != null && Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('es-GT', { timeZone: 'America/Guatemala', dateStyle: 'medium', timeStyle: 'short' }).format(date)
    : 'Fecha no disponible'
}

export function dashboardSources(hasPermission) {
  if (!hasPermission('dashboard.read')) return []
  return [
    ['plans', 'preventive.read'], ['incidents', 'incident.read'],
    ['correctives', 'corrective.read'], ['executions', 'preventive.read'],
  ].filter(([, permission]) => hasPermission(permission)).map(([key]) => key)
}

export function buildActivityTrend(recordsBySource, cutoff, periodDays) {
  if (!Number.isInteger(periodDays) || periodDays < 1 || periodDays > 366) throw new Error('Período inválido')
  const end = new Date(cutoff)
  if (!Number.isFinite(end.getTime())) throw new Error('Corte inválido')
  const bucketCount = periodDays <= 7 ? 7 : periodDays <= 30 ? 6 : 9
  const startMs = end.getTime() - periodDays * 24 * 60 * 60 * 1000
  const bucketMs = (end.getTime() - startMs) / bucketCount
  const formatter = new Intl.DateTimeFormat('es-GT', { timeZone: 'America/Guatemala', day: 'numeric', month: 'short' })
  const buckets = Array.from({ length: bucketCount }, (_, index) => ({
    label: formatter.format(new Date(startMs + index * bucketMs)), correctives: 0, executions: 0,
  }))
  for (const source of ['correctives', 'executions']) {
    for (const record of recordsBySource[source] ?? []) {
      const date = record.startedAt?.toDate ? record.startedAt.toDate() : new Date(record.startedAt)
      const time = date.getTime()
      if (!Number.isFinite(time) || time < startMs || time >= end.getTime()) continue
      const index = Math.min(bucketCount - 1, Math.floor((time - startMs) / bucketMs))
      buckets[index][source] += 1
    }
  }
  const max = Math.max(1, ...buckets.flatMap((bucket) => [bucket.correctives, bucket.executions]))
  return { buckets, max }
}

export function buildAreaBreakdown(records) {
  const counts = new Map()
  for (const record of records ?? []) {
    const areaId = typeof record.areaId === 'string' && record.areaId ? record.areaId : 'sin-area'
    counts.set(areaId, (counts.get(areaId) ?? 0) + 1)
  }
  const rows = [...counts].map(([areaId, total]) => ({ areaId, name: areaId === 'sin-area' ? 'Sin área registrada' : getAreaName(areaId), total }))
    .sort((left, right) => right.total - left.total || left.name.localeCompare(right.name, 'es'))
  return { rows, max: Math.max(1, ...rows.map((row) => row.total)) }
}

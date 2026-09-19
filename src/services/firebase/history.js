import { collection, documentId, endAt, getDocsFromServer, limit, orderBy, query, startAfter, startAt, where } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'
import { guatemalaDateRange } from '../../utils/historyFilters.js'

const definitions = {
  incidents: { sort: 'createdAt', states: ['open', 'reported', 'acknowledged', 'in_progress', 'resolved', 'voided'], openStates: ['reported', 'acknowledged', 'in_progress'] },
  audit: { sort: 'occurredAt' },
  stock: { sort: 'code', direction: 'asc', prefix: 'REP', filters: [['source', '==', 'sap-sqlserver'], ['active', '==', true]] },
  users: { sort: 'displayName' },
  forkliftInspections: { sort: 'inspectedAt' },
  preventivePlans: { sort: 'nextDueAt', direction: 'asc' },
  preventiveExecutions: { sort: 'startedAt' },
  equipment: { sort: 'code', direction: 'asc', states: ['active', 'inactive', 'out_of_service'] },
}

export async function readHistory(resource, { status = 'all', areaId = '', equipmentId = '', fromDate = '', toDate = '', cursor = null, pageSize = 25 } = {}) {
  const definition = definitions[resource]
  if (!definition) throw new Error('Histórico no permitido')
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new Error('Tamaño de página inválido')
  if (status !== 'all' && !definition.states?.includes(status)) throw new Error('Estado inválido')
  const clauses = status === 'all' ? [] : [definition.openStates && status === 'open' ? where('status', 'in', definition.openStates) : where('status', '==', status)]
  for (const [field, operator, value] of definition.filters ?? []) clauses.push(where(field, operator, value))
  const { from, until } = guatemalaDateRange({ areaId, equipmentId, fromDate, toDate })
  if (areaId) {
    if (resource !== 'incidents') throw new Error('Filtro de área no admitido')
    clauses.push(where('areaId', '==', areaId))
  }
  if (equipmentId) {
    if (resource !== 'incidents') throw new Error('Filtro de equipo no admitido')
    clauses.push(where('equipmentId', '==', equipmentId))
  }
  if (from) clauses.push(where(definition.sort, '>=', from))
  if (until) clauses.push(where(definition.sort, '<', until))
  const direction = definition.direction ?? 'desc'
  clauses.push(orderBy(definition.sort, direction), orderBy(documentId(), direction))
  if (cursor) clauses.push(startAfter(cursor))
  else if (definition.prefix) clauses.push(startAt(definition.prefix))
  if (definition.prefix) clauses.push(endAt(`${definition.prefix}\uf8ff`))
  clauses.push(limit(pageSize + 1))
  const snapshot = await getDocsFromServer(query(collection(getFirebaseFirestore(), resource), ...clauses))
  const visible = snapshot.docs.slice(0, pageSize)
  return { records: visible.map((item) => ({ ...item.data(), id: item.id })), cursor: visible.at(-1) ?? null, hasMore: snapshot.docs.length > pageSize }
}

export const readIncidentHistory = (options) => readHistory('incidents', options)
export const resourceReaders = Object.fromEntries(Object.keys(definitions).map((key) => [key, (options) => readHistory(key, options)]))

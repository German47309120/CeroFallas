import { collection, documentId, getDocsFromServer, limit, orderBy, query, startAfter, where } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'
import { guatemalaDateRange } from '../../utils/historyFilters.js'

export async function readCorrectiveHistory({ status = 'all', areaId = '', equipmentId = '', fromDate = '', toDate = '', cursor = null, pageSize = 25 } = {}) {
  if (!['all', 'draft', 'completed', 'voided'].includes(status)) throw new Error('Estado inválido')
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new Error('Tamaño de página inválido')
  const clauses = []
  if (status !== 'all') clauses.push(where('status', '==', status))
  const { from, until } = guatemalaDateRange({ areaId, equipmentId, fromDate, toDate })
  if (areaId) clauses.push(where('areaId', '==', areaId))
  if (equipmentId) clauses.push(where('equipmentId', '==', equipmentId))
  if (from) clauses.push(where('startedAt', '>=', from))
  if (until) clauses.push(where('startedAt', '<', until))
  // El ID desempata registros con la misma fecha, conservando un orden estable.
  clauses.push(orderBy('startedAt', 'desc'), orderBy(documentId(), 'desc'))
  if (cursor) clauses.push(startAfter(cursor))
  clauses.push(limit(pageSize + 1))
  const snapshot = await getDocsFromServer(query(collection(getFirebaseFirestore(), 'correctives'), ...clauses))
  const visible = snapshot.docs.slice(0, pageSize)
  return {
    records: visible.map((item) => ({ ...item.data(), id: item.id })),
    cursor: visible.at(-1) ?? null,
    hasMore: snapshot.docs.length > pageSize,
  }
}

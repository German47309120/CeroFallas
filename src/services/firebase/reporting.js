import { collection, getCountFromServer, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'

export async function readCollection(name, sortField, count = 100) {
  const snapshot = await getDocs(query(collection(getFirebaseFirestore(), name), orderBy(sortField, 'desc'), limit(count)))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export const dashboardMetrics = [
  { key: 'correctives', label: 'Correctivos completados', permission: 'corrective.read', collection: 'correctives', field: 'status', values: ['completed'] },
  { key: 'executions', label: 'Preventivos ejecutados', permission: 'preventive.read', collection: 'preventiveExecutions', field: 'status', values: ['completed'] },
  { key: 'plans', label: 'Planes preventivos activos', permission: 'preventive.read', collection: 'preventivePlans', field: 'status', values: ['active'] },
  { key: 'incidents', label: 'Incidentes abiertos', permission: 'incident.read', collection: 'incidents', field: 'status', values: ['reported', 'acknowledged', 'in_progress'] },
]

export async function countMetric(metric) {
  const result = await getCountFromServer(query(collection(getFirebaseFirestore(), metric.collection), where(metric.field, 'in', metric.values)))
  return result.data().count
}

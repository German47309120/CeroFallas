import { collection, doc, getDocFromServer, getDocsFromServer, limit, orderBy, query, where } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'
import { normalizeWorkOrderCode, workOrderDocumentId } from '../../utils/sapWorkOrders.js'

const workOrdersCollection = () => collection(getFirebaseFirestore(), 'workOrders')

export async function listActiveWorkOrders(maximum = 1000) {
  const snapshot = await getDocsFromServer(query(
    workOrdersCollection(),
    where('active', '==', true),
    orderBy('normalizedCode', 'asc'),
    limit(maximum),
  ))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function getActiveWorkOrder(value) {
  const normalizedCode = normalizeWorkOrderCode(value)
  if (!normalizedCode) return null
  const snapshot = await getDocFromServer(doc(getFirebaseFirestore(), 'workOrders', workOrderDocumentId(normalizedCode)))
  if (!snapshot.exists()) return null
  const record = snapshot.data()
  return record.active === true && record.normalizedCode === normalizedCode ? { id: snapshot.id, ...record } : null
}

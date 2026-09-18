import { collection, doc, endAt, getDocFromServer, getDocsFromServer, limit, orderBy, query, startAt, where } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'

export async function getStockIntegrationStatus() {
  const snapshot = await getDocFromServer(doc(getFirebaseFirestore(), 'integrationStatus', 'sap-stock'))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function findActiveSapStockByPrefix(rawPrefix) {
  const prefix = String(rawPrefix ?? '').trim().toUpperCase()
  if (prefix.length < 2 || prefix.length > 80) throw new Error('Ingresa al menos dos caracteres del código.')
  const snapshot = await getDocsFromServer(query(
    collection(getFirebaseFirestore(), 'stock'),
    where('source', '==', 'sap-sqlserver'),
    where('active', '==', true),
    orderBy('code', 'asc'),
    startAt(prefix),
    endAt(`${prefix}\uf8ff`),
    limit(200),
  ))
  return snapshot.docs
    .map((item) => ({ ...item.data(), id: item.id }))
}

import { doc, getDocFromServer } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'

export async function getStockIntegrationStatus() {
  const snapshot = await getDocFromServer(doc(getFirebaseFirestore(), 'integrationStatus', 'sap-stock'))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

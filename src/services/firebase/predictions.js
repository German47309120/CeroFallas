import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'

export async function listRiskPredictions(maximum = 100) {
  const safeLimit = Math.min(Math.max(Number(maximum) || 100, 1), 200)
  const snapshot = await getDocs(query(
    collection(getFirebaseFirestore(), 'riskPredictions'),
    orderBy('calculatedAt', 'desc'),
    limit(safeLimit),
  ))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

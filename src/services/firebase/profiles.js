import { doc, onSnapshot } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'

export function subscribeToProfile(userId, onValue, onError) {
  return onSnapshot(
    doc(getFirebaseFirestore(), 'users', userId),
    (snapshot) => onValue(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    onError,
  )
}

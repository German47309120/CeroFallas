import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { getFirebaseApp, useFirebaseEmulators } from './config.js'

let firestoreInstance
let emulatorConnected = false

export function getFirebaseFirestore() {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp())

    if (useFirebaseEmulators && !emulatorConnected) {
      connectFirestoreEmulator(firestoreInstance, '127.0.0.1', 8080)
      emulatorConnected = true
    }
  }

  return firestoreInstance
}

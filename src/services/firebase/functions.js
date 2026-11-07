import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseApp, useFirebaseEmulators } from './config.js'

let instance
let emulatorConnected = false

export function getFirebaseFunctions() {
  if (!instance) {
    instance = getFunctions(getFirebaseApp(), 'us-central1')
    if (useFirebaseEmulators && !emulatorConnected) {
      connectFunctionsEmulator(instance, '127.0.0.1', 5001)
      emulatorConnected = true
    }
  }
  return instance
}

export async function createAppUser(values) {
  const result = await httpsCallable(getFirebaseFunctions(), 'createAppUser')(values)
  return result.data
}

export async function updateAppUser(values) {
  const result = await httpsCallable(getFirebaseFunctions(), 'updateAppUser')(values)
  return result.data
}

export async function resetAppUserPassword(values) {
  const result = await httpsCallable(getFirebaseFunctions(), 'resetAppUserPassword')(values)
  return result.data
}

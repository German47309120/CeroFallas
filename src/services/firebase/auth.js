import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { getFirebaseApp, useFirebaseEmulators } from './config.js'

let authInstance
let emulatorConnected = false

export function getFirebaseAuth() {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp())
    setPersistence(authInstance, browserLocalPersistence)

    if (useFirebaseEmulators && !emulatorConnected) {
      connectAuthEmulator(authInstance, 'http://127.0.0.1:9099', { disableWarnings: true })
      emulatorConnected = true
    }
  }

  return authInstance
}

export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(getFirebaseAuth(), email.trim().toLowerCase(), password)
}

export function logout() {
  return signOut(getFirebaseAuth())
}

const genericCredentialError = 'No fue posible iniciar sesión. Verifica tus credenciales e inténtalo nuevamente.'

const authErrorMessages = {
  'auth/too-many-requests': 'Se realizaron demasiados intentos. Espera antes de probar nuevamente.',
  'auth/network-request-failed': 'No fue posible conectar con el servicio de autenticación.',
}

export function getAuthErrorMessage(error) {
  return authErrorMessages[error?.code] ?? genericCredentialError
}

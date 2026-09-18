import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { getFirebaseApp, useFirebaseEmulators } from './config.js'
import { acquireExclusiveSession, releaseExclusiveSession } from './sessions.js'

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

export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim().toLowerCase(), password)
  try {
    await acquireExclusiveSession(credential.user.uid)
    return credential
  } catch (error) {
    await signOut(getFirebaseAuth())
    throw error
  }
}

export async function logout() {
  const auth = getFirebaseAuth()
  if (auth.currentUser) await releaseExclusiveSession(auth.currentUser.uid).catch(() => {})
  return signOut(auth)
}

const genericCredentialError = 'No fue posible iniciar sesión. Verifica tus credenciales e inténtalo nuevamente.'

const authErrorMessages = {
  'auth/too-many-requests': 'Se realizaron demasiados intentos. Espera antes de probar nuevamente.',
  'auth/network-request-failed': 'No fue posible conectar con el servicio de autenticación.',
  'auth/session-in-use': 'Esta cuenta ya está siendo utilizada en otro dispositivo. Cierra la sesión anterior o solicita al administrador que la libere.',
}

export function getAuthErrorMessage(error) {
  return authErrorMessages[error?.code] ?? genericCredentialError
}

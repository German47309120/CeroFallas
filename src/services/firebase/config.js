import { getApps, initializeApp } from 'firebase/app'

const environmentConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId']
const hasCloudConfig = requiredKeys.every((key) => Boolean(environmentConfig[key]))

export const useFirebaseEmulators =
  import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true' || (import.meta.env.DEV && !hasCloudConfig)

const emulatorConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-cerofallas.firebaseapp.com',
  projectId: 'demo-cerofallas',
  appId: 'demo-cerofallas-web',
}

const firebaseConfig = useFirebaseEmulators ? emulatorConfig : environmentConfig

export const isFirebaseConfigured = useFirebaseEmulators || hasCloudConfig
export const isDemoMode = import.meta.env.VITE_DEMO_MODE !== 'false' && !useFirebaseEmulators

export function getFirebaseApp() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase no está configurado. Completa las variables VITE_FIREBASE_* requeridas.')
  }

  return getApps()[0] ?? initializeApp(firebaseConfig)
}

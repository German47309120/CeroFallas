import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth, logout as firebaseLogout } from '../../services/firebase/auth.js'
import { useFirebaseEmulators } from '../../services/firebase/config.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    environment: useFirebaseEmulators ? 'emulator' : 'cloud',
    profile: user
      ? {
          displayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
          role: useFirebaseEmulators ? 'Administrador de prueba' : 'Perfil pendiente',
        }
      : null,
    logout: firebaseLogout,
  }), [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.')
  }

  return context
}

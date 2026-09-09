import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth, logout as firebaseLogout } from '../../services/firebase/auth.js'
import { isFirebaseConfigured, useFirebaseEmulators } from '../../services/firebase/config.js'
import { subscribeToProfile } from '../../services/firebase/profiles.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      setProfileLoading(false)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser)
      setLoading(false)
      if (!nextUser) {
        setProfile(null)
        setProfileLoading(false)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) return undefined

    setProfile(null)
    setProfileLoading(true)
    return subscribeToProfile(
      user.uid,
      (nextProfile) => {
        setProfile(nextProfile)
        setProfileError(nextProfile ? '' : 'Tu cuenta no tiene un perfil de aplicación asignado.')
        setProfileLoading(false)
      },
      () => {
        setProfileError('No fue posible cargar tu perfil y permisos.')
        setProfileLoading(false)
      },
    )
  }, [user])

  const value = useMemo(() => ({
    user,
    loading,
    configured: isFirebaseConfigured,
    configurationError: isFirebaseConfigured ? '' : 'El servicio de acceso no está configurado para este ambiente.',
    environment: useFirebaseEmulators ? 'emulator' : 'cloud',
    profile: profile ? {
      ...profile,
      displayName: profile.displayName || user?.displayName || user?.email?.split('@')[0] || 'Usuario',
      role: profile.roleName || 'Perfil sin rol',
    } : null,
    profileLoading,
    profileError,
    hasPermission: (permission) => profile?.status === 'active' && profile?.permissions?.includes(permission),
    logout: firebaseLogout,
  }), [loading, profile, profileError, profileLoading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Provider y hook se mantienen juntos para centralizar el contrato de sesión.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.')
  }

  return context
}

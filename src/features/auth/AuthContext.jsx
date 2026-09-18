import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { getFirebaseAuth, logout as firebaseLogout } from '../../services/firebase/auth.js'
import { isFirebaseConfigured, useFirebaseEmulators } from '../../services/firebase/config.js'
import { subscribeToProfile } from '../../services/firebase/profiles.js'
import { acquireExclusiveSession, monitorExclusiveSession, SessionInUseError } from '../../services/firebase/sessions.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      setProfileLoading(false)
      return undefined
    }

    let revision = 0
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (nextUser) => {
      const currentRevision = ++revision
      if (!nextUser) {
        setUser(null)
        setProfile(null)
        setProfileLoading(false)
        setLoading(false)
        return
      }
      try {
        await acquireExclusiveSession(nextUser.uid)
        if (currentRevision !== revision) return
        setSessionError('')
        setUser(nextUser)
      } catch (error) {
        if (currentRevision !== revision) return
        setSessionError(error instanceof SessionInUseError ? error.message : 'No fue posible validar la sesión exclusiva.')
        await signOut(getFirebaseAuth())
      } finally {
        if (currentRevision === revision) setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) return undefined
    let closing = false
    return monitorExclusiveSession(user.uid, async () => {
      if (closing) return
      closing = true
      setSessionError('La sesión fue cerrada porque la cuenta se liberó o se abrió en otro dispositivo.')
      await signOut(getFirebaseAuth())
    })
  }, [user])

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
    sessionError,
    hasPermission: (permission) => profile?.status === 'active' && profile?.permissions?.includes(permission),
    logout: firebaseLogout,
  }), [loading, profile, profileError, profileLoading, sessionError, user])

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

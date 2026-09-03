import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="auth-loading" aria-live="polite">
        <span className="brand__mark" aria-hidden="true">CF</span>
        <p>Comprobando sesión…</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

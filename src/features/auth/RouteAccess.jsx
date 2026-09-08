import { useLocation } from 'react-router-dom'
import { canAccessRoute } from '../../config/access.js'
import { useAuth } from './AuthContext.jsx'

export default function RouteAccess({ children }) {
  const location = useLocation()
  const { hasPermission, profileLoading } = useAuth()

  if (profileLoading) {
    return <div className="panel empty-state" role="status"><p>Cargando permisos del perfil…</p></div>
  }

  if (!canAccessRoute(location.pathname, hasPermission)) {
    return (
      <section className="page-stack" aria-labelledby="route-access-title">
        <div className="page-heading"><div><p className="eyebrow">Control de acceso</p><h1 id="route-access-title">Acceso restringido</h1></div></div>
        <div className="panel empty-state"><h2>Esta operación no pertenece a tu rol</h2><p>Utiliza el menú para volver a una pantalla autorizada. El intento no modifica información.</p></div>
      </section>
    )
  }

  return children
}

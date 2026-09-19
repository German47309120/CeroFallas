import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { navigationGroups } from '../../config/navigation.js'
import { useAuth } from '../../features/auth/AuthContext.jsx'
import { canViewNavigation } from '../../config/access.js'
import RouteAccess from '../../features/auth/RouteAccess.jsx'
import { getCurrentShift } from '../../utils/shifts.js'

function Sidebar({ environment, open, onClose }) {
  const { hasPermission } = useAuth()
  return (
    <>
      <button
        className={`backdrop ${open ? 'backdrop--visible' : ''}`}
        type="button"
        aria-label="Cerrar navegación"
        onClick={onClose}
      />
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`} aria-label="Navegación principal">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">CF</span>
          <div>
            <strong>CeroFallas</strong>
            <small>Novafiber</small>
          </div>
        </div>

        <nav className="nav-groups">
          {navigationGroups.filter((group) => group.items.some((item) => canViewNavigation(item.to, hasPermission))).map((group) => (
            <div className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.filter((item) => canViewNavigation(item.to, hasPermission)).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
                >
                  <span className="nav-link__dot" aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar__footer">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <strong>{environment === 'emulator' ? 'Entorno local' : 'Sistema en línea'}</strong>
            <small>{environment === 'emulator' ? 'Servicios de prueba' : 'Datos sincronizados'}</small>
          </div>
        </div>
      </aside>
    </>
  )
}

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const location = useLocation()
  const navigate = useNavigate()
  const { environment, logout, profile, profileError, user } = useAuth()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const currentShift = getCurrentShift(currentTime, profile?.roleId)

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <Sidebar environment={environment} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="app-frame">
        <header className="topbar">
          <button
            type="button"
            className="menu-button"
            aria-label="Abrir navegación"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="topbar__context">
            <span className="environment-pill">
              {environment === 'emulator' ? 'Entorno de pruebas' : 'Operación en línea'}
            </span>
            <span title={currentShift.schedule}>{currentShift.label}</span>
          </div>
          <NavLink className="profile-link" to="/perfil" aria-label="Abrir perfil">
            <span className="avatar" aria-hidden="true">{profile?.displayName?.slice(0, 2).toUpperCase() || 'CF'}</span>
            <span className="profile-link__text">
              <strong>{profile?.displayName || user?.email}</strong>
              <small>{profile?.role || 'Perfil pendiente'}</small>
            </span>
          </NavLink>
          <button className="logout-button" type="button" onClick={handleLogout}>
            Salir
          </button>
        </header>

        <main className="main-content">
          {profileError ? <div className="demo-banner" role="alert">{profileError}</div> : null}
          <RouteAccess><Outlet /></RouteAccess>
        </main>
      </div>
    </div>
  )
}

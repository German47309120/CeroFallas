import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { navigationGroups } from '../../config/navigation.js'
import { useAuth } from '../../features/auth/AuthContext.jsx'

function Sidebar({ environment, open, onClose }) {
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
          {navigationGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map((item) => (
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
            <strong>{environment === 'emulator' ? 'Entorno local' : 'Firebase activo'}</strong>
            <small>{environment === 'emulator' ? 'Authentication Emulator' : 'Servicios cloud'}</small>
          </div>
        </div>
      </aside>
    </>
  )
}

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { environment, logout, profile, user } = useAuth()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

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
              {environment === 'emulator' ? 'Emulador local' : 'Firebase cloud'}
            </span>
            <span>Turno actual: por configurar</span>
          </div>
          <NavLink className="profile-link" to="/perfil" aria-label="Abrir perfil">
            <span className="avatar" aria-hidden="true">GH</span>
            <span className="profile-link__text">
              <strong>{profile?.displayName}</strong>
              <small>{profile?.role}</small>
            </span>
          </NavLink>
          <button className="logout-button" type="button" onClick={handleLogout}>
            Salir
          </button>
        </header>

        <main className="main-content">
          <div className="demo-banner" role="status">
            Sesión autenticada como {user?.email}. La persistencia operativa todavía no está conectada.
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

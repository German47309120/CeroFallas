import { useAuth } from '../features/auth/AuthContext.jsx'
import { permissionCatalog, roleDefinitions } from '../config/roles.js'

export default function ProfilePage() {
  const { profile, user, environment } = useAuth()
  const roleName = profile?.roleName || roleDefinitions[profile?.roleId]?.name || profile?.role || 'Rol no disponible'
  const permissions = profile?.permissions || []
  return <section className="page-stack profile-page">
    <header className="page-heading"><div><p className="eyebrow">IDENTIDAD Y ACCESO</p><h1>Mi perfil</h1><p>Consulta la cuenta activa y las operaciones autorizadas para tu rol.</p></div></header>
    <section className="panel profile-summary">
      <div className="avatar profile-summary__avatar" aria-hidden="true">{(profile?.displayName || user?.email || 'CF').split(/\s|@/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div>
      <div><h2>{profile?.displayName || 'Usuario CeroFallas'}</h2><p>{user?.email || 'Correo no disponible'}</p></div>
      <dl>
        <div><dt>Rol</dt><dd>{roleName}</dd></div>
        <div><dt>Estado</dt><dd>{profile?.status === 'active' ? 'Activo' : 'Inactivo'}</dd></div>
        <div><dt>Entorno</dt><dd>{environment === 'emulator' ? 'Emuladores locales · no producción' : 'Firebase cloud'}</dd></div>
      </dl>
    </section>
    <section className="panel">
      <div className="panel__heading"><div><p className="eyebrow">ALCANCE DEL ROL</p><h2>{permissions.length} permisos efectivos</h2></div></div>
      {permissions.length ? <ul className="permission-list">{permissions.map((permission) => <li key={permission}><strong>{permissionCatalog[permission] || permission}</strong><code>{permission}</code></li>)}</ul> : <p className="muted-copy">Este perfil no tiene permisos operativos asignados.</p>}
      <p className="profile-help">Los permisos se asignan por rol y no pueden modificarse desde esta pantalla. Solicita cualquier ajuste al Administrador de la aplicación.</p>
    </section>
  </section>
}

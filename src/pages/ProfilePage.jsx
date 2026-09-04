import { useAuth } from '../features/auth/AuthContext.jsx'

export default function ProfilePage() {
  const { profile, user, environment } = useAuth()
  return <section className="panel page-stack"><h1>Mi perfil</h1><p>{profile?.displayName}</p><dl><dt>Correo</dt><dd>{user?.email}</dd><dt>Rol</dt><dd>{profile?.role}</dd><dt>Estado</dt><dd>{profile?.status}</dd><dt>Entorno</dt><dd>{environment === 'emulator' ? 'Emuladores locales; no producción' : 'Firebase cloud'}</dd></dl><h2>Permisos efectivos</h2><ul>{(profile?.permissions || []).map((permission) => <li key={permission}>{permission}</li>)}</ul><p>Los permisos no se pueden modificar desde tu perfil.</p></section>
}

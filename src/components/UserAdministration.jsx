import { useState } from 'react'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { roleDefinitions } from '../config/roles.js'
import { createAppUser, resetAppUserPassword, updateAppUser } from '../services/firebase/functions.js'
import { adminFunctionsEnabled } from '../services/firebase/config.js'
import { forceReleaseSession } from '../services/firebase/sessions.js'

const initialCreate = { displayName: '', email: '', password: '', roleId: 'maintenance_technician' }
const messageFor = (error) => {
  const code = error?.code || ''
  if (code.includes('already-exists')) return 'Ese correo ya está registrado.'
  if (code.includes('permission-denied')) return 'Solo el administrador puede gestionar usuarios.'
  if (code.includes('unavailable')) return 'El servicio de usuarios no está disponible. Verifica el entorno administrativo.'
  return error?.message?.replace(/^Firebase:\s*/i, '') || 'No fue posible completar la operación.'
}

function RoleSelect({ value, onChange }) {
  return <select name="roleId" value={value} onChange={onChange}>{Object.entries(roleDefinitions).map(([id, role]) => <option key={id} value={id}>{role.name}</option>)}</select>
}

function SessionReleaseList({ records, currentUserId }) {
  const [busyId, setBusyId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  async function release(record) {
    setBusyId(record.id); setMessage(''); setError('')
    try {
      await forceReleaseSession(record.id, currentUserId)
      setMessage(`Sesión de ${record.displayName || record.email} liberada. Podrá ingresar desde otro dispositivo.`)
    } catch {
      setError('No fue posible liberar la sesión. Verifica permisos y conexión.')
    } finally { setBusyId('') }
  }
  return <section className="panel"><div className="panel__heading"><div><p className="eyebrow">Sesiones exclusivas</p><h2>Liberar acceso de un dispositivo</h2></div></div><p className="muted-copy">Utiliza esta opción cuando un equipo se apagó o perdió conexión sin cerrar sesión. La operación queda registrada en auditoría.</p><div className="user-admin-list">{records.filter((record) => record.id !== currentUserId).map((record) => <div className="user-admin-row" key={record.id}><span><strong>{record.displayName || record.email}</strong><small>{record.email}</small></span><button className="button button--secondary" type="button" disabled={Boolean(busyId)} onClick={() => release(record)}>{busyId === record.id ? 'Liberando…' : 'Liberar sesión'}</button></div>)}</div>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}</section>
}

export default function UserAdministration({ records, onSaved }) {
  const { profile, user } = useAuth()
  const [createValues, setCreateValues] = useState(initialCreate)
  const [editing, setEditing] = useState(null)
  const [resetPassword, setResetPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  if (profile?.roleId !== 'administrator') return <div className="panel"><h2>Administración protegida</h2><p>Tu perfil puede consultar usuarios, pero solamente el Administrador de la aplicación puede crear cuentas o cambiar roles y estados.</p></div>
  if (!adminFunctionsEnabled) return <><div className="panel"><div className="panel__heading"><div><p className="eyebrow">Administración protegida</p><h2>Usuarios en modo consulta</h2></div><span className="status-badge">Servicio administrativo pendiente</span></div><p>Los once accesos iniciales ya están configurados. Crear cuentas, cambiar roles, desactivar usuarios o restablecer contraseñas permanecerá oculto hasta habilitar y probar la infraestructura administrativa.</p></div><SessionReleaseList records={records} currentUserId={user.uid} /></>

  const updateCreate = (event) => setCreateValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  const updateEdit = (event) => setEditing((current) => ({ ...current, [event.target.name]: event.target.value }))
  async function submitCreate(event) {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true)
    try {
      await createAppUser(createValues)
      setCreateValues(initialCreate); setNotice('Usuario creado. La contraseña temporal no se guardó en CeroFallas.'); onSaved()
    } catch (saveError) { setError(messageFor(saveError)) } finally { setBusy(false) }
  }
  async function submitEdit(event) {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true)
    try {
      await updateAppUser(editing)
      setEditing(null); setNotice('Perfil actualizado y cambio registrado en auditoría.'); onSaved()
    } catch (saveError) { setError(messageFor(saveError)) } finally { setBusy(false) }
  }
  async function submitPasswordReset() {
    setError(''); setNotice(''); setBusy(true)
    try {
      const result = await resetAppUserPassword({ uid: editing.uid, password: resetPassword })
      setResetPassword('')
      setNotice(result.auditRecorded
        ? 'Contraseña temporal restablecida y operación registrada en auditoría.'
        : 'Contraseña restablecida; la confirmación de auditoría quedó pendiente y debe revisarse.')
    } catch (saveError) { setError(messageFor(saveError)) } finally { setBusy(false) }
  }
  return <section className="panel user-administration"><div className="panel__heading"><div><p className="eyebrow">Operación privilegiada</p><h2>Administrar usuarios</h2></div><span className="status-badge">Solo administrador</span></div>
    <p className="muted-copy">La cuenta se crea mediante un servicio administrativo protegido. La contraseña se transmite únicamente al servicio configurado y nunca se escribe en la base de datos, auditoría o repositorio.</p>
    <form className="data-form user-admin-form" onSubmit={submitCreate}><div className="form-grid"><label><span>Nombre completo *</span><input name="displayName" minLength="3" maxLength="120" required value={createValues.displayName} onChange={updateCreate} /></label><label><span>Correo *</span><input name="email" type="email" required value={createValues.email} onChange={updateCreate} /></label><label><span>Contraseña temporal *</span><input name="password" type="password" minLength="10" maxLength="128" required autoComplete="new-password" value={createValues.password} onChange={updateCreate} /></label><label><span>Rol inicial *</span><RoleSelect value={createValues.roleId} onChange={updateCreate} /></label></div><div className="form-actions"><button className="button button--primary" disabled={busy}>{busy ? 'Procesando…' : 'Crear usuario'}</button></div></form>
    <div className="user-admin-list"><h3>Editar perfiles cargados</h3>{records.map((record) => <button type="button" className="user-admin-row" key={record.id} onClick={() => { setEditing({ uid: record.id, displayName: record.displayName || '', roleId: record.roleId || 'maintenance_technician', status: record.status || 'active' }); setResetPassword('') }}><span><strong>{record.displayName || record.email}</strong><small>{record.email}</small></span><span>{record.roleName || record.roleId}</span></button>)}</div>
    {editing && <form className="data-form user-admin-form user-admin-form--edit" onSubmit={submitEdit}><div className="panel__heading"><div><p className="eyebrow">Perfil seleccionado</p><h3>{editing.displayName}</h3></div><button type="button" onClick={() => { setEditing(null); setResetPassword('') }}>Cancelar</button></div><div className="form-grid"><label><span>Nombre completo *</span><input name="displayName" minLength="3" maxLength="120" required value={editing.displayName} onChange={updateEdit} /></label><label><span>Rol *</span><RoleSelect value={editing.roleId} onChange={updateEdit} /></label><label><span>Estado *</span><select name="status" value={editing.status} onChange={updateEdit}><option value="active">Activo</option><option value="disabled">Desactivado</option></select></label></div>{editing.uid === user.uid ? <p className="muted-copy">Tu propia cuenta no puede perder el rol Administrador, desactivarse ni restablecer su contraseña desde este panel.</p> : <div className="password-reset"><label><span>Nueva contraseña temporal</span><input type="password" minLength="10" maxLength="128" autoComplete="new-password" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} /></label><button className="button button--secondary" type="button" disabled={busy || resetPassword.length < 10} onClick={submitPasswordReset}>Restablecer contraseña</button></div>}<div className="form-actions"><button className="button button--primary" disabled={busy}>{busy ? 'Procesando…' : 'Guardar cambios'}</button></div></form>}
    {error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="form-success" role="status">{notice}</p>}
    <SessionReleaseList records={records} currentUserId={user.uid} />
  </section>
}

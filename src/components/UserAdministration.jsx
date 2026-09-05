import { useState } from 'react'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { roleDefinitions } from '../config/roles.js'
import { createAppUser, updateAppUser } from '../services/firebase/functions.js'

const initialCreate = { displayName: '', email: '', password: '', roleId: 'maintenance_technician' }
const messageFor = (error) => {
  const code = error?.code || ''
  if (code.includes('already-exists')) return 'Ese correo ya está registrado.'
  if (code.includes('permission-denied')) return 'Solo el administrador puede gestionar usuarios.'
  if (code.includes('unavailable')) return 'El backend de usuarios no está disponible. Verifica Functions Emulator.'
  return error?.message?.replace(/^Firebase:\s*/i, '') || 'No fue posible completar la operación.'
}

function RoleSelect({ value, onChange }) {
  return <select name="roleId" value={value} onChange={onChange}>{Object.entries(roleDefinitions).map(([id, role]) => <option key={id} value={id}>{role.name}</option>)}</select>
}

export default function UserAdministration({ records, onSaved }) {
  const { profile, user } = useAuth()
  const [createValues, setCreateValues] = useState(initialCreate)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  if (profile?.roleId !== 'administrator') return <div className="panel"><h2>Administración protegida</h2><p>Tu perfil puede consultar usuarios, pero solamente el Administrador de la aplicación puede crear cuentas o cambiar roles y estados.</p></div>

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
  return <section className="panel user-administration"><div className="panel__heading"><div><p className="eyebrow">Operación privilegiada</p><h2>Administrar usuarios</h2></div><span className="status-badge">Solo administrador</span></div>
    <p className="muted-copy">La cuenta se crea mediante Firebase Functions. La contraseña viaja al emulador o backend configurado y nunca se escribe en Firestore, auditoría o el repositorio.</p>
    <form className="data-form user-admin-form" onSubmit={submitCreate}><div className="form-grid"><label><span>Nombre completo *</span><input name="displayName" minLength="3" maxLength="120" required value={createValues.displayName} onChange={updateCreate} /></label><label><span>Correo *</span><input name="email" type="email" required value={createValues.email} onChange={updateCreate} /></label><label><span>Contraseña temporal *</span><input name="password" type="password" minLength="10" maxLength="128" required autoComplete="new-password" value={createValues.password} onChange={updateCreate} /></label><label><span>Rol inicial *</span><RoleSelect value={createValues.roleId} onChange={updateCreate} /></label></div><div className="form-actions"><button className="button button--primary" disabled={busy}>{busy ? 'Procesando…' : 'Crear usuario'}</button></div></form>
    <div className="user-admin-list"><h3>Editar perfiles cargados</h3>{records.map((record) => <button type="button" className="user-admin-row" key={record.id} onClick={() => setEditing({ uid: record.id, displayName: record.displayName || '', roleId: record.roleId || 'maintenance_technician', status: record.status || 'active' })}><span><strong>{record.displayName || record.email}</strong><small>{record.email}</small></span><span>{record.roleName || record.roleId}</span></button>)}</div>
    {editing && <form className="data-form user-admin-form user-admin-form--edit" onSubmit={submitEdit}><div className="panel__heading"><div><p className="eyebrow">Perfil seleccionado</p><h3>{editing.displayName}</h3></div><button type="button" onClick={() => setEditing(null)}>Cancelar</button></div><div className="form-grid"><label><span>Nombre completo *</span><input name="displayName" minLength="3" maxLength="120" required value={editing.displayName} onChange={updateEdit} /></label><label><span>Rol *</span><RoleSelect value={editing.roleId} onChange={updateEdit} /></label><label><span>Estado *</span><select name="status" value={editing.status} onChange={updateEdit}><option value="active">Activo</option><option value="disabled">Desactivado</option></select></label></div>{editing.uid === user.uid && <p className="muted-copy">Tu propia cuenta no puede perder el rol Administrador ni desactivarse.</p>}<div className="form-actions"><button className="button button--primary" disabled={busy}>{busy ? 'Procesando…' : 'Guardar cambios'}</button></div></form>}
    {error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="form-success" role="status">{notice}</p>}
  </section>
}

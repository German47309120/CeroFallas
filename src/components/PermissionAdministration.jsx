import { useEffect, useState } from 'react'
import { permissionCatalog, privilegedPermissions, roleDefinitions, togglePermissionSelection, validatePermissionSelection } from '../config/roles.js'
import { updateUserPermissions } from '../services/firebase/profiles.js'

const groups = [
  ['Equipos', ['equipment.read', 'equipment.manage']],
  ['Correctivos', ['corrective.read', 'corrective.create', 'corrective.manage']],
  ['Preventivos', ['preventive.read', 'preventive.plan', 'preventive.execute', 'preventive.manage']],
  ['Montacargas', ['forklift.read', 'forklift.inspect', 'forklift.manage']],
  ['Incidentes', ['incident.read', 'incident.create', 'incident.manage']],
  ['Información y control', ['dashboard.read', 'stock.read', 'prediction.read', 'analytics.export', 'users.read', 'audit.read', 'audit.write']],
]

export default function PermissionAdministration({ records, currentUserId, onSaved }) {
  const candidates = records.filter((record) => record.id !== currentUserId)
  const [selectedId, setSelectedId] = useState(candidates[0]?.id || '')
  const selected = candidates.find((record) => record.id === selectedId) || null
  const [permissions, setPermissions] = useState([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!selected && candidates[0]) setSelectedId(candidates[0].id)
  }, [candidates, selected])
  useEffect(() => {
    if (selected) setPermissions(selected.permissions || roleDefinitions[selected.roleId]?.permissions || [])
  }, [selected])

  const issues = selected ? validatePermissionSelection(permissions, selected.roleId) : []
  const privilegedRole = ['administrator', 'support'].includes(selected?.roleId)
  const changed = selected && JSON.stringify([...permissions].sort()) !== JSON.stringify([...(selected.permissions || [])].sort())

  function chooseUser(event) {
    setSelectedId(event.target.value)
    setMessage('')
    setError('')
  }

  function toggle(permission, checked) {
    setPermissions((current) => togglePermissionSelection(current, permission, checked))
    setMessage('')
    setError('')
  }

  function restoreRole() {
    setPermissions([...(roleDefinitions[selected.roleId]?.permissions || [])])
    setMessage('')
    setError('')
  }

  async function save() {
    if (!selected || issues.length) return
    setBusy(true); setMessage(''); setError('')
    try {
      await updateUserPermissions({ userId: selected.id, roleId: selected.roleId, permissions, actorId: currentUserId })
      setMessage(`Permisos de ${selected.displayName || selected.email} actualizados y registrados en auditoría.`)
      await onSaved?.()
    } catch (saveError) {
      setError(saveError?.code === 'permission-denied' ? 'Firebase rechazó el cambio. Verifica que las reglas publicadas estén actualizadas.' : saveError?.message || 'No fue posible actualizar los permisos.')
    } finally { setBusy(false) }
  }

  if (!candidates.length) return null
  return <section className="permission-administration" aria-labelledby="permission-admin-title">
    <div className="panel__heading"><div><p className="eyebrow">Control de acceso</p><h3 id="permission-admin-title">Gestionar permisos por usuario</h3></div><span className="status-badge">Solo administrador</span></div>
    <p className="muted-copy">Los permisos se aplican al perfil seleccionado. Al habilitar una operación también se activan sus dependencias de lectura y auditoría; al retirarlas se desactivan las operaciones que dependan de ellas.</p>
    <label className="permission-user-select"><span>Usuario</span><select value={selectedId} onChange={chooseUser}>{candidates.map((record) => <option key={record.id} value={record.id}>{record.displayName || record.email} · {record.roleName || record.roleId}</option>)}</select></label>
    {selected && <>
      <div className="permission-summary"><span><strong>{permissions.length}</strong> permisos seleccionados</span><button className="button button--secondary" type="button" onClick={restoreRole}>Restablecer permisos del rol</button></div>
      <div className="permission-groups">{groups.map(([group, items]) => <fieldset key={group}><legend>{group}</legend>{items.map((permission) => {
        const privileged = privilegedPermissions.includes(permission)
        const disabled = privileged && !privilegedRole
        return <label key={permission} className={disabled ? 'permission-option permission-option--disabled' : 'permission-option'}><input type="checkbox" checked={permissions.includes(permission)} disabled={busy || disabled} onChange={(event) => toggle(permission, event.target.checked)} /><span><strong>{permissionCatalog[permission]}</strong><small>{permission}</small>{disabled && <em>Reservado para Administrador o Soporte</em>}</span></label>
      })}</fieldset>)}</div>
      {issues.length > 0 && <div className="form-error" role="alert">{issues.map((issue) => <div key={issue}>{issue}</div>)}</div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="form-success" role="status">{message}</p>}
      <div className="form-actions"><button className="button button--primary" type="button" disabled={busy || !changed || issues.length > 0} onClick={save}>{busy ? 'Guardando…' : 'Guardar permisos'}</button></div>
    </>}
  </section>
}

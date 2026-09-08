import { useState } from 'react'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { resourceReaders } from '../services/firebase/history.js'
import { usePagedHistory } from '../features/usePagedHistory.js'
import HistoryControls from '../components/HistoryControls.jsx'
import { dashboardDate } from '../utils/dashboard.js'
import { permissionCatalog, roleDefinitions } from '../config/roles.js'
import UserAdministration from '../components/UserAdministration.jsx'
import { auditActionLabel, auditActorLabel, auditEntityLabel } from '../utils/audit.js'

const resources = {
  users: { title: 'Usuarios', permission: 'users.read', description: 'Perfiles de aplicación. El rol Administrador puede crear cuentas y administrar rol o estado mediante el backend privilegiado.', fields: [['displayName', 'Nombre'], ['email', 'Correo'], ['roleName', 'Rol'], ['status', 'Estado']] },
  audit: { title: 'Auditoría', permission: 'audit.read', description: 'Histórico paginado de eventos, más recientes primero. Consulta inmutable de actor, acción y registro afectado.', fields: [['occurredAt', 'Fecha'], ['actorId', 'Usuario (UID)'], ['action', 'Acción'], ['entityType', 'Entidad'], ['entityId', 'Registro'], ['reason', 'Motivo']] },
  stock: { title: 'Stock de repuestos', permission: 'stock.read', description: 'Existencias sincronizadas, solo lectura. Carga más registros para ampliar la consulta; esta búsqueda no consulta directamente SAP.', fields: [['code', 'Código'], ['description', 'Descripción'], ['quantity', 'Cantidad'], ['warehouse', 'Almacén'], ['source', 'Fuente'], ['syncedAt', 'Sincronizado']] },
}
const display = (value) => value?.toDate ? dashboardDate(value) : value == null ? '—' : String(value)
const resourceValue = (resource, key, row, actors) => {
  if (resource === 'stock' && key === 'source') return row.source === 'demo-local' ? 'Demostración local · no proviene de SAP' : display(row.source)
  if (resource !== 'audit') return display(row[key])
  if (key === 'actorId') return auditActorLabel(row.actorId, actors)
  if (key === 'action') return auditActionLabel(row.action)
  if (key === 'entityType') return auditEntityLabel(row.entityType)
  return display(row[key])
}

export default function ResourceReadPage({ resource }) {
  // Separar la instancia al cambiar recurso evita conservar búsquedas o cursores.
  return <ResourceHistory key={resource} resource={resource} />
}

function ResourceHistory({ resource }) {
  const config = resources[resource]
  const { user, hasPermission } = useAuth()
  const allowed = hasPermission(config.permission)
  const [search, setSearch] = useState('')
  const history = usePagedHistory({ enabled: allowed, scope: `${user?.uid}:${resource}`, status: 'all', readPage: resourceReaders[resource] })
  const actorHistory = usePagedHistory({ enabled: allowed && resource === 'audit', scope: `${user?.uid}:audit-actors`, status: 'all', options: { pageSize: 100 }, readPage: resourceReaders.users })
  const actors = new Map(actorHistory.records.map((actor) => [actor.id, actor]))
  if (!allowed) return <div className="panel"><h1>{config.title}</h1><p>Tu perfil no tiene permiso para esta consulta.</p></div>
  const filtered = history.records.filter((row) => config.fields.some(([key]) => resourceValue(resource, key, row, actors).toLowerCase().includes(search.trim().toLowerCase())))
  return <section className="page-stack">
    <div className="page-heading"><div><h1>{config.title}</h1><p>{config.description}</p></div></div>
    {resource === 'users' && <UserAdministration records={history.records} onSaved={history.refresh} />}
    {resource === 'users' && <section className="panel"><div className="panel__heading"><div><p className="eyebrow">Referencia de acceso</p><h2>Roles institucionales propuestos</h2></div></div><p className="muted-copy">Esta matriz no modifica cuentas. Los permisos técnicos de lectura de equipos y auditoría acompañan los registros que los necesitan.</p><div className="role-catalog">{Object.entries(roleDefinitions).map(([id, role]) => <details key={id}><summary>{role.name} <span>{role.permissions.length} permisos</span></summary><ul>{role.permissions.map((permission) => <li key={permission}><code>{permission}</code><span>{permissionCatalog[permission]}</span></li>)}</ul></details>)}</div></section>}
    {resource === 'stock' && history.records.some((row) => row.source === 'demo-local') && <aside className="panel" role="note"><p className="eyebrow">Datos de demostración</p><strong>Estas cantidades no provienen de SAP.</strong><p className="muted-copy">Sirven únicamente para revisar filtros, permisos y presentación mientras se integra la consulta SQL Server autorizada.</p></aside>}
    <div className="filter-bar"><label>Buscar en registros cargados<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} /></label></div>
    <p className="muted-copy">La búsqueda solo revisa lo cargado. Actualizar reinicia el histórico; úsalo si los datos cambiaron durante la consulta.</p>
    {history.error && <p className="form-error" role="alert">{history.error}</p>}
    {resource === 'audit' && actorHistory.error && <p className="muted-copy">No fue posible resolver nombres de usuarios; se conservarán sus UID como referencia.</p>}
    {history.loading ? <p role="status">Cargando…</p> : !history.error && !filtered.length ? <div className="panel"><h2>Sin coincidencias en lo cargado</h2><p>{resource === 'stock' ? 'La integración real con SAP permanece pendiente; no se presentan existencias ficticias. Si hay más páginas, cárgalas para ampliar la búsqueda.' : 'Carga más registros si están disponibles o ajusta la búsqueda.'}</p></div> : filtered.map((row) => <article key={row.id} className="panel"><dl className="form-grid">{config.fields.map(([key, label]) => <div key={key}><dt>{label}</dt><dd style={{ overflowWrap: 'anywhere', marginLeft: 0 }}>{resourceValue(resource, key, row, actors)}</dd></div>)}</dl>{resource === 'users' && <details><summary>Permisos asignados</summary><ul>{(row.permissions || []).map((p) => <li key={p}>{p}</li>)}</ul></details>}</article>)}
    <HistoryControls history={history} visibleCount={filtered.length} />
  </section>
}

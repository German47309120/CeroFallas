import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { resourceReaders } from '../services/firebase/history.js'
import { usePagedHistory } from '../features/usePagedHistory.js'
import HistoryControls from '../components/HistoryControls.jsx'
import { dashboardDate } from '../utils/dashboard.js'
import { permissionCatalog, roleDefinitions } from '../config/roles.js'
import UserAdministration from '../components/UserAdministration.jsx'
import { auditActionLabel, auditActorLabel, auditEntityLabel } from '../utils/audit.js'
import { findActiveSapStockByPrefix, getStockIntegrationStatus } from '../services/firebase/integrations.js'

const resources = {
  users: { title: 'Usuarios', permission: 'users.read', description: 'Perfiles de aplicación. El rol Administrador puede crear cuentas y administrar rol o estado mediante el backend privilegiado.', fields: [['displayName', 'Nombre'], ['email', 'Correo'], ['roleName', 'Rol'], ['status', 'Estado']] },
  audit: { title: 'Auditoría', permission: 'audit.read', description: 'Histórico paginado de eventos, más recientes primero. Consulta inmutable de actor, acción y registro afectado.', fields: [['occurredAt', 'Fecha'], ['actorId', 'Usuario (UID)'], ['action', 'Acción'], ['entityType', 'Entidad'], ['entityId', 'Registro'], ['reason', 'Motivo']] },
  stock: { title: 'Stock de repuestos', permission: 'stock.read', description: 'Existencias de repuestos sincronizadas desde SAP y disponibles en modo de solo lectura.', fields: [['code', 'Código'], ['description', 'Descripción'], ['quantity', 'Cantidad'], ['warehouse', 'Almacén']] },
}
const display = (value) => value?.toDate ? dashboardDate(value) : value == null ? '—' : String(value)
const stockSourceLabel = (source) => source === 'sap-sqlserver' ? 'SAP SQL Server' : source === 'demo-local' ? 'Demostración local · no proviene de SAP' : display(source)
const resourceValue = (resource, key, row, actors) => {
  if (resource === 'stock' && key === 'source') return stockSourceLabel(row.source)
  if (resource === 'stock' && key === 'quantity') return Number(row.quantity).toLocaleString('es-GT', { maximumFractionDigits: 3 })
  if (resource !== 'audit') return display(row[key])
  if (key === 'actorId') return auditActorLabel(row.actorId, actors)
  if (key === 'action') return auditActionLabel(row.action)
  if (key === 'entityType') return auditEntityLabel(row.entityType)
  return display(row[key])
}

function StockTable({ records, caption = 'Inventario de repuestos' }) {
  return <div className="stock-table-wrap"><table className="stock-table"><caption>{caption}</caption><thead><tr><th scope="col">Código</th><th scope="col">Descripción</th><th scope="col">Cantidad</th><th scope="col">Almacén</th></tr></thead><tbody>{records.map((row) => <tr key={row.id}><td><strong>{row.code}</strong></td><td>{row.description}</td><td className="stock-table__quantity">{resourceValue('stock', 'quantity', row, new Map())}</td><td>{row.warehouse}</td></tr>)}</tbody></table></div>
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
  const [warehouse, setWarehouse] = useState('all')
  const [codeLookup, setCodeLookup] = useState({ value: '', loading: false, searched: false, records: [], error: '' })
  const lookupTimer = useRef(null)
  const [integration, setIntegration] = useState({ loading: resource === 'stock' && allowed, status: null, error: '' })
  const history = usePagedHistory({ enabled: allowed, scope: `${user?.uid}:${resource}`, status: 'all', readPage: resourceReaders[resource] })
  const actorHistory = usePagedHistory({ enabled: allowed && resource === 'audit', scope: `${user?.uid}:audit-actors`, status: 'all', options: { pageSize: 100 }, readPage: resourceReaders.users })
  const actors = new Map(actorHistory.records.map((actor) => [actor.id, actor]))
  useEffect(() => {
    if (resource !== 'stock' || !allowed) return
    let active = true
    getStockIntegrationStatus().then((status) => {
      if (active) setIntegration({ loading: false, status, error: '' })
    }).catch(() => {
      if (active) setIntegration({ loading: false, status: null, error: 'No fue posible consultar el estado de sincronización.' })
    })
    return () => { active = false }
  }, [allowed, resource])
  useEffect(() => () => clearTimeout(lookupTimer.current), [])
  if (!allowed) return <div className="panel"><h1>{config.title}</h1><p>Tu perfil no tiene permiso para esta consulta.</p></div>
  const warehouses = resource === 'stock' ? [...new Set(history.records.map((row) => row.warehouse).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')) : []
  const filtered = history.records.filter((row) => {
    if (resource === 'stock' && warehouse !== 'all' && row.warehouse !== warehouse) return false
    return config.fields.some(([key]) => resourceValue(resource, key, row, actors).toLowerCase().includes(search.trim().toLowerCase()))
  })
  function updateCodeLookup(rawValue) {
    const value = rawValue.toUpperCase()
    clearTimeout(lookupTimer.current)
    if (value.trim().length < 2) {
      setCodeLookup({ value, loading: false, searched: false, records: [], error: '' })
      return
    }
    setCodeLookup({ value, loading: true, searched: false, records: [], error: '' })
    lookupTimer.current = setTimeout(async () => {
      try {
        const records = await findActiveSapStockByPrefix(value)
        setCodeLookup({ value, loading: false, searched: true, records, error: '' })
      } catch (error) {
        setCodeLookup({ value, loading: false, searched: false, records: [], error: error.message || 'No fue posible consultar el código.' })
      }
    }, 350)
  }
  return <section className="page-stack">
    <div className="page-heading"><div><h1>{config.title}</h1><p>{config.description}</p></div></div>
    {resource === 'users' && <UserAdministration records={history.records} onSaved={history.refresh} />}
    {resource === 'users' && <section className="panel"><div className="panel__heading"><div><p className="eyebrow">Referencia de acceso</p><h2>Roles institucionales propuestos</h2></div></div><p className="muted-copy">Esta matriz no modifica cuentas. Los permisos técnicos de lectura de equipos y auditoría acompañan los registros que los necesitan.</p><div className="role-catalog">{Object.entries(roleDefinitions).map(([id, role]) => <details key={id}><summary>{role.name} <span>{role.permissions.length} permisos</span></summary><ul>{role.permissions.map((permission) => <li key={permission}><code>{permission}</code><span>{permissionCatalog[permission]}</span></li>)}</ul></details>)}</div></section>}
    {resource === 'stock' && <aside className={`panel integration-status${integration.status?.status === 'success' && integration.status?.selection === 'REP%' ? ' integration-status--success' : ''}`} aria-live="polite"><div><p className="eyebrow">Estado de integración</p>{integration.loading ? <p>Consultando última sincronización…</p> : integration.error ? <p className="form-error" role="alert">{integration.error}</p> : integration.status?.status === 'success' && integration.status?.selection === 'REP%' ? <><strong>Inventario de repuestos SAP actualizado</strong><p className="muted-copy">Última sincronización oficial: {dashboardDate(integration.status.completedAt)} · filtro REP% validado</p></> : integration.status?.status === 'success' ? <><strong>Sincronización oficial REP% pendiente</strong><p className="muted-copy">La tabla ya muestra códigos REP, pero el conteo corresponde a la carga anterior. Se actualizará cuando SQL Server vuelva a estar disponible.</p></> : <><strong>Aún no hay una sincronización SAP publicada.</strong><p className="muted-copy">Las existencias identificadas como demostración no deben utilizarse para decisiones operativas.</p></>}</div>{integration.status?.status === 'success' && <dl className="integration-metrics"><div><dt>{integration.status.selection === 'REP%' ? 'Repuestos activos' : 'Registros carga anterior'}</dt><dd>{Number(integration.status.rows ?? 0).toLocaleString('es-GT')}</dd></div><div><dt>Almacenes</dt><dd>{integration.status.warehouses ?? 0}</dd></div><div><dt>Origen</dt><dd>SQL Server</dd></div></dl>}</aside>}
    {resource === 'stock' && history.records.some((row) => row.source === 'demo-local') && <aside className="panel" role="note"><p className="eyebrow">Datos de demostración</p><strong>Estas cantidades no provienen de SAP.</strong><p className="muted-copy">Sirven únicamente para revisar filtros, permisos y presentación mientras se integra la consulta SQL Server autorizada.</p></aside>}
    {resource === 'stock' && <section className="panel stock-lookup" aria-labelledby="stock-lookup-title"><div><p className="eyebrow">Consulta global</p><h2 id="stock-lookup-title">Buscar por prefijo de código</h2><p className="muted-copy">Escribe al menos dos caracteres, por ejemplo <strong>REP</strong>. La consulta revisa todo el inventario publicado y se actualiza automáticamente.</p></div><label><span>Prefijo o código</span><input type="search" value={codeLookup.value} onChange={(event) => updateCodeLookup(event.target.value)} maxLength="80" placeholder="REP" autoComplete="off" /></label>{codeLookup.loading && <p role="status">Buscando en el inventario SAP…</p>}{codeLookup.error && <p className="form-error" role="alert">{codeLookup.error}</p>}{codeLookup.searched && !codeLookup.records.length && <p role="status">No se encontraron repuestos activos con ese prefijo.</p>}{codeLookup.records.length > 0 && <><p className="muted-copy">{codeLookup.records.length} coincidencia(s){codeLookup.records.length === 200 ? ' · Escribe más caracteres para precisar la búsqueda' : ''}</p><StockTable records={codeLookup.records} caption="Resultados de la búsqueda global" /></>}</section>}
    <div className={`filter-bar${resource === 'stock' ? ' filter-bar--stock' : ''}`}><label>{resource === 'stock' ? 'Filtrar filas cargadas' : 'Buscar en registros cargados'}<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={resource === 'stock' ? 'Código o descripción' : ''} /></label>{resource === 'stock' && <><label>Almacén<select value={warehouse} onChange={(e) => setWarehouse(e.target.value)}><option value="all">Todos los almacenes cargados</option>{warehouses.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><div className="heading-actions"><button className="button button--secondary" type="button" onClick={() => { setSearch(''); setWarehouse('all') }}>Limpiar filtros</button></div></>}</div>
    <p className="muted-copy">Los filtros revisan los registros cargados. Usa <strong>Cargar más</strong> para ampliar la consulta o <strong>Actualizar</strong> si SAP fue sincronizado nuevamente.</p>
    {history.error && <p className="form-error" role="alert">{history.error}</p>}
    {resource === 'audit' && actorHistory.error && <p className="muted-copy">No fue posible resolver nombres de usuarios; se conservarán sus UID como referencia.</p>}
    {history.loading ? <p role="status">Cargando…</p> : !history.error && !filtered.length ? <div className="panel"><h2>Sin coincidencias en lo cargado</h2><p>{resource === 'stock' ? 'Ajusta los filtros o carga más registros del inventario sincronizado.' : 'Carga más registros si están disponibles o ajusta la búsqueda.'}</p></div> : resource === 'stock' ? <StockTable records={filtered} /> : <div className="contents">{filtered.map((row) => <article key={row.id} className="panel"><dl className="form-grid">{config.fields.map(([key, label]) => <div key={key}><dt>{label}</dt><dd style={{ overflowWrap: 'anywhere', marginLeft: 0 }}>{resourceValue(resource, key, row, actors)}</dd></div>)}</dl>{resource === 'users' && <details><summary>Permisos asignados</summary><ul>{(row.permissions || []).map((p) => <li key={p}>{p}</li>)}</ul></details>}</article>)}</div>}
    <HistoryControls history={history} visibleCount={filtered.length} />
  </section>
}

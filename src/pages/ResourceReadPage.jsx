import { useEffect, useState } from 'react'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { readCollection } from '../services/firebase/reporting.js'

const resources = {
  users: { title: 'Usuarios', permission: 'users.read', sort: 'displayName', description: 'Consulta de perfiles de aplicación. El alta de identidades y los cambios de rol requieren un backend privilegiado; aún no se realizan desde esta pantalla.', fields: [['displayName', 'Nombre'], ['email', 'Correo'], ['roleName', 'Rol'], ['status', 'Estado']] },
  audit: { title: 'Auditoría', permission: 'audit.read', sort: 'occurredAt', description: 'Últimos 100 eventos. Consulta inmutable de actor, acción y registro afectado.', fields: [['occurredAt', 'Fecha'], ['actorId', 'Usuario (UID)'], ['action', 'Acción'], ['entityType', 'Entidad'], ['entityId', 'Registro'], ['reason', 'Motivo']] },
  stock: { title: 'Stock de repuestos', permission: 'stock.read', sort: 'syncedAt', description: 'Solo lectura. Últimos 100 registros sincronizados; la búsqueda opera sobre esa ventana, no sobre todo SAP.', fields: [['code', 'Código'], ['description', 'Descripción'], ['quantity', 'Cantidad'], ['warehouse', 'Almacén'], ['syncedAt', 'Sincronizado']] },
}
const display = (value) => value?.toDate ? value.toDate().toLocaleString('es-GT') : value == null ? '—' : String(value)

export default function ResourceReadPage({ resource }) {
  const config = resources[resource]
  const { hasPermission } = useAuth()
  const allowed = hasPermission(config.permission)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let alive = true
    setData([]); setError(''); setLoading(allowed)
    if (allowed) readCollection(resource, config.sort).then((rows) => { if (alive) setData(rows) }).catch(() => { if (alive) setError('No se pudo cargar la información. No se interpreta este error como ausencia de registros.') }).finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [resource, allowed, revision])
  if (!allowed) return <div className="panel"><h1>{config.title}</h1><p>Tu perfil no tiene permiso para esta consulta.</p></div>
  const filtered = data.filter((row) => config.fields.some(([key]) => display(row[key]).toLowerCase().includes(search.toLowerCase())))
  return <section className="page-stack"><div className="page-heading"><div><h1>{config.title}</h1><p>{config.description}</p></div><button disabled={loading} className="button button--secondary" onClick={() => setRevision(revision + 1)}>Actualizar</button></div><label className="panel">Buscar en resultados cargados<input value={search} onChange={(e) => setSearch(e.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}{loading ? <p role="status">Cargando…</p> : !error && !filtered.length ? <div className="panel"><h2>Sin resultados</h2><p>{resource === 'stock' ? 'No hay stock cargado o no coincide la búsqueda. La integración real con SAP permanece pendiente; no se presentan existencias ficticias.' : 'No hay coincidencias en los registros cargados.'}</p></div> : filtered.map((row) => <article key={row.id} className="panel"><dl className="form-grid">{config.fields.map(([key, label]) => <div key={key}><dt>{label}</dt><dd style={{ overflowWrap: 'anywhere', marginLeft: 0 }}>{display(row[key])}</dd></div>)}</dl>{resource === 'users' && <details><summary>Permisos asignados</summary><ul>{(row.permissions || []).map((p) => <li key={p}>{p}</li>)}</ul></details>}</article>)}</section>
}

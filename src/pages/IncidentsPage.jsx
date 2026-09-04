import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { listIncidents, updateIncident } from '../services/firebase/incidents.js'
import { incidentPriorities, incidentStates } from '../utils/incidents.js'
import { getAreaName } from '../config/catalogs.js'

export default function IncidentsPage() {
  const { user, hasPermission } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [changes, setChanges] = useState({ status: 'reported', followUp: '', linkedCorrectiveId: '' })
  const [saving, setSaving] = useState(false)
  const canRead = hasPermission('incident.read')
  useEffect(() => {
    if (!canRead) { setLoading(false); return }
    let alive = true
    listIncidents().then((items) => { if (alive) setRecords(items) }).catch(() => { if (alive) setError('No se pudieron cargar los incidentes.') }).finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [canRead])
  async function save(event) {
    event.preventDefault(); setSaving(true); setError('')
    try { await updateIncident(editing.id, changes, user.uid); setRecords(await listIncidents()); setEditing(null) }
    catch (e) { setError(e.code ? 'No fue posible guardar. Comprueba permisos y conexión.' : e.message) }
    finally { setSaving(false) }
  }
  if (!canRead) return <section className="panel"><h1>Incidentes</h1><p>Tu perfil no permite consultar reportes.</p>{hasPermission('incident.create') && <Link to="/incidentes/nuevo">Reportar incidente</Link>}</section>
  const filtered = records.map((r) => ({ ...r, areaName: getAreaName(r.areaId) })).filter((r) => (!filter || r.status === filter) && `${r.description} ${r.areaName} ${r.equipmentSnapshot?.name || ''}`.toLowerCase().includes(search.toLowerCase()))
  return <section className="page-stack"><div className="page-heading"><div><p className="eyebrow">Reporte gerencial</p><h1>Incidentes</h1><p>Últimos 100 reportes. Los filtros se aplican a esta ventana.</p></div>{hasPermission('incident.create') && <Link className="button button--primary" to="/incidentes/nuevo">Reportar incidente</Link>}</div>
    <div className="panel form-grid"><label>Buscar<input value={search} onChange={(e) => setSearch(e.target.value)} /></label><label>Estado<select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">Todos</option>{Object.entries(incidentStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
    {error && <p role="alert" className="form-error">{error}</p>}
    {loading ? <p role="status">Cargando reportes…</p> : !filtered.length ? <div className="panel"><h2>Sin reportes que mostrar</h2><p>No hay incidentes o los filtros no tienen coincidencias.</p></div> : filtered.map((r) => <article className="panel record-card" key={r.id}><div><p className="eyebrow">{r.areaName} · {incidentPriorities[r.priority]}</p><h2>{r.equipmentSnapshot?.name || 'Equipo no identificado'}</h2><p>{r.description}</p><p>{incidentStates[r.status]} · {r.createdAt?.toDate().toLocaleString('es-GT')}</p>{r.followUp && <p>Seguimiento: {r.followUp}</p>}{r.linkedCorrectiveId && <p>Correctivo relacionado: {r.linkedCorrectiveId}</p>}</div>{hasPermission('incident.manage') && r.status !== 'voided' && <button className="button button--secondary" onClick={() => { setEditing(r); setChanges({ status: r.status, followUp: '', linkedCorrectiveId: r.linkedCorrectiveId || '' }) }}>Dar seguimiento</button>}</article>)}
    {editing && <form className="panel data-form" onSubmit={save}><h2>Seguimiento de incidente</h2><p>{editing.description}</p><label>Estado<select value={changes.status} onChange={(e) => setChanges({ ...changes, status: e.target.value })}>{Object.entries(incidentStates).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label><label>Motivo / seguimiento obligatorio<textarea required maxLength={1000} value={changes.followUp} onChange={(e) => setChanges({ ...changes, followUp: e.target.value })} /></label><label>ID de correctivo existente (opcional)<input value={changes.linkedCorrectiveId} onChange={(e) => setChanges({ ...changes, linkedCorrectiveId: e.target.value })} /></label><div className="form-actions"><button type="button" disabled={saving} onClick={() => setEditing(null)}>Cancelar</button><button className="button button--primary" disabled={saving}>{saving ? 'Guardando…' : 'Confirmar seguimiento'}</button></div></form>}
  </section>
}

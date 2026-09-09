import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { updateIncident } from '../services/firebase/incidents.js'
import { readIncidentHistory } from '../services/firebase/history.js'
import { usePagedHistory } from '../features/usePagedHistory.js'
import HistoryControls from '../components/HistoryControls.jsx'
import { incidentPriorities, incidentStates } from '../utils/incidents.js'
import { areas, getAreaName } from '../config/catalogs.js'
import { validateHistoryFilters } from '../utils/historyFilters.js'
import EquipmentFilter from '../components/EquipmentFilter.jsx'

export default function IncidentsPage() {
  const [searchParams] = useSearchParams()
  const requestedStatus = searchParams.get('status')
  const requestedArea = searchParams.get('areaId')
  const initialStatus = ['open', ...Object.keys(incidentStates)].includes(requestedStatus) ? requestedStatus : 'all'
  const initialArea = areas.some((area) => area.id === requestedArea) ? requestedArea : ''
  const { user, hasPermission } = useAuth()
  const [error, setError] = useState('')
  const [filter, setFilter] = useState(initialStatus)
  const [search, setSearch] = useState('')
  const [dates, setDates] = useState({ areaId: initialArea, equipmentId: '', fromDate: '', toDate: '' })
  const [appliedDates, setAppliedDates] = useState({ areaId: initialArea, equipmentId: '', fromDate: '', toDate: '' })
  const [filterError, setFilterError] = useState('')
  const [editing, setEditing] = useState(null)
  const [changes, setChanges] = useState({ status: 'reported', followUp: '', linkedCorrectiveId: '' })
  const [saving, setSaving] = useState(false)
  const canRead = hasPermission('incident.read')
  const history = usePagedHistory({ enabled: canRead, scope: user?.uid, status: filter, options: appliedDates, readPage: readIncidentHistory })
  const { records, loading } = history
  async function save(event) {
    event.preventDefault(); setSaving(true); setError('')
    try { await updateIncident(editing.id, changes, user.uid); setEditing(null); history.refresh() }
    catch (e) { setError(e.code ? 'No fue posible guardar. Comprueba permisos y conexión.' : e.message) }
    finally { setSaving(false) }
  }
  if (!canRead) return <section className="panel"><h1>Incidentes</h1><p>Tu perfil no permite consultar reportes.</p>{hasPermission('incident.create') && <Link to="/incidentes/nuevo">Reportar incidente</Link>}</section>
  const filtered = records.map((r) => ({ ...r, areaName: getAreaName(r.areaId) })).filter((r) => `${r.description} ${r.areaName} ${r.equipmentSnapshot?.name || ''} ${r.equipmentSnapshot?.code || ''}`.toLowerCase().includes(search.trim().toLowerCase()))
  return <section className="page-stack"><div className="page-heading"><div><p className="eyebrow">Reporte gerencial</p><h1>Incidentes</h1><p>Histórico paginado, más recientes primero. El estado se filtra en todo el histórico; el texto solo busca en registros cargados.</p></div>{hasPermission('incident.create') && <Link className="button button--primary" to="/incidentes/nuevo">Reportar incidente</Link>}</div>
    <div className="filter-bar filter-bar--history"><label>Buscar en registros cargados<input value={search} onChange={(e) => setSearch(e.target.value)} /></label><label>Estado<select disabled={saving} value={filter} onChange={(e) => { setFilter(e.target.value); setEditing(null); setError('') }}><option value="all">Todos</option><option value="open">Abiertos</option>{Object.entries(incidentStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Área<select value={dates.areaId} onChange={(e) => setDates({ ...dates, areaId: e.target.value, equipmentId: '' })}><option value="">Todas</option>{areas.map((area) => <option value={area.id} key={area.id}>{area.name}</option>)}</select></label><EquipmentFilter allowed={hasPermission('equipment.read')} value={dates.equipmentId} onChange={(equipmentId) => setDates({ ...dates, equipmentId, areaId: '' })} /><label>Desde<input type="date" value={dates.fromDate} onChange={(e) => setDates({ ...dates, fromDate: e.target.value })} /></label><label>Hasta<input type="date" value={dates.toDate} onChange={(e) => setDates({ ...dates, toDate: e.target.value })} /></label><div className="heading-actions"><button type="button" className="button button--primary" onClick={() => { const nextError = validateHistoryFilters(dates); setFilterError(nextError); if (!nextError) { setAppliedDates(dates); setEditing(null) } }}>Aplicar filtros</button><button type="button" className="button button--secondary" onClick={() => { const empty = { areaId: '', equipmentId: '', fromDate: '', toDate: '' }; setSearch(''); setFilter('all'); setDates(empty); setAppliedDates(empty); setFilterError(''); setEditing(null) }}>Limpiar</button></div></div>
    {filterError && <p role="alert" className="form-error">{filterError}</p>}
    {history.error && <p role="alert" className="form-error">{history.error}</p>}
    {error && <p role="alert" className="form-error">{error}</p>}
    {loading ? <p role="status">Cargando reportes…</p> : !filtered.length && !history.error ? <div className="panel"><h2>Sin reportes que mostrar</h2><p>No hay coincidencias en lo cargado. Puedes cargar más registros o cambiar la búsqueda.</p></div> : filtered.map((r) => <article className="panel record-card" key={r.id}><div><p className="eyebrow">{r.areaName} · {incidentPriorities[r.priority]}</p><h2>{r.equipmentSnapshot?.name || 'Equipo no identificado'}</h2><p>{r.description}</p><p>{incidentStates[r.status]} · {r.createdAt?.toDate().toLocaleString('es-GT')}</p>{r.followUp && <p>Seguimiento: {r.followUp}</p>}{r.linkedCorrectiveId && <p>Correctivo relacionado: {r.linkedCorrectiveId}</p>}</div>{hasPermission('incident.manage') && r.status !== 'voided' && <button className="button button--secondary" onClick={() => { setEditing(r); setChanges({ status: r.status, followUp: '', linkedCorrectiveId: r.linkedCorrectiveId || '' }) }}>Dar seguimiento</button>}</article>)}
    <HistoryControls history={history} visibleCount={filtered.length} />
    {editing && <form className="panel data-form" onSubmit={save}><h2>Seguimiento de incidente</h2><p>{editing.description}</p><label>Estado<select value={changes.status} onChange={(e) => setChanges({ ...changes, status: e.target.value })}>{Object.entries(incidentStates).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label><label>Motivo / seguimiento obligatorio<textarea required maxLength={1000} value={changes.followUp} onChange={(e) => setChanges({ ...changes, followUp: e.target.value })} /></label><label>ID de correctivo existente (opcional)<input value={changes.linkedCorrectiveId} onChange={(e) => setChanges({ ...changes, linkedCorrectiveId: e.target.value })} /></label><div className="form-actions"><button type="button" disabled={saving} onClick={() => setEditing(null)}>Cancelar</button><button className="button button--primary" disabled={saving}>{saving ? 'Guardando…' : 'Confirmar seguimiento'}</button></div></form>}
  </section>
}

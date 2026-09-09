import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { areas, getAreaName } from '../config/catalogs.js'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { readCorrectiveHistory } from '../services/firebase/correctiveHistory.js'
import { usePagedHistory } from '../features/usePagedHistory.js'
import { durationBetween, formatDuration } from '../utils/duration.js'
import { validateHistoryFilters } from '../utils/historyFilters.js'
import EquipmentFilter from '../components/EquipmentFilter.jsx'

const statusNames = { in_progress: 'En curso', draft: 'Borrador', completed: 'Completado', voided: 'Anulado' }

export default function CorrectivesPage() {
  const [searchParams] = useSearchParams()
  const requestedStatus = searchParams.get('status')
  const requestedArea = searchParams.get('areaId')
  const initialStatus = ['in_progress', 'draft', 'completed', 'voided'].includes(requestedStatus) ? requestedStatus : 'all'
  const initialArea = areas.some((area) => area.id === requestedArea) ? requestedArea : ''
  const { hasPermission, profileLoading, user } = useAuth()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(initialStatus)
  const [dates, setDates] = useState({ areaId: initialArea, equipmentId: '', fromDate: '', toDate: '' })
  const [appliedDates, setAppliedDates] = useState({ areaId: initialArea, equipmentId: '', fromDate: '', toDate: '' })
  const [filterError, setFilterError] = useState('')
  const canRead = hasPermission('corrective.read')
  const canCreate = hasPermission('corrective.create')
  const canManage = hasPermission('corrective.manage')

  const { records, loading, loadingMore, error, hasMore, loadMore, refresh } = usePagedHistory({
    enabled: canRead && !profileLoading, scope: user?.uid, status, options: appliedDates, readPage: readCorrectiveHistory,
  })

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es')
    return records.filter((item) => {
      const match = !term || [item.equipmentSnapshot?.code, item.equipmentSnapshot?.name, item.reportedSymptom, item.workPerformed].some((value) => value?.toLocaleLowerCase('es').includes(term))
      return match
    })
  }, [records, search])

  if (profileLoading) return <div className="panel empty-state"><p>Cargando perfil…</p></div>
  if (!canRead) return <section className="page-stack"><div className="page-heading"><div><p className="eyebrow">Mantenimiento</p><h1>Correctivos</h1></div></div><div className="panel empty-state"><h2>Acceso restringido</h2><p>Tu perfil no tiene permiso para consultar correctivos.</p></div></section>

  return (
    <section className="page-stack" aria-labelledby="correctives-title">
      <div className="page-heading"><div><p className="eyebrow">Mantenimiento</p><h1 id="correctives-title">Correctivos</h1><p>Registra fallas no planificadas y sus tiempos reales de atención.</p></div>{canCreate ? <Link className="button button--primary" to="/correctivos/nuevo">Nuevo correctivo</Link> : null}</div>
      <div className="filter-bar filter-bar--history" aria-label="Filtros de correctivos"><label><span>Buscar en lo cargado</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Equipo, síntoma o trabajo" /></label><label><span>Estado</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option><option value="draft">Borrador</option><option value="completed">Completado</option><option value="voided">Anulado</option></select></label><label><span>Área</span><select value={dates.areaId} onChange={(event) => setDates({ ...dates, areaId: event.target.value, equipmentId: '' })}><option value="">Todas</option>{areas.map((area) => <option value={area.id} key={area.id}>{area.name}</option>)}</select></label><EquipmentFilter allowed={hasPermission('equipment.read')} value={dates.equipmentId} onChange={(equipmentId) => setDates({ ...dates, equipmentId, areaId: '' })} /><label><span>Desde</span><input type="date" value={dates.fromDate} onChange={(event) => setDates({ ...dates, fromDate: event.target.value })} /></label><label><span>Hasta</span><input type="date" value={dates.toDate} onChange={(event) => setDates({ ...dates, toDate: event.target.value })} /></label><div className="heading-actions"><button className="button button--primary" type="button" onClick={() => { const nextError = validateHistoryFilters(dates); setFilterError(nextError); if (!nextError) setAppliedDates(dates) }}>Aplicar filtros</button><button className="button button--secondary" type="button" onClick={() => { const empty = { areaId: '', equipmentId: '', fromDate: '', toDate: '' }; setSearch(''); setStatus('all'); setDates(empty); setAppliedDates(empty); setFilterError('') }}>Limpiar</button></div></div>
      {filterError && <p className="form-error" role="alert">{filterError}</p>}
      <div className="panel"><p>El estado se consulta en todo el histórico. La búsqueda de texto solo se aplica a los registros cargados; carga más para ampliar las coincidencias.</p><p className="muted-copy">Orden: inicio más reciente. Si otros usuarios editan registros durante la consulta, pulsa Actualizar para renovar la lista.</p></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {loading ? <p role="status">Cargando correctivos…</p> : !records.length && !error ? <div className="panel empty-state"><h2>Sin correctivos para este estado</h2><p>Selecciona otro estado o registra un reporte autorizado.</p></div> : filteredRecords.length === 0 && records.length > 0 ? <div className="panel empty-state"><h2>Sin coincidencias en los registros cargados</h2><p>Ajusta la búsqueda o carga más registros si están disponibles.</p></div> : <div className="records-list">{filteredRecords.map((item) => {
        const minutes = item.durationMinutes ?? durationBetween(item.startedAt, item.endedAt)
        const date = item.startedAt?.toDate?.().toLocaleString('es-GT') || item.eventDate || 'Pendiente'
        return <article className={`panel record-card ${item.status === 'voided' ? 'record-card--voided' : ''}`} key={item.id}><div><p className="eyebrow">{item.equipmentSnapshot?.code}</p><h2>{item.equipmentSnapshot?.name}</h2><p>{item.reportedSymptom}</p></div><dl><div><dt>Fecha</dt><dd>{date}</dd></div><div><dt>Área</dt><dd>{getAreaName(item.areaId)}</dd></div><div><dt>Duración</dt><dd>{formatDuration(minutes)}</dd></div><div><dt>Estado</dt><dd>{statusNames[item.status] ?? item.status}</dd></div></dl>{item.status === 'in_progress' && item.createdBy === user.uid ? <Link className="button button--primary" to={`/correctivos/${item.id}/finalizar`}>Finalizar</Link> : canManage ? <Link to={`/correctivos/${item.id}/editar`}>Editar o anular</Link> : null}</article>
      })}</div>}
      <div className="panel section-heading-row"><p role="status">{records.length} cargados · {filteredRecords.length} coincidencias{!loading && !error && !hasMore ? ' · Fin de resultados' : ''}</p><div className="heading-actions"><button type="button" className="button button--secondary" onClick={refresh} disabled={loading || loadingMore}>Actualizar</button>{hasMore && <button type="button" className="button button--primary" onClick={loadMore} disabled={loading || loadingMore}>{loadingMore ? 'Cargando…' : 'Cargar más'}</button>}</div></div>
    </section>
  )
}

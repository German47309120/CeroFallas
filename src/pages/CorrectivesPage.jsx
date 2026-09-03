import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAreaName } from '../config/catalogs.js'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { listCorrectives } from '../services/firebase/correctives.js'
import { formatDuration } from '../utils/duration.js'

const statusNames = { draft: 'Borrador', completed: 'Completado', voided: 'Anulado' }

export default function CorrectivesPage() {
  const { hasPermission, profileLoading } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const canRead = hasPermission('corrective.read')
  const canCreate = hasPermission('corrective.create')
  const canManage = hasPermission('corrective.manage')

  useEffect(() => {
    if (profileLoading) return
    if (!canRead) { setLoading(false); return }
    listCorrectives().then(setRecords).catch(() => setError('No fue posible cargar los correctivos.')).finally(() => setLoading(false))
  }, [canRead, profileLoading])

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es')
    return records.filter((item) => {
      const match = !term || [item.equipmentSnapshot?.code, item.equipmentSnapshot?.name, item.reportedSymptom, item.workPerformed].some((value) => value?.toLocaleLowerCase('es').includes(term))
      return match && (status === 'all' || item.status === status)
    })
  }, [records, search, status])

  if (profileLoading || loading) return <div className="panel empty-state"><p>Cargando correctivos…</p></div>
  if (!canRead) return <section className="page-stack"><div className="page-heading"><div><p className="eyebrow">Mantenimiento</p><h1>Correctivos</h1></div></div><div className="panel empty-state"><h2>Acceso restringido</h2><p>Tu perfil no tiene permiso para consultar correctivos.</p></div></section>

  return (
    <section className="page-stack" aria-labelledby="correctives-title">
      <div className="page-heading"><div><p className="eyebrow">Mantenimiento</p><h1 id="correctives-title">Correctivos</h1><p>Registra fallas no planificadas y sus tiempos reales de atención.</p></div>{canCreate ? <Link className="button button--primary" to="/correctivos/nuevo">Nuevo correctivo</Link> : null}</div>
      <div className="filter-bar" aria-label="Filtros de correctivos"><label><span>Buscar</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Equipo, síntoma o trabajo" /></label><label><span>Estado</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option><option value="draft">Borrador</option><option value="completed">Completado</option><option value="voided">Anulado</option></select></label><button className="button button--secondary" type="button" onClick={() => { setSearch(''); setStatus('all') }}>Limpiar</button></div>
      {error ? <p className="form-error" role="alert">{error}</p> : records.length === 0 ? <div className="panel empty-state"><span className="empty-state__mark" aria-hidden="true">CF</span><h2>Sin correctivos</h2><p>Los registros aparecerán aquí después de guardar el primer reporte.</p></div> : filteredRecords.length === 0 ? <div className="panel empty-state"><h2>Sin coincidencias</h2><p>Ajusta los filtros.</p></div> : <div className="records-list">{filteredRecords.map((item) => <article className={`panel record-card ${item.status === 'voided' ? 'record-card--voided' : ''}`} key={item.id}><div><p className="eyebrow">{item.equipmentSnapshot?.code}</p><h2>{item.equipmentSnapshot?.name}</h2><p>{item.reportedSymptom}</p></div><dl><div><dt>Fecha</dt><dd>{item.eventDate}</dd></div><div><dt>Área</dt><dd>{getAreaName(item.areaId)}</dd></div><div><dt>Duración</dt><dd>{formatDuration(item.durationMinutes)}</dd></div><div><dt>Estado</dt><dd>{statusNames[item.status] ?? item.status}</dd></div></dl>{canManage ? <Link to={`/correctivos/${item.id}/editar`}>Editar o anular</Link> : null}</article>)}</div>}
    </section>
  )
}

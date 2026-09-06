import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { equipmentStatuses, getAreaName } from '../config/catalogs.js'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { resourceReaders } from '../services/firebase/history.js'
import { usePagedHistory } from '../features/usePagedHistory.js'
import HistoryControls from '../components/HistoryControls.jsx'

const statusNames = Object.fromEntries(equipmentStatuses.map((status) => [status.value, status.label]))

export default function EquipmentPage() {
  const { hasPermission, profileLoading, user } = useAuth()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const canRead = hasPermission('equipment.read')
  const canManage = hasPermission('equipment.manage')
  const history = usePagedHistory({ enabled: canRead && !profileLoading, scope: user?.uid, status, readPage: resourceReaders.equipment })
  const { records: equipment, loading, error } = history

  const filteredEquipment = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es')
    return equipment.filter((item) => {
      const matchesTerm = !term || [item.code, item.name, item.type]
        .some((value) => value?.toLocaleLowerCase('es').includes(term))
      return matchesTerm
    })
  }, [equipment, search])

  if (profileLoading || loading) {
    return <div className="panel empty-state"><p>Cargando catálogo de equipos…</p></div>
  }

  if (!canRead) {
    return (
      <section className="page-stack">
        <div className="page-heading"><div><p className="eyebrow">Activos</p><h1>Equipos</h1></div></div>
        <div className="panel empty-state"><h2>Acceso restringido</h2><p>Tu perfil no tiene permiso para consultar equipos.</p></div>
      </section>
    )
  }

  return (
    <section className="page-stack" aria-labelledby="equipment-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Activos</p>
          <h1 id="equipment-title">Equipos</h1>
          <p>Catálogo central paginado. El estado se aplica sobre todo el catálogo; el texto busca entre equipos cargados.</p>
        </div>
        {canManage && <Link className="button button--primary" to="/equipos/nuevo">Nuevo equipo</Link>}
      </div>

      <div className="filter-bar" aria-label="Filtros de equipos">
        <label><span>Buscar</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Código, equipo o tipo" /></label>
        <label><span>Estado</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option>{equipmentStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <button className="button button--secondary" type="button" onClick={() => { setSearch(''); setStatus('all') }}>Limpiar</button>
      </div>

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {!error && equipment.length === 0 ? (
        <div className="panel empty-state"><span className="empty-state__mark" aria-hidden="true">CF</span><h2>Catálogo pendiente</h2><p>No se han registrado equipos. Esto evita presentar como reales los datos aún pendientes de la visita a planta.</p></div>
      ) : !error && filteredEquipment.length === 0 ? (
        <div className="panel empty-state"><h2>Sin coincidencias</h2><p>Ajusta la búsqueda o el filtro de estado.</p></div>
      ) : (
        <div className="equipment-grid">
          {filteredEquipment.map((item) => (
            <article className="panel equipment-card" key={item.id}>
              <div><p className="eyebrow">{item.code}</p><h2>{item.name}</h2><p>{item.type}</p>{canManage ? <Link to={`/equipos/${item.id}/editar`}>Editar equipo</Link> : null}</div>
              <dl><div><dt>Área</dt><dd>{getAreaName(item.areaId)}</dd></div><div><dt>Estado</dt><dd><span className={`status-badge status-badge--${item.status}`}>{statusNames[item.status] ?? item.status}</span></dd></div>{item.model ? <div><dt>Modelo</dt><dd>{item.model}</dd></div> : null}</dl>
            </article>
          ))}
        </div>
      )}
      <HistoryControls history={history} visibleCount={filteredEquipment.length} label="Catálogo de equipos" />
    </section>
  )
}

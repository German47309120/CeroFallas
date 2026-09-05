import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { resourceReaders } from '../services/firebase/history.js'
import { usePagedHistory } from '../features/usePagedHistory.js'
import HistoryControls from '../components/HistoryControls.jsx'

const resultNames = { fit: 'Apto', attention_required: 'Requiere atención', out_of_service: 'Fuera de servicio' }

export default function ForkliftInspectionsPage() {
  const { hasPermission, profileLoading, user } = useAuth()
  const canRead = hasPermission('forklift.read')
  const history = usePagedHistory({ enabled: canRead && !profileLoading, scope: user?.uid, status: 'all', readPage: resourceReaders.forkliftInspections })
  const { records: inspections, loading, error } = history
  if (profileLoading || loading) return <div className="panel empty-state"><p>Cargando inspecciones…</p></div>
  if (!canRead) return <section className="page-stack"><div className="page-heading"><div><p className="eyebrow">Inspección</p><h1>Checklist de montacargas</h1></div></div><div className="panel empty-state"><h2>Acceso restringido</h2><p>Tu perfil no tiene permiso para consultar inspecciones.</p></div></section>
  return <section className="page-stack" aria-labelledby="forklift-title"><div className="page-heading"><div><p className="eyebrow">Inspección diaria</p><h1 id="forklift-title">Checklist de montacargas</h1><p>Evalúa condición visual, niveles, operación y dispositivos de seguridad.</p></div>{hasPermission('forklift.inspect') ? <Link className="button button--primary" to="/montacargas/nuevo">Nueva inspección</Link> : null}</div>{error && <p className="form-error" role="alert">{error}</p>}{inspections.length === 0 && !error ? <div className="panel empty-state"><span className="empty-state__mark">CF</span><h2>Sin inspecciones</h2><p>El historial aparecerá después de completar el primer checklist.</p></div> : <div className="records-list">{inspections.map((inspection) => <article className="panel record-card" key={inspection.id}><div><p className="eyebrow">{inspection.equipmentSnapshot.code}</p><h2>{inspection.equipmentSnapshot.name}</h2><p>{inspection.inspectedAt.toDate().toLocaleString('es-GT')}</p></div><dl><div><dt>Horómetro</dt><dd>{inspection.hourMeter}</dd></div><div><dt>Turno</dt><dd>{inspection.shiftId === 'shift-1' ? 'Turno 1' : 'Turno 2'}</dd></div><div><dt>Fallas críticas</dt><dd>{inspection.criticalFailures}</dd></div><div><dt>Resultado</dt><dd><span className={`status-badge result-badge--${inspection.overallResult}`}>{resultNames[inspection.overallResult]}</span></dd></div></dl></article>)}</div>}<HistoryControls history={history} /></section>
}

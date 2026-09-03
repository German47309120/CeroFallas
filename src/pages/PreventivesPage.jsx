import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { listPreventiveExecutions, listPreventivePlans } from '../services/firebase/preventives.js'
import { formatDuration } from '../utils/duration.js'
import { frequencyLabel } from '../utils/preventive.js'

const planStatus = { active: 'Activo', paused: 'Pausado', completed: 'Completado', voided: 'Anulado' }
const complianceNames = { on_time: 'A tiempo', late: 'Tardío', unscheduled: 'No programado' }

export default function PreventivesPage() {
  const { hasPermission, profileLoading } = useAuth()
  const [plans, setPlans] = useState([])
  const [executions, setExecutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const canRead = hasPermission('preventive.read')

  useEffect(() => {
    if (profileLoading) return
    if (!canRead) { setLoading(false); return }
    Promise.all([listPreventivePlans(), listPreventiveExecutions()]).then(([nextPlans, nextExecutions]) => { setPlans(nextPlans); setExecutions(nextExecutions) }).catch(() => setError('No fue posible cargar los preventivos.')).finally(() => setLoading(false))
  }, [canRead, profileLoading])

  if (profileLoading || loading) return <div className="panel empty-state"><p>Cargando preventivos…</p></div>
  if (!canRead) return <section className="page-stack"><div className="page-heading"><div><p className="eyebrow">Mantenimiento</p><h1>Preventivos</h1></div></div><div className="panel empty-state"><h2>Acceso restringido</h2><p>Tu perfil no tiene permiso para consultar preventivos.</p></div></section>

  return <section className="page-stack" aria-labelledby="preventives-title">
    <div className="page-heading"><div><p className="eyebrow">Mantenimiento planificado</p><h1 id="preventives-title">Preventivos</h1><p>Programa actividades y registra su ejecución sin ocultar que las frecuencias iniciales son estimadas.</p></div><div className="heading-actions">{hasPermission('preventive.execute') ? <Link className="button button--secondary" to="/preventivos/ejecutar">Registrar ejecución</Link> : null}{hasPermission('preventive.plan') ? <Link className="button button--primary" to="/preventivos/nuevo">Nuevo plan</Link> : null}</div></div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <div className="panel"><div className="panel__heading"><div><p className="eyebrow">Programación</p><h2>Planes preventivos</h2></div></div>{plans.length === 0 ? <div className="empty-state empty-state--compact"><p>No hay planes registrados.</p></div> : <div className="records-list records-list--inside">{plans.map((plan) => <article className="record-row" key={plan.id}><div><strong>{plan.activityName}</strong><span>{plan.equipmentSnapshot.code} — {plan.equipmentSnapshot.name}</span></div><div><span>{frequencyLabel(plan.frequencyType, plan.frequencyValue, plan.frequencyUnit)}</span><small>Próximo: {plan.nextDueAt.toDate().toLocaleDateString('es-GT')}</small></div><span className="status-badge">{planStatus[plan.status]}</span>{hasPermission('preventive.manage') ? <Link to={`/preventivos/${plan.id}/editar`}>Editar</Link> : null}</article>)}</div>}</div>
    <div className="panel"><div className="panel__heading"><div><p className="eyebrow">Historial</p><h2>Ejecuciones</h2></div></div>{executions.length === 0 ? <div className="empty-state empty-state--compact"><p>No hay ejecuciones registradas.</p></div> : <div className="records-list records-list--inside">{executions.map((execution) => <article className="record-row" key={execution.id}><div><strong>{execution.equipmentSnapshot.name}</strong><span>{execution.activityPerformed}</span></div><div><span>{formatDuration(execution.durationMinutes)}</span><small>{execution.startedAt.toDate().toLocaleDateString('es-GT')}</small></div><span className="status-badge">{complianceNames[execution.complianceStatus]}</span></article>)}</div>}</div>
  </section>
}

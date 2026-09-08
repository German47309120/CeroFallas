import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { resourceReaders } from '../services/firebase/history.js'
import { usePagedHistory } from '../features/usePagedHistory.js'
import HistoryControls from '../components/HistoryControls.jsx'
import { formatDuration } from '../utils/duration.js'
import { frequencyLabel } from '../utils/preventive.js'
import { voidPreventiveExecution } from '../services/firebase/preventives.js'

const planStatus = { active: 'Activo', paused: 'Pausado', completed: 'Completado', voided: 'Anulado' }
const complianceNames = { on_time: 'A tiempo', late: 'Tardío', unscheduled: 'No programado' }
const rescheduleNames = { automatic: 'Plan reprogramado', manual_required: 'Reprogramación manual pendiente', not_applicable: 'Sin plan asociado' }

export default function PreventivesPage() {
  const { hasPermission, profileLoading, user } = useAuth()
  const canRead = hasPermission('preventive.read')
  const canManage = hasPermission('preventive.manage')
  const [voiding, setVoiding] = useState(null)
  const [voidReason, setVoidReason] = useState('')
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)

  const planHistory = usePagedHistory({ enabled: canRead && !profileLoading, scope: user?.uid, status: 'all', readPage: resourceReaders.preventivePlans })
  const executionHistory = usePagedHistory({ enabled: canRead && !profileLoading, scope: user?.uid, status: 'all', readPage: resourceReaders.preventiveExecutions })
  const plans = planHistory.records
  const executions = executionHistory.records
  const loading = planHistory.loading || executionHistory.loading
  const error = planHistory.error || executionHistory.error

  async function confirmVoid(event) {
    event.preventDefault()
    setSaving(true)
    setActionError('')
    try {
      await voidPreventiveExecution(voiding.id, voidReason, user.uid)
      setVoiding(null)
      setVoidReason('')
      await Promise.all([planHistory.refresh(), executionHistory.refresh()])
    } catch (action) {
      setActionError(action?.code === 'permission-denied' ? 'Tu perfil no tiene permiso para anular esta ejecución.' : action.message || 'No fue posible anular la ejecución.')
    } finally {
      setSaving(false)
    }
  }

  if (profileLoading || loading) return <div className="panel empty-state"><p>Cargando preventivos…</p></div>
  if (!canRead) return <section className="page-stack"><div className="page-heading"><div><p className="eyebrow">Mantenimiento</p><h1>Preventivos</h1></div></div><div className="panel empty-state"><h2>Acceso restringido</h2><p>Tu perfil no tiene permiso para consultar preventivos.</p></div></section>

  return <section className="page-stack" aria-labelledby="preventives-title">
    <div className="page-heading"><div><p className="eyebrow">Mantenimiento planificado</p><h1 id="preventives-title">Preventivos</h1><p>Programa actividades y registra su ejecución sin ocultar que las frecuencias iniciales son estimadas.</p></div><div className="heading-actions">{hasPermission('preventive.execute') ? <Link className="button button--secondary" to="/preventivos/ejecutar">Registrar ejecución</Link> : null}{hasPermission('preventive.plan') ? <Link className="button button--primary" to="/preventivos/nuevo">Nuevo plan</Link> : null}</div></div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {actionError ? <p className="form-error" role="alert">{actionError}</p> : null}
    <div className="panel"><div className="panel__heading"><div><p className="eyebrow">Programación</p><h2>Planes preventivos</h2></div></div>{plans.length === 0 && !planHistory.error ? <div className="empty-state empty-state--compact"><p>No hay planes registrados.</p></div> : <div className="records-list records-list--inside">{plans.map((plan) => <article className="record-row" key={plan.id}><div><strong>{plan.activityName}</strong><span>{plan.equipmentSnapshot.code} — {plan.equipmentSnapshot.name}</span></div><div><span>{frequencyLabel(plan.frequencyType, plan.frequencyValue, plan.frequencyUnit)}</span><small>Próximo: {plan.nextDueAt.toDate().toLocaleDateString('es-GT')}</small></div><span className="status-badge">{planStatus[plan.status]}</span>{hasPermission('preventive.manage') ? <Link to={`/preventivos/${plan.id}/editar`}>Editar</Link> : null}</article>)}</div>}<HistoryControls history={planHistory} label="Planes preventivos" /></div>
    <div className="panel"><div className="panel__heading"><div><p className="eyebrow">Historial</p><h2>Ejecuciones</h2></div></div>{executions.length === 0 && !executionHistory.error ? <div className="empty-state empty-state--compact"><p>No hay ejecuciones registradas.</p></div> : <div className="records-list records-list--inside">{executions.map((execution) => <article className={`record-row ${execution.status === 'voided' ? 'record-card--voided' : ''}`} key={execution.id}><div><strong>{execution.equipmentSnapshot.name}</strong><span>{execution.activityPerformed}</span><small>{rescheduleNames[execution.rescheduleStatus] || 'Registro anterior sin estado de reprogramación'}</small>{execution.voidReason && <small><strong>Motivo de anulación:</strong> {execution.voidReason}</small>}</div><div><span>{formatDuration(execution.durationMinutes)}</span><small>{execution.startedAt.toDate().toLocaleDateString('es-GT')}</small></div><span className="status-badge">{execution.status === 'voided' ? 'Anulado' : complianceNames[execution.complianceStatus]}</span>{canManage && execution.status !== 'voided' ? <button className="button button--secondary" type="button" onClick={() => { setVoiding(execution); setVoidReason(''); setActionError('') }}>Anular ejecución</button> : null}</article>)}</div>}<HistoryControls history={executionHistory} label="Ejecuciones preventivas" /></div>
    {voiding && <form className="panel data-form" onSubmit={confirmVoid}><div><p className="eyebrow">CONTROL DEL REGISTRO</p><h2>Anular ejecución preventiva</h2><p>El trabajo original seguirá en el histórico. Si era la última ejecución de un plan calendario, la fecha programada anterior se restaurará para revisión.</p></div><label>Motivo de anulación *<textarea required minLength="10" maxLength="500" rows="4" value={voidReason} onChange={(event) => setVoidReason(event.target.value)} /></label><div className="form-actions"><button className="button button--secondary" type="button" disabled={saving} onClick={() => { setVoiding(null); setVoidReason(''); setActionError('') }}>Cancelar</button><button className="button button--primary" disabled={saving}>{saving ? 'Anulando…' : 'Confirmar anulación'}</button></div></form>}
  </section>
}

import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { listEquipment } from '../services/firebase/equipment.js'
import { completePreventiveExecution, getPreventiveExecution, listPreventivePlans, startPreventiveExecution } from '../services/firebase/preventives.js'
import { guatemalaDateInputValue } from '../utils/dateInput.js'

const initialValues = { planId: '', equipmentId: '', scheduledDate: '', activityPerformed: '', observations: '', spareParts: [] }

export default function PreventiveExecutionFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { executionId } = useParams()
  const isCompleting = Boolean(executionId) && location.pathname.endsWith('/finalizar')
  const { hasPermission, profile, profileLoading, user } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [plans, setPlans] = useState([])
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const permitted = hasPermission('preventive.execute')

  useEffect(() => {
    if (profileLoading || !permitted) return
    Promise.all([listPreventivePlans(), listEquipment(), isCompleting ? getPreventiveExecution(executionId) : Promise.resolve(null)])
      .then(([nextPlans, nextEquipment, execution]) => {
        setPlans(nextPlans.filter((plan) => plan.status === 'active'))
        setEquipment(nextEquipment.filter((item) => item.status === 'active'))
        if (isCompleting) {
          if (!execution || execution.status !== 'in_progress') throw new Error('Ejecución no disponible')
          setValues((current) => ({ ...current, planId: execution.planId || '', equipmentId: execution.equipmentId, scheduledDate: execution.scheduledAt ? guatemalaDateInputValue(execution.scheduledAt.toDate()) : '' }))
        }
      })
      .catch(() => setError('No fue posible cargar planes, equipos o la ejecución.'))
      .finally(() => setLoading(false))
  }, [executionId, isCompleting, permitted, profileLoading])

  if (profileLoading || (permitted && loading)) return <div className="panel empty-state"><p>Cargando ejecución…</p></div>
  if (!permitted) return <Navigate to="/preventivos" replace />

  function update(event) {
    const { name, value } = event.target
    setValues((current) => {
      const next = { ...current, [name]: value }
      if (name === 'planId') {
        const plan = plans.find((item) => item.id === value)
        next.equipmentId = plan?.equipmentId || ''
        next.scheduledDate = plan?.nextDueAt ? guatemalaDateInputValue(plan.nextDueAt.toDate()) : ''
      }
      return next
    })
  }

  const addPart = () => setValues((current) => ({ ...current, spareParts: [...current.spareParts, { code: '', description: '', quantity: 1 }] }))
  const changePart = (index, field, value) => setValues((current) => ({ ...current, spareParts: current.spareParts.map((part, position) => position === index ? { ...part, [field]: value } : part) }))
  const removePart = (index) => setValues((current) => ({ ...current, spareParts: current.spareParts.filter((_, position) => position !== index) }))

  async function submit(event) {
    event.preventDefault(); setError('')
    if (!values.equipmentId) { setError('Selecciona un equipo.'); return }
    if (isCompleting && !values.activityPerformed.trim()) { setError('Describe la actividad realizada antes de finalizar.'); return }
    if (values.spareParts.some((part) => !part.code.trim() || !part.description.trim() || !(Number(part.quantity) > 0))) { setError('Completa todos los datos de cada repuesto.'); return }
    const selectedEquipment = equipment.find((item) => item.id === values.equipmentId)
    const selectedPlan = plans.find((item) => item.id === values.planId) ?? null
    if (!selectedEquipment) { setError('Selecciona un equipo activo válido.'); return }
    setSaving(true)
    try {
      if (isCompleting) { await completePreventiveExecution(executionId, values, user.uid); navigate('/preventivos', { replace: true }) }
      else { const id = await startPreventiveExecution(values, selectedEquipment, selectedPlan, user.uid); navigate(`/preventivos/ejecuciones/${id}/finalizar`, { replace: true }) }
    } catch (saveError) { setError(saveError?.code === 'permission-denied' ? 'Tu perfil no tiene permiso para registrar la ejecución.' : 'No fue posible guardar la ejecución.') }
    finally { setSaving(false) }
  }

  return <section className="page-stack" aria-labelledby="execution-title">
    <div className="page-heading"><div><p className="eyebrow">Mantenimiento preventivo</p><h1 id="execution-title">{isCompleting ? 'Finalizar preventivo' : 'Iniciar preventivo'}</h1><p>El sistema registra inicio y finalización con tiempo oficial no editable.</p></div><Link className="button button--secondary" to="/preventivos">Cancelar</Link></div>
    <form className="panel data-form" onSubmit={submit} noValidate>
      <div className="form-section"><div><h2>Plan y equipo</h2><p>La fecha programada proviene del plan; la fecha ejecutada se obtiene del servidor.</p></div><div className="form-grid">
        <label><span>Plan preventivo</span><select name="planId" value={values.planId} onChange={update} disabled={isCompleting}><option value="">Actividad no programada</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.activityName} — {plan.equipmentSnapshot.code}</option>)}</select></label>
        <label><span>Equipo *</span><select name="equipmentId" value={values.equipmentId} onChange={update} disabled={isCompleting || Boolean(values.planId)}><option value="">Selecciona un equipo</option>{equipment.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select></label>
        <div className="calculated-field"><span>Fecha programada</span><strong>{values.scheduledDate || 'No programada'}</strong></div>
        <div className="calculated-field"><span>Tiempo oficial</span><strong>{isCompleting ? 'Finaliza al confirmar' : 'Inicia al confirmar'}</strong></div>
        <div className="calculated-field"><span>Responsable</span><strong>{profile?.displayName || user.email}</strong></div>
      </div></div>
      {isCompleting && <><div className="form-section"><div><h2>Trabajo ejecutado</h2></div><div className="form-grid"><label className="form-field--wide"><span>Actividad realizada *</span><textarea name="activityPerformed" value={values.activityPerformed} onChange={update} rows="4" maxLength="1000" /></label><label className="form-field--wide"><span>Observaciones</span><textarea name="observations" value={values.observations} onChange={update} rows="3" maxLength="500" /></label></div></div>
        <div className="form-section"><div className="section-heading-row"><div><h2>Repuestos utilizados</h2><p>Registra los consumos antes de finalizar.</p></div><button className="button button--secondary" type="button" onClick={addPart}>Agregar repuesto</button></div>{values.spareParts.length === 0 ? <p className="muted-copy">No se reportaron repuestos.</p> : <div className="repeater-list">{values.spareParts.map((part, index) => <div className="repeater-row" key={`part-${index}`}><label><span>Código</span><input value={part.code} onChange={(event) => changePart(index, 'code', event.target.value)} /></label><label><span>Descripción</span><input value={part.description} onChange={(event) => changePart(index, 'description', event.target.value)} /></label><label><span>Cantidad</span><input type="number" min="0.01" step="0.01" value={part.quantity} onChange={(event) => changePart(index, 'quantity', event.target.value)} /></label><button className="button button--secondary" type="button" onClick={() => removePart(index)}>Quitar</button></div>)}</div>}</div></>}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="form-actions"><Link className="button button--secondary" to="/preventivos">Cancelar</Link><button className="button button--primary" disabled={saving}>{saving ? 'Guardando…' : isCompleting ? 'Finalizar con hora oficial' : 'Iniciar con hora oficial'}</button></div>
    </form>
  </section>
}

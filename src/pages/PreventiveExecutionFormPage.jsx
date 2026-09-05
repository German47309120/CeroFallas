import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { listEquipment } from '../services/firebase/equipment.js'
import { createPreventiveExecution, listPreventivePlans } from '../services/firebase/preventives.js'
import { buildMaintenanceTimes, formatDuration } from '../utils/duration.js'
import { complianceStatus } from '../utils/preventive.js'

const today = () => new Date().toISOString().slice(0, 10)
const initialValues = { planId: '', equipmentId: '', scheduledDate: '', eventDate: today(), startTime: '', endTime: '', endsNextDay: false, activityPerformed: '', observations: '', spareParts: [] }

export default function PreventiveExecutionFormPage() {
  const navigate = useNavigate()
  const { hasPermission, profile, profileLoading, user } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [plans, setPlans] = useState([])
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const permitted = hasPermission('preventive.execute')

  useEffect(() => { if (profileLoading || !permitted) return; Promise.all([listPreventivePlans(), listEquipment()]).then(([nextPlans, nextEquipment]) => { setPlans(nextPlans.filter((plan) => plan.status === 'active')); setEquipment(nextEquipment.filter((item) => item.status === 'active')) }).catch(() => setError('No fue posible cargar planes y equipos.')).finally(() => setLoading(false)) }, [permitted, profileLoading])
  const duration = useMemo(() => { try { return buildMaintenanceTimes(values.eventDate, values.startTime, values.endTime, values.endsNextDay) } catch { return null } }, [values])
  if (profileLoading || (permitted && loading)) return <div className="panel empty-state"><p>Cargando ejecución…</p></div>
  if (!permitted) return <Navigate to="/preventivos" replace />

  function update(event) {
    const { checked, name, type, value } = event.target
    setValues((current) => {
      const next = { ...current, [name]: type === 'checkbox' ? checked : value }
      if (name === 'planId') { const plan = plans.find((item) => item.id === value); if (plan) { next.equipmentId = plan.equipmentId; next.scheduledDate = plan.nextDueAt.toDate().toISOString().slice(0, 10) } }
      return next
    })
  }
  const addPart = () => setValues((current) => ({ ...current, spareParts: [...current.spareParts, { code: '', description: '', quantity: 1 }] }))
  const changePart = (index, field, value) => setValues((current) => ({ ...current, spareParts: current.spareParts.map((part, position) => position === index ? { ...part, [field]: value } : part) }))
  const removePart = (index) => setValues((current) => ({ ...current, spareParts: current.spareParts.filter((_, position) => position !== index) }))

  async function submit(event) {
    event.preventDefault(); setError('')
    if (!values.equipmentId || !values.eventDate || !values.startTime || !values.endTime || !values.activityPerformed.trim()) { setError('Completa equipo, fecha, horas y actividad realizada.'); return }
    if (!duration) { setError('El rango debe ser mayor que cero y no superar 24 horas.'); return }
    if (values.spareParts.some((part) => !part.code.trim() || !part.description.trim() || !(Number(part.quantity) > 0))) { setError('Completa todos los datos de cada repuesto.'); return }
    const selectedEquipment = equipment.find((item) => item.id === values.equipmentId)
    const selectedPlan = plans.find((item) => item.id === values.planId) ?? null
    if (!selectedEquipment) { setError('Selecciona un equipo activo válido.'); return }
    const compliance = complianceStatus(values.scheduledDate, duration.startedAt)
    setSaving(true)
    try { await createPreventiveExecution(values, duration, selectedEquipment, selectedPlan, compliance, user.uid); navigate('/preventivos', { replace: true }) } catch (saveError) { setError(saveError?.code === 'permission-denied' ? 'Tu perfil no tiene permiso para registrar la ejecución.' : 'No fue posible guardar la ejecución.') } finally { setSaving(false) }
  }

  return <section className="page-stack" aria-labelledby="execution-title"><div className="page-heading"><div><p className="eyebrow">Mantenimiento preventivo</p><h1 id="execution-title">Registrar ejecución</h1><p>Documenta el trabajo y calcula el cumplimiento respecto de la fecha programada.</p></div><Link className="button button--secondary" to="/preventivos">Cancelar</Link></div><form className="panel data-form" onSubmit={submit} noValidate><div className="form-section"><div><h2>Plan y tiempo</h2><p>Al completar un plan por calendario, su próxima fecha se calcula desde el día ejecutado. Los planes por horas o condición requieren revisión manual.</p></div><div className="form-grid"><label><span>Plan preventivo</span><select name="planId" value={values.planId} onChange={update}><option value="">Actividad no programada</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.activityName} — {plan.equipmentSnapshot.code}</option>)}</select></label><label><span>Equipo *</span><select name="equipmentId" value={values.equipmentId} onChange={update} disabled={Boolean(values.planId)}><option value="">Selecciona un equipo</option>{equipment.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select></label><label><span>Fecha programada</span><input type="date" name="scheduledDate" value={values.scheduledDate} onChange={update} /></label><label><span>Fecha ejecutada *</span><input type="date" name="eventDate" value={values.eventDate} onChange={update} /></label><label><span>Inicio *</span><input type="time" name="startTime" value={values.startTime} onChange={update} /></label><label><span>Finalización *</span><input type="time" name="endTime" value={values.endTime} onChange={update} /></label><label className="checkbox-field"><input type="checkbox" name="endsNextDay" checked={values.endsNextDay} onChange={update} /><span>Finalizó al día siguiente</span></label><div className="calculated-field"><span>Duración</span><strong>{duration ? formatDuration(duration.durationMinutes) : 'Pendiente'}</strong></div><div className="calculated-field"><span>Responsable</span><strong>{profile?.displayName || user.email}</strong></div></div></div><div className="form-section"><div><h2>Trabajo ejecutado</h2></div><div className="form-grid"><label className="form-field--wide"><span>Actividad realizada *</span><textarea name="activityPerformed" value={values.activityPerformed} onChange={update} rows="4" maxLength="1000" /></label><label className="form-field--wide"><span>Observaciones</span><textarea name="observations" value={values.observations} onChange={update} rows="3" maxLength="500" /></label></div></div><div className="form-section"><div className="section-heading-row"><div><h2>Repuestos utilizados</h2><p>La selección desde SAP se conectará después.</p></div><button className="button button--secondary" type="button" onClick={addPart}>Agregar repuesto</button></div>{values.spareParts.length === 0 ? <p className="muted-copy">No se reportaron repuestos.</p> : <div className="repeater-list">{values.spareParts.map((part, index) => <div className="repeater-row" key={`part-${index}`}><label><span>Código</span><input value={part.code} onChange={(event) => changePart(index, 'code', event.target.value)} /></label><label><span>Descripción</span><input value={part.description} onChange={(event) => changePart(index, 'description', event.target.value)} /></label><label><span>Cantidad</span><input type="number" min="0.01" step="0.01" value={part.quantity} onChange={(event) => changePart(index, 'quantity', event.target.value)} /></label><button className="button button--secondary" type="button" onClick={() => removePart(index)}>Quitar</button></div>)}</div>}</div>{error ? <p className="form-error" role="alert">{error}</p> : null}<div className="form-actions"><Link className="button button--secondary" to="/preventivos">Cancelar</Link><button className="button button--primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar ejecución'}</button></div></form></section>
}

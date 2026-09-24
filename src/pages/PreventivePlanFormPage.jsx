import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { listEquipment } from '../services/firebase/equipment.js'
import { createPreventivePlan, getPreventivePlan, updatePreventivePlan } from '../services/firebase/preventives.js'
import { guatemalaDateInputValue } from '../utils/dateInput.js'

const initialValues = { equipmentId: '', activityName: '', activityDescription: '', frequencyType: 'calendar', frequencyValue: '30', frequencyUnit: 'day', nextDueDate: '', status: 'active', voidReason: '' }

export default function PreventivePlanFormPage() {
  const navigate = useNavigate()
  const { planId } = useParams()
  const { hasPermission, profileLoading, user } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const isEditing = Boolean(planId)
  const permitted = isEditing ? hasPermission('preventive.manage') : hasPermission('preventive.plan')

  useEffect(() => {
    if (profileLoading || !permitted) return
    Promise.all([listEquipment(), isEditing ? getPreventivePlan(planId) : Promise.resolve(null)]).then(([items, plan]) => {
      setEquipment(items.filter((item) => item.status === 'active' || item.id === plan?.equipmentId))
      if (isEditing && !plan) { setError('El plan solicitado no existe.'); return }
      if (plan) setValues({ equipmentId: plan.equipmentId, activityName: plan.activityName, activityDescription: plan.activityDescription ?? '', frequencyType: plan.frequencyType, frequencyValue: plan.frequencyValue?.toString() ?? '', frequencyUnit: plan.frequencyUnit === 'hour' ? 'day' : plan.frequencyUnit ?? 'day', nextDueDate: guatemalaDateInputValue(plan.nextDueAt.toDate()), status: plan.status, voidReason: plan.voidReason ?? '' })
    }).catch(() => setError('No fue posible cargar el formulario.')).finally(() => setLoading(false))
  }, [isEditing, permitted, planId, profileLoading])

  if (profileLoading || (permitted && loading)) return <div className="panel empty-state"><p>Cargando plan…</p></div>
  if (!permitted) return <Navigate to="/preventivos" replace />
  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }))

  async function submit(event) {
    event.preventDefault(); setError('')
    if (!values.equipmentId || !values.activityName.trim() || !values.nextDueDate) { setError('Completa equipo, actividad y próxima fecha.'); return }
    if (values.frequencyType !== 'condition' && !(Number(values.frequencyValue) > 0)) { setError('La frecuencia debe ser mayor que cero.'); return }
    if (values.status === 'voided' && !values.voidReason.trim()) { setError('Indica el motivo de anulación.'); return }
    const selected = equipment.find((item) => item.id === values.equipmentId)
    if (!selected) { setError('Selecciona un equipo válido.'); return }
    setSaving(true)
    try { if (isEditing) await updatePreventivePlan(planId, values, selected, user.uid); else await createPreventivePlan(values, selected, user.uid); navigate('/preventivos', { replace: true }) } catch (saveError) { setError(saveError?.code === 'permission-denied' ? 'Tu perfil no tiene permiso para guardar este plan.' : 'No fue posible guardar el plan.') } finally { setSaving(false) }
  }

  return <section className="page-stack" aria-labelledby="plan-title"><div className="page-heading"><div><p className="eyebrow">Mantenimiento preventivo</p><h1 id="plan-title">{isEditing ? 'Editar plan' : 'Nuevo plan'}</h1><p>Programa la actividad y su próxima fecha de ejecución.</p></div><Link className="button button--secondary" to="/preventivos">Cancelar</Link></div><form className="panel data-form" onSubmit={submit} noValidate><div className="form-section"><div><h2>Actividad programada</h2><p>Relaciona el plan con un equipo activo.</p></div><div className="form-grid"><label><span>Equipo *</span><select name="equipmentId" value={values.equipmentId} onChange={update}><option value="">Selecciona un equipo</option>{equipment.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select></label><label><span>Nombre de actividad *</span><input name="activityName" value={values.activityName} onChange={update} maxLength="120" /></label><label className="form-field--wide"><span>Descripción</span><textarea name="activityDescription" value={values.activityDescription} onChange={update} maxLength="700" rows="4" /></label></div></div><div className="form-section"><div><h2>Frecuencia</h2><p>Define si la actividad se controla por calendario, horas de uso o condición.</p></div><div className="form-grid"><label><span>Tipo</span><select name="frequencyType" value={values.frequencyType} onChange={update}><option value="calendar">Calendario</option><option value="hours">Horas de uso</option><option value="condition">Según condición</option></select></label>{values.frequencyType !== 'condition' ? <label><span>Intervalo *</span><input type="number" min="1" name="frequencyValue" value={values.frequencyValue} onChange={update} /></label> : null}{values.frequencyType === 'calendar' ? <label><span>Unidad</span><select name="frequencyUnit" value={values.frequencyUnit} onChange={update}><option value="day">Días</option><option value="week">Semanas</option><option value="month">Meses</option></select></label> : null}<label><span>Próxima fecha *</span><input type="date" name="nextDueDate" value={values.nextDueDate} onChange={update} /></label>{isEditing ? <label><span>Estado</span><select name="status" value={values.status} onChange={update}><option value="active">Activo</option><option value="paused">Pausado</option><option value="completed">Completado</option><option value="voided">Anulado</option></select></label> : null}{isEditing && values.status === 'voided' ? <label className="form-field--wide"><span>Motivo de anulación *</span><textarea name="voidReason" value={values.voidReason} onChange={update} maxLength="500" rows="3" /></label> : null}</div></div>{error ? <p className="form-error" role="alert">{error}</p> : null}<div className="form-actions"><Link className="button button--secondary" to="/preventivos">Cancelar</Link><button className="button button--primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar plan'}</button></div></form></section>
}

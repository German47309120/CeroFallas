import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { areas, provisionalFailureTypes } from '../config/catalogs.js'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { createCorrective, getCorrective, updateCorrective } from '../services/firebase/correctives.js'
import { listEquipment } from '../services/firebase/equipment.js'
import { buildMaintenanceTimes, formatDuration } from '../utils/duration.js'

const today = () => new Date().toISOString().slice(0, 10)
const initialValues = { workOrder: '', eventDate: today(), startTime: '', endTime: '', endsNextDay: false, areaId: '', equipmentId: '', reportedSymptom: '', failureType: '', affectedComponent: '', identifiedCause: '', workPerformed: '', spareParts: [], observations: '', status: 'completed', voidReason: '' }
const timeValue = (timestamp) => timestamp?.toDate().toTimeString().slice(0, 5) ?? ''

export default function CorrectiveFormPage() {
  const navigate = useNavigate()
  const { correctiveId } = useParams()
  const { hasPermission, profile, profileLoading, user } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const isEditing = Boolean(correctiveId)
  const permitted = isEditing ? hasPermission('corrective.manage') : hasPermission('corrective.create')

  useEffect(() => {
    if (profileLoading || !permitted) return
    Promise.all([listEquipment(), isEditing ? getCorrective(correctiveId) : Promise.resolve(null)])
      .then(([equipmentList, corrective]) => {
        setEquipment(equipmentList.filter((item) => item.status === 'active' || item.id === corrective?.equipmentId))
        if (isEditing && !corrective) { setError('El correctivo solicitado no existe.'); return }
        if (corrective) {
          const startDate = corrective.startedAt.toDate()
          const endDate = corrective.endedAt.toDate()
          setValues({
            workOrder: corrective.workOrder ?? '', eventDate: corrective.eventDate, startTime: timeValue(corrective.startedAt), endTime: timeValue(corrective.endedAt),
            endsNextDay: endDate.toDateString() !== startDate.toDateString(), areaId: corrective.areaId, equipmentId: corrective.equipmentId,
            reportedSymptom: corrective.reportedSymptom ?? '', failureType: corrective.failureType ?? '', affectedComponent: corrective.affectedComponent ?? '',
            identifiedCause: corrective.identifiedCause ?? '', workPerformed: corrective.workPerformed ?? '', observations: corrective.observations ?? '',
            spareParts: corrective.spareParts ?? [],
            status: corrective.status ?? 'completed', voidReason: corrective.voidReason ?? '',
          })
        }
      })
      .catch(() => setError('No fue posible cargar la información del formulario.'))
      .finally(() => setLoading(false))
  }, [correctiveId, isEditing, permitted, profileLoading])

  const duration = useMemo(() => {
    try { return buildMaintenanceTimes(values.eventDate, values.startTime, values.endTime, values.endsNextDay) } catch { return null }
  }, [values.endTime, values.endsNextDay, values.eventDate, values.startTime])

  if (profileLoading || (permitted && loading)) return <div className="panel empty-state"><p>Cargando formulario…</p></div>
  if (!permitted) return <Navigate to="/correctivos" replace />

  function updateField(event) {
    const { checked, name, type, value } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value, ...(name === 'areaId' ? { equipmentId: '' } : {}) }))
  }

  function addSparePart() {
    setValues((current) => ({ ...current, spareParts: [...current.spareParts, { code: '', description: '', quantity: 1 }] }))
  }

  function updateSparePart(index, field, value) {
    setValues((current) => ({ ...current, spareParts: current.spareParts.map((part, partIndex) => partIndex === index ? { ...part, [field]: value } : part) }))
  }

  function removeSparePart(index) {
    setValues((current) => ({ ...current, spareParts: current.spareParts.filter((_, partIndex) => partIndex !== index) }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!values.eventDate || !values.startTime || !values.endTime || !values.areaId || !values.equipmentId || !values.reportedSymptom.trim() || !values.workPerformed.trim()) { setError('Completa fecha, horas, área, equipo, síntoma y trabajo realizado.'); return }
    if (!duration) { setError('El rango de horas debe ser mayor que cero y no superar 24 horas. Marca “finalizó al día siguiente” cuando corresponda.'); return }
    if (values.status === 'voided' && !values.voidReason.trim()) { setError('Indica el motivo de anulación.'); return }
    if (values.spareParts.some((part) => !part.code.trim() || !part.description.trim() || !(Number(part.quantity) > 0))) { setError('Completa código, descripción y una cantidad mayor que cero en cada repuesto.'); return }
    const selectedEquipment = equipment.find((item) => item.id === values.equipmentId)
    if (!selectedEquipment) { setError('Selecciona un equipo válido.'); return }
    const areaName = areas.find((item) => item.id === values.areaId)?.name ?? values.areaId
    setSaving(true)
    try {
      const payload = { ...values, areaName }
      if (isEditing) await updateCorrective(correctiveId, payload, duration, selectedEquipment, user.uid)
      else await createCorrective(payload, duration, selectedEquipment, user.uid)
      navigate('/correctivos', { replace: true })
    } catch (saveError) {
      setError(saveError?.code === 'permission-denied' ? 'Tu perfil no tiene permiso para guardar este registro.' : 'No fue posible guardar el correctivo.')
    } finally { setSaving(false) }
  }

  const availableEquipment = equipment.filter((item) => !values.areaId || item.areaId === values.areaId)

  return (
    <section className="page-stack" aria-labelledby="corrective-form-title">
      <div className="page-heading"><div><p className="eyebrow">Mantenimiento</p><h1 id="corrective-form-title">{isEditing ? 'Editar correctivo' : 'Nuevo correctivo'}</h1><p>Formato digital basado en el reporte de tiempos proporcionado.</p></div><Link className="button button--secondary" to="/correctivos">Cancelar</Link></div>
      <form className="panel data-form" onSubmit={handleSubmit} noValidate>
        <div className="form-section"><div><h2>Tiempo y ubicación</h2><p>La duración se calcula automáticamente.</p></div><div className="form-grid"><label><span>Fecha *</span><input type="date" name="eventDate" value={values.eventDate} onChange={updateField} /></label><label><span>Orden de trabajo</span><input name="workOrder" value={values.workOrder} onChange={updateField} maxLength="40" /></label><label><span>Hora de inicio *</span><input type="time" name="startTime" value={values.startTime} onChange={updateField} /></label><label><span>Hora de finalización *</span><input type="time" name="endTime" value={values.endTime} onChange={updateField} /></label><label className="checkbox-field"><input type="checkbox" name="endsNextDay" checked={values.endsNextDay} onChange={updateField} /><span>Finalizó al día siguiente</span></label><div className="calculated-field"><span>Duración calculada</span><strong>{duration ? formatDuration(duration.durationMinutes) : 'Pendiente'}</strong></div><label><span>Área o línea *</span><select name="areaId" value={values.areaId} onChange={updateField}><option value="">Selecciona un área</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label><label><span>Equipo *</span><select name="equipmentId" value={values.equipmentId} onChange={updateField}><option value="">Selecciona un equipo</option>{availableEquipment.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select></label><div className="calculated-field"><span>Responsable del registro</span><strong>{profile?.displayName || user.email}</strong></div></div></div>
        <div className="form-section"><div><h2>Falla y trabajo realizado</h2><p>El catálogo de fallas es provisional y se depurará con datos de planta.</p></div><div className="form-grid"><label className="form-field--wide"><span>Síntoma o descripción inicial *</span><textarea name="reportedSymptom" value={values.reportedSymptom} onChange={updateField} maxLength="500" rows="3" /></label><label><span>Tipo de falla provisional</span><select name="failureType" value={values.failureType} onChange={updateField}><option value="">Sin clasificar</option>{provisionalFailureTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label><span>Componente afectado</span><input name="affectedComponent" value={values.affectedComponent} onChange={updateField} maxLength="100" /></label><label className="form-field--wide"><span>Causa identificada</span><textarea name="identifiedCause" value={values.identifiedCause} onChange={updateField} maxLength="500" rows="3" /></label><label className="form-field--wide"><span>Trabajo realizado *</span><textarea name="workPerformed" value={values.workPerformed} onChange={updateField} maxLength="1000" rows="4" /></label><label className="form-field--wide"><span>Observaciones</span><textarea name="observations" value={values.observations} onChange={updateField} maxLength="500" rows="3" /></label></div></div>
        <div className="form-section"><div className="section-heading-row"><div><h2>Repuestos utilizados</h2><p>Registra código, descripción y cantidad. La selección desde SAP se conectará en su fase.</p></div><button className="button button--secondary" type="button" onClick={addSparePart}>Agregar repuesto</button></div>{values.spareParts.length === 0 ? <p className="muted-copy">No se reportaron repuestos.</p> : <div className="repeater-list">{values.spareParts.map((part, index) => <div className="repeater-row" key={`part-${index}`}><label><span>Código</span><input value={part.code} onChange={(event) => updateSparePart(index, 'code', event.target.value)} maxLength="40" /></label><label><span>Descripción</span><input value={part.description} onChange={(event) => updateSparePart(index, 'description', event.target.value)} maxLength="120" /></label><label><span>Cantidad</span><input type="number" min="0.01" step="0.01" value={part.quantity} onChange={(event) => updateSparePart(index, 'quantity', event.target.value)} /></label><button className="button button--secondary" type="button" onClick={() => removeSparePart(index)}>Quitar</button></div>)}</div>}</div>
        {isEditing ? <div className="form-section"><div><h2>Control del registro</h2><p>Sólo administrador o soporte pueden modificar o anular.</p></div><div className="form-grid"><label><span>Estado</span><select name="status" value={values.status} onChange={updateField}><option value="draft">Borrador</option><option value="completed">Completado</option><option value="voided">Anulado</option></select></label>{values.status === 'voided' ? <label className="form-field--wide"><span>Motivo de anulación *</span><textarea name="voidReason" value={values.voidReason} onChange={updateField} maxLength="500" rows="3" /></label> : null}</div></div> : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}<div className="form-actions"><Link className="button button--secondary" to="/correctivos">Cancelar</Link><button className="button button--primary" type="submit" disabled={saving}>{saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Guardar correctivo'}</button></div>
      </form>
    </section>
  )
}

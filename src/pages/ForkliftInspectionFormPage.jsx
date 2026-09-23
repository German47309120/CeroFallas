import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { checklistAnswerOptions, forkliftChecklistTemplate, operationalShifts } from '../config/forkliftChecklist.js'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { listEquipment } from '../services/firebase/equipment.js'
import { createForkliftInspection } from '../services/firebase/forkliftInspections.js'
import { evaluateForkliftChecklist } from '../utils/forklift.js'
import { getOperationalShiftId } from '../utils/shifts.js'

const initialAnswers = forkliftChecklistTemplate.sections.flatMap((section) => section.items.map((item) => ({ itemId: item.id, status: '', observation: '' })))

export default function ForkliftInspectionFormPage() {
  const navigate = useNavigate()
  const { hasPermission, profile, profileLoading, user } = useAuth()
  const [equipment, setEquipment] = useState([])
  const [values, setValues] = useState({ equipmentId: '', hourMeter: '', answers: initialAnswers, generalObservations: '' })
  const [detectedShiftId, setDetectedShiftId] = useState(() => getOperationalShiftId(new Date()))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const permitted = hasPermission('forklift.inspect')
  useEffect(() => { if (profileLoading || !permitted) return; listEquipment().then((items) => setEquipment(items.filter((item) => item.status === 'active' && item.type.toLocaleLowerCase('es').includes('montacarga')))).catch(() => setError('No fue posible cargar los montacargas.')).finally(() => setLoading(false)) }, [permitted, profileLoading])
  useEffect(() => {
    const refreshShift = () => setDetectedShiftId(getOperationalShiftId(new Date()))
    const timer = globalThis.setInterval(refreshShift, 30_000)
    return () => globalThis.clearInterval(timer)
  }, [])
  const result = useMemo(() => { try { return evaluateForkliftChecklist(forkliftChecklistTemplate, values.answers) } catch { return null } }, [values.answers])
  if (profileLoading || (permitted && loading)) return <div className="panel empty-state"><p>Cargando checklist…</p></div>
  if (!permitted) return <Navigate to="/montacargas" replace />
  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  const setAnswer = (itemId, field, value) => setValues((current) => ({ ...current, answers: current.answers.map((answer) => answer.itemId === itemId ? { ...answer, [field]: value } : answer) }))
  const markAllGood = () => setValues((current) => ({ ...current, answers: current.answers.map((answer) => ({ ...answer, status: 'good' })) }))

  async function submit(event) {
    event.preventDefault(); setError('')
    if (!values.equipmentId || values.hourMeter === '' || Number(values.hourMeter) < 0) { setError('Completa montacargas y horómetro válido.'); return }
    let evaluation
    try { evaluation = evaluateForkliftChecklist(forkliftChecklistTemplate, values.answers) } catch { setError('Responde todos los puntos del checklist.'); return }
    const incompleteObservation = values.answers.some((answer) => ['attention_required', 'out_of_service'].includes(answer.status) && !answer.observation.trim())
    if (incompleteObservation) { setError('Agrega una observación en cada punto con falla o atención requerida.'); return }
    const selected = equipment.find((item) => item.id === values.equipmentId)
    if (!selected) { setError('Selecciona un montacargas activo.'); return }
    setSaving(true)
    try { await createForkliftInspection(values, selected, evaluation, user.uid); navigate('/montacargas', { replace: true }) } catch (saveError) { setError(saveError?.code === 'permission-denied' ? 'Tu perfil no tiene permiso para guardar inspecciones.' : 'No fue posible guardar la inspección.') } finally { setSaving(false) }
  }

  const resultText = !result ? 'Checklist incompleto' : result.overallResult === 'fit' ? 'Apto para operar' : result.overallResult === 'attention_required' ? 'Requiere atención' : 'Fuera de servicio — no operar'
  return <section className="page-stack" aria-labelledby="inspection-title"><div className="page-heading"><div><p className="eyebrow">Plantilla v{forkliftChecklistTemplate.version}</p><h1 id="inspection-title">Nueva inspección</h1><p>{forkliftChecklistTemplate.name}</p></div><Link className="button button--secondary" to="/montacargas">Cancelar</Link></div><form className="data-form" onSubmit={submit} noValidate><div className="panel form-section"><div><h2>Datos de inspección</h2><p>Operador: {profile?.displayName || user.email}</p></div><div className="form-grid"><label><span>Montacargas *</span><select name="equipmentId" value={values.equipmentId} onChange={update}><option value="">Selecciona un montacargas</option>{equipment.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select></label><div className="calculated-field"><span>Fecha y hora oficial</span><strong>Se asignan al guardar</strong></div><div className="calculated-field"><span>Turno detectado</span><strong>{operationalShifts.find((shift) => shift.id === detectedShiftId)?.name}</strong></div><label><span>Horómetro *</span><input type="number" min="0" step="0.1" name="hourMeter" value={values.hourMeter} onChange={update} /></label></div></div><div className="inspection-toolbar panel"><div><span>Resultado calculado</span><strong>{resultText}</strong>{result?.criticalFailures ? <small>{result.criticalFailures} falla(s) crítica(s)</small> : null}</div><button className="button button--secondary" type="button" onClick={markAllGood}>Marcar todo bueno</button></div>{forkliftChecklistTemplate.sections.map((section) => <fieldset className="panel checklist-section" key={section.title}><legend>{section.title}</legend>{section.items.map((item) => { const answer = values.answers.find((entry) => entry.itemId === item.id); return <div className="checklist-item" key={item.id}><div><strong>{item.label}</strong>{item.critical ? <span className="critical-label">Crítico</span> : null}</div><div className="answer-options">{checklistAnswerOptions.map((option) => <label key={option.value}><input type="radio" name={`answer-${item.id}`} value={option.value} checked={answer.status === option.value} onChange={() => setAnswer(item.id, 'status', option.value)} /><span>{option.label}</span></label>)}</div><label><span>Observación</span><input value={answer.observation} onChange={(event) => setAnswer(item.id, 'observation', event.target.value)} maxLength="250" placeholder="Obligatoria si existe falla" /></label></div>})}</fieldset>)}<div className="panel form-section"><label><span>Observaciones generales</span><textarea name="generalObservations" value={values.generalObservations} onChange={update} rows="4" maxLength="700" /></label>{error ? <p className="form-error" role="alert">{error}</p> : null}<div className="form-actions"><Link className="button button--secondary" to="/montacargas">Cancelar</Link><button className="button button--primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar inspección con hora oficial'}</button></div></div></form></section>
}

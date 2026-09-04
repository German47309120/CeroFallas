import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { areas } from '../config/catalogs.js'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { listEquipment } from '../services/firebase/equipment.js'
import { createIncident } from '../services/firebase/incidents.js'
import { incidentPriorities, validateIncident } from '../utils/incidents.js'

export default function IncidentFormPage() {
  const { user, hasPermission } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ areaId: '', equipmentId: '', description: '', priority: 'medium' })
  const [equipment, setEquipment] = useState([])
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [saving, setSaving] = useState(false)
  const canReadEquipment = hasPermission('equipment.read')
  useEffect(() => {
    if (!canReadEquipment) return
    let alive = true
    listEquipment().then((data) => { if (alive) setEquipment(data) }).catch(() => { if (alive) setWarning('No se cargó el catálogo. Puedes reportar sin equipo.') })
    return () => { alive = false }
  }, [canReadEquipment])
  async function submit(event) {
    event.preventDefault()
    const selected = equipment.find((item) => item.id === values.equipmentId)
    const validation = validateIncident(values, selected)
    if (validation) { setError(validation); return }
    setSaving(true); setError('')
    try { await createIncident(values, selected, user.uid); navigate('/incidentes', { replace: true }) }
    catch { setError('No se pudo guardar el incidente. Revisa tu conexión y permisos.') }
    finally { setSaving(false) }
  }
  if (!hasPermission('incident.create')) return <div className="panel"><h1>Acceso restringido</h1><p>Tu perfil no puede reportar incidentes.</p></div>
  return <section className="page-stack"><div className="page-heading"><div><p className="eyebrow">Comunicación operativa</p><h1>Reportar incidente</h1><p>El reporte alimenta la consulta gerencial. No sustituye una llamada de emergencia ni el procedimiento de seguridad de planta.</p></div></div><form className="panel data-form" onSubmit={submit}><div className="form-grid"><label>Área *<select required value={values.areaId} onChange={(e) => setValues({ ...values, areaId: e.target.value, equipmentId: '' })}><option value="">Selecciona área</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label><label>Equipo (opcional)<select value={values.equipmentId} onChange={(e) => setValues({ ...values, equipmentId: e.target.value })}><option value="">No identificado</option>{equipment.filter((r) => r.status === 'active' && r.areaId === values.areaId).map((r) => <option key={r.id} value={r.id}>{r.code} — {r.name}</option>)}</select></label><label>Prioridad *<select value={values.priority} onChange={(e) => setValues({ ...values, priority: e.target.value })}>{Object.entries(incidentPriorities).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label></div><label>Descripción *<textarea required minLength={10} maxLength={1500} rows={5} value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} /></label>{warning && <p role="status">{warning}</p>}{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><Link className="button button--secondary" to="/incidentes">Cancelar</Link><button className="button button--primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar reporte'}</button></div></form></section>
}

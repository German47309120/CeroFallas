import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { areas, criticalityOptions, equipmentStatuses } from '../config/catalogs.js'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { createEquipment, getEquipment, updateEquipment } from '../services/firebase/equipment.js'

const initialValues = { code: '', name: '', type: '', areaId: '', status: 'active', criticality: '', brand: '', model: '', serialNumber: '', notes: '' }

export default function EquipmentFormPage() {
  const navigate = useNavigate()
  const { equipmentId } = useParams()
  const { hasPermission, profileLoading, user } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(Boolean(equipmentId))
  const isEditing = Boolean(equipmentId)

  useEffect(() => {
    if (!equipmentId || profileLoading || !hasPermission('equipment.manage')) return

    getEquipment(equipmentId)
      .then((equipment) => {
        if (!equipment) {
          setError('El equipo solicitado no existe.')
          return
        }
        setValues({
          code: equipment.code ?? '',
          name: equipment.name ?? '',
          type: equipment.type ?? '',
          areaId: equipment.areaId ?? '',
          status: equipment.status ?? 'active',
          criticality: equipment.criticality ?? '',
          brand: equipment.brand ?? '',
          model: equipment.model ?? '',
          serialNumber: equipment.serialNumber ?? '',
          notes: equipment.notes ?? '',
        })
      })
      .catch(() => setError('No fue posible cargar el equipo.'))
      .finally(() => setLoading(false))
  }, [equipmentId, hasPermission, profileLoading])

  if (profileLoading) return <div className="panel empty-state"><p>Cargando permisos…</p></div>
  if (!hasPermission('equipment.manage')) return <Navigate to="/equipos" replace />
  if (loading) return <div className="panel empty-state"><p>Cargando equipo…</p></div>

  function updateField(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!values.code.trim() || !values.name.trim() || !values.type.trim() || !values.areaId) {
      setError('Completa código, nombre, tipo y área.')
      return
    }

    if (!/^[A-Z0-9][A-Z0-9._-]{0,39}$/.test(values.code.trim().toUpperCase())) {
      setError('El código solo puede usar letras, números, punto, guion y guion bajo.')
      return
    }

    setSaving(true)
    try {
      if (isEditing) await updateEquipment(equipmentId, values, user.uid)
      else await createEquipment(values, user.uid)
      navigate('/equipos', { replace: true })
    } catch (saveError) {
      if (saveError?.code === 'permission-denied') setError('Tu perfil no tiene permiso para guardar equipos.')
      else if (saveError?.code === 'equipment/already-exists') setError('Ya existe un equipo con ese código.')
      else setError('No fue posible guardar el equipo. Verifica los datos e inténtalo nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-stack" aria-labelledby="equipment-form-title">
      <div className="page-heading"><div><p className="eyebrow">Activos</p><h1 id="equipment-form-title">{isEditing ? 'Editar equipo' : 'Nuevo equipo'}</h1><p>Registra únicamente información confirmada en planta.</p></div><Link className="button button--secondary" to="/equipos">Cancelar</Link></div>
      <form className="panel data-form" onSubmit={handleSubmit} noValidate>
        <div className="form-section"><div><h2>Identificación</h2><p>Los campos marcados son obligatorios.</p></div><div className="form-grid"><label><span>Código *</span><input name="code" value={values.code} onChange={updateField} maxLength="40" autoComplete="off" disabled={isEditing} /></label><label><span>Nombre *</span><input name="name" value={values.name} onChange={updateField} maxLength="100" /></label><label><span>Tipo *</span><input name="type" value={values.type} onChange={updateField} maxLength="80" placeholder="Ej. Montacargas" /></label><label><span>Área o línea *</span><select name="areaId" value={values.areaId} onChange={updateField}><option value="">Selecciona un área</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label></div></div>
        <div className="form-section"><div><h2>Estado y datos técnicos</h2><p>Marca como “sin definir” todo dato no confirmado.</p></div><div className="form-grid"><label><span>Estado</span><select name="status" value={values.status} onChange={updateField}>{equipmentStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label><span>Criticidad</span><select name="criticality" value={values.criticality} onChange={updateField}>{criticalityOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label><span>Marca</span><input name="brand" value={values.brand} onChange={updateField} maxLength="80" /></label><label><span>Modelo</span><input name="model" value={values.model} onChange={updateField} maxLength="80" /></label><label><span>Número de serie</span><input name="serialNumber" value={values.serialNumber} onChange={updateField} maxLength="100" /></label><label className="form-field--wide"><span>Notas</span><textarea name="notes" value={values.notes} onChange={updateField} maxLength="500" rows="4" /></label></div></div>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="form-actions"><Link className="button button--secondary" to="/equipos">Cancelar</Link><button className="button button--primary" type="submit" disabled={saving}>{saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Guardar equipo'}</button></div>
      </form>
    </section>
  )
}

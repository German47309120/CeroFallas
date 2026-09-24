import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { equipmentStatuses, getAreaName } from '../config/catalogs.js'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { getEquipment } from '../services/firebase/equipment.js'
import { readEquipmentTimeline } from '../services/firebase/equipmentHistory.js'

const statusNames = Object.fromEntries(equipmentStatuses.map((status) => [status.value, status.label]))
const eventStatusNames = {
  completed: 'Completado', in_progress: 'En atención', draft: 'En curso', voided: 'Anulado',
  on_time: 'A tiempo', late: 'Tardío', unscheduled: 'No programado',
  reported: 'Reportado', acknowledged: 'Revisado', resolved: 'Resuelto',
  fit: 'Apto', attention_required: 'Requiere atención', out_of_service: 'Fuera de servicio',
  low: 'Bajo', medium: 'Medio', high: 'Alto', critical: 'Crítico',
}

const formatDate = (value) => value?.toDate?.().toLocaleString('es-GT') || 'Fecha no disponible'

export default function EquipmentDetailPage() {
  const { equipmentId } = useParams()
  const { hasPermission, profileLoading } = useAuth()
  const [equipment, setEquipment] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const sources = useMemo(() => [
    hasPermission('corrective.read') && 'correctives',
    hasPermission('preventive.read') && 'preventiveExecutions',
    hasPermission('forklift.read') && 'forkliftInspections',
    hasPermission('incident.read') && 'incidents',
    hasPermission('prediction.read') && 'riskPredictions',
  ].filter(Boolean), [hasPermission])

  useEffect(() => {
    if (profileLoading || !hasPermission('equipment.read')) return
    let active = true
    setLoading(true)
    setError('')
    Promise.all([getEquipment(equipmentId), readEquipmentTimeline(equipmentId, sources)])
      .then(([record, events]) => {
        if (!active) return
        setEquipment(record)
        setTimeline(events)
        if (!record) setError('El equipo solicitado no existe o ya no está disponible.')
      })
      .catch(() => active && setError('No fue posible cargar la ficha del equipo. Intenta nuevamente.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [equipmentId, hasPermission, profileLoading, sources])

  if (profileLoading || loading) return <div className="panel empty-state"><p>Cargando ficha del equipo…</p></div>
  if (!hasPermission('equipment.read')) return <div className="panel empty-state"><h2>Acceso restringido</h2><p>Tu perfil no puede consultar equipos.</p></div>
  if (error || !equipment) return <section className="page-stack"><Link to="/equipos">Volver a equipos</Link><div className="panel empty-state"><h1>Ficha no disponible</h1><p>{error}</p></div></section>

  return <section className="page-stack" aria-labelledby="equipment-detail-title">
    <div className="page-heading"><div><p className="eyebrow">{equipment.code}</p><h1 id="equipment-detail-title">{equipment.name}</h1><p>Ficha del activo e historial visible según los permisos de tu perfil.</p></div><div className="heading-actions"><Link className="button button--secondary" to="/equipos">Volver</Link>{hasPermission('equipment.manage') && <Link className="button button--primary" to={`/equipos/${equipment.id}/editar`}>Editar equipo</Link>}</div></div>
    <section className="panel"><div className="panel__heading"><div><p className="eyebrow">Identificación</p><h2>Datos del equipo</h2></div><span className={`status-badge status-badge--${equipment.status}`}>{statusNames[equipment.status] || equipment.status}</span></div><dl className="form-grid"><div><dt>Tipo</dt><dd>{equipment.type}</dd></div><div><dt>Área</dt><dd>{getAreaName(equipment.areaId)}</dd></div><div><dt>Criticidad</dt><dd>{eventStatusNames[equipment.criticality] || equipment.criticality || 'No definida'}</dd></div><div><dt>Marca</dt><dd>{equipment.brand || 'No registrada'}</dd></div><div><dt>Modelo</dt><dd>{equipment.model || 'No registrado'}</dd></div><div><dt>Serie</dt><dd>{equipment.serialNumber || 'No registrada'}</dd></div></dl>{equipment.notes && <p className="muted-copy"><strong>Observaciones:</strong> {equipment.notes}</p>}</section>
    <section className="panel"><div className="panel__heading"><div><p className="eyebrow">Trazabilidad</p><h2>Historial consolidado</h2></div><span className="status-badge">{timeline.length} eventos</span></div>{sources.length === 0 ? <div className="empty-state empty-state--compact"><p>Tu perfil puede consultar la ficha, pero no tiene acceso a módulos históricos.</p></div> : timeline.length === 0 ? <div className="empty-state empty-state--compact"><p>No hay eventos visibles para este equipo.</p></div> : <div className="records-list records-list--inside">{timeline.map((event) => <article className="record-row" key={event.id}><div><strong>{event.title}</strong><span>{event.typeLabel}{event.isDemonstration ? ' · Demostración' : ''}</span></div><div><span>{formatDate(event.occurredAt)}</span><small>{event.recordId}</small></div><span className="status-badge">{eventStatusNames[event.status] || event.status || 'Registrado'}</span></article>)}</div>}</section>
  </section>
}

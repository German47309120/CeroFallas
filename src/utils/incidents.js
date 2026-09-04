import { areas } from '../config/catalogs.js'

export const incidentPriorities = { low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica' }
export const incidentStates = { reported: 'Reportado', acknowledged: 'Revisado', in_progress: 'En atención', resolved: 'Resuelto', voided: 'Anulado' }

export function validateIncident(values, equipment) {
  if (!areas.some((area) => area.id === values.areaId)) return 'Selecciona un área válida.'
  const description = values.description?.trim() || ''
  if (description.length < 10 || description.length > 1500) return 'Describe el incidente con 10 a 1500 caracteres.'
  if (!Object.hasOwn(incidentPriorities, values.priority)) return 'Selecciona una prioridad válida.'
  if (values.equipmentId && (!equipment || equipment.status !== 'active' || equipment.areaId !== values.areaId)) return 'Selecciona un equipo activo del área indicada.'
  return ''
}

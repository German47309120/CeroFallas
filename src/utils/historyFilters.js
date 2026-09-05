const DAY_MS = 24 * 60 * 60 * 1000
import { areas } from '../config/catalogs.js'

export function validateDateRange({ fromDate = '', toDate = '' } = {}) {
  if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) return 'Fecha inicial inválida.'
  if (toDate && !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) return 'Fecha final inválida.'
  if (fromDate && toDate && fromDate > toDate) return 'La fecha inicial no puede ser posterior a la final.'
  return ''
}

export function validateHistoryFilters(filters = {}) {
  const dateError = validateDateRange(filters)
  if (dateError) return dateError
  if (filters.areaId && !areas.some((area) => area.id === filters.areaId)) return 'Área inválida.'
  if (filters.equipmentId && !/^[A-Z0-9][A-Z0-9._-]{0,39}$/.test(filters.equipmentId)) return 'Equipo inválido.'
  if (filters.areaId && filters.equipmentId) return 'Selecciona un área o un equipo, no ambos.'
  return ''
}

export function guatemalaDateRange(filters = {}) {
  const error = validateHistoryFilters(filters)
  if (error) throw new Error(error)
  const parse = (value) => new Date(`${value}T00:00:00-06:00`)
  return {
    from: filters.fromDate ? parse(filters.fromDate) : null,
    // El final es exclusivo para incluir el día final completo.
    until: filters.toDate ? new Date(parse(filters.toDate).getTime() + DAY_MS) : null,
  }
}

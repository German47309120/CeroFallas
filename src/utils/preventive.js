export function frequencyLabel(type, value, unit) {
  if (type === 'condition') return 'Según condición'
  if (type === 'hours') return `Cada ${value} horas de uso`
  const names = { day: ['día', 'días'], week: ['semana', 'semanas'], month: ['mes', 'meses'] }
  const [singular, plural] = names[unit] ?? ['unidad', 'unidades']
  return `Cada ${value} ${Number(value) === 1 ? singular : plural}`
}

export function complianceStatus(scheduledDate, startedAt) {
  if (!scheduledDate) return 'unscheduled'
  const scheduledEnd = new Date(`${scheduledDate}T23:59:59`)
  return startedAt <= scheduledEnd ? 'on_time' : 'late'
}

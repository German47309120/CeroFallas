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

const dateParts = (dateValue) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue)
  if (!match) throw new Error('preventive/date-invalid')
  const [, year, month, day] = match
  const result = { year: Number(year), month: Number(month), day: Number(day) }
  const check = new Date(Date.UTC(result.year, result.month - 1, result.day))
  if (check.getUTCFullYear() !== result.year || check.getUTCMonth() !== result.month - 1 || check.getUTCDate() !== result.day) throw new Error('preventive/date-invalid')
  return result
}

const daysInMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate()
const pad = (value) => String(value).padStart(2, '0')

export function nextCalendarDueDate(executedDate, frequencyValue, frequencyUnit) {
  const amount = Number(frequencyValue)
  if (!Number.isInteger(amount) || amount < 1) throw new Error('preventive/frequency-invalid')
  if (!['day', 'week', 'month'].includes(frequencyUnit)) throw new Error('preventive/unit-invalid')
  const { year, month, day } = dateParts(executedDate)
  let result
  if (frequencyUnit === 'month') {
    const monthIndex = month - 1 + amount
    const nextYear = year + Math.floor(monthIndex / 12)
    const nextMonth = (monthIndex % 12) + 1
    result = new Date(Date.UTC(nextYear, nextMonth - 1, Math.min(day, daysInMonth(nextYear, nextMonth))))
  } else {
    result = new Date(Date.UTC(year, month - 1, day + amount * (frequencyUnit === 'week' ? 7 : 1)))
  }
  return `${result.getUTCFullYear()}-${pad(result.getUTCMonth() + 1)}-${pad(result.getUTCDate())}`
}

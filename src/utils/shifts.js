const mixedScheduleRoles = new Set([
  'maintenance_manager',
  'supervisor',
  'line_manager',
  'production_manager',
  'management',
])

function guatemalaClock(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(date.getTime())) throw new Error('Fecha inválida para calcular el turno.')
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Guatemala',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const read = (type) => parts.find((part) => part.type === type)?.value
  return { weekday: read('weekday'), minutes: Number(read('hour')) * 60 + Number(read('minute')) }
}

export function getOperationalShiftId(value = new Date()) {
  const { minutes } = guatemalaClock(value)
  return minutes >= 6 * 60 && minutes < 18 * 60 ? 'shift-1' : 'shift-2'
}

export function getCurrentShift(value = new Date(), roleId = '') {
  const { weekday, minutes } = guatemalaClock(value)
  if (mixedScheduleRoles.has(roleId)) {
    const weekdayActive = !['Sat', 'Sun'].includes(weekday)
    const active = weekdayActive && minutes >= 8 * 60 && minutes < 18 * 60
    return {
      id: 'mixed',
      label: active ? 'Turno mixto · 08:00–18:00' : 'Fuera del turno mixto',
      active,
      schedule: 'Lunes a viernes · 08:00–18:00',
    }
  }

  const id = getOperationalShiftId(value)
  return {
    id,
    label: id === 'shift-1' ? 'Turno 1 · 06:00–18:00' : 'Turno 2 · 18:00–06:00',
    active: true,
    schedule: id === 'shift-1' ? '06:00–18:00' : '18:00–06:00',
  }
}

export function buildMaintenanceTimes(eventDate, startTime, endTime, endsNextDay = false) {
  if (!eventDate || !startTime || !endTime) throw new Error('duration/missing-fields')

  const startedAt = new Date(`${eventDate}T${startTime}:00`)
  const endedAt = new Date(`${eventDate}T${endTime}:00`)
  if (endsNextDay) endedAt.setDate(endedAt.getDate() + 1)

  const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000)
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) throw new Error('duration/invalid-range')
  if (durationMinutes > 24 * 60) throw new Error('duration/exceeds-day')

  return { startedAt, endedAt, durationMinutes }
}

export function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return 'En curso'
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (!hours) return `${remainingMinutes} min`
  return `${hours} h ${remainingMinutes ? `${remainingMinutes} min` : ''}`.trim()
}

export function durationBetween(startedAt, endedAt) {
  const start = startedAt?.toDate ? startedAt.toDate() : startedAt instanceof Date ? startedAt : null
  const end = endedAt?.toDate ? endedAt.toDate() : endedAt instanceof Date ? endedAt : null
  if (!start || !end) return null
  const minutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000))
  return Number.isFinite(minutes) ? minutes : null
}

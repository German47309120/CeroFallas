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
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (!hours) return `${remainingMinutes} min`
  return `${hours} h ${remainingMinutes ? `${remainingMinutes} min` : ''}`.trim()
}

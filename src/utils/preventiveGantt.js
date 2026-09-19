const DAY = 24 * 60 * 60 * 1000

export function preventiveGantt(plans, reference = new Date(), horizonDays = 56) {
  if (!(reference instanceof Date) || Number.isNaN(reference.getTime())) throw new Error('Fecha de referencia inválida')
  if (!Number.isInteger(horizonDays) || horizonDays < 7 || horizonDays > 120) throw new Error('Horizonte inválido')
  const start = new Date(reference)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start.getTime() + horizonDays * DAY)
  const rows = plans
    .filter((plan) => plan.status === 'active' && plan.nextDueAt?.toDate instanceof Function)
    .map((plan) => {
      const due = plan.nextDueAt.toDate()
      const rawDay = Math.floor((due.getTime() - start.getTime()) / DAY)
      return {
        ...plan,
        due,
        overdue: rawDay < 0,
        outside: rawDay >= horizonDays,
        offset: Math.max(0, Math.min(horizonDays - 1, rawDay)),
        left: `${Math.min(87.5, (Math.max(0, rawDay) / horizonDays) * 100)}%`,
      }
    })
    .sort((a, b) => a.due - b.due)
  return { start, end, horizonDays, rows: rows.filter((row) => !row.outside), laterCount: rows.filter((row) => row.outside).length }
}

export function ganttWeeks(start, horizonDays) {
  return Array.from({ length: Math.ceil(horizonDays / 7) }, (_, index) => {
    const date = new Date(start.getTime() + index * 7 * DAY)
    return { key: date.toISOString(), label: date.toLocaleDateString('es-GT', { day: '2-digit', month: 'short' }) }
  })
}

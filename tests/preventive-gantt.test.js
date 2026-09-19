import { describe, expect, it } from 'vitest'
import { ganttWeeks, preventiveGantt } from '../src/utils/preventiveGantt.js'

const stamp = (date) => ({ toDate: () => new Date(date) })

describe('Gantt preventivo', () => {
  it('incluye activos vencidos y próximos, pero no pausados ni fuera del horizonte', () => {
    const result = preventiveGantt([
      { id: 'late', status: 'active', nextDueAt: stamp('2026-09-17T12:00:00') },
      { id: 'next', status: 'active', nextDueAt: stamp('2026-09-25T12:00:00') },
      { id: 'paused', status: 'paused', nextDueAt: stamp('2026-09-26T12:00:00') },
      { id: 'later', status: 'active', nextDueAt: stamp('2026-12-25T12:00:00') },
    ], new Date('2026-09-18T08:00:00'), 56)
    expect(result.rows.map((row) => row.id)).toEqual(['late', 'next'])
    expect(result.rows[0].overdue).toBe(true)
    expect(result.laterCount).toBe(1)
  })

  it('produce ocho divisiones semanales para el horizonte predeterminado', () => {
    expect(ganttWeeks(new Date('2026-09-18T00:00:00'), 56)).toHaveLength(8)
  })
})

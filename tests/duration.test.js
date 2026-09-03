import { describe, expect, it } from 'vitest'
import { buildMaintenanceTimes, formatDuration } from '../src/utils/duration.js'

describe('cálculo de duración de mantenimiento', () => {
  it('calcula un trabajo dentro del mismo día', () => {
    const result = buildMaintenanceTimes('2026-09-03', '08:10', '10:40')
    expect(result.durationMinutes).toBe(150)
    expect(formatDuration(result.durationMinutes)).toBe('2 h 30 min')
  })

  it('calcula un trabajo que termina al día siguiente', () => {
    const result = buildMaintenanceTimes('2026-09-03', '23:30', '01:00', true)
    expect(result.durationMinutes).toBe(90)
  })

  it('rechaza rangos invertidos sin marca de día siguiente', () => {
    expect(() => buildMaintenanceTimes('2026-09-03', '23:30', '01:00')).toThrow('duration/invalid-range')
  })

  it('rechaza duraciones mayores de 24 horas', () => {
    expect(() => buildMaintenanceTimes('2026-09-03', '08:00', '09:00', true)).toThrow('duration/exceeds-day')
  })
})

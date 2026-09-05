import { describe, expect, it } from 'vitest'
import { complianceStatus, frequencyLabel, nextCalendarDueDate } from '../src/utils/preventive.js'

describe('reglas funcionales preventivas', () => {
  it('describe frecuencias estimadas', () => {
    expect(frequencyLabel('calendar', 1, 'month')).toBe('Cada 1 mes')
    expect(frequencyLabel('hours', 250, 'hour')).toBe('Cada 250 horas de uso')
    expect(frequencyLabel('condition')).toBe('Según condición')
  })

  it('clasifica una ejecución dentro de fecha como puntual', () => {
    expect(complianceStatus('2026-09-03', new Date('2026-09-03T18:00:00'))).toBe('on_time')
  })

  it('clasifica ejecuciones tardías o no programadas', () => {
    expect(complianceStatus('2026-09-03', new Date('2026-09-04T06:00:00'))).toBe('late')
    expect(complianceStatus('', new Date('2026-09-03T08:00:00'))).toBe('unscheduled')
  })

  it('reprograma frecuencias de días y semanas desde la ejecución', () => {
    expect(nextCalendarDueDate('2026-09-04', 30, 'day')).toBe('2026-10-04')
    expect(nextCalendarDueDate('2026-09-04', 2, 'week')).toBe('2026-09-18')
  })

  it('reprograma meses sin desbordar el último día disponible', () => {
    expect(nextCalendarDueDate('2026-01-31', 1, 'month')).toBe('2026-02-28')
    expect(nextCalendarDueDate('2024-01-31', 1, 'month')).toBe('2024-02-29')
  })

  it('rechaza fechas, frecuencias y unidades inválidas', () => {
    expect(() => nextCalendarDueDate('2026-02-30', 1, 'month')).toThrow('preventive/date-invalid')
    expect(() => nextCalendarDueDate('2026-09-04', 0, 'day')).toThrow('preventive/frequency-invalid')
    expect(() => nextCalendarDueDate('2026-09-04', 1, 'year')).toThrow('preventive/unit-invalid')
  })
})

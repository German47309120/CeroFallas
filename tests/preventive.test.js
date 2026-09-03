import { describe, expect, it } from 'vitest'
import { complianceStatus, frequencyLabel } from '../src/utils/preventive.js'

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
})

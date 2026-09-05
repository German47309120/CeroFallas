import { describe, expect, it } from 'vitest'
import { guatemalaDateRange, validateDateRange, validateHistoryFilters } from '../src/utils/historyFilters.js'

describe('Filtros de fecha de históricos', () => {
  it('interpreta el día completo en hora de Guatemala', () => {
    const range = guatemalaDateRange({ fromDate: '2026-09-04', toDate: '2026-09-04' })
    expect(range.from.toISOString()).toBe('2026-09-04T06:00:00.000Z')
    expect(range.until.toISOString()).toBe('2026-09-05T06:00:00.000Z')
  })
  it('admite límites abiertos', () => {
    expect(guatemalaDateRange({}).from).toBeNull()
    expect(guatemalaDateRange({ fromDate: '2026-09-04' }).until).toBeNull()
  })
  it('rechaza rango invertido y formato inválido', () => {
    expect(validateDateRange({ fromDate: '2026-09-05', toDate: '2026-09-04' })).toContain('posterior')
    expect(validateDateRange({ fromDate: '04/09/2026' })).toContain('inválida')
    expect(() => guatemalaDateRange({ fromDate: '2026-09-05', toDate: '2026-09-04' })).toThrow()
  })
  it('acepta áreas institucionales y rechaza identificadores inventados', () => {
    expect(validateHistoryFilters({ areaId: 'linea-4' })).toBe('')
    expect(validateHistoryFilters({ areaId: 'otra' })).toBe('Área inválida.')
    expect(() => guatemalaDateRange({ areaId: 'otra' })).toThrow('Área inválida')
  })
  it('valida equipo y evita combinarlo con área', () => {
    expect(validateHistoryFilters({ equipmentId: 'EQ-01_A' })).toBe('')
    expect(validateHistoryFilters({ equipmentId: 'no válido' })).toBe('Equipo inválido.')
    expect(validateHistoryFilters({ equipmentId: 'EQ-01', areaId: 'linea-1' })).toContain('no ambos')
  })
})

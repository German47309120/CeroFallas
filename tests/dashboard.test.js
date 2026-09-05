import { describe, expect, it } from 'vitest'
import { buildActivityTrend, buildAreaBreakdown, dashboardDate, dashboardSources, dashboardWindow, OPEN_INCIDENT_STATES } from '../src/utils/dashboard.js'

describe('Dashboard: fechas y mínimo privilegio', () => {
  it('mantiene una ventana exacta de 7 días al cruzar mes y año', () => {
    const cutoff = new Date('2026-12-29T18:00:00Z')
    const result = dashboardWindow(cutoff)
    expect(result.start.toISOString()).toBe('2026-12-29T18:00:00.000Z')
    expect(result.end.toISOString()).toBe('2027-01-05T18:00:00.000Z')
    expect(cutoff.toISOString()).toBe('2026-12-29T18:00:00.000Z')
  })
  it('rechaza fechas inválidas', () => expect(() => dashboardWindow('no')).toThrow())
  it('no convierte fechas ausentes en 1970', () => {
    for (const value of [null, undefined, 'invalid']) expect(dashboardDate(value)).toBe('Fecha no disponible')
  })
  it('formatea Timestamp en hora de Guatemala', () => {
    const date = new Date('2026-09-03T18:00:00Z')
    expect(dashboardDate({ toDate: () => date })).toBe(dashboardDate(date))
    expect(dashboardDate(date)).toContain('12:00')
  })
  it('no consulta ninguna fuente sin dashboard.read', () => {
    expect(dashboardSources((p) => p !== 'dashboard.read')).toEqual([])
  })
  it('dashboard.read no otorga acceso implícito a datos operativos', () => {
    expect(dashboardSources((p) => p === 'dashboard.read')).toEqual([])
  })
  it('consulta solamente las fuentes permitidas', () => {
    expect(dashboardSources((p) => ['dashboard.read', 'preventive.read'].includes(p))).toEqual(['plans', 'executions'])
  })
  it('excluye incidentes resueltos y anulados', () => {
    expect(OPEN_INCIDENT_STATES).toEqual(['reported', 'acknowledged', 'in_progress'])
  })
  it('agrupa actividad sin incluir el instante final del corte', () => {
    const cutoff = new Date('2026-09-08T00:00:00Z')
    const timestamp = (value) => ({ toDate: () => new Date(value) })
    const result = buildActivityTrend({
      correctives: [{ startedAt: timestamp('2026-09-01T12:00:00Z') }, { startedAt: timestamp('2026-09-07T12:00:00Z') }, { startedAt: timestamp('2026-09-08T00:00:00Z') }],
      executions: [{ startedAt: timestamp('2026-09-06T12:00:00Z') }],
    }, cutoff, 7)
    expect(result.buckets.reduce((sum, item) => sum + item.correctives, 0)).toBe(2)
    expect(result.buckets.reduce((sum, item) => sum + item.executions, 0)).toBe(1)
    expect(result.max).toBe(1)
  })
  it('rechaza parámetros inválidos de tendencia', () => {
    expect(() => buildActivityTrend({}, new Date(), 0)).toThrow('Período inválido')
    expect(() => buildActivityTrend({}, 'no', 30)).toThrow('Corte inválido')
  })
  it('ordena correctivos por área y conserva registros sin área', () => {
    const result = buildAreaBreakdown([{ areaId: 'linea-2' }, { areaId: 'linea-1' }, { areaId: 'linea-2' }, {}])
    expect(result.rows).toEqual([
      { areaId: 'linea-2', name: 'Línea 2', total: 2 },
      { areaId: 'linea-1', name: 'Línea 1', total: 1 },
      { areaId: 'sin-area', name: 'Sin área registrada', total: 1 },
    ])
    expect(result.max).toBe(2)
  })
})

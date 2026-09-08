import { describe, expect, it } from 'vitest'
import { getCurrentShift, getOperationalShiftId } from '../src/utils/shifts.js'

const guatemalaTime = (date, time) => new Date(`${date}T${time}-06:00`)

describe('turnos institucionales en hora de Guatemala', () => {
  it('cambia exactamente a las 06:00 y 18:00', () => {
    expect(getOperationalShiftId(guatemalaTime('2026-09-07', '05:59:00'))).toBe('shift-2')
    expect(getOperationalShiftId(guatemalaTime('2026-09-07', '06:00:00'))).toBe('shift-1')
    expect(getOperationalShiftId(guatemalaTime('2026-09-07', '17:59:00'))).toBe('shift-1')
    expect(getOperationalShiftId(guatemalaTime('2026-09-07', '18:00:00'))).toBe('shift-2')
  })

  it('mantiene el cálculo Guatemala aunque la fecha llegue en UTC', () => {
    expect(getOperationalShiftId(new Date('2026-09-07T11:59:00Z'))).toBe('shift-2')
    expect(getOperationalShiftId(new Date('2026-09-07T12:00:00Z'))).toBe('shift-1')
  })

  it('aplica turno mixto a jefaturas de lunes a viernes', () => {
    expect(getCurrentShift(guatemalaTime('2026-09-07', '08:00:00'), 'maintenance_manager')).toMatchObject({ id: 'mixed', active: true })
    expect(getCurrentShift(guatemalaTime('2026-09-07', '18:00:00'), 'maintenance_manager')).toMatchObject({ id: 'mixed', active: false })
  })

  it('marca fuera de turno mixto durante el fin de semana', () => {
    const result = getCurrentShift(guatemalaTime('2026-09-06', '10:00:00'), 'management')
    expect(result.active).toBe(false)
    expect(result.label).toBe('Fuera del turno mixto')
  })

  it('usa el turno operativo para roles no asignados al horario mixto', () => {
    expect(getCurrentShift(guatemalaTime('2026-09-07', '20:30:00'), 'forklift_operator').label).toContain('Turno 2')
    expect(getCurrentShift(guatemalaTime('2026-09-07', '10:00:00'), 'administrator').label).toContain('Turno 1')
  })

  it('rechaza fechas inválidas', () => {
    expect(() => getCurrentShift(new Date('invalid'), 'management')).toThrow('Fecha inválida')
  })
})

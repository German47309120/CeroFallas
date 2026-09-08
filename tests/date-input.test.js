import { describe, expect, it } from 'vitest'
import { guatemalaDateInputValue, guatemalaTimeInputValue } from '../src/utils/dateInput.js'

describe('valores de fecha y hora para Guatemala', () => {
  it('no adelanta la fecha durante la tarde aunque UTC ya sea el día siguiente', () => {
    const evening = new Date('2026-09-06T02:16:00.000Z')
    expect(guatemalaDateInputValue(evening)).toBe('2026-09-05')
    expect(guatemalaTimeInputValue(evening)).toBe('20:16')
  })

  it('cambia de fecha a medianoche local', () => {
    const midnight = new Date('2026-09-06T06:00:00.000Z')
    expect(guatemalaDateInputValue(midnight)).toBe('2026-09-06')
    expect(guatemalaTimeInputValue(midnight)).toBe('00:00')
  })
})

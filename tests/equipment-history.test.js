import { describe, expect, it } from 'vitest'
import { mergeEquipmentTimeline } from '../src/services/firebase/equipmentHistory.js'

const stamp = (milliseconds) => ({ toMillis: () => milliseconds })

describe('historial consolidado de equipo', () => {
  it('combina fuentes y presenta primero el evento más reciente', () => {
    const result = mergeEquipmentTimeline([
      [{ id: 'corrective:1', occurredAt: stamp(100) }],
      [{ id: 'incident:1', occurredAt: stamp(300) }, { id: 'incident:2', occurredAt: stamp(200) }],
    ])
    expect(result.map((event) => event.id)).toEqual(['incident:1', 'incident:2', 'corrective:1'])
  })

  it('aplica un límite global después de ordenar', () => {
    const result = mergeEquipmentTimeline([[{ id: 'old', occurredAt: stamp(1) }, { id: 'new', occurredAt: stamp(2) }]], 1)
    expect(result.map((event) => event.id)).toEqual(['new'])
  })
})

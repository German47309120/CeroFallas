import { describe, expect, it } from 'vitest'
import { getRiskPresentation, latestPredictionPerEquipment } from '../src/utils/predictions.js'

describe('presentación de resultados predictivos simulados', () => {
  it('traduce niveles sin convertir un valor desconocido en riesgo bajo', () => {
    expect(getRiskPresentation('high')).toMatchObject({ label: 'Alto', tone: 'high' })
    expect(getRiskPresentation('unexpected')).toMatchObject({ label: 'No calculable', tone: 'neutral' })
  })

  it('conserva el primer resultado de cada equipo en un histórico descendente', () => {
    const records = [
      { id: 'a-new', equipmentId: 'A', riskScore: 0.8 },
      { id: 'b-new', equipmentId: 'B', riskScore: 0.4 },
      { id: 'a-old', equipmentId: 'A', riskScore: 0.2 },
    ]
    expect(latestPredictionPerEquipment(records).map((item) => item.id)).toEqual(['a-new', 'b-new'])
  })
})

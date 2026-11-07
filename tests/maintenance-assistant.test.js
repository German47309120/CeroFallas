import { describe, expect, it } from 'vitest'
import { localAssistantAnswer, normalizeAssistantSnapshot, validateAssistantQuestion } from '../src/utils/maintenanceAssistant.js'
import { buildAssistantPrompt, normalizeAssistantInput, readResponseText } from '../functions/src/maintenance-assistant.js'

const snapshot = normalizeAssistantSnapshot({
  generatedAt: '2026-11-06T12:00:00.000Z',
  openIncidents: 4,
  overduePlans: 3,
  upcomingPlans: 2,
  completedCorrectives: 12,
  completedPreventives: 9,
  highRiskEquipment: 2,
  lowStockItems: 5,
  highRiskItems: [{ code: 'AIRLAY-03', name: 'Airlay 03', score: 0.82 }],
})

describe('asistente gerencial de mantenimiento', () => {
  it('valida el tamaño de la consulta y limita el historial enviado', () => {
    expect(validateAssistantQuestion('')).toContain('3 caracteres')
    expect(validateAssistantQuestion('estado de incidentes')).toBe('')
    expect(() => normalizeAssistantInput({ question: 'ok' })).toThrow()
    const input = normalizeAssistantInput({ question: 'Resumen actual', history: Array.from({ length: 12 }, (_, index) => ({ role: 'user', content: `mensaje ${index}` })) })
    expect(input.history).toHaveLength(6)
  })

  it('genera una contingencia verificable con los indicadores visibles', () => {
    expect(localAssistantAnswer('¿Cómo están los preventivos?', snapshot)).toContain('3 planes preventivos vencidos')
    expect(localAssistantAnswer('¿Qué equipos tienen riesgo?', snapshot)).toContain('AIRLAY-03')
    expect(localAssistantAnswer('¿Cómo está el stock?', snapshot)).toContain('5 posiciones')
  })

  it('limita el prompt a consulta y recomienda validación técnica', () => {
    const prompt = buildAssistantPrompt(snapshot, '¿Qué atiendo primero?')
    expect(prompt).toContain('no autorizan por sí mismas una intervención')
    expect(prompt).toContain('No puedes crear, modificar, anular ni aprobar registros')
    expect(prompt).toContain('Consulta de gerencia')
  })

  it('extrae texto de las dos formas válidas de Responses API', () => {
    expect(readResponseText({ output_text: 'Respuesta ejecutiva' })).toBe('Respuesta ejecutiva')
    expect(readResponseText({ output: [{ content: [{ text: 'Respuesta anidada' }] }] })).toBe('Respuesta anidada')
  })
})

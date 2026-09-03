import { describe, expect, it } from 'vitest'
import { forkliftChecklistTemplate } from '../src/config/forkliftChecklist.js'
import { evaluateForkliftChecklist } from '../src/utils/forklift.js'

const answers = (status = 'good') => forkliftChecklistTemplate.sections.flatMap((section) => section.items.map((item) => ({ itemId: item.id, status })))

describe('evaluación de checklist de montacargas', () => {
  it('declara apto cuando todos los puntos están buenos', () => {
    expect(evaluateForkliftChecklist(forkliftChecklistTemplate, answers())).toEqual({ criticalFailures: 0, overallResult: 'fit' })
  })

  it('declara fuera de servicio ante una falla crítica', () => {
    const result = answers()
    result.find((answer) => answer.itemId === 'service-brake').status = 'attention_required'
    expect(evaluateForkliftChecklist(forkliftChecklistTemplate, result)).toEqual({ criticalFailures: 1, overallResult: 'out_of_service' })
  })

  it('solicita atención ante una falla no crítica', () => {
    const result = answers()
    result.find((answer) => answer.itemId === 'seat').status = 'attention_required'
    expect(evaluateForkliftChecklist(forkliftChecklistTemplate, result)).toEqual({ criticalFailures: 0, overallResult: 'attention_required' })
  })

  it('rechaza una inspección incompleta', () => {
    expect(() => evaluateForkliftChecklist(forkliftChecklistTemplate, answers().slice(1))).toThrow('checklist/incomplete')
    expect(() => evaluateForkliftChecklist(forkliftChecklistTemplate, answers(''))).toThrow('checklist/incomplete')
  })
})

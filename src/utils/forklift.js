export function evaluateForkliftChecklist(template, answers) {
  const items = template.sections.flatMap((section) => section.items)
  const answerMap = new Map(answers.map((answer) => [answer.itemId, answer.status]))
  const validStatuses = ['good', 'attention_required', 'out_of_service', 'not_applicable']
  if (items.some((item) => !answerMap.has(item.id) || !validStatuses.includes(answerMap.get(item.id)))) throw new Error('checklist/incomplete')

  const criticalFailures = items.filter((item) => item.critical && ['attention_required', 'out_of_service'].includes(answerMap.get(item.id))).length
  const hasOtherFailure = items.some((item) => ['attention_required', 'out_of_service'].includes(answerMap.get(item.id)))
  return {
    criticalFailures,
    overallResult: criticalFailures > 0 ? 'out_of_service' : hasOtherFailure ? 'attention_required' : 'fit',
  }
}

const resultPresentations = {
  fit: { label: 'Apto', tone: 'fit' },
  attention_required: { label: 'Requiere atención', tone: 'attention_required' },
  out_of_service: { label: 'Fuera de servicio', tone: 'out_of_service' },
  // Compatibilidad con datos demo generados antes de normalizar el catálogo.
  fit_with_observations: { label: 'Apto con observaciones', tone: 'attention_required' },
}

export function getForkliftResultPresentation(result) {
  return resultPresentations[result] ?? { label: 'Resultado no reconocido', tone: 'unknown' }
}

export function validateInspectionVoidReason(reason) {
  const normalized = typeof reason === 'string' ? reason.trim() : ''
  if (normalized.length < 10) throw new Error('El motivo de anulación debe tener al menos 10 caracteres.')
  if (normalized.length > 500) throw new Error('El motivo de anulación no puede exceder 500 caracteres.')
  return normalized
}

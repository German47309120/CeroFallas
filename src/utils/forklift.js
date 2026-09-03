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

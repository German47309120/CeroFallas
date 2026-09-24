const riskPresentations = Object.freeze({
  low: { label: 'Bajo', tone: 'low' },
  medium: { label: 'Medio', tone: 'medium' },
  high: { label: 'Alto', tone: 'high' },
  not_calculable: { label: 'No calculable', tone: 'neutral' },
})

export function getRiskPresentation(level) {
  return riskPresentations[level] || riskPresentations.not_calculable
}

export function latestPredictionPerEquipment(records) {
  const latest = new Map()
  for (const record of records) {
    if (!latest.has(record.equipmentId)) latest.set(record.equipmentId, record)
  }
  return [...latest.values()]
}

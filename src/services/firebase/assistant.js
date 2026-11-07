import { listRiskPredictions } from './predictions.js'
import { loadDashboardSource } from './dashboard.js'
import { getFirebaseFunctions } from './functions.js'
import { httpsCallable } from 'firebase/functions'
import { normalizeAssistantSnapshot } from '../../utils/maintenanceAssistant.js'

export async function loadLocalAssistantSnapshot() {
  const cutoff = new Date()
  const requests = await Promise.allSettled([
    loadDashboardSource('plans', cutoff),
    loadDashboardSource('incidents', cutoff),
    loadDashboardSource('correctives', cutoff, { periodDays: 30 }),
    loadDashboardSource('executions', cutoff, { periodDays: 30 }),
    listRiskPredictions(),
  ])
  const [plans, incidents, correctives, preventives, predictions] = requests.map((result) => result.status === 'fulfilled' ? result.value : null)
  const latestByEquipment = new Map()
  for (const record of predictions ?? []) {
    if (!latestByEquipment.has(record.equipmentId)) latestByEquipment.set(record.equipmentId, record)
  }
  const highRiskItems = [...latestByEquipment.values()]
    .filter((item) => ['high', 'critical'].includes(item.riskLevel))
    .slice(0, 5)
    .map((item) => ({ code: item.equipmentSnapshot?.code || item.equipmentId, name: item.equipmentSnapshot?.name || '', score: Number(item.riskScore) || 0 }))
  const coverage = requests.map((result, index) => result.status === 'fulfilled' ? ['preventivos', 'incidentes', 'correctivos', 'ejecuciones', 'riesgo'][index] : null).filter(Boolean)
  return normalizeAssistantSnapshot({
    generatedAt: cutoff.toISOString(),
    windowDays: 30,
    openIncidents: incidents?.total,
    overduePlans: plans?.overdueCount,
    upcomingPlans: plans?.upcomingCount,
    completedCorrectives: correctives?.total,
    completedPreventives: preventives?.total,
    highRiskEquipment: highRiskItems.length,
    highRiskItems,
    dataCoverage: coverage,
  })
}

export async function askMaintenanceAssistant(question, history = []) {
  const result = await httpsCallable(getFirebaseFunctions(), 'askMaintenanceAssistant')({ question, history })
  return result.data
}

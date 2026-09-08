import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, getDocs } from 'firebase/firestore'

const projectId = 'demo-cerofallas'
const actorId = 'demo-seed-system'
const expectedCounts = {
  equipment: 14,
  preventivePlans: 18,
  preventiveExecutions: 36,
  correctives: 48,
  incidents: 24,
  forkliftInspections: 30,
  stock: 20,
  audit: 84,
}

const environment = await initializeTestEnvironment({
  projectId,
  firestore: { host: '127.0.0.1', port: 8080 },
})

try {
  await environment.withSecurityRulesDisabled(async (context) => {
    const database = context.firestore()
    const entries = await Promise.all(Object.keys(expectedCounts).map(async (name) => {
      const snapshot = await getDocs(collection(database, name))
      const records = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((item) => item.createdBy === actorId || item.actorId === actorId || item.dataOrigin === 'demo')
      return [name, records]
    }))
    const records = Object.fromEntries(entries)

    for (const [name, expected] of Object.entries(expectedCounts)) {
      if (records[name].length !== expected) throw new Error(`${name}: se esperaban ${expected} registros demo y existen ${records[name].length}.`)
    }

    const equipmentIds = new Set(records.equipment.map((item) => item.id))
    const planIds = new Set(records.preventivePlans.map((item) => item.id))
    const auditIds = new Set(records.audit.map((item) => item.id))
    const linkedRecords = [
      ...records.correctives,
      ...records.preventivePlans,
      ...records.preventiveExecutions,
      ...records.incidents,
      ...records.forkliftInspections,
    ]
    if (linkedRecords.some((item) => !equipmentIds.has(item.equipmentId))) throw new Error('Existe un registro demo relacionado con un equipo inexistente.')
    if (records.preventiveExecutions.some((item) => item.planId && !planIds.has(item.planId))) throw new Error('Existe una ejecución demo relacionada con un plan inexistente.')
    if (records.incidents.some((item) => !auditIds.has(item.auditId))) throw new Error('Existe un incidente demo sin auditoría relacionada.')

    const areaIds = new Set(records.equipment.map((item) => item.areaId))
    if (areaIds.size !== 7) throw new Error(`La demostración cubre ${areaIds.size} áreas; se esperaban 7.`)
    const inspectionResults = new Set(records.forkliftInspections.map((item) => item.overallResult))
    for (const result of ['fit', 'attention_required', 'out_of_service']) {
      if (!inspectionResults.has(result)) throw new Error(`Falta el resultado de checklist ${result}.`)
    }
    if (records.stock.some((item) => item.source !== 'demo-local')) throw new Error('El stock demostrativo no está identificado como demo-local.')

    const total = Object.values(expectedCounts).reduce((sum, count) => sum + count, 0)
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recentCorrectives = records.correctives.filter((item) => item.status === 'completed' && item.startedAt?.toMillis() >= cutoff)
    const recentExecutions = records.preventiveExecutions.filter((item) => item.status === 'completed' && item.startedAt?.toMillis() >= cutoff)
    const openIncidents = records.incidents.filter((item) => ['reported', 'acknowledged', 'in_progress'].includes(item.status))
    const averageMinutes = recentCorrectives.length
      ? Math.round(recentCorrectives.reduce((sum, item) => sum + item.durationMinutes, 0) / recentCorrectives.length)
      : 0
    const onTime = recentExecutions.filter((item) => item.complianceStatus === 'on_time').length
    const checklistCounts = Object.fromEntries([...inspectionResults].map((result) => [result, records.forkliftInspections.filter((item) => item.overallResult === result).length]))
    console.log(`Dataset demo verificado: ${total} registros coherentes en ${Object.keys(expectedCounts).length} colecciones.`)
    console.log('Cobertura: 7 áreas, relaciones válidas, tres resultados de checklist y stock marcado como demo-local.')
    console.log(`Dashboard 30 días: ${recentCorrectives.length} correctivos completados (promedio ${averageMinutes} min), ${recentExecutions.length} preventivos (${onTime} a tiempo) y ${openIncidents.length} incidentes abiertos.`)
    console.log(`Checklist: ${checklistCounts.fit} aptos, ${checklistCounts.attention_required} con atención y ${checklistCounts.out_of_service} fuera de servicio.`)
  })
} finally {
  await environment.cleanup()
}

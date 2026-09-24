import { collection, getDocsFromServer, limit, orderBy, query, where } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'

export const equipmentHistorySources = {
  correctives: { dateField: 'startedAt', type: 'corrective', typeLabel: 'Correctivo', titleField: 'reportedSymptom' },
  preventiveExecutions: { dateField: 'startedAt', type: 'preventive', typeLabel: 'Preventivo', titleField: 'activityPerformed' },
  forkliftInspections: { dateField: 'inspectedAt', type: 'inspection', typeLabel: 'Checklist', titleField: 'overallResult' },
  incidents: { dateField: 'createdAt', type: 'incident', typeLabel: 'Incidente', titleField: 'description' },
  riskPredictions: { dateField: 'calculatedAt', type: 'prediction', typeLabel: 'Riesgo predictivo', titleField: 'riskLevel' },
}

const milliseconds = (value) => value?.toMillis?.() ?? value?.getTime?.() ?? 0

export function mergeEquipmentTimeline(groups, maximum = 60) {
  return groups.flat().sort((left, right) => milliseconds(right.occurredAt) - milliseconds(left.occurredAt)).slice(0, maximum)
}

export async function readEquipmentTimeline(equipmentId, sources, perSource = 20) {
  if (!equipmentId?.trim() || equipmentId.length > 128) throw new Error('Equipo inválido.')
  if (!Array.isArray(sources) || sources.some((source) => !equipmentHistorySources[source])) throw new Error('Fuente de historial inválida.')
  const safeLimit = Math.min(Math.max(Number(perSource) || 20, 1), 50)
  const database = getFirebaseFirestore()
  const groups = await Promise.all(sources.map(async (source) => {
    const definition = equipmentHistorySources[source]
    const snapshot = await getDocsFromServer(query(
      collection(database, source),
      where('equipmentId', '==', equipmentId),
      orderBy(definition.dateField, 'desc'),
      limit(safeLimit),
    ))
    return snapshot.docs.map((item) => {
      const data = item.data()
      return {
        id: `${source}:${item.id}`,
        recordId: item.id,
        source,
        type: definition.type,
        typeLabel: definition.typeLabel,
        title: data[definition.titleField] || definition.typeLabel,
        status: data.status || data.complianceStatus || data.overallResult || data.riskLevel || '',
        occurredAt: data[definition.dateField],
        isDemonstration: data.isDemonstration === true || data.dataOrigin === 'demo',
      }
    })
  }))
  return mergeEquipmentTimeline(groups)
}

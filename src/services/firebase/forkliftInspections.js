import { collection, doc, getDocs, limit, orderBy, query, serverTimestamp, writeBatch } from 'firebase/firestore'
import { forkliftChecklistTemplate } from '../../config/forkliftChecklist.js'
import { validateInspectionVoidReason } from '../../utils/forklift.js'
import { getFirebaseFirestore } from './firestore.js'

export async function listForkliftInspections() {
  const snapshot = await getDocs(query(collection(getFirebaseFirestore(), 'forkliftInspections'), orderBy('inspectedAt', 'desc'), limit(50)))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function createForkliftInspection(values, equipment, result, userId) {
  const database = getFirebaseFirestore()
  const inspectionRef = doc(collection(database, 'forkliftInspections'))
  const auditRef = doc(collection(database, 'audit'))
  const timestamp = serverTimestamp()
  const itemLookup = new Map(forkliftChecklistTemplate.sections.flatMap((section) => section.items).map((item) => [item.id, item]))
  const inspection = {
    equipmentId: equipment.id,
    equipmentSnapshot: { code: equipment.code, name: equipment.name },
    templateId: forkliftChecklistTemplate.id,
    templateVersion: forkliftChecklistTemplate.version,
    inspectedAt: timestamp,
    shiftId: values.shiftId,
    operatorId: userId,
    hourMeter: Number(values.hourMeter),
    answers: values.answers.map((answer) => ({ itemId: answer.itemId, label: itemLookup.get(answer.itemId).label, critical: itemLookup.get(answer.itemId).critical, status: answer.status, observation: answer.observation.trim() || null })),
    criticalFailures: result.criticalFailures,
    overallResult: result.overallResult,
    generalObservations: values.generalObservations.trim() || null,
    evidenceUrls: [],
    status: 'completed',
    createdAt: timestamp,
    createdBy: userId,
  }
  const batch = writeBatch(database)
  batch.set(inspectionRef, inspection)
  batch.set(auditRef, { occurredAt: timestamp, actorId: userId, action: 'create', entityType: 'forkliftInspection', entityId: inspectionRef.id, after: inspection })
  await batch.commit()
}

export async function voidForkliftInspection(inspectionId, reason, userId) {
  const normalizedReason = validateInspectionVoidReason(reason)
  if (!inspectionId || !userId) throw new Error('No fue posible identificar la inspección o el usuario.')
  const database = getFirebaseFirestore()
  const inspectionRef = doc(database, 'forkliftInspections', inspectionId)
  const auditRef = doc(collection(database, 'audit'))
  const timestamp = serverTimestamp()
  const updates = {
    status: 'voided', voidReason: normalizedReason, updatedAt: timestamp, updatedBy: userId, auditId: auditRef.id,
  }
  const batch = writeBatch(database)
  batch.update(inspectionRef, updates)
  batch.set(auditRef, {
    occurredAt: timestamp, actorId: userId, action: 'void', entityType: 'forkliftInspection',
    entityId: inspectionId, reason: normalizedReason, after: updates,
  })
  await batch.commit()
}

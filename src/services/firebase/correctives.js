import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'

const correctivesCollection = () => collection(getFirebaseFirestore(), 'correctives')

export async function listCorrectives() {
  const snapshot = await getDocs(query(correctivesCollection(), orderBy('startedAt', 'desc'), limit(50)))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function getCorrective(correctiveId) {
  const snapshot = await getDoc(doc(getFirebaseFirestore(), 'correctives', correctiveId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

function editableData(values, times, equipment) {
  return {
    workOrder: values.workOrder.trim() || null,
    eventDate: values.eventDate,
    startedAt: Timestamp.fromDate(times.startedAt),
    endedAt: Timestamp.fromDate(times.endedAt),
    durationMinutes: times.durationMinutes,
    areaId: values.areaId,
    areaSnapshot: { id: values.areaId, name: values.areaName },
    equipmentId: equipment.id,
    equipmentSnapshot: { code: equipment.code, name: equipment.name },
    reportedSymptom: values.reportedSymptom.trim(),
    failureType: values.failureType || null,
    affectedComponent: values.affectedComponent.trim() || null,
    identifiedCause: values.identifiedCause.trim() || null,
    workPerformed: values.workPerformed.trim(),
    spareParts: values.spareParts
      .filter((part) => part.code.trim() || part.description.trim())
      .map((part) => ({ code: part.code.trim().toUpperCase(), description: part.description.trim(), quantity: Number(part.quantity) })),
    observations: values.observations.trim() || null,
    status: values.status,
    voidReason: values.status === 'voided' ? values.voidReason.trim() : null,
  }
}

export async function createCorrective(values, times, equipment, userId) {
  const database = getFirebaseFirestore()
  const correctiveRef = doc(collection(database, 'correctives'))
  const auditRef = doc(collection(database, 'audit'))
  const timestamp = serverTimestamp()
  const corrective = {
    ...editableData(values, times, equipment),
    technicianIds: [userId],
    createdAt: timestamp,
    createdBy: userId,
    updatedAt: timestamp,
    updatedBy: userId,
  }

  const batch = writeBatch(database)
  batch.set(correctiveRef, corrective)
  batch.set(auditRef, { occurredAt: timestamp, actorId: userId, action: 'create', entityType: 'corrective', entityId: correctiveRef.id, after: corrective })
  await batch.commit()
  return correctiveRef.id
}

export async function updateCorrective(correctiveId, values, times, equipment, userId) {
  const database = getFirebaseFirestore()
  const correctiveRef = doc(database, 'correctives', correctiveId)
  const currentSnapshot = await getDoc(correctiveRef)
  if (!currentSnapshot.exists()) throw new Error('corrective/not-found')

  const timestamp = serverTimestamp()
  const updates = { ...editableData(values, times, equipment), updatedAt: timestamp, updatedBy: userId }
  const auditRef = doc(collection(database, 'audit'))
  const batch = writeBatch(database)
  batch.update(correctiveRef, updates)
  batch.set(auditRef, {
    occurredAt: timestamp,
    actorId: userId,
    action: values.status === 'voided' ? 'void' : 'update',
    entityType: 'corrective',
    entityId: correctiveId,
    reason: values.status === 'voided' ? values.voidReason.trim() : null,
    before: currentSnapshot.data(),
    after: updates,
  })
  await batch.commit()
}

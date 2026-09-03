import { collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, Timestamp, writeBatch } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'

const cleanParts = (parts) => parts.filter((part) => part.code.trim() || part.description.trim()).map((part) => ({ code: part.code.trim().toUpperCase(), description: part.description.trim(), quantity: Number(part.quantity) }))

export async function listPreventivePlans() {
  const snapshot = await getDocs(query(collection(getFirebaseFirestore(), 'preventivePlans'), orderBy('nextDueAt'), limit(50)))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function listPreventiveExecutions() {
  const snapshot = await getDocs(query(collection(getFirebaseFirestore(), 'preventiveExecutions'), orderBy('startedAt', 'desc'), limit(50)))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function getPreventivePlan(planId) {
  const snapshot = await getDoc(doc(getFirebaseFirestore(), 'preventivePlans', planId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

const planFields = (values, equipment) => ({
  equipmentId: equipment.id,
  equipmentSnapshot: { code: equipment.code, name: equipment.name },
  activityName: values.activityName.trim(),
  activityDescription: values.activityDescription.trim() || null,
  frequencyType: values.frequencyType,
  frequencyValue: values.frequencyType === 'condition' ? null : Number(values.frequencyValue),
  frequencyUnit: values.frequencyType === 'calendar' ? values.frequencyUnit : values.frequencyType === 'hours' ? 'hour' : null,
  estimatedFrequency: true,
  nextDueAt: Timestamp.fromDate(new Date(`${values.nextDueDate}T12:00:00`)),
  assignedUserIds: [],
  status: values.status,
  voidReason: values.status === 'voided' ? values.voidReason.trim() : null,
})

export async function createPreventivePlan(values, equipment, userId) {
  const database = getFirebaseFirestore()
  const planRef = doc(collection(database, 'preventivePlans'))
  const auditRef = doc(collection(database, 'audit'))
  const timestamp = serverTimestamp()
  const plan = { ...planFields(values, equipment), createdAt: timestamp, createdBy: userId, updatedAt: timestamp, updatedBy: userId }
  const batch = writeBatch(database)
  batch.set(planRef, plan)
  batch.set(auditRef, { occurredAt: timestamp, actorId: userId, action: 'create', entityType: 'preventivePlan', entityId: planRef.id, after: plan })
  await batch.commit()
}

export async function updatePreventivePlan(planId, values, equipment, userId) {
  const database = getFirebaseFirestore()
  const planRef = doc(database, 'preventivePlans', planId)
  const current = await getDoc(planRef)
  if (!current.exists()) throw new Error('preventive-plan/not-found')
  const timestamp = serverTimestamp()
  const updates = { ...planFields(values, equipment), updatedAt: timestamp, updatedBy: userId }
  const auditRef = doc(collection(database, 'audit'))
  const batch = writeBatch(database)
  batch.update(planRef, updates)
  batch.set(auditRef, { occurredAt: timestamp, actorId: userId, action: values.status === 'voided' ? 'void' : 'update', entityType: 'preventivePlan', entityId: planId, reason: values.status === 'voided' ? values.voidReason.trim() : null, before: current.data(), after: updates })
  await batch.commit()
}

export async function createPreventiveExecution(values, times, equipment, plan, compliance, userId) {
  const database = getFirebaseFirestore()
  const executionRef = doc(collection(database, 'preventiveExecutions'))
  const auditRef = doc(collection(database, 'audit'))
  const timestamp = serverTimestamp()
  const execution = {
    planId: plan?.id ?? null,
    equipmentId: equipment.id,
    equipmentSnapshot: { code: equipment.code, name: equipment.name },
    scheduledAt: values.scheduledDate ? Timestamp.fromDate(new Date(`${values.scheduledDate}T12:00:00`)) : null,
    startedAt: Timestamp.fromDate(times.startedAt), endedAt: Timestamp.fromDate(times.endedAt), durationMinutes: times.durationMinutes,
    technicianIds: [userId], activityPerformed: values.activityPerformed.trim(), spareParts: cleanParts(values.spareParts),
    observations: values.observations.trim() || null, complianceStatus: compliance, status: 'completed',
    createdAt: timestamp, createdBy: userId, updatedAt: timestamp, updatedBy: userId,
  }
  const batch = writeBatch(database)
  batch.set(executionRef, execution)
  batch.set(auditRef, { occurredAt: timestamp, actorId: userId, action: 'create', entityType: 'preventiveExecution', entityId: executionRef.id, after: execution })
  await batch.commit()
}

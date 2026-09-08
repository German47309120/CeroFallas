import { collection, doc, documentId, getDoc, getDocs, limit, orderBy, query, runTransaction, serverTimestamp, startAfter, Timestamp, writeBatch } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'
import { nextCalendarDueDate, validatePreventiveVoidReason } from '../../utils/preventive.js'

const cleanParts = (parts) => parts.filter((part) => part.code.trim() || part.description.trim()).map((part) => ({ code: part.code.trim().toUpperCase(), description: part.description.trim(), quantity: Number(part.quantity) }))

export async function listPreventivePlans() {
  const records = []
  let cursor = null
  for (let page = 0; page < 10; page++) {
    const clauses = [orderBy('nextDueAt'), orderBy(documentId()), limit(101)]
    if (cursor) clauses.splice(2, 0, startAfter(cursor))
    const snapshot = await getDocs(query(collection(getFirebaseFirestore(), 'preventivePlans'), ...clauses))
    const visible = snapshot.docs.slice(0, 100)
    records.push(...visible.map((item) => ({ id: item.id, ...item.data() })))
    if (snapshot.docs.length <= 100) return records
    cursor = visible.at(-1)
  }
  const error = new Error('El catálogo supera 1000 planes; utiliza un selector con búsqueda en servidor.')
  error.code = 'preventive-plan/selection-limit'
  throw error
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
  await runTransaction(database, async (transaction) => {
    const planRef = plan?.id ? doc(database, 'preventivePlans', plan.id) : null
    const currentPlan = planRef ? await transaction.get(planRef) : null
    if (planRef && !currentPlan.exists()) throw new Error('preventive-plan/not-found')
    const planData = currentPlan?.data() ?? null
    if (planData && (planData.status !== 'active' || planData.equipmentId !== equipment.id)) throw new Error('preventive-plan/not-available')

    const timestamp = serverTimestamp()
    const automatic = planData?.frequencyType === 'calendar'
    const nextDueDate = automatic ? nextCalendarDueDate(values.eventDate, planData.frequencyValue, planData.frequencyUnit) : null
    const nextDueAt = nextDueDate ? Timestamp.fromDate(new Date(`${nextDueDate}T12:00:00`)) : null
    const rescheduleStatus = !planData ? 'not_applicable' : automatic ? 'automatic' : 'manual_required'
    const execution = {
      planId: plan?.id ?? null,
      equipmentId: equipment.id,
      equipmentSnapshot: { code: equipment.code, name: equipment.name },
      scheduledAt: values.scheduledDate ? Timestamp.fromDate(new Date(`${values.scheduledDate}T12:00:00`)) : null,
      startedAt: Timestamp.fromDate(times.startedAt), endedAt: Timestamp.fromDate(times.endedAt), durationMinutes: times.durationMinutes,
      technicianIds: [userId], activityPerformed: values.activityPerformed.trim(), spareParts: cleanParts(values.spareParts),
      observations: values.observations.trim() || null, complianceStatus: compliance, rescheduleStatus,
      nextDueAtAfterExecution: nextDueAt, status: 'completed',
      createdAt: timestamp, createdBy: userId, updatedAt: timestamp, updatedBy: userId,
    }
    transaction.set(executionRef, execution)
    const executionAuditRef = doc(collection(database, 'audit'))
    transaction.set(executionAuditRef, { occurredAt: timestamp, actorId: userId, action: 'create', entityType: 'preventiveExecution', entityId: executionRef.id, after: execution })

    if (automatic) {
      const planUpdates = { nextDueAt, lastExecutedAt: Timestamp.fromDate(times.startedAt), lastExecutionId: executionRef.id, updatedAt: timestamp, updatedBy: userId }
      transaction.update(planRef, planUpdates)
      const planAuditRef = doc(collection(database, 'audit'))
      transaction.set(planAuditRef, { occurredAt: timestamp, actorId: userId, action: 'reschedule', entityType: 'preventivePlan', entityId: planRef.id, reason: 'Reprogramación automática por ejecución completada', before: planData, after: planUpdates })
    }
  })
}

export async function voidPreventiveExecution(executionId, reason, userId) {
  const normalizedReason = validatePreventiveVoidReason(reason)
  if (!executionId || !userId) throw new Error('No fue posible identificar la ejecución o el usuario.')
  const database = getFirebaseFirestore()
  const executionRef = doc(database, 'preventiveExecutions', executionId)

  await runTransaction(database, async (transaction) => {
    const current = await transaction.get(executionRef)
    if (!current.exists()) throw new Error('preventive-execution/not-found')
    if (current.data().status !== 'completed') throw new Error('preventive-execution/not-active')

    const planRef = current.data().planId ? doc(database, 'preventivePlans', current.data().planId) : null
    const plan = planRef ? await transaction.get(planRef) : null
    const timestamp = serverTimestamp()
    const auditRef = doc(collection(database, 'audit'))
    const updates = {
      status: 'voided', voidReason: normalizedReason, updatedAt: timestamp, updatedBy: userId, auditId: auditRef.id,
    }
    transaction.update(executionRef, updates)
    transaction.set(auditRef, {
      occurredAt: timestamp, actorId: userId, action: 'void', entityType: 'preventiveExecution',
      entityId: executionId, reason: normalizedReason, before: current.data(), after: updates,
    })

    if (plan?.exists() && plan.data().lastExecutionId === executionId && current.data().scheduledAt) {
      const planUpdates = {
        nextDueAt: current.data().scheduledAt, lastExecutionId: null, lastExecutedAt: null,
        updatedAt: timestamp, updatedBy: userId,
      }
      const planAuditRef = doc(collection(database, 'audit'))
      transaction.update(planRef, planUpdates)
      transaction.set(planAuditRef, {
        occurredAt: timestamp, actorId: userId, action: 'reschedule_reverted', entityType: 'preventivePlan',
        entityId: planRef.id, reason: `Ejecución ${executionId} anulada`, before: plan.data(), after: planUpdates,
      })
    }
  })
}

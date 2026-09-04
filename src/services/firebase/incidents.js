import { collection, doc, getDocs, limit, orderBy, query, runTransaction, serverTimestamp, writeBatch } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'
import { getAreaName } from '../../config/catalogs.js'
import { incidentStates, validateIncident } from '../../utils/incidents.js'

export async function listIncidents() {
  const snapshot = await getDocs(query(collection(getFirebaseFirestore(), 'incidents'), orderBy('createdAt', 'desc'), limit(100)))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function createIncident(values, equipment, userId) {
  const error = validateIncident(values, equipment)
  if (error) throw new Error(error)
  const db = getFirebaseFirestore()
  const ref = doc(collection(db, 'incidents'))
  const audit = doc(collection(db, 'audit'))
  const timestamp = serverTimestamp()
  const data = {
    areaId: values.areaId, areaName: getAreaName(values.areaId),
    equipmentId: equipment?.id || null,
    equipmentSnapshot: equipment ? { code: equipment.code, name: equipment.name } : null,
    description: values.description.trim(), priority: values.priority, status: 'reported',
    reporterId: userId, createdBy: userId, createdAt: timestamp, updatedBy: userId, updatedAt: timestamp,
    linkedCorrectiveId: null, followUp: '', auditId: audit.id,
  }
  const batch = writeBatch(db)
  batch.set(ref, data)
  batch.set(audit, { actorId: userId, occurredAt: timestamp, action: 'create', entityType: 'incident', entityId: ref.id, after: data })
  await batch.commit()
  return ref.id
}

export async function updateIncident(id, changes, userId) {
  if (!Object.hasOwn(incidentStates, changes.status) || !changes.followUp.trim() || changes.followUp.trim().length > 1000) throw new Error('Indica un estado y un motivo de seguimiento (máximo 1000 caracteres).')
  const db = getFirebaseFirestore()
  const ref = doc(db, 'incidents', id)
  const audit = doc(collection(db, 'audit'))
  await runTransaction(db, async (transaction) => {
    const before = await transaction.get(ref)
    if (!before.exists()) throw new Error('El incidente no existe.')
    if (before.data().status === 'voided') throw new Error('Un incidente anulado no puede modificarse.')
    const correctiveId = changes.linkedCorrectiveId.trim() || null
    if (correctiveId) {
      const corrective = await transaction.get(doc(db, 'correctives', correctiveId))
      if (!corrective.exists() || corrective.data().status === 'voided' || corrective.data().areaId !== before.data().areaId || (before.data().equipmentId && corrective.data().equipmentId !== before.data().equipmentId)) throw new Error('El correctivo debe existir, no estar anulado y corresponder al área y equipo.')
    }
    const timestamp = serverTimestamp()
    const after = { status: changes.status, followUp: changes.followUp.trim(), linkedCorrectiveId: correctiveId, updatedBy: userId, updatedAt: timestamp, auditId: audit.id }
    transaction.update(ref, after)
    transaction.set(audit, { actorId: userId, occurredAt: timestamp, action: changes.status === 'voided' ? 'void' : 'update', entityType: 'incident', entityId: id, reason: after.followUp, before: before.data(), after })
  })
}

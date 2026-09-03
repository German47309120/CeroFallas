import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'

const equipmentCollection = () => collection(getFirebaseFirestore(), 'equipment')

export async function listEquipment() {
  const snapshot = await getDocs(query(equipmentCollection(), orderBy('code'), limit(50)))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function createEquipment(values, userId) {
  const database = getFirebaseFirestore()
  const normalizedCode = values.code.trim().toUpperCase()
  const equipmentRef = doc(database, 'equipment', normalizedCode)
  if ((await getDoc(equipmentRef)).exists()) {
    const duplicateError = new Error('equipment/already-exists')
    duplicateError.code = 'equipment/already-exists'
    throw duplicateError
  }
  const auditRef = doc(collection(database, 'audit'))
  const timestamp = serverTimestamp()
  const equipment = {
    code: normalizedCode,
    name: values.name.trim(),
    type: values.type.trim(),
    areaId: values.areaId,
    status: values.status,
    criticality: values.criticality || null,
    brand: values.brand.trim() || null,
    model: values.model.trim() || null,
    serialNumber: values.serialNumber.trim() || null,
    notes: values.notes.trim() || null,
    createdAt: timestamp,
    createdBy: userId,
    updatedAt: timestamp,
    updatedBy: userId,
  }

  const batch = writeBatch(database)
  batch.set(equipmentRef, equipment)
  batch.set(auditRef, {
    occurredAt: timestamp,
    actorId: userId,
    action: 'create',
    entityType: 'equipment',
    entityId: equipmentRef.id,
    after: equipment,
  })
  await batch.commit()

  return equipmentRef.id
}

export async function getEquipment(equipmentId) {
  const snapshot = await getDoc(doc(getFirebaseFirestore(), 'equipment', equipmentId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function updateEquipment(equipmentId, values, userId) {
  const database = getFirebaseFirestore()
  const equipmentRef = doc(database, 'equipment', equipmentId)
  const currentSnapshot = await getDoc(equipmentRef)
  if (!currentSnapshot.exists()) throw new Error('equipment/not-found')

  const timestamp = serverTimestamp()
  const updates = {
    name: values.name.trim(),
    type: values.type.trim(),
    areaId: values.areaId,
    status: values.status,
    criticality: values.criticality || null,
    brand: values.brand.trim() || null,
    model: values.model.trim() || null,
    serialNumber: values.serialNumber.trim() || null,
    notes: values.notes.trim() || null,
    updatedAt: timestamp,
    updatedBy: userId,
  }

  const auditRef = doc(collection(database, 'audit'))
  const batch = writeBatch(database)
  batch.update(equipmentRef, updates)
  batch.set(auditRef, {
    occurredAt: timestamp,
    actorId: userId,
    action: values.status === 'inactive' ? 'disable' : 'update',
    entityType: 'equipment',
    entityId: equipmentId,
    before: currentSnapshot.data(),
    after: updates,
  })
  await batch.commit()
}

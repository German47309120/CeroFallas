import {
  collection,
  documentId,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'

const equipmentCollection = () => collection(getFirebaseFirestore(), 'equipment')

export async function listEquipment() {
  const records = []
  let cursor = null
  // Los formularios necesitan el catálogo completo para no omitir opciones válidas.
  // Se pagina automáticamente y falla de forma explícita antes de crecer sin límite.
  for (let page = 0; page < 10; page++) {
    const clauses = [orderBy('code'), orderBy(documentId()), limit(101)]
    if (cursor) clauses.splice(2, 0, startAfter(cursor))
    const snapshot = await getDocs(query(equipmentCollection(), ...clauses))
    const visible = snapshot.docs.slice(0, 100)
    records.push(...visible.map((item) => ({ id: item.id, ...item.data() })))
    if (snapshot.docs.length <= 100) return records
    cursor = visible.at(-1)
  }
  const error = new Error('El catálogo supera 1000 equipos; utiliza un selector con búsqueda en servidor.')
  error.code = 'equipment/selection-limit'
  throw error
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

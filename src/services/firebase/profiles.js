import { collection, doc, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'
import { validatePermissionSelection } from '../../config/roles.js'

export function subscribeToProfile(userId, onValue, onError) {
  return onSnapshot(
    doc(getFirebaseFirestore(), 'users', userId),
    (snapshot) => onValue(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    onError,
  )
}

export async function updateUserPermissions({ userId, roleId, permissions, actorId }) {
  if (!userId || !actorId || userId === actorId) throw new Error('No puedes modificar los permisos de tu propia cuenta.')
  const issues = validatePermissionSelection(permissions, roleId)
  if (issues.length) throw new Error(issues[0])
  const database = getFirebaseFirestore()
  const userRef = doc(database, 'users', userId)
  const auditRef = doc(collection(database, 'audit'))
  const timestamp = serverTimestamp()
  const batch = writeBatch(database)
  batch.update(userRef, {
    permissions,
    updatedAt: timestamp,
    updatedBy: actorId,
    permissionAuditId: auditRef.id,
  })
  batch.set(auditRef, {
    occurredAt: timestamp,
    actorId,
    action: 'permissions_update',
    entityType: 'user',
    entityId: userId,
    after: { roleId, permissions },
  })
  await batch.commit()
}

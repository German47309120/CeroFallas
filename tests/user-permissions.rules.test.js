import { readFileSync } from 'node:fs'
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { collection, doc, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

let environment
const projectId = 'demo-cerofallas-user-permissions'

async function seedUser(id, roleId, permissions) {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users', id), {
      displayName: id, email: `${id}@novafiber.com.gt`, roleId, roleName: roleId,
      permissions, status: 'active', updatedAt: new Date(),
    })
  })
}

function updatePermissions(actorId, userId, permissions, roleId = 'supervisor') {
  const database = environment.authenticatedContext(actorId).firestore()
  const auditRef = doc(collection(database, 'audit'))
  const batch = writeBatch(database)
  batch.update(doc(database, 'users', userId), {
    permissions, updatedAt: serverTimestamp(), updatedBy: actorId, permissionAuditId: auditRef.id,
  })
  batch.set(auditRef, {
    occurredAt: serverTimestamp(), actorId, action: 'permissions_update', entityType: 'user', entityId: userId,
    after: { roleId, permissions },
  })
  return batch.commit()
}

describe('Gestión individual de permisos', () => {
  beforeAll(async () => {
    environment = await initializeTestEnvironment({
      projectId,
      firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') },
    })
  })
  beforeEach(async () => {
    await environment.clearFirestore()
    await seedUser('admin', 'administrator', ['users.read', 'audit.write'])
    await seedUser('supervisor', 'supervisor', ['equipment.read', 'audit.write'])
    await seedUser('other-admin', 'administrator', ['users.read', 'audit.write'])
  })
  afterAll(() => environment.cleanup())

  it('permite al administrador actualizar a otro usuario con auditoría atómica', async () => {
    await assertSucceeds(updatePermissions('admin', 'supervisor', ['equipment.read', 'audit.write', 'dashboard.read']))
  })

  it('impide cambios propios y cambios ejecutados por perfiles no administradores', async () => {
    await assertFails(updatePermissions('admin', 'admin', ['users.read', 'audit.write', 'dashboard.read'], 'administrator'))
    await assertFails(updatePermissions('supervisor', 'other-admin', ['users.read', 'audit.write'], 'administrator'))
  })

  it('rechaza permisos desconocidos, dependencias incompletas y privilegios de modificación en roles operativos', async () => {
    await assertFails(updatePermissions('admin', 'supervisor', ['equipment.read', 'audit.write', 'unknown.permission']))
    await assertFails(updatePermissions('admin', 'supervisor', ['corrective.create']))
    await assertFails(updatePermissions('admin', 'supervisor', ['equipment.read', 'audit.write', 'equipment.manage']))
  })

  it('exige auditoría vinculada y no permite cambiar rol o estado por esta operación', async () => {
    const database = environment.authenticatedContext('admin').firestore()
    await assertFails(updateDoc(doc(database, 'users', 'supervisor'), { permissions: ['equipment.read'], updatedAt: serverTimestamp(), updatedBy: 'admin', permissionAuditId: 'missing' }))
    await assertFails(updateDoc(doc(database, 'users', 'supervisor'), { roleId: 'administrator', permissions: ['equipment.read'], updatedAt: serverTimestamp(), updatedBy: 'admin', permissionAuditId: 'missing' }))
  })
})

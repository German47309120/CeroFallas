import { backendRoles } from './roles.js'

const fail = (message) => { throw new Error(message) }
const text = (value) => typeof value === 'string' ? value.trim() : ''

export function normalizeCreateUser(data = {}) {
  const displayName = text(data.displayName)
  const email = text(data.email).toLowerCase()
  const password = typeof data.password === 'string' ? data.password : ''
  const roleId = text(data.roleId)
  if (displayName.length < 3 || displayName.length > 120) fail('Nombre inválido')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) fail('Correo inválido')
  if (password.length < 10 || password.length > 128) fail('La contraseña temporal debe tener entre 10 y 128 caracteres')
  if (!backendRoles[roleId]) fail('Rol inválido')
  return { displayName, email, password, roleId }
}

export function normalizeUpdateUser(data = {}) {
  const uid = text(data.uid)
  const displayName = text(data.displayName)
  const roleId = text(data.roleId)
  const status = text(data.status)
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(uid)) fail('Usuario inválido')
  if (displayName.length < 3 || displayName.length > 120) fail('Nombre inválido')
  if (!backendRoles[roleId]) fail('Rol inválido')
  if (!['active', 'disabled'].includes(status)) fail('Estado inválido')
  return { uid, displayName, roleId, status }
}

export function profileForRole(roleId) {
  const role = backendRoles[roleId]
  if (!role) fail('Rol inválido')
  return { roleId, roleName: role.name, permissions: [...role.permissions] }
}

export function evaluateAdministratorAccess(authUid, profile) {
  if (!text(authUid)) return { allowed: false, reason: 'unauthenticated' }
  if (!profile || profile.status !== 'active' || profile.roleId !== 'administrator') {
    return { allowed: false, reason: 'permission-denied' }
  }
  return { allowed: true, actorId: text(authUid) }
}

export function assertSafeAdministratorUpdate(actorId, input) {
  if (input.uid === actorId && (input.status !== 'active' || input.roleId !== 'administrator')) {
    fail('No puedes desactivar ni retirar tu propio rol administrador.')
  }
}

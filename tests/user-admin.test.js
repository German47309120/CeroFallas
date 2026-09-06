import { describe, expect, it } from 'vitest'
import { backendRoles } from '../functions/src/roles.js'
import { assertPasswordResetTarget, assertSafeAdministratorUpdate, evaluateAdministratorAccess, normalizeCreateUser, normalizePasswordReset, normalizeUpdateUser, profileForRole } from '../functions/src/user-admin.js'
import { roleDefinitions } from '../src/config/roles.js'

describe('administración privilegiada de usuarios', () => {
  it('mantiene sincronizados los once roles entre frontend y backend', () => {
    expect(backendRoles).toEqual(roleDefinitions)
    expect(Object.keys(backendRoles)).toHaveLength(11)
  })
  it('normaliza un alta sin conservar campos inesperados', () => {
    expect(normalizeCreateUser({ displayName: '  Técnico Uno ', email: ' TECNICO@EJEMPLO.COM ', password: 'temporal-123', roleId: 'maintenance_technician', admin: true })).toEqual({ displayName: 'Técnico Uno', email: 'tecnico@ejemplo.com', password: 'temporal-123', roleId: 'maintenance_technician' })
  })
  it('rechaza contraseñas cortas y roles desconocidos', () => {
    expect(() => normalizeCreateUser({ displayName: 'Nombre', email: 'a@b.com', password: 'corta', roleId: 'management' })).toThrow('contraseña temporal')
    expect(() => normalizeCreateUser({ displayName: 'Nombre', email: 'a@b.com', password: 'temporal-123', roleId: 'root' })).toThrow('Rol inválido')
  })
  it('acepta solamente estados controlados al modificar', () => {
    expect(normalizeUpdateUser({ uid: 'abc_123', displayName: 'Usuario Prueba', roleId: 'supervisor', status: 'disabled' })).toEqual({ uid: 'abc_123', displayName: 'Usuario Prueba', roleId: 'supervisor', status: 'disabled' })
    expect(() => normalizeUpdateUser({ uid: 'abc', displayName: 'Usuario Prueba', roleId: 'supervisor', status: 'deleted' })).toThrow('Estado inválido')
  })
  it('deriva permisos exclusivamente del rol', () => {
    const profile = profileForRole('management')
    expect(profile.roleName).toBe('Gerencia')
    expect(profile.permissions).toEqual(roleDefinitions.management.permissions)
  })
  it('rechaza solicitudes sin sesión antes de evaluar el perfil', () => {
    expect(evaluateAdministratorAccess('', { status: 'active', roleId: 'administrator' })).toEqual({ allowed: false, reason: 'unauthenticated' })
  })
  it('acepta únicamente un perfil administrador activo', () => {
    expect(evaluateAdministratorAccess('admin-1', { status: 'active', roleId: 'administrator' })).toEqual({ allowed: true, actorId: 'admin-1' })
    expect(evaluateAdministratorAccess('admin-1', { status: 'disabled', roleId: 'administrator' })).toEqual({ allowed: false, reason: 'permission-denied' })
    expect(evaluateAdministratorAccess('support-1', { status: 'active', roleId: 'support' })).toEqual({ allowed: false, reason: 'permission-denied' })
    expect(evaluateAdministratorAccess('missing-1', null)).toEqual({ allowed: false, reason: 'permission-denied' })
  })
  it('impide que el administrador se bloquee a sí mismo', () => {
    expect(() => assertSafeAdministratorUpdate('admin-1', { uid: 'admin-1', roleId: 'administrator', status: 'disabled' })).toThrow('No puedes desactivar')
    expect(() => assertSafeAdministratorUpdate('admin-1', { uid: 'admin-1', roleId: 'support', status: 'active' })).toThrow('retirar tu propio rol')
    expect(() => assertSafeAdministratorUpdate('admin-1', { uid: 'admin-1', roleId: 'administrator', status: 'active' })).not.toThrow()
    expect(() => assertSafeAdministratorUpdate('admin-1', { uid: 'user-2', roleId: 'support', status: 'disabled' })).not.toThrow()
  })
  it('valida el restablecimiento sin conservar campos inesperados', () => {
    expect(normalizePasswordReset({ uid: 'user_2', password: 'Temporal-123!', roleId: 'administrator' })).toEqual({ uid: 'user_2', password: 'Temporal-123!' })
    expect(() => normalizePasswordReset({ uid: 'user_2', password: 'corta' })).toThrow('contraseña temporal')
    expect(() => normalizePasswordReset({ uid: '../user', password: 'Temporal-123!' })).toThrow('Usuario inválido')
  })
  it('obliga al administrador a usar otro flujo para su propia contraseña', () => {
    expect(() => assertPasswordResetTarget('admin-1', 'admin-1')).toThrow('flujo personal')
    expect(() => assertPasswordResetTarget('admin-1', 'user-2')).not.toThrow()
  })
})

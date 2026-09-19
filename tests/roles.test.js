import { describe, expect, it } from 'vitest'
import { permissionCatalog, roleDefinitions, validateRoleDefinitions } from '../src/config/roles.js'

describe('Catálogo institucional de roles', () => {
  it('define todos los roles confirmados y el soporte pendiente de asignación', () => {
    expect(Object.values(roleDefinitions).map((role) => role.name)).toEqual(expect.arrayContaining([
      'Técnico de Mantenimiento', 'Montacarguista', 'Jefe de Mantenimiento', 'Operador de Airlay', 'Digitador',
      'Supervisor', 'Encargado de línea', 'Jefe de Producción', 'Gerencia', 'Administrador de la aplicación', 'Técnico de soporte',
    ]))
  })
  it('no contiene permisos desconocidos, duplicados ni dependencias incompletas', () => {
    expect(validateRoleDefinitions()).toEqual([])
  })
  it('reserva todas las capacidades de modificación para administrador y soporte', () => {
    const privileged = new Set(['administrator', 'support'])
    for (const [id, role] of Object.entries(roleDefinitions)) {
      const manages = role.permissions.some((permission) => permission.endsWith('.manage') || permission === 'users.manage')
      expect(manages).toBe(privileged.has(id))
    }
  })
  it('limita montacarguistas al catálogo, checklist y auditoría necesaria', () => {
    expect(roleDefinitions.forklift_operator.permissions).toEqual(['equipment.read', 'audit.write', 'forklift.read', 'forklift.inspect'])
  })
  it('permite reportar incidentes a digitadores y Airlay sin lectura general', () => {
    for (const id of ['digitizer', 'airlay_operator']) {
      expect(roleDefinitions[id].permissions).toContain('incident.create')
      expect(roleDefinitions[id].permissions).not.toContain('incident.read')
      expect(roleDefinitions[id].permissions).not.toContain('dashboard.read')
    }
  })
  it('mantiene gerencia en lectura y sin operaciones de registro', () => {
    expect(roleDefinitions.management.permissions).toContain('dashboard.read')
    expect(roleDefinitions.management.permissions).toContain('prediction.read')
    expect(roleDefinitions.management.permissions.every((permission) => permission.endsWith('.read'))).toBe(true)
  })
  it('el administrador cubre todo el catálogo conocido', () => {
    expect(new Set(roleDefinitions.administrator.permissions)).toEqual(new Set(Object.keys(permissionCatalog)))
  })
})

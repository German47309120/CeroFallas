export const permissionCatalog = {
  'equipment.read': 'Consultar equipos', 'equipment.manage': 'Administrar equipos',
  'corrective.read': 'Consultar correctivos', 'corrective.create': 'Registrar correctivos', 'corrective.manage': 'Modificar o anular correctivos',
  'preventive.read': 'Consultar preventivos', 'preventive.plan': 'Planificar preventivos', 'preventive.execute': 'Registrar preventivos', 'preventive.manage': 'Modificar o anular preventivos',
  'forklift.read': 'Consultar inspecciones', 'forklift.inspect': 'Completar checklist', 'forklift.manage': 'Administrar inspecciones',
  'incident.read': 'Consultar incidentes', 'incident.create': 'Reportar incidentes', 'incident.manage': 'Dar seguimiento',
  'dashboard.read': 'Consultar dashboard', 'stock.read': 'Consultar stock', 'users.read': 'Consultar perfiles',
  'audit.read': 'Consultar auditoría', 'audit.write': 'Registrar auditoría', 'prediction.read': 'Consultar riesgo predictivo',
  'analytics.export': 'Exportar dataset analítico',
}

const readAndAudit = ['equipment.read', 'audit.write']
const maintenanceEntry = [...readAndAudit, 'corrective.read', 'corrective.create', 'preventive.read', 'preventive.execute']
const operationalLeadership = [...maintenanceEntry, 'dashboard.read', 'stock.read']
const all = Object.keys(permissionCatalog)

export const permissionDependencies = {
  'equipment.manage': ['equipment.read', 'audit.write'], 'corrective.create': ['corrective.read', 'equipment.read', 'audit.write'],
  'corrective.manage': ['corrective.read', 'audit.write'], 'preventive.plan': ['preventive.read', 'equipment.read', 'audit.write'],
  'preventive.execute': ['preventive.read', 'equipment.read', 'audit.write'], 'preventive.manage': ['preventive.read', 'audit.write'],
  'forklift.inspect': ['forklift.read', 'equipment.read', 'audit.write'], 'forklift.manage': ['forklift.read', 'audit.write'],
  'incident.create': ['equipment.read', 'audit.write'], 'incident.manage': ['incident.read', 'audit.write'],
}

export const roleDefinitions = {
  administrator: { name: 'Administrador de la aplicación', permissions: all },
  support: { name: 'Técnico de soporte', permissions: all },
  maintenance_technician: { name: 'Técnico de Mantenimiento', permissions: [...maintenanceEntry, 'stock.read'] },
  forklift_operator: { name: 'Montacarguista', permissions: [...readAndAudit, 'forklift.read', 'forklift.inspect'] },
  maintenance_manager: { name: 'Jefe de Mantenimiento', permissions: [...operationalLeadership, 'incident.read'] },
  airlay_operator: { name: 'Operador de Airlay', permissions: [...readAndAudit, 'incident.create'] },
  digitizer: { name: 'Digitador', permissions: [...readAndAudit, 'incident.create'] },
  supervisor: { name: 'Supervisor', permissions: operationalLeadership },
  line_manager: { name: 'Encargado de línea', permissions: operationalLeadership },
  production_manager: { name: 'Jefe de Producción', permissions: operationalLeadership },
  management: { name: 'Gerencia', permissions: ['dashboard.read', 'corrective.read', 'preventive.read', 'incident.read', 'prediction.read', 'analytics.export'] },
}

export function validateRoleDefinitions(definitions = roleDefinitions) {
  const issues = []
  for (const [roleId, role] of Object.entries(definitions)) {
    if (!role.name?.trim()) issues.push(`${roleId}: nombre vacío`)
    if (new Set(role.permissions).size !== role.permissions.length) issues.push(`${roleId}: permisos duplicados`)
    for (const permission of role.permissions) {
      if (!permissionCatalog[permission]) issues.push(`${roleId}: permiso desconocido ${permission}`)
      for (const dependency of permissionDependencies[permission] ?? []) if (!role.permissions.includes(dependency)) issues.push(`${roleId}: ${permission} requiere ${dependency}`)
    }
  }
  return issues
}

export const privilegedPermissions = Object.keys(permissionCatalog).filter((permission) => permission.endsWith('.manage'))

export function validatePermissionSelection(permissions, roleId) {
  if (!Array.isArray(permissions) || permissions.length === 0) return ['Debe conservar al menos un permiso.']
  const issues = []
  const selected = new Set(permissions)
  if (selected.size !== permissions.length) issues.push('Hay permisos duplicados.')
  for (const permission of selected) {
    if (!permissionCatalog[permission]) issues.push(`Permiso desconocido: ${permission}.`)
    for (const dependency of permissionDependencies[permission] ?? []) {
      if (!selected.has(dependency)) issues.push(`${permission} requiere ${dependency}.`)
    }
  }
  if (!['administrator', 'support'].includes(roleId)) {
    for (const permission of privilegedPermissions) if (selected.has(permission)) issues.push(`${permission} está reservado para administración y soporte.`)
  }
  return issues
}

export function togglePermissionSelection(permissions, permission, checked) {
  const selected = new Set(permissions)
  if (checked) {
    selected.add(permission)
    for (const dependency of permissionDependencies[permission] ?? []) selected.add(dependency)
  } else {
    selected.delete(permission)
    let changed = true
    while (changed) {
      changed = false
      for (const candidate of [...selected]) {
        if ((permissionDependencies[candidate] ?? []).some((dependency) => !selected.has(dependency))) {
          selected.delete(candidate)
          changed = true
        }
      }
    }
  }
  return Object.keys(permissionCatalog).filter((item) => selected.has(item))
}

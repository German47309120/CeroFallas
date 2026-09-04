export const navigationPermissions = {
  '/correctivos': 'corrective.read', '/preventivos': 'preventive.read', '/montacargas': 'forklift.read',
  '/incidentes': 'incident.read', '/equipos': 'equipment.read', '/repuestos': 'stock.read',
  '/riesgo': 'prediction.read', '/admin/usuarios': 'users.read', '/admin/auditoria': 'audit.read',
}

export function canViewNavigation(path, hasPermission) {
  if (path === '/') return true
  if (path === '/incidentes') return hasPermission('incident.read') || hasPermission('incident.create')
  return Boolean(navigationPermissions[path] && hasPermission(navigationPermissions[path]))
}

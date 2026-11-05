export const navigationPermissions = {
  '/correctivos': 'corrective.read', '/preventivos': 'preventive.read', '/montacargas': 'forklift.read',
  '/incidentes': 'incident.read', '/equipos': 'equipment.read', '/repuestos': 'stock.read',
  '/riesgo': 'prediction.read', '/admin/usuarios': 'users.read', '/admin/auditoria': 'audit.read',
  '/analitica': 'dashboard.read',
}

// Cada identidad comienza en una ruta común. No se hereda la pantalla privada
// que pudo haber dejado abierta otro usuario en el mismo navegador.
export function postLoginDestination() {
  return '/'
}

const routeAccessRules = [
  { match: /^\/$/, permissions: [] },
  { match: /^\/perfil$/, permissions: [] },
  { match: /^\/ayuda$/, permissions: [] },
  { match: /^\/correctivos\/nuevo$/, permissions: ['corrective.create'] },
  { match: /^\/correctivos\/[^/]+\/finalizar$/, permissions: ['corrective.create'] },
  { match: /^\/correctivos\/[^/]+\/editar$/, permissions: ['corrective.manage'] },
  { match: /^\/correctivos$/, permissions: ['corrective.read'] },
  { match: /^\/preventivos\/nuevo$/, permissions: ['preventive.plan'] },
  { match: /^\/preventivos\/[^/]+\/editar$/, permissions: ['preventive.manage'] },
  { match: /^\/preventivos\/ejecutar$/, permissions: ['preventive.execute'] },
  { match: /^\/preventivos\/ejecuciones\/[^/]+\/finalizar$/, permissions: ['preventive.execute'] },
  { match: /^\/preventivos$/, permissions: ['preventive.read'] },
  { match: /^\/montacargas\/nuevo$/, permissions: ['forklift.inspect'] },
  { match: /^\/montacargas$/, permissions: ['forklift.read'] },
  { match: /^\/incidentes\/nuevo$/, permissions: ['incident.create'] },
  { match: /^\/incidentes$/, permissions: ['incident.read', 'incident.create'] },
  { match: /^\/equipos\/nuevo$/, permissions: ['equipment.manage'] },
  { match: /^\/equipos\/[^/]+\/editar$/, permissions: ['equipment.manage'] },
  { match: /^\/equipos\/[^/]+$/, permissions: ['equipment.read'] },
  { match: /^\/equipos$/, permissions: ['equipment.read'] },
  { match: /^\/repuestos$/, permissions: ['stock.read'] },
  { match: /^\/riesgo$/, permissions: ['prediction.read'] },
  { match: /^\/analitica$/, permissions: ['dashboard.read'] },
  { match: /^\/admin\/usuarios$/, permissions: ['users.read'] },
  { match: /^\/admin\/auditoria$/, permissions: ['audit.read'] },
]

export function canAccessRoute(path, hasPermission) {
  const normalized = path.replace(/\/+$/, '') || '/'
  const rule = routeAccessRules.find(({ match }) => match.test(normalized))
  if (!rule) return false
  return rule.permissions.length === 0 || rule.permissions.some(hasPermission)
}

export function canViewNavigation(path, hasPermission) {
  if (['/', '/ayuda'].includes(path)) return true
  if (path === '/incidentes') return hasPermission('incident.read') || hasPermission('incident.create')
  return Boolean(navigationPermissions[path] && hasPermission(navigationPermissions[path]))
}

export const backendRoles = {
  administrator: { name: 'Administrador de la aplicación', permissions: ['equipment.read', 'equipment.manage', 'corrective.read', 'corrective.create', 'corrective.manage', 'preventive.read', 'preventive.plan', 'preventive.execute', 'preventive.manage', 'forklift.read', 'forklift.inspect', 'forklift.manage', 'incident.read', 'incident.create', 'incident.manage', 'dashboard.read', 'stock.read', 'users.read', 'audit.read', 'audit.write', 'prediction.read'] },
  support: { name: 'Técnico de soporte', permissions: ['equipment.read', 'equipment.manage', 'corrective.read', 'corrective.create', 'corrective.manage', 'preventive.read', 'preventive.plan', 'preventive.execute', 'preventive.manage', 'forklift.read', 'forklift.inspect', 'forklift.manage', 'incident.read', 'incident.create', 'incident.manage', 'dashboard.read', 'stock.read', 'users.read', 'audit.read', 'audit.write', 'prediction.read'] },
  maintenance_technician: { name: 'Técnico de Mantenimiento', permissions: ['equipment.read', 'audit.write', 'corrective.read', 'corrective.create', 'preventive.read', 'preventive.execute', 'stock.read'] },
  forklift_operator: { name: 'Montacarguista', permissions: ['equipment.read', 'audit.write', 'forklift.read', 'forklift.inspect'] },
  maintenance_manager: { name: 'Jefe de Mantenimiento', permissions: ['equipment.read', 'audit.write', 'corrective.read', 'corrective.create', 'preventive.read', 'preventive.execute', 'dashboard.read', 'stock.read', 'incident.read'] },
  airlay_operator: { name: 'Operador de Airlay', permissions: ['equipment.read', 'audit.write', 'incident.create'] },
  digitizer: { name: 'Digitador', permissions: ['equipment.read', 'audit.write', 'incident.create'] },
  supervisor: { name: 'Supervisor', permissions: ['equipment.read', 'audit.write', 'corrective.read', 'corrective.create', 'preventive.read', 'preventive.execute', 'dashboard.read', 'stock.read'] },
  line_manager: { name: 'Encargado de línea', permissions: ['equipment.read', 'audit.write', 'corrective.read', 'corrective.create', 'preventive.read', 'preventive.execute', 'dashboard.read', 'stock.read'] },
  production_manager: { name: 'Jefe de Producción', permissions: ['equipment.read', 'audit.write', 'corrective.read', 'corrective.create', 'preventive.read', 'preventive.execute', 'dashboard.read', 'stock.read'] },
  management: { name: 'Gerencia', permissions: ['dashboard.read', 'corrective.read', 'preventive.read', 'incident.read'] },
}

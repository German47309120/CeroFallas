export const navigationGroups = [
  {
    label: 'Operación',
    items: [
      { to: '/', label: 'Inicio', shortLabel: 'Inicio', end: true },
      { to: '/correctivos', label: 'Correctivos', shortLabel: 'Correctivos' },
      { to: '/preventivos', label: 'Preventivos', shortLabel: 'Preventivos' },
      { to: '/montacargas', label: 'Montacargas', shortLabel: 'Checklist' },
      { to: '/incidentes', label: 'Incidentes', shortLabel: 'Incidentes' },
    ],
  },
  {
    label: 'Recursos',
    items: [
      { to: '/equipos', label: 'Equipos', shortLabel: 'Equipos' },
      { to: '/repuestos', label: 'Repuestos', shortLabel: 'Stock' },
      { to: '/riesgo', label: 'IA predictiva', shortLabel: 'IA predictiva' },
      { to: '/asistente', label: 'Asistente IA', shortLabel: 'Asistente IA' },
      { to: '/analitica', label: 'Reporte gerencial', shortLabel: 'Análisis' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/admin/usuarios', label: 'Usuarios', shortLabel: 'Usuarios' },
      { to: '/admin/auditoria', label: 'Auditoría', shortLabel: 'Auditoría' },
    ],
  },
  {
    label: 'Soporte',
    items: [
      { to: '/ayuda', label: 'Guía de uso', shortLabel: 'Ayuda' },
    ],
  },
]

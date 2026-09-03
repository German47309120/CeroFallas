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
      { to: '/riesgo', label: 'Riesgo predictivo', shortLabel: 'Riesgo' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/admin/usuarios', label: 'Usuarios', shortLabel: 'Usuarios' },
      { to: '/admin/auditoria', label: 'Auditoría', shortLabel: 'Auditoría' },
    ],
  },
]

export const moduleContent = {
  '/correctivos': {
    eyebrow: 'Mantenimiento',
    title: 'Correctivos',
    description: 'Registra fallas no planificadas y consulta sus tiempos de atención.',
    action: 'Nuevo correctivo',
    actionTo: '/correctivos/nuevo',
  },
  '/preventivos': {
    eyebrow: 'Mantenimiento',
    title: 'Preventivos',
    description: 'Administra el programa, las ejecuciones y el cumplimiento preventivo.',
    action: 'Programar preventivo',
    actionTo: '/preventivos/nuevo',
  },
  '/montacargas': {
    eyebrow: 'Inspección',
    title: 'Checklist de montacargas',
    description: 'Consulta las inspecciones diarias y el estado operativo de cada equipo.',
    action: 'Nueva inspección',
    actionTo: '/montacargas/nuevo',
  },
  '/incidentes': {
    eyebrow: 'Operación',
    title: 'Incidentes',
    description: 'Consulta reportes rápidos de máquinas y su seguimiento.',
    action: 'Reportar incidente',
    actionTo: '/incidentes/nuevo',
  },
  '/equipos': {
    eyebrow: 'Activos',
    title: 'Equipos',
    description: 'Catálogo central de activos y acceso a su historial.',
    action: 'Nuevo equipo',
    actionTo: '/equipos/nuevo',
  },
  '/repuestos': {
    eyebrow: 'SAP · solo lectura',
    title: 'Stock de repuestos',
    description: 'Consulta existencias por código, descripción y almacén.',
  },
  '/riesgo': {
    eyebrow: 'Análisis',
    title: 'Riesgo predictivo',
    description: 'Prioriza equipos según resultados versionados y explicables.',
  },
  '/admin/usuarios': {
    eyebrow: 'Administración',
    title: 'Usuarios',
    description: 'Administra perfiles, roles y estado de acceso.',
    action: 'Nuevo usuario',
  },
  '/admin/auditoria': {
    eyebrow: 'Administración',
    title: 'Auditoría',
    description: 'Revisa cambios, anulaciones y operaciones sensibles.',
  },
}

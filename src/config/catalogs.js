export const areas = [
  { id: 'linea-1', name: 'Línea 1' },
  { id: 'linea-2', name: 'Línea 2' },
  { id: 'linea-3', name: 'Línea 3' },
  { id: 'linea-4', name: 'Línea 4' },
  { id: 'abastecimiento', name: 'Abastecimiento' },
  { id: 'mantenimiento', name: 'Mantenimiento' },
  { id: 'servicios-generales', name: 'Servicios Generales' },
]

export const equipmentStatuses = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'out_of_service', label: 'Fuera de servicio' },
]

export const criticalityOptions = [
  { value: '', label: 'Sin definir' },
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
]

export function getAreaName(areaId) {
  return areas.find((area) => area.id === areaId)?.name ?? areaId
}

export const provisionalFailureTypes = [
  'Cadena de pulsunadora',
  'Cilindro no enciende',
  'Limpieza general',
  'Habilitar cargadora 3',
  'Presencia de agua en mangueras',
  'Abrir sensores del Airlay',
  'Cambio de cuchilla transversal',
  'Falla en mezcladora',
  'Cuchilla gira lento',
]

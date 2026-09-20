const columns = [
  'tipo_registro', 'id_registro', 'equipo_id', 'equipo_codigo', 'equipo_nombre', 'area_id',
  'estado', 'prioridad', 'fecha_programada', 'fecha_inicio', 'fecha_fin', 'duracion_minutos',
  'actividad', 'detalle', 'cumplimiento', 'origen_dato',
]

const iso = (value) => {
  const date = value?.toDate instanceof Function ? value.toDate() : value instanceof Date ? value : null
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : ''
}

const common = (record, type) => ({
  tipo_registro: type,
  id_registro: record.id ?? '',
  equipo_id: record.equipmentId ?? '',
  equipo_codigo: record.equipmentSnapshot?.code ?? '',
  equipo_nombre: record.equipmentSnapshot?.name ?? '',
  area_id: record.areaId ?? '',
  estado: record.status ?? '',
  prioridad: record.priority ?? '',
  fecha_programada: iso(record.scheduledAt ?? record.nextDueAt),
  fecha_inicio: iso(record.startedAt ?? record.createdAt),
  fecha_fin: iso(record.endedAt),
  duracion_minutos: Number.isFinite(record.durationMinutes) ? record.durationMinutes : '',
  actividad: '', detalle: '', cumplimiento: record.complianceStatus ?? '',
  origen_dato: record.dataOrigin ?? 'operacional',
})

export function maintenancePowerBiRows(datasets) {
  return [
    ...(datasets.correctives ?? []).map((record) => ({ ...common(record, 'correctivo'), actividad: record.workPerformed ?? '', detalle: record.failureType ?? record.reportedSymptom ?? '' })),
    ...(datasets.preventivePlans ?? []).map((record) => ({ ...common(record, 'plan_preventivo'), actividad: record.activityName ?? '', detalle: record.activityDescription ?? '' })),
    ...(datasets.preventiveExecutions ?? []).map((record) => ({ ...common(record, 'ejecucion_preventiva'), actividad: record.activityPerformed ?? '', detalle: record.observations ?? '' })),
    ...(datasets.incidents ?? []).map((record) => ({ ...common(record, 'incidente'), actividad: 'Incidente reportado', detalle: record.description ?? '' })),
  ]
}

function csvCell(value) {
  let text = String(value ?? '')
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

export function maintenancePowerBiCsv(datasets) {
  const rows = maintenancePowerBiRows(datasets)
  return `\ufeff${columns.map(csvCell).join(',')}\r\n${rows.map((row) => columns.map((column) => csvCell(row[column])).join(',')).join('\r\n')}`
}

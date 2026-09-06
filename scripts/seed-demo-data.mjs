import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, Timestamp, writeBatch } from 'firebase/firestore'

const projectId = 'demo-cerofallas'
const environment = await initializeTestEnvironment({
  projectId,
  firestore: { host: '127.0.0.1', port: 8080 },
})

const now = new Date()
const actorId = 'demo-seed-system'
const stamp = (date) => Timestamp.fromDate(date)
const addDays = (days, hour = 9) => {
  const value = new Date(now)
  value.setHours(hour, 0, 0, 0)
  value.setDate(value.getDate() + days)
  return value
}
const plusMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60_000)

const equipment = [
  ['AIRLAY-01', 'Airlay 1', 'Airlay', 'linea-1', 'high'],
  ['PULS-01', 'Pulsonadora 1', 'Pulsonadora', 'linea-1', 'high'],
  ['CARG-03', 'Cargadora 3', 'Cargadora', 'linea-2', 'medium'],
  ['MEZC-01', 'Mezcladora 1', 'Mezcladora', 'linea-2', 'high'],
  ['CORT-01', 'Cortadora transversal', 'Cortadora', 'linea-3', 'high'],
  ['COMP-01', 'Compactadora 1', 'Compactadora', 'linea-4', 'medium'],
  ['MONT-01', 'Montacargas 1', 'Montacargas', 'abastecimiento', 'high'],
  ['MONT-02', 'Montacargas 2', 'Montacargas', 'abastecimiento', 'medium'],
]

const equipmentMap = new Map(equipment.map(([code, name, type, areaId, criticality]) => [code, { code, name, type, areaId, criticality }]))
const areaNames = { 'linea-1': 'Línea 1', 'linea-2': 'Línea 2', 'linea-3': 'Línea 3', 'linea-4': 'Línea 4', abastecimiento: 'Abastecimiento' }
const snapshot = (code) => ({ code, name: equipmentMap.get(code).name })

const records = []
const add = (collectionName, id, data) => records.push({
  collectionName, id,
  data: collectionName === 'equipment' ? data : { ...data, dataOrigin: 'demo', demoVersion: 1 },
})

for (const [code, name, type, areaId, criticality] of equipment) {
  add('equipment', code, {
    code, name, type, areaId, status: 'active', criticality,
    brand: code.startsWith('AIRLAY') ? 'Andritz' : null, model: null, serialNumber: null,
    notes: 'Registro demostrativo pendiente de validación en planta.',
    createdAt: stamp(addDays(-120)), createdBy: actorId, updatedAt: stamp(addDays(-1)), updatedBy: actorId,
  })
}

const plans = [
  ['demo-plan-airlay', 'AIRLAY-01', 'Inspección de sensores Airlay', -12, 30, 'day', 'active'],
  ['demo-plan-pulsonadora', 'PULS-01', 'Inspección de cadena', -5, 2, 'week', 'active'],
  ['demo-plan-mezcladora', 'MEZC-01', 'Lubricación de mezcladora', -2, 1, 'month', 'active'],
  ['demo-plan-mont1', 'MONT-01', 'Inspección general de montacargas', 1, 1, 'week', 'active'],
  ['demo-plan-cortadora', 'CORT-01', 'Revisión de cuchilla transversal', 2, 15, 'day', 'active'],
  ['demo-plan-cargadora', 'CARG-03', 'Limpieza y ajuste de cargadora', 4, 30, 'day', 'active'],
  ['demo-plan-compactadora', 'COMP-01', 'Inspección de compactación', 6, 1, 'month', 'active'],
  ['demo-plan-mont2', 'MONT-02', 'Servicio por horas de uso', 14, 250, 'hour', 'active'],
  ['demo-plan-condicion', 'AIRLAY-01', 'Revisión según vibración', 20, null, null, 'active'],
  ['demo-plan-pausado', 'PULS-01', 'Actividad temporalmente pausada', 8, 30, 'day', 'paused'],
]
for (const [id, code, activityName, dueDays, frequencyValue, frequencyUnit, status] of plans) {
  const item = equipmentMap.get(code)
  const frequencyType = frequencyUnit === 'hour' ? 'hours' : frequencyUnit ? 'calendar' : 'condition'
  add('preventivePlans', id, {
    equipmentId: code, equipmentSnapshot: snapshot(code), activityName,
    activityDescription: 'Frecuencia estimada para demostración; requiere validación del área de mantenimiento.',
    frequencyType, frequencyValue, frequencyUnit, estimatedFrequency: true,
    nextDueAt: stamp(addDays(dueDays, 12)), assignedUserIds: [], status, voidReason: null,
    areaId: item.areaId, createdAt: stamp(addDays(-100)), createdBy: actorId,
    updatedAt: stamp(addDays(-3)), updatedBy: actorId,
  })
}

const failures = [
  ['PULS-01', 'Cadena de pulsonadora con tensión irregular', 'Ajuste y lubricación de cadena'],
  ['CARG-03', 'Cilindro no enciende', 'Revisión eléctrica y habilitación del cilindro'],
  ['AIRLAY-01', 'Presencia de agua en mangueras', 'Purga y limpieza de líneas neumáticas'],
  ['CORT-01', 'Cuchilla gira lento', 'Ajuste de transmisión y prueba de velocidad'],
  ['MEZC-01', 'Falla en mezcladora', 'Inspección y ajuste de acople'],
  ['AIRLAY-01', 'Sensores del Airlay obstruidos', 'Apertura y limpieza de sensores'],
  ['CORT-01', 'Desgaste de cuchilla transversal', 'Cambio de cuchilla transversal'],
  ['CARG-03', 'Cargadora 3 fuera de servicio', 'Habilitación y pruebas de cargadora 3'],
  ['COMP-01', 'Acumulación de material', 'Limpieza general y verificación'],
  ['MONT-01', 'Freno de servicio con recorrido largo', 'Ajuste y prueba funcional de frenos'],
  ['PULS-01', 'Ruido anormal en cadena', 'Alineación de transmisión'],
  ['MEZC-01', 'Paro intermitente de mezcladora', 'Ajuste de sensor y prueba operativa'],
]
const correctiveDays = [-1, -2, -4, -6, -9, -14, -18, -25, -33, -45, -61, -88]
failures.forEach(([code, symptom, workPerformed], index) => {
  const item = equipmentMap.get(code)
  const startedAt = addDays(correctiveDays[index], 7 + (index % 8))
  const durationMinutes = 35 + index * 7
  add('correctives', `demo-corrective-${String(index + 1).padStart(2, '0')}`, {
    workOrder: `DEMO-${1200 + index}`, eventDate: startedAt.toISOString().slice(0, 10),
    startedAt: stamp(startedAt), endedAt: stamp(plusMinutes(startedAt, durationMinutes)), durationMinutes,
    areaId: item.areaId, areaSnapshot: { id: item.areaId, name: areaNames[item.areaId] },
    equipmentId: code, equipmentSnapshot: snapshot(code), technicianIds: [actorId],
    reportedSymptom: symptom, failureType: symptom, affectedComponent: null, identifiedCause: null,
    workPerformed, observations: 'Dato de demostración.', spareParts: [], status: index === 10 ? 'draft' : 'completed', voidReason: null,
    createdAt: stamp(startedAt), createdBy: actorId, updatedAt: stamp(plusMinutes(startedAt, durationMinutes)), updatedBy: actorId,
  })
})

for (let index = 0; index < 10; index++) {
  const code = equipment[index % equipment.length][0]
  const item = equipmentMap.get(code)
  const startedAt = addDays(-2 - index * 5, 8 + (index % 5))
  const durationMinutes = 45 + index * 4
  add('preventiveExecutions', `demo-execution-${String(index + 1).padStart(2, '0')}`, {
    planId: plans[index % 7][0], equipmentId: code, equipmentSnapshot: snapshot(code),
    scheduledAt: stamp(addDays(-2 - index * 5, 12)), startedAt: stamp(startedAt), endedAt: stamp(plusMinutes(startedAt, durationMinutes)), durationMinutes,
    technicianIds: [actorId], activityPerformed: `Inspección preventiva demostrativa de ${item.name}`,
    spareParts: [], observations: 'Ejecución de demostración.', complianceStatus: index % 4 === 0 ? 'late' : 'on_time',
    rescheduleStatus: 'automatic', nextDueAtAfterExecution: stamp(addDays(28 - index * 5, 12)), status: 'completed',
    createdAt: stamp(startedAt), createdBy: actorId, updatedAt: stamp(plusMinutes(startedAt, durationMinutes)), updatedBy: actorId,
  })
}

const incidents = [
  ['AIRLAY-01', 'critical', 'reported', 'Paro repentino del Airlay durante producción'],
  ['PULS-01', 'high', 'acknowledged', 'Ruido fuerte en cadena de pulsonadora'],
  ['CORT-01', 'critical', 'in_progress', 'Cuchilla transversal detenida'],
  ['MEZC-01', 'high', 'reported', 'Mezcladora presenta vibración anormal'],
  ['CARG-03', 'medium', 'reported', 'Cargadora trabaja de forma intermitente'],
  ['MONT-01', 'high', 'in_progress', 'Fuga visible en manguera hidráulica'],
  ['AIRLAY-01', 'low', 'resolved', 'Sensor requirió limpieza general'],
]
incidents.forEach(([code, priority, status, description], index) => {
  const item = equipmentMap.get(code)
  const createdAt = addDays(-index, 6 + index)
  add('incidents', `demo-incident-${String(index + 1).padStart(2, '0')}`, {
    areaId: item.areaId, areaName: areaNames[item.areaId], equipmentId: code, equipmentSnapshot: snapshot(code),
    description, priority, status, reporterId: actorId, createdBy: actorId, createdAt: stamp(createdAt),
    updatedBy: actorId, updatedAt: stamp(createdAt), linkedCorrectiveId: null,
    followUp: status === 'resolved' ? 'Limpieza realizada y equipo verificado.' : '', auditId: `demo-audit-incident-${index + 1}`,
  })
})

const checklistItems = ['Llantas', 'Mangueras', 'Cilindros', 'Frenos', 'Refrigerante', 'Aceite de motor', 'Aceite hidráulico', 'Luces', 'Alarma de retroceso', 'Claxon', 'Cinturón', 'Horquillas', 'Cadenas', 'Mástil', 'Dirección', 'Freno de estacionamiento', 'Tablero', 'Batería', 'Extintor', 'Espejos', 'Asiento', 'Fugas', 'Carrocería', 'Limpieza', 'Prueba operativa']
for (let index = 0; index < 6; index++) {
  const code = index % 2 ? 'MONT-02' : 'MONT-01'
  const inspectedAt = addDays(-index, index % 2 ? 18 : 6)
  const hasObservation = index === 1
  add('forkliftInspections', `demo-inspection-${String(index + 1).padStart(2, '0')}`, {
    equipmentId: code, equipmentSnapshot: snapshot(code), templateId: 'forklift-daily-v1', templateVersion: 1,
    inspectedAt: stamp(inspectedAt), shiftId: index % 2 ? 'shift-2' : 'shift-1', operatorId: actorId,
    hourMeter: 1250 + index * 12.5,
    answers: checklistItems.map((label, itemIndex) => ({ itemId: `item-${itemIndex}`, label, critical: ['Frenos', 'Horquillas', 'Dirección'].includes(label), status: hasObservation && label === 'Llantas' ? 'attention_required' : 'good', observation: hasObservation && label === 'Llantas' ? 'Desgaste moderado; programar revisión.' : null })),
    criticalFailures: 0, overallResult: hasObservation ? 'attention_required' : 'fit', generalObservations: hasObservation ? 'Revisar desgaste de llantas.' : null,
    evidenceUrls: [], status: 'completed', createdAt: stamp(inspectedAt), createdBy: actorId,
  })
}

const stock = [
  ['REP-001', 'Cadena industrial para pulsonadora', 4, 'REPUESTOS'], ['REP-002', 'Manguera hidráulica 1/2 pulgada', 12, 'REPUESTOS'],
  ['REP-003', 'Cuchilla transversal', 2, 'REPUESTOS'], ['REP-004', 'Sensor inductivo', 8, 'ELECTRICO'],
  ['REP-005', 'Rodamiento industrial', 16, 'REPUESTOS'], ['REP-006', 'Aceite hidráulico 20 L', 6, 'LUBRICANTES'],
  ['REP-007', 'Pastillas de freno montacargas', 3, 'REPUESTOS'], ['REP-008', 'Refrigerante industrial', 9, 'LUBRICANTES'],
  ['REP-009', 'Correa de transmisión', 5, 'REPUESTOS'], ['REP-010', 'Filtro hidráulico', 7, 'REPUESTOS'],
]
stock.forEach(([code, description, quantity, warehouse]) => add('stock', `demo-${code}`, { code, description, quantity, warehouse, syncedAt: stamp(addDays(0, 5)), source: 'demo-local' }))

for (let index = 0; index < 12; index++) {
  add('audit', `demo-audit-${String(index + 1).padStart(2, '0')}`, {
    occurredAt: stamp(addDays(-index, 10)), actorId, action: index % 3 === 0 ? 'create' : 'update',
    entityType: index % 2 === 0 ? 'corrective' : 'preventiveExecution', entityId: `demo-${index + 1}`,
    reason: 'Evento generado para demostración local.',
  })
}

await environment.withSecurityRulesDisabled(async (context) => {
  const database = context.firestore()
  for (let offset = 0; offset < records.length; offset += 400) {
    const batch = writeBatch(database)
    for (const record of records.slice(offset, offset + 400)) batch.set(doc(database, record.collectionName, record.id), record.data)
    await batch.commit()
  }
})

await environment.cleanup()
console.log(`Datos demo cargados: ${records.length} registros en ${projectId}.`)
console.log('Colecciones: equipos, planes, ejecuciones, correctivos, incidentes, inspecciones, stock y auditoría.')

import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, Timestamp, writeBatch } from 'firebase/firestore'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const projectId = 'demo-cerofallas'

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
  ['BOMB-01', 'Bomba de proceso 1', 'Bomba', 'linea-3', 'high'],
  ['VENT-01', 'Ventilador industrial 1', 'Ventilador', 'linea-4', 'medium'],
  ['TALL-01', 'Equipo de taller 1', 'Equipo de taller', 'mantenimiento', 'medium'],
  ['COMP-AIR-01', 'Compresor de aire 1', 'Compresor', 'servicios-generales', 'critical'],
  ['BOMB-AGUA-01', 'Bomba de agua 1', 'Bomba', 'servicios-generales', 'high'],
  ['MONT-03', 'Montacargas 3', 'Montacargas', 'abastecimiento', 'high'],
]

const equipmentMap = new Map(equipment.map(([code, name, type, areaId, criticality]) => [code, { code, name, type, areaId, criticality }]))
const areaNames = { 'linea-1': 'Línea 1', 'linea-2': 'Línea 2', 'linea-3': 'Línea 3', 'linea-4': 'Línea 4', abastecimiento: 'Abastecimiento', mantenimiento: 'Mantenimiento', 'servicios-generales': 'Servicios Generales' }
const snapshot = (code) => ({ code, name: equipmentMap.get(code).name })

export const records = []
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
  ['demo-plan-bomba', 'BOMB-01', 'Inspección de sello y vibración', 3, 15, 'day', 'active'],
  ['demo-plan-ventilador', 'VENT-01', 'Limpieza y revisión de rodamientos', 5, 1, 'month', 'active'],
  ['demo-plan-taller', 'TALL-01', 'Revisión de herramientas de taller', 7, 1, 'month', 'active'],
  ['demo-plan-compresor', 'COMP-AIR-01', 'Servicio general del compresor', -8, 2, 'week', 'active'],
  ['demo-plan-bomba-agua', 'BOMB-AGUA-01', 'Inspección de bomba de agua', 9, 15, 'day', 'active'],
  ['demo-plan-mont3', 'MONT-03', 'Servicio preventivo de montacargas', 11, 250, 'hour', 'active'],
  ['demo-plan-airlay-limpieza', 'AIRLAY-01', 'Limpieza interna de ductos', 13, 2, 'week', 'active'],
  ['demo-plan-cortadora-seguridad', 'CORT-01', 'Inspección de guardas y paro', -1, 1, 'month', 'active'],
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
  ['BOMB-01', 'Fuga leve en sello de bomba', 'Ajuste de sello y prueba de presión'],
  ['VENT-01', 'Vibración en ventilador industrial', 'Alineación y revisión de rodamientos'],
  ['TALL-01', 'Herramienta de taller sin alimentación', 'Revisión de cableado y prueba funcional'],
  ['COMP-AIR-01', 'Baja presión de aire comprimido', 'Limpieza de filtro y revisión de fugas'],
  ['BOMB-AGUA-01', 'Caudal irregular en bomba de agua', 'Limpieza de impulsor y prueba de caudal'],
  ['MONT-03', 'Alarma de retroceso intermitente', 'Ajuste de conexión y prueba de alarma'],
]
for (let index = 0; index < 48; index++) {
  const [code, baseSymptom, workPerformed] = failures[index % failures.length]
  const cycle = Math.floor(index / failures.length) + 1
  const symptom = cycle === 1 ? baseSymptom : `${baseSymptom} · recurrencia demostrativa ${cycle}`
  const item = equipmentMap.get(code)
  const startedAt = addDays(-(1 + (index * 3) % 120), 6 + (index % 12))
  const durationMinutes = 25 + (index * 11) % 150
  const status = index > 0 && index % 17 === 0 ? 'voided' : index > 0 && index % 13 === 0 ? 'draft' : 'completed'
  add('correctives', `demo-corrective-${String(index + 1).padStart(2, '0')}`, {
    workOrder: `DEMO-${1200 + index}`, eventDate: startedAt.toISOString().slice(0, 10),
    startedAt: stamp(startedAt), endedAt: stamp(plusMinutes(startedAt, durationMinutes)), durationMinutes,
    areaId: item.areaId, areaSnapshot: { id: item.areaId, name: areaNames[item.areaId] },
    equipmentId: code, equipmentSnapshot: snapshot(code), technicianIds: [actorId],
    reportedSymptom: symptom, failureType: symptom, affectedComponent: null, identifiedCause: null,
    workPerformed, observations: 'Dato de demostración.', spareParts: [], status,
    voidReason: status === 'voided' ? 'Registro anulado para demostrar trazabilidad sin eliminación física.' : null,
    createdAt: stamp(startedAt), createdBy: actorId, updatedAt: stamp(plusMinutes(startedAt, durationMinutes)), updatedBy: actorId,
  })
}

const activePlanByEquipment = new Map(plans.filter(([, , , , , , status]) => status === 'active').map(([id, code]) => [code, id]))
for (let index = 0; index < 36; index++) {
  const code = equipment[index % equipment.length][0]
  const item = equipmentMap.get(code)
  const executionDay = -(1 + (index * 3) % 105)
  const late = index % 4 === 0
  const startedAt = addDays(executionDay, 8 + (index % 5))
  const durationMinutes = 35 + (index * 7) % 95
  add('preventiveExecutions', `demo-execution-${String(index + 1).padStart(2, '0')}`, {
    planId: activePlanByEquipment.get(code) || null, equipmentId: code, equipmentSnapshot: snapshot(code),
    scheduledAt: stamp(addDays(executionDay - (late ? 2 : 0), 6)), startedAt: stamp(startedAt), endedAt: stamp(plusMinutes(startedAt, durationMinutes)), durationMinutes,
    technicianIds: [actorId], activityPerformed: `Inspección preventiva demostrativa de ${item.name}`,
    spareParts: [], observations: 'Ejecución de demostración.', complianceStatus: late ? 'late' : 'on_time',
    rescheduleStatus: activePlanByEquipment.has(code) ? 'automatic' : 'not_applicable', nextDueAtAfterExecution: stamp(addDays(executionDay + 30, 12)),
    meterReading: null, conditionResult: null, status: 'completed',
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
  ['BOMB-01', 'medium', 'acknowledged', 'Goteo observado cerca del sello de bomba'],
  ['VENT-01', 'medium', 'reported', 'Ventilador presenta vibración fuera de lo habitual'],
  ['TALL-01', 'low', 'resolved', 'Equipo de taller requirió ajuste eléctrico'],
  ['COMP-AIR-01', 'critical', 'in_progress', 'Presión de aire por debajo del rango operativo'],
  ['BOMB-AGUA-01', 'high', 'acknowledged', 'Caudal de agua inestable durante operación'],
  ['MONT-03', 'high', 'reported', 'Alarma de retroceso no se escucha de forma constante'],
]
for (let index = 0; index < 24; index++) {
  const [code, priority, baseStatus, baseDescription] = incidents[index % incidents.length]
  const status = index >= incidents.length && baseStatus === 'resolved' ? 'reported' : baseStatus
  const description = index < incidents.length ? baseDescription : `${baseDescription} · seguimiento demostrativo ${Math.floor(index / incidents.length) + 1}`
  const item = equipmentMap.get(code)
  const createdAt = addDays(-(index % 21), 6 + (index % 12))
  add('incidents', `demo-incident-${String(index + 1).padStart(2, '0')}`, {
    areaId: item.areaId, areaName: areaNames[item.areaId], equipmentId: code, equipmentSnapshot: snapshot(code),
    description, priority, status, reporterId: actorId, createdBy: actorId, createdAt: stamp(createdAt),
    updatedBy: actorId, updatedAt: stamp(createdAt), linkedCorrectiveId: null,
    followUp: status === 'reported' ? '' : status === 'resolved' ? 'Atención completada y equipo verificado.' : 'Reporte revisado; atención coordinada con mantenimiento.', auditId: `demo-audit-incident-${index + 1}`,
  })
  add('audit', `demo-audit-incident-${index + 1}`, {
    occurredAt: stamp(createdAt), actorId, action: 'create', entityType: 'incident',
    entityId: `demo-incident-${String(index + 1).padStart(2, '0')}`, reason: 'Incidente generado para demostración local.',
  })
}

const checklistItems = ['Llantas', 'Mangueras', 'Cilindros', 'Frenos', 'Refrigerante', 'Aceite de motor', 'Aceite hidráulico', 'Luces', 'Alarma de retroceso', 'Claxon', 'Cinturón', 'Horquillas', 'Cadenas', 'Mástil', 'Dirección', 'Freno de estacionamiento', 'Tablero', 'Batería', 'Extintor', 'Espejos', 'Asiento', 'Fugas', 'Carrocería', 'Limpieza', 'Prueba operativa']
for (let index = 0; index < 30; index++) {
  const code = ['MONT-01', 'MONT-02', 'MONT-03'][index % 3]
  const inspectedAt = addDays(-Math.floor(index / 2), index % 2 ? 18 : 6)
  const hasCriticalFailure = index > 0 && index % 11 === 0
  const hasObservation = !hasCriticalFailure && index % 4 === 1
  add('forkliftInspections', `demo-inspection-${String(index + 1).padStart(2, '0')}`, {
    equipmentId: code, equipmentSnapshot: snapshot(code), templateId: 'forklift-daily-v1', templateVersion: 1,
    inspectedAt: stamp(inspectedAt), shiftId: index % 2 ? 'shift-2' : 'shift-1', operatorId: actorId,
    hourMeter: 1250 + index * 12.5,
    answers: checklistItems.map((label, itemIndex) => ({ itemId: `item-${itemIndex}`, label, critical: ['Frenos', 'Horquillas', 'Dirección'].includes(label), status: hasCriticalFailure && label === 'Frenos' ? 'out_of_service' : hasObservation && label === 'Llantas' ? 'attention_required' : 'good', observation: hasCriticalFailure && label === 'Frenos' ? 'Freno fuera de condición; equipo inmovilizado.' : hasObservation && label === 'Llantas' ? 'Desgaste moderado; programar revisión.' : null })),
    criticalFailures: hasCriticalFailure ? 1 : 0, overallResult: hasCriticalFailure ? 'out_of_service' : hasObservation ? 'attention_required' : 'fit', generalObservations: hasCriticalFailure ? 'No utilizar hasta completar revisión de frenos.' : hasObservation ? 'Revisar desgaste de llantas.' : null,
    evidenceUrls: [], status: 'completed', createdAt: stamp(inspectedAt), createdBy: actorId,
  })
}

const stock = [
  ['REP-001', 'Cadena industrial para pulsonadora', 4, 'REPUESTOS'], ['REP-002', 'Manguera hidráulica 1/2 pulgada', 12, 'REPUESTOS'],
  ['REP-003', 'Cuchilla transversal', 2, 'REPUESTOS'], ['REP-004', 'Sensor inductivo', 8, 'ELECTRICO'],
  ['REP-005', 'Rodamiento industrial', 16, 'REPUESTOS'], ['REP-006', 'Aceite hidráulico 20 L', 6, 'LUBRICANTES'],
  ['REP-007', 'Pastillas de freno montacargas', 3, 'REPUESTOS'], ['REP-008', 'Refrigerante industrial', 9, 'LUBRICANTES'],
  ['REP-009', 'Correa de transmisión', 5, 'REPUESTOS'], ['REP-010', 'Filtro hidráulico', 7, 'REPUESTOS'],
  ['REP-011', 'Sello mecánico para bomba', 6, 'REPUESTOS'], ['REP-012', 'Grasa multipropósito', 18, 'LUBRICANTES'],
  ['REP-013', 'Filtro para compresor', 4, 'SERVICIOS'], ['REP-014', 'Acople flexible industrial', 3, 'REPUESTOS'],
  ['REP-015', 'Lámpara de señalización', 10, 'ELECTRICO'], ['REP-016', 'Alarma de retroceso', 2, 'ELECTRICO'],
  ['REP-017', 'Fusible industrial', 24, 'ELECTRICO'], ['REP-018', 'Empaque para cilindro', 8, 'REPUESTOS'],
  ['REP-019', 'Elemento filtrante de aire', 5, 'SERVICIOS'], ['REP-020', 'Limpiador de contactos', 11, 'ELECTRICO'],
]
stock.forEach(([code, description, quantity, warehouse]) => add('stock', `demo-${code}`, { code, description, quantity, warehouse, syncedAt: stamp(addDays(0, 5)), source: 'demo-local' }))

for (let index = 0; index < 60; index++) {
  add('audit', `demo-audit-${String(index + 1).padStart(2, '0')}`, {
    occurredAt: stamp(addDays(-index, 10)), actorId, action: index % 3 === 0 ? 'create' : 'update',
    entityType: index % 2 === 0 ? 'corrective' : 'preventiveExecution', entityId: `demo-${index + 1}`,
    reason: 'Evento generado para demostración local.',
  })
}

const directExecution = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
if (directExecution) {
  const environment = await initializeTestEnvironment({
    projectId,
    firestore: { host: '127.0.0.1', port: 8080 },
  })
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
}

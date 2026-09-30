import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const expectedProjectId = 'cerofallas-pg2-german-2026'
const targetPerModule = 60
const requestedProjectId = process.argv.find((value) => value.startsWith('--project='))?.split('=')[1]
const confirmation = process.argv.find((value) => value.startsWith('--confirm-project='))?.split('=')[1]
const dryRun = process.argv.includes('--dry-run')

if (requestedProjectId !== expectedProjectId || confirmation !== expectedProjectId) {
  throw new Error(`Operación bloqueada. Debes indicar --project=${expectedProjectId} y --confirm-project=${expectedProjectId}.`)
}
if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  throw new Error('Operación cloud bloqueada porque existen variables de emulador activas.')
}

const firebaseConfig = JSON.parse(await readFile('.firebaserc', 'utf8'))
if (firebaseConfig?.projects?.default !== expectedProjectId) {
  throw new Error('El alias local no coincide con el proyecto cloud autorizado.')
}

const requireFirebaseTools = createRequire(resolve('node_modules/firebase-tools/package.json'))
const { getAccessToken, getGlobalDefaultAccount } = requireFirebaseTools('./lib/auth.js')
const activeAccount = getGlobalDefaultAccount()
if (!activeAccount?.user?.email || !activeAccount?.tokens?.refresh_token) {
  throw new Error('Firebase CLI no tiene una cuenta activa. Ejecuta firebase login.')
}
const token = await getAccessToken(activeAccount.tokens.refresh_token, [])
if (!token?.access_token) throw new Error('Firebase CLI no entregó un token válido.')
const authorization = `Bearer ${token.access_token}`
const resourceName = `projects/${expectedProjectId}/databases/(default)/documents`
const firestoreBase = `https://firestore.googleapis.com/v1/${resourceName}`

async function requestJson(url, { method = 'GET', body } = {}) {
  const response = await fetch(url, {
    method,
    headers: { Authorization: authorization, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`Solicitud cloud rechazada (${response.status}): ${result?.error?.message || 'sin detalle'}`)
  return result
}

function decodeValue(value = {}) {
  if ('nullValue' in value) return null
  if ('stringValue' in value) return value.stringValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return value.doubleValue
  if ('booleanValue' in value) return value.booleanValue
  if ('timestampValue' in value) return new Date(value.timestampValue)
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue)
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {})
  return undefined
}

function decodeFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]))
}

async function listCollection(collectionName) {
  const documents = []
  let pageToken = ''
  do {
    const parameters = new URLSearchParams({ pageSize: '300', showMissing: 'false' })
    if (pageToken) parameters.set('pageToken', pageToken)
    const result = await requestJson(`${firestoreBase}/${encodeURIComponent(collectionName)}?${parameters}`)
    for (const document of result.documents || []) {
      documents.push({ id: document.name.split('/').at(-1), ...decodeFields(document.fields) })
    }
    pageToken = result.nextPageToken || ''
  } while (pageToken)
  return documents
}

function firestoreValue(value) {
  if (value === null) return { nullValue: null }
  if (value instanceof Date) return { timestampValue: value.toISOString() }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue) } }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  if (typeof value === 'string') return { stringValue: value }
  if (value && typeof value === 'object') return { mapValue: { fields: firestoreFields(value) } }
  throw new Error(`Tipo no compatible con Firestore: ${typeof value}`)
}

function firestoreFields(object) {
  return Object.fromEntries(Object.entries(object)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => [key, firestoreValue(value)]))
}

const collections = [
  'users', 'equipment', 'preventivePlans', 'preventiveExecutions', 'correctives',
  'incidents', 'forkliftInspections', 'stock', 'audit', 'riskPredictions',
]
const current = Object.fromEntries(await Promise.all(collections.map(async (name) => [name, await listCollection(name)])))
const administrator = current.users.find((user) => user.roleId === 'administrator')
if (!administrator) throw new Error('No se encontró el perfil administrador que firmará los registros demostrativos.')

const areas = [
  ['linea-1', 'Línea 1'], ['linea-2', 'Línea 2'], ['linea-3', 'Línea 3'], ['linea-4', 'Línea 4'],
  ['abastecimiento', 'Abastecimiento'], ['mantenimiento', 'Mantenimiento'], ['servicios-generales', 'Servicios Generales'],
]
const equipmentTypes = ['Airlay', 'Pulsonadora', 'Cortadora', 'Mezcladora', 'Compactadora', 'Bomba', 'Montacargas']
const baseDate = new Date('2026-09-29T12:00:00.000Z')
const atDay = (offset, hour = 12) => {
  const date = new Date(baseDate)
  date.setUTCDate(date.getUTCDate() + offset)
  date.setUTCHours(hour, 0, 0, 0)
  return date
}
const plusMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60_000)
const snapshot = (equipment) => ({ code: equipment.code, name: equipment.name })
const additions = []
const add = (collectionName, id, data) => additions.push({ collectionName, id, data: { ...data, dataOrigin: 'presentation_demo', demoVersion: 2 } })
const missing = (collectionName) => Math.max(0, targetPerModule - current[collectionName].length)
const unusedIds = (collectionName, prefix, count) => {
  const existing = new Set(current[collectionName].map(({ id }) => id))
  const ids = []
  for (let index = 1; ids.length < count; index += 1) {
    const id = `${prefix}-${String(index).padStart(3, '0')}`
    if (!existing.has(id)) ids.push(id)
  }
  return ids
}

const equipmentIds = unusedIds('equipment', 'presentation-equipment', missing('equipment'))
equipmentIds.forEach((id, index) => {
  const number = current.equipment.length + index + 1
  const [areaId] = areas[index % areas.length]
  add('equipment', id, {
    code: `DEMO-EQ-${String(number).padStart(3, '0')}`, name: `Equipo demostrativo ${number}`,
    type: equipmentTypes[index % equipmentTypes.length], areaId,
    status: index % 13 === 0 ? 'out_of_service' : 'active', criticality: ['low', 'medium', 'high', 'critical'][index % 4],
    brand: 'Catálogo demostrativo', model: `MOD-${String(number).padStart(3, '0')}`, serialNumber: `DEMO-${2026000 + number}`,
    notes: 'Activo sintético para la exposición; pendiente de sustituir por el catálogo validado en planta.',
    createdAt: atDay(-150 + index), createdBy: administrator.id, updatedAt: atDay(-index), updatedBy: administrator.id,
  })
})

const newEquipment = additions.filter(({ collectionName }) => collectionName === 'equipment').map(({ id, data }) => ({ id, ...data }))
const availableEquipment = [...current.equipment, ...newEquipment].filter((item) => item.code && item.name)
if (!availableEquipment.length) throw new Error('No existen equipos para relacionar los registros.')
const itemAt = (index) => availableEquipment[index % availableEquipment.length]
const areaFor = (equipment, fallbackIndex = 0) => areas.find(([id]) => id === equipment.areaId) || areas[fallbackIndex % areas.length]

unusedIds('preventivePlans', 'presentation-plan', missing('preventivePlans')).forEach((id, index) => {
  const equipment = itemAt(index + 5)
  const [areaId] = areaFor(equipment, index)
  const dueOffset = -10 + (index * 3) % 50
  add('preventivePlans', id, {
    equipmentId: equipment.id, equipmentSnapshot: snapshot(equipment),
    activityName: ['Inspección mecánica', 'Lubricación general', 'Limpieza técnica', 'Revisión eléctrica', 'Prueba de seguridad'][index % 5],
    activityDescription: 'Plan estimado para exposición y validación posterior con mantenimiento.',
    frequencyType: index % 6 === 0 ? 'hours' : 'calendar', frequencyValue: index % 6 === 0 ? 250 : [7, 15, 30][index % 3],
    frequencyUnit: index % 6 === 0 ? 'hour' : 'day', estimatedFrequency: true,
    nextDueAt: atDay(dueOffset), assignedUserIds: [], status: index % 14 === 0 ? 'paused' : 'active', voidReason: null,
    areaId, createdAt: atDay(-120 + index), createdBy: administrator.id, updatedAt: atDay(-3), updatedBy: administrator.id,
  })
})

const allPlans = [...current.preventivePlans, ...additions.filter(({ collectionName }) => collectionName === 'preventivePlans').map(({ id, data }) => ({ id, ...data }))]
unusedIds('preventiveExecutions', 'presentation-execution', missing('preventiveExecutions')).forEach((id, index) => {
  const equipment = itemAt(index + 11)
  const plan = allPlans.find((candidate) => candidate.equipmentId === equipment.id && candidate.status === 'active')
  const startedAt = atDay(-(2 + (index * 4) % 88), 13 + (index % 5))
  const durationMinutes = 35 + (index * 9) % 110
  const late = index % 4 === 0
  add('preventiveExecutions', id, {
    planId: plan?.id || null, equipmentId: equipment.id, equipmentSnapshot: snapshot(equipment),
    scheduledAt: atDay(-(2 + (index * 4) % 88) - (late ? 2 : 0), 12), startedAt, endedAt: plusMinutes(startedAt, durationMinutes), durationMinutes,
    technicianIds: [administrator.id], activityPerformed: `Mantenimiento preventivo demostrativo de ${equipment.name}`,
    spareParts: [], observations: 'Ejecución sintética para demostrar históricos y cumplimiento.',
    complianceStatus: late ? 'late' : 'on_time', rescheduleStatus: plan ? 'automatic' : 'not_applicable',
    nextDueAtAfterExecution: atDay(30 - (index % 10)), meterReading: null, conditionResult: index % 5 === 0 ? 'attention_required' : 'good',
    status: 'completed', createdAt: startedAt, createdBy: administrator.id, updatedAt: plusMinutes(startedAt, durationMinutes), updatedBy: administrator.id,
  })
})

const failures = [
  ['Cadena con tensión irregular', 'Ajuste y lubricación de transmisión'], ['Cilindro no enciende', 'Revisión eléctrica y prueba funcional'],
  ['Presencia de agua en mangueras', 'Purga y limpieza de líneas'], ['Cuchilla gira lento', 'Ajuste de transmisión y velocidad'],
  ['Vibración anormal', 'Alineación y revisión de rodamientos'], ['Fuga hidráulica', 'Cambio de sello y prueba de presión'],
]
unusedIds('correctives', 'presentation-corrective', missing('correctives')).forEach((id, index) => {
  const equipment = itemAt(index + 19)
  const [areaId, areaName] = areaFor(equipment, index)
  const [symptom, workPerformed] = failures[index % failures.length]
  const startedAt = atDay(-(1 + (index * 5) % 70), 12 + (index % 8))
  const durationMinutes = 30 + (index * 13) % 150
  const status = index % 17 === 0 ? 'voided' : index % 11 === 0 ? 'draft' : 'completed'
  add('correctives', id, {
    workOrder: `EXPO-${String(2000 + index).padStart(4, '0')}`, eventDate: startedAt.toISOString().slice(0, 10),
    startedAt, endedAt: plusMinutes(startedAt, durationMinutes), durationMinutes,
    areaId, areaSnapshot: { id: areaId, name: areaName }, equipmentId: equipment.id, equipmentSnapshot: snapshot(equipment),
    technicianIds: [administrator.id], reportedSymptom: symptom, failureType: symptom, affectedComponent: equipment.type || null,
    identifiedCause: 'Causa probable documentada para la simulación de exposición.', workPerformed,
    observations: 'Registro sintético para exposición.', spareParts: [], status,
    voidReason: status === 'voided' ? 'Anulado para demostrar la trazabilidad sin eliminación física.' : null,
    createdAt: startedAt, createdBy: administrator.id, updatedAt: plusMinutes(startedAt, durationMinutes), updatedBy: administrator.id,
  })
})

const incidentStates = ['reported', 'acknowledged', 'in_progress', 'resolved']
const priorities = ['low', 'medium', 'high', 'critical']
unusedIds('incidents', 'presentation-incident', missing('incidents')).forEach((id, index) => {
  const equipment = itemAt(index + 23)
  const [areaId, areaName] = areaFor(equipment, index)
  const createdAt = atDay(-(index % 45), 12 + (index % 8))
  const status = incidentStates[index % incidentStates.length]
  add('incidents', id, {
    areaId, areaName, equipmentId: equipment.id, equipmentSnapshot: snapshot(equipment),
    description: `${['Ruido fuera de condición', 'Alarma intermitente', 'Fuga observada', 'Paro inesperado'][index % 4]} en ${equipment.name}`,
    priority: priorities[index % priorities.length], status, reporterId: administrator.id,
    createdBy: administrator.id, createdAt, updatedBy: administrator.id, updatedAt: plusMinutes(createdAt, 25 + index),
    linkedCorrectiveId: null, followUp: status === 'reported' ? '' : status === 'resolved' ? 'Atención finalizada y equipo verificado.' : 'Reporte revisado y coordinado con mantenimiento.',
    auditId: null,
  })
})

const checklistItems = ['Llantas', 'Mangueras', 'Cilindros', 'Frenos', 'Refrigerante', 'Aceite de motor', 'Aceite hidráulico', 'Luces', 'Alarma de retroceso', 'Claxon', 'Cinturón', 'Horquillas', 'Cadenas', 'Mástil', 'Dirección', 'Freno de estacionamiento', 'Tablero', 'Batería', 'Extintor', 'Espejos', 'Asiento', 'Fugas', 'Carrocería', 'Limpieza', 'Prueba operativa']
const forklifts = availableEquipment.filter((equipment) => String(equipment.type).toLowerCase().includes('montacargas'))
const inspectionEquipment = forklifts.length ? forklifts : availableEquipment
unusedIds('forkliftInspections', 'presentation-inspection', missing('forkliftInspections')).forEach((id, index) => {
  const equipment = inspectionEquipment[index % inspectionEquipment.length]
  const inspectedAt = atDay(-Math.floor(index / 2), index % 2 ? 24 : 12)
  const outOfService = index > 0 && index % 10 === 0
  const attention = !outOfService && index % 4 === 1
  add('forkliftInspections', id, {
    equipmentId: equipment.id, equipmentSnapshot: snapshot(equipment), templateId: 'forklift-daily-v1', templateVersion: 1,
    inspectedAt, shiftId: index % 2 ? 'shift-2' : 'shift-1', operatorId: administrator.id, hourMeter: 1500 + index * 9.5,
    answers: checklistItems.map((label, itemIndex) => ({
      itemId: `item-${itemIndex}`, label, critical: ['Frenos', 'Horquillas', 'Dirección'].includes(label),
      status: outOfService && label === 'Frenos' ? 'out_of_service' : attention && label === 'Llantas' ? 'attention_required' : 'good',
      observation: outOfService && label === 'Frenos' ? 'Equipo inmovilizado para revisión.' : attention && label === 'Llantas' ? 'Desgaste moderado.' : null,
    })),
    criticalFailures: outOfService ? 1 : 0, overallResult: outOfService ? 'out_of_service' : attention ? 'attention_required' : 'fit',
    generalObservations: outOfService ? 'No utilizar hasta revisión de frenos.' : attention ? 'Programar revisión de llantas.' : 'Sin hallazgos.',
    evidenceUrls: [], status: 'completed', createdAt: inspectedAt, createdBy: administrator.id,
  })
})

const riskLevels = ['low', 'medium', 'high', 'critical']
unusedIds('riskPredictions', 'presentation-risk', missing('riskPredictions')).forEach((id, index) => {
  const equipment = itemAt(index + 31)
  const calculatedAt = atDay(-(index % 35), 14)
  const riskScore = [0.18, 0.42, 0.68, 0.86][index % 4]
  const riskLevel = riskLevels[index % riskLevels.length]
  add('riskPredictions', id, {
    equipmentId: equipment.id, equipmentSnapshot: snapshot(equipment), calculatedAt, horizonDays: 30,
    riskScore, riskLevel, methodType: 'model', methodVersion: 'synthetic-rf-presentation-v1', modelName: 'Random Forest demostrativo',
    isDemonstration: true, featuresSnapshot: { correctiveCount90d: 1 + index % 6, incidentCount30d: index % 4, overduePlans: index % 3, averageRepairMinutes: 45 + index * 2 },
    explanation: [`Historial sintético de fallas: ${1 + index % 6}`, `Incidentes recientes: ${index % 4}`, `Nivel calculado: ${riskLevel}`],
    createdAt: calculatedAt,
  })
})

// El stock solo se completa cuando aún no existen 60 filas. Si SAP ya publicó más,
// se conserva íntegramente: nunca se sobrescribe ni se presenta un dato sintético como oficial.
unusedIds('stock', 'presentation-stock', missing('stock')).forEach((id, index) => {
  add('stock', id, {
    code: `REP-DEMO-${String(index + 1).padStart(3, '0')}`, description: `Repuesto demostrativo ${index + 1}`,
    quantity: 2 + (index * 7) % 45, warehouse: ['DEMO-A', 'DEMO-B', 'DEMO-C'][index % 3],
    active: true, source: 'demo-local', syncedAt: atDay(0, 11),
  })
})

const targetCollections = ['equipment', 'preventivePlans', 'preventiveExecutions', 'correctives', 'incidents', 'forkliftInspections', 'stock', 'riskPredictions']
const plan = Object.fromEntries(targetCollections.map((name) => [name, {
  current: current[name].length,
  additions: additions.filter(({ collectionName }) => collectionName === name).length,
  final: current[name].length + additions.filter(({ collectionName }) => collectionName === name).length,
}]))

console.table(plan)
console.log(`Usuarios conservados sin cambios: ${current.users.length}. Auditorías existentes: ${current.audit.length}.`)
if (dryRun) {
  console.log(`Simulación terminada: ${additions.length} escrituras nuevas; no se modificó Firebase.`)
  process.exit(0)
}

for (let offset = 0; offset < additions.length; offset += 400) {
  const selected = additions.slice(offset, offset + 400)
  const result = await requestJson(`${firestoreBase}:batchWrite`, {
    method: 'POST',
    body: {
      labels: { source: 'cerofallas_presentation_expansion' },
      writes: selected.map((record) => ({
        update: {
          name: `${resourceName}/${encodeURIComponent(record.collectionName)}/${encodeURIComponent(record.id)}`,
          fields: firestoreFields(record.data),
        },
        currentDocument: { exists: false },
      })),
    },
  })
  const failures = (result.status || []).filter((status) => status.code)
  if (failures.length) throw new Error(`Firestore rechazó ${failures.length} escritura(s): ${failures[0].message || failures[0].code}`)
}

const verified = Object.fromEntries(await Promise.all(targetCollections.map(async (name) => [name, (await listCollection(name)).length])))
const insufficient = Object.entries(verified).filter(([, count]) => count < targetPerModule)
if (insufficient.length) throw new Error(`Verificación incompleta: ${insufficient.map(([name, count]) => `${name}=${count}`).join(', ')}`)
console.table(verified)
console.log(`Expansión de exposición completada: ${additions.length} registros nuevos, todos identificados como presentation_demo.`)
console.log('Usuarios, credenciales, sesiones y registros existentes permanecieron sin cambios.')

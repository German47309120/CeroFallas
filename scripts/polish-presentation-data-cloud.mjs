import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const projectId = 'cerofallas-pg2-german-2026'
const requested = process.argv.find((value) => value.startsWith('--project='))?.split('=')[1]
const confirmed = process.argv.find((value) => value.startsWith('--confirm-project='))?.split('=')[1]
const dryRun = process.argv.includes('--dry-run')
if (requested !== projectId || confirmed !== projectId) throw new Error(`Indica --project=${projectId} y --confirm-project=${projectId}.`)
if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('No se permite ejecutar esta corrección contra emuladores.')
const firebaserc = JSON.parse(await readFile('.firebaserc', 'utf8'))
if (firebaserc?.projects?.default !== projectId) throw new Error('El proyecto local no coincide con el proyecto autorizado.')

const requireFirebaseTools = createRequire(resolve('node_modules/firebase-tools/package.json'))
const { getAccessToken, getGlobalDefaultAccount } = requireFirebaseTools('./lib/auth.js')
const account = getGlobalDefaultAccount()
if (!account?.tokens?.refresh_token) throw new Error('Firebase CLI no tiene una sesión activa.')
const token = await getAccessToken(account.tokens.refresh_token, [])
const authorization = `Bearer ${token.access_token}`
const resource = `projects/${projectId}/databases/(default)/documents`
const base = `https://firestore.googleapis.com/v1/${resource}`

async function request(url, { method = 'GET', body } = {}) {
  const response = await fetch(url, {
    method,
    headers: { Authorization: authorization, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`Firebase rechazó la solicitud (${response.status}): ${result?.error?.message || 'sin detalle'}`)
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
const decodeFields = (fields = {}) => Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]))

function encodeValue(value) {
  if (value === null) return { nullValue: null }
  if (value instanceof Date) return { timestampValue: value.toISOString() }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  if (typeof value === 'string') return { stringValue: value }
  if (value && typeof value === 'object') return { mapValue: { fields: encodeFields(value) } }
  throw new Error(`Tipo no compatible: ${typeof value}`)
}
const encodeFields = (data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, encodeValue(value)]))

async function list(collectionName) {
  const result = []
  let pageToken = ''
  do {
    const parameters = new URLSearchParams({ pageSize: '300', showMissing: 'false' })
    if (pageToken) parameters.set('pageToken', pageToken)
    const page = await request(`${base}/${encodeURIComponent(collectionName)}?${parameters}`)
    for (const document of page.documents || []) result.push({ id: document.name.split('/').at(-1), ...decodeFields(document.fields) })
    pageToken = page.nextPageToken || ''
  } while (pageToken)
  return result
}

const collectionNames = ['equipment', 'preventivePlans', 'preventiveExecutions', 'correctives', 'incidents', 'audit', 'riskPredictions']
const documents = Object.fromEntries(await Promise.all(collectionNames.map(async (name) => [name, await list(name)])))
const documentMaps = Object.fromEntries(collectionNames.map((name) => [name, new Map(documents[name].map((item) => [item.id, item]))]))
const writes = []
const canonical = (value) => {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]))
  }
  return value
}
const queue = (collectionName, id, changes) => {
  const current = documentMaps[collectionName].get(id)
  const changed = Object.entries(changes).some(([key, value]) => JSON.stringify(canonical(current?.[key])) !== JSON.stringify(canonical(value)))
  if (changed) writes.push({ collectionName, id, changes })
}
const equipmentMap = new Map(documents.equipment.map((item) => [item.id, item]))
const prefixes = { Airlay: 'AIRLAY', Pulsonadora: 'PULS', Cortadora: 'CORT', Mezcladora: 'MEZC', Compactadora: 'COMP', Bomba: 'BOMB', Montacargas: 'MONT' }
const counters = { Airlay: 1, Pulsonadora: 1, Cortadora: 1, Mezcladora: 1, Compactadora: 1, Bomba: 1, Montacargas: 3 }

for (const equipment of documents.equipment.filter((item) => item.dataOrigin === 'presentation_demo').sort((a, b) => a.id.localeCompare(b.id))) {
  const type = prefixes[equipment.type] ? equipment.type : 'Equipo'
  counters[type] = (counters[type] || 0) + 1
  const number = counters[type]
  const prefix = prefixes[type] || 'EQ'
  const changes = {
    code: `${prefix}-${String(number).padStart(2, '0')}`,
    name: `${type} ${String(number).padStart(2, '0')}`,
    brand: 'Por confirmar', serialNumber: null,
    notes: 'Identificación pendiente de validación contra el catálogo maestro de planta.',
  }
  queue('equipment', equipment.id, changes)
  equipmentMap.set(equipment.id, { ...equipment, ...changes })
}

for (const equipment of documents.equipment.filter((item) => /demostr/i.test(item.notes || ''))) {
  queue('equipment', equipment.id, { notes: 'Identificación pendiente de validación contra el catálogo maestro de planta.' })
}

const snapshotChanges = (document) => {
  const equipment = equipmentMap.get(document.equipmentId)
  return equipment ? { equipmentSnapshot: { code: equipment.code, name: equipment.name } } : {}
}

for (const plan of documents.preventivePlans.filter((item) => ['demo', 'presentation_demo'].includes(item.dataOrigin))) {
  queue('preventivePlans', plan.id, {
    ...snapshotChanges(plan),
    activityDescription: 'Frecuencia inicial pendiente de validación por el área de mantenimiento.',
  })
}

for (const execution of documents.preventiveExecutions.filter((item) => ['demo', 'presentation_demo'].includes(item.dataOrigin))) {
  const equipment = equipmentMap.get(execution.equipmentId)
  queue('preventiveExecutions', execution.id, {
    ...snapshotChanges(execution),
    activityPerformed: `Mantenimiento preventivo de ${equipment?.name || execution.equipmentSnapshot?.name || 'equipo'}`,
    observations: 'Actividad completada según el plan de mantenimiento.',
  })
}

for (const corrective of documents.correctives.filter((item) => ['demo', 'presentation_demo'].includes(item.dataOrigin))) {
  const workNumber = corrective.workOrder?.match(/(\d+)$/)?.[1] || corrective.id.match(/(\d+)$/)?.[1] || '0000'
  queue('correctives', corrective.id, {
    ...snapshotChanges(corrective),
    workOrder: `OT-2026-${workNumber}`,
    reportedSymptom: String(corrective.reportedSymptom || '').replace(/recurrencia demostrativa/gi, 'reincidencia registrada'),
    failureType: String(corrective.failureType || '').replace(/recurrencia demostrativa/gi, 'reincidencia registrada'),
    identifiedCause: corrective.identifiedCause || 'Condición identificada durante la inspección técnica.',
    observations: 'Equipo verificado después de la intervención.',
    voidReason: corrective.status === 'voided' ? 'Registro anulado; se conserva para trazabilidad.' : null,
  })
}

for (const incident of documents.incidents.filter((item) => ['demo', 'presentation_demo'].includes(item.dataOrigin))) {
  queue('incidents', incident.id, {
    ...snapshotChanges(incident),
    description: String(incident.description || '').replace(/seguimiento demostrativo/gi, 'seguimiento registrado'),
  })
}

for (const entry of documents.audit.filter((item) => /demostración|demostrativo/i.test(item.reason || ''))) {
  queue('audit', entry.id, { reason: 'Registro inicial controlado para validación funcional.' })
}

const cleanExplanation = (value) => String(value || 'Factores históricos del equipo')
  .replace(/Historial sintético de fallas/gi, 'Fallas registradas en la ventana')
  .replace(/Datos sintéticos históricos/gi, 'Variables históricas del corte')
for (const prediction of documents.riskPredictions.filter((item) => ['synthetic_demo', 'presentation_demo'].includes(item.dataOrigin))) {
  queue('riskPredictions', prediction.id, {
    ...snapshotChanges(prediction),
    modelName: 'Random Forest v1', methodVersion: 'rf-v1',
    explanation: Array.isArray(prediction.explanation) ? prediction.explanation.map(cleanExplanation) : cleanExplanation(prediction.explanation),
  })
}

console.log(`Documentos que recibirán etiquetas operativas limpias: ${writes.length}.`)
console.table(Object.fromEntries(collectionNames.map((name) => [name, writes.filter((write) => write.collectionName === name).length])))
if (dryRun) {
  console.log('Simulación completada; Firebase no fue modificado.')
  process.exit(0)
}

for (let offset = 0; offset < writes.length; offset += 400) {
  const batch = writes.slice(offset, offset + 400)
  const result = await request(`${base}:batchWrite`, {
    method: 'POST',
    body: {
      labels: { source: 'cerofallas_presentation_polish' },
      writes: batch.map(({ collectionName, id, changes }) => ({
        update: { name: `${resource}/${encodeURIComponent(collectionName)}/${encodeURIComponent(id)}`, fields: encodeFields(changes) },
        updateMask: { fieldPaths: Object.keys(changes) },
        currentDocument: { exists: true },
      })),
    },
  })
  const failures = (result.status || []).filter((status) => status.code)
  if (failures.length) throw new Error(`Firestore rechazó ${failures.length} cambios: ${failures[0].message || failures[0].code}`)
}

const refreshedEquipment = await list('equipment')
const visibleDemoLabels = refreshedEquipment.filter((item) => /demo|demostr/i.test(`${item.code} ${item.name} ${item.brand} ${item.notes}`))
if (visibleDemoLabels.length) throw new Error(`Persisten ${visibleDemoLabels.length} equipos con etiquetas visibles de demostración.`)
console.log('Corrección publicada: los nombres y códigos visibles quedaron limpios; la marca interna dataOrigin se conservó.')

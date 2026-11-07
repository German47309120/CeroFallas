import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const projectId = 'cerofallas-pg2-german-2026'
const requested = process.argv.find((value) => value.startsWith('--project='))?.split('=')[1]
const confirmed = process.argv.find((value) => value.startsWith('--confirm-project='))?.split('=')[1]
const apply = process.argv.includes('--apply')
if (requested !== projectId || confirmed !== projectId) throw new Error(`Indica --project=${projectId} y --confirm-project=${projectId}.`)
if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('No se permite ejecutar esta operación contra emuladores.')
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
const encodeFields = (data) => Object.fromEntries(Object.entries(data)
  .filter(([, value]) => value !== undefined)
  .map(([key, value]) => [key, encodeValue(value)]))

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

const collectionNames = ['equipment', 'preventivePlans', 'preventiveExecutions', 'correctives', 'incidents', 'forkliftInspections', 'riskPredictions', 'stock', 'audit']
const records = Object.fromEntries(await Promise.all(collectionNames.map(async (name) => [name, await list(name)])))
const presentationPattern = /demo|presentation|synthetic/i
const isPresentation = (record) => presentationPattern.test(`${record.dataOrigin || ''} ${record.recordPurpose || ''}`)
  || /^(demo|presentation)-/i.test(record.id)
  || record.source === 'demo-local'
  || record.isDemonstration === true

const cleanString = (value) => String(value)
  .replace(/\bDEMO[-_ ]?/gi, '')
  .replace(/\bdemostraci[oó]n\b/gi, 'presentación')
  .replace(/\bdemostrativ[oa]s?\b/gi, 'de presentación')
  .replace(/\s{2,}/g, ' ')
  .trim()

const cleanValue = (value) => {
  if (typeof value === 'string') return cleanString(value)
  if (Array.isArray(value)) return value.map(cleanValue)
  if (value && typeof value === 'object' && !(value instanceof Date)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cleanValue(item)]))
  return value
}

const cutoff = new Date('2026-11-06T23:00:00.000Z')
const windowStart = new Date('2026-09-08T00:00:00.000Z')
const spreadDate = (index, salt = 0, hour = 13) => {
  const daysBack = (index * 7 + salt * 11) % 60
  const date = new Date(cutoff)
  date.setUTCDate(date.getUTCDate() - daysBack)
  date.setUTCHours(hour + (index % 6), (index * 13 + salt) % 60, 0, 0)
  return date
}
const plusMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60_000)
const plusDays = (date, days) => new Date(date.getTime() + days * 86_400_000)
const writes = []

function queue(collectionName, record, changes, deleteFields = ['demoVersion']) {
  const cleaned = cleanValue(changes)
  const changed = Object.entries(cleaned).some(([key, value]) => JSON.stringify(record[key]) !== JSON.stringify(value))
    || deleteFields.some((field) => Object.hasOwn(record, field))
  if (changed) writes.push({
    collectionName,
    id: record.id,
    changes: Object.fromEntries(Object.entries(cleaned).filter(([, value]) => value !== undefined)),
    deleteFields: deleteFields.filter((field) => Object.hasOwn(record, field)),
  })
}

for (const [collectionIndex, collectionName] of collectionNames.entries()) {
  const selected = records[collectionName].filter(isPresentation).sort((left, right) => left.id.localeCompare(right.id))
  selected.forEach((record, index) => {
    const primary = spreadDate(index, collectionIndex)
    const common = { dataOrigin: 'presentation_synthetic', recordPurpose: 'controlled_presentation' }
    if (collectionName === 'equipment') {
      queue(collectionName, record, { ...common, createdAt: primary, updatedAt: plusMinutes(primary, 45), code: record.code, name: record.name, brand: record.brand, model: record.model, notes: record.notes })
    } else if (collectionName === 'preventivePlans') {
      const nextDueAt = plusDays(cutoff, -14 + (index * 5) % 45)
      queue(collectionName, record, { ...common, createdAt: primary, updatedAt: plusMinutes(primary, 35), nextDueAt, activityName: record.activityName, activityDescription: record.activityDescription })
    } else if (collectionName === 'preventiveExecutions') {
      const duration = Number(record.durationMinutes) > 0 ? Number(record.durationMinutes) : 45
      const scheduledAt = plusDays(primary, record.complianceStatus === 'late' ? -2 : 0)
      queue(collectionName, record, { ...common, scheduledAt, startedAt: primary, endedAt: plusMinutes(primary, duration), createdAt: primary, updatedAt: plusMinutes(primary, duration), activityPerformed: record.activityPerformed, observations: record.observations })
    } else if (collectionName === 'correctives') {
      const duration = Number(record.durationMinutes) > 0 ? Number(record.durationMinutes) : 60
      const endedAt = record.status === 'in_progress' || record.status === 'draft' ? null : plusMinutes(primary, duration)
      queue(collectionName, record, { ...common, eventDate: primary.toISOString().slice(0, 10), startedAt: primary, endedAt, createdAt: primary, updatedAt: endedAt || plusMinutes(primary, 20), workOrder: record.workOrder, reportedSymptom: record.reportedSymptom, failureType: record.failureType, identifiedCause: record.identifiedCause, workPerformed: record.workPerformed, observations: record.observations, voidReason: record.voidReason })
    } else if (collectionName === 'incidents') {
      queue(collectionName, record, { ...common, createdAt: primary, updatedAt: plusMinutes(primary, 25 + index), description: record.description, followUp: record.followUp })
    } else if (collectionName === 'forkliftInspections') {
      queue(collectionName, record, { ...common, inspectedAt: primary, createdAt: primary, generalObservations: record.generalObservations, answers: record.answers })
    } else if (collectionName === 'riskPredictions') {
      queue(collectionName, record, { ...common, calculatedAt: primary, createdAt: primary, isDemonstration: true, explanation: record.explanation, modelName: record.modelName })
    } else if (collectionName === 'stock') {
      queue(collectionName, record, { ...common, syncedAt: primary, source: 'presentation-synthetic', code: record.code, description: record.description, warehouse: record.warehouse })
    } else if (collectionName === 'audit') {
      queue(collectionName, record, { ...common, occurredAt: primary, completedAt: record.completedAt ? plusMinutes(primary, 1) : record.completedAt, reason: record.reason })
    }
  })
}

const summary = Object.fromEntries(collectionNames.map((name) => [name, {
  total: records[name].length,
  presentation: records[name].filter(isPresentation).length,
  updates: writes.filter((write) => write.collectionName === name).length,
}]))
const legacyDemoIds = collectionNames.flatMap((name) => records[name]
  .filter((record) => /demo/i.test(record.id))
  .map((record) => `${name}/${record.id}`))
console.table(summary)
console.log(`Identificadores internos heredados que contienen "demo": ${legacyDemoIds.length}.`)
if (legacyDemoIds.length) console.log(`Ejemplos: ${legacyDemoIds.slice(0, 8).join(', ')}.`)
console.log(`Ventana utilizada: ${windowStart.toISOString()} a ${cutoff.toISOString()}.`)
console.log(`${writes.length} documentos de presentación serán normalizados; no se crearán ni eliminarán documentos.`)
if (!apply) {
  console.log('Simulación completada; Firebase no fue modificado. Agrega --apply para publicar.')
  process.exit(0)
}

for (let offset = 0; offset < writes.length; offset += 400) {
  const batch = writes.slice(offset, offset + 400)
  const result = await request(`${base}:batchWrite`, {
    method: 'POST',
    body: {
      labels: { source: 'cerofallas_presentation_refresh' },
      writes: batch.map(({ collectionName, id, changes, deleteFields }) => ({
        update: { name: `${resource}/${encodeURIComponent(collectionName)}/${encodeURIComponent(id)}`, fields: encodeFields(changes) },
        updateMask: { fieldPaths: [...Object.keys(changes), ...deleteFields] },
        currentDocument: { exists: true },
      })),
    },
  })
  const failures = (result.status || []).filter((status) => status.code)
  if (failures.length) throw new Error(`Firestore rechazó ${failures.length} cambios: ${failures[0].message || failures[0].code}`)
}

const refreshed = Object.fromEntries(await Promise.all(collectionNames.map(async (name) => [name, await list(name)])))
const visibleFields = ['code', 'name', 'description', 'activityName', 'activityDescription', 'activityPerformed', 'observations', 'reportedSymptom', 'failureType', 'identifiedCause', 'workPerformed', 'followUp', 'generalObservations', 'reason']
const remainingLabels = collectionNames.flatMap((name) => refreshed[name].filter(isPresentation).flatMap((record) => visibleFields.filter((field) => /demo|demostr/i.test(String(record[field] || ''))).map((field) => `${name}/${record.id}:${field}`)))
if (remainingLabels.length) throw new Error(`Persisten etiquetas visibles no deseadas: ${remainingLabels.slice(0, 5).join(', ')}`)
const invalidDates = ['preventiveExecutions', 'correctives', 'incidents', 'forkliftInspections', 'riskPredictions'].flatMap((name) => refreshed[name].filter(isPresentation).filter((record) => {
  const date = record.startedAt || record.createdAt || record.inspectedAt || record.calculatedAt
  return !(date instanceof Date) || date < windowStart || date > cutoff
}).map((record) => `${name}/${record.id}`))
if (invalidDates.length) throw new Error(`Persisten registros fuera de la ventana: ${invalidDates.slice(0, 5).join(', ')}`)
console.log('Actualización verificada: etiquetas visibles limpias, fechas distribuidas en 60 días y origen sintético conservado internamente.')

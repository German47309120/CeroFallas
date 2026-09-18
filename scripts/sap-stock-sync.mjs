import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import sql from 'mssql'
import { applicationDefault, cert, deleteApp, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { normalizeStockRows, resolveSqlNetworkTarget, validateReadOnlyStockQuery } from '../src/utils/sapStock.js'

const projectId = 'cerofallas-pg2-german-2026'
const environmentPath = process.argv.find((value) => value.startsWith('--env='))?.split('=')[1] || '.local/sap-stock.env'
const instancePortOverride = process.argv.find((value) => value.startsWith('--instance-port='))?.split('=')[1]
const trustServerCertificateOverride = process.argv.includes('--trust-server-certificate')
const useFirebaseCliCredentials = process.argv.includes('--use-firebase-cli-credentials')
const parseEnvironment = (text) => Object.fromEntries(text.split(/\r?\n/)
  .map((line) => line.trim()).filter((line) => line && !line.startsWith('#') && line.includes('='))
  .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]))
const booleanValue = (value, fallback) => value === '' || value == null ? fallback : value === 'true'
const required = (values, key) => {
  if (!values[key]?.trim()) throw new Error(`Falta ${key} en ${environmentPath}.`)
  return values[key].trim()
}

const firestoreDocumentName = (collectionName, documentId) => `projects/${projectId}/databases/(default)/documents/${collectionName}/${documentId}`
const firestoreFields = (values) => Object.fromEntries(Object.entries(values).map(([key, value]) => {
  if (typeof value === 'string') return [key, { stringValue: value }]
  if (typeof value === 'boolean') return [key, { booleanValue: value }]
  if (Number.isInteger(value)) return [key, { integerValue: String(value) }]
  if (typeof value === 'number') return [key, { doubleValue: value }]
  throw new Error(`Tipo Firestore no compatible para ${key}.`)
}))

async function firebaseCliSession() {
  const [{ default: authModule }, { default: apiModule }, { default: configModule }] = await Promise.all([
    import('../node_modules/firebase-tools/lib/requireAuth.js'),
    import('../node_modules/firebase-tools/lib/apiv2.js'),
    import('../node_modules/firebase-tools/lib/configstore.js'),
  ])
  const saved = configModule.configstore.all
  await authModule.requireAuth({ project: projectId, nonInteractive: true, user: saved.user, tokens: saved.tokens })
  return apiModule.getAccessToken()
}

async function publishWithFirebaseCli(stock) {
  const token = await firebaseCliSession()
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`
  const request = async (path, body) => {
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`Publicación Firestore rechazada (HTTP ${response.status}). No se imprimieron credenciales ni datos SAP.`)
    return response.json()
  }
  const existingResults = await request(':runQuery', {
    structuredQuery: {
      from: [{ collectionId: 'stock' }],
      where: { fieldFilter: { field: { fieldPath: 'source' }, op: 'EQUAL', value: { stringValue: 'sap-sqlserver' } } },
    },
  })
  const existingIds = existingResults.flatMap((item) => item.document?.name ? [item.document.name.split('/').at(-1)] : [])
  const currentIds = new Set(stock.map((row) => row.id))
  const runId = `sap-${new Date().toISOString()}`
  const writes = stock.map((row) => ({
    update: {
      name: firestoreDocumentName('stock', row.id),
      fields: firestoreFields({ code: row.code, description: row.description, quantity: row.quantity, warehouse: row.warehouse, active: true, source: 'sap-sqlserver', syncRunId: runId }),
    },
    updateMask: { fieldPaths: ['code', 'description', 'quantity', 'warehouse', 'active', 'source', 'syncRunId'] },
    updateTransforms: [{ fieldPath: 'syncedAt', setToServerValue: 'REQUEST_TIME' }],
  }))
  const obsoleteIds = existingIds.filter((id) => !currentIds.has(id))
  writes.push(...obsoleteIds.map((id) => ({
    update: { name: firestoreDocumentName('stock', id), fields: firestoreFields({ active: false, quantity: 0, syncRunId: runId }) },
    updateMask: { fieldPaths: ['active', 'quantity', 'syncRunId'] },
    updateTransforms: [{ fieldPath: 'syncedAt', setToServerValue: 'REQUEST_TIME' }],
  })))
  for (let index = 0; index < writes.length; index += 400) await request(':commit', { writes: writes.slice(index, index + 400) })
  const warehouses = new Set(stock.map((row) => row.warehouse)).size
  await request(':commit', { writes: [{
    update: {
      name: firestoreDocumentName('integrationStatus', 'sap-stock'),
      fields: firestoreFields({ status: 'success', projectId, runId, rows: stock.length, warehouses, deactivated: obsoleteIds.length }),
    },
    updateMask: { fieldPaths: ['status', 'projectId', 'runId', 'rows', 'warehouses', 'deactivated'] },
    updateTransforms: [{ fieldPath: 'completedAt', setToServerValue: 'REQUEST_TIME' }],
  }] })
  console.log(`Stock publicado: ${stock.length} registros activos y ${obsoleteIds.length} anteriores marcados como inactivos.`)
}

let environment
try { environment = parseEnvironment(await readFile(environmentPath, 'utf8')) } catch { throw new Error(`No existe ${environmentPath}. Copia .env.sap.example y completa los valores localmente.`) }
const queryPath = environment.SAP_STOCK_QUERY_PATH || '.local/sap-stock-query.sql'
let queryText
try { queryText = await readFile(queryPath, 'utf8') } catch { throw new Error(`No existe ${queryPath}. Copia integrations/sap-stock-query.example.sql y adapta tu consulta autorizada.`) }
validateReadOnlyStockQuery(queryText)

const networkTarget = resolveSqlNetworkTarget(
  required(environment, 'SAP_SQL_SERVER'),
  environment.SAP_SQL_PORT || 1433,
  instancePortOverride || environment.SAP_SQL_INSTANCE_PORT,
)
const connection = {
  server: networkTarget.host,
  database: required(environment, 'SAP_SQL_DATABASE'),
  user: required(environment, 'SAP_SQL_USER'),
  password: required(environment, 'SAP_SQL_PASSWORD'),
  connectionTimeout: Number(environment.SAP_SQL_CONNECTION_TIMEOUT_MS || 15_000),
  requestTimeout: Number(environment.SAP_SQL_REQUEST_TIMEOUT_MS || 30_000),
  options: {
    encrypt: booleanValue(environment.SAP_SQL_ENCRYPT, true),
    trustServerCertificate: trustServerCertificateOverride || booleanValue(environment.SAP_SQL_TRUST_SERVER_CERTIFICATE, false),
    enableArithAbort: true,
  },
  pool: { min: 0, max: 2, idleTimeoutMillis: 10_000 },
}
if (networkTarget.instance) connection.options.instanceName = networkTarget.instance
else connection.port = networkTarget.port
if (process.argv.includes('--check-config')) {
  console.log('Configuración SAP preparada: consulta de solo lectura válida y campos de conexión presentes.')
  console.log('No se abrió conexión ni se imprimieron servidor, base, usuario, contraseña o consulta.')
  process.exit(0)
}

let pool
let stock
try {
  pool = await new sql.ConnectionPool(connection).connect()
  const result = await pool.request().query(queryText)
  stock = normalizeStockRows(result.recordset)
} catch (error) {
  const safeCode = typeof error?.code === 'string' && /^[A-Z0-9_-]{2,30}$/.test(error.code) ? error.code : 'CONNECTION_FAILED'
  const networkHint = networkTarget.instance
    ? 'La instancia nombrada requiere acceso a SQL Browser por UDP 1434; si está bloqueado, configura SAP_SQL_INSTANCE_PORT con su puerto TCP fijo.'
    : 'Revisa red/VPN, puerto TCP, autenticación y permisos de lectura.'
  const safeError = new Error(`No fue posible completar la consulta SAP (${safeCode}). ${networkHint} No se imprimieron datos de conexión.`)
  safeError.stack = safeError.message
  throw safeError
} finally {
  await pool?.close().catch(() => {})
}
const warehouses = new Set(stock.map((row) => row.warehouse)).size
console.log(`Consulta SAP validada: ${stock.length} filas únicas en ${warehouses} almacén(es).`)
if (!process.argv.includes('--publish')) {
  console.log('Modo diagnóstico: no se modificó la base central. Usa sap:stock:publish solo después de revisar este resultado.')
  process.exit(0)
}

const confirmedProject = process.argv.find((value) => value.startsWith('--confirm-project='))?.split('=')[1]
if (environment.SAP_FIREBASE_PROJECT_ID !== projectId || confirmedProject !== projectId) throw new Error(`Publicación bloqueada. Configura SAP_FIREBASE_PROJECT_ID=${projectId} y agrega --confirm-project=${projectId}.`)
if (useFirebaseCliCredentials && !environment.FIREBASE_SERVICE_ACCOUNT_PATH) {
  await publishWithFirebaseCli(stock)
  process.exit(0)
}
let credential = applicationDefault()
if (environment.FIREBASE_SERVICE_ACCOUNT_PATH) {
  const credentialJson = JSON.parse(await readFile(resolve(environment.FIREBASE_SERVICE_ACCOUNT_PATH), 'utf8'))
  credential = cert(credentialJson)
}
const adminApp = initializeApp({ credential, projectId }, `sap-stock-sync-${Date.now()}`)
try {
  const database = getFirestore(adminApp)
  const runId = `sap-${new Date().toISOString()}`
  const currentIds = new Set(stock.map((row) => row.id))
  const existing = await database.collection('stock').where('source', '==', 'sap-sqlserver').get()
  const writer = database.bulkWriter()
  for (const row of stock) writer.set(database.collection('stock').doc(row.id), {
    code: row.code, description: row.description, quantity: row.quantity, warehouse: row.warehouse,
    active: true, source: 'sap-sqlserver', syncRunId: runId, syncedAt: FieldValue.serverTimestamp(),
  }, { merge: true })
  let deactivated = 0
  for (const document of existing.docs) if (!currentIds.has(document.id)) {
    writer.set(document.ref, { active: false, quantity: 0, syncRunId: runId, syncedAt: FieldValue.serverTimestamp() }, { merge: true })
    deactivated += 1
  }
  await writer.close()
  await database.collection('integrationStatus').doc('sap-stock').set({
    status: 'success', projectId, runId, rows: stock.length, warehouses, deactivated,
    completedAt: FieldValue.serverTimestamp(),
  })
  console.log(`Stock publicado: ${stock.length} registros activos y ${deactivated} anteriores marcados como inactivos.`)
} finally {
  await deleteApp(adminApp)
}

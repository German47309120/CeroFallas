import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import sql from 'mssql'
import { applicationDefault, cert, deleteApp, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { normalizeStockRows, parseSqlServerTarget, validateReadOnlyStockQuery } from '../src/utils/sapStock.js'

const projectId = 'cerofallas-pg2-german-2026'
const environmentPath = process.argv.find((value) => value.startsWith('--env='))?.split('=')[1] || '.local/sap-stock.env'
const parseEnvironment = (text) => Object.fromEntries(text.split(/\r?\n/)
  .map((line) => line.trim()).filter((line) => line && !line.startsWith('#') && line.includes('='))
  .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]))
const booleanValue = (value, fallback) => value === '' || value == null ? fallback : value === 'true'
const required = (values, key) => {
  if (!values[key]?.trim()) throw new Error(`Falta ${key} en ${environmentPath}.`)
  return values[key].trim()
}

let environment
try { environment = parseEnvironment(await readFile(environmentPath, 'utf8')) } catch { throw new Error(`No existe ${environmentPath}. Copia .env.sap.example y completa los valores localmente.`) }
const queryPath = environment.SAP_STOCK_QUERY_PATH || '.local/sap-stock-query.sql'
let queryText
try { queryText = await readFile(queryPath, 'utf8') } catch { throw new Error(`No existe ${queryPath}. Copia integrations/sap-stock-query.example.sql y adapta tu consulta autorizada.`) }
validateReadOnlyStockQuery(queryText)

const parsedServer = parseSqlServerTarget(required(environment, 'SAP_SQL_SERVER'))
const connection = {
  server: parsedServer.host,
  database: required(environment, 'SAP_SQL_DATABASE'),
  user: required(environment, 'SAP_SQL_USER'),
  password: required(environment, 'SAP_SQL_PASSWORD'),
  connectionTimeout: Number(environment.SAP_SQL_CONNECTION_TIMEOUT_MS || 15_000),
  requestTimeout: Number(environment.SAP_SQL_REQUEST_TIMEOUT_MS || 30_000),
  options: {
    encrypt: booleanValue(environment.SAP_SQL_ENCRYPT, true),
    trustServerCertificate: booleanValue(environment.SAP_SQL_TRUST_SERVER_CERTIFICATE, false),
    enableArithAbort: true,
  },
  pool: { min: 0, max: 2, idleTimeoutMillis: 10_000 },
}
if (parsedServer.instance) connection.options.instanceName = parsedServer.instance
else connection.port = Number(environment.SAP_SQL_PORT || 1433)
if (!parsedServer.instance && (!Number.isInteger(connection.port) || connection.port < 1 || connection.port > 65535)) throw new Error('SAP_SQL_PORT es inválido.')
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
  const safeError = new Error(`No fue posible completar la consulta SAP (${safeCode}). Revisa red/VPN, instancia, puerto, autenticación y permisos de lectura. No se imprimieron datos de conexión.`)
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

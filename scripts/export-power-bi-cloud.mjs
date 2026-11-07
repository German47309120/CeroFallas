import { mkdir, writeFile } from 'node:fs/promises'
import { maintenancePowerBiCsv } from '../src/utils/powerBiExport.js'

const projectId = 'cerofallas-pg2-german-2026'
const outputDirectory = '.local/power-bi'

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

function decode(value) {
  if (!value) return null
  if ('nullValue' in value) return null
  if ('stringValue' in value) return value.stringValue
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('timestampValue' in value) return new Date(value.timestampValue)
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(decode)
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields ?? {}).map(([key, item]) => [key, decode(item)]))
  return null
}

async function readCollection(collectionId, token) {
  const records = []
  let pageToken = ''
  do {
    const url = new URL(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionId}`)
    url.searchParams.set('pageSize', '300')
    if (pageToken) url.searchParams.set('pageToken', pageToken)
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!response.ok) throw new Error(`No fue posible exportar ${collectionId} (HTTP ${response.status}).`)
    const body = await response.json()
    for (const document of body.documents ?? []) records.push({
      id: document.name.split('/').at(-1),
      ...Object.fromEntries(Object.entries(document.fields ?? {}).map(([key, value]) => [key, decode(value)])),
    })
    pageToken = body.nextPageToken ?? ''
  } while (pageToken)
  return records
}

const csvCell = (value) => {
  let text = value instanceof Date ? value.toISOString() : String(value ?? '')
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}
const csv = (columns, rows) => `\ufeff${columns.map(csvCell).join(',')}\r\n${rows.map((row) => columns.map((column) => csvCell(row[column])).join(',')).join('\r\n')}`

const token = await firebaseCliSession()
const [correctives, preventivePlans, preventiveExecutions, incidents, stock, riskPredictions, equipment] = await Promise.all([
  readCollection('correctives', token), readCollection('preventivePlans', token), readCollection('preventiveExecutions', token),
  readCollection('incidents', token), readCollection('stock', token), readCollection('riskPredictions', token), readCollection('equipment', token),
])

await mkdir(outputDirectory, { recursive: true })
await writeFile(`${outputDirectory}/cerofallas-mantenimiento.csv`, maintenancePowerBiCsv({ correctives, preventivePlans, preventiveExecutions, incidents }), 'utf8')

const riskColumns = ['id', 'equipo_id', 'equipo_codigo', 'equipo_nombre', 'fecha_calculo', 'horizonte_dias', 'nivel_riesgo', 'puntuacion_riesgo', 'version_modelo', 'demostrativo']
const riskRows = riskPredictions.map((row) => ({
  id: row.id, equipo_id: row.equipmentId, equipo_codigo: row.equipmentSnapshot?.code, equipo_nombre: row.equipmentSnapshot?.name,
  fecha_calculo: row.calculatedAt, horizonte_dias: row.horizonDays, nivel_riesgo: row.riskLevel,
  puntuacion_riesgo: row.riskScore, version_modelo: row.modelVersion, demostrativo: row.isDemonstration,
}))
await writeFile(`${outputDirectory}/cerofallas-riesgo.csv`, csv(riskColumns, riskRows), 'utf8')

const stockColumns = ['codigo', 'descripcion', 'cantidad', 'almacen', 'fecha_sincronizacion', 'origen', 'activo']
const stockRows = stock.map((row) => ({
  codigo: row.code, descripcion: row.description, cantidad: row.quantity, almacen: row.warehouse,
  fecha_sincronizacion: row.syncedAt, origen: row.source, activo: row.active,
}))
await writeFile(`${outputDirectory}/cerofallas-stock.csv`, csv(stockColumns, stockRows), 'utf8')

const equipmentColumns = ['id', 'codigo', 'nombre', 'tipo', 'area', 'criticidad', 'estado', 'marca', 'modelo']
const equipmentRows = equipment.map((row) => ({
  id: row.id, codigo: row.code, nombre: row.name, tipo: row.type, area: row.areaId,
  criticidad: row.criticality, estado: row.status, marca: row.brand, modelo: row.model,
}))
await writeFile(`${outputDirectory}/cerofallas-equipos.csv`, csv(equipmentColumns, equipmentRows), 'utf8')

console.log(`Dataset Power BI preparado: ${correctives.length + preventivePlans.length + preventiveExecutions.length + incidents.length} eventos, ${equipment.length} equipos, ${stock.length} existencias y ${riskPredictions.length} riesgos.`)
console.log('No se exportaron usuarios, correos, sesiones ni credenciales.')

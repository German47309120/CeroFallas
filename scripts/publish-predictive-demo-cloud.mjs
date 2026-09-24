import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const expectedProjectId = 'cerofallas-pg2-german-2026'
const requestedProjectId = process.argv.find((value) => value.startsWith('--project='))?.split('=')[1]
const confirmation = process.argv.find((value) => value.startsWith('--confirm-project='))?.split('=')[1]

if (requestedProjectId !== expectedProjectId || confirmation !== expectedProjectId) {
  throw new Error(`Publicación bloqueada. Indica --project=${expectedProjectId} y --confirm-project=${expectedProjectId}.`)
}
if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  throw new Error('Publicación cloud bloqueada porque existen variables de emulador activas.')
}

const firebaseConfig = JSON.parse(await readFile('.firebaserc', 'utf8'))
if (firebaseConfig?.projects?.default !== expectedProjectId) throw new Error('El alias local no coincide con el proyecto autorizado.')

const requireFirebaseTools = createRequire(resolve('node_modules/firebase-tools/package.json'))
const { getAccessToken, getGlobalDefaultAccount } = requireFirebaseTools('./lib/auth.js')
const activeAccount = getGlobalDefaultAccount()
if (!activeAccount?.user?.email || !activeAccount?.tokens?.refresh_token) throw new Error('Firebase CLI no tiene una cuenta activa.')
const token = await getAccessToken(activeAccount.tokens.refresh_token, [])
if (!token?.access_token) throw new Error('Firebase CLI no entregó un token de acceso válido.')

const equipment = [
  ['AIRLAY-01', 'Airlay 1'],
  ['PULS-01', 'Pulsonadora 1'],
  ['CARG-03', 'Cargadora 3'],
  ['MEZC-01', 'Mezcladora 1'],
  ['CORT-01', 'Cortadora transversal'],
  ['MONT-01', 'Montacargas 1'],
  ['COMP-AIR-01', 'Compresor de aire 1'],
  ['BOMB-AGUA-01', 'Bomba de agua 1'],
]
const cutoffs = ['2026-06-30', '2026-07-31', '2026-08-31', '2026-09-21']
const baseScores = [0.68, 0.54, 0.32, 0.61, 0.47, 0.38, 0.72, 0.43]

const levelFor = (score) => score >= 0.67 ? 'high' : score >= 0.4 ? 'medium' : 'low'
const explanationFor = (features) => {
  const factors = []
  if (features.preventiveOverdueDays >= 8) factors.push('atraso preventivo')
  if (features.correctiveCount30d >= 3) factors.push('correctivos recientes')
  if (features.incidentCount30d >= 2) factors.push('incidentes recientes')
  if (features.lastInspectionFailures >= 2) factors.push('hallazgos de inspección')
  return factors.length ? `Factores simulados: ${factors.join(', ')}.` : 'Sin factores simulados dominantes en este corte.'
}

const predictions = cutoffs.flatMap((cutoff, periodIndex) => equipment.map(([code, name], equipmentIndex) => {
  const variation = ((periodIndex * 7 + equipmentIndex * 3) % 15 - 7) / 100
  const trend = (periodIndex - 1.5) * (equipmentIndex % 3 === 0 ? 0.035 : equipmentIndex % 3 === 1 ? -0.025 : 0.012)
  const riskScore = Math.min(0.92, Math.max(0.08, Number((baseScores[equipmentIndex] + variation + trend).toFixed(2))))
  const featuresSnapshot = {
    correctiveCount30d: (equipmentIndex + periodIndex * 2) % 5,
    incidentCount30d: (equipmentIndex * 2 + periodIndex) % 4,
    preventiveOverdueDays: (equipmentIndex * 4 + periodIndex * 3) % 18,
    daysSinceLastPreventive: 12 + ((equipmentIndex * 11 + periodIndex * 9) % 75),
    lastInspectionFailures: (equipmentIndex + periodIndex) % 4,
  }
  return {
    id: `demo-risk-${cutoff}-${code}`,
    data: {
      equipmentId: code,
      equipmentSnapshot: { code, name },
      calculatedAt: new Date(`${cutoff}T12:00:00.000Z`),
      horizonDays: 30,
      riskScore,
      riskLevel: levelFor(riskScore),
      methodType: 'model',
      methodVersion: 'synthetic-rf-v1',
      modelName: 'Random Forest · simulación',
      featuresSnapshot,
      isDemonstration: true,
      dataOrigin: 'synthetic_demo',
      explanation: explanationFor(featuresSnapshot),
      createdAt: new Date(`${cutoff}T12:00:00.000Z`),
    },
  }
}))

function firestoreValue(value) {
  if (value === null) return { nullValue: null }
  if (value instanceof Date) return { timestampValue: value.toISOString() }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  if (typeof value === 'string') return { stringValue: value }
  if (value && typeof value === 'object') return { mapValue: { fields: firestoreFields(value) } }
  throw new Error(`Tipo de dato no compatible: ${typeof value}`)
}
function firestoreFields(object) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, firestoreValue(value)]))
}

const resource = `projects/${expectedProjectId}/databases/(default)/documents`
const response = await fetch(`https://firestore.googleapis.com/v1/${resource}:batchWrite`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    labels: { source: 'cerofallas_predictive_simulation' },
    writes: predictions.map(({ id, data }) => ({
      update: { name: `${resource}/riskPredictions/${encodeURIComponent(id)}`, fields: firestoreFields(data) },
    })),
  }),
})
const result = await response.json().catch(() => ({}))
if (!response.ok) throw new Error(`Firestore rechazó la simulación (${response.status}): ${result?.error?.message || 'sin detalle'}`)
const failures = (result.status || []).filter((status) => status.code)
if (failures.length) throw new Error(`Firestore rechazó ${failures.length} registro(s): ${failures[0].message || failures[0].code}`)

console.log(`Simulación predictiva publicada: ${predictions.length} registros, ${equipment.length} equipos y ${cutoffs.length} fechas de corte.`)
console.log('Todos los documentos quedaron marcados isDemonstration=true y dataOrigin=synthetic_demo.')

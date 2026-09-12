import { readFile } from 'node:fs/promises'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc, getFirestore, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'
import { forkliftChecklistTemplate } from '../src/config/forkliftChecklist.js'
import { getOperationalShiftId } from '../src/utils/shifts.js'

const projectId = 'cerofallas-pg2-german-2026'
const requestedProjectId = process.argv.find((value) => value.startsWith('--project='))?.split('=')[1]
const confirmedProjectId = process.argv.find((value) => value.startsWith('--confirm-project='))?.split('=')[1]
if (requestedProjectId !== projectId || confirmedProjectId !== projectId) throw new Error(`Verificación bloqueada. Indica --project=${projectId} y --confirm-project=${projectId}.`)

const parseEnvironment = (text) => Object.fromEntries(text.split(/\r?\n/)
  .map((line) => line.trim()).filter((line) => line && !line.startsWith('#') && line.includes('='))
  .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]))
const environment = parseEnvironment(await readFile('.env.local', 'utf8'))
if (environment.VITE_FIREBASE_PROJECT_ID !== projectId || environment.VITE_USE_FIREBASE_EMULATORS !== 'false') throw new Error('El ambiente local no coincide con el proyecto cloud autorizado.')

const accounts = JSON.parse(await readFile('.local/project-users.json', 'utf8'))
const accountFor = (roleId) => {
  const account = accounts.find((item) => item.roleId === roleId)
  if (!account) throw new Error(`Falta la cuenta local para ${roleId}.`)
  return account
}
const app = initializeApp({
  apiKey: environment.VITE_FIREBASE_API_KEY, authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: environment.VITE_FIREBASE_PROJECT_ID, storageBucket: environment.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: environment.VITE_FIREBASE_MESSAGING_SENDER_ID, appId: environment.VITE_FIREBASE_APP_ID,
}, `published-write-verification-${Date.now()}`)
const auth = getAuth(app)
const database = getFirestore(app)
const ids = {
  corrective: 'acceptance-cloud-corrective-v1', correctiveStartAudit: 'acceptance-cloud-audit-corrective-start-v1', correctiveAudit: 'acceptance-cloud-audit-corrective-v1',
  preventive: 'acceptance-cloud-preventive-v1', preventiveStartAudit: 'acceptance-cloud-audit-preventive-start-v1', preventiveAudit: 'acceptance-cloud-audit-preventive-v1',
  incident: 'acceptance-cloud-incident-v1', incidentAudit: 'acceptance-cloud-audit-incident-v1',
  inspection: 'acceptance-cloud-inspection-v1', inspectionAudit: 'acceptance-cloud-audit-inspection-v1',
}
const targets = [
  ['correctives', ids.corrective], ['audit', ids.correctiveAudit],
  ['preventiveExecutions', ids.preventive], ['audit', ids.preventiveAudit],
  ['incidents', ids.incident], ['audit', ids.incidentAudit],
  ['forkliftInspections', ids.inspection], ['audit', ids.inspectionAudit],
]

async function login(roleId) {
  await signOut(auth).catch(() => {})
  const account = accountFor(roleId)
  return (await signInWithEmailAndPassword(auth, account.email, account.password)).user
}
async function commitWithAudit(collectionName, entityId, auditId, actorId, data, entityType) {
  const timestamp = serverTimestamp()
  const batch = writeBatch(database)
  batch.set(doc(database, collectionName, entityId), data(timestamp))
  batch.set(doc(database, 'audit', auditId), {
    occurredAt: timestamp, actorId, action: 'acceptance_create', entityType, entityId,
    reason: 'Prueba técnica cloud autorizada; registro demostrativo y no operativo.',
  })
  await batch.commit()
}
async function startWithOfficialTime(collectionName, entityId, auditId, actorId, data, entityType) {
  const timestamp = serverTimestamp()
  const batch = writeBatch(database)
  batch.set(doc(database, collectionName, entityId), data(timestamp))
  batch.set(doc(database, 'audit', auditId), {
    occurredAt: timestamp, actorId, action: 'start', entityType, entityId,
    reason: 'Prueba técnica cloud autorizada; inicio demostrativo y no operativo.',
  })
  await batch.commit()
}

const guatemalaDate = (date) => date.toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' })

let created = 0
let skipped = 0
let denied = 0
try {
  await login('administrator')
  const existing = new Set()
  for (const [collectionName, id] of targets) if ((await getDoc(doc(database, collectionName, id))).exists()) existing.add(`${collectionName}/${id}`)

  if (!existing.has(`correctives/${ids.corrective}`)) {
    const user = await login('maintenance_technician')
    await startWithOfficialTime('correctives', ids.corrective, ids.correctiveStartAudit, user.uid, (timestamp) => ({
      workOrder: 'ACEPTACION-CLOUD-001', eventDate: null,
      startedAt: timestamp, endedAt: null, durationMinutes: null, timeSource: 'server',
      areaId: 'linea-1', areaSnapshot: { id: 'linea-1', name: 'Línea 1' },
      equipmentId: 'AIRLAY-01', equipmentSnapshot: { code: 'AIRLAY-01', name: 'Airlay 1' },
      reportedSymptom: 'Prueba controlada de aceptación publicada del módulo correctivo.',
      failureType: 'limpieza_general', affectedComponent: 'Sensores', identifiedCause: null,
      workPerformed: '', spareParts: [], observations: null, status: 'in_progress', voidReason: null,
      technicianIds: [user.uid], createdAt: timestamp, createdBy: user.uid, updatedAt: timestamp, updatedBy: user.uid,
    }), 'corrective')
    const current = (await getDoc(doc(database, 'correctives', ids.corrective))).data()
    const timestamp = serverTimestamp()
    const completion = writeBatch(database)
    completion.update(doc(database, 'correctives', ids.corrective), {
      eventDate: guatemalaDate(current.startedAt.toDate()), endedAt: timestamp, durationMinutes: null, timeSource: 'server',
      identifiedCause: 'Registro demostrativo', workPerformed: 'Verificación técnica de permisos y persistencia cloud.',
      observations: 'No corresponde a una intervención real de planta.', status: 'completed',
      updatedAt: timestamp, updatedBy: user.uid, auditId: ids.correctiveAudit,
    })
    completion.set(doc(database, 'audit', ids.correctiveAudit), {
      occurredAt: timestamp, actorId: user.uid, action: 'complete', entityType: 'corrective', entityId: ids.corrective,
      reason: 'Prueba técnica cloud autorizada; finalización demostrativa y no operativa.',
    })
    await completion.commit()
    created += 3
  } else skipped += 2

  if (!existing.has(`preventiveExecutions/${ids.preventive}`)) {
    const user = await login('maintenance_technician')
    await startWithOfficialTime('preventiveExecutions', ids.preventive, ids.preventiveStartAudit, user.uid, (timestamp) => ({
      planId: null, equipmentId: 'AIRLAY-01', equipmentSnapshot: { code: 'AIRLAY-01', name: 'Airlay 1' },
      areaId: 'linea-1', scheduledAt: null, startedAt: timestamp, endedAt: null, durationMinutes: null,
      technicianIds: [user.uid], activityPerformed: '', spareParts: [], observations: null,
      complianceStatus: 'pending', rescheduleStatus: 'pending', nextDueAtAfterExecution: null,
      status: 'in_progress', timeSource: 'server', createdAt: timestamp, createdBy: user.uid, updatedAt: timestamp, updatedBy: user.uid,
    }), 'preventiveExecution')
    const current = (await getDoc(doc(database, 'preventiveExecutions', ids.preventive))).data()
    const timestamp = serverTimestamp()
    const completion = writeBatch(database)
    completion.update(doc(database, 'preventiveExecutions', ids.preventive), {
      startedAt: current.startedAt, endedAt: timestamp, durationMinutes: null, timeSource: 'server',
      activityPerformed: 'Prueba controlada de aceptación del registro preventivo.', spareParts: [],
      observations: 'Ejecución demostrativa no asociada a mantenimiento real.', complianceStatus: 'unscheduled',
      rescheduleStatus: 'not_applicable', nextDueAtAfterExecution: null, status: 'completed',
      updatedAt: timestamp, updatedBy: user.uid, auditId: ids.preventiveAudit,
    })
    completion.set(doc(database, 'audit', ids.preventiveAudit), {
      occurredAt: timestamp, actorId: user.uid, action: 'complete', entityType: 'preventiveExecution', entityId: ids.preventive,
      reason: 'Prueba técnica cloud autorizada; finalización demostrativa y no operativa.',
    })
    await completion.commit()
    created += 3
  } else skipped += 2

  if (!existing.has(`incidents/${ids.incident}`)) {
    const user = await login('digitizer')
    await commitWithAudit('incidents', ids.incident, ids.incidentAudit, user.uid, (timestamp) => ({
      areaId: 'linea-2', areaName: 'Línea 2', equipmentId: null, equipmentSnapshot: null,
      description: 'Prueba controlada de aceptación publicada del reporte de incidentes; no corresponde a una falla real.',
      priority: 'low', status: 'reported', reporterId: user.uid, createdBy: user.uid, createdAt: timestamp,
      updatedBy: user.uid, updatedAt: timestamp, linkedCorrectiveId: null, followUp: '', auditId: ids.incidentAudit,
    }), 'incident')
    created += 2
  } else skipped += 2

  if (!existing.has(`forkliftInspections/${ids.inspection}`)) {
    const user = await login('forklift_operator')
    const answers = forkliftChecklistTemplate.sections.flatMap((section) => section.items).map((item) => ({
      itemId: item.id, label: item.label, critical: item.critical, status: 'good', observation: null,
    }))
    await commitWithAudit('forkliftInspections', ids.inspection, ids.inspectionAudit, user.uid, (timestamp) => ({
      equipmentId: 'MONT-01', equipmentSnapshot: { code: 'MONT-01', name: 'Montacargas 1' },
      templateId: forkliftChecklistTemplate.id, templateVersion: forkliftChecklistTemplate.version,
      inspectedAt: timestamp, shiftId: getOperationalShiftId(new Date()), operatorId: user.uid, hourMeter: 0,
      answers, criticalFailures: 0, overallResult: 'fit',
      generalObservations: 'Prueba técnica de aceptación cloud; no representa una inspección operativa.',
      evidenceUrls: [], status: 'completed', createdAt: timestamp, createdBy: user.uid,
    }), 'forkliftInspection')
    created += 2
  } else skipped += 2

  for (const [roleId, collectionName] of [
    ['management', 'equipment'], ['digitizer', 'correctives'],
    ['maintenance_technician', 'forkliftInspections'], ['forklift_operator', 'incidents'],
  ]) {
    await login(roleId)
    try {
      await setDoc(doc(database, collectionName, `acceptance-denied-${roleId}`), { probe: true })
      throw new Error(`${roleId}: una escritura prohibida fue aceptada en ${collectionName}.`)
    } catch (error) {
      if (error?.code !== 'permission-denied') throw error
      denied += 1
    }
  }

  await login('administrator')
  for (const [collectionName, id] of targets) if (!(await getDoc(doc(database, collectionName, id))).exists()) throw new Error(`Falta evidencia cloud: ${collectionName}/${id}.`)
} finally {
  await signOut(auth).catch(() => {})
  await deleteApp(app)
}

console.log(`Escrituras cloud verificadas: ${created} documentos creados, ${skipped} ya existentes y ${denied} intentos prohibidos rechazados.`)
console.log('Los cuatro registros quedan identificados como pruebas técnicas no operativas; no se mostraron credenciales.')

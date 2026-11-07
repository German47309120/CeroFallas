import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { setGlobalOptions } from 'firebase-functions/v2/options'
import { defineSecret, defineString } from 'firebase-functions/params'
import { assertPasswordResetTarget, assertSafeAdministratorUpdate, evaluateAdministratorAccess, normalizeCreateUser, normalizePasswordReset, normalizeUpdateUser, profileForRole } from './user-admin.js'
import { buildAssistantPrompt, buildMaintenanceSnapshot, normalizeAssistantInput, requestOpenAiAnswer } from './maintenance-assistant.js'

initializeApp()
setGlobalOptions({ region: 'us-central1', maxInstances: 5 })

const database = getFirestore()
const auth = getAuth()
const openAiApiKey = defineSecret('OPENAI_API_KEY')
const openAiModel = defineString('OPENAI_MODEL', { default: 'gpt-6-luna' })

async function requireAdministrator(request) {
  const uid = request.auth?.uid
  if (!uid) throw new HttpsError('unauthenticated', 'Debes iniciar sesión.')
  const snapshot = await database.doc(`users/${uid}`).get()
  const access = evaluateAdministratorAccess(uid, snapshot.exists ? snapshot.data() : null)
  if (!access.allowed) throw new HttpsError(access.reason, 'Solo el administrador puede gestionar usuarios.')
  return access.actorId
}

const inputError = (error) => {
  if (error instanceof HttpsError) return error
  return new HttpsError('invalid-argument', error?.message || 'Datos inválidos.')
}

async function requireAssistantAccess(request) {
  const uid = request.auth?.uid
  if (!uid) throw new HttpsError('unauthenticated', 'Debes iniciar sesión.')
  const snapshot = await database.doc(`users/${uid}`).get()
  const profile = snapshot.exists ? snapshot.data() : null
  if (profile?.status !== 'active' || !profile?.permissions?.includes('dashboard.read')) {
    throw new HttpsError('permission-denied', 'Tu perfil no puede consultar el asistente gerencial.')
  }
  return uid
}

export const askMaintenanceAssistant = onCall({ secrets: [openAiApiKey], timeoutSeconds: 60, memory: '256MiB' }, async (request) => {
  const actorId = await requireAssistantAccess(request)
  let input
  try { input = normalizeAssistantInput(request.data) } catch (error) { throw inputError(error) }
  try {
    const snapshot = await buildMaintenanceSnapshot(database)
    const answer = await requestOpenAiAnswer({
      apiKey: openAiApiKey.value(),
      model: openAiModel.value(),
      prompt: buildAssistantPrompt(snapshot, input.question, input.history),
    })
    await database.collection('audit').add({
      occurredAt: FieldValue.serverTimestamp(),
      actorId,
      action: 'assistant_query',
      entityType: 'maintenanceAssistant',
      entityId: 'gerencial',
      outcome: 'completed',
    })
    return { answer, snapshot, mode: 'openai', model: openAiModel.value() }
  } catch (error) {
    console.error('Maintenance assistant failed', { actorId, message: error?.message })
    throw new HttpsError('unavailable', 'El análisis con IA no está disponible en este momento.')
  }
})

export const createAppUser = onCall(async (request) => {
  const actorId = await requireAdministrator(request)
  let input
  try { input = normalizeCreateUser(request.data) } catch (error) { throw inputError(error) }
  let account
  try {
    account = await auth.createUser({ email: input.email, password: input.password, displayName: input.displayName, disabled: false })
    const role = profileForRole(input.roleId)
    const timestamp = FieldValue.serverTimestamp()
    const profile = { displayName: input.displayName, email: input.email, ...role, status: 'active', createdAt: timestamp, createdBy: actorId, updatedAt: timestamp, updatedBy: actorId }
    const batch = database.batch()
    batch.set(database.doc(`users/${account.uid}`), profile)
    batch.set(database.collection('audit').doc(), { occurredAt: timestamp, actorId, action: 'create', entityType: 'user', entityId: account.uid, after: { ...profile, createdAt: null, updatedAt: null } })
    await batch.commit()
    return { uid: account.uid }
  } catch (error) {
    if (account?.uid) await auth.deleteUser(account.uid).catch(() => {})
    if (error?.code === 'auth/email-already-exists') throw new HttpsError('already-exists', 'El correo ya está registrado.')
    if (error instanceof HttpsError) throw error
    throw new HttpsError('internal', 'No fue posible crear el usuario.')
  }
})

export const updateAppUser = onCall(async (request) => {
  const actorId = await requireAdministrator(request)
  let input
  try { input = normalizeUpdateUser(request.data) } catch (error) { throw inputError(error) }
  const profileRef = database.doc(`users/${input.uid}`)
  const beforeProfile = await profileRef.get()
  if (!beforeProfile.exists) throw new HttpsError('not-found', 'El perfil no existe.')
  try { assertSafeAdministratorUpdate(actorId, input) } catch (error) { throw new HttpsError('failed-precondition', error.message) }
  const beforeAccount = await auth.getUser(input.uid).catch(() => null)
  if (!beforeAccount) throw new HttpsError('not-found', 'La identidad no existe en Authentication.')
  const role = profileForRole(input.roleId)
  try {
    await auth.updateUser(input.uid, { displayName: input.displayName, disabled: input.status === 'disabled' })
    const timestamp = FieldValue.serverTimestamp()
    const updates = { displayName: input.displayName, ...role, status: input.status, updatedAt: timestamp, updatedBy: actorId }
    const batch = database.batch()
    batch.update(profileRef, updates)
    batch.set(database.collection('audit').doc(), { occurredAt: timestamp, actorId, action: input.status === 'disabled' ? 'disable' : 'update', entityType: 'user', entityId: input.uid, before: beforeProfile.data(), after: { ...updates, updatedAt: null } })
    await batch.commit()
    return { uid: input.uid }
  } catch (error) {
    await auth.updateUser(input.uid, { displayName: beforeAccount.displayName, disabled: beforeAccount.disabled }).catch(() => {})
    if (error instanceof HttpsError) throw error
    throw new HttpsError('internal', 'No fue posible actualizar el usuario.')
  }
})

export const resetAppUserPassword = onCall(async (request) => {
  const actorId = await requireAdministrator(request)
  let input
  try { input = normalizePasswordReset(request.data) } catch (error) { throw inputError(error) }
  try { assertPasswordResetTarget(actorId, input.uid) } catch (error) { throw new HttpsError('failed-precondition', error.message) }

  const profile = await database.doc(`users/${input.uid}`).get()
  if (!profile.exists) throw new HttpsError('not-found', 'El perfil no existe.')
  const account = await auth.getUser(input.uid).catch(() => null)
  if (!account) throw new HttpsError('not-found', 'La identidad no existe en Authentication.')

  const auditRef = database.collection('audit').doc()
  const timestamp = FieldValue.serverTimestamp()
  await auditRef.set({
    occurredAt: timestamp,
    actorId,
    action: 'password_reset_requested',
    entityType: 'user',
    entityId: input.uid,
    outcome: 'pending',
  })

  try {
    await auth.updateUser(input.uid, { password: input.password })
  } catch {
    await auditRef.update({ action: 'password_reset_failed', outcome: 'failed', completedAt: FieldValue.serverTimestamp() }).catch(() => {})
    throw new HttpsError('internal', 'No fue posible restablecer la contraseña.')
  }

  const auditRecorded = await auditRef.update({ action: 'password_reset', outcome: 'completed', completedAt: FieldValue.serverTimestamp() })
    .then(() => true)
    .catch(() => false)
  return { uid: input.uid, auditRecorded }
})

import { collection, doc, onSnapshot, runTransaction, serverTimestamp, Timestamp, writeBatch } from 'firebase/firestore'
import { getFirebaseFirestore } from './firestore.js'

const deviceStorageKey = 'cerofallas-device-id'
const leaseDurationMs = 10 * 60 * 1000
const heartbeatMs = 60 * 1000

export class SessionInUseError extends Error {
  constructor() {
    super('La cuenta ya está siendo utilizada en otro dispositivo.')
    this.code = 'auth/session-in-use'
  }
}

export function getDeviceId() {
  const storage = globalThis.localStorage
  const saved = storage?.getItem(deviceStorageKey)
  if (saved) return saved
  const id = globalThis.crypto?.randomUUID?.() ?? `device-${Date.now()}-${Math.random().toString(36).slice(2)}`
  storage?.setItem(deviceStorageKey, id)
  return id
}

const sessionRef = (userId) => doc(getFirebaseFirestore(), 'activeSessions', userId)
const expiresAt = () => Timestamp.fromMillis(Date.now() + leaseDurationMs)

export async function acquireExclusiveSession(userId) {
  const deviceId = getDeviceId()
  await runTransaction(getFirebaseFirestore(), async (transaction) => {
    const reference = sessionRef(userId)
    const snapshot = await transaction.get(reference)
    const current = snapshot.data()
    const activeElsewhere = snapshot.exists()
      && current.deviceId !== deviceId
      && current.expiresAt?.toMillis?.() > Date.now()
    if (activeElsewhere) throw new SessionInUseError()
    transaction.set(reference, {
      userId,
      deviceId,
      acquiredAt: current?.deviceId === deviceId ? current.acquiredAt : serverTimestamp(),
      lastSeenAt: serverTimestamp(),
      expiresAt: expiresAt(),
    })
  })
  return deviceId
}

async function renewExclusiveSession(userId, deviceId) {
  await runTransaction(getFirebaseFirestore(), async (transaction) => {
    const reference = sessionRef(userId)
    const snapshot = await transaction.get(reference)
    if (!snapshot.exists() || snapshot.data().deviceId !== deviceId) throw new SessionInUseError()
    transaction.update(reference, { lastSeenAt: serverTimestamp(), expiresAt: expiresAt() })
  })
}

export function monitorExclusiveSession(userId, onLost) {
  const deviceId = getDeviceId()
  const unsubscribe = onSnapshot(sessionRef(userId), (snapshot) => {
    if (!snapshot.exists() || snapshot.data().deviceId !== deviceId) onLost()
  }, onLost)
  const timer = globalThis.setInterval(() => {
    renewExclusiveSession(userId, deviceId).catch(onLost)
  }, heartbeatMs)
  return () => {
    unsubscribe()
    globalThis.clearInterval(timer)
  }
}

export async function releaseExclusiveSession(userId) {
  const deviceId = getDeviceId()
  await runTransaction(getFirebaseFirestore(), async (transaction) => {
    const reference = sessionRef(userId)
    const snapshot = await transaction.get(reference)
    if (snapshot.exists() && snapshot.data().deviceId === deviceId) transaction.delete(reference)
  })
}

export async function forceReleaseSession(userId, actorId) {
  const database = getFirebaseFirestore()
  const auditRef = doc(collection(database, 'audit'))
  const batch = writeBatch(database)
  batch.delete(sessionRef(userId))
  batch.set(auditRef, {
    occurredAt: serverTimestamp(),
    actorId,
    action: 'release_session',
    entityType: 'activeSession',
    entityId: userId,
    reason: 'Liberación administrativa de sesión exclusiva',
  })
  await batch.commit()
}

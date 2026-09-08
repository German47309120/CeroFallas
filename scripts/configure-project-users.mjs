import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { roleDefinitions } from '../src/config/roles.js'

export const projectUserCatalogPath = '.local/project-users.json'
export const requiredEmailDomain = '@novafiber.com.gt'

export function validateProjectUsers(accounts) {
  const issues = []
  if (!Array.isArray(accounts)) return ['El catálogo debe ser un arreglo de usuarios.']

  const requiredRoles = Object.keys(roleDefinitions)
  const receivedRoles = accounts.map((account) => account?.roleId)
  const normalizedEmails = accounts.map((account) => account?.email?.trim().toLowerCase())

  for (const roleId of requiredRoles) {
    const occurrences = receivedRoles.filter((value) => value === roleId).length
    if (occurrences !== 1) issues.push(`El rol ${roleId} debe aparecer exactamente una vez.`)
  }
  for (const roleId of receivedRoles) {
    if (!roleDefinitions[roleId]) issues.push(`Rol desconocido: ${roleId || '(vacío)'}.`)
  }
  if (new Set(normalizedEmails).size !== normalizedEmails.length) issues.push('Los correos deben ser únicos.')

  for (const account of accounts) {
    const label = account?.roleId || 'usuario sin rol'
    if (!account?.displayName?.trim()) issues.push(`${label}: nombre vacío.`)
    if (!account?.email?.trim().toLowerCase().endsWith(requiredEmailDomain)) {
      issues.push(`${label}: el correo debe pertenecer a ${requiredEmailDomain}.`)
    }
    if (typeof account?.password !== 'string' || account.password.length < 10 || account.password.length > 128) {
      issues.push(`${label}: la contraseña debe tener entre 10 y 128 caracteres.`)
    }
  }
  return issues
}

function assertLocalEmulator(host, label) {
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(host || '')) {
    throw new Error(`${label} debe apuntar explícitamente a un emulador local; recibido: ${host || '(vacío)'}.`)
  }
}

export async function configureProjectUsers({ catalogPath = projectUserCatalogPath } = {}) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099'
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080'
  assertLocalEmulator(process.env.FIREBASE_AUTH_EMULATOR_HOST, 'FIREBASE_AUTH_EMULATOR_HOST')
  assertLocalEmulator(process.env.FIRESTORE_EMULATOR_HOST, 'FIRESTORE_EMULATOR_HOST')

  const accounts = JSON.parse(await readFile(catalogPath, 'utf8'))
  const issues = validateProjectUsers(accounts)
  if (issues.length) throw new Error(`Catálogo inválido:\n- ${issues.join('\n- ')}`)

  const requireFunctions = createRequire(new URL('../functions/package.json', import.meta.url))
  const { deleteApp, initializeApp } = requireFunctions('firebase-admin/app')
  const { getAuth } = requireFunctions('firebase-admin/auth')
  const { FieldValue, getFirestore } = requireFunctions('firebase-admin/firestore')
  const app = initializeApp({ projectId: 'demo-cerofallas' }, `project-users-${Date.now()}`)

  try {
    const auth = getAuth(app)
    const database = getFirestore(app)
    const authUsers = (await auth.listUsers(1000)).users
    const profiles = await database.collection('users').get()
    const profileByRole = new Map()

    for (const profile of profiles.docs) {
      const roleId = profile.data().roleId
      if (roleId && profileByRole.has(roleId)) throw new Error(`Hay más de un perfil para el rol ${roleId}.`)
      if (roleId) profileByRole.set(roleId, profile)
    }

    const plan = []
    for (const account of accounts) {
      const profile = profileByRole.get(account.roleId)
      if (!profile) throw new Error(`No existe un perfil local para el rol ${account.roleId}.`)
      const authUser = authUsers.find((user) => user.uid === profile.id)
      if (!authUser) throw new Error(`El perfil ${profile.id} no tiene una cuenta de autenticación.`)
      const emailOwner = authUsers.find((user) => user.email?.toLowerCase() === account.email.toLowerCase())
      if (emailOwner && emailOwner.uid !== authUser.uid) throw new Error(`El correo ${account.email} ya pertenece a otra cuenta.`)
      plan.push({ account, profile, authUser })
    }

    for (const { account, profile, authUser } of plan) {
      await auth.updateUser(authUser.uid, {
        displayName: account.displayName.trim(),
        email: account.email.trim().toLowerCase(),
        password: account.password,
        disabled: false,
        emailVerified: true,
      })
      const role = roleDefinitions[account.roleId]
      await profile.ref.set({
        displayName: account.displayName.trim(),
        email: account.email.trim().toLowerCase(),
        roleId: account.roleId,
        roleName: role.name,
        permissions: role.permissions,
        status: 'active',
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
    }

    return accounts.map(({ password: _password, ...account }) => account)
  } finally {
    await deleteApp(app)
  }
}

if (process.argv[1] && import.meta.url === new URL(`file:///${process.argv[1].replaceAll('\\', '/')}`).href) {
  const accounts = await configureProjectUsers()
  console.log(`Catálogo local aplicado: ${accounts.length} cuentas actualizadas sin duplicados.`)
  for (const account of accounts) console.log(`- ${account.roleId}: ${account.email}`)
  console.log(`Las contraseñas permanecen únicamente en ${projectUserCatalogPath}, ignorado por Git.`)
}

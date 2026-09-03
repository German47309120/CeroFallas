import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, setDoc } from 'firebase/firestore'

const email = process.env.CEROFALLAS_TEST_EMAIL
const password = process.env.CEROFALLAS_TEST_PASSWORD

if (!email || !password) {
  throw new Error('Define CEROFALLAS_TEST_EMAIL y CEROFALLAS_TEST_PASSWORD para crear el usuario local.')
}

const response = await fetch(
  'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  },
)

if (!response.ok) {
  throw new Error(`Authentication Emulator rechazó el usuario: ${await response.text()}`)
}

const account = await response.json()
const environment = await initializeTestEnvironment({
  projectId: 'demo-cerofallas',
  firestore: { host: '127.0.0.1', port: 8080 },
})

await environment.withSecurityRulesDisabled(async (context) => {
  await setDoc(doc(context.firestore(), 'users', account.localId), {
    displayName: 'Administrador de prueba',
    email,
    roleId: 'administrator',
    roleName: 'Administrador',
    status: 'active',
    permissions: ['equipment.read', 'equipment.manage', 'corrective.read', 'corrective.create', 'corrective.manage', 'preventive.read', 'preventive.plan', 'preventive.execute', 'preventive.manage', 'forklift.read', 'forklift.inspect', 'forklift.manage', 'audit.read', 'audit.write'],
  })
})

await environment.cleanup()
console.log(`Usuario local creado: ${email}`)

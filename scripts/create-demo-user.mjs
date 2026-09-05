import { randomBytes } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, setDoc } from 'firebase/firestore'
import { roleDefinitions } from '../src/config/roles.js'

const email = 'admin.demo@cerofallas.local'
const password = `${randomBytes(15).toString('base64url')}Aa1!`
const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, returnSecureToken: true }),
})

if (!response.ok) throw new Error(`Authentication Emulator rechazó la cuenta demo: ${await response.text()}`)
const account = await response.json()
const environment = await initializeTestEnvironment({ projectId: 'demo-cerofallas', firestore: { host: '127.0.0.1', port: 8080 } })

await environment.withSecurityRulesDisabled(async (context) => {
  await setDoc(doc(context.firestore(), 'users', account.localId), {
    displayName: 'Administrador de demostración', email, roleId: 'administrator', roleName: 'Administrador',
    status: 'active', permissions: roleDefinitions.administrator.permissions, dataOrigin: 'demo',
  })
})
await environment.cleanup()

await mkdir('.local', { recursive: true })
await writeFile('.local/demo-login.txt', `CeroFallas — acceso local de demostración\nURL: http://127.0.0.1:5173/login\nCorreo: ${email}\nContraseña: ${password}\n\nEsta cuenta solo existe en Firebase Emulator. No utilizar en producción.\n`, { encoding: 'utf8', mode: 0o600 })
console.log('Cuenta local creada. Credenciales disponibles en .local/demo-login.txt (carpeta ignorada por Git).')

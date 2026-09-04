// Only the local demo emulator is in scope; this script cannot target production.
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, getDocs, updateDoc, arrayUnion } from 'firebase/firestore'

const environment = await initializeTestEnvironment({ projectId: 'demo-cerofallas', firestore: { host: '127.0.0.1', port: 8080 } })
try {
  await environment.withSecurityRulesDisabled(async (context) => {
    const profiles = await getDocs(collection(context.firestore(), 'users'))
    let updated = 0
    for (const profile of profiles.docs) {
      if (profile.data().roleId !== 'administrator' || profile.data().status !== 'active') continue
      await updateDoc(profile.ref, { permissions: arrayUnion('incident.read', 'incident.create', 'incident.manage', 'dashboard.read', 'users.read', 'stock.read') })
      updated += 1
    }
    console.log(`Administradores locales actualizados: ${updated}. No se modificaron otros roles.`)
  })
} finally { await environment.cleanup() }

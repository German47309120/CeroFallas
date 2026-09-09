import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const userFacingFiles = [
  'src/pages/LoginPage.jsx', 'src/pages/ProfilePage.jsx',
  'src/pages/DashboardPage.jsx', 'src/pages/HelpPage.jsx',
  'src/components/layout/AppShell.jsx', 'src/components/UserAdministration.jsx',
  'src/features/auth/AuthContext.jsx',
]
const forbiddenTechnicalLabels = /Acceso conectado a Firebase|Firebase activo|Firebase cloud|Firestore|Firebase Emulator Suite|Authentication Emulator|Firebase Functions|Functions no desplegadas|Plan Spark|backend administrativo en Blaze/i

describe('lenguaje de producto', () => {
  it('no expone nombres de infraestructura en mensajes visibles', () => {
    for (const file of userFacingFiles) expect(readFileSync(file, 'utf8'), file).not.toMatch(forbiddenTechnicalLabels)
  })
})

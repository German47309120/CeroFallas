import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const userFacingFiles = [
  'src/pages/LoginPage.jsx', 'src/pages/ProfilePage.jsx',
  'src/pages/DashboardPage.jsx', 'src/pages/HelpPage.jsx', 'src/pages/CorrectiveFormPage.jsx',
  'src/pages/PreventivePlanFormPage.jsx', 'src/pages/PowerBiPage.jsx',
  'src/components/layout/AppShell.jsx', 'src/components/UserAdministration.jsx',
  'src/features/auth/AuthContext.jsx',
]
const forbiddenTechnicalLabels = /Acceso conectado a Firebase|Firebase activo|Firebase cloud|Firestore|Firebase Emulator Suite|Authentication Emulator|Firebase Functions|Functions no desplegadas|Plan Spark|backend administrativo en Blaze|Servicio administrativo pendiente|selección desde SAP se conectará en su fase|Ruta sugerida para la defensa|Importante para la presentación|instantánea transaccional/i

describe('lenguaje de producto', () => {
  it('no expone nombres de infraestructura en mensajes visibles', () => {
    for (const file of userFacingFiles) expect(readFileSync(file, 'utf8'), file).not.toMatch(forbiddenTechnicalLabels)
  })
})

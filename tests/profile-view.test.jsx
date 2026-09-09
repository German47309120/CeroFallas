import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfilePage from '../src/pages/ProfilePage.jsx'

let authState
vi.mock('../src/features/auth/AuthContext.jsx', () => ({ useAuth: () => authState }))

describe('perfil comprensible para el usuario', () => {
  beforeEach(() => {
    authState = {
      user: { email: 'german.hernandez@novafiber.com.gt' },
      environment: 'emulator',
      profile: {
        displayName: 'German Hernandez',
        roleId: 'administrator',
        roleName: 'Administrador de la aplicación',
        status: 'active',
        permissions: ['dashboard.read', 'users.read'],
      },
    }
  })

  it('muestra identidad, rol y entorno con etiquetas de negocio', () => {
    const html = renderToStaticMarkup(<ProfilePage />)
    expect(html).toContain('German Hernandez')
    expect(html).toContain('Administrador de la aplicación')
    expect(html).toContain('Pruebas locales · no producción')
    expect(html).toContain('Activo')
  })

  it('traduce los permisos y conserva el identificador técnico como referencia', () => {
    const html = renderToStaticMarkup(<ProfilePage />)
    expect(html).toContain('Consultar dashboard')
    expect(html).toContain('Consultar perfiles')
    expect(html).toContain('dashboard.read')
    expect(html).toContain('2 permisos efectivos')
  })
})

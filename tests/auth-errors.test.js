import { describe, expect, it } from 'vitest'
import { getAuthErrorMessage } from '../src/services/firebase/auth.js'

describe('mensajes seguros de autenticación', () => {
  it('no permite distinguir correo, contraseña, cuenta inexistente o desactivada', () => {
    const codes = [
      'auth/invalid-credential', 'auth/invalid-login-credentials', 'auth/invalid-email',
      'auth/missing-password', 'auth/wrong-password', 'auth/user-not-found', 'auth/user-disabled',
    ]
    const messages = new Set(codes.map((code) => getAuthErrorMessage({ code })))
    expect(messages.size).toBe(1)
    expect([...messages][0]).toBe('No fue posible iniciar sesión. Verifica tus credenciales e inténtalo nuevamente.')
  })

  it('conserva mensajes operativos para red y exceso de intentos', () => {
    expect(getAuthErrorMessage({ code: 'auth/network-request-failed' })).toContain('servicio de autenticación')
    expect(getAuthErrorMessage({ code: 'auth/too-many-requests' })).toContain('demasiados intentos')
    expect(getAuthErrorMessage({ code: 'auth/session-in-use' })).toContain('otro dispositivo')
  })
})

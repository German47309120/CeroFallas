import { describe, expect, it } from 'vitest'
import { shouldActivateAppCheck } from '../src/services/firebase/config.js'

describe('preparación de App Check', () => {
  it('se mantiene apagado sin clave pública', () => {
    expect(shouldActivateAppCheck('', false)).toBe(false)
    expect(shouldActivateAppCheck('   ', false)).toBe(false)
  })

  it('no se activa en emuladores aunque exista clave', () => {
    expect(shouldActivateAppCheck('clave-publica', true)).toBe(false)
  })

  it('se activa en cloud únicamente con clave configurada', () => {
    expect(shouldActivateAppCheck('clave-publica', false)).toBe(true)
  })
})

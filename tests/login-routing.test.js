import { describe, expect, it } from 'vitest'
import { postLoginDestination } from '../src/config/access.js'

describe('navegación al cambiar de identidad', () => {
  it('inicia siempre en una ruta común y no hereda el módulo del usuario anterior', () => {
    expect(postLoginDestination()).toBe('/')
  })
})

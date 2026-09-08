import { describe, expect, it } from 'vitest'
import { roleDefinitions } from '../src/config/roles.js'
import { requiredEmailDomain, validateProjectUsers } from '../scripts/configure-project-users.mjs'

const validAccounts = Object.keys(roleDefinitions).map((roleId, index) => ({
  roleId,
  displayName: `Usuario ${index + 1}`,
  email: `usuario.${index + 1}${requiredEmailDomain}`,
  password: `Clave-${index + 1}-Segura!`,
}))

describe('catálogo definitivo de usuarios', () => {
  it('acepta exactamente una cuenta institucional por rol', () => {
    expect(validateProjectUsers(validAccounts)).toEqual([])
  })

  it('rechaza roles duplicados o faltantes', () => {
    const invalid = validAccounts.map((account) => ({ ...account }))
    invalid[1].roleId = invalid[0].roleId
    expect(validateProjectUsers(invalid).join(' ')).toMatch(/exactamente una vez/)
  })

  it('rechaza correos ajenos al dominio y contraseñas cortas', () => {
    const invalid = validAccounts.map((account) => ({ ...account }))
    invalid[0].email = 'admin@example.com'
    invalid[0].password = 'corta'
    expect(validateProjectUsers(invalid)).toEqual(expect.arrayContaining([
      expect.stringContaining(requiredEmailDomain),
      expect.stringContaining('entre 10 y 128'),
    ]))
  })
})

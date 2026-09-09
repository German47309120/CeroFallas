import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'

let permissions = []
let profile = { displayName: 'Usuario de prueba', role: 'Rol de prueba' }
vi.mock('../src/features/auth/AuthContext.jsx', () => ({
  useAuth: () => ({ profile, hasPermission: (permission) => permissions.includes(permission) }),
}))

import HelpPage from '../src/pages/HelpPage.jsx'

const render = () => renderToStaticMarkup(<MemoryRouter><HelpPage /></MemoryRouter>)

beforeEach(() => {
  permissions = []
  profile = { displayName: 'Usuario de prueba', role: 'Rol de prueba' }
})

it('personaliza la guía para un montacarguista', () => {
  permissions = ['equipment.read', 'forklift.read', 'forklift.inspect']
  profile = { displayName: 'Operador', role: 'Montacarguista' }
  const html = render()
  expect(html).toContain('Completar checklist')
  expect(html).toContain('Checklist de montacargas')
  expect(html).not.toContain('Registrar correctivo')
  expect(html).not.toContain('Programar preventivo')
})

it('mantiene a gerencia en recorridos de consulta', () => {
  permissions = ['dashboard.read', 'corrective.read', 'preventive.read', 'incident.read']
  profile = { displayName: 'Gerencia', role: 'Gerencia' }
  const html = render()
  expect(html).toContain('Revisar dashboard')
  expect(html).toContain('Mantenimiento correctivo')
  expect(html).toContain('Incidentes operativos')
  expect(html).not.toContain('href="/correctivos/nuevo"')
})

it('explica arquitectura, defensa y límites de la demostración', () => {
  const html = render()
  expect(html).toContain('Interfaz responsive')
  expect(html).toContain('Base central protegida')
  expect(html).toContain('Ruta sugerida para la defensa')
  expect(html).toContain('los registros actuales son demostrativos')
})

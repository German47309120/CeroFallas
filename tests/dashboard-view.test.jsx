import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
let permissions = []
vi.mock('../src/features/auth/AuthContext.jsx', () => ({ useAuth: () => ({ user: { uid: 'test' }, profile: { displayName: 'Prueba' }, hasPermission: (p) => permissions.includes(p) }) }))
import DashboardPage from '../src/pages/DashboardPage.jsx'
const render = () => renderToStaticMarkup(<MemoryRouter><DashboardPage /></MemoryRouter>)
it('muestra solamente accesos autorizados a montacarguistas', () => {
  permissions = ['forklift.inspect']
  const html = render()
  expect(html).toContain('Inspeccionar montacargas')
  expect(html).not.toContain('Registrar correctivo')
  expect(html).not.toContain('Incidentes críticos y altos')
})
it('muestra ausencia de permiso y no ceros a un perfil solo dashboard', () => {
  permissions = ['dashboard.read']
  const html = render()
  expect(html).toContain('Tu perfil no tiene acceso a esta fuente.')
  expect(html).not.toContain('<strong>0</strong>')
  expect(html).not.toContain('href="/incidentes"')
})
it('expone carga y acciones permitidas mientras llegan las consultas', () => {
  permissions = ['dashboard.read', 'preventive.read', 'preventive.execute']
  const html = render()
  expect(html).toContain('aria-busy="true"')
  expect(html).toContain('Registrar preventivo')
  expect(html).toContain('Consultando registros')
  expect(html).toContain('Período de actividad')
  expect(html).toContain('30 días')
  expect(html).not.toContain('<strong>0</strong>')
})

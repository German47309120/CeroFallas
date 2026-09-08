import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vitest'

let permissions = []
let profileLoading = false
vi.mock('../src/features/auth/AuthContext.jsx', () => ({
  useAuth: () => ({
    profileLoading,
    hasPermission: (permission) => permissions.includes(permission),
  }),
}))

import RouteAccess from '../src/features/auth/RouteAccess.jsx'

function render(path) {
  return renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><RouteAccess><p>Contenido autorizado</p></RouteAccess></MemoryRouter>)
}

it('renderiza una ruta cuando el perfil posee el permiso', () => {
  profileLoading = false
  permissions = ['corrective.create']
  expect(render('/correctivos/nuevo')).toContain('Contenido autorizado')
})

it('sustituye una URL no autorizada por una explicación segura', () => {
  profileLoading = false
  permissions = ['corrective.read']
  const html = render('/correctivos/registro-1/editar')
  expect(html).toContain('Acceso restringido')
  expect(html).toContain('no modifica información')
  expect(html).not.toContain('Contenido autorizado')
})

it('espera a que el perfil termine de cargar antes de decidir', () => {
  profileLoading = true
  permissions = []
  const html = render('/admin/usuarios')
  expect(html).toContain('Cargando permisos del perfil')
  expect(html).not.toContain('Acceso restringido')
})

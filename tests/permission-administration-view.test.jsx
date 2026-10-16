import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'

vi.mock('../src/services/firebase/profiles.js', () => ({ updateUserPermissions: vi.fn() }))
import PermissionAdministration from '../src/components/PermissionAdministration.jsx'

it('muestra al administrador los permisos del usuario seleccionado y excluye su propia cuenta', () => {
  const records = [
    { id: 'admin', displayName: 'Administrador', email: 'admin@novafiber.com.gt', roleId: 'administrator', permissions: ['users.read', 'audit.write'] },
    { id: 'technician', displayName: 'Técnico Uno', email: 'tecnico@novafiber.com.gt', roleId: 'maintenance_technician', roleName: 'Técnico de Mantenimiento', permissions: ['equipment.read', 'audit.write', 'corrective.read'] },
  ]
  const html = renderToStaticMarkup(<PermissionAdministration records={records} currentUserId="admin" onSaved={() => {}} />)
  expect(html).toContain('Gestionar permisos por usuario')
  expect(html).toContain('Técnico Uno')
  expect(html).toContain('Guardar permisos')
  expect(html).not.toContain('admin@novafiber.com.gt')
})

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../src/features/auth/AuthContext.jsx', () => ({ useAuth: () => ({ hasPermission: (permission) => permission === 'dashboard.read' }) }))
vi.mock('../src/services/firebase/assistant.js', () => ({ loadLocalAssistantSnapshot: vi.fn(), askMaintenanceAssistant: vi.fn() }))
import MaintenanceAssistantPage from '../src/pages/MaintenanceAssistantPage.jsx'

describe('vista del asistente gerencial', () => {
  it('muestra conversación y evidencia lateral sin permitir modificaciones', () => {
    const html = renderToStaticMarkup(<MaintenanceAssistantPage />)
    expect(html).toContain('Asistente de mantenimiento')
    expect(html).toContain('Datos utilizados')
    expect(html).toContain('Incidentes abiertos')
    expect(html).toContain('La consulta no crea ni modifica información')
    expect(html).toContain('No modifico registros')
  })
})

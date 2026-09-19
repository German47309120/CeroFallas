import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
vi.mock('../src/features/auth/AuthContext.jsx', () => ({ useAuth: () => ({ user: { uid: 'management' }, profile: { displayName: 'Gerencia' }, hasPermission: (permission) => ['dashboard.read', 'corrective.read', 'preventive.read', 'incident.read', 'prediction.read'].includes(permission) }) }))
import PowerBiPage from '../src/pages/PowerBiPage.jsx'
import { powerBiReportConfiguration } from '../src/utils/powerBi.js'

const render = (reportUrl) => renderToStaticMarkup(<MemoryRouter><PowerBiPage reportUrl={reportUrl} /></MemoryRouter>)

describe('integración segura del reporte gerencial', () => {
  it('acepta enlaces oficiales autenticados y detecta publicación pública', () => {
    expect(powerBiReportConfiguration('https://app.powerbi.com/reportEmbed?reportId=demo').accessMode).toBe('authenticated')
    expect(powerBiReportConfiguration('https://app.powerbi.com/view?r=demo').accessMode).toBe('public_link')
  })

  it('rechaza HTTP, dominios ajenos y rutas no autorizadas', () => {
    for (const value of ['http://app.powerbi.com/view?r=x', 'https://example.com/view?r=x', 'https://app.powerbi.com/unknown']) {
      expect(powerBiReportConfiguration(value).state).toBe('invalid')
    }
  })

  it('mantiene disponible el reporte interno cuando falta Power BI', () => {
    const html = render('')
    expect(html).toContain('Resumen interno activo')
    expect(html).toContain('Centro de mantenimiento')
    expect(html).toContain('Imprimir reporte')
    expect(html).toContain('Abrir IA predictiva')
    expect(html).not.toContain('Abrir reporte en una pestaña nueva')
  })

  it('muestra advertencia explícita para enlaces públicos', () => {
    const html = render('https://app.powerbi.com/view?r=demo')
    expect(html).toContain('publicación pública')
    expect(html).toContain('Abrir reporte en una pestaña nueva')
    expect(html).toContain('noopener noreferrer')
  })
})

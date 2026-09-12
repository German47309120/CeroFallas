import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
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

  it('no inventa un reporte cuando falta configuración', () => {
    const html = render('')
    expect(html).toContain('Aún no se ha configurado el reporte')
    expect(html).not.toContain('Abrir reporte en una pestaña nueva')
  })

  it('muestra advertencia explícita para enlaces públicos', () => {
    const html = render('https://app.powerbi.com/view?r=demo')
    expect(html).toContain('publicación pública')
    expect(html).toContain('Abrir reporte en una pestaña nueva')
    expect(html).toContain('noopener noreferrer')
  })
})

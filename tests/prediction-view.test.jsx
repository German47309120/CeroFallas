import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { vi } from 'vitest'
let allowed = true
vi.mock('../src/features/auth/AuthContext.jsx', () => ({ useAuth: () => ({ hasPermission: () => allowed }) }))
import PredictionPage from '../src/pages/PredictionPage.jsx'

describe('pantalla segura del laboratorio predictivo', () => {
  const html = renderToStaticMarkup(<PredictionPage />)

  it('declara el origen demostrativo y prohíbe el uso operativo', () => {
    expect(html).toContain('Laboratorio demostrativo')
    expect(html).toContain('No es una predicción de planta')
    expect(html).toContain('No deben usarse para decidir mantenimientos')
    expect(html).toContain('Sintético y reproducible')
  })

  it('presenta la comparación y la trazabilidad reproducible', () => {
    expect(html).toContain('Regresión logística')
    expect(html).toContain('Bosque aleatorio')
    expect(html).toContain('48.02 %')
    expect(html).toContain('20E57B89D7A719064')
  })

  it('diferencia claramente lo listo de lo pendiente', () => {
    expect(html).toContain('2 de 4')
    expect(html).toContain('Histórico autorizado')
    expect(html).toContain('Validación operativa')
    expect(html).not.toContain('Predicción operacional activa')
  })

  it('deniega la ruta directa si falta el permiso', () => {
    allowed = false
    const denied = renderToStaticMarkup(<PredictionPage />)
    allowed = true
    expect(denied).toContain('no tiene permiso')
    expect(denied).not.toContain('Comparación de modelos')
  })
})

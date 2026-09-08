import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import AppErrorBoundary from '../src/components/AppErrorBoundary.jsx'

it('mantiene el contenido cuando no existe un error', () => {
  const boundary = new AppErrorBoundary({ children: <p>Aplicación operativa</p> })
  expect(renderToStaticMarkup(boundary.render())).toContain('Aplicación operativa')
})

it('presenta recuperación sin exponer detalles técnicos', () => {
  const boundary = new AppErrorBoundary({ children: <p>Contenido sensible</p> })
  boundary.state = AppErrorBoundary.getDerivedStateFromError(new Error('detalle interno secreto'))
  const html = renderToStaticMarkup(boundary.render())
  expect(html).toContain('No fue posible mostrar esta pantalla')
  expect(html).toContain('No se confirmó ninguna operación adicional')
  expect(html).toContain('Volver a intentar')
  expect(html).not.toContain('detalle interno secreto')
  expect(html).not.toContain('Contenido sensible')
})

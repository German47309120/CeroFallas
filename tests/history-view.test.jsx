import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
let allowed = true
let state
vi.mock('../src/features/auth/AuthContext.jsx', () => ({ useAuth: () => ({ user: { uid: 'reader' }, profileLoading: false, hasPermission: () => allowed }) }))
vi.mock('../src/features/usePagedHistory.js', () => ({ usePagedHistory: () => state }))
import HistoryControls from '../src/components/HistoryControls.jsx'
import EquipmentFilter from '../src/components/EquipmentFilter.jsx'
import ResourceReadPage from '../src/pages/ResourceReadPage.jsx'
import IncidentsPage from '../src/pages/IncidentsPage.jsx'
import PreventivesPage from '../src/pages/PreventivesPage.jsx'
beforeEach(() => { allowed = true; state = { records: [], loading: false, loadingMore: false, hasMore: false, error: '', refresh: () => {}, loadMore: () => {} } })
const render = (element) => renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>)
it('no informa fin de resultados durante un error', () => {
  state.error = 'Error de consulta'
  expect(render(<HistoryControls history={state} />)).not.toContain('Fin de resultados')
})
it('permite cargar más aun cuando no hay coincidencias de búsqueda', () => {
  state.hasMore = true
  const html = render(<HistoryControls history={state} visibleCount={0} />)
  expect(html).toContain('Cargar más')
  expect(html).toContain('0 coincidencias')
})
it('mantiene filas de stock visibles tras error en página adicional', () => {
  state.error = 'Error de consulta'
  state.records = [{ id: 'part', code: 'PIEZA-PRUEBA', description: 'Prueba', quantity: 0, warehouse: 'A', source: 'demo-local' }]
  const html = render(<ResourceReadPage resource="stock" />)
  expect(html).toContain('PIEZA-PRUEBA')
  expect(html).toContain('Estas cantidades no provienen de SAP')
  expect(html).toContain('Consultando última sincronización')
  expect(html).toContain('Error de consulta')
  expect(html).not.toContain('Sin coincidencias en lo cargado')
})
it('identifica stock real de SAP y ofrece filtros de consulta', () => {
  state.records = [{ id: 'sap-part', code: 'SAP-01', description: 'Repuesto sincronizado', quantity: 1250.5, warehouse: '01', source: 'sap-sqlserver' }]
  const html = render(<ResourceReadPage resource="stock" />)
  expect(html).toContain('1,250.5')
  expect(html).toContain('Buscar por prefijo de código')
  expect(html).toContain('<table class="stock-table">')
  expect(html).toContain('Todos los almacenes cargados')
  expect(html).toContain('Limpiar filtros')
  expect(html).not.toContain('La integración real con SAP permanece pendiente')
})
it('presenta la matriz de roles y aclara dónde se administran permisos', () => {
  const html = render(<ResourceReadPage resource="users" />)
  expect(html).toContain('Roles institucionales propuestos')
  expect(html).toContain('Técnico de Mantenimiento')
  expect(html).toContain('El Administrador puede ajustar permisos individuales')
  expect(html).not.toContain('Guardar permisos')
})
it('no muestra incidentes guardados en memoria si no hay permiso', () => {
  allowed = false
  state.records = [{ id: 'secret', description: 'Contenido restringido' }]
  const html = render(<IncidentsPage />)
  expect(html).not.toContain('Contenido restringido')
  expect(html).toContain('Tu perfil no permite consultar')
})
it('mantiene deshabilitado el filtro de equipo sin permiso de catálogo', () => {
  const html = render(<EquipmentFilter allowed={false} value="" onChange={() => {}} />)
  expect(html).toContain('Sin permiso de catálogo')
  expect(html).toContain('disabled=""')
})
it('no confunde fallo de preventivos con inexistencia de planes', () => {
  state.error = 'Error de consulta'
  const html = render(<PreventivesPage />)
  expect(html).toContain('Error de consulta')
  expect(html).not.toContain('No hay planes registrados')
  expect(html).not.toContain('No hay ejecuciones registradas')
})

import { describe, it, expect } from 'vitest'
import { validateIncident } from '../src/utils/incidents.js'
import { canViewNavigation } from '../src/config/access.js'

const valid = { areaId: 'linea-1', equipmentId: '', description: 'Ruido inusual en la máquina', priority: 'high' }
describe('Validación de incidentes y navegación', () => {
  it('admite reportar sin identificar equipo', () => expect(validateIncident(valid)).toBe(''))
  it('rechaza descripciones vacías o demasiado cortas', () => expect(validateIncident({ ...valid, description: '   ' })).not.toBe(''))
  it('rechaza áreas y prioridades no autorizadas', () => {
    expect(validateIncident({ ...valid, areaId: 'inventada' })).not.toBe('')
    expect(validateIncident({ ...valid, priority: 'inventada' })).not.toBe('')
  })
  it('rechaza equipo inactivo o de otra línea', () => {
    expect(validateIncident({ ...valid, equipmentId: 'EQ' }, { status: 'inactive', areaId: 'linea-1' })).not.toBe('')
    expect(validateIncident({ ...valid, equipmentId: 'EQ' }, { status: 'active', areaId: 'linea-2' })).not.toBe('')
  })
  it('no muestra administración a un montacarguista', () => {
    const permission = (p) => ['forklift.read', 'forklift.inspect'].includes(p)
    expect(canViewNavigation('/montacargas', permission)).toBe(true)
    expect(canViewNavigation('/admin/usuarios', permission)).toBe(false)
    expect(canViewNavigation('/correctivos', permission)).toBe(false)
  })
})

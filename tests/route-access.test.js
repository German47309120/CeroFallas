import { describe, expect, it } from 'vitest'
import { canAccessRoute } from '../src/config/access.js'
import { roleDefinitions } from '../src/config/roles.js'

const routes = [
  '/', '/perfil', '/correctivos', '/correctivos/nuevo', '/correctivos/registro-1/editar',
  '/preventivos', '/preventivos/nuevo', '/preventivos/plan-1/editar', '/preventivos/ejecutar',
  '/montacargas', '/montacargas/nuevo', '/incidentes', '/incidentes/nuevo', '/equipos',
  '/equipos/nuevo', '/equipos/equipo-1/editar', '/equipos/equipo-1', '/repuestos', '/riesgo', '/asistente', '/analitica',
  '/admin/usuarios', '/admin/auditoria',
  '/ayuda',
]

const accessibleRoutes = (roleId) => {
  const permissions = roleDefinitions[roleId].permissions
  return routes.filter((path) => canAccessRoute(path, (permission) => permissions.includes(permission)))
}

describe('control central de acceso por URL', () => {
  it('permite al administrador todas las rutas conocidas', () => {
    expect(accessibleRoutes('administrator')).toEqual(routes)
  })

  it('limita al montacarguista a inicio, perfil, equipos y checklist', () => {
    expect(accessibleRoutes('forklift_operator')).toEqual([
      '/', '/perfil', '/montacargas', '/montacargas/nuevo', '/equipos', '/equipos/equipo-1', '/ayuda',
    ])
  })

  it('permite reportar incidentes sin conceder su histórico', () => {
    for (const roleId of ['airlay_operator', 'digitizer']) {
      const allowed = accessibleRoutes(roleId)
      expect(allowed).toContain('/incidentes')
      expect(allowed).toContain('/incidentes/nuevo')
      expect(allowed).not.toContain('/admin/auditoria')
      expect(allowed).not.toContain('/correctivos')
    }
  })

  it('mantiene a gerencia en consultas y bloquea formularios', () => {
    expect(accessibleRoutes('management')).toEqual([
      '/', '/perfil', '/correctivos', '/preventivos', '/incidentes', '/riesgo', '/asistente', '/analitica', '/ayuda',
    ])
  })

  it('rechaza rutas desconocidas y tolera una barra final', () => {
    const hasNothing = () => false
    expect(canAccessRoute('/perfil/', hasNothing)).toBe(true)
    expect(canAccessRoute('/ruta-inventada', hasNothing)).toBe(false)
  })

  it('evalúa las 253 combinaciones de roles y rutas sin excepciones', () => {
    const decisions = Object.keys(roleDefinitions).flatMap((roleId) => routes.map((path) => [roleId, path, accessibleRoutes(roleId).includes(path)]))
    expect(decisions).toHaveLength(264)
    expect(decisions.every(([, , allowed]) => typeof allowed === 'boolean')).toBe(true)
  })
})

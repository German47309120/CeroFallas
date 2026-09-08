import { describe, expect, it } from 'vitest'
import { auditActionLabel, auditActorLabel, auditEntityLabel } from '../src/utils/audit.js'

describe('presentación comprensible de auditoría', () => {
  it('traduce acciones y entidades operativas', () => {
    expect(auditActionLabel('void')).toBe('Anuló el registro')
    expect(auditActionLabel('reschedule_reverted')).toBe('Revirtió la reprogramación del plan')
    expect(auditEntityLabel('forkliftInspection')).toBe('Inspección de montacargas')
  })

  it('muestra el nombre sin ocultar el UID trazable', () => {
    const actors = new Map([['uid-1', { displayName: 'German Hernandez', email: 'german@novafiber.com.gt' }]])
    expect(auditActorLabel('uid-1', actors)).toBe('German Hernandez · uid-1')
  })

  it('conserva códigos desconocidos en lugar de inventar etiquetas', () => {
    expect(auditActionLabel('custom_action')).toBe('Acción: custom_action')
    expect(auditEntityLabel('custom_entity')).toBe('Entidad: custom_entity')
    expect(auditActorLabel('uid-desconocido')).toBe('uid-desconocido')
  })
})

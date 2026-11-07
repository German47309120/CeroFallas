import { describe, expect, it } from 'vitest'
import { normalizeWorkOrderRows, validateReadOnlyWorkOrderQuery, workOrderDocumentId } from '../src/utils/sapWorkOrders.js'

const validQuery = `SELECT docEntryBaseSap FROM MEGA_ENTRY
WHERE ACTIVE = 1 AND created_at > '2026-01-01' AND docEntryBaseSap BETWEEN '11000' AND '11900';`

describe('integración de órdenes de trabajo SAP', () => {
  it('acepta únicamente la consulta de lectura con OT activas', () => {
    expect(validateReadOnlyWorkOrderQuery(validQuery)).toBe(true)
    expect(() => validateReadOnlyWorkOrderQuery(validQuery.replace('ACTIVE = 1', 'ACTIVE = 0'))).toThrow('active = 1')
    expect(() => validateReadOnlyWorkOrderQuery(validQuery.replaceAll('docEntryBaseSap', 'otroCampo'))).toThrow('docEntryBaseSap')
    expect(() => validateReadOnlyWorkOrderQuery(validQuery.replace("created_at > '2026-01-01'", "created_at > '2025-01-01'"))).toThrow('created_at')
    expect(() => validateReadOnlyWorkOrderQuery(`${validQuery} DELETE FROM MEGA_ENTRY`)).toThrow('solo lectura')
  })

  it('normaliza, filtra y elimina duplicados', () => {
    expect(normalizeWorkOrderRows([
      { workOrder: ' ot-100 ' }, { workOrder: 'OT-100' }, { docEntryBaseSap: 'OT-200' }, { workOrder: 'NO-300' },
    ])).toEqual([
      { id: 'NO-300', code: 'NO-300', normalizedCode: 'NO-300', active: true },
      { id: 'OT-100', code: 'OT-100', normalizedCode: 'OT-100', active: true },
      { id: 'OT-200', code: 'OT-200', normalizedCode: 'OT-200', active: true },
    ])
    expect(workOrderDocumentId('OT/300')).toBe('OT%2F300')
  })
})

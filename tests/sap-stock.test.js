import { describe, expect, it } from 'vitest'
import { normalizeStockRow, normalizeStockRows, parseSqlServerTarget, resolveSqlNetworkTarget, validateReadOnlyStockQuery } from '../src/utils/sapStock.js'

describe('contrato de stock SAP', () => {
  it('interpreta servidores SQL con puerto o instancia nombrada', () => {
    expect(parseSqlServerTarget('sql-planta')).toEqual({ host: 'sql-planta', instance: '' })
    expect(parseSqlServerTarget('sql-planta\\SAP')).toEqual({ host: 'sql-planta', instance: 'SAP' })
    expect(() => parseSqlServerTarget('sql-planta\\')).toThrow('Instancia SQL inválida')
    expect(() => parseSqlServerTarget('')).toThrow('Servidor SQL requerido')
  })

  it('permite un puerto TCP fijo para una instancia cuando SQL Browser está bloqueado', () => {
    expect(resolveSqlNetworkTarget('sql-planta', '1544')).toEqual({ host: 'sql-planta', instance: '', port: 1544 })
    expect(resolveSqlNetworkTarget('sql-planta\\SAP')).toEqual({ host: 'sql-planta', instance: 'SAP' })
    expect(resolveSqlNetworkTarget('sql-planta\\SAP', 1433, '51433')).toEqual({ host: 'sql-planta', instance: '', port: 51433 })
    expect(() => resolveSqlNetworkTarget('sql-planta\\SAP', 1433, '70000')).toThrow('Puerto fijo')
  })

  it('acepta SELECT o CTE de lectura y bloquea mutaciones', () => {
    expect(validateReadOnlyStockQuery('SELECT Codigo AS codigo FROM Stock;')).toBe(true)
    expect(validateReadOnlyStockQuery('WITH x AS (SELECT 1 AS n) SELECT n FROM x')).toBe(true)
    for (const query of ['DELETE FROM Stock', 'SELECT * INTO copia FROM Stock', 'SELECT 1; DROP TABLE Stock']) {
      expect(() => validateReadOnlyStockQuery(query)).toThrow()
    }
  })

  it('normaliza alias españoles y conserva cantidades negativas de SAP', () => {
    expect(normalizeStockRow({ Codigo: ' rp-01 ', Descripcion: 'Rodamiento', Cantidad: '-2.5', Almacen: ' central ' })).toMatchObject({
      code: 'RP-01', description: 'Rodamiento', quantity: -2.5, warehouse: 'CENTRAL',
    })
  })

  it('acepta alias habituales de SAP Business One', () => {
    expect(normalizeStockRow({ ItemCode: 'A-1', ItemName: 'Artículo', OnHand: 12, WhsCode: '01' })).toMatchObject({
      code: 'A-1', description: 'Artículo', quantity: 12, warehouse: '01',
    })
  })

  it('rechaza filas incompletas, cantidades inválidas y código/almacén duplicado', () => {
    expect(() => normalizeStockRow({ codigo: '', descripcion: 'X', cantidad: 1, almacen: 'A' })).toThrow('Código')
    expect(() => normalizeStockRow({ codigo: 'X', descripcion: 'X', cantidad: 'NaN', almacen: 'A' })).toThrow('Cantidad')
    expect(() => normalizeStockRows([
      { codigo: 'X', descripcion: 'Uno', cantidad: 1, almacen: 'A' },
      { codigo: 'x', descripcion: 'Dos', cantidad: 2, almacen: 'a' },
    ])).toThrow('duplicado')
  })
})

import { createHash } from 'node:crypto'

const aliases = {
  code: ['code', 'codigo', 'código', 'itemcode'],
  description: ['description', 'descripcion', 'descripción', 'itemname'],
  quantity: ['quantity', 'cantidad', 'existencia', 'onhand'],
  warehouse: ['warehouse', 'almacen', 'almacén', 'whscode'],
}

const cleanSql = (text) => text
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/--.*$/gm, ' ')
  .replace(/N?'(?:''|[^'])*'/gi, "''")
  .trim()

export function validateReadOnlyStockQuery(queryText) {
  const query = cleanSql(queryText)
  if (!query) throw new Error('La consulta de stock está vacía.')
  const statements = query.split(';').map((part) => part.trim()).filter(Boolean)
  if (statements.length !== 1) throw new Error('La consulta debe contener una sola sentencia de lectura.')
  if (!/^(select|with)\b/i.test(statements[0])) throw new Error('La consulta debe iniciar con SELECT o WITH.')
  if (/\b(insert|update|delete|merge|drop|alter|truncate|create|grant|revoke|deny|execute|exec)\b/i.test(statements[0]) || /\bselect\b[\s\S]*\binto\b/i.test(statements[0])) {
    throw new Error('La consulta contiene una operación no permitida; el conector acepta únicamente lectura.')
  }
  return true
}

const valueFor = (row, names) => {
  const lookup = new Map(Object.entries(row).map(([key, value]) => [key.toLocaleLowerCase('es'), value]))
  for (const name of names) if (lookup.has(name)) return lookup.get(name)
  return undefined
}
const requiredText = (value, label, maxLength) => {
  const normalized = String(value ?? '').trim()
  if (!normalized) throw new Error(`${label} es obligatorio.`)
  if (normalized.length > maxLength) throw new Error(`${label} supera ${maxLength} caracteres.`)
  return normalized
}

export function normalizeStockRow(row) {
  const code = requiredText(valueFor(row, aliases.code), 'Código', 80).toUpperCase()
  const description = requiredText(valueFor(row, aliases.description), 'Descripción', 500)
  const warehouse = requiredText(valueFor(row, aliases.warehouse), 'Almacén', 80).toUpperCase()
  const quantity = Number(valueFor(row, aliases.quantity))
  if (!Number.isFinite(quantity) || Math.abs(quantity) > 1_000_000_000_000) throw new Error('Cantidad inválida.')
  const id = createHash('sha256').update(`${code}\u0000${warehouse}`).digest('hex').slice(0, 32)
  return { id, code, description, quantity, warehouse }
}

export function normalizeStockRows(rows, maximumRows = 50_000) {
  if (!Array.isArray(rows)) throw new Error('SQL Server no devolvió una tabla válida.')
  if (rows.length > maximumRows) throw new Error(`La consulta devolvió más de ${maximumRows} filas; limita o agrega la fuente.`)
  const normalized = rows.map((row, index) => {
    try { return normalizeStockRow(row) } catch (error) { throw new Error(`Fila ${index + 1}: ${error.message}`) }
  })
  const identities = new Set()
  for (const row of normalized) {
    if (identities.has(row.id)) throw new Error(`La consulta devolvió duplicado el código ${row.code} en almacén ${row.warehouse}.`)
    identities.add(row.id)
  }
  return normalized
}

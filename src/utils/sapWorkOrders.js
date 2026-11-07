const forbiddenSql = /\b(insert|update|delete|merge|drop|alter|truncate|exec(?:ute)?|create|grant|revoke)\b/i

export function normalizeWorkOrderCode(value) {
  return String(value ?? '').trim().toUpperCase()
}

export function workOrderDocumentId(value) {
  const normalized = normalizeWorkOrderCode(value)
  if (!normalized) throw new Error('La orden de trabajo está vacía.')
  return encodeURIComponent(normalized)
}

export function normalizeWorkOrderRows(rows) {
  const unique = new Map()
  for (const row of rows ?? []) {
    const normalizedCode = normalizeWorkOrderCode(row.workOrder ?? row.workorder ?? row.docEntryBaseSap)
    if (!normalizedCode || normalizedCode.length > 80) continue
    unique.set(normalizedCode, {
      id: workOrderDocumentId(normalizedCode),
      code: normalizedCode,
      normalizedCode,
      active: true,
    })
  }
  return [...unique.values()].sort((left, right) => left.normalizedCode.localeCompare(right.normalizedCode, 'es'))
}

export function validateReadOnlyWorkOrderQuery(query) {
  const sql = String(query ?? '').trim()
  if (!sql) throw new Error('La consulta de órdenes de trabajo está vacía.')
  if (!/^select\b/i.test(sql)) throw new Error('La consulta de órdenes de trabajo debe iniciar con SELECT.')
  if (forbiddenSql.test(sql)) throw new Error('La consulta contiene una operación que no es de solo lectura.')
  if (!/\bfrom\s+(?:\[[^\]]+\]\.)?\[?MEGA_ENTRY\]?/i.test(sql)) throw new Error('La consulta debe leer MEGA_ENTRY.')
  if (!/\bactive\s*=\s*1\b/i.test(sql)) throw new Error('La consulta debe limitarse a active = 1.')
  if (!/\bdocEntryBaseSap\b/i.test(sql)) throw new Error('La consulta debe devolver docEntryBaseSap.')
  if (!/\bcreated_at\s*>\s*'2026-01-01'/i.test(sql)) throw new Error("La consulta debe filtrar created_at > '2026-01-01'.")
  if (!/\bdocEntryBaseSap\s+between\s+'11000'\s+and\s+'11900'/i.test(sql)) throw new Error("La consulta debe limitar docEntryBaseSap entre 11000 y 11900.")
  const withoutFinalSemicolon = sql.replace(/;\s*$/, '')
  if (withoutFinalSemicolon.includes(';')) throw new Error('La consulta debe contener una sola sentencia SELECT.')
  return true
}

const safeNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0

export const emptyAssistantSnapshot = {
  generatedAt: null,
  windowDays: 30,
  openIncidents: 0,
  overduePlans: 0,
  upcomingPlans: 0,
  completedCorrectives: 0,
  completedPreventives: 0,
  highRiskEquipment: 0,
  activeEquipment: 0,
  lowStockItems: 0,
  topAreas: [],
  highRiskItems: [],
  dataCoverage: [],
}

export function normalizeAssistantSnapshot(value = {}) {
  return {
    ...emptyAssistantSnapshot,
    ...value,
    windowDays: safeNumber(value.windowDays) || 30,
    openIncidents: safeNumber(value.openIncidents),
    overduePlans: safeNumber(value.overduePlans),
    upcomingPlans: safeNumber(value.upcomingPlans),
    completedCorrectives: safeNumber(value.completedCorrectives),
    completedPreventives: safeNumber(value.completedPreventives),
    highRiskEquipment: safeNumber(value.highRiskEquipment),
    activeEquipment: safeNumber(value.activeEquipment),
    lowStockItems: safeNumber(value.lowStockItems),
    topAreas: Array.isArray(value.topAreas) ? value.topAreas.slice(0, 5) : [],
    highRiskItems: Array.isArray(value.highRiskItems) ? value.highRiskItems.slice(0, 5) : [],
    dataCoverage: Array.isArray(value.dataCoverage) ? value.dataCoverage : [],
  }
}

export function localAssistantAnswer(question, source) {
  const snapshot = normalizeAssistantSnapshot(source)
  const normalized = String(question ?? '').trim().toLocaleLowerCase('es')
  const period = `últimos ${snapshot.windowDays} días`
  const riskNames = snapshot.highRiskItems.map((item) => item.code || item.name).filter(Boolean).join(', ')
  const areaNames = snapshot.topAreas.map((item) => `${item.name} (${item.total})`).join(', ')

  if (/incidente|seguridad|critic/.test(normalized)) {
    return `Hay ${snapshot.openIncidents} incidentes abiertos. ${areaNames ? `Las áreas con mayor actividad son ${areaNames}. ` : ''}Conviene revisar primero los casos críticos o de prioridad alta y confirmar si cada uno ya tiene seguimiento o correctivo relacionado.`
  }
  if (/preventiv|vencid|plan|gantt/.test(normalized)) {
    return `Actualmente hay ${snapshot.overduePlans} planes preventivos vencidos y ${snapshot.upcomingPlans} próximos. En ${period} se completaron ${snapshot.completedPreventives} ejecuciones. La prioridad recomendada es reprogramar los vencidos y validar disponibilidad de técnico y repuesto antes de la fecha prevista.`
  }
  if (/correctiv|falla|repar/.test(normalized)) {
    return `En ${period} se completaron ${snapshot.completedCorrectives} correctivos y permanecen ${snapshot.openIncidents} incidentes abiertos. Para profundizar, revisá los equipos y áreas repetitivas y compará el síntoma reportado con el historial preventivo.`
  }
  if (/riesgo|predict|equipo|ia/.test(normalized)) {
    return `El último corte contiene ${snapshot.highRiskEquipment} equipos con riesgo alto. ${riskNames ? `Los primeros identificados son ${riskNames}. ` : ''}Estas señales son de apoyo y deben validarse con inspección técnica e histórico real antes de programar una intervención.`
  }
  if (/repuesto|stock|inventario/.test(normalized)) {
    return `El resumen detecta ${snapshot.lowStockItems} posiciones con existencia baja dentro de la muestra consultada. La cantidad oficial sigue siendo la publicada desde SAP; CeroFallas no descuenta ni modifica inventario automáticamente.`
  }
  return `Resumen ejecutivo: ${snapshot.openIncidents} incidentes abiertos, ${snapshot.overduePlans} preventivos vencidos, ${snapshot.completedCorrectives} correctivos y ${snapshot.completedPreventives} preventivos completados en ${period}, y ${snapshot.highRiskEquipment} equipos marcados con riesgo alto. Empezaría por incidentes críticos, planes vencidos y señales repetidas por equipo. Esta respuesta usa análisis interno; al configurar la API se ampliará con un modelo generativo.`
}

export function validateAssistantQuestion(value) {
  const question = String(value ?? '').trim()
  if (question.length < 3) return 'Escribe una consulta de al menos 3 caracteres.'
  if (question.length > 600) return 'La consulta no puede superar 600 caracteres.'
  return ''
}

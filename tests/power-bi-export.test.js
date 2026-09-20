import { describe, expect, it } from 'vitest'
import { maintenancePowerBiCsv, maintenancePowerBiRows } from '../src/utils/powerBiExport.js'

const stamp = (value) => ({ toDate: () => new Date(value) })

describe('dataset analítico para Power BI', () => {
  const datasets = {
    correctives: [{ id: 'c1', equipmentId: 'EQ-1', equipmentSnapshot: { code: 'EQ-1', name: 'Equipo 1' }, areaId: 'linea-1', status: 'completed', startedAt: stamp('2026-09-18T12:00:00Z'), endedAt: stamp('2026-09-18T13:00:00Z'), durationMinutes: 60, workPerformed: 'Ajuste', failureType: 'Cadena' }],
    preventivePlans: [{ id: 'p1', status: 'active', nextDueAt: stamp('2026-09-20T12:00:00Z'), activityName: 'Lubricación' }],
    preventiveExecutions: [{ id: 'e1', status: 'completed', complianceStatus: 'on_time', activityPerformed: 'Inspección' }],
    incidents: [{ id: 'i1', status: 'reported', priority: 'high', description: '=FORMULA' }],
  }

  it('unifica cuatro fuentes sin exponer usuarios o credenciales', () => {
    const rows = maintenancePowerBiRows(datasets)
    expect(rows.map((row) => row.tipo_registro)).toEqual(['correctivo', 'plan_preventivo', 'ejecucion_preventiva', 'incidente'])
    expect(rows[0].duracion_minutos).toBe(60)
    expect(JSON.stringify(rows)).not.toMatch(/createdBy|password|email/i)
  })

  it('genera CSV UTF-8 y neutraliza fórmulas de hoja de cálculo', () => {
    const csv = maintenancePowerBiCsv(datasets)
    expect(csv.startsWith('\ufeff')).toBe(true)
    expect(csv).toContain('"\'=FORMULA"')
    expect(csv).toContain('"2026-09-18T12:00:00.000Z"')
  })
})

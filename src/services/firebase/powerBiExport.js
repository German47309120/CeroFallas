import { readCorrectiveHistory } from './correctiveHistory.js'
import { resourceReaders } from './history.js'
import { maintenancePowerBiCsv } from '../../utils/powerBiExport.js'

async function readAll(readPage) {
  const records = new Map()
  let cursor = null
  let hasMore = true
  let pages = 0
  while (hasMore) {
    const page = await readPage({ status: 'all', cursor, pageSize: 100 })
    for (const record of page.records) records.set(record.id, record)
    cursor = page.cursor
    hasMore = page.hasMore
    pages += 1
    if (pages > 500) throw new Error('El volumen supera el límite seguro de exportación.')
  }
  return [...records.values()]
}

export async function buildMaintenancePowerBiCsv() {
  const [correctives, preventivePlans, preventiveExecutions, incidents] = await Promise.all([
    readAll(readCorrectiveHistory),
    readAll(resourceReaders.preventivePlans),
    readAll(resourceReaders.preventiveExecutions),
    readAll(resourceReaders.incidents),
  ])
  return { csv: maintenancePowerBiCsv({ correctives, preventivePlans, preventiveExecutions, incidents }), count: correctives.length + preventivePlans.length + preventiveExecutions.length + incidents.length }
}

export function downloadMaintenancePowerBiCsv(csv, reference = new Date()) {
  const day = reference.toISOString().slice(0, 10)
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `cerofallas-mantenimiento-${day}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

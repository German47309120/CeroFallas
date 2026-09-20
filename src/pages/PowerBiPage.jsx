import { useState } from 'react'
import { Link } from 'react-router-dom'
import { powerBiReportConfiguration } from '../utils/powerBi.js'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { buildMaintenancePowerBiCsv, downloadMaintenancePowerBiCsv } from '../services/firebase/powerBiExport.js'
import DashboardPage from './DashboardPage.jsx'

export default function PowerBiPage({ reportUrl = import.meta.env.VITE_POWER_BI_REPORT_URL }) {
  const { hasPermission } = useAuth()
  const [exportState, setExportState] = useState({ loading: false, message: '', error: '' })
  const report = powerBiReportConfiguration(reportUrl)
  async function exportDataset() {
    setExportState({ loading: true, message: '', error: '' })
    try {
      const result = await buildMaintenancePowerBiCsv()
      downloadMaintenancePowerBiCsv(result.csv)
      setExportState({ loading: false, message: `${result.count.toLocaleString('es-GT')} registros exportados sin credenciales ni datos de sesión.`, error: '' })
    } catch {
      setExportState({ loading: false, message: '', error: 'No fue posible exportar el dataset. Revisa la conexión y los permisos.' })
    }
  }
  return <section className="page-stack management-report-page">
    <div className="page-heading"><div><p className="eyebrow">Análisis gerencial</p><h1>Reporte consolidado</h1><p>Resumen interno de operación y mantenimiento. Power BI complementa este reporte, pero no es necesario para consultar los indicadores de CeroFallas.</p></div><div className="heading-actions">{hasPermission('analytics.export') && <button className="button button--primary print-hidden" type="button" disabled={exportState.loading} onClick={exportDataset}>{exportState.loading ? 'Preparando…' : 'Exportar para Power BI'}</button>}<button className="button button--secondary print-hidden" type="button" onClick={() => globalThis.print()}>Imprimir reporte</button><Link className="button button--secondary print-hidden" to="/">Volver al inicio</Link></div></div>
    {exportState.message ? <p className="form-success print-hidden" role="status">{exportState.message}</p> : null}
    {exportState.error ? <p className="form-error print-hidden" role="alert">{exportState.error}</p> : null}
    {report.state === 'ready' ? <section className="panel print-hidden"><div className="panel__heading"><div><p className="eyebrow">Power BI</p><h2>Reporte externo disponible</h2></div><span className="status-badge">Integrado</span></div><p>{report.accessMode === 'authenticated' ? 'El vínculo requiere la identidad y los permisos definidos por la organización.' : 'El vínculo está configurado como publicación pública. Confirma que no contenga información institucional restringida.'}</p><div className="form-actions"><a className="button button--primary" href={report.url} target="_blank" rel="noopener noreferrer">Abrir reporte en una pestaña nueva</a></div></section> : report.state === 'invalid' ? <section className="panel integration-status print-hidden"><div><p className="eyebrow">Power BI</p><strong>El enlace externo configurado no es válido</strong><p className="muted-copy">Por seguridad solo se aceptan enlaces HTTPS oficiales de Power BI.</p></div><span className="status-badge">Revisar configuración</span></section> : null}
    <div className="management-report-content"><DashboardPage /></div>
    {hasPermission('prediction.read') && <section className="panel print-hidden"><div className="panel__heading"><div><p className="eyebrow">Inteligencia artificial</p><h2>Laboratorio de riesgo predictivo</h2></div><span className="status-badge">Demostrativo</span></div><p className="muted-copy">Consulta la comparación reproducible de dos modelos y los requisitos pendientes para convertirla en un piloto con datos reales.</p><div className="form-actions"><Link className="button button--primary" to="/riesgo">Abrir IA predictiva</Link></div></section>}
    <aside className="panel" role="note"><p className="eyebrow">Separación de responsabilidades</p><strong>La aplicación registra la operación; el reporte consolida el análisis.</strong><p className="muted-copy">Las credenciales de SAP y del reporte no se guardan en el navegador. Una falla del servicio analítico no bloquea correctivos, preventivos, incidentes o checklist.</p></aside>
  </section>
}

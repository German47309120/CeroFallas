import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { countMetric, dashboardMetrics } from '../services/firebase/reporting.js'

export default function DashboardPage() {
  const { hasPermission, profile } = useAuth()
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(false)
  const [revision, setRevision] = useState(0)
  const canRead = hasPermission('dashboard.read')
  const permitted = dashboardMetrics.filter((m) => hasPermission(m.permission))
  const key = permitted.map((m) => m.key).join(',')
  useEffect(() => {
    if (!canRead) return
    let alive = true
    setValues({}); setLoading(true)
    Promise.all(permitted.map(async (m) => {
      try { return [m.key, { value: await countMetric(m) }] }
      catch { return [m.key, { error: 'No disponible: revisa conexión o permisos.' }] }
    })).then((result) => { if (alive) { setValues(Object.fromEntries(result)); setLoading(false) } })
    return () => { alive = false }
  }, [canRead, key, revision])
  return <section className="page-stack"><div className="page-heading"><div><p className="eyebrow">Resumen operativo</p><h1>Bienvenido, {profile?.displayName}</h1><p>{canRead ? 'Conteos de toda la base operacional, según tus permisos. Los anulados no se incluyen.' : 'Selecciona una operación autorizada en el menú.'}</p></div>{canRead && <button disabled={loading} className="button button--secondary" onClick={() => setRevision(revision + 1)}>Actualizar</button>}</div>
    {canRead && <><div className="stats-grid">{dashboardMetrics.map((m) => <article key={m.key} className="stat-card stat-card--brand"><p>{m.label}</p><strong>{loading ? '…' : values[m.key]?.value ?? '—'}</strong><span>{!hasPermission(m.permission) ? 'Sin permiso de lectura de la fuente' : values[m.key]?.error || 'Conteo acumulado · no es un período mensual'}</span></article>)}</div><div className="panel"><h2>Cómo interpretar los indicadores</h2><p>Un plan activo no equivale a una tarea pendiente: puede tener varias ejecuciones. Por eso todavía no se presenta un porcentaje de cumplimiento global.</p><p>MTBF y OEE no se calculan sin tiempos de operación, producción y calidad. Un guion significa falta de permiso o datos no disponibles, nunca cero.</p></div></>}
    <div className="panel"><h2>Accesos rápidos</h2><div className="form-actions">{hasPermission('corrective.create') && <Link className="button button--primary" to="/correctivos/nuevo">Registrar correctivo</Link>}{hasPermission('incident.create') && <Link className="button button--secondary" to="/incidentes/nuevo">Reportar incidente</Link>}{hasPermission('forklift.inspect') && <Link className="button button--secondary" to="/montacargas/nuevo">Inspeccionar montacargas</Link>}{hasPermission('incident.read') && <Link to="/incidentes">Consultar incidentes</Link>}</div></div>
  </section>
}

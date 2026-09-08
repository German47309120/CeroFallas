import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { loadDashboardSource } from '../services/firebase/dashboard.js'
import { dashboardDate, dashboardSources, dashboardWindow, OPEN_INCIDENT_STATES } from '../utils/dashboard.js'
import { incidentPriorities, incidentStates } from '../utils/incidents.js'
import { areas, getAreaName } from '../config/catalogs.js'

const formatAverageMinutes = (minutes) => Number.isFinite(minutes)
  ? minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`
  : '—'

function PlanList({ rows }) {
  return <ul className="dashboard-list">{rows.map((plan) => <li key={plan.id}>
    <div><strong>{plan.activityName}</strong><span>{plan.equipmentSnapshot?.code} · {plan.equipmentSnapshot?.name}</span></div>
    <time>{dashboardDate(plan.nextDueAt)}</time>
  </li>)}</ul>
}

export function ActivityTrend({ loading = false, trend, message, periodDays = 30 }) {
  const trendData = trend?.data
  if (loading || !trendData) return <p className="dashboard-notice" role="status">{message || 'Preparando tendencia…'}</p>

  const buckets = Array.isArray(trendData.buckets) ? trendData.buckets : []
  const max = Number.isFinite(trendData.max) && trendData.max > 0 ? trendData.max : 1
  return <div className="trend-chart" role="img" aria-label={`Comparación de mantenimientos en los últimos ${periodDays} días`}>{buckets.map((bucket) => <div className="trend-group" key={bucket.label}><div className="trend-bars"><span className="trend-bar trend-bar--corrective" style={{ height: `${Math.max(bucket.correctives ? 12 : 0, bucket.correctives / max * 100)}%` }} title={`${bucket.correctives} correctivos`}><b>{bucket.correctives || ''}</b></span><span className="trend-bar trend-bar--preventive" style={{ height: `${Math.max(bucket.executions ? 12 : 0, bucket.executions / max * 100)}%` }} title={`${bucket.executions} preventivos`}><b>{bucket.executions || ''}</b></span></div><small>{bucket.label}</small></div>)}</div>
}

export default function DashboardPage() {
  const { hasPermission, profile, user } = useAuth()
  const [request, setRequest] = useState(() => new Date())
  const [periodDays, setPeriodDays] = useState(30)
  const [areaId, setAreaId] = useState('')
  const [result, setResult] = useState(null)
  const sources = dashboardSources(hasPermission)
  const sourceKey = sources.join(',')
  const trendEnabled = sources.some((key) => ['correctives', 'executions'].includes(key))
  const identity = `${user?.uid || ''}:${sourceKey}:${periodDays}:${areaId}`
  const canRead = hasPermission('dashboard.read')
  // Oculta resultados antiguos al cambiar usuario, permisos o fecha de corte.
  const current = result?.identity === identity && result?.request === request ? result.values : null
  const loading = canRead && sources.length > 0 && !current
  useEffect(() => {
    if (!sourceKey) return
    let alive = true
    const requestedSources = [...sourceKey.split(','), ...(trendEnabled ? ['trend'] : [])]
    Promise.all(requestedSources.map(async (key) => {
      try { return [key, { data: await loadDashboardSource(key, request, { periodDays, areaId, activitySources: sourceKey.split(',') }) }] }
      catch { return [key, { error: 'No disponible. Revisa conexión, permisos o índices de Firestore y vuelve a actualizar.' }] }
    })).then((values) => { if (alive) setResult({ identity, request, values: Object.fromEntries(values) }) })
    return () => { alive = false }
  }, [identity, sourceKey, request, trendEnabled, periodDays, areaId])

  const data = (key) => current?.[key]?.data
  const message = (key) => !sources.includes(key) ? 'Tu perfil no tiene acceso a esta fuente.' : loading ? 'Consultando registros…' : current?.[key]?.error
  const metric = (key, field) => message(key) ? '—' : data(key)?.[field] ?? '—'
  const trendMessage = !trendEnabled ? 'Tu perfil no tiene acceso a fuentes de actividad.' : loading ? 'Consultando registros…' : current?.trend?.error
  const summary = current?.trend?.data?.summary
  const areaLabel = areaId ? getAreaName(areaId) : 'Todas las áreas'
  const cards = [
    ['incidents', 'total', 'Incidentes abiertos', 'Reportados, revisados o en atención', 'danger'],
    ['plans', 'overdueCount', 'Planes con fecha vencida', 'Fecha programada anterior al corte', 'warning'],
    ['plans', 'upcomingCount', 'Próximos en 7 días', 'Planes activos dentro de la ventana', 'success'],
    ['correctives', 'total', 'Correctivos completados', `Últimos ${periodDays} días · excluye anulados`, 'brand'],
  ]
  return <section className="page-stack dashboard-page" aria-busy={loading}>
    <header className="dashboard-hero">
      <div><p className="eyebrow eyebrow--light">Operación y mantenimiento</p><h1>Centro de mantenimiento</h1><p>Hola, {profile?.displayName || 'equipo'}. {canRead ? 'Revisa prioridades y coordina el trabajo de planta.' : 'Tu trabajo mantiene la operación en marcha.'}</p></div>
      <div className="dashboard-hero__badge"><span>CEROFALLAS</span><strong>Prevenir · Atender · Mejorar</strong></div>
    </header>
    <div className="panel dashboard-actions"><div><h2>¿Qué necesitas registrar?</h2><p className="muted-copy">Accesos disponibles para tu perfil.</p></div><div className="heading-actions">
      {hasPermission('corrective.create') && <Link className="button button--primary" to="/correctivos/nuevo">Registrar correctivo</Link>}
      {hasPermission('preventive.execute') && <Link className="button button--secondary" to="/preventivos/ejecutar">Registrar preventivo</Link>}
      {hasPermission('incident.create') && <Link className="button button--secondary" to="/incidentes/nuevo">Reportar incidente</Link>}
      {hasPermission('forklift.inspect') && <Link className="button button--secondary" to="/montacargas/nuevo">Inspeccionar montacargas</Link>}
      <Link to="/perfil">Mi perfil</Link>
    </div></div>
    {canRead && <>
      <div className="dashboard-cutoff"><div><strong>Corte: {dashboardDate(request)}</strong><span>Hora de Guatemala · alcance: {areaLabel}</span></div><div className="dashboard-filters"><label>Área<select value={areaId} disabled={loading} onChange={(event) => setAreaId(event.target.value)}><option value="">Todas las áreas</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label><label>Período de actividad<select value={periodDays} disabled={loading} onChange={(event) => setPeriodDays(Number(event.target.value))}><option value="7">7 días</option><option value="30">30 días</option><option value="90">90 días</option></select></label><button disabled={loading} className="button button--secondary" onClick={() => setRequest(new Date())}>{loading ? 'Actualizando…' : 'Actualizar datos'}</button></div></div>
      <div className="stats-grid" aria-live="polite">{cards.map(([key, field, label, note, tone]) => <article key={field + key} className={`stat-card stat-card--${tone}`}><p>{label}</p><strong>{loading && sources.includes(key) ? '…' : metric(key, field)}</strong><span>{message(key) || note}</span></article>)}</div>
      <div className="insight-grid" aria-live="polite">
        <article className="panel insight-card"><p>Promedio de atención correctiva</p><strong>{trendMessage || !sources.includes('correctives') ? '—' : formatAverageMinutes(summary?.averageCorrectiveMinutes)}</strong><span>{trendMessage || (sources.includes('correctives') ? `Promedio de ${data('correctives')?.total ?? 0} correctivos completados del período` : 'Tu perfil no tiene acceso a correctivos.')}</span></article>
        <article className="panel insight-card"><p>Preventivos ejecutados a tiempo</p><strong>{trendMessage || !sources.includes('executions') || summary?.onTimePercent == null ? '—' : `${summary.onTimePercent} %`}</strong><span>{trendMessage || (sources.includes('executions') ? `${summary?.onTimePreventives ?? 0} de ${summary?.evaluatedPreventives ?? 0} ejecuciones evaluables` : 'Tu perfil no tiene acceso a preventivos.')}</span></article>
      </div>
      <div className="dashboard-columns">
        <article className="panel"><div className="panel__heading"><div><p className="eyebrow">Atención prioritaria</p><h2>Incidentes críticos y altos</h2></div>{hasPermission('incident.read') && <Link to="/incidentes">Ver todos</Link>}</div>
          {message('incidents') ? <p className="dashboard-notice" role="status">{message('incidents')}</p> : data('incidents')?.priorityRows.length ? <ul className="dashboard-list">{data('incidents').priorityRows.map((item) => <li key={item.id}><div><span className={`priority-tag priority-tag--${item.priority}`}>{incidentPriorities[item.priority]} · {incidentStates[item.status]}</span><strong>{item.description}</strong><span>{item.equipmentSnapshot?.code || 'Equipo sin identificar'} · {item.areaName}</span><small>{dashboardDate(item.createdAt)}</small></div></li>)}</ul> : <p className="dashboard-notice">No hay incidentes abiertos de prioridad alta o crítica.</p>}
          {!message('incidents') && <div className="incident-status-summary" aria-label="Incidentes abiertos por estado">{OPEN_INCIDENT_STATES.map((status) => <div key={status}><span>{incidentStates[status]}</span><strong>{data('incidents')?.statusCounts?.[status] ?? 0}</strong></div>)}</div>}
          <p className="dashboard-footnote">Hasta 5 críticos y 5 altos, los más antiguos primero dentro de cada prioridad. Los demás incidentes siguen incluidos en el conteo.</p>
        </article>
        <article className="panel"><div className="panel__heading"><div><p className="eyebrow">Revisión de programación</p><h2>Planes con fecha vencida</h2></div>{hasPermission('preventive.read') && <Link to="/preventivos">Ver planes</Link>}</div>
          {message('plans') ? <p className="dashboard-notice" role="status">{message('plans')}</p> : data('plans')?.overdueRows.length ? <PlanList rows={data('plans').overdueRows} /> : <p className="dashboard-notice">No hay planes activos con fecha anterior al corte.</p>}
          <p className="dashboard-footnote">Hasta 5 planes, los más antiguos primero. Los planes calendario se reprograman al completar una ejecución; los planes por horas o condición requieren revisión manual.</p>
        </article>
      </div>
      <article className="panel"><div className="panel__heading"><div><p className="eyebrow">Agenda preventiva</p><h2>Próximos 7 días</h2></div><span className="muted-copy">Hasta {dashboardDate(dashboardWindow(request).end)} (sin incluir)</span></div>
        {message('plans') ? <p className="dashboard-notice">{message('plans')}</p> : data('plans')?.upcomingRows.length ? <PlanList rows={data('plans').upcomingRows} /> : <p className="dashboard-notice">No hay planes programados en esta ventana.</p>}
        <p className="dashboard-footnote">Se muestran los primeros 5; el indicador cuenta todos los planes activos de la ventana. Frecuencias estimadas pendientes de validación técnica.</p>
      </article>
      {trendEnabled && <article className="panel dashboard-trend"><div className="panel__heading"><div><p className="eyebrow">Tendencia operacional</p><h2>Actividad de mantenimiento</h2></div><div className="trend-legend"><span><i className="trend-key trend-key--corrective" />Correctivos</span><span><i className="trend-key trend-key--preventive" />Preventivos</span></div></div>
        <ActivityTrend loading={loading} trend={current?.trend} message={trendMessage} periodDays={periodDays} />
        {!loading && current?.trend?.data?.areas?.rows.length ? <div className="area-breakdown"><div><p className="eyebrow">Distribución del período</p><h3>Correctivos por área</h3></div><div className="area-bars">{current.trend.data.areas.rows.map((area) => <div className="area-row" key={area.areaId}><span>{area.name}</span><div><i style={{ width: `${area.total / current.trend.data.areas.max * 100}%` }} /></div><strong>{area.total}</strong></div>)}</div></div> : null}
        <p className="dashboard-footnote">Agrupa registros completados por intervalos equivalentes del período. Describe actividad registrada; no representa cumplimiento, disponibilidad, OEE ni MTBF.</p>
      </article>}
      <aside className="panel dashboard-explainer"><div><p className="eyebrow">Actividad registrada · {areaLabel} · últimos {periodDays} días</p><h2>{metric('executions', 'total')} preventivos ejecutados</h2><p>{message('executions') || 'Ejecuciones completadas iniciadas dentro del período; no es un porcentaje de cumplimiento.'}</p></div><p>Lectura de registros, sin modificar información. El filtro de área se aplica a indicadores, agenda, incidentes y tendencia. El corte fija la ventana de fechas; las consultas no forman una instantánea transaccional. MTBF, OEE y datos SAP aún no se presentan.</p></aside>
    </>}
    {!canRead && <div className="panel"><h2>Tu espacio de trabajo</h2><p>Utiliza los accesos anteriores o el menú para realizar las operaciones de tu rol. Los indicadores gerenciales requieren autorización adicional.</p></div>}
  </section>
}

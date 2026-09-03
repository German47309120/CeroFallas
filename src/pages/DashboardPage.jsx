import { Link } from 'react-router-dom'

const stats = [
  { label: 'Correctivos', value: '—', detail: 'Sin datos conectados', tone: 'brand' },
  { label: 'Cumplimiento', value: '—', detail: 'Preventivos', tone: 'success' },
  { label: 'Pendientes', value: '—', detail: 'Por ejecutar', tone: 'warning' },
  { label: 'Atención', value: '—', detail: 'Equipos con alerta', tone: 'danger' },
]

export default function DashboardPage() {
  return (
    <section className="page-stack" aria-labelledby="dashboard-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Resumen operativo</p>
          <h1 id="dashboard-title">Buenos días</h1>
          <p>Supervisa mantenimiento, inspecciones e incidentes desde un solo lugar.</p>
        </div>
        <Link className="button button--primary" to="/correctivos/nuevo">
          Registrar correctivo
        </Link>
      </div>

      <div className="stats-grid" aria-label="Indicadores principales">
        {stats.map((stat) => (
          <article className={`stat-card stat-card--${stat.tone}`} key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <span>{stat.detail}</span>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="panel">
          <div className="panel__heading">
            <div>
              <p className="eyebrow">Últimos movimientos</p>
              <h2>Actividad reciente</h2>
            </div>
            <Link to="/correctivos">Ver históricos</Link>
          </div>
          <div className="empty-state empty-state--compact">
            <span className="empty-state__mark" aria-hidden="true">01</span>
            <h3>Aún no hay registros</h3>
            <p>La actividad aparecerá cuando conectemos la base de datos.</p>
          </div>
        </article>

        <article className="panel">
          <div className="panel__heading">
            <div>
              <p className="eyebrow">Prioridad</p>
              <h2>Alertas e incidentes</h2>
            </div>
            <Link to="/incidentes">Ver incidentes</Link>
          </div>
          <div className="empty-state empty-state--compact">
            <span className="empty-state__mark" aria-hidden="true">OK</span>
            <h3>Sin alertas conectadas</h3>
            <p>Este estado no representa la condición real de planta.</p>
          </div>
        </article>
      </div>
    </section>
  )
}

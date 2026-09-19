import { ganttWeeks, preventiveGantt } from '../utils/preventiveGantt.js'

export default function PreventiveGantt({ plans, reference = new Date() }) {
  const gantt = preventiveGantt(plans, reference)
  const weeks = ganttWeeks(gantt.start, gantt.horizonDays)
  return <section className="panel preventive-gantt" aria-labelledby="preventive-gantt-title">
    <div className="panel__heading"><div><p className="eyebrow">Programación visual</p><h2 id="preventive-gantt-title">Gantt de actividades pendientes</h2><p className="muted-copy">Planes activos desde hoy hasta el {gantt.end.toLocaleDateString('es-GT')}. Cada barra marca el día programado; la duración todavía no forma parte del plan.</p></div><span className="status-badge">{gantt.rows.length} visibles</span></div>
    {gantt.rows.length === 0 ? <div className="empty-state empty-state--compact"><p>No hay planes activos dentro de las próximas ocho semanas.</p></div> : <div className="gantt-scroll">
      <div className="gantt-grid gantt-grid--header"><strong>Actividad / equipo</strong><div className="gantt-weeks">{weeks.map((week) => <span key={week.key}>{week.label}</span>)}</div></div>
      {gantt.rows.map((plan) => <div className="gantt-grid gantt-row" key={plan.id}>
        <div className="gantt-label"><strong>{plan.activityName}</strong><span>{plan.equipmentSnapshot?.code || 'Sin código'} · {plan.due.toLocaleDateString('es-GT')}</span></div>
        <div className="gantt-track" aria-label={`${plan.activityName}: ${plan.due.toLocaleDateString('es-GT')}`}><span className={`gantt-bar ${plan.overdue ? 'gantt-bar--overdue' : ''}`} style={{ left: plan.left }}>{plan.overdue ? 'Vencido' : 'Programado'}</span></div>
      </div>)}
    </div>}
    {gantt.laterCount > 0 ? <p className="prediction-note">{gantt.laterCount} plan(es) activo(s) quedan fuera del horizonte y permanecen disponibles en el listado.</p> : null}
  </section>
}

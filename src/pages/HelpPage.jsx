import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'

const actions = [
  ['dashboard.read', '/', 'Revisar dashboard'],
  ['corrective.create', '/correctivos/nuevo', 'Registrar correctivo'],
  ['preventive.execute', '/preventivos/ejecutar', 'Registrar preventivo'],
  ['preventive.plan', '/preventivos/nuevo', 'Programar preventivo'],
  ['forklift.inspect', '/montacargas/nuevo', 'Completar checklist'],
  ['incident.create', '/incidentes/nuevo', 'Reportar incidente'],
  ['equipment.manage', '/equipos/nuevo', 'Registrar equipo'],
  ['stock.read', '/repuestos', 'Consultar repuestos'],
  ['users.read', '/admin/usuarios', 'Consultar usuarios'],
  ['audit.read', '/admin/auditoria', 'Revisar auditoría'],
]

const workflows = [
  { permissions: ['corrective.read', 'corrective.create'], title: 'Mantenimiento correctivo', steps: ['Identificar área y equipo.', 'Registrar inicio, finalización y trabajo realizado.', 'El sistema calcula duración y conserva auditoría.'] },
  { permissions: ['preventive.read', 'preventive.execute', 'preventive.plan'], title: 'Mantenimiento preventivo', steps: ['Consultar o seleccionar el plan.', 'Documentar fecha, tiempos y actividad ejecutada.', 'Revisar cumplimiento y próxima programación.'] },
  { permissions: ['forklift.read', 'forklift.inspect'], title: 'Checklist de montacargas', steps: ['Confirmar equipo, turno y horómetro.', 'Responder los 25 puntos y justificar anomalías.', 'No operar si existe una falla crítica.'] },
  { permissions: ['incident.read', 'incident.create'], title: 'Incidentes operativos', steps: ['Indicar área, equipo si se conoce y prioridad.', 'Describir el evento sin sustituir el protocolo de emergencia.', 'Jefaturas autorizadas registran el seguimiento.'] },
]

export default function HelpPage() {
  const { hasPermission, profile } = useAuth()
  const availableActions = actions.filter(([permission]) => hasPermission(permission))
  const availableWorkflows = workflows.filter(({ permissions }) => permissions.some(hasPermission))

  return <section className="page-stack help-page" aria-labelledby="help-title">
    <header className="dashboard-hero help-hero"><div><p className="eyebrow eyebrow--light">Guía integrada</p><h1 id="help-title">Cómo usar y presentar CeroFallas</h1><p>{profile?.displayName || 'Usuario'}, aquí encontrarás únicamente recorridos compatibles con tu perfil y una explicación breve del desarrollo.</p></div><div className="dashboard-hero__badge"><span>ROL ACTUAL</span><strong>{profile?.role || 'Perfil en revisión'}</strong></div></header>

    <section className="panel"><div className="panel__heading"><div><p className="eyebrow">Accesos rápidos</p><h2>Operaciones disponibles para tu rol</h2></div></div>{availableActions.length ? <div className="help-actions">{availableActions.map(([, to, label]) => <Link className="button button--secondary" to={to} key={`${to}-${label}`}>{label}</Link>)}</div> : <p className="muted-copy">Tu perfil no posee operaciones adicionales; puedes consultar Mi perfil para revisar su alcance.</p>}</section>

    <div className="help-grid">{availableWorkflows.map((workflow) => <article className="panel help-card" key={workflow.title}><p className="eyebrow">Flujo operativo</p><h2>{workflow.title}</h2><ol>{workflow.steps.map((step) => <li key={step}>{step}</li>)}</ol></article>)}</div>

    <section className="panel"><div className="panel__heading"><div><p className="eyebrow">Desarrollo</p><h2>Cómo funciona técnicamente</h2></div></div><div className="architecture-steps"><div><span>1</span><strong>React responsive</strong><p>Presenta formularios, históricos y dashboard desde computadora, tableta o teléfono.</p></div><div><span>2</span><strong>Firebase Authentication</strong><p>Identifica al usuario y carga el rol institucional asignado.</p></div><div><span>3</span><strong>Firestore y reglas</strong><p>Guardan registros y vuelven a comprobar cada permiso en el backend.</p></div><div><span>4</span><strong>Integraciones desacopladas</strong><p>SAP, Power BI y predicción se conectan mediante servicios; las credenciales nunca van en el navegador.</p></div></div></section>

    <section className="panel help-defense"><div><p className="eyebrow">Ruta sugerida para la defensa</p><h2>Demostración en cinco minutos</h2></div><ol><li>Inicia sesión y explica que el menú cambia según el rol.</li><li>Muestra los indicadores y el filtro por área del dashboard.</li><li>Registra un mantenimiento o checklist y enseña su histórico.</li><li>Abre Auditoría para demostrar trazabilidad sin eliminación física.</li><li>Cierra con Riesgo predictivo, aclarando que utiliza datos sintéticos hasta validar el histórico real.</li></ol></section>

    <aside className="prediction-warning" role="note"><strong>Importante para la presentación:</strong> los registros actuales son demostrativos. Equipos, frecuencias, stock SAP y resultados predictivos deben identificarse como provisionales hasta validar las fuentes reales de planta.</aside>
  </section>
}

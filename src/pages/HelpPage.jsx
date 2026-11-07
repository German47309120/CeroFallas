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
  { permissions: ['corrective.read', 'corrective.create'], title: 'Mantenimiento correctivo', steps: ['Identificar OT, área, equipo y síntoma.', 'Iniciar la atención.', 'Finalizar y documentar el trabajo realizado.'] },
  { permissions: ['preventive.read', 'preventive.execute', 'preventive.plan'], title: 'Mantenimiento preventivo', steps: ['Seleccionar el plan o equipo.', 'Iniciar y finalizar la actividad.', 'Revisar cumplimiento y próxima programación.'] },
  { permissions: ['forklift.read', 'forklift.inspect'], title: 'Checklist de montacargas', steps: ['Confirmar equipo, turno y horómetro.', 'Responder los 25 puntos y justificar anomalías.', 'No operar si existe una falla crítica.'] },
  { permissions: ['incident.read', 'incident.create'], title: 'Incidentes operativos', steps: ['Indicar área, equipo si se conoce y prioridad.', 'Describir el evento sin sustituir el protocolo de emergencia.', 'Jefaturas autorizadas registran el seguimiento.'] },
]

export default function HelpPage() {
  const { hasPermission, profile } = useAuth()
  const availableActions = actions.filter(([permission]) => hasPermission(permission))
  const availableWorkflows = workflows.filter(({ permissions }) => permissions.some(hasPermission))

  return <section className="page-stack help-page" aria-labelledby="help-title">
    <header className="dashboard-hero help-hero"><div><p className="eyebrow eyebrow--light">Guía integrada</p><h1 id="help-title">Cómo usar CeroFallas</h1><p>{profile?.displayName || 'Usuario'}, aquí encontrarás los recorridos y accesos disponibles para tu perfil.</p></div><div className="dashboard-hero__badge"><span>ROL ACTUAL</span><strong>{profile?.role || 'Perfil en revisión'}</strong></div></header>

    <section className="panel"><div className="panel__heading"><div><p className="eyebrow">Accesos rápidos</p><h2>Operaciones disponibles para tu rol</h2></div></div>{availableActions.length ? <div className="help-actions">{availableActions.map(([, to, label]) => <Link className="button button--secondary" to={to} key={`${to}-${label}`}>{label}</Link>)}</div> : <p className="muted-copy">Tu perfil no posee operaciones adicionales; puedes consultar Mi perfil para revisar su alcance.</p>}</section>

    <div className="help-grid">{availableWorkflows.map((workflow) => <article className="panel help-card" key={workflow.title}><p className="eyebrow">Flujo operativo</p><h2>{workflow.title}</h2><ol>{workflow.steps.map((step) => <li key={step}>{step}</li>)}</ol></article>)}</div>

    <section className="panel"><div className="panel__heading"><div><p className="eyebrow">Funcionamiento</p><h2>Cómo protege y organiza la información</h2></div></div><div className="architecture-steps"><div><span>1</span><strong>Interfaz responsive</strong><p>Presenta formularios, históricos y dashboard desde computadora, tableta o teléfono.</p></div><div><span>2</span><strong>Servicio de identidad</strong><p>Identifica al usuario y carga el rol institucional asignado.</p></div><div><span>3</span><strong>Base central protegida</strong><p>Guarda registros y vuelve a comprobar cada permiso antes de aceptar una operación.</p></div><div><span>4</span><strong>Integraciones desacopladas</strong><p>SAP, Power BI y predicción se conectan mediante servicios; las credenciales nunca van en el navegador.</p></div></div></section>

    <section className="panel help-defense"><div><p className="eyebrow">Recorrido recomendado</p><h2>Conoce el sistema en cinco pasos</h2></div><ol><li>Revisa las opciones habilitadas para tu rol.</li><li>Consulta los indicadores y utiliza el filtro por área cuando esté disponible.</li><li>Registra la operación que te corresponde y confirma su aparición en el histórico.</li><li>Consulta los detalles del registro y su estado actual.</li><li>Cierra sesión al terminar para liberar el acceso del dispositivo.</li></ol></section>

    <aside className="prediction-warning" role="note"><strong>Datos de demostración:</strong> los registros identificados como simulados sirven para recorrer la aplicación y no deben utilizarse para tomar decisiones operativas.</aside>
  </section>
}

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { askMaintenanceAssistant, loadLocalAssistantSnapshot } from '../services/firebase/assistant.js'
import { emptyAssistantSnapshot, localAssistantAnswer, normalizeAssistantSnapshot, validateAssistantQuestion } from '../utils/maintenanceAssistant.js'

const suggestions = [
  'Dame un resumen ejecutivo de mantenimiento',
  '¿Qué debería atender primero esta semana?',
  '¿Cómo están los incidentes abiertos?',
  '¿Qué equipos aparecen con riesgo alto?',
]

const initialMessage = {
  role: 'assistant',
  content: 'Hola. Puedo explicar los indicadores actuales de CeroFallas, señalar prioridades y relacionar incidentes, mantenimientos y riesgo predictivo. No modifico registros ni sustituyo el criterio técnico.',
  mode: 'system',
}

const formatCutoff = (value) => {
  if (!value) return 'Cargando corte actual…'
  const date = new Date(value)
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Guatemala' }).format(date)
    : 'Corte no disponible'
}

export default function MaintenanceAssistantPage() {
  const { hasPermission } = useAuth()
  const permitted = hasPermission('dashboard.read')
  const [snapshot, setSnapshot] = useState(emptyAssistantSnapshot)
  const [messages, setMessages] = useState([initialMessage])
  const [question, setQuestion] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!permitted) return undefined
    let active = true
    loadLocalAssistantSnapshot()
      .then((data) => { if (active) setSnapshot(data) })
      .catch(() => { if (active) setError('No fue posible cargar todos los indicadores del corte actual.') })
      .finally(() => { if (active) setLoadingData(false) })
    return () => { active = false }
  }, [permitted])

  const lastMode = useMemo(() => [...messages].reverse().find((message) => message.mode && message.mode !== 'system')?.mode || 'ready', [messages])

  if (!permitted) return <section className="panel"><h1>Asistente de mantenimiento</h1><p>Tu perfil no tiene permiso para consultar análisis gerencial.</p></section>

  const submit = async (event, suggestedQuestion = '') => {
    event?.preventDefault()
    const value = (suggestedQuestion || question).trim()
    const validation = validateAssistantQuestion(value)
    if (validation) { setError(validation); return }
    const userMessage = { role: 'user', content: value }
    const history = messages.filter((item) => ['user', 'assistant'].includes(item.role) && item.mode !== 'system').slice(-6)
    setMessages((current) => [...current, userMessage])
    setQuestion('')
    setError('')
    setSending(true)
    try {
      const result = await askMaintenanceAssistant(value, history)
      if (result?.snapshot) setSnapshot(normalizeAssistantSnapshot(result.snapshot))
      setMessages((current) => [...current, { role: 'assistant', content: result.answer, mode: 'openai' }])
    } catch {
      setMessages((current) => [...current, { role: 'assistant', content: localAssistantAnswer(value, snapshot), mode: 'local' }])
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="page-stack assistant-page" aria-labelledby="assistant-title">
      <header className="assistant-hero">
        <div>
          <p className="eyebrow">Inteligencia aplicada · consulta de solo lectura</p>
          <h1 id="assistant-title">Asistente de mantenimiento</h1>
          <p>Consultá el estado de la operación con lenguaje natural y revisá, en el mismo lugar, los datos que respaldan cada análisis.</p>
        </div>
        <div className={`assistant-mode assistant-mode--${lastMode}`} role="status">
          <span>Motor de respuesta</span>
          <strong>{lastMode === 'openai' ? 'IA generativa conectada' : lastMode === 'local' ? 'Análisis interno activo' : 'Listo para consultar'}</strong>
        </div>
      </header>

      <div className="assistant-layout">
        <section className="panel assistant-chat" aria-label="Conversación con el asistente">
          <div className="assistant-messages" aria-live="polite">
            {messages.map((message, index) => (
              <article className={`assistant-message assistant-message--${message.role}`} key={`${message.role}-${index}`}>
                <span>{message.role === 'user' ? 'Gerencia' : 'Asistente CeroFallas'}</span>
                <p>{message.content}</p>
                {message.mode === 'local' ? <small>Respuesta de contingencia basada en reglas e indicadores del corte.</small> : null}
              </article>
            ))}
            {sending ? <article className="assistant-message assistant-message--assistant"><span>Asistente CeroFallas</span><p>Analizando el corte operativo…</p></article> : null}
          </div>

          <div className="assistant-suggestions" aria-label="Consultas sugeridas">
            {suggestions.map((item) => <button type="button" className="button button--ghost" disabled={sending} onClick={(event) => submit(event, item)} key={item}>{item}</button>)}
          </div>

          <form className="assistant-form" onSubmit={submit}>
            <label htmlFor="assistant-question">Escribí tu consulta</label>
            <div>
              <textarea id="assistant-question" value={question} maxLength={600} rows={3} onChange={(event) => setQuestion(event.target.value)} placeholder="Ejemplo: ¿Qué debería revisar primero y por qué?" disabled={sending} />
              <button className="button button--primary" type="submit" disabled={sending}>{sending ? 'Analizando…' : 'Consultar'}</button>
            </div>
            <small>{question.length}/600 · La consulta no crea ni modifica información.</small>
          </form>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
        </section>

        <aside className="assistant-data" aria-labelledby="assistant-data-title">
          <div className="panel assistant-data__heading">
            <p className="eyebrow">Evidencia del análisis</p>
            <h2 id="assistant-data-title">Datos utilizados</h2>
            <p>{formatCutoff(snapshot.generatedAt)}</p>
          </div>
          <div className="assistant-kpis" aria-busy={loadingData}>
            <article><span>Incidentes abiertos</span><strong>{snapshot.openIncidents}</strong></article>
            <article><span>Preventivos vencidos</span><strong>{snapshot.overduePlans}</strong></article>
            <article><span>Correctivos · 30 días</span><strong>{snapshot.completedCorrectives}</strong></article>
            <article><span>Preventivos · 30 días</span><strong>{snapshot.completedPreventives}</strong></article>
            <article><span>Riesgo alto</span><strong>{snapshot.highRiskEquipment}</strong></article>
            <article><span>Próximos en 7 días</span><strong>{snapshot.upcomingPlans}</strong></article>
          </div>
          <section className="panel assistant-evidence">
            <h3>Señales de riesgo visibles</h3>
            {snapshot.highRiskItems.length ? <ul>{snapshot.highRiskItems.map((item) => <li key={item.code}><strong>{item.code}</strong><span>{item.name || 'Equipo registrado'} · {Math.round(item.score * 100)} %</span></li>)}</ul> : <p>No hay señales de riesgo alto disponibles en este corte.</p>}
            <small>CeroFallas envía únicamente indicadores agregados y datos técnicos mínimos al motor de IA. No envía contraseñas ni perfiles de usuarios.</small>
          </section>
        </aside>
      </div>
    </section>
  )
}

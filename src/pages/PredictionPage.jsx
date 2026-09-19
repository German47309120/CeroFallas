import { predictiveLabSnapshot as lab } from '../config/predictiveLab.js'
import { useAuth } from '../features/auth/AuthContext.jsx'

const percent = (value) => `${value.toFixed(2)} %`

export default function PredictionPage() {
  const { hasPermission } = useAuth()
  if (!hasPermission('prediction.read')) {
    return <section className="panel"><h1>Riesgo predictivo</h1><p>Tu perfil no tiene permiso para consultar este laboratorio.</p></section>
  }

  return (
    <section className="page-stack prediction-page" aria-labelledby="prediction-title">
      <header className="prediction-hero">
        <div>
          <p className="eyebrow">Inteligencia artificial · preparación controlada</p>
          <h1 id="prediction-title">Riesgo predictivo con IA</h1>
          <p>Base técnica para anticipar qué equipos podrían presentar una falla durante los próximos 30 días.</p>
        </div>
        <div className="prediction-status" role="status">
          <span>Estado actual</span>
          <strong>Laboratorio demostrativo</strong>
        </div>
      </header>

      <aside className="prediction-warning" aria-label="Limitación del laboratorio">
        <strong>No es una predicción de planta.</strong>
        <span> Los resultados provienen únicamente de datos sintéticos y sirven para demostrar el proceso técnico de aprendizaje automático. No deben usarse para decidir mantenimientos hasta completar la validación con histórico real.</span>
      </aside>

      <div className="prediction-kpis" aria-label="Resumen del experimento">
        <article><span>Registros sintéticos</span><strong>{lab.dataset.rows.toLocaleString('es-GT')}</strong><small>{lab.dataset.trainingRows} entrenamiento · {lab.dataset.testRows} prueba</small></article>
        <article><span>Ventana objetivo</span><strong>30 días</strong><small>Falla siguiente: sí o no</small></article>
        <article><span>Casos positivos</span><strong>{percent(lab.dataset.targetRate)}</strong><small>Distribución del conjunto demostrativo</small></article>
      </div>

      <div className="prediction-layout">
        <section className="panel" aria-labelledby="model-comparison-title">
          <div className="panel__heading">
            <div>
              <p className="eyebrow">Evaluación temporal 80 / 20</p>
              <h2 id="model-comparison-title">Comparación de modelos</h2>
            </div>
            <span className="prediction-chip">Métrica principal: PR-AUC</span>
          </div>
          <div className="prediction-table-wrap">
            <table className="prediction-table">
              <thead><tr><th>Modelo</th><th>Propósito</th><th>PR-AUC</th><th>Recall</th><th>Resultado</th></tr></thead>
              <tbody>
                {lab.models.map((model) => (
                  <tr key={model.id}>
                    <th scope="row">{model.name}</th>
                    <td>{model.purpose}</td>
                    <td>{percent(model.prAuc)}</td>
                    <td>{percent(model.recall)}</td>
                    <td>{model.selected ? <span className="prediction-chip prediction-chip--selected">Candidato demo</span> : 'Referencia'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="prediction-note">El bosque aleatorio obtuvo el mayor PR-AUC en esta ejecución sintética. La diferencia es pequeña y no demuestra superioridad con datos reales.</p>
        </section>

        <section className="panel" aria-labelledby="readiness-title">
          <div className="panel__heading">
            <div>
              <p className="eyebrow">Preparación</p>
              <h2 id="readiness-title">Ruta hacia un piloto real</h2>
            </div>
            <strong className="readiness-count">2 de 4</strong>
          </div>
          <ol className="readiness-list">
            {lab.stages.map((stage) => (
              <li className={`readiness-step readiness-step--${stage.state}`} key={stage.label}>
                <span aria-hidden="true">{stage.state === 'complete' ? '✓' : '○'}</span>
                <div><strong>{stage.label}</strong><p>{stage.detail}</p></div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="panel prediction-next" aria-labelledby="required-data-title">
        <div>
          <p className="eyebrow">Siguiente habilitador</p>
          <h2 id="required-data-title">Qué necesitamos del histórico real</h2>
          <p>Por cada equipo y fecha de corte: horas de uso, antigüedad, atrasos preventivos, correctivos e incidentes recientes, duración de atención, días desde el último preventivo y fallos de inspección.</p>
        </div>
        <div className="prediction-guardrail">
          <span>Regla de gobierno</span>
          <strong>Datos autorizados, anonimizados y sin información posterior a la fecha evaluada.</strong>
        </div>
      </section>

      <footer className="prediction-trace">
        Ejecución reproducible del {lab.generatedOn} · Origen: {lab.dataset.origin} · Huella: {lab.dataset.fingerprint}…
      </footer>
    </section>
  )
}

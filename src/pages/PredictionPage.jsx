import { useEffect, useMemo, useState } from 'react'
import { predictiveLabSnapshot as lab } from '../config/predictiveLab.js'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { listRiskPredictions } from '../services/firebase/predictions.js'
import { getRiskPresentation, latestPredictionPerEquipment } from '../utils/predictions.js'

const percent = (value) => `${value.toFixed(2)} %`
const scorePercent = (value) => `${Math.round(Number(value) * 100)} %`
const predictionDate = (value) => {
  const date = value?.toDate instanceof Function ? value.toDate() : new Date(value)
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('es-GT', { timeZone: 'America/Guatemala', dateStyle: 'medium' }).format(date)
    : 'Fecha no disponible'
}

export default function PredictionPage() {
  const { hasPermission } = useAuth()
  const permitted = hasPermission('prediction.read')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [equipmentFilter, setEquipmentFilter] = useState('')

  useEffect(() => {
    if (!permitted) return undefined
    let active = true
    listRiskPredictions()
      .then((items) => { if (active) setRecords(items) })
      .catch(() => { if (active) setError('No fue posible consultar la simulación predictiva publicada.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [permitted])

  const equipmentOptions = useMemo(() => [...new Map(records.map((item) => [item.equipmentId, item.equipmentSnapshot])).entries()], [records])
  const visibleRecords = useMemo(() => equipmentFilter ? records.filter((item) => item.equipmentId === equipmentFilter) : records, [equipmentFilter, records])
  const latestRecords = useMemo(() => latestPredictionPerEquipment(records), [records])
  const latestHigh = latestRecords.filter((item) => item.riskLevel === 'high').length

  if (!permitted) {
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
          <strong>Simulación publicada</strong>
        </div>
      </header>

      <aside className="prediction-warning" role="note">
        <strong>No es una predicción de planta.</strong> Los registros publicados utilizan datos sintéticos de fechas diferentes para demostrar el histórico, los filtros y la interpretación del riesgo. No deben usarse para decidir mantenimientos.
      </aside>

      <div className="prediction-kpis" aria-label="Resumen del experimento">
        <article><span>Registros sintéticos</span><strong>{lab.dataset.rows.toLocaleString('es-GT')}</strong><small>{lab.dataset.trainingRows} entrenamiento · {lab.dataset.testRows} prueba</small></article>
        <article><span>Ventana objetivo</span><strong>30 días</strong><small>Falla siguiente: sí o no</small></article>
        <article><span>Casos positivos</span><strong>{percent(lab.dataset.targetRate)}</strong><small>Distribución del conjunto demostrativo</small></article>
      </div>

      <section className="panel prediction-simulation" aria-labelledby="simulation-title">
        <div className="panel__heading">
          <div>
            <p className="eyebrow">Base central · ambiente publicado</p>
            <h2 id="simulation-title">Histórico de riesgos simulados</h2>
            <p className="muted-copy">Cada resultado conserva equipo, fecha de corte, variables utilizadas, versión y explicación.</p>
          </div>
          <span className="status-badge">Demostración identificada</span>
        </div>

        {loading ? <p>Consultando simulación publicada…</p> : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        {!loading && !error ? (
          <>
            <div className="prediction-simulation-summary">
              <div><span>Registros publicados</span><strong>{records.length}</strong></div>
              <div><span>Equipos simulados</span><strong>{latestRecords.length}</strong></div>
              <div><span>Riesgo alto en último corte</span><strong>{latestHigh}</strong></div>
            </div>
            <label className="prediction-filter">
              <span>Filtrar histórico por equipo</span>
              <select value={equipmentFilter} onChange={(event) => setEquipmentFilter(event.target.value)}>
                <option value="">Todos los equipos</option>
                {equipmentOptions.map(([id, equipment]) => <option value={id} key={id}>{equipment.code} — {equipment.name}</option>)}
              </select>
            </label>
            {visibleRecords.length ? (
              <div className="prediction-table-wrap">
                <table className="prediction-table">
                  <thead><tr><th>Fecha de corte</th><th>Equipo</th><th>Nivel</th><th>Puntuación</th><th>Explicación</th><th>Versión</th></tr></thead>
                  <tbody>
                    {visibleRecords.map((record) => {
                      const risk = getRiskPresentation(record.riskLevel)
                      return (
                        <tr key={record.id}>
                          <td>{predictionDate(record.calculatedAt)}</td>
                          <th scope="row">{record.equipmentSnapshot?.code}<small>{record.equipmentSnapshot?.name}</small></th>
                          <td><span className={`risk-badge risk-badge--${risk.tone}`}>{risk.label}</span></td>
                          <td>{scorePercent(record.riskScore)}</td>
                          <td className="prediction-explanation">{record.explanation}</td>
                          <td>{record.methodVersion}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : <p>No existen resultados para el filtro seleccionado.</p>}
          </>
        ) : null}
      </section>

      <div className="prediction-layout">
        <section className="panel" aria-labelledby="model-comparison-title">
          <div className="panel__heading">
            <div><p className="eyebrow">Evaluación temporal 80 / 20</p><h2 id="model-comparison-title">Comparación de modelos</h2></div>
            <span className="prediction-chip">Métrica principal: PR-AUC</span>
          </div>
          <div className="prediction-table-wrap">
            <table className="prediction-table">
              <thead><tr><th>Modelo</th><th>Propósito</th><th>PR-AUC</th><th>Recall</th><th>Resultado</th></tr></thead>
              <tbody>
                {lab.models.map((model) => (
                  <tr key={model.id}>
                    <th scope="row">{model.name}</th><td>{model.purpose}</td><td>{percent(model.prAuc)}</td><td>{percent(model.recall)}</td>
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
            <div><p className="eyebrow">Preparación</p><h2 id="readiness-title">Ruta hacia un piloto real</h2></div>
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
          <p className="eyebrow">Siguiente habilitador</p><h2 id="required-data-title">Qué necesitamos del histórico real</h2>
          <p>Por cada equipo y fecha de corte: horas de uso, antigüedad, atrasos preventivos, correctivos e incidentes recientes, duración de atención, días desde el último preventivo y fallos de inspección.</p>
        </div>
        <div className="prediction-guardrail"><span>Regla de gobierno</span><strong>Datos autorizados, anonimizados y sin información posterior a la fecha evaluada.</strong></div>
      </section>

      <footer className="prediction-trace">
        No es una predicción de planta. No deben usarse para decidir mantenimientos · Ejecución reproducible del {lab.generatedOn} · Origen: {lab.dataset.origin} · Huella: {lab.dataset.fingerprint}…
      </footer>
    </section>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { resourceReaders } from '../services/firebase/history.js'
import { usePagedHistory } from '../features/usePagedHistory.js'
import HistoryControls from '../components/HistoryControls.jsx'
import { getForkliftResultPresentation } from '../utils/forklift.js'
import { voidForkliftInspection } from '../services/firebase/forkliftInspections.js'

export default function ForkliftInspectionsPage() {
  const { hasPermission, profileLoading, user } = useAuth()
  const [voiding, setVoiding] = useState(null)
  const [voidReason, setVoidReason] = useState('')
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)
  const canRead = hasPermission('forklift.read')
  const canManage = hasPermission('forklift.manage')
  const history = usePagedHistory({ enabled: canRead && !profileLoading, scope: user?.uid, status: 'all', readPage: resourceReaders.forkliftInspections })
  const { records: inspections, loading, error } = history
  async function confirmVoid(event) {
    event.preventDefault()
    setSaving(true)
    setActionError('')
    try {
      await voidForkliftInspection(voiding.id, voidReason, user.uid)
      setVoiding(null)
      setVoidReason('')
      await history.refresh()
    } catch (action) {
      setActionError(action?.code === 'permission-denied' ? 'Tu perfil no tiene permiso para anular esta inspección.' : action.message || 'No fue posible anular la inspección.')
    } finally {
      setSaving(false)
    }
  }
  if (profileLoading || loading) return <div className="panel empty-state"><p>Cargando inspecciones…</p></div>
  if (!canRead) return <section className="page-stack"><div className="page-heading"><div><p className="eyebrow">Inspección</p><h1>Checklist de montacargas</h1></div></div><div className="panel empty-state"><h2>Acceso restringido</h2><p>Tu perfil no tiene permiso para consultar inspecciones.</p></div></section>
  return <section className="page-stack" aria-labelledby="forklift-title"><div className="page-heading"><div><p className="eyebrow">Inspección diaria</p><h1 id="forklift-title">Checklist de montacargas</h1><p>Evalúa condición visual, niveles, operación y dispositivos de seguridad.</p></div>{hasPermission('forklift.inspect') ? <Link className="button button--primary" to="/montacargas/nuevo">Nueva inspección</Link> : null}</div>{error && <p className="form-error" role="alert">{error}</p>}{actionError && <p className="form-error" role="alert">{actionError}</p>}{inspections.length === 0 && !error ? <div className="panel empty-state"><span className="empty-state__mark">CF</span><h2>Sin inspecciones</h2><p>El historial aparecerá después de completar el primer checklist.</p></div> : <div className="records-list">{inspections.map((inspection) => { const presentation = getForkliftResultPresentation(inspection.overallResult); return <article className={`panel record-card ${inspection.status === 'voided' ? 'record-card--voided' : ''}`} key={inspection.id}><div><p className="eyebrow">{inspection.equipmentSnapshot.code}</p><h2>{inspection.equipmentSnapshot.name}</h2><p>{inspection.inspectedAt.toDate().toLocaleString('es-GT')}</p>{inspection.voidReason && <p><strong>Motivo de anulación:</strong> {inspection.voidReason}</p>}</div><dl><div><dt>Horómetro</dt><dd>{inspection.hourMeter}</dd></div><div><dt>Turno</dt><dd>{inspection.shiftId === 'shift-1' ? 'Turno 1' : 'Turno 2'}</dd></div><div><dt>Fallas críticas</dt><dd>{inspection.criticalFailures}</dd></div><div><dt>Resultado</dt><dd><span className={`status-badge result-badge--${presentation.tone}`}>{presentation.label}</span></dd></div><div><dt>Estado</dt><dd>{inspection.status === 'voided' ? 'Anulada' : 'Completada'}</dd></div></dl>{canManage && inspection.status !== 'voided' ? <button className="button button--secondary" type="button" onClick={() => { setVoiding(inspection); setVoidReason(''); setActionError('') }}>Anular inspección</button> : null}</article> })}</div>}{voiding && <form className="panel data-form" onSubmit={confirmVoid}><div><p className="eyebrow">CONTROL DEL REGISTRO</p><h2>Anular inspección</h2><p>Las respuestas originales permanecerán en el histórico. Esta acción quedará registrada en auditoría.</p></div><label>Motivo de anulación *<textarea required minLength="10" maxLength="500" rows="4" value={voidReason} onChange={(event) => setVoidReason(event.target.value)} /></label><div className="form-actions"><button className="button button--secondary" type="button" disabled={saving} onClick={() => { setVoiding(null); setVoidReason(''); setActionError('') }}>Cancelar</button><button className="button button--primary" disabled={saving}>{saving ? 'Anulando…' : 'Confirmar anulación'}</button></div></form>}<HistoryControls history={history} /></section>
}

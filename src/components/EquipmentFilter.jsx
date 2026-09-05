import { useEffect, useState } from 'react'
import { listEquipment } from '../services/firebase/equipment.js'

export default function EquipmentFilter({ allowed, value, onChange }) {
  const [state, setState] = useState({ records: [], loading: allowed, error: '' })
  useEffect(() => {
    let alive = true
    if (!allowed) { setState({ records: [], loading: false, error: '' }); return () => { alive = false } }
    setState({ records: [], loading: true, error: '' })
    listEquipment().then((records) => { if (alive) setState({ records, loading: false, error: '' }) }).catch(() => { if (alive) setState({ records: [], loading: false, error: 'No se pudo cargar el catálogo para filtrar.' }) })
    return () => { alive = false }
  }, [allowed])
  return <label><span>Equipo</span><select value={value} disabled={!allowed || state.loading || Boolean(state.error)} onChange={(event) => onChange(event.target.value)}><option value="">{!allowed ? 'Sin permiso de catálogo' : state.loading ? 'Cargando…' : state.error || 'Todos'}</option>{state.records.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select></label>
}

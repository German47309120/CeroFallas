import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export function usePagedHistory({ enabled, scope, status, options = {}, readPage }) {
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState(null)
  const generation = useRef(0)
  const busy = useRef(false)
  const optionsKey = JSON.stringify(options)
  const stableOptions = useMemo(() => JSON.parse(optionsKey), [optionsKey])
  const key = JSON.stringify([enabled, scope, status, optionsKey, revision])
  const current = state?.key === key ? state : null

  useEffect(() => {
    const token = ++generation.current
    busy.current = false
    if (!enabled) return
    busy.current = true
    readPage({ status, ...stableOptions }).then((page) => {
      if (generation.current === token) setState({ ...page, key, error: '', loadingMore: false })
    }).catch(() => {
      if (generation.current === token) setState({ key, records: [], cursor: null, hasMore: false, error: 'No fue posible cargar el histórico. Revisa conexión y permisos; puedes reintentar con Actualizar.', loadingMore: false })
    }).finally(() => { if (generation.current === token) busy.current = false })
    // El contador invalida respuestas asíncronas de una consulta anterior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { generation.current++ }
  }, [enabled, key, status, stableOptions, readPage])

  async function loadMore() {
    if (!enabled || !current?.hasMore || busy.current) return
    const token = generation.current
    busy.current = true
    setState((old) => ({ ...old, loadingMore: true, error: '' }))
    try {
      const page = await readPage({ status, ...stableOptions, cursor: current.cursor })
      if (generation.current !== token) return
      // Evita duplicados si un registro cambia de posición entre dos lecturas.
      const combined = new Map(current.records.map((record) => [record.id, record]))
      for (const record of page.records) combined.set(record.id, record)
      setState({ ...page, records: [...combined.values()], key, error: '', loadingMore: false })
    } catch {
      if (generation.current === token) setState((old) => ({ ...old, loadingMore: false, error: 'No fue posible cargar más registros. Lo ya cargado se conserva; puedes reintentar.' }))
    } finally { if (generation.current === token) busy.current = false }
  }
  const refresh = useCallback(() => setRevision((value) => value + 1), [])
  return { records: current?.records ?? [], loading: enabled && !current, loadingMore: current?.loadingMore ?? false, hasMore: current?.hasMore ?? false, error: current?.error ?? '', loadMore, refresh }
}

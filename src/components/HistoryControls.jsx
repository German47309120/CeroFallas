export default function HistoryControls({ history, visibleCount = history.records.length, label = 'Histórico' }) {
  return <div className="panel section-heading-row" role="group" aria-label={`Paginación: ${label}`}>
    <p role="status">{history.records.length} cargados · {visibleCount} coincidencias{!history.loading && !history.error && !history.hasMore ? ' · Fin de resultados' : ''}</p>
    <div className="heading-actions"><button type="button" className="button button--secondary" disabled={history.loading || history.loadingMore} onClick={history.refresh}>Actualizar</button>
      {history.hasMore && <button type="button" className="button button--primary" disabled={history.loading || history.loadingMore} onClick={history.loadMore}>{history.loadingMore ? 'Cargando…' : 'Cargar más'}</button>}
    </div>
  </div>
}

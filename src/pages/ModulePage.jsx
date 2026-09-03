import { Link } from 'react-router-dom'

export default function ModulePage({ eyebrow, title, description, action, actionTo }) {
  return (
    <section className="page-stack" aria-labelledby="module-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="module-title">{title}</h1>
          <p>{description}</p>
        </div>
        {action && actionTo ? (
          <Link className="button button--primary" to={actionTo}>{action}</Link>
        ) : action ? (
          <button className="button button--primary" type="button" disabled>{action}</button>
        ) : null}
      </div>

      <div className="filter-bar" aria-label={`Filtros de ${title}`}>
        <label>
          <span>Buscar</span>
          <input type="search" placeholder="Código, equipo o descripción" disabled />
        </label>
        <label>
          <span>Estado</span>
          <select disabled defaultValue="all">
            <option value="all">Todos</option>
          </select>
        </label>
        <button className="button button--secondary" type="button" disabled>Limpiar</button>
      </div>

      <div className="panel empty-state">
        <span className="empty-state__mark" aria-hidden="true">CF</span>
        <h2>Módulo preparado</h2>
        <p>Los datos, permisos y operaciones se conectarán durante la implementación de {title.toLowerCase()}.</p>
      </div>
    </section>
  )
}

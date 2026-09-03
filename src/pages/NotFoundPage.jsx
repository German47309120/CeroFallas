import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <span className="brand__mark" aria-hidden="true">404</span>
      <h1>Página no encontrada</h1>
      <p>La dirección no corresponde a una pantalla de CeroFallas.</p>
      <Link className="button button--primary" to="/">Volver al inicio</Link>
    </main>
  )
}

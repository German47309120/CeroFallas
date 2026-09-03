import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-intro">
        <div className="brand brand--large">
          <span className="brand__mark" aria-hidden="true">CF</span>
          <div>
            <strong>CeroFallas</strong>
            <small>Gestión de mantenimiento industrial</small>
          </div>
        </div>
        <div>
          <p className="eyebrow eyebrow--light">Operación conectada</p>
          <h1>Información clara para actuar antes y después de cada falla.</h1>
          <p>Correctivos, preventivos, inspecciones e indicadores en una sola aplicación.</p>
        </div>
        <small>Prototipo local · No ingresar datos reales</small>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-card">
          <p className="eyebrow">Acceso seguro</p>
          <h2 id="login-title">Iniciar sesión</h2>
          <p>La autenticación se conectará a Firebase en una fase posterior.</p>

          <form onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" autoComplete="username" disabled />

            <label htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" autoComplete="current-password" disabled />

            <button className="button button--primary button--full" type="submit" disabled>
              Iniciar sesión
            </button>
          </form>

          <Link className="demo-link" to="/">
            Entrar al prototipo demostrativo
          </Link>
        </div>
      </section>
    </main>
  )
}

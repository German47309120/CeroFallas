import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { postLoginDestination } from '../config/access.js'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { getAuthErrorMessage, loginWithEmail } from '../services/firebase/auth.js'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { configured, configurationError, environment, loading, sessionError, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setError('')
  }, [email, password])

  if (!loading && user) {
    return <Navigate to={postLoginDestination()} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (configured === false) {
      setError(configurationError || 'El servicio de acceso no está configurado para este ambiente.')
      return
    }

    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.')
      return
    }

    setSubmitting(true)

    try {
      await loginWithEmail(email, password)
      navigate(postLoginDestination(), { replace: true })
    } catch (authError) {
      setError(getAuthErrorMessage(authError))
    } finally {
      setSubmitting(false)
    }
  }

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
          <h1>Cuida tus equipos. Fortalece tu operación.</h1>
          <p>Coordina el mantenimiento, atiende incidentes y acompaña el trabajo de tu equipo desde un solo lugar.</p>
        </div>
        <small>
          {environment === 'emulator'
            ? 'Entorno de pruebas · Utiliza solo cuentas de prueba'
            : 'Acceso seguro para personal autorizado'}
        </small>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-card">
          <p className="eyebrow">Acceso seguro</p>
          <h2 id="login-title">Iniciar sesión</h2>
          <p>
            {environment === 'emulator'
              ? 'Entorno local aislado. No utilices contraseñas reales.'
              : 'Utiliza la cuenta autorizada por el administrador.'}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
              required
            />

            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submitting}
              required
            />

            {configured === false ? (
              <div className="form-error" role="alert">
                El servicio de acceso todavía no está configurado para este ambiente. Contacta al administrador de la aplicación.
              </div>
            ) : null}
            {sessionError && !error ? <div className="form-error" role="alert">{sessionError}</div> : null}
            {error ? <div className="form-error" role="alert">{error}</div> : null}

            <button className="button button--primary button--full" type="submit" disabled={configured === false || submitting || loading}>
              {submitting ? 'Comprobando…' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

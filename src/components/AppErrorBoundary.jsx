import { Component } from 'react'

export default class AppErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="fatal-error" role="alert">
        <span className="brand__mark" aria-hidden="true">CF</span>
        <p className="eyebrow">Recuperación segura</p>
        <h1>No fue posible mostrar esta pantalla</h1>
        <p>Ocurrió un error inesperado en la interfaz. No se confirmó ninguna operación adicional ni se modificaron datos desde esta pantalla.</p>
        <div className="heading-actions">
          <button className="button button--primary" type="button" onClick={() => window.location.reload()}>Volver a intentar</button>
          <a className="button button--secondary" href="/">Ir al inicio</a>
        </div>
        <small>Si el problema continúa, informa al Administrador o al Técnico de soporte indicando qué módulo estabas utilizando.</small>
      </main>
    )
  }
}

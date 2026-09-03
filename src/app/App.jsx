import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import ModulePage from '../pages/ModulePage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import EquipmentFormPage from '../pages/EquipmentFormPage.jsx'
import EquipmentPage from '../pages/EquipmentPage.jsx'
import { moduleContent } from '../config/navigation.js'
import ProtectedRoute from '../features/auth/ProtectedRoute.jsx'

function ModuleRoutes() {
  return Object.entries(moduleContent).filter(([path]) => path !== '/equipos').map(([path, content]) => (
    <Route key={path} path={path} element={<ModulePage {...content} />} />
  ))
}

function PlaceholderForm({ title }) {
  return (
    <section className="page-stack" aria-labelledby="placeholder-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Formulario en preparación</p>
          <h1 id="placeholder-title">{title}</h1>
          <p>La estructura visual está lista; los campos y la persistencia se activarán en su fase.</p>
        </div>
      </div>
      <div className="panel empty-state">
        <span className="empty-state__mark" aria-hidden="true">CF</span>
        <h2>Esqueleto navegable</h2>
        <p>Esta pantalla todavía no guarda datos. No ingreses información real.</p>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        {ModuleRoutes()}
        <Route path="/equipos" element={<EquipmentPage />} />
        <Route path="/equipos/nuevo" element={<EquipmentFormPage />} />
        <Route path="/equipos/:equipmentId/editar" element={<EquipmentFormPage />} />
        <Route path="/correctivos/nuevo" element={<PlaceholderForm title="Nuevo correctivo" />} />
        <Route path="/preventivos/nuevo" element={<PlaceholderForm title="Programar preventivo" />} />
        <Route path="/montacargas/nuevo" element={<PlaceholderForm title="Nueva inspección" />} />
        <Route path="/incidentes/nuevo" element={<PlaceholderForm title="Reportar incidente" />} />
        <Route path="/perfil" element={<PlaceholderForm title="Mi perfil" />} />
      </Route>
      <Route path="/inicio" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

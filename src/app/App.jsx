import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import ProtectedRoute from '../features/auth/ProtectedRoute.jsx'
const DashboardPage = lazy(() => import('../pages/DashboardPage.jsx'))
const LoginPage = lazy(() => import('../pages/LoginPage.jsx'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'))
const EquipmentFormPage = lazy(() => import('../pages/EquipmentFormPage.jsx'))
const EquipmentPage = lazy(() => import('../pages/EquipmentPage.jsx'))
const CorrectiveFormPage = lazy(() => import('../pages/CorrectiveFormPage.jsx'))
const CorrectivesPage = lazy(() => import('../pages/CorrectivesPage.jsx'))
const PreventiveExecutionFormPage = lazy(() => import('../pages/PreventiveExecutionFormPage.jsx'))
const PreventivePlanFormPage = lazy(() => import('../pages/PreventivePlanFormPage.jsx'))
const PreventivesPage = lazy(() => import('../pages/PreventivesPage.jsx'))
const ForkliftInspectionFormPage = lazy(() => import('../pages/ForkliftInspectionFormPage.jsx'))
const ForkliftInspectionsPage = lazy(() => import('../pages/ForkliftInspectionsPage.jsx'))
const IncidentsPage = lazy(() => import('../pages/IncidentsPage.jsx'))
const IncidentFormPage = lazy(() => import('../pages/IncidentFormPage.jsx'))
const ResourceReadPage = lazy(() => import('../pages/ResourceReadPage.jsx'))
const ProfilePage = lazy(() => import('../pages/ProfilePage.jsx'))
const PredictionPage = lazy(() => import('../pages/PredictionPage.jsx'))
const HelpPage = lazy(() => import('../pages/HelpPage.jsx'))

export default function App() {
  return (
    <Suspense fallback={<div className="auth-loading" role="status">Cargando pantalla…</div>}><Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="/correctivos" element={<CorrectivesPage />} />
        <Route path="/correctivos/nuevo" element={<CorrectiveFormPage />} />
        <Route path="/correctivos/:correctiveId/editar" element={<CorrectiveFormPage />} />
        <Route path="/equipos" element={<EquipmentPage />} />
        <Route path="/equipos/nuevo" element={<EquipmentFormPage />} />
        <Route path="/equipos/:equipmentId/editar" element={<EquipmentFormPage />} />
        <Route path="/preventivos" element={<PreventivesPage />} />
        <Route path="/preventivos/nuevo" element={<PreventivePlanFormPage />} />
        <Route path="/preventivos/:planId/editar" element={<PreventivePlanFormPage />} />
        <Route path="/preventivos/ejecutar" element={<PreventiveExecutionFormPage />} />
        <Route path="/montacargas" element={<ForkliftInspectionsPage />} />
        <Route path="/montacargas/nuevo" element={<ForkliftInspectionFormPage />} />
        <Route path="/incidentes" element={<IncidentsPage />} />
        <Route path="/incidentes/nuevo" element={<IncidentFormPage />} />
        <Route path="/admin/usuarios" element={<ResourceReadPage resource="users" />} />
        <Route path="/admin/auditoria" element={<ResourceReadPage resource="audit" />} />
        <Route path="/repuestos" element={<ResourceReadPage resource="stock" />} />
        <Route path="/riesgo" element={<PredictionPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/ayuda" element={<HelpPage />} />
      </Route>
      <Route path="/inicio" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes></Suspense>
  )
}

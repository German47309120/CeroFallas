import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import ModulePage from '../pages/ModulePage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import EquipmentFormPage from '../pages/EquipmentFormPage.jsx'
import EquipmentPage from '../pages/EquipmentPage.jsx'
import CorrectiveFormPage from '../pages/CorrectiveFormPage.jsx'
import CorrectivesPage from '../pages/CorrectivesPage.jsx'
import PreventiveExecutionFormPage from '../pages/PreventiveExecutionFormPage.jsx'
import PreventivePlanFormPage from '../pages/PreventivePlanFormPage.jsx'
import PreventivesPage from '../pages/PreventivesPage.jsx'
import ForkliftInspectionFormPage from '../pages/ForkliftInspectionFormPage.jsx'
import ForkliftInspectionsPage from '../pages/ForkliftInspectionsPage.jsx'
import { moduleContent } from '../config/navigation.js'
import ProtectedRoute from '../features/auth/ProtectedRoute.jsx'
import IncidentsPage from '../pages/IncidentsPage.jsx'
import IncidentFormPage from '../pages/IncidentFormPage.jsx'
import ResourceReadPage from '../pages/ResourceReadPage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'

function ModuleRoutes() {
  return Object.entries(moduleContent).filter(([path]) => !['/equipos', '/correctivos', '/preventivos', '/montacargas', '/incidentes', '/repuestos', '/admin/usuarios', '/admin/auditoria'].includes(path)).map(([path, content]) => (
    <Route key={path} path={path} element={<ModulePage {...content} />} />
  ))
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        {ModuleRoutes()}
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
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>
      <Route path="/inicio" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

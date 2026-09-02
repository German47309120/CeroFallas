import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PredictivoComponent } from './pages/predictivo/predictivo.component';
import { CorrectivosComponent } from './pages/correctivos/correctivos.component';
import { ConfiabilidadComponent } from './pages/confiabilidad/confiabilidad.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'predictivo', component: PredictivoComponent },
  { path: 'correctivos', component: CorrectivosComponent },
  { path: 'confiabilidad', component: ConfiabilidadComponent },
  { path: '**', redirectTo: 'dashboard' },
];

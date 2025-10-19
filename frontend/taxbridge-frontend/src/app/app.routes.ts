import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './auth/login/login';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'taxes', component: DashboardComponent }, // Placeholder
  { path: 'clients', component: DashboardComponent }, // Placeholder
  { path: 'reports', component: DashboardComponent }, // Placeholder
  { path: 'settings', component: DashboardComponent }, // Placeholder
  { path: 'help', component: DashboardComponent }, // Placeholder
  { path: '**', redirectTo: '' }
];

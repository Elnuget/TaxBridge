import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AuthComponent } from './auth/auth/auth';
import { CheckoutComponent } from './pages/checkout/checkout';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'login', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'pasarela', redirectTo: 'checkout', pathMatch: 'full' },
  { path: 'pago', redirectTo: 'checkout', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'taxes', component: DashboardComponent }, // Placeholder
  { path: 'clients', component: DashboardComponent }, // Placeholder
  { path: 'reports', component: DashboardComponent }, // Placeholder
  { path: 'settings', component: DashboardComponent }, // Placeholder
  { path: 'help', component: DashboardComponent }, // Placeholder
  { path: '**', redirectTo: '' }
];

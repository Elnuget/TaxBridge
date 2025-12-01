import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { CustomerDashboardComponent } from './pages/customer-dashboard/customer-dashboard';
import { AuthComponent } from './auth/auth/auth';
import { LoginComponent } from './auth/login/login';
import { CheckoutComponent } from './pages/checkout/checkout';
import { AboutComponent } from './pages/about/about';
import { ContactComponent } from './pages/contact/contact';
import { TestimonialsSliderComponent } from './pages/testimonials/testimonials';
import { authGuard } from './guards/auth.guard';
import { ClientsIndexComponent } from './pages/clients/clients-index';
import { ClientsCreateUserComponent } from './pages/clients/clients-create-user';
import { ClientsCreateCustomerComponent } from './pages/clients/clients-create-customer';
import { ClientsEditUserComponent } from './pages/clients/clients-edit-user';
import { ClientsEditCustomerComponent } from './pages/clients/clients-edit-customer';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'pasarela', redirectTo: 'checkout', pathMatch: 'full' },
  { path: 'pago', redirectTo: 'checkout', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: 'customer-dashboard', component: CustomerDashboardComponent, canActivate: [authGuard] },
  { path: 'taxes', component: DashboardComponent }, // Placeholder
  { path: 'clients', component: ClientsIndexComponent, canActivate: [authGuard] },
  { path: 'clients/create-user', component: ClientsCreateUserComponent, canActivate: [authGuard] },
  { path: 'clients/create-customer', component: ClientsCreateCustomerComponent, canActivate: [authGuard] },
  { path: 'clients/edit-user/:id', component: ClientsEditUserComponent, canActivate: [authGuard] },
  { path: 'clients/edit-customer/:customerNumber', component: ClientsEditCustomerComponent, canActivate: [authGuard] },
  { path: 'reports', component: DashboardComponent }, // Placeholder
  { path: 'settings', component: DashboardComponent }, // Placeholder
  { path: 'help', component: DashboardComponent }, // Placeholder
  { path: 'acerca-de-nosotros', component: AboutComponent, data: { title: 'Acerca de TaxBridge' } },
  { path: 'contacto', component: ContactComponent, data: { title: 'Contacto' }},
  { path: 'testimonios', component: TestimonialsSliderComponent, data: { title: 'Testimonios' }},
  { path: '**', redirectTo: '' }
];

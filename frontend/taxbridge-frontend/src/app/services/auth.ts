import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

interface LoginResponse {
  success: boolean;
  message?: string;
  type?: 'user' | 'customer';
  data?: any;
  token?: string;
}

interface CustomerSession {
  customerNumber: string;
  fullName: string;
  email: string;
  isTemporaryPassword: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // Signals para el estado de autenticación
  loggedIn = signal<boolean>(false);
  currentCustomer = signal<CustomerSession | null>(null);

  constructor() {
    this.checkSession();
  }

  private checkSession() {
    if (isPlatformBrowser(this.platformId)) {
      const session = localStorage.getItem('taxbridge_session');
      if (session) {
        try {
          const customerData = JSON.parse(session);
          this.currentCustomer.set(customerData);
          this.loggedIn.set(true);
        } catch (error) {
          console.error('Error al parsear sesión:', error);
          localStorage.removeItem('taxbridge_session');
        }
      }
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
          email,
          password
        })
      );

      if (response.success) {
        // Si es usuario (admin/contador), guardamos token y user info
        if (response.type === 'user') {
          if (isPlatformBrowser(this.platformId) && response.token) {
            localStorage.setItem('taxbridge_token', response.token);
            localStorage.setItem('taxbridge_user', JSON.stringify(response.data || {}));
          }
          this.loggedIn.set(true);
          // Redirigir según rol podría implementarse aquí
          this.router.navigate(['/admin-dashboard']);
          return;
        }

        // Si es customer, mantener compatibilidad con el dashboard actual
        if (response.type === 'customer' && response.data) {
          this.currentCustomer.set(response.data);
          this.loggedIn.set(true);

          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('taxbridge_session', JSON.stringify(response.data));
            localStorage.setItem('customerNumber', response.data.customerNumber);
            localStorage.setItem('customerEmail', response.data.email);
            if (response.token) localStorage.setItem('taxbridge_token', response.token);
          }

          this.router.navigate(['/customer-dashboard']);
          return;
        }

        throw new Error(response.message || 'Error en el login');
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (error: any) {
      // Loguear solo lo necesario (evitar imprimir todo el HttpErrorResponse en consola)
      const errorMessage = error?.error?.message || error?.message || 'Error desconocido';
      console.error('Error en login:', error?.status, errorMessage);

      if (error?.status === 401) {
        throw new Error(errorMessage);
      } else if (error?.status === 400) {
        throw new Error(error?.error?.message || 'Email y contraseña son requeridos');
      } else {
        throw new Error(error?.error?.message || 'Error al conectar con el servidor');
      }
    }
  }

  logout() {
    this.currentCustomer.set(null);
    this.loggedIn.set(false);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('taxbridge_session');
      localStorage.removeItem('customerNumber');
      localStorage.removeItem('customerEmail');
      localStorage.removeItem('temporaryPassword');
    }

    this.router.navigate(['/']);
  }

  getCustomerNumber(): string | null {
    return this.currentCustomer()?.customerNumber || null;
  }
}

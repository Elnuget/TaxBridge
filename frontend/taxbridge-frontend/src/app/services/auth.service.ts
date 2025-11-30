import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface LoginResponse {
  success: boolean;
  message?: string;
  type?: 'user' | 'customer';
  data?: {
    customerNumber: string;
    fullName: string;
    email: string;
    token?: string;
  };
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isLoggedIn = signal<boolean>(false);
  private currentUser = signal<any>(null);

  // Computed values
  loggedIn = computed(() => this.isLoggedIn());
  user = computed(() => this.currentUser());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Verificar si hay sesión guardada
    if (isPlatformBrowser(this.platformId)) {
      this.checkStoredSession();
    }
  }

  private checkStoredSession() {
    const customerNumber = localStorage.getItem('customerNumber');
    const customerEmail = localStorage.getItem('customerEmail');
    const customerName = localStorage.getItem('customerName');

    if (customerNumber && customerEmail) {
      this.isLoggedIn.set(true);
      this.currentUser.set({
        customerNumber,
        email: customerEmail,
        fullName: customerName || 'Cliente'
      });
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Si es customer, mantener la compatibilidad; si es user guardar token
          if (response.type === 'customer') {
            if (typeof window !== 'undefined') {
              // Remove any admin user data left in localStorage
              localStorage.removeItem('taxbridge_user');
            }
            this.setSession(response.data);
            this.router.navigate(['/customer-dashboard']);
          } else if (response.type === 'user') {
            if (typeof window !== 'undefined' && response.token) {
              localStorage.setItem('taxbridge_token', response.token);
              localStorage.setItem('taxbridge_user', JSON.stringify(response.data || {}));
            }
            // Remove any customer session leftover
            if (typeof window !== 'undefined') {
              localStorage.removeItem('taxbridge_session');
            }
            this.isLoggedIn.set(true);
            this.currentUser.set(response.data || null);
            this.router.navigate(['/admin-dashboard']);
          }
        }
      })
    );
  }

  private setSession(data: any) {
    if (isPlatformBrowser(this.platformId)) {
      // Ensure no admin user data remains
      localStorage.removeItem('taxbridge_user');
      localStorage.setItem('customerNumber', data.customerNumber);
      localStorage.setItem('customerEmail', data.email);
      localStorage.setItem('customerName', data.fullName);
      
      this.isLoggedIn.set(true);
      this.currentUser.set(data);
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('customerNumber');
      localStorage.removeItem('customerEmail');
      localStorage.removeItem('customerName');
      localStorage.removeItem('temporaryPassword');
    }
    
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getCustomerNumber(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('customerNumber');
    }
    return null;
  }
}

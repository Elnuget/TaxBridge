import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    customerNumber: string;
    fullName: string;
    email: string;
    token?: string;
  };
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
    return this.http.post<LoginResponse>(`${environment.apiUrl}/customers/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      })
    );
  }

  private setSession(data: any) {
    if (isPlatformBrowser(this.platformId)) {
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

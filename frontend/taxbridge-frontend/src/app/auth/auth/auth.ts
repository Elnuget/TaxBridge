import { Component, signal, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  FormDirective,
  ButtonDirective
} from '@coreui/angular';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    ButtonDirective
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.scss'
})
export class AuthComponent {
  activeTab = signal<'login' | 'register'>('login');

  // Login form
  loginEmail = '';
  loginPassword = '';
  loginError = '';
  loginLoading = false;

  private cdr = inject(ChangeDetectorRef);

  // Register form
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';

  constructor(private authService: AuthService) {}

  setActiveTab(tab: 'login' | 'register') {
    this.activeTab.set(tab);
    this.loginError = '';
  }

  async onLoginSubmit() {
    this.loginError = '';
    this.loginLoading = true;

    try {
      await this.authService.login(this.loginEmail, this.loginPassword);
      // El AuthService redirige automáticamente al dashboard
    } catch (error: any) {
      this.loginError = error.message || 'Error al iniciar sesión';
      console.error('Error en login:', error);
      this.cdr.detectChanges(); // Forzar actualización de la vista
    } finally {
      this.loginLoading = false;
      this.cdr.detectChanges();
    }
  }

  onRegisterSubmit() {
    console.log('Register:', {
      name: this.registerName,
      email: this.registerEmail,
      password: this.registerPassword
    });
    // Aquí iría la lógica real de registro
  }

  onGoogleAuth() {
    console.log('Autenticación con Google');
    // Aquí iría la lógica real de Google Auth
  }
}

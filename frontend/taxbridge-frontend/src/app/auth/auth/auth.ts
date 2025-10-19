import { Component, signal } from '@angular/core';
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
  FormControlDirective,
  ButtonDirective
} from '@coreui/angular';

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
    FormControlDirective,
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

  // Register form
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';

  setActiveTab(tab: 'login' | 'register') {
    this.activeTab.set(tab);
  }

  onLoginSubmit() {
    console.log('Login:', { email: this.loginEmail, password: this.loginPassword });
    // Aquí iría la lógica real de login
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

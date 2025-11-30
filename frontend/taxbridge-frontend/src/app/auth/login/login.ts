import { Component, ChangeDetectorRef, inject } from '@angular/core';
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
  selector: 'app-login',
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
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginEmail = '';
  loginPassword = '';
  loginError = '';
  loginLoading = false;

  private cdr = inject(ChangeDetectorRef);

  constructor(private authService: AuthService) {}

  async onLoginSubmit() {
    this.loginError = '';
    this.loginLoading = true;

    try {
      await this.authService.login(this.loginEmail, this.loginPassword);
      // La redirección se maneja automáticamente en AuthService
    } catch (error: any) {
      this.loginError = error.message || 'Error al iniciar sesión';
      console.error('Error en login:', error);
      this.cdr.detectChanges();
    } finally {
      this.loginLoading = false;
      this.cdr.detectChanges();
    }
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ButtonDirective,
  FormDirective
} from '@coreui/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-clients-create-user',
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
    CardHeaderComponent,
    ButtonDirective,
    FormDirective
  ],
  templateUrl: './clients-create-user.html'
})
export class ClientsCreateUserComponent {
  name = '';
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  private http = inject(HttpClient);
  private router = inject(Router);

  async onSubmit() {
    this.error = null;
    this.loading = true;

    try {
      const payload = {
        nombre: this.name,
        email: this.email,
        password: this.password,
        rol: 'user'
      };

      await this.http.post(`${environment.apiUrl}/users`, payload).toPromise();
      this.router.navigate(['/clients']);
    } catch (err: any) {
      console.error('Error creando usuario:', err);
      this.error = err?.error?.message || 'Error al crear usuario';
    } finally {
      this.loading = false;
    }
  }
}

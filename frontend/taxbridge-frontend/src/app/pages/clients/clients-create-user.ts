import { Component, inject, ChangeDetectorRef, NgZone, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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
  telefono = '';
  direccion = '';
  rol = 'contador';
  activo = true;
  loading = false;
  error: string | null = null;

  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private appRef = inject(ApplicationRef);

  async onSubmit() {
    if (this.loading) return;
    console.log('Submitting user form...');
    this.error = null;
    this.loading = true;

    try {
      const payload = {
        nombre: this.name,
        email: this.email,
        password: this.password,
        telefono: this.telefono,
        direccion: this.direccion,
        rol: this.rol,
        activo: this.activo
      };
      console.log('Payload:', payload);

      const response = await firstValueFrom(this.http.post(`${environment.apiUrl}/users`, payload));
      console.log('User created successfully:', response);
      this.router.navigate(['/clients']);
    } catch (err: any) {
      console.error('Error creando usuario:', err);
      const server = err?.error;
      let message = '';
      if (server?.message) {
        message = server.message;
      } else if (server?.errors) {
        if (Array.isArray(server.errors)) {
          message = server.errors.map((e: any) => e.msg || e.message || JSON.stringify(e)).join('; ');
        } else {
          message = Object.values(server.errors).map((v: any) => (v.msg || v.message || JSON.stringify(v))).join('; ');
        }
      } else {
        message = err?.message || 'Error al crear usuario';
      }
      this.zone.run(() => {
        this.error = message;
        this.cdr.detectChanges();
      });
      this.appRef.tick();
    } finally {
      this.zone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
      this.appRef.tick();
    }
  }
}

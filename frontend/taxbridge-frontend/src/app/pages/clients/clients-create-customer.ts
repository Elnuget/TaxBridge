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
  selector: 'app-clients-create-customer',
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
  templateUrl: './clients-create-customer.html'
})
export class ClientsCreateCustomerComponent {
  fullName = '';
  email = '';
  phone = '';
  identification = '';
  paymentMethod = 'cash';
  password = '';
  status = 'active';
  loading = false;
  error: string | null = null;

  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private appRef = inject(ApplicationRef);

  async onSubmit() {
    if (this.loading) return;
    console.log('Submitting customer form...');
    this.error = null;
    this.loading = true;

    try {
      const payload = {
        fullName: this.fullName,
        email: this.email,
        phone: this.phone,
        identification: this.identification,
        paymentMethod: this.paymentMethod,
        password: this.password,
        status: this.status
      };
      console.log('Payload:', payload);

      const response = await firstValueFrom(this.http.post(`${environment.apiUrl}/customers`, payload));
      console.log('Customer created successfully:', response);
      this.router.navigate(['/clients']);
    } catch (err: any) {
      console.error('Error creando cliente:', err);
      // Extraer mensaje del servidor, soportando distintos formatos
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
        message = err?.message || 'Error al crear cliente';
      }
      // Asegurar que la actualización ocurre dentro de Angular Zone
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

import { Component, OnInit, inject, ChangeDetectorRef, NgZone, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
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
  selector: 'app-clients-edit-customer',
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
  templateUrl: './clients-edit-customer.html'
})
export class ClientsEditCustomerComponent implements OnInit {
  customerId: string = '';
  customerNumber: string = '';
  fullName = '';
  email = '';
  phone = '';
  identification = '';
  paymentMethod = 'cash';
  password = '';
  status = 'active';
  loading = false;
  loadingData = true;
  error: string | null = null;

  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private appRef = inject(ApplicationRef);

  ngOnInit() {
    this.customerNumber = this.route.snapshot.params['customerNumber'];
    this.loadCustomerData();
  }

  async loadCustomerData() {
    try {
      this.loadingData = true;
      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/customers/${this.customerNumber}`)
      );
      
      const customer = response.data || response;
      this.customerId = customer._id;
      this.fullName = customer.fullName || '';
      this.email = customer.email || '';
      this.phone = customer.phone || '';
      this.identification = customer.identification || '';
      this.paymentMethod = customer.paymentMethod || 'cash';
      this.status = customer.status || 'active';
      
      this.loadingData = false;
      this.cdr.detectChanges();
    } catch (err: any) {
      console.error('Error cargando cliente:', err);
      this.error = 'Error al cargar los datos del cliente';
      this.loadingData = false;
      this.cdr.detectChanges();
    }
  }

  async onSubmit() {
    if (this.loading) return;
    console.log('Actualizando cliente...');
    this.error = null;
    this.loading = true;

    try {
      const payload: any = {
        fullName: this.fullName,
        email: this.email,
        phone: this.phone,
        identification: this.identification,
        paymentMethod: this.paymentMethod,
        status: this.status
      };

      if (this.password && this.password.trim() !== '') {
        payload.password = this.password;
      }

      console.log('Payload:', payload);

      const response = await firstValueFrom(
        this.http.put(`${environment.apiUrl}/customers/${this.customerId}`, payload)
      );
      console.log('Cliente actualizado:', response);
      this.router.navigate(['/clients']);
    } catch (err: any) {
      console.error('Error actualizando cliente:', err);
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
        message = err?.message || 'Error al actualizar cliente';
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

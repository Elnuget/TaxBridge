import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ButtonDirective,
  TableDirective,
  BadgeComponent
} from '@coreui/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-clients-show-customer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    ButtonDirective,
    TableDirective,
    BadgeComponent
  ],
  templateUrl: './clients-show-customer.html',
  styleUrl: './clients-show-customer.scss'
})
export class ClientsShowCustomerComponent implements OnInit {
  customerNumber: string = '';
  customer: any = null;
  loading = true;
  error: string | null = null;

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.customerNumber = this.route.snapshot.params['customerNumber'];
    this.loadCustomerData();
  }

  async loadCustomerData() {
    try {
      this.loading = true;
      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/customers/${this.customerNumber}`)
      );
      
      this.customer = response.data || response;
      this.loading = false;
      this.cdr.detectChanges();
    } catch (err: any) {
      console.error('Error cargando cliente:', err);
      this.error = 'Error al cargar los datos del cliente';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  getStatusBadge(status: string): string {
    return status === 'active' ? 'success' : 'secondary';
  }

  getStatusText(status: string): string {
    return status === 'active' ? 'Activo' : 'Inactivo';
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  getPaymentMethodText(method: string): string {
    const methods: any = {
      'cash': 'Efectivo',
      'card': 'Tarjeta',
      'transfer': 'Transferencia',
      'wallet': 'Billetera Digital'
    };
    return methods[method] || method;
  }

  deleteCustomer() {
    if (!this.customer) return;

    const confirmMessage = `¿Estás seguro de eliminar al cliente "${this.customer.fullName}" (${this.customer.customerNumber})?\n\nEsta acción eliminará toda la información del cliente incluidas sus compras.\n\nEsta acción no se puede deshacer.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    this.http.delete(`${environment.apiUrl}/customers/${this.customer._id}`).subscribe({
      next: (res) => {
        console.log('Cliente eliminado:', res);
        alert('Cliente eliminado exitosamente');
        this.router.navigate(['/clients']);
      },
      error: (err) => {
        console.error('Error eliminando cliente:', err);
        const message = err?.error?.message || 'Error al eliminar el cliente';
        alert(message);
      }
    });
  }
}

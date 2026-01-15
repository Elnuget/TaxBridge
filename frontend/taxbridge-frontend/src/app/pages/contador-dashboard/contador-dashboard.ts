import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ButtonDirective,
  BadgeComponent,
  SpinnerComponent,
  TableDirective
} from '@coreui/angular';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contador-dashboard',
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
    BadgeComponent,
    SpinnerComponent,
    TableDirective
  ],
  templateUrl: './contador-dashboard.html',
  styleUrl: './contador-dashboard.scss'
})
export class ContadorDashboardComponent implements OnInit {
  user: any = null;
  loading = true;
  
  // Estadísticas
  stats = {
    clientesAsignados: 0,
    credencialesActivas: 0,
    credencialesPorExpirar: 0,
    asientosPendientes: 0
  };

  // Clientes asignados al contador
  clientesAsignados: any[] = [];
  
  // Credenciales que gestiona
  credenciales: any[] = [];

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // Obtener datos del usuario contador
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('taxbridge_user') : null;
      this.user = raw ? JSON.parse(raw) : null;
    } catch (err) {
      this.user = null;
    }

    this.loadData();
  }

  loadData() {
    this.loading = true;
    
    // Cargar credenciales asignadas al contador
    if (this.user?._id) {
      this.http.get<any>(`${environment.apiUrl}/sri-credentials/contador/${this.user._id}`).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.credenciales = res.data;
            this.stats.credencialesActivas = this.credenciales.filter(c => c.status === 'active').length;
            
            // Calcular credenciales por expirar (30 días)
            const thirtyDays = new Date();
            thirtyDays.setDate(thirtyDays.getDate() + 30);
            this.stats.credencialesPorExpirar = this.credenciales.filter(c => 
              c.expiresAt && new Date(c.expiresAt) <= thirtyDays
            ).length;

            // Obtener clientes únicos
            const clientesMap = new Map();
            this.credenciales.forEach(c => {
              if (c.customer && !clientesMap.has(c.customerNumber)) {
                clientesMap.set(c.customerNumber, {
                  customerNumber: c.customerNumber,
                  fullName: c.customerName,
                  customer: c.customer
                });
              }
            });
            this.clientesAsignados = Array.from(clientesMap.values());
            this.stats.clientesAsignados = this.clientesAsignados.length;
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando datos:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loading = false;
    }
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'expired': return 'warning';
      case 'revoked': return 'danger';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'expired': return 'Expirado';
      case 'revoked': return 'Revocado';
      default: return status;
    }
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ButtonDirective,
  TableDirective
} from '@coreui/angular';
import { AuthService } from '../../services/auth';
import { AsientosService, AsientoContable } from '../../services/asientos.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    ButtonDirective,
    TableDirective
  ],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.scss'
})
export class CustomerDashboardComponent implements OnInit {
  user: any = null;
  asientos: AsientoContable[] = [];
  isGenerating = false;
  generationError: string | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);
  private asientosService = inject(AsientosService);

  get hasValidCustomer(): boolean {
    return Boolean(this.user?.customerNumber);
  }

  ngOnInit() {
    // Obtener datos del cliente desde la señal del AuthService
    try {
      this.user = this.authService.currentCustomer?.() || null;
    } catch (err) {
      this.user = null;
    }

    this.cargarHistorial();
  }

  goToAsientos() {
    if (!this.hasValidCustomer || this.isGenerating) {
      return;
    }

    this.isGenerating = true;
    this.generationError = null;

    try {
      const asiento = this.asientosService.generateRandomAsiento(this.user);
      this.cargarHistorial();

      // Pequeño delay para mostrar feedback visual antes de navegar
      setTimeout(() => {
        this.isGenerating = false;
        this.router.navigate(['/asientos-contables'], {
          state: { asiento }
        });
      }, 350);
    } catch (error) {
      console.error('Error simulando asiento contable', error);
      this.isGenerating = false;
      this.generationError = 'No pudimos generar el asiento simulado. Intenta nuevamente en unos segundos.';
    }
  }

  viewAsiento(asiento: AsientoContable) {
    this.router.navigate(['/asientos-contables'], {
      state: { asiento }
    });
  }

  trackByAsiento(_index: number, asiento: AsientoContable) {
    return asiento.id;
  }

  private cargarHistorial() {
    if (!this.hasValidCustomer) {
      this.asientos = [];
      return;
    }
    this.asientos = this.asientosService.getAsientosByCustomer(this.user.customerNumber);
  }
}
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  async goToAsientos() {
    if (!this.hasValidCustomer || this.isGenerating) {
      return;
    }

    this.isGenerating = true;
    this.generationError = null;

    try {
      const asiento = await firstValueFrom(
        this.asientosService.simulateForCustomer(this.user.customerNumber)
      );

      // Actualizar historial en memoria inmediatamente
      this.asientos = [asiento, ...this.asientos].slice(0, 5);

      this.isGenerating = false;
      this.router.navigate(['/asientos-contables'], {
        state: { asiento }
      });
    } catch (error) {
      console.error('Error simulando asiento contable', error);
      this.isGenerating = false;
      this.generationError = 'No pudimos generar el asiento simulado. Intenta nuevamente en unos segundos.';
    }
  }

  viewAsiento(asiento: AsientoContable) {
    this.asientosService.cacheLatest(asiento);
    this.router.navigate(['/asientos-contables'], {
      state: { asiento }
    });
  }

  trackByAsiento(_index: number, asiento: AsientoContable) {
    return asiento._id || asiento.id;
  }

  private async cargarHistorial() {
    if (!this.hasValidCustomer) {
      this.asientos = [];
      return;
    }

    try {
      this.asientos = await firstValueFrom(
        this.asientosService.getHistory(this.user.customerNumber, 5)
      );
    } catch (error) {
      console.error('Error al cargar el historial de asientos', error);
      this.asientos = [];
    }
  }
}
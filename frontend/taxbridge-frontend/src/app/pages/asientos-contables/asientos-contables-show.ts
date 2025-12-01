import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
import { AsientosService, AsientoContable } from '../../services/asientos.service';

@Component({
  selector: 'app-asientos-contables-show',
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
  templateUrl: './asientos-contables-show.html',
  styleUrl: './asientos-contables-show.scss'
})
export class AsientosContablesShowComponent implements OnInit {
  asiento: AsientoContable | null = null;
  loading = true;

  private router = inject(Router);
  private asientosService = inject(AsientosService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const asientoFromState = nav?.extras?.state?.['asiento'] as AsientoContable | undefined;

    if (asientoFromState) {
      this.asientosService.cacheLatest(asientoFromState);
      this.asiento = asientoFromState;
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.asiento = await this.asientosService.loadLatestFromBackend();
    this.loading = false;
    this.cdr.detectChanges();

    if (!this.asiento) {
      // No hay asiento para mostrar, regresar al dashboard del cliente
      this.router.navigate(['/customer-dashboard']);
    }
  }

  goBack() {
    this.router.navigate(['/customer-dashboard']);
  }

  generarOtro() {
    this.router.navigate(['/customer-dashboard']);
  }
}

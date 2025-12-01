import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface AsientoContableLinea {
  cuenta: string;
  descripcion: string;
  debe: number;
  haber: number;
}

export interface AsientoContable {
  id: string;
  customerNumber: string;
  customerName: string;
  fecha: string;
  moneda: string;
  totalDebe: number;
  totalHaber: number;
  lineas: AsientoContableLinea[];
  hashResumen: string;
}

@Injectable({
  providedIn: 'root'
})
export class AsientosService {
  private platformId = inject(PLATFORM_ID);
  private storageKey = 'taxbridge-latest-asiento';
  private ultimoAsiento = signal<AsientoContable | null>(null);

  constructor() {
    this.cargarDesdeStorage();
  }

  generateRandomAsiento(customer: any): AsientoContable {
    const base = this.randomInRange(120, 1500);
    const iva = this.redondear(base * 0.12);
    const total = this.redondear(base + iva);

    const lineas: AsientoContableLinea[] = [
      {
        cuenta: '110101',
        descripcion: 'Caja / Bancos',
        debe: total,
        haber: 0
      },
      {
        cuenta: '210101',
        descripcion: 'IVA por pagar',
        debe: 0,
        haber: iva
      },
      {
        cuenta: '410101',
        descripcion: 'Ventas netas',
        debe: 0,
        haber: base
      }
    ];

    const asiento: AsientoContable = {
      id: this.generarId(),
      customerNumber: customer?.customerNumber || 'TB-000000',
      customerName: customer?.fullName || customer?.nombre || 'Cliente TaxBridge',
      fecha: new Date().toISOString(),
      moneda: 'USD',
      totalDebe: total,
      totalHaber: total,
      lineas,
      hashResumen: this.crearHash(lineas)
    };

    this.persistir(asiento);
    return asiento;
  }

  getLatestAsiento(): AsientoContable | null {
    return this.ultimoAsiento();
  }

  private persistir(asiento: AsientoContable) {
    this.ultimoAsiento.set(asiento);
    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.setItem(this.storageKey, JSON.stringify(asiento));
      } catch (err) {
        console.warn('No se pudo guardar el asiento simulado en sessionStorage', err);
      }
    }
  }

  private cargarDesdeStorage() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const raw = sessionStorage.getItem(this.storageKey);
        if (raw) {
          this.ultimoAsiento.set(JSON.parse(raw));
        }
      } catch (err) {
        console.warn('No se pudo cargar el asiento simulado desde sessionStorage', err);
      }
    }
  }

  private generarId(): string {
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `TB-AS-${Date.now()}-${random}`;
  }

  private crearHash(lineas: AsientoContableLinea[]): string {
    const raw = lineas.map(l => `${l.cuenta}-${l.debe}-${l.haber}`).join('|');
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).toUpperCase();
  }

  private randomInRange(min: number, max: number): number {
    return this.redondear(Math.random() * (max - min) + min);
  }

  private redondear(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

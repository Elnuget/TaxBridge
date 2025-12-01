import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, firstValueFrom, map, tap } from 'rxjs';

export interface AsientoContableLinea {
  cuenta: string;
  descripcion: string;
  debe: number;
  haber: number;
}

export interface AsientoContable {
  _id: string;
  id?: string;
  customerNumber: string;
  customerName: string;
  fecha: string;
  moneda: string;
  totalDebe: number;
  totalHaber: number;
  lineas: AsientoContableLinea[];
  hashResumen: string;
  createdAt?: string;
  updatedAt?: string;
}

type ApiResponse<T> = { success?: boolean; message?: string; data: T } | T;
type ApiListResponse<T> = { success?: boolean; count?: number; data: T[] } | T[];

@Injectable({
  providedIn: 'root'
})
export class AsientosService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private baseUrl = `${environment.apiUrl}/asientos`;
  private latestAsiento = signal<AsientoContable | null>(null);
  private latestAsientoIdKey = 'taxbridge-latest-asiento-id';

  simulateForCustomer(customerNumber: string): Observable<AsientoContable> {
    return this.http
      .post<ApiResponse<AsientoContable>>(`${this.baseUrl}/simulate`, { customerNumber })
      .pipe(
        map(res => this.unwrapSingle(res)),
        tap(asiento => this.cacheLatest(asiento))
      );
  }

  getHistory(customerNumber: string, limit = 5): Observable<AsientoContable[]> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http
      .get<ApiListResponse<AsientoContable>>(`${this.baseUrl}/customer/${customerNumber}`, { params })
      .pipe(map(res => this.unwrapList(res)));
  }

  getAsientoById(id: string): Observable<AsientoContable> {
    return this.http
      .get<ApiResponse<AsientoContable>>(`${this.baseUrl}/${id}`)
      .pipe(map(res => this.unwrapSingle(res)));
  }

  getCachedAsiento(): AsientoContable | null {
    return this.latestAsiento();
  }

  cacheLatest(asiento: AsientoContable) {
    this.latestAsiento.set(asiento);
    const asientoId = asiento._id || asiento.id;
    if (asientoId && isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.setItem(this.latestAsientoIdKey, asientoId);
      } catch (error) {
        console.warn('No se pudo almacenar el identificador del asiento', error);
      }
    }
  }

  async loadLatestFromBackend(): Promise<AsientoContable | null> {
    if (this.latestAsiento()) {
      return this.latestAsiento();
    }

    const storedId = this.getStoredAsientoId();
    if (!storedId) {
      return null;
    }

    try {
      const asiento = await firstValueFrom(this.getAsientoById(storedId));
      this.cacheLatest(asiento);
      return asiento;
    } catch (error) {
      console.warn('No se pudo recuperar el asiento almacenado', error);
      return null;
    }
  }

  clearCache() {
    this.latestAsiento.set(null);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.latestAsientoIdKey);
    }
  }

  private unwrapSingle<T>(response: ApiResponse<T>): T {
    return (response as any)?.data ?? (response as T);
  }

  private unwrapList<T>(response: ApiListResponse<T>): T[] {
    return (response as any)?.data ?? (response as T[]);
  }

  private getStoredAsientoId(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return sessionStorage.getItem(this.latestAsientoIdKey);
  }
}

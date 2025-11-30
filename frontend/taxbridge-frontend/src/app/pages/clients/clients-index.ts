import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { 
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ButtonDirective
} from '@coreui/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-clients-index',
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
    ButtonDirective
  ],
  templateUrl: './clients-index.html',
  styleUrl: './clients-index.scss'
})
export class ClientsIndexComponent implements OnInit {
  clients: any[] = [];
  users: any[] = [];
  loading = true;
  error: string | null = null;
  private loadedCount = 0;

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.loadedCount = 0;
    this.loadClients();
    this.loadUsers();
  }

  loadClients() {
    const url = `${environment.apiUrl}/customers/all`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        console.log('Clients API response:', res);
        if (Array.isArray(res)) {
          this.clients = res;
        } else if (res && Array.isArray(res.data)) {
          this.clients = res.data;
        } else if (res && res.success && res.count >= 0 && Array.isArray(res.data)) {
          this.clients = res.data;
        } else if (res && res.data) {
          this.clients = Array.isArray(res.data) ? res.data : [];
        } else {
          this.clients = Array.isArray(res) ? res : [];
        }
        console.log('Clients loaded:', this.clients);
        this.loadedCount++;
        if (this.loadedCount === 2) {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error cargando clientes:', err);
        this.error = 'No fue posible cargar la lista de usuarios';
        this.loading = false;
      }
    });
  }

  loadUsers() {
    const url = `${environment.apiUrl}/users/all`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        console.log('Users API response:', res);
        if (Array.isArray(res)) {
          this.users = res;
        } else if (res && Array.isArray(res.data)) {
          this.users = res.data;
        } else if (res && res.success && res.count >= 0 && Array.isArray(res.data)) {
          this.users = res.data;
        } else if (res && res.data) {
          this.users = Array.isArray(res.data) ? res.data : [];
        } else {
          this.users = Array.isArray(res) ? res : [];
        }
        console.log('Users loaded:', this.users);
        this.loadedCount++;
        if (this.loadedCount === 2) {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.error = 'No fue posible cargar la lista de usuarios';
        this.loading = false;
      }
    });
  }

  checkLoadingComplete() {
    // Asumir que ambas llamadas han terminado cuando se llama esto
    // Para simplificar, usar un contador o algo, pero por ahora, set loading false después de ambas
    // Como son llamadas async, mejor usar Promise.all, pero para simplidad, set loading false aquí
    this.loading = false;
  }
}

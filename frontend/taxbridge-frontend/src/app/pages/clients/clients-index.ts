import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
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
  filteredClients: any[] = [];
  searchText: string = '';
  private searchTimeout: any = null;
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
        // Inicializar lista filtrada y aplicar filtros actuales
        this.filteredClients = Array.isArray(this.clients) ? [...this.clients] : [];
        this.applyFilters();
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

  onSearchChange(term: string) {
    this.searchText = term || '';
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
      this.cdr.detectChanges();
    }, 250);
  }

  clearFilters() {
    this.searchText = '';
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
    this.applyFilters();
    this.cdr.detectChanges();
  }

  applyFilters() {
    let list = Array.isArray(this.clients) ? [...this.clients] : [];
    const q = this.searchText ? this.searchText.trim().toLowerCase() : '';
    if (q) {
      list = list.filter(c => {
        const fields = [c.customerNumber, c.fullName, c.email, c.phone, c.nombre, c.name];
        return fields.some(f => f && String(f).toLowerCase().includes(q));
      });
    }
    // solo filtrado por texto (email, nombre, teléfono, etc.)
    this.filteredClients = list;
  }
}

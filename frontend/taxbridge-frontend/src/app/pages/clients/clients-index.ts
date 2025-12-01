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

  // KPIs
  kpis = {
    totalClients: 0,
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalPurchases: 0,
    averagePurchasesPerClient: 0,
    clientsWithPurchases: 0
  };

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
        try {
          if (Array.isArray(res)) {
            this.clients = res;
          } else if (res && Array.isArray(res.data)) {
            this.clients = res.data;
          } else if (res && res.success && res.count >= 0 && Array.isArray(res.data)) {
            this.clients = res.data;
          } else if (res && res.data) {
            this.clients = Array.isArray(res.data) ? res.data : [];
          } else {
            this.clients = [];
          }
          console.log('Clients loaded:', this.clients);
          this.filteredClients = [...this.clients];
          this.applyFilters();
        } catch (e) {
          console.error('Error procesando clientes:', e);
          this.clients = [];
          this.filteredClients = [];
        }
        this.loadedCount++;
        if (this.loadedCount === 2) {
          this.calculateKPIs();
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error cargando clientes:', err);
        this.clients = [];
        this.filteredClients = [];
        this.loadedCount++;
        if (this.loadedCount === 2) {
          this.loading = false;
        }
      }
    });
  }

  loadUsers() {
    const url = `${environment.apiUrl}/users/all`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        console.log('Users API response:', res);
        try {
          if (Array.isArray(res)) {
            this.users = res;
          } else if (res && Array.isArray(res.data)) {
            this.users = res.data;
          } else if (res && res.success && res.count >= 0 && Array.isArray(res.data)) {
            this.users = res.data;
          } else if (res && res.data) {
            this.users = Array.isArray(res.data) ? res.data : [];
          } else {
            this.users = [];
          }
          console.log('Users loaded:', this.users);
        } catch (e) {
          console.error('Error procesando usuarios:', e);
          this.users = [];
        }
        this.loadedCount++;
        if (this.loadedCount === 2) {
          this.calculateKPIs();
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.users = [];
        this.loadedCount++;
        if (this.loadedCount === 2) {
          this.loading = false;
        }
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

  calculateKPIs() {
    // Total de clientes
    this.kpis.totalClients = this.clients.length;
    
    // Total de usuarios
    this.kpis.totalUsers = this.users.length;
    
    // Usuarios activos e inactivos
    this.kpis.activeUsers = this.users.filter(u => u.activo).length;
    this.kpis.inactiveUsers = this.users.filter(u => !u.activo).length;
    
    // Total de compras y clientes con compras
    let totalPurchases = 0;
    let clientsWithPurchases = 0;
    
    this.clients.forEach(client => {
      if (client.purchases && Array.isArray(client.purchases) && client.purchases.length > 0) {
        totalPurchases += client.purchases.length;
        clientsWithPurchases++;
      }
    });
    
    this.kpis.totalPurchases = totalPurchases;
    this.kpis.clientsWithPurchases = clientsWithPurchases;
    this.kpis.averagePurchasesPerClient = this.kpis.totalClients > 0 
      ? parseFloat((totalPurchases / this.kpis.totalClients).toFixed(2))
      : 0;
  }

  deleteUser(user: any) {
    const confirmMessage = `¿Estás seguro de eliminar al usuario "${user.nombre}"?\n\nEsta acción no se puede deshacer.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    const url = `${environment.apiUrl}/users/${user._id}`;
    this.http.delete<any>(url).subscribe({
      next: (res) => {
        console.log('Usuario eliminado:', res);
        // Recargar la lista de usuarios
        this.loadUsers();
        alert('Usuario eliminado exitosamente');
      },
      error: (err) => {
        console.error('Error eliminando usuario:', err);
        const message = err?.error?.message || 'Error al eliminar el usuario';
        alert(message);
      }
    });
  }

  deleteClient(client: any) {
    const confirmMessage = `¿Estás seguro de eliminar al cliente "${client.fullName}" (${client.customerNumber})?\n\nEsta acción eliminará toda la información del cliente incluidas sus compras.\n\nEsta acción no se puede deshacer.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    const url = `${environment.apiUrl}/customers/${client._id}`;
    this.http.delete<any>(url).subscribe({
      next: (res) => {
        console.log('Cliente eliminado:', res);
        // Recargar la lista de clientes
        this.loadClients();
        alert('Cliente eliminado exitosamente');
      },
      error: (err) => {
        console.error('Error eliminando cliente:', err);
        const message = err?.error?.message || 'Error al eliminar el cliente';
        alert(message);
      }
    });
  }
}

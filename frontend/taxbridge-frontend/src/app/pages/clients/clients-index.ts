import { Component, OnInit, inject } from '@angular/core';
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
  loading = true;
  error: string | null = null;

  private http = inject(HttpClient);

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.loading = true;
    const url = `${environment.apiUrl}/customers/all`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        // Debug: asegurar formatos variados de respuesta
        console.log('Clients API response:', res);
        if (Array.isArray(res)) {
          this.clients = res;
        } else if (res && Array.isArray(res.data)) {
          this.clients = res.data;
        } else if (res && res.success && res.count >= 0 && Array.isArray(res.data)) {
          this.clients = res.data;
        } else if (res && res.data) {
          // fallback: if data is object, try to wrap
          this.clients = Array.isArray(res.data) ? res.data : [];
        } else {
          // Unknown shape: try to use res as array
          this.clients = Array.isArray(res) ? res : [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando clientes:', err);
        this.error = 'No fue posible cargar la lista de usuarios';
        this.loading = false;
      }
    });
  }
}

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
    const url = `${environment.apiUrl}/customers`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.clients = res.data || [];
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

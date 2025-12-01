import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ButtonDirective,
  BadgeComponent
} from '@coreui/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-clients-show-user',
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
    ButtonDirective,
    BadgeComponent
  ],
  templateUrl: './clients-show-user.html',
  styleUrl: './clients-show-user.scss'
})
export class ClientsShowUserComponent implements OnInit {
  userId: string = '';
  user: any = null;
  loading = true;
  error: string | null = null;

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.userId = this.route.snapshot.params['id'];
    this.loadUserData();
  }

  async loadUserData() {
    try {
      this.loading = true;
      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/users/${this.userId}`)
      );
      
      this.user = response.data || response;
      this.loading = false;
      this.cdr.detectChanges();
    } catch (err: any) {
      console.error('Error cargando usuario:', err);
      this.error = 'Error al cargar los datos del usuario';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  getRoleBadge(rol: string): string {
    return rol === 'admin' ? 'danger' : 'primary';
  }

  getRoleText(rol: string): string {
    return rol === 'admin' ? 'Administrador' : 'Contador';
  }

  getStatusBadge(activo: boolean): string {
    return activo ? 'success' : 'secondary';
  }

  getStatusText(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  deleteUser() {
    if (!this.user) return;

    const confirmMessage = `¿Estás seguro de eliminar al usuario "${this.user.nombre}"?\n\nEsta acción no se puede deshacer.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    this.http.delete(`${environment.apiUrl}/users/${this.user._id}`).subscribe({
      next: (res) => {
        console.log('Usuario eliminado:', res);
        alert('Usuario eliminado exitosamente');
        this.router.navigate(['/clients']);
      },
      error: (err) => {
        console.error('Error eliminando usuario:', err);
        const message = err?.error?.message || 'Error al eliminar el usuario';
        alert(message);
      }
    });
  }
}

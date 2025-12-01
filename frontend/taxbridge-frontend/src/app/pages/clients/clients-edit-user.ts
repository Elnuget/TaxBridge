import { Component, OnInit, inject, ChangeDetectorRef, NgZone, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ButtonDirective,
  FormDirective
} from '@coreui/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-clients-edit-user',
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
    ButtonDirective,
    FormDirective
  ],
  templateUrl: './clients-edit-user.html'
})
export class ClientsEditUserComponent implements OnInit {
  userId: string = '';
  nombre = '';
  email = '';
  telefono = '';
  rol = 'contador';
  password = '';
  activo = true;
  loading = false;
  loadingData = true;
  error: string | null = null;

  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private appRef = inject(ApplicationRef);

  ngOnInit() {
    this.userId = this.route.snapshot.params['id'];
    this.loadUserData();
  }

  async loadUserData() {
    try {
      this.loadingData = true;
      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/users/${this.userId}`)
      );
      
      const user = response.data || response;
      this.nombre = user.nombre || '';
      this.email = user.email || '';
      this.telefono = user.telefono || '';
      this.rol = user.rol || 'contador';
      this.activo = user.activo !== undefined ? user.activo : true;
      
      this.loadingData = false;
      this.cdr.detectChanges();
    } catch (err: any) {
      console.error('Error cargando usuario:', err);
      this.error = 'Error al cargar los datos del usuario';
      this.loadingData = false;
      this.cdr.detectChanges();
    }
  }

  async onSubmit() {
    if (this.loading) return;
    console.log('Actualizando usuario...');
    this.error = null;
    this.loading = true;

    try {
      const payload: any = {
        nombre: this.nombre,
        email: this.email,
        telefono: this.telefono,
        rol: this.rol,
        activo: this.activo
      };

      if (this.password && this.password.trim() !== '') {
        payload.password = this.password;
      }

      console.log('Payload:', payload);

      const response = await firstValueFrom(
        this.http.put(`${environment.apiUrl}/users/${this.userId}`, payload)
      );
      console.log('Usuario actualizado:', response);
      this.router.navigate(['/clients']);
    } catch (err: any) {
      console.error('Error actualizando usuario:', err);
      const server = err?.error;
      let message = '';
      if (server?.message) {
        message = server.message;
      } else if (server?.errors) {
        if (Array.isArray(server.errors)) {
          message = server.errors.map((e: any) => e.msg || e.message || JSON.stringify(e)).join('; ');
        } else {
          message = Object.values(server.errors).map((v: any) => (v.msg || v.message || JSON.stringify(v))).join('; ');
        }
      } else {
        message = err?.message || 'Error al actualizar usuario';
      }
      this.zone.run(() => {
        this.error = message;
        this.cdr.detectChanges();
      });
      this.appRef.tick();
    } finally {
      this.zone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
      this.appRef.tick();
    }
  }
}

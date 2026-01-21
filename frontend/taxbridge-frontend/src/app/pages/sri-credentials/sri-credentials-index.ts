import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { 
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ButtonDirective,
  BadgeComponent,
  SpinnerComponent,
  TableDirective,
  ModalComponent,
  ModalHeaderComponent,
  ModalBodyComponent,
  ModalFooterComponent,
  FormDirective,
  FormLabelDirective,
  FormControlDirective
} from '@coreui/angular';
import { SRICredentialService, SRICredential, CredentialGraph } from '../../services/sri-credential.service';

@Component({
  selector: 'app-sri-credentials-index',
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
    BadgeComponent,
    SpinnerComponent,
    TableDirective,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    FormDirective,
    FormLabelDirective,
    FormControlDirective
  ],
  templateUrl: './sri-credentials-index.html',
  styleUrl: './sri-credentials-index.scss'
})
export class SRICredentialsIndexComponent implements OnInit {
  credentials: SRICredential[] = [];
  filteredCredentials: SRICredential[] = [];
  loading = true;
  error: string | null = null;
  searchText = '';

  // Modal de creación
  showCreateModal = false;
  newCredential = {
    customerNumber: '',
    sriUsername: '',
    sriPassword: '',
    ruc: '',
    tipoContribuyente: 'persona_natural' as 'persona_natural' | 'sociedad' | 'rise',
    razonSocial: '',
    notes: ''
  };
  creating = false;
  errorMessage: string | null = null;

  // Modal de detalle
  showDetailModal = false;
  selectedCredential: SRICredential | null = null;

  // Modal de edición
  showEditModal = false;
  editCredential: any = null;
  updating = false;
  editErrorMessage: string | null = null;

  // Estado de eliminación
  deleting: { [key: string]: boolean } = {};

  // Estado de tomar credencial
  taking: { [key: string]: boolean } = {};

  // KPIs
  kpis = {
    total: 0,
    active: 0,
    inactive: 0,
    expiring: 0
  };

  // Obtener el rol del usuario para controles de visualización
  get userRole(): string {
    const user = this.authService.user();
    // Si es un cliente (tiene customerNumber), retornar 'cliente'
    if (user?.customerNumber) {
      return 'cliente';
    }
    // Si tiene rol explícito (admin, contador), usarlo
    if (user?.rol) {
      return user.rol;
    }
    return 'guest';
  }

  get isCliente(): boolean {
    return this.userRole === 'cliente';
  }

  get isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  get isContador(): boolean {
    return this.userRole === 'contador';
  }

  private sriService = inject(SRICredentialService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // Debug: verificar rol del usuario
    console.log('🔍 Usuario actual:', this.authService.user());
    console.log('🔍 Rol detectado:', this.userRole);
    console.log('🔍 isContador:', this.isContador);
    this.loadCredentials();
  }

  loadCredentials() {
    this.loading = true;
    this.error = null;

    // Admin y contadores cargan TODAS las credenciales
    // Clientes cargan solo las suyas
    this.sriService.getAllCredentials().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.credentials = res.data;
          this.filteredCredentials = [...this.credentials];
          this.calculateKPIs();
          // Debug: verificar datos de credenciales
          console.log('🔍 Credenciales cargadas:', this.credentials.map(c => ({
            id: c.credentialId,
            assignedContador: c.assignedContador,
            assignedContadorName: c.assignedContadorName
          })));;
          console.log(`✅ Credenciales cargadas: ${this.credentials.length}`);
        } else {
          this.credentials = [];
          this.filteredCredentials = [];
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al cargar credenciales:', err);
        this.error = 'Error al cargar las credenciales del SRI';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateKPIs() {
    this.kpis.total = this.credentials.length;
    this.kpis.active = this.credentials.filter(c => c.status === 'active').length;
    this.kpis.inactive = this.credentials.filter(c => c.status === 'inactive' || c.status === 'revoked').length;
    
    // Credenciales que expiran en los próximos 30 días
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    this.kpis.expiring = this.credentials.filter(c => 
      c.expiresAt && new Date(c.expiresAt) <= thirtyDaysFromNow && c.status === 'active'
    ).length;
  }

  applyFilter() {
    if (!this.searchText.trim()) {
      this.filteredCredentials = [...this.credentials];
      return;
    }

    const search = this.searchText.toLowerCase();
    this.filteredCredentials = this.credentials.filter(c =>
      c.credentialId?.toLowerCase().includes(search) ||
      c.customerNumber?.toLowerCase().includes(search) ||
      c.customerName?.toLowerCase().includes(search) ||
      c.ruc?.toLowerCase().includes(search) ||
      c.assignedContadorName?.toLowerCase().includes(search)
    );
  }

  // Modal de creación
  openCreateModal() {
    this.showCreateModal = true;
    this.resetNewCredential();
    // Obtener el número de cliente del usuario logueado
    const user = this.authService.user();
    if (user && user.customerNumber) {
      this.newCredential.customerNumber = user.customerNumber;
    }
    this.errorMessage = null;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.errorMessage = null;
    this.resetNewCredential();
    // Recargar página para limpiar cualquier estado bloqueado
    window.location.reload();
  }

  onCreateModalVisibleChange(visible: boolean) {
    if (!visible) {
      this.showCreateModal = false;
      this.errorMessage = null;
      this.resetNewCredential();
      window.location.reload();
    }
  }

  // Modal de detalle
  openDetailModal(credential: SRICredential) {
    this.selectedCredential = credential;
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedCredential = null;
    // Recargar página para limpiar cualquier estado bloqueado
    window.location.reload();
  }

  onDetailModalVisibleChange(visible: boolean) {
    if (!visible) {
      this.showDetailModal = false;
      this.selectedCredential = null;
      window.location.reload();
    }
  }

  // Modal de edición
  openEditModal(credential: SRICredential) {
    this.editCredential = {
      _id: credential._id,
      sriUsername: credential.sriUsername,
      ruc: credential.ruc,
      tipoContribuyente: credential.tipoContribuyente,
      razonSocial: credential.razonSocial || '',
      notes: credential.notes || '',
      status: credential.status
    };
    this.showEditModal = true;
    this.editErrorMessage = null;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editCredential = null;
    this.editErrorMessage = null;
    // Recargar página para limpiar cualquier estado bloqueado
    window.location.reload();
  }

  onEditModalVisibleChange(visible: boolean) {
    if (!visible) {
      this.showEditModal = false;
      this.editCredential = null;
      this.editErrorMessage = null;
      window.location.reload();
    }
  }

  updateCredential() {
    if (!this.editCredential || !this.editCredential._id) {
      return;
    }

    this.updating = true;
    this.editErrorMessage = null;

    this.sriService.updateCredential(this.editCredential._id, this.editCredential).subscribe({
      next: (res) => {
        if (res.success) {
          this.closeEditModal();
          this.loadCredentials();
        } else {
          this.editErrorMessage = res.message || 'Error al actualizar la credencial';
        }
        this.updating = false;
      },
      error: (err) => {
        console.error('Error al actualizar credencial:', err);
        
        if (err.error && err.error.message) {
          this.editErrorMessage = err.error.message;
        } else if (err.status === 404) {
          this.editErrorMessage = 'Credencial no encontrada.';
        } else if (err.status === 400) {
          this.editErrorMessage = 'Datos inválidos. Verifica la información.';
        } else {
          this.editErrorMessage = 'Error al actualizar la credencial.';
        }
        
        this.updating = false;
      }
    });
  }

  resetNewCredential() {
    this.newCredential = {
      customerNumber: '',
      sriUsername: '',
      sriPassword: '',
      ruc: '',
      tipoContribuyente: 'persona_natural',
      razonSocial: '',
      notes: ''
    };
  }

  createCredential() {
    if (!this.newCredential.customerNumber || !this.newCredential.sriUsername || 
        !this.newCredential.sriPassword || !this.newCredential.ruc) {
      this.errorMessage = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.creating = true;
    this.errorMessage = null;
    
    this.sriService.createCredential(this.newCredential).subscribe({
      next: (res) => {
        if (res.success) {
          this.closeCreateModal();
          this.loadCredentials();
        } else {
          this.errorMessage = res.message || 'Error al crear la credencial';
        }
        this.creating = false;
      },
      error: (err) => {
        console.error('Error al crear credencial:', err);
        
        // Mostrar mensaje de error amigable al usuario
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 404) {
          this.errorMessage = 'Cliente no encontrado. Verifica tu número de cliente.';
        } else if (err.status === 400) {
          this.errorMessage = 'Ya existe una credencial para este RUC o datos inválidos.';
        } else if (err.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.';
        } else {
          this.errorMessage = 'Error al crear la credencial. Intenta de nuevo.';
        }
        
        this.creating = false;
      }
    });
  }

  deleteCredential(id: string, credentialId: string) {
    const confirmMessage = `¿Está seguro de eliminar la credencial ${credentialId}?\n\nEsta acción no se puede deshacer y eliminará permanentemente:\n- La credencial del SRI\n- Historial de accesos\n- Delegaciones asociadas`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    this.deleting[id] = true;

    this.sriService.deleteCredential(id).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Credencial eliminada exitosamente');
          this.loadCredentials();
        } else {
          alert('Error al eliminar: ' + (res.message || 'Error desconocido'));
        }
        delete this.deleting[id];
      },
      error: (err) => {
        console.error('Error al eliminar credencial:', err);
        
        let errorMsg = 'Error al eliminar la credencial.';
        if (err.error && err.error.message) {
          errorMsg = err.error.message;
        } else if (err.status === 404) {
          errorMsg = 'Credencial no encontrada.';
        } else if (err.status === 403) {
          errorMsg = 'No tiene permisos para eliminar esta credencial.';
        }
        
        alert(errorMsg);
        delete this.deleting[id];
      }
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'expired': return 'warning';
      case 'revoked': return 'danger';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'expired': return 'Expirado';
      case 'revoked': return 'Revocado';
      default: return status;
    }
  }

  getTipoContribuyenteLabel(tipo: string): string {
    switch (tipo) {
      case 'persona_natural': return 'Persona Natural';
      case 'sociedad': return 'Sociedad';
      case 'rise': return 'RISE';
      default: return tipo;
    }
  }

  /**
   * Tomar una credencial sin contador asignado
   * Solo disponible para contadores
   */
  takeCredential(id: string, credentialId: string) {
    const confirmMessage = `¿Desea tomar la credencial ${credentialId}?\n\nSe le asignará como contador responsable de esta credencial.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    this.taking[id] = true;

    this.sriService.takeCredential(id).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Credencial asignada exitosamente. Ahora eres el contador responsable.');
          this.loadCredentials();
        } else {
          alert('Error: ' + (res.message || 'No se pudo tomar la credencial'));
        }
        delete this.taking[id];
      },
      error: (err) => {
        console.error('Error al tomar credencial:', err);
        
        let errorMsg = 'Error al tomar la credencial.';
        if (err.error && err.error.message) {
          errorMsg = err.error.message;
        } else if (err.status === 400) {
          errorMsg = 'Esta credencial ya tiene un contador asignado.';
        } else if (err.status === 403) {
          errorMsg = 'Solo los contadores pueden tomar credenciales.';
        } else if (err.status === 404) {
          errorMsg = 'Credencial no encontrada.';
        }
        
        alert(errorMsg);
        delete this.taking[id];
      }
    });
  }
}

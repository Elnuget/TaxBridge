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
  FormControlDirective,
  FormSelectDirective
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
    FormControlDirective,
    FormSelectDirective
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

  // KPIs
  kpis = {
    total: 0,
    active: 0,
    inactive: 0,
    expiring: 0
  };

  private sriService = inject(SRICredentialService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadCredentials();
  }

  loadCredentials() {
    this.loading = true;
    this.error = null;

    this.sriService.getAllCredentials().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.credentials = res.data;
          this.filteredCredentials = [...this.credentials];
          this.calculateKPIs();
        } else {
          this.credentials = [];
          this.filteredCredentials = [];
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar credenciales:', err);
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
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.resetNewCredential();
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
      return;
    }

    this.creating = true;
    this.sriService.createCredential(this.newCredential).subscribe({
      next: (res) => {
        if (res.success) {
          this.closeCreateModal();
          this.loadCredentials();
        }
        this.creating = false;
      },
      error: (err) => {
        console.error('Error al crear credencial:', err);
        this.creating = false;
      }
    });
  }

  deleteCredential(id: string) {
    if (!confirm('¿Está seguro de eliminar esta credencial?')) {
      return;
    }

    this.sriService.deleteCredential(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadCredentials();
        }
      },
      error: (err) => {
        console.error('Error al eliminar credencial:', err);
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
}

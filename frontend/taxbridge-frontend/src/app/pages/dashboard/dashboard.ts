import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { 
  RowComponent, 
  ColComponent, 
  CardComponent, 
  CardBodyComponent, 
  CardHeaderComponent,
  BadgeComponent,
  ButtonDirective,
  ContainerComponent
} from '@coreui/angular';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth';

interface PurchasedProduct {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

interface Customer {
  customerNumber: string;
  fullName: string;
  email: string;
  phone: string;
  identification: string;
  purchasedProducts: PurchasedProduct[];
  totalPurchases: number;
  lastPurchaseDate: string;
  paymentMethod: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    BadgeComponent,
    ButtonDirective,
    ContainerComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  customer: Customer | null = null;
  loading = true;
  error: string | null = null;
  showCredentials = false;
  temporaryPassword = '';
  customerEmail = '';

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);

  ngOnInit() {
    // Obtener customerNumber de query params, AuthService o localStorage
    this.route.queryParams.subscribe(params => {
      // Verificar si debe mostrar credenciales
      this.showCredentials = params['showCredentials'] === 'true';
      if (this.showCredentials) {
        this.temporaryPassword = localStorage.getItem('temporaryPassword') || '';
        this.customerEmail = localStorage.getItem('customerEmail') || '';
      }

      // Prioridad: queryParams > AuthService > localStorage
      let customerNumber = params['customerNumber'];
      
      if (!customerNumber) {
        // Intentar obtener del AuthService
        customerNumber = this.authService.getCustomerNumber();
        console.log('CustomerNumber desde AuthService:', customerNumber);
      }
      
      if (!customerNumber) {
        // Último recurso: localStorage
        customerNumber = localStorage.getItem('customerNumber');
        console.log('CustomerNumber desde localStorage:', customerNumber);
      }

      console.log('CustomerNumber final:', customerNumber);
      
      if (customerNumber) {
        this.loadCustomerData(customerNumber);
      } else {
        this.error = 'No se encontró número de cliente. Por favor, inicia sesión nuevamente.';
        this.loading = false;
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/auth']);
        }, 3000);
      }
    });
  }

  hideCredentials() {
    this.showCredentials = false;
    // Limpiar la contraseña temporal del localStorage después de mostrarla
    localStorage.removeItem('temporaryPassword');
  }

  loadCustomerData(customerNumber: string) {
    this.loading = true;
    const url = `${environment.apiUrl}/customers/${customerNumber}`;
    console.log('Cargando datos del cliente desde:', url);
    
    this.http.get<any>(url)
      .subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          this.customer = response.data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar datos del cliente:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          this.error = 'Error al cargar los datos del cliente';
          this.loading = false;
        }
      });
  }

  getPaymentMethodName(method: string): string {
    const methods: Record<string, string> = {
      'card': 'Tarjeta',
      'transfer': 'Transferencia',
      'cash': 'Efectivo',
      'wallet': 'Saldo Prepagado'
    };
    return methods[method] || method;
  }

  getCategoryName(category: string): string {
    const categories: Record<string, string> = {
      'apis': 'APIs',
      'planes': 'Planes',
      'contabilidad': 'Contabilidad',
      'recursos-humanos': 'Recursos Humanos',
      'tributario': 'Tributario',
      'servicios': 'Servicios'
    };
    return categories[category] || category;
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'apis': 'primary',
      'planes': 'success',
      'contabilidad': 'info',
      'recursos-humanos': 'warning',
      'tributario': 'danger',
      'servicios': 'secondary'
    };
    return colors[category] || 'secondary';
  }
}

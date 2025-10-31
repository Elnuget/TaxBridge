import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Obtener customerNumber de query params o localStorage
    this.route.queryParams.subscribe(params => {
      // Verificar si debe mostrar credenciales
      this.showCredentials = params['showCredentials'] === 'true';
      if (this.showCredentials) {
        this.temporaryPassword = localStorage.getItem('temporaryPassword') || '';
        this.customerEmail = localStorage.getItem('customerEmail') || '';
      }

      const customerNumber = params['customerNumber'] || localStorage.getItem('customerNumber');
      
      if (customerNumber) {
        this.loadCustomerData(customerNumber);
      } else {
        this.error = 'No se encontró número de cliente';
        this.loading = false;
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
    this.http.get<any>(`${environment.apiUrl}/customers/${customerNumber}`)
      .subscribe({
        next: (response) => {
          this.customer = response.data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar datos del cliente:', error);
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

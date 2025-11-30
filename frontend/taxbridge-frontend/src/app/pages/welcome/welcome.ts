import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  RowComponent, 
  ColComponent, 
  CardComponent, 
  CardBodyComponent, 
  CardHeaderComponent,
  BadgeComponent,
  ButtonDirective,
  ContainerComponent,
  FormControlDirective,
  // FormSelectDirective eliminado porque no se usa en la plantilla
} from '@coreui/angular';
import { CartService } from '../../services/cart.service';

interface Product {
  name: string;
  price: string;
  description: string;
  features: string[];
  badge?: string;
  badgeColor?: string;
  category: string;
  priceValue: number; // Para ordenar por precio
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    BadgeComponent,
    ButtonDirective,
    ContainerComponent,
    FormControlDirective,
    // FormSelectDirective eliminado de imports porque no se usa en la plantilla
  ],
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.scss']
})
export class WelcomeComponent {
  searchTerm: string = '';
  selectedCategory: string = 'all';
  priceRange: string = 'all';

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  allProducts: Product[] = [
    {
      name: 'Paquete API de Consulta de RUC',
      price: '$5.00',
      description: '50 consultas incluidas',
      features: [
        'Valida RUC en tiempo real',
        'Obtiene datos del contribuyente',
        'Obligaciones activas y estado fiscal',
        'Validación de clientes/proveedores',
        'Costo: $0.10 por consulta'
      ],
      badge: 'Económico',
      badgeColor: 'success',
      category: 'apis',
      priceValue: 5
    },
    {
      name: 'Paquete API de Consulta de Comprobantes',
      price: '$5.00',
      description: '34 consultas incluidas',
      features: [
        'Verifica autenticidad de comprobantes',
        'Obtiene XML completo',
        'Detecta duplicados o fraudes',
        'Ideal para auditorías',
        'Costo: $0.15 por consulta'
      ],
      badge: 'Seguridad',
      badgeColor: 'info',
      category: 'apis',
      priceValue: 5
    },
    {
      name: 'API de Facturación Electrónica',
      price: '$15/mes',
      description: 'Plan básico',
      features: [
        'Emisión de facturas',
        'Notas de crédito/débito',
        'Firma electrónica',
        'Envío automático al SRI'
      ],
      category: 'apis',
      priceValue: 15
    },
    {
      name: 'Paquete API de Retenciones',
      price: '$5.00',
      description: '25 consultas incluidas',
      features: [
        'Generación automática de retenciones',
        'Cálculo de porcentajes según normativa',
        'Envío al SRI',
        'Historial de retenciones',
        'Costo: $0.20 por consulta'
      ],
      badge: 'Nuevo',
      badgeColor: 'success',
      category: 'apis',
      priceValue: 5
    },
    {
      name: 'Plan Pay-Per-Use',
      price: '$2',
      description: 'Por extracción fiscal',
      features: [
        'Sin mensualidad',
        'Extracción automática',
        'Procesamiento en 5 minutos',
        'Ideal para PYMEs'
      ],
      badge: 'Popular',
      badgeColor: 'warning',
      category: 'planes',
      priceValue: 2
    },
    {
      name: 'Plan Premium',
      price: '$49/mes',
      description: 'Todo incluido',
      features: [
        'Extracciones ilimitadas',
        'APIs incluidas',
        'Descuentos en facturación',
        'Soporte prioritario'
      ],
      badge: 'Recomendado',
      badgeColor: 'primary',
      category: 'planes',
      priceValue: 49
    },
    {
      name: 'Plan Empresarial',
      price: '$199/mes',
      description: 'Solución a medida',
      features: [
        'Todo lo del Premium',
        'Integración personalizada',
        'Capacitación incluida',
        'Para corporaciones'
      ],
      badge: 'Premium',
      badgeColor: 'danger',
      category: 'planes',
      priceValue: 199
    },
    {
      name: 'Conciliación Bancaria',
      price: '$25/mes',
      description: 'Automatización contable',
      features: [
        'Sincronización con bancos',
        'Conciliación automática',
        'Detección de discrepancias',
        'Reportes mensuales'
      ],
      badge: 'Ahorra Tiempo',
      badgeColor: 'info',
      category: 'contabilidad',
      priceValue: 25
    },
    {
      name: 'Gestión de Inventario',
      price: '$35/mes',
      description: 'Control completo',
      features: [
        'Control de stock en tiempo real',
        'Alertas de inventario bajo',
        'Valoración de inventario',
        'Integración con facturación'
      ],
      category: 'contabilidad',
      priceValue: 35
    },
    {
      name: 'Nómina Electrónica',
      price: '$30/mes',
      description: 'Hasta 20 empleados',
      features: [
        'Cálculo automático de nómina',
        'Cumplimiento IESS',
        'Rol de pagos electrónico',
        'Declaraciones automáticas'
      ],
      badge: 'Cumplimiento Legal',
      badgeColor: 'warning',
      category: 'recursos-humanos',
      priceValue: 30
    },
    {
      name: 'Declaraciones Automáticas SRI',
      price: '$20/mes',
      description: 'Formularios 104, 103',
      features: [
        'Generación automática de formularios',
        'Envío directo al SRI',
        'Recordatorios de vencimiento',
        'Historial de declaraciones'
      ],
      category: 'tributario',
      priceValue: 20
    },
    {
      name: 'Asesoría Tributaria Virtual',
      price: '$99/mes',
      description: 'Consultas ilimitadas',
      features: [
        'Chat con expertos tributarios',
        'Respuestas en 24 horas',
        'Revisión de declaraciones',
        'Planificación fiscal'
      ],
      badge: 'Expertos',
      badgeColor: 'danger',
      category: 'servicios',
      priceValue: 99
    }
  ];

  get products(): Product[] {
    return this.allProducts.filter(product => {
      // Filtro por búsqueda
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtro por categoría
      const matchesCategory = this.selectedCategory === 'all' || product.category === this.selectedCategory;
      
      // Filtro por rango de precio
      let matchesPrice = true;
      if (this.priceRange === 'low') {
        matchesPrice = product.priceValue >= 5 && product.priceValue < 10;
      } else if (this.priceRange === 'medium') {
        matchesPrice = product.priceValue >= 10 && product.priceValue < 50;
      } else if (this.priceRange === 'high') {
        matchesPrice = product.priceValue >= 50;
      }
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.priceRange = 'all';
  }

  addToCart(product: Product): void {
    this.cartService.addToCart({
      id: this.generateProductId(product),
      name: product.name,
      price: product.priceValue,
      priceString: product.price,
      description: product.description,
      category: product.category
    });
    
    alert(`✅ "${product.name}" agregado al carrito`);
  }

  buyNow(product: Product): void {
    this.cartService.addToCart({
      id: this.generateProductId(product),
      name: product.name,
      price: product.priceValue,
      priceString: product.price,
      description: product.description,
      category: product.category
    });
    
    // Redirigir al checkout
    this.router.navigate(['/checkout']);
  }

  private generateProductId(product: Product): string {
    return product.name.toLowerCase().replace(/\s+/g, '-');
  }
}

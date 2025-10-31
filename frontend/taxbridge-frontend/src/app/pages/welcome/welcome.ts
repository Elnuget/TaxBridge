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
  FormSelectDirective
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
    FormSelectDirective
  ],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss'
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
      name: 'API de Consulta de RUC',
      price: '$0.10',
      description: 'Por consulta (desde 50)',
      features: [
        'Valida RUC en tiempo real',
        'Obtiene datos del contribuyente',
        'Obligaciones activas y estado fiscal',
        'Validación de clientes/proveedores'
      ],
      badge: 'Económico',
      badgeColor: 'success',
      category: 'apis',
      priceValue: 0.10
    },
    {
      name: 'API de Consulta de Comprobantes',
      price: '$0.15',
      description: 'Por consulta o incluida en Premium',
      features: [
        'Verifica autenticidad de comprobantes',
        'Obtiene XML completo',
        'Detecta duplicados o fraudes',
        'Ideal para auditorías'
      ],
      badge: 'Seguridad',
      badgeColor: 'info',
      category: 'apis',
      priceValue: 0.15
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
      name: 'API de Retenciones',
      price: '$0.20',
      description: 'Por consulta',
      features: [
        'Generación automática de retenciones',
        'Cálculo de porcentajes según normativa',
        'Envío al SRI',
        'Historial de retenciones'
      ],
      badge: 'Nuevo',
      badgeColor: 'success',
      category: 'apis',
      priceValue: 0.20
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
        matchesPrice = product.priceValue < 10;
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
    
    // Mostrar notificación (opcional)
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

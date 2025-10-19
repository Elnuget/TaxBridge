import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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

interface Product {
  name: string;
  price: string;
  description: string;
  features: string[];
  badge?: string;
  badgeColor?: string;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    BadgeComponent,
    ButtonDirective,
    ContainerComponent
  ],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss'
})
export class WelcomeComponent {
  products: Product[] = [
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
      badgeColor: 'success'
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
      badgeColor: 'info'
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
      badgeColor: 'warning'
    },
    {
      name: 'API de Facturación Electrónica',
      price: 'Desde $15/mes',
      description: 'Plan básico',
      features: [
        'Emisión de facturas',
        'Notas de crédito/débito',
        'Firma electrónica',
        'Envío automático al SRI'
      ]
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
      badgeColor: 'primary'
    },
    {
      name: 'Plan Empresarial',
      price: 'Personalizado',
      description: 'Solución a medida',
      features: [
        'Todo lo del Premium',
        'Integración personalizada',
        'Capacitación incluida',
        'Para corporaciones'
      ],
      badge: 'Premium',
      badgeColor: 'danger'
    }
  ];
}

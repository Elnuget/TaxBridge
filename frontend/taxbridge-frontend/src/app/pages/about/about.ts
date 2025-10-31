import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Importar módulos de CoreUI
import {
  CardModule,
  GridModule,
  BadgeModule,
  ButtonModule,
  TableModule
} from '@coreui/angular';

// Importar iconos
import { IconModule } from '@coreui/icons-angular';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    GridModule,
    BadgeModule,
    ButtonModule,
    TableModule,
    IconModule
  ],
  templateUrl: './about.html',
  styleUrls: ['./about.scss']
})
export class AboutComponent implements OnInit {

  // Información de la empresa
  companyInfo = {
    name: 'TaxBridge Ecuador',
    founded: '2024',

    // Historia
    history: [
      {
        year: '2024',
        title: 'Fundación de TaxBridge',
        description: 'Nace TaxBridge Ecuador con la visión de democratizar la gestión tributaria mediante tecnología accesible para PyMEs.'
      },
      {
        year: '2024',
        title: 'Lanzamiento de la Plataforma',
        description: 'Primera versión de la plataforma de automatización tributaria integrada con el SRI.'
      },
      {
        year: '2025',
        title: 'Expansión de Servicios',
        description: 'Incorporación de nuevos módulos y servicios para una gestión tributaria integral.'
      }
    ],

    // Misión
    mission: {
      title: 'Nuestra Misión',
      description: 'Democratizar la gestión tributaria y contable en Ecuador mediante tecnología accesible, automatizando procesos fiscales complejos para que pequeñas y medianas empresas puedan cumplir sus obligaciones con el SRI de manera eficiente, económica y sin errores, liberando tiempo valioso que pueden invertir en el crecimiento de sus negocios.'
    },

    // Visión
    vision: {
      title: 'Nuestra Visión',
      description: 'Ser la plataforma líder en automatización tributaria para PyMEs en Ecuador, reconocida por su facilidad de uso y por transformar la manera en que las empresas gestionan sus obligaciones fiscales. Aspiramos a convertirnos en el aliado tecnológico indispensable para miles de emprendedores ecuatorianos.'
    },

    // Propuesta de Valor
    valueProposition: {
      title: 'Nuestra Propuesta de Valor',
      description: 'Transformar 15-20 horas de trabajo manual en 5 minutos de procesamiento automático, por solo $2 dólares por uso, sin necesidad de conocimientos técnicos especializados.',
      features: [
        {
          icon: 'cil-speedometer',
          title: 'Ahorro de Tiempo',
          stat: '15-20 horas',
          description: 'De trabajo manual reducidas a solo 5 minutos'
        },
        {
          icon: 'cil-dollar',
          title: 'Precio Accesible',
          stat: '$2 USD',
          description: 'Por cada declaración procesada'
        },
        {
          icon: 'cil-puzzle',
          title: 'Cero Complejidad',
          stat: '100%',
          description: 'Intuitivo, sin conocimientos técnicos'
        },
        {
          icon: 'cil-check-circle',
          title: 'Sin Errores',
          stat: '0 Errores',
          description: 'Cumplimiento preciso con normativas SRI'
        }
      ]
    },

    // Valores Corporativos
    values: [
      {
        icon: 'cil-speedometer',
        title: 'Eficiencia',
        description: 'Optimizamos cada proceso para maximizar tu productividad y minimizar el tiempo invertido en tareas administrativas.'
      },
      {
        icon: 'cil-dollar',
        title: 'Accesibilidad Económica',
        description: 'Tecnología empresarial de calidad al alcance de todos los emprendedores, sin importar el tamaño de su negocio.'
      },
      {
        icon: 'cil-puzzle',
        title: 'Simplicidad',
        description: 'Convertimos procesos complejos en acciones simples. No necesitas ser experto en tributación para usar TaxBridge.'
      },
      {
        icon: 'cil-check-circle',
        title: 'Confiabilidad',
        description: 'Cumplimiento exacto con todas las normativas del SRI, garantizando seguridad jurídica para tu empresa.'
      },
      {
        icon: 'cil-shield-alt',
        title: 'Transparencia',
        description: 'Información clara sobre costos, procesos y resultados. Sin sorpresas ni letra pequeña.'
      },
      {
        icon: 'cil-lightbulb',
        title: 'Innovación',
        description: 'Evolución constante de nuestra plataforma para adaptarnos a las necesidades cambiantes del mercado ecuatoriano.'
      }
    ],

    // Datos de Contacto
    contact: {
      email: 'contacto@taxbridge.ec',
      phone: '+593 99 999 9999',
      whatsapp: '+593999999999',
      address: 'Quito, Pichincha, Ecuador',
      schedule: 'Lunes a Viernes: 9:00 AM - 6:00 PM',
      socialMedia: {
        facebook: 'https://facebook.com/taxbridgeec',
        twitter: 'https://twitter.com/taxbridgeec',
        linkedin: 'https://linkedin.com/company/taxbridge-ecuador',
        instagram: 'https://instagram.com/taxbridgeec'
      }
    },

    // Estadísticas
    stats: [
      {
        number: '500+',
        label: 'Empresas Atendidas',
        icon: 'cil-building'
      },
      {
        number: '10,000+',
        label: 'Declaraciones Procesadas',
        icon: 'cil-file'
      },
      {
        number: '99.9%',
        label: 'Precisión',
        icon: 'cil-check-circle'
      },
      {
        number: '24/7',
        label: 'Disponibilidad',
        icon: 'cil-clock'
      }
    ]
  };

  // <-- AÑADIDO: Declaración de la variable
  contactItems: any[] = [];

  constructor() { }

  ngOnInit(): void {
    // <-- AÑADIDO: Inicialización del array
    this.contactItems = [
      {
        label: 'Email',
        value: this.companyInfo.contact.email,
        icon: 'cil-envelope-closed',
        colorClass: 'bg-primary',
        link: 'mailto:' + this.companyInfo.contact.email
      },
      {
        label: 'Teléfono',
        value: this.companyInfo.contact.phone,
        icon: 'cil-phone',
        colorClass: 'bg-info',
        link: 'tel:' + this.companyInfo.contact.phone.replace(/\s+/g, '')
      },
      {
        label: 'Dirección',
        value: this.companyInfo.contact.address,
        icon: 'cil-location-pin',
        colorClass: 'bg-warning'
      },
      {
        label: 'Horario',
        value: this.companyInfo.contact.schedule,
        icon: 'cil-clock',
        colorClass: 'bg-success'
      }
    ];
  }

  // Método para abrir redes sociales
  openSocialMedia(platform: string): void {
    const url = this.companyInfo.contact.socialMedia[platform as keyof typeof this.companyInfo.contact.socialMedia];
    if (url) {
      window.open(url, '_blank');
    }
  }

  // Método para contactar por WhatsApp
  contactWhatsApp(): void {
    const message = encodeURIComponent('Hola, me gustaría obtener más información sobre TaxBridge Ecuador.');
    window.open(`https://wa.me/${this.companyInfo.contact.whatsapp}?text=${message}`, '_blank');
  }
}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- 1. Importar ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// --- IMPORTACIONES DE COREUI v4 (basado en tus otros componentes) ---
import {
  CarouselModule, // Para <c-carousel> y <c-carousel-item>
  CardModule,     // (Lo usamos en el SCSS)
  AlertModule,    // Para <c-alert>
  ContainerComponent // Para <c-container> (es standalone en v4)
} from '@coreui/angular';

// Importar iconos
import { IconModule } from '@coreui/icons-angular';

// Importar configuración de environment
import { environment } from '../../../environments/environment';

// Interfaz para el testimonio
interface Testimonial {
  _id: string;
  name: string;
  company: string;
  role: string;
  quote: string;
  rating: number;
  productUsed: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

@Component({
  selector: 'app-testimonials-slider',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    // --- Módulos v4 importados ---
    CarouselModule,
    CardModule,
    AlertModule,
    ContainerComponent,
    IconModule
  ],
  templateUrl: './testimonials.html', // El nombre que tú definiste
  styleUrls: ['./testimonials.scss']   // El nombre que tú definiste
})
export class TestimonialsSliderComponent implements OnInit {

  testimonials: Testimonial[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  private apiUrl = `${environment.apiUrl}/testimonials`;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef // <-- 2. Inyectar ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.fetchTestimonials();
  }

  fetchTestimonials(): void {
    this.isLoading = true;
    
    // 🔍 DEBUG: Mostrar información de la URL que se está usando
    console.log('=== DEBUG TESTIMONIOS ===');
    console.log('📍 URL de API:', this.apiUrl);
    console.log('🌐 Environment:', environment);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    this.http.get<{ success: boolean, count: number, data: Testimonial[] }>(this.apiUrl)
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta exitosa:', response);
          console.log('📊 Cantidad de testimonios:', response.count);
          
          if (response.success) {
            this.testimonials = response.data;
            console.log('✅ Testimonios cargados:', this.testimonials.length);
          } else {
            this.error = 'No se pudieron cargar los testimonios.';
            console.warn('⚠️ Respuesta no exitosa:', response);
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          // 🔍 DEBUG DETALLADO DEL ERROR
          console.error('❌ === ERROR DETALLADO ===');
          console.error('📍 URL intentada:', this.apiUrl);
          console.error('🔴 Código de estado:', err.status);
          console.error('🔴 Mensaje de error:', err.message);
          console.error('🔴 Error completo:', err);
          console.error('🔴 Error response:', err.error);
          console.error('🔴 Headers:', err.headers);
          
          // Mensaje de error más descriptivo
          let errorMsg = 'Error de conexión al cargar testimonios.';
          
          if (err.status === 0) {
            errorMsg = `❌ No se pudo conectar al servidor. URL: ${this.apiUrl}. Verifica que el backend esté corriendo.`;
          } else if (err.status === 404) {
            errorMsg = `❌ Endpoint no encontrado (404). URL: ${this.apiUrl}`;
          } else if (err.status === 500) {
            errorMsg = `❌ Error del servidor (500). URL: ${this.apiUrl}`;
          } else {
            errorMsg = `❌ Error ${err.status}: ${err.message}. URL: ${this.apiUrl}`;
          }
          
          this.error = errorMsg;
          console.error('💬 Mensaje mostrado al usuario:', errorMsg);
          
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  // Función para crear un array de estrellas para el rating
  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}


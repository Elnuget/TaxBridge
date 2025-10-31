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

  private apiUrl = 'http://localhost:3000/api/testimonials';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef // <-- 2. Inyectar ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.fetchTestimonials();
  }

  fetchTestimonials(): void {
    this.isLoading = true;
    this.http.get<{ success: boolean, count: number, data: Testimonial[] }>(this.apiUrl)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.testimonials = response.data;
          } else {
            this.error = 'No se pudieron cargar los testimonios.';
          }
          this.isLoading = false;
          this.cdr.markForCheck(); // <-- 3. AVISAR A ANGULAR (para zoneless)
        },
        error: (err) => {
          console.error('Error al obtener testimonios:', err);
          this.error = 'Error de conexión al cargar testimonios.';
          this.isLoading = false;
          this.cdr.markForCheck(); // <-- 3. AVISAR A ANGULAR (para zoneless)
        }
      });
  }

  // Función para crear un array de estrellas para el rating
  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}


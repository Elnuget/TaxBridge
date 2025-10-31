import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { 
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ButtonDirective
} from '@coreui/angular';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
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
    ButtonDirective
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class CheckoutComponent {
  // Cart items from service
  cartItems = computed(() => this.cartService.items());
  subtotal = computed(() => this.cartService.subtotal());
  tax = computed(() => this.cartService.tax());
  total = computed(() => this.cartService.total());

  constructor(
    private cartService: CartService,
    private http: HttpClient,
    private router: Router
  ) {}

  // Payment method
  paymentMethod = signal<'card' | 'transfer' | 'cash' | 'wallet'>('card');
  
  // Payment code
  paymentCode = `TB-${Math.floor(Math.random() * 1000000)}`;

  // Card form
  cardNumber = '';
  cardName = '';
  cardExpiry = '';
  cardCvv = '';

  // Transfer form
  transferBank = '';
  transferAccount = '';

  // Personal info
  fullName = '';
  email = '';
  phone = '';
  identification = '';

  // Billing address
  country = 'Ecuador';
  city = '';
  address = '';

  setPaymentMethod(method: 'card' | 'transfer' | 'cash' | 'wallet') {
    this.paymentMethod.set(method);
  }

  removeItem(id: string) {
    this.cartService.removeFromCart(id);
  }

  updateQuantity(id: string, quantity: number) {
    this.cartService.updateQuantity(id, quantity);
  }

  onSubmitPayment() {
    // Validar que haya productos en el carrito
    if (this.cartItems().length === 0) {
      alert('❌ Tu carrito está vacío');
      return;
    }

    // Validar campos requeridos
    if (!this.fullName || !this.email || !this.phone || !this.identification) {
      alert('❌ Por favor completa todos los campos requeridos');
      return;
    }

    // Preparar datos para enviar al backend
    const customerData = {
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      identification: this.identification,
      paymentMethod: this.paymentMethod(),
      products: this.cartItems().map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category
      }))
    };

    // Mostrar indicador de carga
    const processingMessage = 'Procesando tu compra...';
    console.log(processingMessage, customerData);

    // Enviar al backend
    this.http.post(`${environment.apiUrl}/customers`, customerData)
      .subscribe({
        next: (response: any) => {
          // Guardar datos del cliente en localStorage
          localStorage.setItem('customerNumber', response.data.customerNumber);
          localStorage.setItem('customerEmail', response.data.email);
          localStorage.setItem('temporaryPassword', response.data.temporaryPassword);
          
          // Limpiar carrito
          this.cartService.clearCart();
          
          // Mostrar mensaje con credenciales
          const message = `🎉 ¡Compra exitosa!\n\n` +
            `📋 Número de Cliente: ${response.data.customerNumber}\n` +
            `📧 Email: ${response.data.email}\n` +
            `🔑 Contraseña Temporal: ${response.data.temporaryPassword}\n\n` +
            `⚠️ IMPORTANTE: Guarda esta información. Puedes iniciar sesión con tu email y esta contraseña temporal.\n` +
            `Te recomendamos cambiar tu contraseña después de iniciar sesión.\n\n` +
            `Serás redirigido a tu dashboard...`;
          
          alert(message);
          
          // Redirigir al dashboard
          this.router.navigate(['/dashboard'], {
            queryParams: { 
              customerNumber: response.data.customerNumber,
              showCredentials: 'true'
            }
          });
        },
        error: (error) => {
          console.error('Error al procesar la compra:', error);
          const errorMessage = error.error?.message || 'Error al procesar la compra. Por favor intenta nuevamente.';
          alert(`❌ ${errorMessage}`);
        }
      });
  }
}

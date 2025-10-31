import { Component, signal, computed } from '@angular/core';
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
  ButtonDirective
} from '@coreui/angular';
import { CartService } from '../../services/cart.service';

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

  constructor(private cartService: CartService) {}

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
    console.log('Processing payment...', {
      method: this.paymentMethod(),
      total: this.total(),
      items: this.cartItems()
    });
    alert('¡Pago procesado exitosamente! (Esto es una simulación)');
    this.cartService.clearCart();
  }
}

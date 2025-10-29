import { Component, signal } from '@angular/core';
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

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

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
  // Cart items (simulados)
  cartItems = signal<CartItem[]>([
    { id: 1, name: 'Plan Pay-Per-Use', price: 2, quantity: 1 },
  ]);

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

  get subtotal(): number {
    return this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get tax(): number {
    return this.subtotal * 0.12; // IVA 12%
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  setPaymentMethod(method: 'card' | 'transfer' | 'cash' | 'wallet') {
    this.paymentMethod.set(method);
  }

  removeItem(id: number) {
    this.cartItems.update(items => items.filter(item => item.id !== id));
  }

  onSubmitPayment() {
    console.log('Processing payment...', {
      method: this.paymentMethod(),
      total: this.total,
      items: this.cartItems()
    });
    alert('¡Pago procesado exitosamente! (Esto es una simulación)');
  }
}

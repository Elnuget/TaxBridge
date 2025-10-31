import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  priceString: string;
  description: string;
  quantity: number;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private cartItems = signal<CartItem[]>([]);

  // Computed signals
  items = computed(() => this.cartItems());
  itemCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));
  subtotal = computed(() => this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0));
  tax = computed(() => this.subtotal() * 0.12); // IVA 12%
  total = computed(() => this.subtotal() + this.tax());

  constructor() {
    // Cargar carrito desde localStorage solo en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.loadCart();
    }
  }

  addToCart(product: Omit<CartItem, 'quantity'>): void {
    const existingItem = this.cartItems().find(item => item.id === product.id);
    
    if (existingItem) {
      this.updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      this.cartItems.update(items => [...items, { ...product, quantity: 1 }]);
      this.saveCart();
    }
  }

  removeFromCart(productId: string): void {
    this.cartItems.update(items => items.filter(item => item.id !== productId));
    this.saveCart();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.cartItems.update(items =>
      items.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
    this.saveCart();
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.saveCart();
  }

  private saveCart(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('taxbridge-cart', JSON.stringify(this.cartItems()));
    }
  }

  private loadCart(): void {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('taxbridge-cart');
      if (saved) {
        try {
          this.cartItems.set(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading cart:', e);
        }
      }
    }
  }
}

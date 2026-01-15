import { Component, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { 
  ContainerComponent,
  BadgeComponent,
  ButtonDirective
} from '@coreui/angular';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-navbar-shop',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ContainerComponent,
    BadgeComponent,
    ButtonDirective
  ],
  templateUrl: './navbar-shop.html',
  styleUrl: './navbar-shop.scss'
})
export class NavbarShopComponent {
  cartItemsCount = computed(() => this.cartService.itemCount());
  isLoggedIn = computed(() => this.authService.loggedIn());
  // Detectar rol/admin de la sesión (evitar acceso a localStorage en SSR)
  private platformId = inject(PLATFORM_ID);

  isAdmin = computed(() => {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      // También requerir que el sistema considere sesión activa
      if (!this.isLoggedIn()) return false;
      const raw = localStorage.getItem('taxbridge_user');
      if (!raw) return false;
      const user = JSON.parse(raw);
      return user && (user.rol === 'admin' || user.rol === 'Administrador' || user.rol === 'admin');
    } catch (e) {
      return false;
    }
  });

  isContador = computed(() => {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      if (!this.isLoggedIn()) return false;
      const raw = localStorage.getItem('taxbridge_user');
      if (!raw) return false;
      const user = JSON.parse(raw);
      return user && (user.rol === 'contador' || user.rol === 'Contador');
    } catch (e) {
      return false;
    }
  });

  // Link dinámico del dashboard según rol
  dashboardLink = computed(() => {
    if (this.isAdmin()) return '/admin-dashboard';
    if (this.isContador()) return '/contador-dashboard';
    return '/customer-dashboard';
  });

  // Estilos dinámicos para el botón
  dashboardButtonColor = computed(() => {
    if (this.isAdmin()) return 'primary';
    if (this.isContador()) return 'warning';
    return 'success';
  });
  dashboardButtonVariant = computed(() => {
    if (this.isAdmin()) return 'filled';
    if (this.isContador()) return 'filled';
    return 'outline';
  });

  constructor(
    private cartService: CartService,
    public authService: AuthService
  ) {}

  logout() {
    this.authService.logout();
  }
}

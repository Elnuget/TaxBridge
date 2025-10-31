import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { 
  ContainerComponent,
  BadgeComponent,
  ButtonDirective
} from '@coreui/angular';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth';

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

  constructor(
    private cartService: CartService,
    public authService: AuthService
  ) {}

  logout() {
    this.authService.logout();
  }
}

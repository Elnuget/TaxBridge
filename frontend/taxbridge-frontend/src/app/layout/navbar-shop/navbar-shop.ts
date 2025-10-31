import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { 
  ContainerComponent,
  BadgeComponent,
  ButtonDirective
} from '@coreui/angular';

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
  cartItemsCount = 0;
}

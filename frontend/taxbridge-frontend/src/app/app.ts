import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarShopComponent } from './layout/navbar-shop/navbar-shop';
import { FooterComponent } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavbarShopComponent,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('TaxBridge - Tienda de Soluciones Tributarias');
}

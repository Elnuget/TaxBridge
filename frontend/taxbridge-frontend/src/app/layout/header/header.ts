import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  constructor(private router: Router) {}

  logout() {
    // Implementar lógica de logout
    console.log('Cerrando sesión...');
    this.router.navigate(['/login']);
  }
}

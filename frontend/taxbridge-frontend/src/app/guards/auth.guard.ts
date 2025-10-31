import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loggedIn()) {
    return true;
  } else {
    // Redirigir al login si no está autenticado
    router.navigate(['/auth']);
    return false;
  }
};

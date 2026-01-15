import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Interceptor de autenticación
 * Agrega el token JWT a todas las peticiones HTTP
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  // Solo en el navegador
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }
  
  // Obtener el token del localStorage
  const token = localStorage.getItem('taxbridge_token');
  
  // Si hay token, agregarlo a los headers
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('🔐 Token agregado a la petición:', req.url);
  }
  
  return next(req);
};

import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { throwError } from 'rxjs';

/**
 * Interceptor para asegurar que las peticiones HTTP solo se hagan en el navegador
 * y no durante el SSR (Server-Side Rendering)
 */
export const browserHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  // Si estamos en el servidor (SSR), no hacer la petición
  if (!isPlatformBrowser(platformId)) {
    console.log('[SSR] Bloqueando petición HTTP durante renderizado del servidor:', req.url);
    // Retornar un error observable para que no se ejecute la petición
    return throwError(() => new Error('HTTP requests not allowed during SSR'));
  }
  
  // Si estamos en el navegador, continuar con la petición normalmente
  return next(req);
};

import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas con parámetros dinámicos - usar Server rendering
  {
    path: 'clients/edit-user/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'clients/show-user/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'clients/edit-customer/:customerNumber',
    renderMode: RenderMode.Server
  },
  {
    path: 'clients/show-customer/:customerNumber',
    renderMode: RenderMode.Server
  },
  // Credenciales SRI - renderizar solo en cliente (hace llamadas API)
  {
    path: 'sri-credentials',
    renderMode: RenderMode.Client
  },
  {
    path: 'sri-credentials/graph',
    renderMode: RenderMode.Client
  },
  {
    path: 'sri-credentials/:id/graph',
    renderMode: RenderMode.Server
  },
  // Rutas estáticas - prerender
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];

import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards';

/**
 * Rutas de artículos (/articulos/...).
 * Mis artículos está en /mis-articulos y se registra en app.routes.ts.
 * Las rutas fijas (nuevo) van antes que las que tienen :id para que no se confundan.
 */
export const ARTICULOS_ROUTES: Routes = [
  // /articulos sin nada más lleva al buscador, que es donde se listan todos
  { path: '', redirectTo: '/busqueda', pathMatch: 'full' },
  {
    path: 'nuevo',
    canActivate: [authGuard],
        loadComponent: () => import('./formulario-articulo/formulario-articulo').then(m => m.FormularioArticulo)
  },
  {
    path: ':id/editar',
    canActivate: [authGuard],
        loadComponent: () => import('./formulario-articulo/formulario-articulo').then(m => m.FormularioArticulo)
  },
  {
    // El detalle es público: no lleva authGuard
    path: ':id',
      loadComponent: () => import('./detalle-articulo/detalle-articulo').then(m => m.DetalleArticulo)
  }
];
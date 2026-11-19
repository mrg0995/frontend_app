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
    loadComponent: () => import('../../shared/pagina-pendiente.component').then(m => m.PaginaPendienteComponent),
    data: { titulo: 'Vender una joya', detalle: 'Aquí irá el formulario para crear un artículo.' }
  },
  {
    path: ':id/editar',
    canActivate: [authGuard],
    loadComponent: () => import('../../shared/pagina-pendiente.component').then(m => m.PaginaPendienteComponent),
    data: { titulo: 'Editar artículo', detalle: 'Aquí irá el formulario para editar el artículo.' }
  },
  {
    // El detalle es público: no lleva authGuard
    path: ':id',
    loadComponent: () => import('../../shared/pagina-pendiente.component').then(m => m.PaginaPendienteComponent),
    data: { titulo: 'Detalle del artículo', detalle: 'Aquí irán las fotos y los datos del artículo.' }
  }
];
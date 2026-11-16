import { Routes } from '@angular/router';

export const ARTICULOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../shared/pagina-pendiente.component').then(m => m.PaginaPendienteComponent),
    data: { titulo: 'Artículos', detalle: 'Aquí se mostrará el catálogo de artículos.' }
  }
];

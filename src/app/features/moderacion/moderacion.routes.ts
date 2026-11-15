import { Routes } from '@angular/router';

export const MODERACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../shared/pagina-pendiente.component').then(m => m.PaginaPendienteComponent),
    data: { titulo: 'Moderación', detalle: 'Esta pantalla estará disponible para moderadores y administradores.' }
  }
];

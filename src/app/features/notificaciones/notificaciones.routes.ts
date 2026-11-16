import { Routes } from '@angular/router';

export const NOTIFICACIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../shared/pagina-pendiente.component').then(m => m.PaginaPendienteComponent),
    data: { titulo: 'Notificaciones', detalle: 'Aquí se verán los avisos de la cuenta.' }
  }
];

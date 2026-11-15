import { Routes } from '@angular/router';

export const MENSAJES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../shared/pagina-pendiente.component').then(m => m.PaginaPendienteComponent),
    data: { titulo: 'Mensajes', detalle: 'Aquí aparecerán las conversaciones del usuario.' }
  }
];

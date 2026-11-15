import { Routes } from '@angular/router';

// Ruta provisional hasta que se integre la pantalla de perfil del equipo.
export const PERFIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../shared/pagina-pendiente.component').then(m => m.PaginaPendienteComponent),
    data: { titulo: 'Mi perfil', detalle: 'Vista del perfil pendiente de integrar.' }
  }
];

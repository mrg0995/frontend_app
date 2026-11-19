import { Routes } from '@angular/router';

// Portada de la web (/). De momento, página provisional
export const INICIO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../shared/pagina-pendiente.component').then(m => m.PaginaPendienteComponent),
    data: { titulo: 'Inicio', detalle: 'Aquí irá la portada: categorías y últimos artículos.' }
  }
];

import { Routes } from '@angular/router';

// Portada de la web (/)
export const INICIO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./inicio').then(m => m.Inicio)
  }
];

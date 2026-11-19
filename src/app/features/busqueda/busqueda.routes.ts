import { Routes } from '@angular/router';

export const BUSQUEDA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./busqueda').then(m => m.Busqueda)
  }
];

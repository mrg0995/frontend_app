import { Routes } from '@angular/router';

export const MENSAJES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./bandeja/bandeja').then(m => m.Bandeja)
  }
];
import { Routes } from '@angular/router';

export const MENSAJES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./bandeja/bandeja').then(m => m.Bandeja)
  },
  {
    path: ':id',
    loadComponent: () => import('./chat/chat.component').then(m => m.ChatComponent)
  }
];
import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards';

export const AUTH_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('../../pages/auth.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () => import('../../pages/auth.component').then(m => m.RegisterComponent)
  }
];

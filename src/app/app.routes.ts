import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';

// Este archivo reparte las secciones. Cada compañero edita las rutas de su carpeta.
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./features/inicio/inicio.routes').then(m => m.INICIO_ROUTES)
  },
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'registro', redirectTo: 'auth/registro', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadChildren: () => import('./features/perfil/perfil.routes').then(m => m.PERFIL_ROUTES)
  },
  {
    path: 'usuarios/:id',
    loadComponent: () => import('./features/perfil/perfil-publico/perfil-publico').then(m => m.PerfilPublico)
  },
  {
    path: 'articulos',
    loadChildren: () => import('./features/articulos/articulos.routes').then(m => m.ARTICULOS_ROUTES)
  },
  {
    path: 'mis-articulos',
    canActivate: [authGuard],
    loadComponent: () => import('./features/articulos/mis-articulos/mis-articulos').then(m => m.MisArticulos)
  },
  {
    path: 'busqueda',
    loadChildren: () => import('./features/busqueda/busqueda.routes').then(m => m.BUSQUEDA_ROUTES)
  },
  {
    path: 'mensajes',
    canActivate: [authGuard],
    loadChildren: () => import('./features/mensajes/mensajes.routes').then(m => m.MENSAJES_ROUTES)
  },
  {
    path: 'notificaciones',
    canActivate: [authGuard],
    loadChildren: () => import('./features/notificaciones/notificaciones.routes').then(m => m.NOTIFICACIONES_ROUTES)
  },
  {
    path: 'moderacion',
    canActivate: [roleGuard('moderador', 'administrador')],
    loadChildren: () => import('./features/moderacion/moderacion.routes').then(m => m.MODERACION_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [roleGuard('administrador')],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'ayuda',
    loadComponent: () => import('./features/ayuda/ayuda').then(m => m.Ayuda)
  },
  {
    path: 'legal',
    loadComponent: () => import('./features/legal/legal').then(m => m.Legal)
  },
  { path: '**', redirectTo: '' }
];

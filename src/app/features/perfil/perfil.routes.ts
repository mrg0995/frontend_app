import { Routes } from '@angular/router';
import { MiPerfil } from './mi-perfil/mi-perfil';
import { PerfilPublico } from './perfil-publico/perfil-publico';

export const PERFIL_ROUTES: Routes = [
  { path: '', component: MiPerfil },
  { path: ':id', component: PerfilPublico }
];

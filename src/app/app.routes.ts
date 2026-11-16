import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';
import { MiPerfil } from './features/perfil/mi-perfil/mi-perfil';
import { PerfilPublico } from './features/perfil/perfil-publico/perfil-publico';
import { InicioModerador } from './features/inicio-moderador/inicio-moderador';
import { InicioAdmin } from './features/inicio-admin/inicio-admin';

export const routes: Routes = [
  { path: 'perfil', component: MiPerfil, canActivate: [authGuard] },
  { path: 'perfil/:id', component: PerfilPublico, canActivate: [authGuard] },
  { path: 'moderacion', component: InicioModerador, canActivate: [roleGuard('moderador', 'administrador')] },
  { path: 'admin', component: InicioAdmin, canActivate: [roleGuard('administrador')] }
];
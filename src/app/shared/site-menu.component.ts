import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-site-menu',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="menu" aria-label="Menú principal">
      <a routerLink="/articulos" routerLinkActive="activo">Artículos</a>
      <a routerLink="/busqueda" routerLinkActive="activo">Buscar</a>
      @if (auth.isLogged()) {
        <a routerLink="/perfil" routerLinkActive="activo">Mi perfil</a>
        <a routerLink="/mensajes" routerLinkActive="activo">Mensajes</a>
        <a routerLink="/notificaciones" routerLinkActive="activo">Avisos</a>
        @if (auth.isStaff()) {
          <a routerLink="/moderacion" routerLinkActive="activo">Moderación</a>
        }
        @if (auth.role() === 'administrador') {
          <a routerLink="/admin" routerLinkActive="activo">Admin</a>
        }
        <button type="button" (click)="auth.logout()">Salir</button>
      } @else {
        <a routerLink="/auth/login" routerLinkActive="activo">Entrar</a>
        <a routerLink="/auth/registro" class="destacado">Registrarme</a>
      }
    </nav>
  `,
  styles: [`
    .menu { display: flex; flex-wrap: wrap; align-items: center; gap: .3rem; justify-content: center; }
    .menu a, .menu button { display: inline-block; font: inherit; text-decoration: none; padding: .5rem .65rem; color: var(--color-text); border: 0; border-radius: var(--radius); background: transparent; cursor: pointer; }
    .menu a:hover, .menu button:hover, .menu .activo { background: var(--color-hover); color: var(--color-primary); }
    .menu .destacado { background: var(--color-primary); color: #fff; }
    .menu .destacado:hover { background: var(--color-primary-dark); color: #fff; }
  `]
})
export class SiteMenuComponent {
  auth = inject(AuthService);
}

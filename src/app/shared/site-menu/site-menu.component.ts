import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ContadorMensajes } from '../../features/mensajes/contador-mensajes/contador-mensajes';

/**
 * Menú de la cabecera.
 * - Ordenador: iconos de Mensajes y Avisos, avatar con menú desplegable y botón «+ Vender».
 * - Móvil (menos de 760 px): botón de hamburguesa que abre un panel con todas las opciones.
 * Lo que se ve depende de si hay sesión y del rol del usuario.
 */
@Component({
  selector: 'app-site-menu',
  imports: [RouterLink, RouterLinkActive, ContadorMensajes],
  templateUrl: './site-menu.component.html',
  styleUrl: './site-menu.component.css',
})
export class SiteMenuComponent {
  auth = inject(AuthService);

  /** Menú del usuario (ordenador): abierto o cerrado */
  desplegable = signal(false);

  /** Panel de hamburguesa (móvil): abierto o cerrado */
  movil = signal(false);

  /**
   * Abre o cierra el menú del usuario.
   * stopPropagation evita que el clic llegue al document y lo cierre en el mismo momento.
   */
  cambiarDesplegable(evento: Event) {
    evento.stopPropagation();
    this.desplegable.set(!this.desplegable());
  }

  /** Cierra el menú del usuario */
  cerrar() {
    this.desplegable.set(false);
  }

  /** Cierra el menú del usuario al hacer clic en cualquier otra parte de la página */
  @HostListener('document:click')
  alHacerClicFuera() {
    this.cerrar();
  }
}
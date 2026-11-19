import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, NavigationEnd} from '@angular/router';
import { SiteMenuComponent } from '../site-menu/site-menu.component';
import { LogoComponent } from '../logo.component';

/**
 * Cabecera de la web: logo, buscador y menú.
 * Se queda fija arriba al hacer scroll (position: sticky).
 */
@Component({
  selector: 'app-site-header',
  imports: [RouterLink, SiteMenuComponent, LogoComponent],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.css',
})
export class SiteHeaderComponent {
  private router = inject(Router);

  /** Texto de la búsqueda actual (?q= de la URL), para que el buscador lo enseñe */
  textoBuscado = signal('');

  constructor() {
    // Si se quita la búsqueda, el buscador se vacía.
    this.router.events.subscribe((evento) => {
      if (evento instanceof NavigationEnd) {
        this.textoBuscado.set(this.router.parseUrl(this.router.url).queryParams['q'] ?? '');
      }
    });
  }

  /**
   * Lleva a la página de búsqueda con el texto escrito, por ejemplo /busqueda?q=anillo.
   * Si el texto está vacío, va a /busqueda sin filtro.
   * @param evento El submit del formulario (se cancela para que no recargue la página)
   * @param texto Lo que ha escrito el usuario
   */
  buscar(evento: Event, texto: string) {
    evento.preventDefault();
    const q = texto.trim();
    this.router.navigate(['/busqueda'], { queryParams: q ? { q } : {} });
  }
}

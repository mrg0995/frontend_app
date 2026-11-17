import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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

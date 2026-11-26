import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Página legal (/legal): aviso legal, privacidad y cookies.
 * Solo texto: los estilos son los de .pagina-texto en styles.css (los comparte con /ayuda).
 */
@Component({
  selector: 'app-legal',
  imports: [RouterLink],
  templateUrl: './legal.html',
})
export class Legal {}

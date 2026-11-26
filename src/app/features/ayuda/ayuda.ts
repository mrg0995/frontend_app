import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Página de ayuda (/ayuda): cómo funciona rejoya y preguntas frecuentes.
 */
@Component({
  selector: 'app-ayuda',
  imports: [RouterLink],
  templateUrl: './ayuda.html',
})
export class Ayuda {}
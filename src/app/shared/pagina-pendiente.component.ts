import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Pantalla provisional para poder navegar hasta que cada sección tenga su componente.
@Component({
  selector: 'app-pagina-pendiente',
  imports: [RouterLink],
  template: `
    <section class="card placeholder">
      <h1>{{ titulo }}</h1>
      <p class="muted">{{ detalle }}</p>
      <p class="small muted">Apartado pendiente de desarrollar por el equipo.</p>
      <a routerLink="/" class="btn btn-outline">Volver al inicio</a>
    </section>
  `,
  styles: [`
    .placeholder { max-width: 680px; margin: 2rem auto; }
    .placeholder p { margin-bottom: 1rem; }
  `]
})
export class PaginaPendienteComponent {
  private route = inject(ActivatedRoute);
  titulo = this.route.snapshot.data['titulo'] ?? 'Sección';
  detalle = this.route.snapshot.data['detalle'] ?? '';
}

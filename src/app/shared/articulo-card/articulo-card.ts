import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticuloTarjeta, CONDITION_LABEL, STATUS_LABEL } from '../../core/models';

/**
 * Tarjeta de un artículo para los listados: foto de portada, precio, título,
 * estado de conservación y ubicación. Al pulsarla se abre el detalle (/articulos/:id).
 *
 * Uso:
 *   <app-articulo-card [articulo]="a" />                          → búsqueda, inicio y perfil público
 *   <app-articulo-card [articulo]="a" [mostrarEstado]="true">     → Mis artículos, con la etiqueta del estado
 *     <button class="btn btn-outline">Editar</button>             → lo que va dentro sale abajo (acciones)
 *   </app-articulo-card>
 */
@Component({
  selector: 'app-articulo-card',
  imports: [RouterLink],
  templateUrl: './articulo-card.html',
  styleUrl: './articulo-card.css',
})
export class ArticuloCard {
  articulo = input.required<ArticuloTarjeta>();
  mostrarEstado = input(false);

  protected readonly precio = computed(() =>
    this.articulo().precio.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: Number.isInteger(this.articulo().precio) ? 0 : 2,
    }),
  );

  protected readonly estados = STATUS_LABEL;
  protected readonly conservacion = CONDITION_LABEL;
}

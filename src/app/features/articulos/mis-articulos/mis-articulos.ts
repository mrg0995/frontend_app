import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';
import { ArticuloTarjeta } from '../../../core/models';
import { errMsg } from '../../../core/api.service';
import { ArticuloCard } from '../../../shared/articulo-card/articulo-card';
import { Articulos } from '../articulos';

/**
 * Mis artículos (/mis-articulos): todos los artículos del usuario, en cualquier estado.
 * Cada tarjeta enseña la etiqueta de su estado y los botones que tienen sentido en ese estado:
 * - borrador: Editar, Publicar y Borrar
 * - publicado: Editar, Marcar vendido y Borrar
 * - vendido y retirado: Borrar
 * - en revisión: ningún botón (lo está revisando un moderador)
 */
@Component({
  selector: 'app-mis-articulos',
  imports: [RouterLink, ArticuloCard],
  templateUrl: './mis-articulos.html',
  styleUrl: './mis-articulos.css'
})
export class MisArticulos implements OnInit {
  private articulos = inject(Articulos);

  lista = signal<ArticuloTarjeta[]>([]);
  cargando = signal(true);
  error = signal('');
  aviso = signal('');

  /** Id del artículo que está pidiendo confirmación para borrarse */
  confirmandoBorrar = signal<number | null>(null);

  /** Id del artículo con una acción en marcha, para desactivar sus botones */
  ocupado = signal<number | null>(null);

  ngOnInit() {
    this.cargar();
  }

  /** Pide al servicio mis artículos y los pinta */
  cargar() {
    this.cargando.set(true);
    this.articulos.getMisArticulos().subscribe({
      next: lista => {
        this.lista.set(lista);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(errMsg(e));
        this.cargando.set(false);
      }
    });
  }

  publicar(a: ArticuloTarjeta) {
    this.ejecutar(a, this.articulos.publicar(a.id), `«${a.titulo}» se ha publicado.`);
  }

  marcarVendido(a: ArticuloTarjeta) {
    this.ejecutar(a, this.articulos.marcarVendido(a.id), `«${a.titulo}» se ha marcado como vendido.`);
  }

  /** Primer clic en Borrar: pide confirmación en la propia tarjeta */
  pedirBorrar(a: ArticuloTarjeta) {
    this.confirmandoBorrar.set(a.id);
  }

  cancelarBorrar() {
    this.confirmandoBorrar.set(null);
  }

  /** Segundo clic, en «Sí, borrar» */
  borrar(a: ArticuloTarjeta) {
    this.confirmandoBorrar.set(null);
    this.ejecutar(a, this.articulos.borrar(a.id), `«${a.titulo}» se ha borrado.`);
  }

  /**
   * Lanza una acción sobre un artículo y, si va bien, vuelve a cargar la lista
   * para que se vea el estado nuevo. Si el back responde con error (por ejemplo,
   * un 409 al publicar sin fotos), enseña su mensaje.
   */
  private ejecutar(a: ArticuloTarjeta, accion: Observable<unknown>, textoOk: string) {
    this.error.set('');
    this.aviso.set('');
    this.ocupado.set(a.id);
    accion.subscribe({
      next: () => {
        this.ocupado.set(null);
        this.aviso.set(textoOk);
        this.cargar();
      },
      error: (e: HttpErrorResponse) => {
        this.ocupado.set(null);
        this.error.set(errMsg(e));
      }
    });
  }
}

import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../../core/auth.service';
import { errMsg } from '../../../core/api.service';
import { Articulo, CONDITION_LABEL, STATUS_LABEL } from '../../../core/models';
import { Articulos } from '../articulos';

/**
 * Detalle de un artículo (/articulos/:id). Es público: no hace falta iniciar sesión.
 *
 * Primero lo pide a la ruta pública, que solo devuelve artículos publicados o vendidos.
 * Si da 404 y hay sesión, lo pide a la ruta del dueño: así el vendedor también puede ver
 * sus borradores y sus artículos retirados (por ejemplo, al pulsar la tarjeta en Mis artículos).
 */
@Component({
  selector: 'app-detalle-articulo',
  imports: [RouterLink],
  templateUrl: './detalle-articulo.html',
  styleUrl: './detalle-articulo.css'
})
export class DetalleArticulo implements OnInit {
    private route = inject(ActivatedRoute);
    private http = inject(HttpClient);
    private router = inject(Router);
    private location = inject(Location);
    private articulos = inject(Articulos);
    protected auth = inject(AuthService);

  protected readonly conservacion = CONDITION_LABEL;
    protected readonly estados = STATUS_LABEL;
    
    readonly enviandoConversacion = signal(false);

readonly esMiArticulo = computed(() => {
  const art = this.articulo();
  const miId = this.auth.getUsuarioActualId();
  if (!art || miId === null) return false;
  return art.vendedorId === miId;
});
    
contactar(): void {
    const art = this.articulo() as Record<string, unknown> | null;
    if (!art) return;
  
    // 1. Sin sesión -> al login
    if (!this.auth.estaAutenticado()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }
  
    if (this.enviandoConversacion()) return;
    this.enviandoConversacion.set(true);
  
    // 2. POST /api/conversaciones y navegar a /mensajes/:id
    this.http
      .post<{ id: number }>('/api/conversaciones', {
        id_articulo: art['id'],
      })
      .subscribe({
        next: (conversacion) => {
          this.enviandoConversacion.set(false);
          this.router.navigate(['/mensajes', conversacion.id]);
        },
        error: (err) => {
          this.enviandoConversacion.set(false);
          console.error('Error al iniciar conversación:', err);
        },
      });
  }

  articulo = signal<Articulo | null>(null);
  cargando = signal(true);
  error = signal('');

  /** Posición de la foto que se ve en grande */
  fotoActual = signal(0);

  /** ¿El usuario que mira es el vendedor? Entonces ve «Editar» en vez de «Contactar» */
  esMio = computed(() => {
    const a = this.articulo();
    return !!a && a.vendedor.id === this.auth.user()?.id;
  });

  precio = computed(() => {
    const p = this.articulo()?.precio ?? 0;
    return p.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: Number.isInteger(p) ? 0 : 2
    });
  });

  ngOnInit() {
    // paramMap por si se pasa de un artículo a otro sin salir de la página
    this.route.paramMap.subscribe(params => this.cargar(Number(params.get('id'))));
  }

  private cargar(id: number) {
    this.cargando.set(true);
    this.error.set('');
    this.fotoActual.set(0);

    this.articulos
      .getArticulo(id)
      .pipe(
        // Si no es público pero hay sesión, puede que sea mío (borrador, retirado…)
        catchError((e: HttpErrorResponse) =>
          e.status === 404 && this.auth.isLogged() ? this.articulos.getMiArticulo(id) : throwError(() => e)
        )
      )
      .subscribe({
        next: a => {
          this.articulo.set({ ...a, fotos: [...a.fotos].sort((x, y) => x.posicion - y.posicion) });
          this.cargando.set(false);
        },
        error: (e: HttpErrorResponse) => {
          this.error.set(e.status === 404 || e.status === 403 ? 'Este artículo no existe o ya no está disponible.' : errMsg(e));
          this.cargando.set(false);
        }
      });
  }

  verFoto(i: number) {
    this.fotoActual.set(i);
  }

  /**
   * «← Volver»: vuelve a la página de la que vienes (búsqueda, Mis artículos, portada, un perfil…).
   * Si se ha entrado directamente con el enlace del artículo, no hay página anterior en la web,
   * así que lleva a la búsqueda.
   * Angular guarda en history.state un navigationId que empieza en 1 con la primera página que se abre.
   */
  volver() {
    const navegacion = (this.location.getState() as { navigationId?: number } | null)?.navigationId ?? 1;
    if (navegacion > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/busqueda']);
    }
  }
}

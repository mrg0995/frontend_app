import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { switchMap, tap } from 'rxjs';
import { Busqueda as BusquedaService, FiltrosBusqueda, OrdenBusqueda } from '../../core/busqueda';
import { Categorias } from '../../core/categorias';
import { ArticuloTarjeta, CONDITION_LABEL, Categoria, EstadoConservacion } from '../../core/models';
import { ArticuloCard } from '../../shared/articulo-card/articulo-card';

const POR_PAGINA = 12;

@Component({
  imports: [ReactiveFormsModule, ArticuloCard],
  selector: 'app-busqueda',
  styleUrl: './busqueda.css',
  templateUrl: './busqueda.html',
})
export class Busqueda implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private busqueda = inject(BusquedaService);
  private categoriasService = inject(Categorias);
  private fb = inject(FormBuilder);

  filtros = signal<FiltrosBusqueda>({});
  articulos = signal<ArticuloTarjeta[] | null>(null);
  categorias = signal<Categoria[]>([]);
  totalArticulos = signal(0);
  error = signal('');

  protected readonly conservacion = CONDITION_LABEL;
  protected readonly estados = Object.entries(CONDITION_LABEL);

  filtrosMovil = signal(false);

  form = this.fb.nonNullable.group({
    id_categoria: '',
    precio_min: '',
    precio_max: '',
    estado_conservacion: '',
    ubicacion: '',
  });

  pagina = computed(() => this.filtros().pagina ?? 1);
  totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalArticulos() / POR_PAGINA)));

  etiquetas = computed(() => {
    const f = this.filtros();
    const lista: { clave: keyof FiltrosBusqueda; texto: string }[] = [];
    if (f.q) lista.push({ clave: 'q', texto: `«${f.q}»` });
    if (f.id_categoria) {
      const cat = this.categorias().find((c) => c.id === f.id_categoria);
      lista.push({ clave: 'id_categoria', texto: cat?.nombre ?? 'Categoría' });
    }
    if (f.precio_min !== undefined)
      lista.push({ clave: 'precio_min', texto: `Desde ${f.precio_min} €` });
    if (f.precio_max !== undefined)
      lista.push({ clave: 'precio_max', texto: `Hasta ${f.precio_max} €` });
    if (f.estado_conservacion) {
      lista.push({ clave: 'estado_conservacion', texto: this.conservacion[f.estado_conservacion] });
    }
    if (f.ubicacion) lista.push({ clave: 'ubicacion', texto: f.ubicacion });
    return lista;
  });

  /** Filtros del panel que están activos (sin contar el texto buscado), para el botón «Filtros (2)» del móvil */
  numFiltros = computed(() => this.etiquetas().filter((e) => e.clave !== 'q').length);

  ngOnInit() {
    this.categoriasService.getCategorias().subscribe((c) => this.categorias.set(c));
    // Cada vez que cambia la URL: leer los filtros, rellenar el formulario y buscar.
    // switchMap cancela la búsqueda anterior si el usuario cambia de filtro antes de que llegue.
    this.route.queryParamMap
      .pipe(
        tap((params) => {
          const filtros = this.leerFiltros(params);
          this.filtros.set(filtros);
          this.rellenarFormulario(filtros);
          this.articulos.set(null);
          this.error.set('');
        }),
        switchMap(() => this.busqueda.buscar({ ...this.filtros(), por_pagina: POR_PAGINA })),
      )
      .subscribe({
        next: (r) => {
          this.articulos.set(r.articulos);
          this.totalArticulos.set(r.total);
        },
        error: () => this.error.set('No se han podido cargar los artículos. Inténtalo de nuevo.'),
      });
  }

  /** Pasa los parámetros de la URL (que siempre son texto) a filtros con su tipo */
  private leerFiltros(params: ParamMap): FiltrosBusqueda {
    const numero = (clave: string) => {
      const valor = params.get(clave);
      return valor !== null && valor !== '' && !isNaN(Number(valor)) ? Number(valor) : undefined;
    };
    return {
      q: params.get('q') || undefined,
      id_categoria: numero('id_categoria'),
      precio_min: numero('precio_min'),
      precio_max: numero('precio_max'),
      estado_conservacion: (params.get('estado_conservacion') as EstadoConservacion) || undefined,
      ubicacion: params.get('ubicacion') || undefined,
      orden: (params.get('orden') as OrdenBusqueda) || undefined,
      pagina: numero('pagina'),
    };
  }

  /**
   * Cambia la URL sin salir de la página. Los valores null quitan ese parámetro.
   * queryParamsHandling: 'merge' conserva los parámetros que no se tocan (por ejemplo, q).
   */
  private navegar(cambios: Record<string, string | number | null>) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: cambios,
      queryParamsHandling: 'merge',
    });
  }

  /** Aplica los filtros del panel: los pone en la URL y vuelve a la página 1 */
  aplicarFiltros() {
    const v = this.form.getRawValue();
    this.navegar({
      id_categoria: v.id_categoria || null,
      precio_min: v.precio_min || null,
      precio_max: v.precio_max || null,
      estado_conservacion: v.estado_conservacion || null,
      ubicacion: v.ubicacion.trim() || null,
      pagina: null,
    });
    this.filtrosMovil.set(false);
  }

  /** Quita la búsqueda y todos los filtros: vuelve a /busqueda con todas las joyas (mantiene el orden) */
  limpiarFiltros() {
    const orden = this.filtros().orden;
    this.router.navigate(['/busqueda'], { queryParams: orden ? { orden } : {} });
    this.filtrosMovil.set(false);
  }

  /** Quita un filtro concreto (la ✕ de su etiqueta) */
  quitarFiltro(clave: keyof FiltrosBusqueda) {
    this.navegar({ [clave]: null, pagina: null });
  }

  cambiarOrden(orden: string) {
    this.navegar({ orden: orden === 'recientes' ? null : orden, pagina: null });
  }

  irAPagina(pagina: number) {
    this.navegar({ pagina: pagina === 1 ? null : pagina });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Pone en el panel los filtros que hay en la URL */
  private rellenarFormulario(f: FiltrosBusqueda) {
    this.form.setValue({
      id_categoria: f.id_categoria?.toString() ?? '',
      precio_min: f.precio_min?.toString() ?? '',
      precio_max: f.precio_max?.toString() ?? '',
      estado_conservacion: f.estado_conservacion ?? '',
      ubicacion: f.ubicacion ?? '',
    });
  }
}

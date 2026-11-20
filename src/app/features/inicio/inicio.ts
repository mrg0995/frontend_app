import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Categorias } from '../../core/categorias';
import { Busqueda } from '../../core/busqueda';
import { ArticuloTarjeta, Categoria } from '../../core/models';
import { ArticuloCard } from '../../shared/articulo-card/articulo-card';

/**
 * Portada de rejoya (/): banner, categorías, novedades...
 */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink, ArticuloCard],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  auth = inject(AuthService);
  private categoriasService = inject(Categorias);
  private busqueda = inject(Busqueda);

  /** Categorías para la fila de iconos */
  categorias = signal<Categoria[]>([]);

  /** Últimos artículos publicados; null mientras se cargan */
  novedades = signal<ArticuloTarjeta[] | null>(null);

  /** Artículos de la ciudad del usuario (vacío si no tiene ubicación o no hay ninguno) */
  articulosCerca = signal<ArticuloTarjeta[]>([]);

  /** Ciudad del perfil del usuario con sesión iniciada */
  ciudad = computed(() => this.auth.user()?.ubicacion ?? '');

  error = signal('');

  ngOnInit() {
    this.categoriasService.getCategorias().subscribe((c) => this.categorias.set(c));

    this.busqueda.buscar({ por_pagina: 12 }).subscribe({
      next: (r) => this.novedades.set(r.articulos),
      error: () => this.error.set('No se han podido cargar los artículos.'),
    });

    const ciudad = this.ciudad();
    if (ciudad) {
      this.busqueda
        .buscar({ ubicacion: ciudad, por_pagina: 6 })
        .subscribe((r) => this.articulosCerca.set(r.articulos));
    }
  }
}

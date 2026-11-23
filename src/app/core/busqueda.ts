import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ArticuloTarjeta, EstadoConservacion } from './models';

/** Orden de los resultados */
export type OrdenBusqueda = 'recientes' | 'precio_asc' | 'precio_desc';

/**
 * Filtros de la búsqueda. Se llaman igual que los parámetros de GET /api/articulos,
 */
export interface FiltrosBusqueda {
  q?: string;
  id_categoria?: number;
  precio_min?: number;
  precio_max?: number;
  estado_conservacion?: EstadoConservacion;
  ubicacion?: string;
  id_vendedor?: number;
  orden?: OrdenBusqueda;
  pagina?: number;
  por_pagina?: number;
}

/** Respuesta de la búsqueda: los artículos de una página y el total de resultados */
export interface PaginaArticulos {
  articulos: ArticuloTarjeta[];
  total: number;
  pagina: number;
  por_pagina: number;
}

/**
 * Búsqueda de artículos publicados. La usan la página de búsqueda,
 * el inicio (los más recientes) y el perfil público (los de un vendedor).
 */
@Injectable({ providedIn: 'root' })
export class Busqueda {
  private http = inject(HttpClient);

  /**
   * Busca artículos publicados: GET /api/articulos?q=...&id_categoria=...
   * @param filtros Solo se envían los que tienen valor. Sin filtros, devuelve los más recientes.
   */
  buscar(filtros: FiltrosBusqueda = {}): Observable<PaginaArticulos> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(clave, valor);
      }
    }
    return this.http.get<PaginaArticulos>('/api/articulos', { params });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { Categoria } from './models';
import { CATEGORIAS_DEMO } from './datos-demo';

/**
 * Categorías de las joyas (Anillos, Collares…).
 * Las usan el inicio, los filtros de la búsqueda y el formulario de publicar artículo.
 */
@Injectable({ providedIn: 'root' })
export class Categorias {
  private http = inject(HttpClient);

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>('/api/categorias');
  }
}

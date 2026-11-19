import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { Categoria } from './models';
import { CATEGORIAS_DEMO } from './datos-demo';

// Cambiar a true cuando Mario suba GET /api/categorias (Back 1)
const USAR_BACK_REAL = false;

/**
 * Categorías de las joyas (Anillos, Collares…).
 * Las usan el inicio, los filtros de la búsqueda y el formulario de publicar artículo.
 */
@Injectable({ providedIn: 'root' })
export class Categorias {
  private http = inject(HttpClient);

  getCategorias(): Observable<Categoria[]> {
    // DATOS DE PRUEBA: borrar esta línea cuando Mario suba Back 1
    return of(CATEGORIAS_DEMO).pipe(delay(300));
    // return this.http.get<Categoria[]>('/api/categorias'); // BACK REAL: descomentar cuando esté la ruta
  }
}

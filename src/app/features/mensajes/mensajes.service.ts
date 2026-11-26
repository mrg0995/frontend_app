import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { Conversacion } from '../../core/models';

const USAR_BACK_REAL = true;
const API = '/api';

@Injectable({ providedIn: 'root' })
export class MensajesService {
  private http = inject(HttpClient);

  private demo: Conversacion[] = [
    {
      id: 1,
      articulo: { id: 10, titulo: 'Anillo de plata', precio: 45, estado: 'publicado', foto_portada: null },
      otro_usuario: { id: 7, nombre_usuario: 'lucia', foto_url: null },
      soy: 'vendedor',
      ultimo_mensaje: { texto: '¿Sigue disponible?', id_emisor: 7, fecha_creacion: '2026-11-24T10:30:00Z' },
      sin_leer: 2,
      fecha_creacion: '2026-11-24T10:00:00Z'
    },
    {
      id: 2,
      articulo: { id: 11, titulo: 'Collar de perlas', precio: 80, estado: 'vendido', foto_portada: null },
      otro_usuario: { id: 8, nombre_usuario: 'marta', foto_url: null },
      soy: 'comprador',
      ultimo_mensaje: null,
      sin_leer: 0,
      fecha_creacion: '2026-11-23T09:00:00Z'
    }
  ];

  getConversaciones(): Observable<Conversacion[]> {
    if (!USAR_BACK_REAL) return of(this.demo.map(c => ({ ...c })));
    return this.http.get<Conversacion[]>(`${API}/conversaciones`);
  }

  getSinLeer(): Observable<number> {
    if (!USAR_BACK_REAL) return of(this.demo.reduce((s, c) => s + c.sin_leer, 0));
    return this.http
      .get<{ sin_leer: number }>(`${API}/conversaciones/sin-leer`)
      .pipe(map(r => r.sin_leer));
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Conversacion } from '../../core/models';

const API = '/api';

@Injectable({ providedIn: 'root' })
export class MensajesService {
  private http = inject(HttpClient);

  getConversaciones(): Observable<Conversacion[]> {
    return this.http.get<Conversacion[]>(`${API}/conversaciones`);
  }

  getSinLeer(): Observable<number> {
    return this.http
      .get<{ sin_leer: number }>(`${API}/conversaciones/sin-leer`)
      .pipe(map(r => r.sin_leer));
  }
}
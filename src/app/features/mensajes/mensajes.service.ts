import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { Conversacion, Mensaje } from '../../core/models';

const USAR_BACK_REAL = false;
const API = '/api';

// SUPOSICIÓN: ajustar con docs/api.md
interface MensajeApi {
  id: number;
  conversacion_id: number;
  autor_id: number;
  texto: string;
  creado_en: string;
}

interface ConversacionApi {
  id: number;
  articulo_id: number;
  articulo_titulo: string;
  articulo_foto: string | null;
  articulo_estado: string;
  otro_usuario_id: number;
  otro_usuario_nombre: string;
  otro_usuario_foto: string | null;
  ultimo_mensaje: MensajeApi | null;
  no_leidos: number;
}

export function aMensaje(r: MensajeApi): Mensaje {
  return {
    id: r.id,
    conversacionId: r.conversacion_id,
    autorId: r.autor_id,
    texto: r.texto,
    fecha: r.creado_en
  };
}

export function aConversacion(r: ConversacionApi): Conversacion {
  return {
    id: r.id,
    articulo: {
      id: r.articulo_id,
      titulo: r.articulo_titulo,
      foto: r.articulo_foto ?? '',
      publicado: r.articulo_estado === 'publicado'
    },
    otroUsuario: {
      id: r.otro_usuario_id,
      nombreUsuario: r.otro_usuario_nombre,
      foto: r.otro_usuario_foto ?? ''
    },
    ultimoMensaje: r.ultimo_mensaje ? aMensaje(r.ultimo_mensaje) : null,
    noLeidos: r.no_leidos
  };
}

@Injectable({ providedIn: 'root' })
export class MensajesService {
  private http = inject(HttpClient);

  private demo: Conversacion[] = [
    {
      id: 1,
      articulo: { id: 10, titulo: 'Anillo de plata', foto: '', publicado: true },
      otroUsuario: { id: 7, nombreUsuario: 'lucia', foto: '' },
      ultimoMensaje: { id: 1, conversacionId: 1, autorId: 7, texto: '¿Sigue disponible?', fecha: '2026-11-24T10:30:00Z' },
      noLeidos: 2
    },
    {
      id: 2,
      articulo: { id: 11, titulo: 'Collar de perlas', foto: '', publicado: false },
      otroUsuario: { id: 8, nombreUsuario: 'marta', foto: '' },
      ultimoMensaje: null,
      noLeidos: 0
    }
  ];

  getConversaciones(): Observable<Conversacion[]> {
    if (!USAR_BACK_REAL) return of(this.demo.map(c => ({ ...c })));
    return this.http
      .get<ConversacionApi[]>(`${API}/conversaciones`)
      .pipe(map(lista => lista.map(aConversacion)));
  }

  getSinLeer(): Observable<number> {
    if (!USAR_BACK_REAL) return of(this.demo.reduce((s, c) => s + c.noLeidos, 0));
    return this.http
      .get<{ total: number }>(`${API}/conversaciones/sin-leer`)
      .pipe(map(r => r.total));
  }
}

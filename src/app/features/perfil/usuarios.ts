import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Usuario {
  id: number;
  nombreUsuario: string;
  ubicacion: string;
  foto: string;
}

// Forma en que la API devuelve el usuario (según schema.sql, tabla usuario)
interface UsuarioApi {
  id: number;
  nombre_usuario: string;
  ubicacion: string | null;
  foto_url: string | null;
}

// Traduce lo que viene de la API a lo que usa mi front
export function aUsuario(r: UsuarioApi): Usuario {
  return {
    id: r.id,
    nombreUsuario: r.nombre_usuario,
    ubicacion: r.ubicacion ?? '',
    foto: r.foto_url ?? ''
  };
}

@Injectable({ providedIn: 'root' })
export class Usuarios {
  getMiPerfil(): Observable<Usuario> {
    return of({ id: 1, nombreUsuario: 'ana', ubicacion: 'Madrid', foto: '' });
  }

  actualizarMiPerfil(datos: { nombreUsuario: string; ubicacion: string }): Observable<Usuario> {
    // TODO: cambiar por HttpClient cuando el back esté en develop
    return of({ id: 1, foto: '', ...datos });
  }

  getPerfilPublico(id: number): Observable<Usuario> {
    // TODO: cambiar por HttpClient cuando el back esté en develop
    return of({ id, nombreUsuario: 'usuario' + id, ubicacion: 'Madrid', foto: '' });
  }

  // TODO: subirFoto(archivo: File) cuando exista el endpoint
}
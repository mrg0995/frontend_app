import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Usuario {
  id: number;
  nombreUsuario: string;
  ubicacion: string;
  foto: string;
}

@Injectable({ providedIn: 'root' })
export class Usuarios {
  getMiPerfil(): Observable<Usuario> {
    return of({ id: 1, nombreUsuario: 'ana', ubicacion: 'Madrid', foto: '' });
  }

  actualizarMiPerfil(datos: { nombreUsuario: string; ubicacion: string }): Observable<Usuario> {
    // TODO: cambiar por HttpClient cuando el back de Mariel esté en develop
    return of({ id: 1, foto: '', ...datos });
  }

  getPerfilPublico(id: number): Observable<Usuario> {
    // TODO: cambiar por HttpClient cuando el back de Mariel esté en develop
    return of({ id, nombreUsuario: 'usuario' + id, ubicacion: 'Madrid', foto: '' });
  }

  // TODO: subirFoto(archivo: File) cuando exista el endpoint
}
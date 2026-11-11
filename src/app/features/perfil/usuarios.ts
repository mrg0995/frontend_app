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
}

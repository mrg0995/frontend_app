import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, switchMap } from 'rxjs';

// Cambiar a true cuando el back real esté disponible
const USAR_BACK_REAL = false;

export interface Usuario {
  id: number;
  nombreUsuario: string;
  ubicacion: string;
  foto: string;
}

interface UsuarioApi {
  id: number;
  nombre_usuario: string;
  ubicacion: string | null;
  foto_url: string | null;
}

type RespuestaPerfil = UsuarioApi | { usuario: UsuarioApi };

const API = '/api';

function extraer(r: RespuestaPerfil): UsuarioApi {
  return 'usuario' in r ? r.usuario : r;
}

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
  private http = inject(HttpClient);

  // Datos de demostración (modo sin back)
  private demo: Usuario = { id: 1, nombreUsuario: 'ana', ubicacion: 'Madrid', foto: '' };

  getMiPerfil(): Observable<Usuario> {
    if (!USAR_BACK_REAL) return of({ ...this.demo });
    return this.http
      .get<RespuestaPerfil>(`${API}/usuarios/perfil`)
      .pipe(map(r => aUsuario(extraer(r))));
  }

  actualizarMiPerfil(datos: { nombreUsuario: string; ubicacion: string }): Observable<Usuario> {
    if (!USAR_BACK_REAL) {
      this.demo = { ...this.demo, ...datos };
      return of({ ...this.demo });
    }
    const cuerpo = {
      nombre_usuario: datos.nombreUsuario,
      ubicacion: datos.ubicacion.trim() || null
    };
    return this.http
      .put(`${API}/usuarios/perfil`, cuerpo)
      .pipe(switchMap(() => this.getMiPerfil()));
  }

  getPerfilPublico(id: number): Observable<Usuario> {
    if (!USAR_BACK_REAL) {
      return of({ id, nombreUsuario: 'usuario' + id, ubicacion: 'Madrid', foto: '' });
    }
    return this.http
      .get<RespuestaPerfil>(`${API}/usuarios/${id}/publico`)
      .pipe(map(r => aUsuario(extraer(r))));
  }

  subirFoto(archivo: File): Observable<Usuario> {
    if (!USAR_BACK_REAL) return of({ ...this.demo });
    const datos = new FormData();
    datos.append('foto', archivo);
    return this.http
      .put(`${API}/usuarios/perfil/foto`, datos)
      .pipe(switchMap(() => this.getMiPerfil()));
  }
}
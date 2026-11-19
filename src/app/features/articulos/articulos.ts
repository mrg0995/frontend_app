import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import {
  Articulo,
  ArticuloTarjeta,
  Categoria,
  EstadoArticulo,
  EstadoConservacion,
  Foto
} from '../../core/models';
import { CATEGORIAS_DEMO } from '../../core/datos-demo';

/**
 * Cambiar a true cuando el back de artículos y fotos esté en develop.
 * Mientras es false, el servicio trabaja con datos de prueba en memoria
 * (se pierden al recargar la página) que imitan las respuestas de docs/api.md.
 */
const USAR_BACK_REAL = false;

const API = '/api';

/** Máximo de fotos por artículo, como en el back */
export const MAX_FOTOS = 5;

/** Datos que envía el formulario al crear o editar un artículo */
export interface DatosArticulo {
  titulo: string;
  descripcion: string;
  precio: number;
  id_categoria: number;
  estado_conservacion: EstadoConservacion;
  ubicacion?: string | null;
}

/**
 * Servicio de artículos del usuario: Mis artículos, crear, editar, borrar,
 * publicar, marcar como vendido y fotos.
 * Las categorías están en core/categorias.ts (servicio de Javi).
 * Las rutas y las respuestas son las del contrato de docs/api.md.
 */
@Injectable({ providedIn: 'root' })
export class Articulos {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // ---------- Leer ----------

  /** Mis artículos en todos los estados, del más reciente al más antiguo. GET /api/usuarios/perfil/articulos */
  getMisArticulos(): Observable<ArticuloTarjeta[]> {
    if (!USAR_BACK_REAL) {
      // En modo prueba, todos los artículos de prueba son del usuario que ha iniciado sesión
      return this.demoRespuesta(this.demo.map(aTarjeta));
    }
    return this.http.get<ArticuloTarjeta[]>(`${API}/usuarios/perfil/articulos`);
  }

  /** Un artículo mío en cualquier estado, para editarlo. GET /api/usuarios/perfil/articulos/:id */
  getMiArticulo(id: number): Observable<Articulo> {
    if (!USAR_BACK_REAL) {
      const a = this.demoBuscar(id);
      if (!a) return this.demoError(404, 'Artículo no encontrado');
      return this.demoRespuesta(copia(a));
    }
    return this.http.get<Articulo>(`${API}/usuarios/perfil/articulos/${id}`);
  }

  /** Detalle público: solo publicados y vendidos. GET /api/articulos/:id */
  getArticulo(id: number): Observable<Articulo> {
    if (!USAR_BACK_REAL) {
      const a = this.demoBuscar(id);
      if (!a || (a.estado !== 'publicado' && a.estado !== 'vendido')) {
        return this.demoError(404, 'Artículo no encontrado');
      }
      return this.demoRespuesta(copia(a));
    }
    return this.http.get<Articulo>(`${API}/articulos/${id}`);
  }

  // ---------- Crear, editar y borrar ----------

  /** Crea el artículo como borrador. POST /api/articulos */
  crear(datos: DatosArticulo): Observable<Articulo> {
    if (!USAR_BACK_REAL) {
      const u = this.auth.user();
      const ahora = new Date().toISOString();
      const nuevo: Articulo = {
        id: Math.max(0, ...this.demo.map(a => a.id)) + 1,
        titulo: datos.titulo,
        descripcion: datos.descripcion,
        precio: datos.precio,
        estado_conservacion: datos.estado_conservacion,
        estado: 'borrador',
        ubicacion: datos.ubicacion || u?.ubicacion || null,
        categoria: this.demoCategoria(datos.id_categoria),
        vendedor: { id: this.idUsuario(), nombre_usuario: u?.nombre_usuario ?? 'yo', foto_url: u?.foto_url ?? null, ubicacion: u?.ubicacion ?? null },
        fotos: [],
        fecha_creacion: ahora,
        fecha_actualizacion: ahora
      };
      this.demo.unshift(nuevo);
      return this.demoRespuesta(copia(nuevo));
    }
    return this.http.post<Articulo>(`${API}/articulos`, datos);
  }

  /** PUT /api/articulos/:id */
  editar(id: number, datos: DatosArticulo): Observable<Articulo> {
    if (!USAR_BACK_REAL) {
      const a = this.demoBuscar(id);
      if (!a) return this.demoError(404, 'Artículo no encontrado');
      if (['en_revision', 'retirado', 'vendido'].includes(a.estado)) {
        return this.demoError(409, 'Este artículo ya no se puede editar');
      }
      Object.assign(a, {
        titulo: datos.titulo,
        descripcion: datos.descripcion,
        precio: datos.precio,
        estado_conservacion: datos.estado_conservacion,
        ubicacion: datos.ubicacion || a.ubicacion,
        categoria: this.demoCategoria(datos.id_categoria),
        fecha_actualizacion: new Date().toISOString()
      });
      return this.demoRespuesta(copia(a));
    }
    return this.http.put<Articulo>(`${API}/articulos/${id}`, datos);
  }

  /** DELETE /api/articulos/:id */
  borrar(id: number): Observable<{ message: string }> {
    if (!USAR_BACK_REAL) {
      const a = this.demoBuscar(id);
      if (!a) return this.demoError(404, 'Artículo no encontrado');
      if (a.estado === 'en_revision') return this.demoError(409, 'El artículo está en revisión y no se puede borrar');
      this.demo = this.demo.filter(x => x.id !== id);
      return this.demoRespuesta({ message: 'Artículo borrado' });
    }
    return this.http.delete<{ message: string }>(`${API}/articulos/${id}`);
  }

  // ---------- Cambios de estado ----------

  /** De borrador a publicado. Necesita al menos una foto. PATCH /api/articulos/:id/publicar */
  publicar(id: number): Observable<Articulo> {
    if (!USAR_BACK_REAL) {
      const a = this.demoBuscar(id);
      if (!a) return this.demoError(404, 'Artículo no encontrado');
      if (a.estado !== 'borrador') return this.demoError(409, 'Solo se pueden publicar los borradores');
      if (a.fotos.length === 0) return this.demoError(409, 'Añade al menos una foto antes de publicar');
      return this.demoCambiarEstado(a, 'publicado');
    }
    return this.http.patch<Articulo>(`${API}/articulos/${id}/publicar`, {});
  }

  /** De publicado a vendido. PATCH /api/articulos/:id/vendido */
  marcarVendido(id: number): Observable<Articulo> {
    if (!USAR_BACK_REAL) {
      const a = this.demoBuscar(id);
      if (!a) return this.demoError(404, 'Artículo no encontrado');
      if (a.estado !== 'publicado') return this.demoError(409, 'Solo se pueden marcar como vendidos los artículos publicados');
      return this.demoCambiarEstado(a, 'vendido');
    }
    return this.http.patch<Articulo>(`${API}/articulos/${id}/vendido`, {});
  }

  // ---------- Fotos ----------

  /**
   * Sube una o varias fotos en el campo "fotos" y devuelve todas las fotos del artículo.
   * POST /api/fotos/articulo/:id
   */
  subirFotos(idArticulo: number, archivos: File[]): Observable<Foto[]> {
    if (!USAR_BACK_REAL) {
      const a = this.demoBuscar(idArticulo);
      if (!a) return this.demoError(404, 'Artículo no encontrado');
      if (a.fotos.length + archivos.length > MAX_FOTOS) {
        return this.demoError(409, `Un artículo puede tener como máximo ${MAX_FOTOS} fotos`);
      }
      for (const archivo of archivos) {
        a.fotos.push({ id: this.siguienteIdFoto++, url: URL.createObjectURL(archivo), posicion: a.fotos.length });
      }
      return this.demoRespuesta(a.fotos.map(f => ({ ...f })));
    }
    const datos = new FormData();
    archivos.forEach(archivo => datos.append('fotos', archivo));
    return this.http.post<Foto[]>(`${API}/fotos/articulo/${idArticulo}`, datos);
  }

  /** Borra una foto y devuelve las que le quedan al artículo. DELETE /api/fotos/:idFoto */
  borrarFoto(idFoto: number): Observable<Foto[]> {
    if (!USAR_BACK_REAL) {
      const a = this.demo.find(x => x.fotos.some(f => f.id === idFoto));
      if (!a) return this.demoError(404, 'La foto no existe');
      a.fotos = a.fotos.filter(f => f.id !== idFoto).map((f, i) => ({ ...f, posicion: i }));
      return this.demoRespuesta(a.fotos.map(f => ({ ...f })));
    }
    return this.http.delete<Foto[]>(`${API}/fotos/${idFoto}`);
  }

  // ---------- Datos de prueba (solo con USAR_BACK_REAL = false) ----------

  private siguienteIdFoto = 100;
  private demo: Articulo[] = crearDemo(this.idUsuario(), this.auth.user()?.nombre_usuario ?? 'usuario');

  private idUsuario(): number {
    return this.auth.user()?.id ?? 0;
  }

  private demoBuscar(id: number): Articulo | undefined {
    return this.demo.find(a => a.id === id);
  }

  private demoCategoria(id: number): Categoria {
    return CATEGORIAS_DEMO.find(c => c.id === id) ?? CATEGORIAS_DEMO[CATEGORIAS_DEMO.length - 1];
  }

  private demoCambiarEstado(a: Articulo, estado: EstadoArticulo): Observable<Articulo> {
    a.estado = estado;
    a.fecha_actualizacion = new Date().toISOString();
    return this.demoRespuesta(copia(a));
  }

  /** Simula una respuesta del back con un pequeño retraso */
  private demoRespuesta<T>(valor: T): Observable<T> {
    return of(valor).pipe(delay(300));
  }

  /** Simula un error del back con el mismo formato: { message } */
  private demoError(status: number, message: string): Observable<never> {
    return throwError(() => new HttpErrorResponse({ status, error: { message } }));
  }
}

// ---------- Funciones auxiliares ----------

/** Convierte un artículo completo al formato tarjeta de los listados */
function aTarjeta(a: Articulo): ArticuloTarjeta {
  return {
    id: a.id,
    titulo: a.titulo,
    precio: a.precio,
    estado_conservacion: a.estado_conservacion,
    estado: a.estado,
    ubicacion: a.ubicacion,
    foto_portada: a.fotos.find(f => f.posicion === 0)?.url ?? null,
    vendedor: { id: a.vendedor.id, nombre_usuario: a.vendedor.nombre_usuario }
  };
}

function copia(a: Articulo): Articulo {
  return { ...a, categoria: { ...a.categoria }, vendedor: { ...a.vendedor }, fotos: a.fotos.map(f => ({ ...f })) };
}

/** Un artículo de prueba en cada estado, del usuario que ha iniciado sesión */
function crearDemo(idUsuario: number, nombre: string): Articulo[] {
  const vendedor = { id: idUsuario, nombre_usuario: nombre, foto_url: null, ubicacion: 'Madrid' };
  const base = (id: number, titulo: string, precio: number, estado: EstadoArticulo, cat: number, conservacion: EstadoConservacion, fotos = 0): Articulo => ({
    id,
    titulo,
    descripcion: 'Artículo de prueba mientras el back no está disponible.',
    precio,
    estado_conservacion: conservacion,
    estado,
    ubicacion: 'Madrid',
    categoria: CATEGORIAS_DEMO[cat - 1],
    vendedor,
    fotos: Array.from({ length: fotos }, (_, i) => ({ id: id * 10 + i, url: '', posicion: i })),
    fecha_creacion: '2026-11-16T10:00:00.000Z',
    fecha_actualizacion: '2026-11-16T10:00:00.000Z'
  });
  return [
    base(1, 'Anillo de plata con circonita', 45, 'borrador', 1, 'como_nuevo'),
    base(2, 'Collar de perlas cultivadas', 120, 'publicado', 2, 'buen_estado', 1),
    base(3, 'Pendientes de aro dorados', 25.5, 'vendido', 3, 'aceptable', 1),
    base(4, 'Pulsera de cuero trenzado', 18, 'en_revision', 4, 'nuevo', 1),
    base(5, 'Broche vintage de esmalte', 60, 'retirado', 5, 'buen_estado', 1)
  ];
}
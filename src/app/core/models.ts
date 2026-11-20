export interface Usuario {
    id: number;
    nombre_usuario: string;
    email: string;
    rol: 'usuario' | 'moderador' | 'administrador';
    foto_url?: string | null;
    ubicacion?: string | null;
}

export type EstadoConservacion = 'nuevo' | 'como_nuevo' | 'buen_estado' | 'aceptable';

export type EstadoArticulo = 'borrador' | 'publicado' | 'en_revision' | 'retirado' | 'vendido';

/**
 * Artículo tal como llega en los listados: búsqueda, inicio, Mis artículos y perfil público.
 * Es el formato «tarjeta» del contrato (docs/api.md).
 */
export interface ArticuloTarjeta {
    id: number;
    titulo: string;
    precio: number;
    estado_conservacion: EstadoConservacion;
    estado: EstadoArticulo;
    ubicacion: string | null;
    foto_portada: string | null;
    vendedor: { id: number; nombre_usuario: string };
}

/** Categoría de joya: Anillos, Collares… (GET /api/categorias) */
export interface Categoria {
    id: number;
    nombre: string;
}

/** Foto de un artículo. La de posicion 0 es la portada */
export interface Foto {
    id: number;
    url: string;
    posicion: number;
}

/** Artículo completo, como llega (GET /api/articulos/:id) y al editarlo */
export interface Articulo {
    id: number;
    titulo: string;
    descripcion: string;
    precio: number;
    estado_conservacion: EstadoConservacion;
    estado: EstadoArticulo;
    ubicacion: string | null;
    categoria: Categoria;
    vendedor: { id: number; nombre_usuario: string; foto_url: string | null; ubicacion: string | null };
    fotos: Foto[];
    fecha_creacion: string;
    fecha_actualizacion: string;
}

export const STATUS_LABEL: Record<string, string> = {
    borrador: 'Borrador',
    publicado: 'Publicado',
    en_revision: 'En revisión',
    retirado: 'Retirado',
    vendido: 'Vendido'
};

export const CONDITION_LABEL: Record<string, string> = {
    nuevo: 'Nuevo',
    como_nuevo: 'Como nuevo',
    buen_estado: 'Buen estado',
    aceptable: 'Aceptable'
};

export const CONDITIONS = Object.entries(CONDITION_LABEL).map(([value, label]) => ({ value, label }));

export const ROLE_LABEL: Record<string, string> = {
    usuario: 'Usuario',
    moderador: 'Moderador',
    administrador: 'Administrador'
};

export const REPORT_TYPE_LABEL: Record<string, string> = {
    articulo: 'Artículo',
    usuario: 'Usuario',
    conversacion: 'Conversación'
};

export const DECISION_LABEL: Record<string, string> = {
    mantener: 'Mantenido activo',
    retirar: 'Artículo retirado',
    bloquear: 'Usuario bloqueado'
};

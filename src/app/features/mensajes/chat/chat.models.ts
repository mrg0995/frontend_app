export interface UsuarioResumen {
  id: number;
  nombre_usuario: string;
  avatar?: string;
}

export interface ArticuloResumen {
  id: number;
  titulo: string;
  precio: number;
  foto_portada: string;
  otro_usuario: number; 
}

export interface Conversacion {
  id: number;
  articulo: ArticuloResumen;
  otro_usuario: UsuarioResumen;
}

export interface Mensaje {
  id: number;
  id_emisor: number;
  id_conversacion: number;
  texto: string;
  fecha_creacion: string;
}

export interface NotificacionSocket {
  id?: number;
  tipo?: string;
  mensaje?: string;
  conversacionId?: number;
  leida?: boolean;
}
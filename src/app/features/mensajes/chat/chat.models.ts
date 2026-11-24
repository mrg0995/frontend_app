export interface UsuarioResumen {
  id_emisor: number;
  nombre: string;
  avatar?: string;
}

export interface ArticuloResumen {
  id_emisor: number;
  titulo: string;
  precio: number;
  foto_portada: string;
  otro_usuario: number; 
}

export interface ConversacionDetalle {
  id_emisor: number;
  articulo: ArticuloResumen;
  otro_usuario: UsuarioResumen;
}

export interface Mensaje {
  id_emisor: number;
  id_conversacion: number;
  id_remitente: number;
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
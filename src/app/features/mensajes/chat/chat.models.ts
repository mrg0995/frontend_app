export interface UsuarioResumen {
  id: number;
  nombre: string;
  avatar?: string;
}

export interface ArticuloResumen {
  id: number;
  titulo: string;
  precio: number;
  foto?: string; //
  usuarioId: number; 
}

export interface ConversacionDetalle {
  id: number; // o string
  articulo: ArticuloResumen;
  otroUsuario: UsuarioResumen;
}

export interface Mensaje {
  id: number;
  idConversacion: number;
  remitenteId: number;
  texto: string;
  createdAt: string;
}

export interface NotificacionSocket {
  id?: number;
  tipo?: string;
  mensaje?: string;
  conversacionId?: number;
  leida?: boolean;
}
import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';

export interface MensajeSocket {
  id: number | string;
  id_conversacion: number | string;
  id_emisor: number | string;
  texto: string;
  fecha_creacion: string;
  [key: string]: unknown;
}

export interface NotificacionSocket {
  [key: string]: unknown;
}

export interface ErrorMensajeSocket {
  message?: string;
  error?: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private readonly URL_SERVIDOR = 'http://localhost:3000';
  private socket: Socket | null = null;

  private readonly _ultimoMensaje = signal<MensajeSocket | null>(null);
  private readonly _ultimaNotificacion = signal<NotificacionSocket | null>(null);
  private readonly _errorMensaje = signal<string | null>(null);

  readonly ultimoMensaje = this._ultimoMensaje.asReadonly();
  readonly ultimaNotificacion = this._ultimaNotificacion.asReadonly();
  readonly errorMensaje = this._errorMensaje.asReadonly();

  conectar(token: string): void {
    if (!token) return;
    if (this.socket) {
      this.desconectar();
    }

    this.socket = io(this.URL_SERVIDOR, {
      auth: { token },
    });

    this.socket.on('mensaje_nuevo', (msg: MensajeSocket) => {
      this._errorMensaje.set(null);
      this._ultimoMensaje.set(msg);
    });

    this.socket.on('notificacion_nueva', (notif: NotificacionSocket) => {
      this._ultimaNotificacion.set(notif);
    });

    this.socket.on('error_mensaje', (err: string | ErrorMensajeSocket) => {
      const textoError =
        typeof err === 'string'
          ? err
          : err?.message || err?.error || 'Error al enviar el mensaje';
      this._errorMensaje.set(textoError);
    });
  }

  desconectar(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this._ultimoMensaje.set(null);
    this._ultimaNotificacion.set(null);
    this._errorMensaje.set(null);
  }

  enviarMensaje(id_conversacion: number | string, texto: string): void {
    if (!this.socket || !this.socket.connected) {
      this._errorMensaje.set('Socket no conectado');
      return;
    }
    this._errorMensaje.set(null);
    this.socket.emit('mensaje_enviar', { id_conversacion, texto });
  }
}
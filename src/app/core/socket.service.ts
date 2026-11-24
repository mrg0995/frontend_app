import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';

interface Mensaje {
    [key: string]: unknown;
}

interface NotificacionSocket {
    [key: string]: unknown;
}

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private readonly URL_SERVIDOR = 'http://localhost:3000';
    private socket: Socket | null = null;

    private readonly _ultimoMensaje = signal<Mensaje | null>(null);
    private readonly _ultimaNotificacion = signal<NotificacionSocket | null>(null);
    private readonly _errorMensaje = signal<string | null>(null);
    private readonly _conectado = signal<boolean>(false);

    readonly ultimoMensaje = this._ultimoMensaje.asReadonly();
    readonly ultimaNotificacion = this._ultimaNotificacion.asReadonly();
    readonly errorMensaje = this._errorMensaje.asReadonly();
    readonly conectado = this._conectado.asReadonly();

    constructor() {
        const tokenGuardado = localStorage.getItem('token');
        if (tokenGuardado) {
            this.conectar(tokenGuardado);
        }
    }

    conectar(token: string): void {
        if (this.socket) {
            this.desconectar();
        }

        this.socket = io(this.URL_SERVIDOR, {
            auth: { token },
        });

        this.registrarEventos();
    }

    desconectar(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        this._conectado.set(false);
        this._ultimoMensaje.set(null);
        this._ultimaNotificacion.set(null);
        this._errorMensaje.set(null);
    }

    enviarMensaje(idConversacion: number | string, texto: string): void {
        if (!this.socket || !this.socket.connected) {
            this._errorMensaje.set('No hay conexión con el servidor de chat.');
            return;
        }

        this._errorMensaje.set(null);

        this.socket.emit('enviar_mensaje', {
            idConversacion,
            texto,
        });
    }

    limpiarErrorMensaje(): void {
        this._errorMensaje.set(null);
    }

    private registrarEventos(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            this._conectado.set(true);
        });

        this.socket.on('disconnect', () => {
            this._conectado.set(false);
        });

        this.socket.on('mensaje_nuevo', (mensaje: Mensaje) => {
            this._errorMensaje.set(null);
            this._ultimoMensaje.set(mensaje);
        });

        this.socket.on('notificacion_nueva', (notificacion: NotificacionSocket) => {
            this._ultimaNotificacion.set(notificacion);
        });

        this.socket.on('error_mensaje', (error: string | { message?: string; error?: string }) => {
            const mensajeError =
                typeof error === 'string'
                    ? error
                    : error?.message || error?.error || 'Error al enviar el mensaje.';
            this._errorMensaje.set(mensajeError);
        });
    }
}
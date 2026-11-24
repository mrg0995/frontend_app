import { Component, ElementRef, ViewChild, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocketService } from '../../../core/socket.service';
import { AuthService } from '../../../core/auth.service';
import { MensajesService } from '../mensajes.service'; // servicio de la persona 2
import { ConversacionDetalle, Mensaje } from '../../../core/models/chat.models';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.css',
})
export class ChatComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly fb = inject(FormBuilder);
    private readonly socketService = inject(SocketService);
    private readonly authService = inject(AuthService);
    private readonly mensajesService = inject(MensajesService);

    @ViewChild('contenedorMensajes') contenedorMensajes?: ElementRef<HTMLDivElement>;

    readonly conversacionId = signal<number | null>(null);
    readonly conversacion = signal<ConversacionDetalle | null>(null);
    readonly mensajes = signal<Mensaje[]>([]);
    readonly cargando = signal<boolean>(true);
    readonly errorCarga = signal<string | null>(null);

    readonly errorMensajeSocket = this.socketService.errorMensaje;
    readonly miUsuarioId = this.authService.getUsuarioActualId();

    readonly formMensaje = this.fb.nonNullable.group({
        texto: [
            '',
            [
                Validators.required,
                Validators.maxLength(1000),
                Validators.pattern(/\S+/),
            ],
        ],
    });

    constructor() {
        this.route.paramMap.subscribe((params) => {
            const idParam = params.get('id');
            const id = idParam ? Number(idParam) : null;

            if (id) {
                this.conversacionId.set(id);
                this.socketService.limpiarErrorMensaje();
                this.cargarConversacionEHistorial(id);
            }
        });

        effect(() => {
            const nuevo = this.socketService.ultimoMensaje();
            const idActual = this.conversacionId();

            if (!nuevo || !idActual) return;

            if (Number(nuevo.conversacionId) === idActual) {
                this.mensajes.update((lista) => {
                    const yaExiste = lista.some((m) => m.id === nuevo.id);
                    return yaExiste ? lista : [...lista, nuevo];
                });

                this.marcarComoLeida(idActual);
                this.bajarScroll();
            }
        });
    }

    private cargarConversacionEHistorial(idConversacion: number): void {
        this.cargando.set(true);
        this.errorCarga.set(null);

        this.mensajesService.getConversacion(idConversacion).subscribe({
            next: (detalle: ConversacionDetalle) => {
                this.conversacion.set(detalle);
            },
            error: () => {
                this.errorCarga.set('No se pudo cargar la información de la conversación.');
            },
        });

        this.mensajesService.getMensajes(idConversacion).subscribe({
            next: (historial: Mensaje[]) => {
                this.mensajes.set(historial);
                this.cargando.set(false);
                this.bajarScroll();

                this.marcarComoLeida(idConversacion);
            },
            error: () => {
                this.cargando.set(false);
                this.errorCarga.set('No se pudo cargar el historial de mensajes.');
            },
        });
    }

    private marcarComoLeida(idConversacion: number): void {
        this.mensajesService.marcarComoLeida(idConversacion).subscribe({
            error: (err: unknown) => console.error('Error al marcar como leída:', err),
        });
    }

    enviar(): void {
        const idActual = this.conversacionId();
        if (this.formMensaje.invalid || !idActual) {
            this.formMensaje.markAllAsTouched();
            return;
        }

        const textoLimpio = this.formMensaje.controls.texto.value.trim();
        if (!textoLimpio) return;

        // Emitimos por socket; NO añadimos el mensaje al array aquí
        // Se pintará automáticamente cuando vuelva por `mensaje_nuevo`
        this.socketService.enviarMensaje(idActual, textoLimpio);
        this.formMensaje.reset({ texto: '' });
    }

    esMio(mensaje: Mensaje): boolean {
        return mensaje.remitenteId === this.miUsuarioId;
    }

    private bajarScroll(): void {
        setTimeout(() => {
            const el = this.contenedorMensajes?.nativeElement;
            if (el) {
                el.scrollTop = el.scrollHeight;
            }
        }, 0);
    }
}
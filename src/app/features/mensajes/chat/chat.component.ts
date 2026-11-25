import { Component, ElementRef, ViewChild, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SocketService } from '../../../core/socket.service';
import { AuthService } from '../../../core/auth.service';
import { Conversacion, Mensaje } from './chat.models';

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
    private readonly http = inject(HttpClient);
    private readonly socketService = inject(SocketService);
    private readonly authService = inject(AuthService);

    @ViewChild('contenedorMensajes') contenedorMensajes?: ElementRef<HTMLDivElement>;

    readonly conversacionId = signal<string | null>(null);
    readonly conversacion = signal<Conversacion | null>(null);
    readonly mensajes = signal<Mensaje[]>([]);
    readonly cargando = signal<boolean>(true);
    readonly errorCarga = signal<string | null>(null);

    readonly errorMensaje = this.socketService.errorMensaje;
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
            const id = params.get('id');
            if (id) {
                this.conversacionId.set(id);
                this.cargarTodo(id);
            }
        });

        effect(() => {
            const nuevo: Mensaje | null = this.socketService.ultimoMensaje();
            const idActual = this.conversacionId();

            if (!nuevo || !idActual) return;

            if (String(nuevo.id_conversacion) === String(idActual)) {
                this.mensajes.update((lista) => {
                    const yaExiste = lista.some((m) => String(m.id) === String(nuevo.id));
                    return yaExiste ? lista : [...lista, nuevo];
                });
                this.marcarLeida(idActual);
                this.bajarScroll();
            }
        });
    }

    private cargarTodo(id: string): void {
        this.cargando.set(true);
        this.errorCarga.set(null);

        this.http.get<Conversacion>(`/api/conversaciones/${id}`).subscribe({
            next: (conv) => this.conversacion.set(conv),
            error: () => this.errorCarga.set('Error al cargar la conversación'),
        });

        this.http.get<Mensaje[]>(`/api/conversaciones/${id}/mensajes`).subscribe({
            next: (lista) => {
                this.mensajes.set(lista);
                this.cargando.set(false);
                this.marcarLeida(id);
                this.bajarScroll();
            },
            error: () => {
                this.cargando.set(false);
                this.errorCarga.set('Error al cargar los mensajes');
            },
        });
    }

    private marcarLeida(id: string): void {
        this.http.patch(`/api/conversaciones/${id}/leida`, {}).subscribe({
            error: (err) => console.error(err),
        });
    }

    enviar(): void {
        const idActual = this.conversacionId();
        if (this.formMensaje.invalid || !idActual) {
            this.formMensaje.markAllAsTouched();
            return;
        }

        const texto = this.formMensaje.controls.texto.value.trim();
        if (!texto) return;

        this.socketService.enviarMensaje(Number(idActual), texto);
        this.formMensaje.reset({ texto: '' });
    }

    esMio(msg: Mensaje): boolean {
        return this.miUsuarioId !== null && String(msg.id_emisor) === String(this.miUsuarioId);
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
import { Component, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MensajesService } from '../mensajes.service';
import { SocketService, MensajeSocket } from '../../../core/socket.service';
import { AuthService } from '../../../core/auth.service';
import { Conversacion } from '../../../core/models';

@Component({
  selector: 'app-bandeja',
  imports: [DatePipe, RouterLink],
  templateUrl: './bandeja.html',
  styleUrl: './bandeja.css'
})
export class Bandeja implements OnInit {
  private mensajes = inject(MensajesService);
  private socket = inject(SocketService);
  private auth = inject(AuthService);

  /** Conversaciones; null mientras se cargan */
  conversaciones = signal<Conversacion[] | null>(null);

  constructor() {
    effect(() => {
      const msg = this.socket.ultimoMensaje();
      if (!msg) return;
      untracked(() => this.alLlegarMensaje(msg));
    });
  }

  ngOnInit() {
    this.mensajes.getConversaciones().subscribe(lista => this.conversaciones.set(lista));
  }

  private alLlegarMensaje(msg: MensajeSocket) {
    const lista = this.conversaciones();
    if (!lista) return;

    const i = lista.findIndex(c => c.id === msg.id_conversacion);

    // Conversación nueva que aún no está en la lista: se pide la bandeja una vez
    if (i === -1) {
      this.mensajes.getConversaciones().subscribe(l => this.conversaciones.set(l));
      return;
    }

    const esMio = msg.id_emisor === this.auth.getUsuarioActualId();
    const c = lista[i];
    const actualizada: Conversacion = {
      ...c,
      ultimo_mensaje: { texto: msg.texto, id_emisor: msg.id_emisor, fecha_creacion: msg.fecha_creacion },
      sin_leer: esMio ? c.sin_leer : c.sin_leer + 1
    };

    // Sube arriba sin volver a pedir la bandeja
    this.conversaciones.set([actualizada, ...lista.filter((_, idx) => idx !== i)]);
  }
}
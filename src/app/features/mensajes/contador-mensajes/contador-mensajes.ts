import { Component, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MensajesService } from '../mensajes.service';
import { SocketService } from '../../../core/socket.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-contador-mensajes',
  template: `
    @if (total() > 0) {
      <span class="contador-mensajes">{{ total() }}</span>
    }
  `,
  styles: `
    .contador-mensajes {
      background: var(--color-primary);
      color: #fff;
      border-radius: 999px;
      padding: 1px 6px;
      font-size: 0.7rem;
      font-weight: bold;
      margin-left: 4px;
    }
  `
})
export class ContadorMensajes implements OnInit {
  private mensajes = inject(MensajesService);
  private socket = inject(SocketService);
  private auth = inject(AuthService);
  private router = inject(Router);

  total = signal(0);

  constructor() {
    // Con cada mensaje nuevo ajeno, se pide el total real al back
    effect(() => {
      const msg = this.socket.ultimoMensaje();
      if (!msg) return;
      untracked(() => {
        if (msg.id_emisor !== this.auth.getUsuarioActualId()) {
          this.recargar();
        }
      });
    });

    // Al navegar (por ejemplo al abrir o salir de un chat) se vuelve a pedir
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) this.recargar();
    });
  }

  ngOnInit() {
    this.recargar();
  }

  private recargar() {
    this.mensajes.getSinLeer().subscribe(n => this.total.set(n));
  }
}
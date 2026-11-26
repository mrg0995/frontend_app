import { Component, effect, inject, OnInit, signal, untracked } from '@angular/core';
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
      background: #1976d2;
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

  total = signal(0);

  constructor() {
    effect(() => {
      const msg = this.socket.ultimoMensaje();
      if (!msg) return;
      untracked(() => {
        if (msg.id_emisor !== this.auth.getUsuarioActualId()) {
          this.total.update(n => n + 1);
        }
      });
    });
  }

  ngOnInit() {
    this.mensajes.getSinLeer().subscribe(n => this.total.set(n));
  }
}
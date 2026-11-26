import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MensajesService } from '../mensajes.service';
import { Conversacion } from '../../../core/models';

@Component({
  selector: 'app-bandeja',
  imports: [DatePipe, RouterLink],
  templateUrl: './bandeja.html',
  styleUrl: './bandeja.css'
})
export class Bandeja implements OnInit {
  private mensajes = inject(MensajesService);

  /** Conversaciones; null mientras se cargan */
  conversaciones = signal<Conversacion[] | null>(null);

  ngOnInit() {
    this.mensajes.getConversaciones().subscribe(lista => this.conversaciones.set(lista));
  }
}
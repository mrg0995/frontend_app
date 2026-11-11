import { Component, inject, OnInit, signal } from '@angular/core';
import { Usuarios, Usuario } from '../usuarios';

@Component({
  selector: 'app-mi-perfil',
  imports: [],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css'
})
export class MiPerfil implements OnInit {
  private usuarios = inject(Usuarios);
  usuario = signal<Usuario | null>(null);

  ngOnInit() {
    this.usuarios.getMiPerfil().subscribe(u => this.usuario.set(u));
  }
}

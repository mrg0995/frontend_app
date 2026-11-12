import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Usuarios, Usuario } from '../usuarios';

@Component({
  selector: 'app-perfil-publico',
  imports: [],
  templateUrl: './perfil-publico.html',
  styleUrl: './perfil-publico.css'
})
export class PerfilPublico implements OnInit {
  private route = inject(ActivatedRoute);
  private usuarios = inject(Usuarios);

  usuario = signal<Usuario | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.usuarios.getPerfilPublico(id).subscribe(u => this.usuario.set(u));
    });
  }
}
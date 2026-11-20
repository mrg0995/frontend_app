import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Usuarios, Usuario } from '../usuarios';
import { Busqueda } from '../../../core/busqueda';
import { ArticuloTarjeta } from '../../../core/models';
import { ArticuloCard } from '../../../shared/articulo-card/articulo-card';

@Component({
  selector: 'app-perfil-publico',
  imports: [ArticuloCard],
  templateUrl: './perfil-publico.html',
  styleUrl: './perfil-publico.css'
})
export class PerfilPublico implements OnInit {
  private route = inject(ActivatedRoute);
  private usuarios = inject(Usuarios);
  private busqueda = inject(Busqueda);

  usuario = signal<Usuario | null>(null);

  /** Artículos publicados del usuario; null mientras se cargan */
  articulos = signal<ArticuloTarjeta[] | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.usuarios.getPerfilPublico(id).subscribe(u => this.usuario.set(u));

      // Sus artículos publicados: la búsqueda filtrada por vendedor (GET /api/articulos?id_vendedor=…)
      this.articulos.set(null);
      this.busqueda.buscar({ id_vendedor: id, por_pagina: 12 }).subscribe(r => this.articulos.set(r.articulos));
    });
  }
}

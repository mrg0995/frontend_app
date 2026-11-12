import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuarios, Usuario } from '../usuarios';

@Component({
  selector: 'app-mi-perfil',
  imports: [ReactiveFormsModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css'
})
export class MiPerfil implements OnInit {
  private usuarios = inject(Usuarios);
  private fb = inject(FormBuilder);

  usuario = signal<Usuario | null>(null);
  guardado = signal(false);
  fotoPreview = signal<string | null>(null);
  errorFoto = signal('');

  form = this.fb.nonNullable.group({
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    ubicacion: ['', [Validators.required]]
  });

  ngOnInit() {
    this.usuarios.getMiPerfil().subscribe(u => {
      this.usuario.set(u);
      this.form.patchValue({ nombreUsuario: u.nombreUsuario, ubicacion: u.ubicacion });
      if (u.foto) this.fotoPreview.set(u.foto);
    });
  }

  guardar() {
    this.guardado.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.usuarios.actualizarMiPerfil(this.form.getRawValue()).subscribe(u => {
      this.usuario.set(u);
      this.guardado.set(true);
    });
  }

  onFoto(event: Event) {
    this.errorFoto.set('');
    const archivo = (event.target as HTMLInputElement).files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      this.errorFoto.set('El archivo debe ser una imagen.');
      return;
    }
    if (archivo.size > 2 * 1024 * 1024) {
      this.errorFoto.set('La imagen no puede superar 2 MB.');
      return;
    }

    const anterior = this.fotoPreview();
    if (anterior?.startsWith('blob:')) URL.revokeObjectURL(anterior);
    this.fotoPreview.set(URL.createObjectURL(archivo));
  }
} 
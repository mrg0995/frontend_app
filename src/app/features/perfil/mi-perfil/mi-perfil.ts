import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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
  errorGuardar = signal('');
  fotoPreview = signal<string | null>(null);
  fotoGuardada = signal(false);
  errorFoto = signal('');

  form = this.fb.nonNullable.group({
    nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    ubicacion: ['', [Validators.maxLength(100)]]
  });

  ngOnInit() {
    this.usuarios.getMiPerfil().subscribe({
      next: u => {
        this.usuario.set(u);
        this.form.patchValue({ nombreUsuario: u.nombreUsuario, ubicacion: u.ubicacion });
        if (u.foto) this.fotoPreview.set(u.foto);
      },
      error: (e: HttpErrorResponse) =>
        this.errorGuardar.set(e.error?.message ?? 'No se pudo cargar el perfil.')
    });
  }

  guardar() {
    this.guardado.set(false);
    this.errorGuardar.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.usuarios.actualizarMiPerfil(this.form.getRawValue()).subscribe({
      next: u => {
        this.usuario.set(u);
        this.guardado.set(true);
      },
      error: (e: HttpErrorResponse) =>
        this.errorGuardar.set(e.error?.message ?? 'No se pudo guardar el perfil.')
    });
  }

  onFoto(event: Event) {
    this.errorFoto.set('');
    this.fotoGuardada.set(false);
    const archivo = (event.target as HTMLInputElement).files?.[0];
    if (!archivo) return;

    const tiposValidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposValidos.includes(archivo.type)) {
      this.errorFoto.set('Solo se admiten imágenes jpg, png o webp.');
      return;
    }
    if (archivo.size > 2 * 1024 * 1024) {
      this.errorFoto.set('La imagen no puede superar 2 MB.');
      return;
    }

    const anterior = this.fotoPreview();
    if (anterior?.startsWith('blob:')) URL.revokeObjectURL(anterior);
    this.fotoPreview.set(URL.createObjectURL(archivo));

    this.usuarios.subirFoto(archivo).subscribe({
      next: () => this.fotoGuardada.set(true),
      error: (e: HttpErrorResponse) =>
        this.errorFoto.set(e.error?.message ?? 'No se pudo subir la foto.')
    });
  }
}
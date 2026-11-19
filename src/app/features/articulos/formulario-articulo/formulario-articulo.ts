import { Component, inject, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, map, of, switchMap, tap } from 'rxjs';
import { Articulo, Categoria, CONDITIONS, EstadoConservacion, Foto } from '../../../core/models';
import { errMsg } from '../../../core/api.service';
import { Categorias } from '../../../core/categorias';
import { Articulos, DatosArticulo, MAX_FOTOS } from '../articulos';

/** Tipos de imagen admitidos y tamaño máximo, igual que en el back */
const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO = 2 * 1024 * 1024;

/** Foto elegida en el formulario que todavía no se ha subido */
interface FotoNueva {
  archivo: File;
  vista: string; // URL temporal para la previsualización
}

/**
 * Formulario de artículo. Sirve para crear (/articulos/nuevo) y para editar (/articulos/:id/editar).
 *
 * - Crear: el artículo se crea como borrador, después se suben las fotos elegidas y,
 *   si se ha pulsado «Publicar», se publica.
 * - Editar: carga los datos y las fotos que ya tiene. Las fotos que ya están subidas se borran
 *   al momento; las nuevas se suben al guardar.
 * - Publicar exige al menos una foto (el back responde 409 si no la hay).
 */
@Component({
  selector: 'app-formulario-articulo',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './formulario-articulo.html',
  styleUrl: './formulario-articulo.css'
})
export class FormularioArticulo implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articulos = inject(Articulos);
  private categoriasService = inject(Categorias);

  protected readonly conservaciones = CONDITIONS;
  protected readonly maxFotos = MAX_FOTOS;

  /** Id del artículo si estamos editando; null si estamos creando */
  idArticulo = signal<number | null>(null);
  articulo = signal<Articulo | null>(null);
  categorias = signal<Categoria[]>([]);

  fotosSubidas = signal<Foto[]>([]);
  fotosNuevas = signal<FotoNueva[]>([]);
  totalFotos = computed(() => this.fotosSubidas().length + this.fotosNuevas().length);

  cargando = signal(false);
  guardando = signal(false);
  error = signal('');
  errorFotos = signal('');

  /** En editar, solo se puede publicar si sigue siendo un borrador */
  puedePublicar = computed(() => !this.articulo() || this.articulo()!.estado === 'borrador');

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(120)]],
    descripcion: ['', Validators.required],
    precio: [null as number | null, [Validators.required, Validators.min(0)]],
    id_categoria: [null as number | null, Validators.required],
    estado_conservacion: ['' as EstadoConservacion | '', Validators.required],
    ubicacion: ['', Validators.maxLength(100)]
  });

  ngOnInit() {
    this.categoriasService.getCategorias().subscribe({
      next: c => this.categorias.set(c),
      error: e => this.error.set(errMsg(e))
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.idArticulo.set(id);
      this.cargarArticulo(id);
    }
  }

  ngOnDestroy() {
    // Libera las URLs temporales de las previsualizaciones
    this.fotosNuevas().forEach(f => URL.revokeObjectURL(f.vista));
  }

  /** Editar: rellena el formulario con los datos del artículo */
  private cargarArticulo(id: number) {
    this.cargando.set(true);
    this.articulos.getMiArticulo(id).subscribe({
      next: a => {
        this.articulo.set(a);
        this.fotosSubidas.set(a.fotos);
        this.form.patchValue({
          titulo: a.titulo,
          descripcion: a.descripcion,
          precio: a.precio,
          id_categoria: a.categoria.id,
          estado_conservacion: a.estado_conservacion,
          ubicacion: a.ubicacion ?? ''
        });
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(errMsg(e));
        this.cargando.set(false);
      }
    });
  }

  /** ¿Hay que enseñar el error de este campo? Solo si es inválido y el usuario ya lo ha tocado */
  mostrar(campo: string): boolean {
    const c = this.form.get(campo)!;
    return c.invalid && (c.touched || c.dirty);
  }

  // ---------- Fotos ----------

  /** Comprueba las fotos elegidas (tipo, tamaño y cantidad) y las añade a la lista con su previsualización */
  elegirFotos(evento: Event) {
    this.errorFotos.set('');
    this.error.set('');
    const input = evento.target as HTMLInputElement;
    const archivos = Array.from(input.files ?? []);
    input.value = ''; // para poder volver a elegir el mismo archivo

    const huecos = MAX_FOTOS - this.totalFotos();
    if (archivos.length > huecos) {
      this.errorFotos.set(`Puedes subir como máximo ${MAX_FOTOS} fotos. Te quedan ${huecos}.`);
      return;
    }
    const noValida = archivos.find(a => !TIPOS_FOTO.includes(a.type));
    if (noValida) {
      this.errorFotos.set(`«${noValida.name}» no es una imagen JPG, PNG o WEBP.`);
      return;
    }
    const grande = archivos.find(a => a.size > TAMANO_MAXIMO);
    if (grande) {
      this.errorFotos.set(`«${grande.name}» pesa más de 2 MB.`);
      return;
    }

    const nuevas = archivos.map(archivo => ({ archivo, vista: URL.createObjectURL(archivo) }));
    this.fotosNuevas.update(lista => [...lista, ...nuevas]);
  }

  /** Quita una foto nueva (todavía no subida) */
  quitarFotoNueva(foto: FotoNueva) {
    URL.revokeObjectURL(foto.vista);
    this.fotosNuevas.update(lista => lista.filter(f => f !== foto));
  }

  /** Borra en el back una foto que ya estaba subida */
  borrarFotoSubida(foto: Foto) {
    this.errorFotos.set('');
    this.articulos.borrarFoto(foto.id).subscribe({
      next: quedan => this.fotosSubidas.set(quedan),
      error: e => this.errorFotos.set(errMsg(e))
    });
  }

  // ---------- Guardar y publicar ----------

  /**
   * Guarda el artículo (crea o edita), sube las fotos nuevas y, si publicar es true, lo publica.
   * Al terminar vuelve a Mis artículos.
   */
  guardar(publicar: boolean) {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Revisa los campos marcados en rojo.');
      return;
    }
    if (publicar && this.totalFotos() === 0) {
      this.error.set('Añade al menos una foto para publicar el artículo.');
      return;
    }

    const v = this.form.getRawValue();
    const datos: DatosArticulo = {
      titulo: v.titulo.trim(),
      descripcion: v.descripcion.trim(),
      precio: Number(v.precio),
      id_categoria: Number(v.id_categoria),
      estado_conservacion: v.estado_conservacion as EstadoConservacion,
      ubicacion: v.ubicacion.trim() || null
    };

    const id = this.idArticulo();
    const guardarDatos: Observable<Articulo> = id ? this.articulos.editar(id, datos) : this.articulos.crear(datos);
    const archivos = this.fotosNuevas().map(f => f.archivo);

    this.guardando.set(true);
    guardarDatos
      .pipe(
        // 1. Guardar los datos. A partir de aquí el artículo ya existe: si algo falla después
        //    y se vuelve a pulsar el botón, se edita en vez de crear otro.
        tap(a => {
          this.idArticulo.set(a.id);
          this.articulo.set(a);
        }),
        // 2. Subir las fotos nuevas, si hay
        switchMap(a =>
          archivos.length
            ? this.articulos.subirFotos(a.id, archivos).pipe(
                tap(fotos => {
                  this.fotosNuevas().forEach(f => URL.revokeObjectURL(f.vista));
                  this.fotosNuevas.set([]);
                  this.fotosSubidas.set(fotos);
                }),
                map(() => a)
              )
            : of(a)
        ),
        // 3. Publicar, si se ha pulsado «Publicar»
        switchMap(a => (publicar ? this.articulos.publicar(a.id) : of(a)))
      )
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.router.navigate(['/mis-articulos']);
        },
        error: (e: HttpErrorResponse) => {
          this.guardando.set(false);
          this.error.set(errMsg(e));
        }
      });
  }
}

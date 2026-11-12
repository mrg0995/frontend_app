import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { errMsg } from '../core/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="narrow card">
      <h1>Entra en segunda mano</h1>
      @if (error()) { <div class="alert" role="alert">{{ error() }}</div> }
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" autocomplete="email" [class.invalid]="show('email')">
          @if (show('email')) { <span class="error">Introduce un email válido.</span> }
        </div>
        <div class="field">
          <label for="password_hash">Contraseña</label>
          <input id="password_hash" type="password" formControlName="password_hash" autocomplete="current-password" [class.invalid]="show('password_hash')">
          @if (show('password_hash')) { <span class="error">La contraseña es obligatoria.</span> }
        </div>
        <button class="btn btn-primary btn-block" [disabled]="loading()">{{ loading() ? 'Entrando…' : 'Entrar' }}</button>
      </form>
      <p class="muted small">¿No tienes cuenta? <a routerLink="/registro">Crear cuenta</a></p>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  error = signal('');
  loading = signal(false);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password_hash: ['', Validators.required]
  });
  show(c: string) { const x = this.form.get(c)!; return x.invalid && (x.touched || x.dirty); }
  submit() {
    this.error.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const { email, password_hash: password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        const ret = this.route.snapshot.queryParamMap.get('returnUrl');
        const safe = ret && ret.startsWith('/') && !ret.startsWith('//') ? ret : null;
        this.router.navigateByUrl(safe || this.auth.homeUrl());
      },
      error: e => { this.error.set(errMsg(e)); this.loading.set(false); }
    });
  }
}

function sameAs(a: string, b: string) {
  return (g: AbstractControl): ValidationErrors | null =>
    g.get(a)?.value === g.get(b)?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="narrow card">
      <h1>Crea tu cuenta</h1>
      @if (error()) { <div class="alert" role="alert">{{ error() }}</div> }
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label for="nombre_usuario">Nombre de usuario</label>
          <input id="nombre_usuario" formControlName="nombre_usuario" autocomplete="username" [class.invalid]="show('nombre_usuario')">
          @if (show('nombre_usuario')) { <span class="error">Entre 3 y 40 caracteres.</span> }
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" autocomplete="email" [class.invalid]="show('email')">
          @if (show('email')) { <span class="error">Introduce un email válido.</span> }
        </div>
        <div class="field">
          <label for="password_hash">Contraseña</label>
          <input id="password_hash" type="password" formControlName="password_hash" autocomplete="new-password" [class.invalid]="show('password_hash')">
          @if (show('password_hash')) { <span class="error">Mínimo 8 caracteres.</span> }
        </div>
        <div class="field">
          <label for="confirm">Repite la contraseña</label>
          <input id="confirm" type="password" formControlName="confirm" autocomplete="new-password"
                 [class.invalid]="form.hasError('mismatch') && form.get('confirm')!.touched">
          @if (form.hasError('mismatch') && form.get('confirm')!.touched) { <span class="error">Las contraseñas no coinciden.</span> }
        </div>
        <button class="btn btn-primary btn-block" [disabled]="loading()">{{ loading() ? 'Creando…' : 'Crear cuenta' }}</button>
      </form>
      <p class="muted small">¿Ya tienes cuenta? <a routerLink="/login">Entrar</a></p>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  error = signal('');
  loading = signal(false);
  form = this.fb.nonNullable.group({
    nombre_usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
    email: ['', [Validators.required, Validators.email]],
    password_hash: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required]
  }, { validators: sameAs('password_hash', 'confirm') });
  show(c: string) { const x = this.form.get(c)!; return x.invalid && (x.touched || x.dirty); }
  submit() {
    this.error.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const { nombre_usuario: username, email, password_hash: password } = this.form.getRawValue();
    this.auth.register(username, email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: e => { this.error.set(errMsg(e)); this.loading.set(false); }
    });
  }
}

import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { Usuario } from './models';

interface Session { message?: string; token: string; usuario: Usuario; }

function readUser(): Usuario | null {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    user = signal<Usuario | null>(readUser());
    isLogged = computed(() => !!this.user());
    role = computed(() => this.user()?.role ?? null);
    isStaff = computed(() => ['moderador', 'administrador'].includes(this.user()?.role ?? ''));

    get token(): string | null { return localStorage.getItem('token'); }

    login(email: string, password: string) {
        return this.http.post<Session>('/api/auth/login', { email, password }).pipe(tap(s => this.setSession(s)));
    }

    register(nombre_usuario: string, email: string, password: string) {
        return this.http.post<Session>('/api/auth/registro', { nombre_usuario, email, password })
            .pipe(tap(s => this.setSession(s)));
    }

    private setSession(s: Session) {
        localStorage.setItem('token', s.token);
        this.updateUser(s.usuario);
    }

    updateUser(u: Usuario) {
        localStorage.setItem('user', JSON.stringify(u));
        this.user.set(u);
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.user.set(null);
        this.router.navigate(['/']);
    }

    homeUrl(): string {
        switch (this.role()) {
            case 'administrador': return '/admin';
            case 'moderador': return '/moderacion';
            default: return '/';
        }
    }
}

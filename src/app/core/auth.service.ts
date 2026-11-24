import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { Usuario } from './models';
import { SocketService } from './socket.service';

interface Session { message?: string; token: string; usuario: Usuario; }

function readUser(): Usuario | null {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private socketService = inject(SocketService);

    user = signal<Usuario | null>(readUser());
    isLogged = computed(() => !!this.user());
    role = computed(() => this.user()?.rol ?? null);
    isStaff = computed(() => ['moderador', 'administrador'].includes(this.user()?.rol ?? ''));

    get token(): string | null { return localStorage.getItem('token'); }

    constructor() {
        const token = this.getToken();
        if (token) {
          this.socketService.conectar(token);
        }
    }

    login(credenciales: { email: string; password: string }) {
        return this.http.post<{ token: string; usuario: any }>('http://localhost:3000/api/auth/login', credenciales).pipe(
          tap((respuesta) => {
            localStorage.setItem('token', respuesta.token);
            this.socketService.conectar(respuesta.token);
          })
        );
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
        this.socketService.desconectar();
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

    getToken(): string | null {
        return localStorage.getItem('token');
    }
    
    estaAutenticado(): boolean {
        return !!this.getToken();
    }
    
    getUsuarioActualId(): number | null {
        return this.user()?.id ?? null;
    }   
}

import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { User } from './models';

interface Session { token: string; user: User; }

function readUser(): User | null {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  user = signal<User | null>(readUser());
  isLogged = computed(() => !!this.user());
  role = computed(() => this.user()?.role ?? null);
  isStaff = computed(() => ['moderator', 'admin'].includes(this.user()?.role ?? ''));

  get token(): string | null { return localStorage.getItem('token'); }

  login(email: string, password: string) {
    return this.http.post<Session>('/api/auth/login', { email, password }).pipe(tap(s => this.setSession(s)));
  }

  register(username: string, email: string, password: string) {
    return this.http.post<Session>('/api/auth/register', { username, email, password }).pipe(tap(s => this.setSession(s)));
  }

  private setSession(s: Session) {
    localStorage.setItem('token', s.token);
    this.updateUser(s.user);
  }

  updateUser(u: User) {
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
      case 'admin': return '/admin';
      case 'moderator': return '/moderacion';
      default: return '/';
    }
  }
}

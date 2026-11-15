import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private http = inject(HttpClient);

    get<T = any>(url: string, params?: Record<string, any>): Observable<T> {
        let p = new HttpParams();
        for (const [k, v] of Object.entries(params || {})) {
            if (v !== null && v !== undefined && v !== '') p = p.set(k, String(v));
        }
        return this.http.get<T>('/api' + url, { params: p });
    }
    post<T = any>(url: string, body: any = {}): Observable<T> { return this.http.post<T>('/api' + url, body); }
    put<T = any>(url: string, body: any = {}): Observable<T> { return this.http.put<T>('/api' + url, body); }
    patch<T = any>(url: string, body: any = {}): Observable<T> { return this.http.patch<T>('/api' + url, body); }
    delete<T = any>(url: string): Observable<T> { return this.http.delete<T>('/api' + url); }
}

export function errMsg(e: any): string {
    return e?.error?.message || (e?.status === 0 ? 'No se puede conectar con el servidor.' : 'Ha ocurrido un error. Inténtalo de nuevo.');
}

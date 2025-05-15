import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/usuarios';

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  register(user: { nombre: string; password: string; email: string; edad: number; peso_inicial: number; objetivo: string; nivel_actividad: string; altura: number; sexo: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/registro`, user);
  }

  // Ejemplo de llamada a una ruta protegida
  getProtectedData(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/protected`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  getUsuario(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/get_usuario?id=${id}`);
  }

  editarUsuario(id: number, username: string, email: string, altura: number, nivel_actividad: string, sexo: string, peso_inicial: number, objetivo: string, edad: number): Observable<any>{
    return this.http.put(`${this.baseUrl}/editar_usuario?id=${id}`, {username, email,altura, nivel_actividad, sexo, peso_inicial, objetivo, edad});
  }
}
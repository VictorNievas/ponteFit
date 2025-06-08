import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment'; // Asegúrate de que esta ruta sea correcta

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = `${environment.apiUrl}/ejercicios`;

  constructor(private http: HttpClient) { }

  // Método para obtener los datos desde el backend
  getEjericios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get_ejercicios`);
  }

  getEjercicio(id: Number): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_ejercicio?id=${id}`);
  }

  getRutina(id: Number): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_rutina?id=${id}`);
  }

  getRutinasUsuario(id: Number): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_rutinas?id=${id}`);
  }

  crearRutina(nombre: string, descripcion: string, id: Number, ejercicios : Object): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear_rutina`, {nombre, descripcion, id, ejercicios});
  }

  anadirEjercicioRutina(id_ejercicio: number, id_rutina: number, series: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/anadir_ejercicio_rutina`, {id_ejercicio, id_rutina, series});
  }

  actualizarRutina(id: number, rutina: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}/actualizar_rutina`, {id, rutina});
  }

  guardarSesion(sesion: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}/guardar_sesion`, {sesion});
  }

  getUltimaSesion(id: number, rutina_id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_ultima_sesion?id=${id}&rutina_id=${rutina_id}`);
  }

  getMisSesiones(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_mis_sesiones?id=${id}`);
  }

  getSesiones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_sesiones`);
  }

  getSesionesPublicas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_sesiones_publicas`);
  }

  getSesionesRutina(id: number, rutina_id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_sesiones_rutina?id=${id}&rutina_id=${rutina_id}`);
  }

  anadirRecord(id_usuario: number, id_ejercicio: number, objetivo: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/anadir_record`, {id_usuario, id_ejercicio, objetivo});
  }

  getRecord(id_usuario: number, id_ejercicio: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_record?id_usuario=${id_usuario}&id_ejercicio=${id_ejercicio}`);
  }

  actualizarRecord(id_usuario:number,id_ejercicio: number, objetivo: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/actualizar_record`, {id_usuario,id_ejercicio, objetivo});
  }

  anadirComentario(id_sesion: number, id_usuario: number, comentario: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/anadir_comentario`, {id_sesion, id_usuario, comentario});
  }

  getRegistroEjercicio(id_usuario: number, id_ejercicio: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_registro_ejercicio?id_usuario=${id_usuario}&id_ejercicio=${id_ejercicio}`);
  }
}



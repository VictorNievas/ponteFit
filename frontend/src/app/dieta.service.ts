import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DietaService {

  private apiUrl = 'http://localhost:5000/api/dieta'; // URL de tu backend Flask

  constructor(private http: HttpClient) { }

  // Método para obtener los datos desde el backend
  getPeso(id:number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get_peso?id=${id}`);
  }

  calcularCaloriasBasales(id:Number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/calcular_calorias_basales?id=${id}`);
  }

  calcularMacros(id:Number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/calcular_macros?id=${id}`);
  }

  registrarPeso(id: number, peso: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registrar_peso`, {
      id: id,
      peso: peso
    });
  }

  getTodosPesos(id:Number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get_todos_pesos?id=${id}`);
  }

}


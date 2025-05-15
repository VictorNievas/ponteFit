import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleService {

  private apiUrl = 'http://localhost:5000/api/google'; // URL de tu backend Flask

  constructor(private http: HttpClient) { }

  // Iniciar autenticación con Google Fit
  authenticateWithGoogleFit(): void {
    window.location.href = `${this.apiUrl}/google_fit_auth`; 
  }
  
  // Obtener datos de Google Fit con JWT y cookies
  getGoogleFitData(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/google_fit_data`, { headers, withCredentials: true }).pipe(
      catchError(error => {
        console.error('Error en getGoogleFitData:', error);
        return throwError(() => new Error('Error al obtener datos de Google Fit.'));
      })
    );
  }
}

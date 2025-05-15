import { Component } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-mis-sesiones',
  standalone: false,
  
  templateUrl: './mis-sesiones.component.html',
  styleUrl: './mis-sesiones.component.css'
})
export class MisSesionesComponent {
  constructor(private apiService: ApiService) {}
  sesiones: any[] = [];
  userId: number | null = null;

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('usuario'));
    this.getSesiones(this.userId);
  }

  // Método para obtener las sesiones del usuario
  async getSesiones(id: number): Promise<void> {
    try {
      const response = await this.apiService.getMisSesiones(id).toPromise();
      this.sesiones = response;
      for (const sesion of this.sesiones) {
        const rutinaResponse = await this.apiService.getRutina(sesion.id_rutina).toPromise();
        sesion.nombreRutina = rutinaResponse.nombre;
        for (const ejercicio of sesion.ejercicios) {
          const ejercicioResponse = await this.apiService.getEjercicio(ejercicio.id_ejercicio).toPromise();
          ejercicio.nombre = ejercicioResponse.nombre;
          ejercicio.tipo = ejercicioResponse.tipo;
          ejercicio.imagen = ejercicioResponse.imagen;
        }
      } 
      console.log('Sesiones obtenidas: ', this.sesiones);
    } catch (error) {
      console.error('Error al obtener las sesiones: ', error);
    }
  }

  sesionesOrdenadas(): any[] {
    return [...this.sesiones].sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      return fechaB - fechaA; // Orden descendente (más nuevas primero)
    });
  }

  getVisiblePropsCount(serie: any): number {
    let count = 0;
    
    if (serie.repeticiones !== undefined && serie.repeticiones !== null) count++;
    if (serie.peso !== undefined && serie.peso !== null) count++;
    if (serie.distancia !== undefined && serie.distancia !== null) count++;
    if (serie.tiempo !== undefined && serie.tiempo !== null) count++;
    
    return count;
  }
      
}

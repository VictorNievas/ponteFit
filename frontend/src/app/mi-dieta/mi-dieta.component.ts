import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DietaService } from '../dieta.service'; 
import Chart from 'chart.js/auto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dieta',
  templateUrl: './mi-dieta.component.html',
  styleUrls: ['./mi-dieta.component.css'],
  standalone: false
})
export class MiDietaComponent implements OnInit {

  userPeso: any;
  userId: number | null = null;

  peso: number | null = null; 
  proteinas: number | null = null; 
  carbohidratos: number | null = null;
  grasas: number | null = null; 
  calorias: number | null = null;
  modalVisibleNuevoPeso: boolean = false;
  modalVisibleGrafica: boolean = false;
  nuevoPeso: number | null = null;
  pesoData: { date: string; weight: number }[] = [];

  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  private chart: Chart | null = null;  // Variable para almacenar la instancia del gráfico

  openWeightDialog() {
    console.log('Abriendo diálogo para registrar nuevo peso');
  }

  openModalNuevoPeso(): void {
    this.modalVisibleNuevoPeso = true;
  }

  closeModalNuevoPeso(): void {
    this.modalVisibleNuevoPeso = false;
  }
  
  openModalGrafica(): void {
    this.modalVisibleGrafica = true;
    this.getTodosPesos(Number(localStorage.getItem('usuario')));
    setTimeout(() => this.loadChart(), 300);  // Pequeño delay para evitar errores con el canvas
  }

  closeModalGrafica(): void {
    this.modalVisibleGrafica = false;
  }

  loadChart() {
    // Destruir el gráfico anterior si existe
    if (this.chart) {
      this.chart.destroy();
    }

    // Crear un nuevo gráfico
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.pesoData.map(entry => entry.date),
        datasets: [
          {
            label: 'Peso (kg)',
            data: this.pesoData.map(entry => entry.weight),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: '#2563eb',
          },
        ],
      },
    });
  }

  constructor(private dietaServce: DietaService) { }

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('usuario'));
    this.getUserPeso(this.userId);
    this.calcularCaloriasBasales(this.userId);
    this.calcularMacros(this.userId);
  }

  getUserPeso(id: number): void {
    this.dietaServce.getPeso(id).subscribe(
      (response) => {
        console.log('Peso del usuario:', response);
        this.userPeso = response;  // Asignar el valor de peso a la variable
      },
      (error) => {
        console.error('Error al obtener el peso:', error);
      }
    );
  }

  calcularCaloriasBasales(id: Number): any {
    this.dietaServce.calcularCaloriasBasales(id).subscribe(
      (response) => {
        console.log('Calorias Basales del usuario:', response);
        return response;
      },
      (error) => {
        console.error('Error al obtener las calorias basales:', error);
      }
    );
  }

  calcularMacros(id: Number): void {
    this.dietaServce.calcularMacros(id).subscribe(
      (response) => {
        console.log('Macros del usuario:', response);
        this.calorias = response.calorias;
        this.proteinas = response.proteina;
        this.carbohidratos = response.carbohidratos;
        this.grasas = response.grasa;
      },
      (error) => {
        console.error('Error al obtener los macros:', error);
      }
    );
  }

  guardarPeso() {
    if (this.nuevoPeso == null || this.nuevoPeso < 0) {
      // Validar que el peso sea válido
    } else {
      this.userId = Number(localStorage.getItem('usuario'));
      this.registrarPeso(this.userId, this.nuevoPeso);
      this.closeModalNuevoPeso();
    }
  }

  registrarPeso(id: number, peso: number): void {
    this.dietaServce.registrarPeso(id, peso).subscribe(
      (response) => {
        console.log('Peso registrado con éxito:', response);
        Swal.fire({
          title: 'Peso Registrado',
          text: 'Se ha registrado un nuevo peso',
          icon: 'success',
          confirmButtonText: 'Ok'
        }).then((result) => {
          if (result.isConfirmed) {
            // Recargar la página solo cuando se presiona "Ok"
            window.location.reload();
          }
        });
        
      },
      (error) => {
        console.error('Error al registrar el peso:', error);
        alert("Hubo un error al registrar el peso.");
      }
    );
  }

  getTodosPesos(id: number): void {
    this.dietaServce.getTodosPesos(id).subscribe(
      (response) => {
        console.log('Todos los pesos del usuario:', response.pesos);
        this.pesoData = response.pesos.map((registro: any) => ({
          date: new Date(registro.fecha).toLocaleDateString(),
          weight: registro.peso
        }));
      },
      (error) => {
        console.error('Error al obtener el registro de los pesos: ', error);
      }
    );
  }
}

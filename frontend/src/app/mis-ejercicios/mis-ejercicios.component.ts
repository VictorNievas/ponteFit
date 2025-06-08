import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../api.service';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import {Chart} from 'chart.js';
@Component({
    selector: 'app-mis-ejercicios',
    templateUrl: './mis-ejercicios.component.html',
    styleUrls: ['./mis-ejercicios.component.css'],
    standalone: false
})
export class MisEjerciciosComponent implements OnInit {
  originalData: any[] = []; // Almacena todos los datos originales
  data: any[] = []; // Almacena los datos filtrados
  selectedCategoria: string | null = null;
  selectedTipo: string | null = null;
  elementoSeleccionado: any;
  rutinas: any[] = []; // Lista de rutinas disponibles
  rutinaSeleccionada: any = null;
  series: number = 1;
  objetivo: number = 1;
  nombreEjercicios: Map<number, string> = new Map(); // Cache para nombres de ejercicios
  tipos = ['Fuerza', 'Cardio', 'Flexibilidad'];
  categorias = ['Pectoral', 'Espalda', 'Brazo', 'Pierna', 'Abdomen'];
  isDropdownOpenCategoria = false;
  isDropdownOpenTipo = false;
  modalAbierto = false;
  filtroBusqueda: string = '';
  modalVisibleGrafica = false;
  chart: any;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  registroData: { date: string, peso: number }[] = [];


  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.apiService.getEjericios().subscribe((response: any[]) => {
      console.log("Ejercicios: ", response);
      this.originalData = response;
      this.data = [...this.originalData];
      this.obtenerRutinas();
    });
  }

  toggleDropdown(dropdown: string) {
    if (dropdown === 'categoria') {
      this.isDropdownOpenCategoria = !this.isDropdownOpenCategoria;
      this.isDropdownOpenTipo = false;
    } else if (dropdown === 'tipo') {
      this.isDropdownOpenTipo = !this.isDropdownOpenTipo;
      this.isDropdownOpenCategoria = false;
    }
  }

  setCategoria(categoria: string): void {
    this.selectedCategoria = categoria;
    this.isDropdownOpenCategoria = false;
    this.applyFilters();
  }

  setTipo(tipo: string): void {
    this.selectedTipo = tipo;
    this.isDropdownOpenTipo = false;
    this.applyFilters();
  }

  applyFilters(): void {
    this.data = this.originalData.filter((item) => {
      const matchesCategoria = this.selectedCategoria ? item.categoria === this.selectedCategoria : true;
      const matchesTipo = this.selectedTipo ? item.tipo === this.selectedTipo : true;
      return matchesCategoria && matchesTipo;
    });
  }

  eliminarFiltros(): void {
    this.data = this.originalData;
    this.selectedCategoria = null;
    this.selectedTipo = null;
    this.isDropdownOpenCategoria = false;
    this.isDropdownOpenTipo = false;
  }

  abrirModal(item: any): void {
    this.elementoSeleccionado = item;
    this.rutinaSeleccionada = null;
    this.series = 1;
    this.objetivo = 1;
    this.modalAbierto = true;
  }

  async obtenerRutinas() {
    try {
      const data = await lastValueFrom(this.apiService.getRutinasUsuario(Number(localStorage.getItem('usuario'))));
      this.rutinas = data;
      for (let rutina of this.rutinas) {
        for (let ejercicio of rutina.ejercicios) {
          ejercicio.nombre = await this.getEjercicio(ejercicio.id_ejercicio);
        }
      }
    } catch (error) {
      console.error('Error obteniendo rutinas:', error);
    }
  }

  async getEjercicio(id: number): Promise<string> {
    if (this.nombreEjercicios.has(id)) {
      return this.nombreEjercicios.get(id) || 'Desconocido';
    }
    try {
      const response = await lastValueFrom(this.apiService.getEjercicio(id));
      this.nombreEjercicios.set(id, response.nombre);
      return response.nombre;
    } catch (error) {
      console.error('Error al mostrar el ejercicio: ', error);
      return 'Desconocido';
    }
  }
  cerrarModal(): void {
    this.modalAbierto = false;
  }

  confirmarAnadir(): void {
    if (this.rutinaSeleccionada && this.series > 0 && this.objetivo > 0) {
      console.log(`Añadiendo ${this.elementoSeleccionado.nombre} a la rutina ${this.rutinaSeleccionada} con ${this.series} series.`);
      this.apiService.anadirEjercicioRutina(this.elementoSeleccionado.id, this.rutinaSeleccionada, this.series).subscribe(
        (response) => {
          console.log('Ejercicio añadido correctamente.');
          Swal.fire({
                    title: 'Ejercicio añadido a la rutina',
                    text: 'Se ha añadido el ejercicio correctamente a la rutina',
                    icon: 'success',
                    confirmButtonText: 'Ok'
          });
        },
        (error) => {
          console.error('Error al añadir ejercicio:', error);
        }

      )
      if(this.elementoSeleccionado.tipo === 'Fuerza') {
        this.apiService.anadirRecord(Number(localStorage.getItem('usuario')), this.elementoSeleccionado.id, this.objetivo).subscribe(
          (response) => {},
          (error) => {});
      }
      this.cerrarModal();
    } else {
      alert('Por favor, selecciona una rutina y un número válido de series.');
    }
  }
  filtrarEjercicios(){
    this.applyFilters(); // Aplica primero los filtros de tipo y categoría
    this.data = this.data.filter(item =>
    item.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase())
  );
  }

  openModalGrafica(item: any): void {
  this.elementoSeleccionado = item;
  this.modalVisibleGrafica = true;

  // Esperamos un poco a que el canvas se renderice en el DOM
  setTimeout(() => {
    this.getRegistrosEjercicio(
      Number(localStorage.getItem('usuario')),
      this.elementoSeleccionado.id
    );
  }, 100); // No hace falta que sea 300ms
}

closeModalGrafica(): void {
  this.modalVisibleGrafica = false;
  if (this.chart) {
    this.chart.destroy();
  }
}

getRegistrosEjercicio(usuarioId: number, ejercicioId: number): void {
  this.apiService.getRegistroEjercicio(usuarioId, ejercicioId).subscribe(
    (response: any[]) => {
      this.registroData = response.map(r => ({
        date: new Date(r.fecha).toLocaleDateString(),
        peso: r.valor
      }));
      // Esperamos a que Angular haya renderizado el canvas
      setTimeout(() => {
        this.cdr.detectChanges();
        this.loadChart();
      }, 0);
    },
    (error) => {
      console.error('Error al obtener los registros del ejercicio:', error);
      this.registroData = [];
    }
  );
}

loadChart(): void {
  if (!this.chartCanvas) {
    console.error('Canvas no disponible aún');
    return;
  }

  if (this.chart) {
    this.chart.destroy();
  }

  this.chart = new Chart(this.chartCanvas.nativeElement, {
    type: 'line',
    data: {
      labels: this.registroData.map(entry => entry.date),
      datasets: [
        {
          label: 'Mejor Serie (kg)',
          data: this.registroData.map(entry => entry.peso),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#2563eb',
        }
      ]
    },
    options: {
      responsive: true
    }
  });
}


}

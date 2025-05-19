import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-descubrir',
  standalone: false,
  templateUrl: './descubrir.component.html',
  styleUrl: './descubrir.component.css'
})
export class DescubrirComponent {
  constructor(private apiService: ApiService, private usuariosService: AuthService) {}
  sesiones: any[] = [];
  nuevoComentario: string = '';
  showComentarios: (boolean | null)[] = [];
  nuevoNombreRutina: string = '';
  nuevaDescripcionRutina: string = '';
  modalCopiarRutina: boolean = false;
  sesion_actual: number = 0;
  sesiones_todas: any[] = [];

  ngOnInit(): void {
    this.getSesionesPublicas();
  }

  async getSesionesPublicas(): Promise<void> {
    try {
      const response = await this.apiService.getSesionesPublicas().toPromise();
      this.sesiones = response;
      const response2 = await this.apiService.getSesiones().toPromise();
      this.sesiones_todas = response2;
      console.log('Sesiones obtenidas todas: ', this.sesiones_todas);
      for (const sesion of this.sesiones) {
        const rutinaResponse = await this.apiService.getRutina(sesion.id_rutina).toPromise();
        sesion.nombreRutina = rutinaResponse.nombre;
        var usuario = await this.usuariosService.getUsuario(sesion.id_usuario).toPromise();
        sesion.nombreUsuario = usuario.username;
        for(const comentario of sesion.comentarios){
          var usuarioComentario = await this.usuariosService.getUsuario(comentario.id_usuario).toPromise();
          comentario.nombreUsuario = usuarioComentario.username;
        }
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

  mostrarComentarios(id_sesion: number): void {
    this.showComentarios[id_sesion] = !this.showComentarios[id_sesion];
  }

  async addComentario(id_sesion: number): Promise<void> {
    const usuarioId = Number(localStorage.getItem('usuario'));
    const comentarioTexto = this.nuevoComentario.trim();
  
    if (!comentarioTexto) return; // Evitar comentarios vacíos
  
    try {
      // Enviar el comentario al backend
      await this.apiService.anadirComentario(id_sesion, usuarioId, comentarioTexto).toPromise();
  
      // Vaciar el input de comentario
      this.nuevoComentario = '';
      let usuario = await this.usuariosService.getUsuario(usuarioId).toPromise();
      // Actualizar la lista de comentarios en el frontend
      const sesion = this.sesiones.find(sesion => sesion.id === id_sesion);  // Encuentra la sesión correcta
      if (sesion) {
        // Agregar el nuevo comentario a la lista de comentarios de la sesión
        sesion.comentarios.push({
          nombreUsuario: usuario.username,  // Nombre del usuario o lo que sea necesario
          comentario: comentarioTexto
        });
      }
    } catch (error) {
      console.error("Error al añadir comentario:", error);
    }
  }

  abrirModal(id_sesion: number): void {
    this.sesion_actual = id_sesion;
    console.log('Sesion actual:', this.sesion_actual);
    console.log('Sesion actual:', this.sesiones[this.sesion_actual -1]);
    this.modalCopiarRutina = true;
  }

  // Método para cerrar el modal
  cerrarModal() {
    this.modalCopiarRutina = false;
  }

  async guardarRutina(): Promise<void> {
    const usuarioId = Number(localStorage.getItem('usuario'));
    const nombre = this.nuevoNombreRutina.trim();
    const descripcion = this.nuevaDescripcionRutina.trim();
    console.log('Sesion actual:', this.sesiones_todas[this.sesion_actual]);
    const rutina = await this.apiService.getRutina(this.sesiones_todas[this.sesion_actual-1].id_rutina).toPromise();
    await this.apiService.crearRutina(nombre, descripcion, usuarioId, rutina.ejercicios).toPromise();
    Swal.fire({
      icon: 'success',
      title: 'Rutina Copiada',
      text: 'La rutina ha sido guardada exitosamente.',
      confirmButtonText: 'OK'
    });
    this.cerrarModal();
  }
  
}

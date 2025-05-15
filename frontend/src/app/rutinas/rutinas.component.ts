import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { ApiService } from "../api.service"
import Swal from "sweetalert2"
import { lastValueFrom } from "rxjs"

@Component({
  selector: "app-rutinas",
  templateUrl: "./rutinas.component.html",
  styleUrls: ["./rutinas.component.css"],
  standalone: false,
})
export class RutinasComponent implements OnInit {
  userId: number = Number(localStorage.getItem("usuario"))
  mostrarFormulario = false
  nombreRutina = ""
  descripcionRutina = ""
  rutinas: any[] = [] // Lista de rutinas
  nombreEjercicios: Map<number, string> = new Map() // Cache para nombres de ejercicios

  rutinaSeleccionada: any = null // Rutina en edición
  sesion: any = null // Sesion en edición
  mostrarModalEdicion = false // Control del modal de edición
  mostrarModalRutina = false
  ejerciciosCardio: any[] = []
  ejerciciosFuerza: any[] = []
  ejerciciosFlexibilidad: any[] = []
  ultimaSesion: any = null
  nuevoRecord: number = 0
  ejercicioRecordSeleccionado: any = null

  // Nuevas propiedades para el modal de resultados
  mostrarModalResultados = false
  sesionGuardada: {
    pesoLevantado: number
    pesoAnterior: number | null
    ejercicios: {
      id: string
      nombre: string
      nuevoRecord: number
      recordAnterior: number
    }[]
  } = {
    pesoLevantado: 0,
    pesoAnterior: null,
    ejercicios: [],
  }
  mostrarModalNuevoRecord = false

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    this.obtenerRutinas()
  }

  async obtenerRutinas() {
    try {
      const data = await lastValueFrom(this.apiService.getRutinasUsuario(Number(localStorage.getItem("usuario"))))
      this.rutinas = data

      // Create a map to store exercise types
      const tipoEjercicios: Map<number, string> = new Map()
      const imagenEjercicios: Map<number, string> = new Map()

      // Obtener los nombres de los ejercicios antes de renderizar
      for (const rutina of this.rutinas) {
        for (const ejercicio of rutina.ejercicios) {
          console.log("Ejercicio:", ejercicio)

          // Verificar si el nombre ya está en caché
          if (
            !this.nombreEjercicios.has(ejercicio.id_ejercicio) ||
            !tipoEjercicios.has(ejercicio.id_ejercicio) ||
            !imagenEjercicios.has(ejercicio.id_ejercicio)
          ) {
            const ejercicioData = await this.getEjercicio(ejercicio.id_ejercicio)
            this.nombreEjercicios.set(ejercicio.id_ejercicio, ejercicioData.nombre) // Guardamos en cache
            tipoEjercicios.set(ejercicio.id_ejercicio, ejercicioData.tipo) // Guardamos el tipo en cache
            imagenEjercicios.set(ejercicio.id_ejercicio, ejercicioData.imagen) // Guardamos la imagen en cache
            ejercicio.nombre = ejercicioData.nombre
            ejercicio.tipo = ejercicioData.tipo
            ejercicio.imagen = ejercicioData.imagen
          } else {
            ejercicio.nombre = this.nombreEjercicios.get(ejercicio.id_ejercicio)
            ejercicio.tipo = tipoEjercicios.get(ejercicio.id_ejercicio) // Usar el tipo cacheado
            ejercicio.imagen = imagenEjercicios.get(ejercicio.id_ejercicio)
          }
        }
      }
    } catch (error) {
      console.error("Error obteniendo rutinas:", error)
    }
  }

  abrirFormulario() {
    this.mostrarFormulario = true
  }

  cerrarFormulario() {
    this.mostrarFormulario = false
  }

  abrirModalNuevoRecord(id_ejercicio: any) {
    this.ejercicioRecordSeleccionado = id_ejercicio
    this.mostrarModalNuevoRecord = true
  }

  cerrarModalNuevoRecord() {
    this.ejercicioRecordSeleccionado = null
    this.mostrarModalNuevoRecord = false
  }

  crearRutina(event: Event) {
    event.preventDefault()

    if (!this.nombreRutina.trim() || !this.descripcionRutina.trim()) {
      alert("Por favor, completa todos los campos.")
      return
    }

    this.apiService
      .crearRutina(this.nombreRutina, this.descripcionRutina, Number(localStorage.getItem("usuario")), [])
      .subscribe(
        (respuesta) => {
          this.rutinas.push(respuesta)
          this.nombreRutina = ""
          this.descripcionRutina = ""
          this.mostrarFormulario = false
          Swal.fire({
            title: "Rutina Creada",
            text: "Se ha creado una nueva rutina",
            icon: "success",
            confirmButtonText: "Ok",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload()
            }
          })
        },
        (error) => {
          console.error("Error creando rutina:", error)
        },
      )
  }

  async getEjercicio(id: number): Promise<any> {
    if (this.nombreEjercicios.has(id)) {
      // This should return an object with both name and type
      const ejercicioData = await lastValueFrom(this.apiService.getEjercicio(id))
      return ejercicioData
    }

    try {
      const response = await lastValueFrom(this.apiService.getEjercicio(id))
      this.nombreEjercicios.set(id, response.nombre) // Guardamos en cache
      console.log("Ejercicio get ejercicio:", response)
      return response
    } catch (error) {
      console.error("Error al mostrar el ejercicio: ", error)
      return { nombre: "Desconocido", tipo: "Desconocido" }
    }
  }

  // --------- NUEVAS FUNCIONES PARA EDICIÓN DE RUTINAS ------------

  abrirModalEdicion(rutina: any) {
    this.rutinaSeleccionada = JSON.parse(JSON.stringify(rutina)) // Clonamos la rutina
    this.mostrarModalEdicion = true
  }

  cerrarModalEdicion() {
    this.mostrarModalEdicion = false
    this.rutinaSeleccionada = null
  }

  abrirModalRutina(rutina: any) {
    this.rutinaSeleccionada = JSON.parse(JSON.stringify(rutina)) // Clonamos la rutina
    this.mostrarModalRutina = true

    // Clear previous exercise arrays
    this.ejerciciosCardio = []
    this.ejerciciosFuerza = []
    this.ejerciciosFlexibilidad = []

    console.log("Rutina seleccionada:", this.rutinaSeleccionada)

    // Initialize session data
    this.sesion = {
      id_usuario: Number(localStorage.getItem("usuario")),
      id_rutina: rutina.id,
      fecha: new Date().toISOString().split("T")[0], // Format: YYYY-MM-DD
      ejercicios: {},
      publico: false, // Inicializamos la propiedad publico
    }

    // Sort exercises by type and initialize session data
    for (const ejercicio of this.rutinaSeleccionada.ejercicios) {
      console.log("Procesando ejercicio:", ejercicio)

      // Initialize series array for each exercise
      this.sesion.ejercicios[ejercicio.id_ejercicio] = {
        id_ejercicio: ejercicio.id_ejercicio,
        series: [],
      }

      // Create series objects based on exercise type
      for (let i = 0; i < ejercicio.series; i++) {
        this.sesion.ejercicios[ejercicio.id_ejercicio].series.push({
          peso: null,
          repeticiones: null,
          tiempo: null,
          distancia: null,
        })
      }

      // Sort exercises by type
      switch (ejercicio.tipo) {
        case "Cardio":
          this.ejerciciosCardio.push(ejercicio)
          break
        case "Fuerza":
          this.ejerciciosFuerza.push(ejercicio)
          break
        case "Flexibilidad":
          this.ejerciciosFlexibilidad.push(ejercicio)
          break
      }
    }
    console.log("Ejercicios:", this.rutinaSeleccionada.ejercicios)
    console.log("Ejercicios de Fuerza:", this.ejerciciosFuerza)
    console.log("Ejercicios de Flexibilidad:", this.ejerciciosFlexibilidad)
    console.log("Ejercicios de Cardio:", this.ejerciciosCardio)
    console.log("Sesión inicializada:", this.sesion)
  }

  cerrarModalRutina() {
    this.mostrarModalRutina = false
    this.rutinaSeleccionada = null
  }

  eliminarEjercicio(index: number) {
    this.rutinaSeleccionada.ejercicios.splice(index, 1)
  }

  async anadirEjercicios() {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se guardarán los cambios realizados hasta ahora.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "No, cancelar",
    })

    if (result.isConfirmed) {
      await this.guardarCambios() // Esperar a que termine antes de redirigir
      this.router.navigate(["/mis_ejercicios"])
    }
  }

  guardarCambios() {
    if (!this.rutinaSeleccionada) return
    console.log("Datos enviados:", this.rutinaSeleccionada)

    this.apiService.actualizarRutina(this.rutinaSeleccionada.id, this.rutinaSeleccionada).subscribe(
      () => {
        // Actualizar la rutina en la lista principal
        const index = this.rutinas.findIndex((r) => r.id === this.rutinaSeleccionada.id)
        if (index !== -1) {
          this.rutinas[index] = { ...this.rutinaSeleccionada }
        }
        Swal.fire({
          title: "Rutina Actualizada",
          text: "Los cambios han sido guardados correctamente",
          icon: "success",
          confirmButtonText: "Ok",
        })
        this.cerrarModalEdicion()
      },
      (error) => {
        console.error("Error actualizando rutina:", error)
      },
    )
  }

  // Método modificado para usar el modal de resultados en lugar de SweetAlert
  async guardarSesion() {
    if (!this.rutinaSeleccionada || !this.sesion) return

    const sesionData = {
      id_usuario: this.sesion.id_usuario,
      id_rutina: this.sesion.id_rutina,
      fecha: this.sesion.fecha,
      ejercicios: [] as any[],
      public: this.sesion.publico || false,
      pesoLevantado: 0,
    }

    for (const ejercicio of this.rutinaSeleccionada.ejercicios) {
      const ejercicioData = {
        id_ejercicio: ejercicio.id_ejercicio,
        series: this.sesion.ejercicios[ejercicio.id_ejercicio].series.map((serie: any) => {
          switch (ejercicio.tipo) {
            case "Fuerza":
              sesionData.pesoLevantado += (serie.peso || 0) * (serie.repeticiones || 0)
              return { peso: serie.peso || 0, repeticiones: serie.repeticiones || 0, tiempo: null, distancia: null }
            case "Flexibilidad":
              return { peso: null, repeticiones: serie.repeticiones || 0, tiempo: null, distancia: null }
            case "Cardio":
              return { peso: null, repeticiones: null, tiempo: serie.tiempo || 0, distancia: serie.distancia || 0 }
            default:
              return serie
          }
        }),
      }
      sesionData.ejercicios.push(ejercicioData)
    }

    console.log("Datos de sesión a guardar:", sesionData)

    try {
      // Obtener la última sesión antes de guardar la nueva
      let pesoAnterior: number | null = null
      try {
        const ultimaSesion = await this.apiService
          .getUltimaSesion(sesionData.id_usuario, sesionData.id_rutina)
          .toPromise()
        pesoAnterior = ultimaSesion ? ultimaSesion.pesoLevantado : null
      } catch (error) {
        console.warn("No se encontró sesión anterior, se guardará la primera sesión.")
      }

      // Guardar la nueva sesión
      const respuesta = await this.apiService.guardarSesion(sesionData).toPromise()
      console.log("Nueva sesión guardada:", respuesta)

      // Preparamos los datos para el template
      this.sesionGuardada = {
        pesoLevantado: sesionData.pesoLevantado,
        pesoAnterior: pesoAnterior,
        ejercicios: [],
      }

      // Verificar récords en ejercicios de fuerza
      for (const ejercicio of this.rutinaSeleccionada.ejercicios) {
        if (ejercicio.tipo === "Fuerza") {
          try {
            const record = await this.apiService.getRecord(sesionData.id_usuario, ejercicio.id_ejercicio).toPromise()
            for (const serie of sesionData.ejercicios.find((e: any) => e.id_ejercicio === ejercicio.id_ejercicio)
              .series) {
              const nuevoRecord = serie.peso * (1 + serie.repeticiones / 30)
              if (record.objetivo < nuevoRecord) {
                this.sesionGuardada.ejercicios.push({
                  id: ejercicio.id_ejercicio,
                  nombre: ejercicio.nombre,
                  nuevoRecord: nuevoRecord,
                  recordAnterior: record.objetivo,
                })
              }
            }
          } catch (error) {
            console.warn(`No se pudo obtener el récord de ${ejercicio.nombre}.`, error)
          }
        }
      }

      // Mostrar el modal de resultados
      this.mostrarModalResultados = true
    } catch (error) {
      console.error("Error en la operación:", error)
      Swal.fire({
        title: "❌ Error",
        text: "No se pudo guardar la sesión",
        icon: "error",
        confirmButtonText: "Ok",
      })
    }
  }

  // Método para actualizar un récord
  actualizarRecord(userId:number, ejercicioId: number, nuevoRecord: number) {
    this.apiService.actualizarRecord(userId,ejercicioId, nuevoRecord).subscribe(
      () => {
        console.log("Récord actualizado correctamente")
        Swal.fire({
          title: "Objetivo Actualizada",
          text: "Tu nuevo objetivo ha sido actualizado correctamente",
          icon: "success",
          confirmButtonText: "Ok",
        })
        this.cerrarModalNuevoRecord()
      },
      (error) => {
        console.error("Error al actualizar el récord", error)
      },
    )
  }

  // Método para cerrar el modal de resultados
  cerrarModalResultados() {
    this.mostrarModalResultados = false
    this.cerrarModalRutina()
  }
}


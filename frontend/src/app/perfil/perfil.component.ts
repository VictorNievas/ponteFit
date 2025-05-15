import { Component,  OnInit } from "@angular/core"
import { FormBuilder,  FormGroup, Validators } from "@angular/forms"
import { AuthService } from "../auth.service"
import { GoogleService } from "../google.service"

@Component({
  selector: "app-perfil",
  templateUrl: "./perfil.component.html",
  styleUrls: ["./perfil.component.css"],
  standalone: false
})
export class PerfilComponent implements OnInit {
  usuario: any = {}
  nombre = ""
  email = ""
  altura = 0
  peso = 0
  nivel_actividad = ""
  edad = 0
  objetivo = ""
  sexo = ""

  googleFitAutenticado = false
  googleFitData: any = null
  googleFitDataItems: any[] = []

  mostrarModal = false
  formularioEdicion: FormGroup


  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private googleService: GoogleService
  ) {
    this.formularioEdicion = this.formBuilder.group({
      nombre: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      altura: [0, [Validators.required, Validators.min(0)]],
      peso: [0, [Validators.required, Validators.min(0)]],
      nivel_actividad: ["", Validators.required],
      edad: [0, [Validators.required, Validators.min(0)]],
      objetivo: ["", Validators.required],
      sexo: ["", Validators.required],
    })
  }

  ngOnInit() {
    this.usuario = localStorage.getItem("usuario")
    this.getUsuario()
    const token = localStorage.getItem("token")
    if (token) {
      this.verificarAutenticacionGoogleFit(token)
    }
  }

  verificarAutenticacionGoogleFit(token: string) {
    this.googleService.getGoogleFitData(token).subscribe(
      (response) => {
        if (response) {
          this.googleFitAutenticado = true
          this.googleFitData = response
          this.procesarDatosGoogleFit(response)
        }
      },
      (error) => {
        console.error("Error al verificar autenticación con Google Fit:", error)
        this.googleFitAutenticado = false
      },
    )
  }

  procesarDatosGoogleFit(data: any) {
    // Procesar los datos recibidos de Google Fit para mostrarlos en la interfaz
    this.googleFitDataItems = []

    // Ejemplo de cómo podrías procesar los datos (ajustar según la estructura real de los datos)
    if (data.steps) {
      this.googleFitDataItems.push({ label: "Pasos diarios", value: data.steps + " pasos" })
    }
    if (data.calories) {
      this.googleFitDataItems.push({ label: "Calorías quemadas", value: data.calories + " kcal" })
    }
    if (data.distance) {
      this.googleFitDataItems.push({ label: "Distancia recorrida", value: data.distance + " km" })
    }
    if (data.active_minutes) {
      this.googleFitDataItems.push({ label: "Minutos activos", value: data.active_minutes + " min" })
    }

    // Si no hay datos específicos, mostrar un mensaje genérico
    if (this.googleFitDataItems.length === 0) {
      this.googleFitDataItems.push({ label: "Estado", value: "Conectado con Google Fit" })
    }
  }

  getUsuario() {
    this.authService.getUsuario(this.usuario).subscribe(
      (response) => {
        this.nombre = response.username
        this.email = response.email
        this.altura = response.altura
        this.peso = response.peso
        this.nivel_actividad = response.nivel_actividad
        this.edad = response.edad
        this.objetivo = response.objetivo
        this.sexo = response.sexo

        this.formularioEdicion.patchValue({
          nombre: this.nombre,
          email: this.email,
          altura: this.altura,
          peso: this.peso,
          nivel_actividad: this.nivel_actividad,
          edad: this.edad,
          objetivo: this.objetivo,
          sexo: this.sexo,
        })
      },
      (error) => {
        console.error("No se ha podido encontrar el usuario: ", error)
      },
    )
  }

  abrirModalEdicion() {
    this.mostrarModal = true
  }

  cerrarModal() {
    this.mostrarModal = false
  }

  guardarCambios() {
    if (this.formularioEdicion.valid) {
      const datosActualizados = this.formularioEdicion.value
      this.authService.editarUsuario(this.usuario, datosActualizados.nombre, datosActualizados.email,datosActualizados.altura, datosActualizados.nivel_actividad, datosActualizados.sexo, datosActualizados.peso, datosActualizados.objetivo, datosActualizados.edad).subscribe(
        (response) => {
          console.log("Usuario actualizado correctamente: ", response)
        },
        (error) => {
          console.error("Error al actualizar el usuario: ", error)
        }
      )
      console.log("Datos actualizados:", datosActualizados)
      this.cerrarModal()
      // Actualizar los datos mostrados en el perfil
      Object.assign(this, datosActualizados)
    }
  }

  autenticarConGoogleFit(): void {
    const state = Math.random().toString(36).substring(7); // Generar un state aleatorio
    const authUrl: string = `http://localhost:5000/api/google/google_fit_auth?state=${state}`;
    const nuevaPestana: Window | null = window.open(authUrl, '_blank'); // Abre en una nueva pestaña

    if (!nuevaPestana) {
        console.error("No se pudo abrir la nueva pestaña. Revisa la configuración del navegador.");
        return;
    }

    const mensajeAutenticacion = (event: MessageEvent) => {
        if (event.data === "google_auth_success") {
            console.log("Autenticación completada. Recargando la página...");
            window.location.reload(); // Recargar la pestaña actual
        }
    };

    window.addEventListener("message", mensajeAutenticacion, { once: true }); // Se ejecuta solo una vez
}



  
  obtenerDatosGoogleFit() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No se encontró el token en localStorage.");
      return;
    }
  
    this.googleService.getGoogleFitData(token).subscribe(
      (response) => {
        console.log("Datos de Google Fit:", response);
      },
      (error) => {
        console.error("Error al obtener datos de Google Fit:", error);
      }
    );
  }

}


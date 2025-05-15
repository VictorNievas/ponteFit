import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-registro',
    templateUrl: './registro.component.html',
    styleUrl: './registro.component.css',
    standalone: false
})
export class RegistroComponent {
  registroForm: FormGroup;

  constructor(private fb: FormBuilder, private usuarioService: AuthService) {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      edad: ['', [Validators.required, Validators.min(1)]],
      peso_inicial: ['', Validators.required],
      altura: ['', Validators.required],
      objetivo: ['mantener', Validators.required],
      nivel_actividad: ['sedentario', Validators.required],
      sexo: ['hombre', Validators.required],
    });
  }

  registrarUsuario() {
    if (this.registroForm.valid) {
      console.log(this.registroForm.value)
      this.usuarioService
        .register(this.registroForm.value)
        .subscribe(
          (response) => {
            Swal.fire({
              title: 'Registro completado',
              text: 'Has sido registrado en PonteFit',
              icon: 'success',
              confirmButtonText: 'Ok'
            }).then((result) => {
              if(result.isConfirmed){
                this.registroForm.reset()
              }
            })
          },
          (error) => {
            alert('Hubo un error al registrar el usuario');
            console.error(error);
          }
        );
    }
  }
}

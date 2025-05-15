import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  login(): void {
    this.authService
      .login({ username: this.username, password: this.password })
      .subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          console.log(response);
          localStorage.setItem('usuario', response.user_id);
          this.router.navigate(['/home'])
        },
        error: (error) => {
          alert('Error al iniciar sesión');
          console.error(error);
        },
      });
  }
  register():void{
    this.router.navigate(['/registro'])
  }
}

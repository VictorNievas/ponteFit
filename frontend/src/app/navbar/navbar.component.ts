import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css',
    standalone: false
})
export class NavbarComponent {
    constructor(private authService: AuthService) {}
    usuario: any = null;
    id_usuario: number | null = null;
    mobileMenuOpen = false;
    mobileSesionesOpen = false;

    ngOnInit() {
        this.id_usuario = Number(localStorage.getItem('usuario'));
        this.usuario = this.authService.getUsuario(this.id_usuario).subscribe(
            (response) => {
                this.usuario = response;
            },
            (error) => {
                console.error(error);
            }
        );
    }

    toggleMobileMenu(): void {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    toggleMobileSesionesMenu(): void {
        this.mobileSesionesOpen = !this.mobileSesionesOpen;
    }

    logout(event: Event): void {
        event.preventDefault(); // Evita la redirección inmediata
    
        // Eliminar todas las cookies
        document.cookie.split(";").forEach(cookie => {
            document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/");
        });
    
        // Limpiar LocalStorage y SessionStorage
        localStorage.clear();
        sessionStorage.clear();
    
        // Redirigir manualmente al login
        window.location.href = "/login";
    }

}

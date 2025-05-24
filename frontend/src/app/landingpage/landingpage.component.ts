import { Component } from '@angular/core';

@Component({
  selector: 'app-landingpage',
  standalone: false,
  
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.css'
})
export class LandingpageComponent {
  title = "PonteFit"

  // Método para scroll suave a secciones
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Métodos para navegación
  navigateToLogin() {
    // Implementar navegación al login
    console.log("Navegando al login")
  }

  navigateToRegister() {
    // Implementar navegación al registro
    console.log("Navegando al registro")
  }
}

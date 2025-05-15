import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList, HostListener, Renderer2 } from '@angular/core';

interface Section {
  id: string;
  active: boolean;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    standalone: false
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChildren('textBox') textBoxes!: QueryList<ElementRef>;
  
  sections: Section[] = [
    { id: 'arriba', active: false },
    { id: 'der', active: false },
    { id: 'izq', active: false },
    { id: 'der2', active: false },
    { id: 'abajo', active: false }
  ];
  
  currentSection = 0;
  
  constructor(private renderer: Renderer2) {}
  
  ngOnInit(): void {
    // Activar la primera sección al iniciar
    this.sections[0].active = true;
  }
  
  ngAfterViewInit(): void {
    // Asegurarse de que los textos sean visibles
    setTimeout(() => {
      this.checkVisibility();
      
      // Forzar la visibilidad del primer texto
      const textElements = document.querySelectorAll('.text-box');
      if (textElements.length > 0) {
        this.renderer.setStyle(textElements[0], 'opacity', '1');
        this.renderer.setStyle(textElements[0], 'transform', 'translateY(0)');
      }
    }, 500);
  }
  
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    this.checkVisibility();
  }
  
  scrollToSection(event: Event, index: number): void {
    event.preventDefault();
    const element = document.getElementById(this.sections[index].id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.currentSection = index;
    }
  }
  
  private checkVisibility(): void {
    // Comprobar qué sección está visible
    const sectionElements = document.querySelectorAll('.fullscreen-section');
    sectionElements.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5) {
        this.currentSection = index;
      }
    });
    
    // Mostrar los textos cuando entran en el viewport
    const textElements = document.querySelectorAll('.text-box');
    textElements.forEach(element => {
      const rect = (element as HTMLElement).getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.75 && rect.bottom >= 0) {
        this.renderer.setStyle(element, 'opacity', '1');
        this.renderer.setStyle(element, 'transform', 'translateY(0)');
      }
    });
  }
}
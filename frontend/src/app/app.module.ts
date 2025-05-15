import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { RutinasComponent } from './rutinas/rutinas.component';
import { MiDietaComponent } from './mi-dieta/mi-dieta.component';
import { MisSesionesComponent } from './mis-sesiones/mis-sesiones.component';
import { MisEjerciciosComponent } from './mis-ejercicios/mis-ejercicios.component';
import { DescubrirComponent } from './descubrir/descubrir.component';
import { PerfilComponent } from './perfil/perfil.component';
import { HomeComponent } from './home/home.component';                     // ← pipes como date
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    NavbarComponent,
    RegistroComponent,
    MisEjerciciosComponent,
    MiDietaComponent,
    RutinasComponent,
    PerfilComponent,
    MisSesionesComponent,
    DescubrirComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

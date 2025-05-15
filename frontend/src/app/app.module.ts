import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import { RegistroComponent } from './registro/registro.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MisEjerciciosComponent } from './mis-ejercicios/mis-ejercicios.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MiDietaComponent } from './mi-dieta/mi-dieta.component';
import { RutinasComponent } from './rutinas/rutinas.component';
import { PerfilComponent } from './perfil/perfil.component';
import { MisSesionesComponent } from './mis-sesiones/mis-sesiones.component';
import { DescubrirComponent } from './descubrir/descubrir.component';

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
    NgbModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

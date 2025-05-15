import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { MisEjerciciosComponent } from './mis-ejercicios/mis-ejercicios.component';
import { MiDietaComponent } from './mi-dieta/mi-dieta.component';
import { RutinasComponent } from './rutinas/rutinas.component';
import { PerfilComponent } from './perfil/perfil.component';
import { MisSesionesComponent } from './mis-sesiones/mis-sesiones.component';
import {DescubrirComponent} from './descubrir/descubrir.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Ruta por defecto
  { path : 'home', component: HomeComponent },
  { path : 'login', component: LoginComponent },
  { path : 'registro', component: RegistroComponent},
  { path : 'mis_ejercicios', component: MisEjerciciosComponent},
  { path : 'mi_dieta', component: MiDietaComponent},
  { path : 'mis_rutinas', component: RutinasComponent},
  { path : 'mi_perfil', component: PerfilComponent},
  { path : 'mis_sesiones', component: MisSesionesComponent},
  { path : 'descubrir', component: DescubrirComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

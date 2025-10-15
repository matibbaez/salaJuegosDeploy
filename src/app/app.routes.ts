import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegistroComponent } from './components/registro/registro';
import { QuienSoyComponent } from './components/quien-soy/quien-soy';
import { AhorcadoComponent } from './components/ahorcado/ahorcado';
import { MayorMenorComponent } from './components/mayor-menor/mayor-menor';
import { PreguntadosComponent } from './components/preguntados/preguntados';
import { AdivinaBanderaComponent } from './components/adivina-bandera/adivina-bandera';
import { ResultadosComponent } from './components/resultados/resultados';
import { ChatComponent } from './components/chat/chat';
import { JuegosComponent } from './components/juegos/juegos';

import { EncuestaComponent } from './components/encuesta/encuesta';
import { ResultadosEncuestaComponent } from './components/resultados-encuesta/resultados-encuesta';

// importamos los guards
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin-guard';
import { noAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, data: { animation: 'homePage' } },

  // si NO está logueado
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'registro', component: RegistroComponent, canActivate: [noAuthGuard] },

  { path: 'quien-soy', component: QuienSoyComponent, data: { animation: 'quienSoyPage' } },

  // si está logueado
  { path: 'juegos', component: JuegosComponent, canActivate: [authGuard], data: { animation: 'juegosPage' } },
  { path: 'ahorcado', component: AhorcadoComponent, canActivate: [authGuard] },
  { path: 'mayor-menor', component: MayorMenorComponent, canActivate: [authGuard] },
  { path: 'preguntados', component: PreguntadosComponent, canActivate: [authGuard] },
  { path: 'adivina-bandera', component: AdivinaBanderaComponent, canActivate: [authGuard] },
  { path: 'resultados', component: ResultadosComponent, canActivate: [authGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [authGuard] },

  { 
    path: 'encuesta', 
    component: EncuestaComponent, 
    canActivate: [authGuard] 
  },

  { 
    path: 'resultados-encuesta', 
    component: ResultadosEncuestaComponent, 
    canActivate: [authGuard, adminGuard] 
  },

  { path: '**', redirectTo: 'home' }
];

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { animacionRutaDesvanecido } from './animaciones';
import { NavbarComponent } from './components/navbar/navbar'; // 👈 1. IMPORTÁ LA NAVBAR AQUÍ

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent // 👈 2. AÑADILA AL ARRAY DE IMPORTS
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  animations: [ animacionRutaDesvanecido ]
})
export class AppComponent {

  constructor(public authService: AuthService) {}

  logout() {
    this.authService.signOut();
  }

  prepararRuta(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
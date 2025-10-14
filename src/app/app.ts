import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router'; // 👈 Se añade RouterOutlet
import { AuthService } from './services/auth.service';
import { animacionRutaDesvanecido } from './animaciones'; // 👈 Se importa la animación

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
  ],
  templateUrl: './app.html', // Corregido a la convención de Angular
  styleUrls: ['./app.scss'], // Corregido a la convención de Angular
  animations: [ animacionRutaDesvanecido ] // 👈 Se declara la animación para usarla en el HTML
})
export class AppComponent {
  // Propiedades que ya tenías
  navbarCollapsed = true;

  constructor(public authService: AuthService) {}

  logout() {
    this.authService.signOut();
  }

  // 👇 Se añade la función para que el disparador de la animación funcione
  prepararRuta(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
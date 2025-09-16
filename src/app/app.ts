import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule], // 🔹 CommonModule para ngClass, RouterModule para router-outlet
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  navbarCollapsed = true;

  constructor(public authService: AuthService) {}

  logout() {
    this.authService.signOut();
  }
}

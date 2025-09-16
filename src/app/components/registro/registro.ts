import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.html',
})
export class RegistroComponent {
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  age: number | null = null;
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  async register() {
    try {
      await this.authService.signUp(
        this.email,
        this.password,
        this.firstName,
        this.lastName,
        this.age || 0
      );
      // iniciar sesión automáticamente
      await this.authService.signIn(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al registrarse';
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['../../styles/auth-forms.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    try {
      await this.authService.signIn(this.email, this.password);
      this.router.navigate(['/home']); 
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al iniciar sesión';
    }
  }

  // Login rápido para pruebas
  async quickLogin(user: 'user1' | 'user2' | 'user3') {
    const users = {
      user1: { email: 'user1@test.com', password: '123456' },
      user2: { email: 'user2@test.com', password: '123456' },
      user3: { email: 'user3@test.com', password: 'As123456' },
    };
    this.email = users[user].email;
    this.password = users[user].password;
    await this.login();
  }
}


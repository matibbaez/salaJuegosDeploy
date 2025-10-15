import { Component, OnInit, signal } from '@angular/core'; // Se añade OnInit y signal
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service'; // 👈 Se importa SupabaseService

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit { // 👈 Se implementa OnInit
  
  esAdmin = signal(false); // 👈 Señal para guardar si el usuario es admin

  constructor(
    public authService: AuthService,
    private supabaseService: SupabaseService // 👈 Se inyecta SupabaseService
  ) {}

  ngOnInit(): void {
    // Escuchamos los cambios en el estado del usuario (login/logout)
    this.authService.user$.subscribe(user => {
      if (user) {
        // Si hay un usuario, verificamos su perfil
        this.verificarAdminStatus(user.id);
      } else {
        // Si no hay usuario (logout), reseteamos el estado de admin
        this.esAdmin.set(false);
      }
    });
  }

  async verificarAdminStatus(userId: string) {
    try {
      const perfil = await this.supabaseService.obtenerPerfilUsuario(userId);
      this.esAdmin.set(perfil?.es_admin || false);
    } catch (error) {
      console.error('Error al verificar perfil de admin:', error);
      this.esAdmin.set(false);
    }
  }

  logout() {
    this.authService.signOut();
  }
}
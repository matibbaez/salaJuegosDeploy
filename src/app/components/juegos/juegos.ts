import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-juegos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './juegos.html',
  styleUrls: ['./juegos.scss']
})
export class JuegosComponent implements OnInit {
  esAdmin = signal<boolean>(false);
  usuarioLogueado: User | null = null;

  constructor(
    private servicioAuth: AuthService, 
    private servicioSupabase: SupabaseService
  ) {}

  ngOnInit(): void {
    // obtenemos el usuario actual
    this.usuarioLogueado = this.servicioAuth.getCurrentUser();
    
    if (this.usuarioLogueado) {
      this.verificarSiEsAdmin(this.usuarioLogueado.id);
    }
  }

  private async verificarSiEsAdmin(idUsuario: string): Promise<void> {
    try {
      const perfil = await this.servicioSupabase.obtenerPerfilUsuario(idUsuario);
      this.esAdmin.set(perfil?.es_admin || false); 
    } catch (error) {
      console.error('Error al verificar el perfil de administrador', error);
      this.esAdmin.set(false); 
    }
  }
}
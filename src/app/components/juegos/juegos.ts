// src/app/components/juegos/juegos.component.ts
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
  // Señal para saber si el usuario es admin
  esAdmin = signal<boolean>(false);
  // Variable para guardar los datos del usuario logueado
  usuarioLogueado: User | null = null;

  // Inyectamos los servicios que necesitamos
  constructor(
    private servicioAuth: AuthService, 
    private servicioSupabase: SupabaseService
  ) {}

  ngOnInit(): void {
    // Obtenemos el usuario actual
    this.usuarioLogueado = this.servicioAuth.getCurrentUser();
    
    // Si hay un usuario, verificamos si es administrador
    if (this.usuarioLogueado) {
      this.verificarSiEsAdmin(this.usuarioLogueado.id);
    }
  }

  private async verificarSiEsAdmin(idUsuario: string): Promise<void> {
    try {
      const perfil = await this.servicioSupabase.obtenerPerfilUsuario(idUsuario);
      // Actualizamos la señal con el resultado
      this.esAdmin.set(perfil?.es_admin || false); 
    } catch (error) {
      console.error('Error al verificar el perfil de administrador', error);
      this.esAdmin.set(false); // Por seguridad, si hay error no es admin
    }
  }
}